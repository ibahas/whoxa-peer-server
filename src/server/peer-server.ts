import { ExpressPeerServer } from 'peer';
import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { getPeerServerConfig, validateConfig, getServerUrl } from './config';

let peerServerInstance: any = null;
let httpServer: http.Server | https.Server | null = null;

/**
 * Initialize and start PeerJS Server
 */
export function startPeerServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const config = getPeerServerConfig();
      validateConfig(config);

      // Create Express app
      const app = express();

      // CORS middleware
      if (config.corsOptions) {
        app.use(cors(config.corsOptions));
      }

      // Health check endpoint
      app.get('/health', (req, res) => {
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          config: {
            port: config.port,
            path: config.path,
            secure: config.secure,
          },
        });
      });

      // Create HTTP or HTTPS server
      if (config.secure && config.sslKey && config.sslCert) {
        try {
          const key = fs.readFileSync(config.sslKey, 'utf8');
          const cert = fs.readFileSync(config.sslCert, 'utf8');
          httpServer = https.createServer({ key, cert }, app);
          console.log('🔒 HTTPS server created');
        } catch (error) {
          console.error('❌ Failed to load SSL certificates:', error);
          throw new Error('SSL certificates not found');
        }
      } else {
        httpServer = http.createServer(app);
        console.log('🔓 HTTP server created');
      }

      // Create PeerJS server
      peerServerInstance = ExpressPeerServer(httpServer, {
        path: config.path,
        allow_discovery: true,
        proxied: false,
      });

      // Mount PeerJS server
      app.use(config.path, peerServerInstance);

      // Error handling
      peerServerInstance.on('connection', (client: any) => {
        console.log(`✅ Peer connected: ${client.getId()}`);
      });

      peerServerInstance.on('disconnect', (client: any) => {
        console.log(`❌ Peer disconnected: ${client.getId()}`);
      });

      // Start server
      httpServer.listen(config.port, () => {
        const serverUrl = getServerUrl(config);
        console.log(`🚀 PeerJS Server started`);
        console.log(`📍 Server URL: ${serverUrl}`);
        console.log(`🔌 Port: ${config.port}`);
        console.log(`🛣️  Path: ${config.path}`);
        console.log(`🔐 Secure: ${config.secure}`);
        resolve();
      });

      httpServer.on('error', (error: Error) => {
        console.error('❌ Server error:', error);
        reject(error);
      });
    } catch (error) {
      console.error('❌ Failed to start PeerJS Server:', error);
      reject(error);
    }
  });
}

/**
 * Stop PeerJS Server
 */
export function stopPeerServer(): Promise<void> {
  return new Promise((resolve) => {
    if (httpServer) {
      httpServer.close(() => {
        console.log('🛑 PeerJS Server stopped');
        peerServerInstance = null;
        httpServer = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Get PeerJS server instance
 */
export function getPeerServerInstance() {
  return peerServerInstance;
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await stopPeerServer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await stopPeerServer();
  process.exit(0);
});
