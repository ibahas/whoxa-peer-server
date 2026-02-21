/**
 * Production signaling server: Express + Socket.io + PeerJS
 * Single HTTP server, Render-compatible, ESM.
 */

import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { createRequire } from 'module';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { config } from './config.js';

const require = createRequire(import.meta.url);
const { ExpressPeerServer } = require('peer');

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();

app.use(cors({
  origin: config.corsOrigin === '*' ? '*' : config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health check (for Render and load balancers)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'signaling-server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    peerPath: config.peerPath,
    socketPath: config.socketPath,
  });
});

// ---------------------------------------------------------------------------
// Single HTTP server instance (route /socket to Socket.IO, rest to Express)
// ---------------------------------------------------------------------------

const httpServer = createServer((req, res) => {
  const pathname = parseUrl(req.url, true).pathname || '';
  if (pathname.startsWith(config.socketPath)) return; // Socket.IO handles this
  app(req, res);
});

// ---------------------------------------------------------------------------
// PeerJS (WebRTC signaling) on /peerjs
// ---------------------------------------------------------------------------

const peerServer = ExpressPeerServer(httpServer, {
  path: config.peerPath,
  allow_discovery: true,
  proxied: config.peerProxied, // required behind Render reverse proxy
  key: config.peerKey,
});

app.use(config.peerPath, peerServer);

peerServer.on('connection', (client) => {
  console.log('[PeerJS] peer connected:', client.getId());
});

peerServer.on('disconnect', (client) => {
  console.log('[PeerJS] peer disconnected:', client.getId());
});

// ---------------------------------------------------------------------------
// Socket.IO (room / app signaling) – WebSocket transport only
// ---------------------------------------------------------------------------

const io = new Server(httpServer, {
  path: config.socketPath,
  transports: ['websocket'], // WebSocket only
  cors: {
    origin: config.corsOrigin === '*' ? '*' : config.corsOrigins,
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// Optional: Redis adapter for horizontal scaling (attach before listening)
async function attachRedisAdapter() {
  if (!config.useRedis || !config.redisUrl) return;
  try {
    const { createAdapter } = await import('@socket.io/redis-adapter');
    const { createClient } = await import('redis');
    const pub = createClient({ url: config.redisUrl });
    const sub = pub.duplicate();
    await Promise.all([pub.connect(), sub.connect()]);
    io.adapter(createAdapter(pub, sub));
    console.log('[Socket.IO] Redis adapter attached');
  } catch (err) {
    console.warn('[Socket.IO] Redis adapter failed, using in-memory:', err.message);
  }
}

// In-memory: roomId -> Set of socket ids (for user-joined / user-left when not using Redis)
const roomMembers = new Map();

io.on('connection', (socket) => {
  console.log('[Socket.IO] client connected:', socket.id);

  socket.on('join-room', (payload, ack) => {
    const roomId = typeof payload === 'string' ? payload : (payload?.roomId ?? payload?.room);
    if (!roomId) {
      const err = new Error('roomId required');
      if (typeof ack === 'function') ack({ error: err.message });
      return;
    }
    socket.join(roomId);
    if (!roomMembers.has(roomId)) roomMembers.set(roomId, new Set());
    roomMembers.get(roomId).add(socket.id);
    socket.data.roomId = roomId;
    socket.to(roomId).emit('user-joined', { socketId: socket.id, roomId });
    if (typeof ack === 'function') ack({ success: true, roomId });
  });

  socket.on('disconnect', (reason) => {
    const roomId = socket.data?.roomId;
    if (roomId && roomMembers.has(roomId)) {
      roomMembers.get(roomId).delete(socket.id);
      socket.to(roomId).emit('user-left', { socketId: socket.id, roomId });
    }
    console.log('[Socket.IO] client disconnected:', socket.id, reason);
  });

  socket.on('error', (err) => {
    console.error('[Socket.IO] socket error:', socket.id, err);
  });
});

io.engine.on('connection_error', (err) => {
  console.error('[Socket.IO] connection_error:', err.message);
});

// ---------------------------------------------------------------------------
// Start server (async to allow Redis adapter)
// ---------------------------------------------------------------------------

const PORT = config.port;

async function start() {
  await attachRedisAdapter();
  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`  PeerJS path: ${config.peerPath} (proxied: ${config.peerProxied})`);
    console.log(`  Socket.IO path: ${config.socketPath} (transports: websocket only)`);
    console.log(`  Health: http://localhost:${PORT}/health`);
  });
}

start().catch((err) => {
  console.error('Start failed:', err);
  process.exit(1);
});

httpServer.on('error', (err) => {
  console.error('HTTP server error:', err);
  process.exitCode = 1;
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exitCode = 1;
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at', promise, 'reason:', reason);
});
