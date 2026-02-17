# Whoxa PeerJS Server

PeerJS Server implementation using Next.js for WebRTC signaling in the Whoxa application.

## 🚀 Quick Start for Vercel Deployment

**Important:** Vercel Serverless Functions cannot maintain persistent WebSocket connections required by PeerJS Server.

### ✅ Recommended: Use PeerJS Cloud (Free, No Server Needed)

The easiest solution is to use **PeerJS Cloud** - a free hosted PeerJS server. Your Flutter client can connect directly to `peerjs.com` without deploying any server.

**See [PEERJS_CLOUD_SETUP.md](./PEERJS_CLOUD_SETUP.md) for complete Flutter client configuration.**

Benefits:
- ✅ Free and always available
- ✅ No server deployment needed
- ✅ Works perfectly with Vercel
- ✅ Secure HTTPS/WSS connections

### Alternative: Deploy Custom Server

If you need custom server configuration, deploy `server.js` to:
- **Railway**: https://railway.app (supports WebSockets)
- **Render**: https://render.com (supports WebSockets)

## Overview

This repository provides WebRTC signaling capabilities using PeerJS Server. For Vercel deployments, we recommend using PeerJS Cloud (see above). For custom deployments, this server enables peer-to-peer connections for voice and video calls in the Whoxa Flutter app.

## Features

- ✅ PeerJS Server integration
- ✅ HTTP and HTTPS support
- ✅ CORS configuration
- ✅ Health check endpoint
- ✅ Environment-based configuration
- ✅ Graceful shutdown handling
- ✅ WebSocket support

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

1. Install dependencies:
```bash
npm install
```

## Configuration

### Environment Variables

Create `.env.local` for local development or `.env.production` for production:

```env
PEERJS_PORT=4001              # Server port (default: 4001)
PEERJS_PATH=/                 # API path (default: /)
PEERJS_SECURE=false           # Enable HTTPS (default: false)
PEERJS_HOST=localhost         # Server hostname
ALLOWED_ORIGINS=*             # CORS allowed origins (comma-separated)
NODE_ENV=development          # Environment mode

# SSL Configuration (for HTTPS)
PEERJS_SSL_KEY=/path/to/key.pem
PEERJS_SSL_CERT=/path/to/cert.pem
```

## Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:4001` (or the port specified in `.env.local`).

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

### Custom Server

The project uses a custom server (`server.js`) that runs both Next.js and PeerJS Server together. This allows WebSocket support for PeerJS while maintaining Next.js functionality.

## Endpoints

### Health Check
- **GET** `/health`
- Returns server status and configuration

### PeerJS API
- **GET/POST** `/api/peerjs`
- PeerJS server endpoint for WebRTC signaling

## Integration with Flutter App

The Flutter app connects to this server using the PeerJS client library. Update the following files:

1. `lib/core/config/peer_server_config.dart` - Server configuration
2. `lib/featuers/call/web_rtc_service.dart` - WebRTC service
3. `lib/featuers/call/simple_mesh_call_controller.dart` - Mesh call controller

## SSL/TLS Setup (Production)

For production deployment with HTTPS:

1. Obtain SSL certificates (Let's Encrypt, etc.)
2. Update `.env.production`:
   ```env
   PEERJS_SECURE=true
   PEERJS_SSL_KEY=/path/to/privkey.pem
   PEERJS_SSL_CERT=/path/to/fullchain.pem
   ```

3. Ensure the certificate paths are accessible to the Node.js process

## Deployment

### Using Vercel (Recommended for Serverless)

See [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) for detailed instructions.

Quick deploy:
```bash
npm install -g vercel
vercel login
cd peer_server
vercel --prod
```

**Note:** WebSocket support requires Vercel Pro plan. For free tier, consider alternative hosting options.

### Using PM2 (Recommended for VPS/Dedicated Server)

```bash
npm install -g pm2
pm2 start npm --name "peer-server" -- start
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4001
CMD ["npm", "start"]
```

### Using Vercel

#### Prerequisites

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

#### Deployment Steps

1. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings → Environment Variables
   - Add the following variables:
     - `PEERJS_PORT`: `4001` (or your preferred port)
     - `PEERJS_PATH`: `/`
     - `PEERJS_SECURE`: `true` (for HTTPS)
     - `PEERJS_HOST`: Your Vercel domain (auto-set by Vercel)
     - `ALLOWED_ORIGINS`: Your app domains (comma-separated)
     - `NODE_ENV`: `production`

2. **Deploy:**
```bash
vercel
```

Or for production:
```bash
vercel --prod
```

3. **Important Notes for Vercel:**
   - Vercel automatically provides HTTPS, so set `PEERJS_SECURE=true`
   - The `VERCEL_URL` environment variable is automatically set by Vercel
   - WebSocket support works on Vercel Pro plan or higher
   - For free tier, consider using a different hosting solution for WebSocket support

#### Alternative: Using Vercel Serverless Functions

If you need serverless deployment, you can use the `api/index.js` file, but note that WebSocket support is limited in serverless functions. For full WebSocket support, use the custom server approach (`server.js`).

## Troubleshooting

### Port Already in Use

If port 4001 is already in use, change `PEERJS_PORT` in your `.env` file.

### SSL Certificate Errors

- Ensure SSL certificate paths are correct
- Check file permissions (readable by Node.js process)
- Verify certificate validity

### CORS Issues

Update `ALLOWED_ORIGINS` in your `.env` file to include your Flutter app's origin.

### WebSocket Connection Failed

- Check firewall settings
- Verify the server is accessible from your network
- Ensure WebSocket support is enabled

## Monitoring

The server logs connection events:
- ✅ Peer connected
- ❌ Peer disconnected
- 🔒 HTTPS server created
- 🔓 HTTP server created

## Security Considerations

1. **CORS**: Configure `ALLOWED_ORIGINS` to restrict access
2. **SSL/TLS**: Always use HTTPS in production
3. **Rate Limiting**: Consider adding rate limiting for production
4. **Authentication**: Future enhancement - add authentication middleware

## License

Private - Whoxa Application

## Support

For issues or questions, contact the development team.
