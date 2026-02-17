/**
 * Vercel API Route for PeerJS Server
 * This handles the PeerJS server initialization on Vercel
 */

const { ExpressPeerServer } = require('peer');
const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
app.use(cors({
  origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map(o => o.trim()),
  credentials: true,
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'vercel',
    uptime: process.uptime(),
  });
});

// Export for Vercel
module.exports = app;
