/**
 * Central configuration from environment.
 * Render sets PORT; use defaults for local dev.
 */

const getEnv = (key, defaultValue = '') => String(process.env[key] ?? defaultValue).trim();

export const config = Object.freeze({
  port: Number(getEnv('PORT', '4000')),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  isProduction: getEnv('NODE_ENV') === 'production',

  // CORS: comma-separated origins or '*' for all
  corsOrigin: getEnv('ALLOWED_ORIGINS', '*'),
  corsOrigins: getEnv('ALLOWED_ORIGINS', '*').split(',').map(o => o.trim()).filter(Boolean),

  // PeerJS
  peerPath: getEnv('PEERJS_PATH', '/peerjs'),
  peerProxied: getEnv('PEERJS_PROXIED', 'true').toLowerCase() === 'true',
  peerKey: getEnv('PEERJS_KEY', 'peerjs'),

  // Socket.IO
  socketPath: getEnv('SOCKET_IO_PATH', '/socket'),

  // Redis (optional, for horizontal scaling)
  redisUrl: getEnv('REDIS_URL', ''),
  useRedis: Boolean(getEnv('REDIS_URL')),
});

export default config;
