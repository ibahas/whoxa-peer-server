import { PeerServerConfig } from '@/types';

/**
 * PeerServer Configuration
 * Reads from environment variables with sensible defaults
 */
export function getPeerServerConfig(): PeerServerConfig {
  const port = parseInt(process.env.PEERJS_PORT || '4001', 10);
  const path = process.env.PEERJS_PATH || '/';
  const secure = process.env.PEERJS_SECURE === 'true' || process.env.NODE_ENV === 'production';
  
  // SSL certificates (for HTTPS)
  const sslKey = process.env.PEERJS_SSL_KEY;
  const sslCert = process.env.PEERJS_SSL_CERT;
  
  // CORS configuration
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '*';
  const allowedOrigins = allowedOriginsEnv === '*' 
    ? ['*'] 
    : allowedOriginsEnv.split(',').map(origin => origin.trim());

  return {
    port,
    path,
    secure,
    sslKey,
    sslCert,
    allowedOrigins,
    corsOptions: {
      origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
      credentials: true,
    },
  };
}

/**
 * Get server URL based on configuration
 */
export function getServerUrl(config: PeerServerConfig): string {
  const protocol = config.secure ? 'https' : 'http';
  const host = process.env.PEERJS_HOST || 'localhost';
  return `${protocol}://${host}:${config.port}${config.path}`;
}

/**
 * Validate configuration
 */
export function validateConfig(config: PeerServerConfig): void {
  if (config.secure && (!config.sslKey || !config.sslCert)) {
    throw new Error('SSL key and certificate are required when secure mode is enabled');
  }
  
  if (config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid port: ${config.port}. Must be between 1 and 65535`);
  }
}
