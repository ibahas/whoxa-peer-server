# Production signaling server

Express + Socket.IO + PeerJS on a **single HTTP server**, ESM, Render-ready.

## Quick start

```bash
cd production
npm install
npm start
```

- Health: http://localhost:4000/health  
- PeerJS: http://localhost:4000/peerjs  
- Socket.IO: path `/socket`, transports polling then websocket (Render-friendly)  

## Scripts

- `npm start` – run server (uses `PORT` or 4000).
- `npm run dev` – run with `--watch` (Node 18+).
- `npm run start:redis` – reserved for future Redis-specific script; Redis is enabled when `REDIS_URL` is set.

## Config (env)

| Env | Default | Description |
|-----|--------|-------------|
| `PORT` | `4000` | HTTP port (Render sets this). |
| `ALLOWED_ORIGINS` | `*` | CORS origins, comma-separated. |
| `PEERJS_PATH` | `/peerjs` | PeerJS path. |
| `PEERJS_PROXIED` | `true` | Set true behind reverse proxy (Render). |
| `SOCKET_IO_PATH` | `/socket` | Socket.IO path. |
| `REDIS_URL` | - | If set, Socket.IO uses Redis adapter. |

## Socket.IO room events

- **join-room** (client → server): payload `roomId` (string or `{ roomId }`). Server adds socket to room and broadcasts **user-joined** to others in the room.
- **user-joined** (server → client): `{ socketId, roomId }`.
- **user-left** (server → client): `{ socketId, roomId }` on disconnect.

## Client examples

- **Socket.IO:** open `examples/client-socket.html` in a browser (point `BASE_URL` at your server).
- **PeerJS:** open `examples/client-peerjs.html` (same; path must be `/peerjs`).

## Docs

- **ARCHITECTURE.md** – WebRTC, PeerJS vs Socket.IO, TURN, scaling, Redis, security, wss vs ws.
- **RENDER_DEPLOY.md** – Render deployment steps and env.

## Project layout

```
production/
├── package.json
├── config.js          # Env-based config
├── server.js          # Single HTTP server: Express + PeerJS + Socket.IO
├── README.md
├── ARCHITECTURE.md
├── RENDER_DEPLOY.md
└── examples/
    ├── client-socket.html
    └── client-peerjs.html
```
