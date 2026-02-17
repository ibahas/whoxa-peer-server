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

  // Create HTTP or HTTPS server
  const server = sslOptions
    ? require('https').createServer(sslOptions, peerApp)
    : require('http').createServer(peerApp);

  // Create PeerJS server
  const peerServer = ExpressPeerServer(server, {
    path: peerPath,
    allow_discovery: true,
    proxied: false,
  });

  // Mount PeerJS server
  peerApp.use(peerPath, peerServer);

  // PeerJS event handlers
  peerServer.on('connection', (client) => {
    console.log(`✅ Peer connected: ${client.getId()}`);
  });

  peerServer.on('disconnect', (client) => {
    console.log(`❌ Peer disconnected: ${client.getId()}`);
  });

  // Handle Next.js requests
  server.on('request', (req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Route PeerJS requests to PeerJS server
    if (parsedUrl.pathname?.startsWith(peerPath)) {
      peerApp(req, res);
    } else {
      // Route other requests to Next.js
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
    console.log(`🛣️  Path: ${peerPath}`);
    console.log(`🔐 Secure: ${secure}`);
    console.log(`🌐 Next.js running on port ${nextPort}`);
    if (process.env.VERCEL) {
      console.log(`☁️  Running on Vercel`);
    }
  });
});
