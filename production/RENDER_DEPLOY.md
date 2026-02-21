# Render deployment (production server)

## 1. Create a Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. **New +** → **Web Service**.
3. Connect the repo that contains this `production` folder (or the repo root if you deploy from root).

## 2. Root directory

- If your repo root is the **parent** of `production/`, set **Root Directory** to `production` (so Render’s root is this folder with `package.json` and `server.js`).
- If you copy these files to the repo root, leave Root Directory empty.

## 3. Build and start

| Field | Value |
|--------|--------|
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` or `node server.js` |

No build step (no Next.js/TypeScript build). Just install and run.

## 4. Environment variables

| Variable | Required | Example / notes |
|----------|----------|-------------------|
| `PORT` | Set by Render | Do not set manually. |
| `NODE_ENV` | Optional | `production` (Render often sets it.) |
| `ALLOWED_ORIGINS` | Recommended | `https://yourapp.com` or `*` for dev. |
| `PEERJS_PATH` | Optional | Default ` /peerjs`. |
| `PEERJS_PROXIED` | Optional | `true` (default). Keep `true` behind Render. |
| `SOCKET_IO_PATH` | Optional | Default ` /socket`. |
| `REDIS_URL` | Optional | Redis URL if using Redis adapter for scaling. |

## 5. Health check

- Render can use the **Health Check Path**: `/health`.
- The app responds with JSON: `{ "status": "ok", ... }`.

## 6. After deploy

- Base URL: `https://<your-service-name>.onrender.com`.
- **PeerJS:** `https://<your-service-name>.onrender.com/peerjs` (path `/peerjs`).
- **Socket.IO:** same host, path `/socket`, transports WebSocket only.
- **Health:** `https://<your-service-name>.onrender.com/health`.

## 7. Client configuration

**Socket.IO (e.g. Flutter / web):**

- URL: `https://<your-service-name>.onrender.com` (no path in the base URL).
- Path: `/socket`.
- Transports: `['websocket']`.

**PeerJS:**

- Host: `<your-service-name>.onrender.com`
- Port: `443`
- Secure: `true`
- Path: `/peerjs`

## 8. Free tier notes

- Service may spin down after inactivity; first request can be slow (cold start).
- Keep `PEERJS_PROXIED` set to `true` so PeerJS works behind Render’s proxy.
