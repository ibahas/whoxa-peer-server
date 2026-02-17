/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better server deployment
  output: 'standalone',
  
  // WebSocket support
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Enable WebSocket support on server
      config.externals = [...(config.externals || []), 'ws'];
    }
    return config;
  },

  // Environment variables
  env: {
    PEERJS_PORT: process.env.PEERJS_PORT || '4001',
    PEERJS_PATH: process.env.PEERJS_PATH || '/',
    PEERJS_SECURE: process.env.PEERJS_SECURE || 'false',
    PEERJS_HOST: process.env.PEERJS_HOST || 'localhost',
  },

  // Headers for CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
