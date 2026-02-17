# Quick Start Guide

## Installation

```bash
cd peer_server
npm install
```

## Development

1. Copy `.env.local` and update if needed:
```bash
cp .env.local .env.local
```

2. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:4001`

## Production

1. Update `.env.production` with your production settings:
   - Set `PEERJS_HOST` to your domain
   - Set `PEERJS_SECURE=true`
   - Add SSL certificate paths
   - Update `ALLOWED_ORIGINS`

2. Build and start:
```bash
npm run build
npm start
```

## Testing Connection

Visit `http://localhost:4001/health` to check if the server is running.

## Flutter App Integration

The Flutter app is already configured to use this server. By default, it will connect to `localhost:4001` in development mode.

To use a remote server, update `lib/core/config/peer_server_config.dart` or set environment variables when building the Flutter app.
