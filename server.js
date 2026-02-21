/**
 * Custom Next.js Server with PeerJS Server Integration
 * This file runs the PeerJS server alongside Next.js
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { ExpressPeerServer } = require('peer');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.PEERJS_HOST || process.env.VERCEL_URL?.split('://')[1] || 'localhost';
const port = process.env.PORT || parseInt(process.env.PEERJS_PORT || '4001', 10);
const nextPort = process.env.PORT || parseInt(process.env.NEXT_PORT || '3000', 10);
const app = next({ dev, hostname, port: nextPort });
const handle = app.getRequestHandler();

// PeerJS Server configuration
const peerPath = process.env.PEERJS_PATH || '/';
const secure = process.env.PEERJS_SECURE === 'true' || process.env.NODE_ENV === 'production';

// SSL configuration
let sslOptions = null;
if (secure) {
  const sslKey = process.env.PEERJS_SSL_KEY;
  const sslCert = process.env.PEERJS_SSL_CERT;
  
  if (sslKey && sslCert) {
    try {
      sslOptions = {
        key: fs.readFileSync(sslKey, 'utf8'),
        cert: fs.readFileSync(sslCert, 'utf8'),
      };
      console.log('🔒 SSL certificates loaded');
    } catch (error) {
      console.error('❌ Failed to load SSL certificates:', error);
      process.exit(1);
    }
  }
}

app.prepare().then(() => {
  // Create Express app for PeerJS
  const peerApp = express();
  
  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
  peerApp.use(cors({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map(o => o.trim()),
    credentials: true,
  }));

  // Health check endpoint
  peerApp.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      config: {
        port: port,
        path: peerPath,
        secure: secure,
      },
    });
  });

  // Create HTTP or HTTPS server (no default handler - we route manually)
  const server = sslOptions
    ? require('https').createServer(sslOptions)
    : require('http').createServer();

  // Socket.IO on path /socket (for Flutter socket_io_client)
  const socketIoPath = process.env.SOCKET_IO_PATH || '/socket';
  const io = require('socket.io')(server, {
    path: socketIoPath,
    transports: ['polling', 'websocket'], // polling first helps behind Render proxy, then upgrade to ws
    cors: { origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map(o => o.trim()) },
    allowEIO3: true,
  });
  io.on('connection', (socket) => {
    console.log(`🔌 Socket.IO client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Socket.IO client disconnected: ${socket.id}`);
    });
  });

  // Create PeerJS server
  const peerServer = ExpressPeerServer(server, {
    path: peerPath,
    allow_discovery: true,
    proxied: false,
  });

  // Mount PeerJS server on Express app
  peerApp.use(peerPath, peerServer);

  // PeerJS event handlers
  peerServer.on('connection', (client) => {
    console.log(`✅ Peer connected: ${client.getId()}`);
  });

  peerServer.on('disconnect', (client) => {
    console.log(`❌ Peer disconnected: ${client.getId()}`);
  });

  // Single request handler: /socket → Socket.IO; other → Express or Next.js
  server.on('request', (req, res) => {
    const parsedUrl = parse(req.url, true);
    if (parsedUrl.pathname?.startsWith(socketIoPath)) {
      return; // Socket.IO handles this path
    }
    if (parsedUrl.pathname?.startsWith(peerPath)) {
      peerApp(req, res);
    } else {
      handle(req, res, parsedUrl);
    }
  });

  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    const protocol = secure ? 'https' : 'http';
    const serverUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `${protocol}://${hostname}:${port}`;
    console.log(`🚀 PeerJS Server started`);
    console.log(`📍 Server URL: ${serverUrl}`);
    console.log(`🔌 Port: ${port}`);
    console.log(`🛣️  PeerJS path: ${peerPath}`);
    console.log(`🔌 Socket.IO path: ${socketIoPath}`);
    console.log(`🔐 Secure: ${secure}`);
    console.log(`🌐 Next.js on same port`);
    if (process.env.VERCEL) {
      console.log(`☁️  Running on Vercel`);
    }
  });
});
