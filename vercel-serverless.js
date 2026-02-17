/**
 * Vercel Serverless Function for PeerJS Server
 * This is an alternative approach for Vercel deployment
 */

const { ExpressPeerServer } = require('peer');
const express = require('express');
const cors = require('cors');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  if (req.url === '/health') {
    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      platform: 'vercel',
    });
  }

  // Note: Vercel Serverless Functions have limitations with WebSocket
  // For full WebSocket support, use the custom server approach
  return res.json({
    message: 'PeerJS Server on Vercel',
    note: 'WebSocket support requires custom server configuration',
  });
};
