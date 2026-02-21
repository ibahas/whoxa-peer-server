# Architecture: WebRTC, PeerJS, Socket.IO

## Text diagram: single-server architecture

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                  Render / Reverse proxy                  │
                    │                  (HTTPS → HTTP, PORT)                    │
                    └───────────────────────────┬─────────────────────────────┘
                                                │
                    ┌───────────────────────────▼─────────────────────────────┐
                    │              Single Node.js HTTP server                  │
                    │              (http.createServer(app))                    │
                    │  ┌───────────────────────────────────────────────────┐  │
                    │  │ Express: /health, CORS, body parser                │  │
                    │  └───────────────────────────────────────────────────┘  │
                    │  ┌───────────────────────────────────────────────────┐  │
                    │  │ PeerJS (ExpressPeerServer) on path: /peerjs       │  │
                    │  │ - WebRTC signaling only (SDP/ICE)                   │  │
                    │  │ - proxied: true for reverse proxy                  │  │
                    │  └───────────────────────────────────────────────────┘  │
                    │  ┌───────────────────────────────────────────────────┐  │
                    │  │ Socket.IO on path: /socket                         │  │
                    │  │ - transports: ['websocket'] only                   │  │
                    │  │ - Rooms: join-room, user-joined, user-left         │  │
                    │  └───────────────────────────────────────────────────┘  │
                    └─────────────────────────────────────────────────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         │                                      │                                      │
         ▼                                      ▼                                      ▼
   [ Flutter / Web ]                      [ Flutter / Web ]                      [ Flutter / Web ]
   Socket.IO client                        PeerJS client                          both
   (chat, presence, rooms)                 (WebRTC peer id, connect)             (calls + chat)
```

## How WebRTC works in this architecture

1. **Signaling (out-of-band)**  
   WebRTC needs a way to exchange SDP offers/answers and ICE candidates before media can flow. That is **signaling**. It is **not** part of WebRTC itself; it can be any channel (HTTP, WebSocket, Socket.IO, etc.).

2. **In this project**  
   - **PeerJS** provides the signaling channel for **peer discovery and WebRTC setup**: peers get an id, connect to each other, and exchange SDP/ICE over the PeerJS server.  
   - **Socket.IO** is a separate channel for **application-level** signaling: rooms, “user joined/left”, chat, or any custom events. It does not carry WebRTC SDP/ICE unless you explicitly send them over Socket.IO (we don’t).

3. **Typical flow**  
   - Client A and B both connect to **Socket.IO** (e.g. join the same “room”).  
   - They learn each other’s **PeerJS peer ids** (via your app logic, e.g. over Socket.IO or your API).  
   - They use **PeerJS** to create a peer connection (`peer.connect(peerId)`).  
   - PeerJS server relays **signaling messages** (SDP/ICE) between A and B.  
   - Once the WebRTC connection is established, **media/data flows peer-to-peer**; the server is no longer in the path.

## Role of PeerJS

- **Purpose:** WebRTC signaling server only.  
- **What it does:** Lets peers register by peer id and exchanges signaling messages (SDP offer/answer, ICE candidates) between them. It does **not** relay media or data channels; those go directly between browsers.  
- **Path:** Mounted at `/peerjs` with `proxied: true` so it works behind Render’s reverse proxy (correct headers and paths).  
- **When TURN is required:** When peers cannot reach each other (NAT/firewall). Then a TURN server relays media. PeerJS does not act as TURN; you’d add a separate TURN service (e.g. Twilio, self-hosted coturn).

## Role of Socket.IO

- **Purpose:** Application-level real-time channel (rooms, presence, chat, custom events).  
- **What it does:**  
  - **join-room:** client joins a room by id.  
  - **user-joined / user-left:** broadcast to the room when someone joins or disconnects.  
- **Transport:** WebSocket only (`transports: ['websocket']`).  
- **Path:** `/socket`. Same HTTP server as Express and PeerJS.

## When a TURN server is required

- **STUN** (e.g. free public STUN): often enough for peers that are not behind symmetric NAT.  
- **TURN:** needed when direct and STUN-assisted connections fail (e.g. strict corporate firewalls, symmetric NAT). Then media is relayed through TURN.  
- **This repo:** does not include TURN. Add a TURN server (e.g. coturn) or a TURN-as-a-service and configure your WebRTC client (e.g. `rtcConfiguration.iceServers`) with that TURN URL.

## Horizontal scaling (Socket.IO)

- **Single instance:** in-memory adapter; rooms and presence are per process.  
- **Multiple instances:** use the **Redis adapter** so all instances share the same room and broadcast state.  
- **Steps:** set `REDIS_URL` (e.g. Render Redis). The server attaches `@socket.io/redis-adapter` if `REDIS_URL` is present. No code change needed beyond env.  
- **PeerJS:** does not scale horizontally in the same way; each PeerJS server keeps its own peer map. For multi-instance PeerJS you’d need sticky sessions or a shared store (not in this example). Typically one PeerJS instance or sticky routing is used.

## Redis adapter example (conceptual)

Already implemented in `server.js` when `REDIS_URL` is set:

```js
const { createAdapter } = await import('@socket.io/redis-adapter');
const { createClient } = await import('redis');
const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);
io.adapter(createAdapter(pub, sub));
```

- All servers attached to the same Redis will see the same rooms and receive the same broadcasts (e.g. `user-joined`, `user-left`).

## Security best practices (summary)

1. **HTTPS in production:** Use Render’s HTTPS; do not send credentials over plain HTTP.  
2. **CORS:** Restrict `ALLOWED_ORIGINS` to your app origins, not `*`, in production.  
3. **Auth:** Validate tokens/cookies in Socket.IO middleware (`io.use((socket, next) => { ... next(); })`) and optionally for PeerJS (e.g. validate before accepting connections).  
4. **Rate limiting:** Add rate limiting (e.g. `express-rate-limit`) on Express and consider per-socket rate limits.  
5. **Secrets:** Keep keys and Redis URL in env vars; never commit them.  
6. **Dependencies:** Run `npm audit` and fix high/critical issues.

## wss vs ws

- **ws:** WebSocket over plain TCP. Used when the page is loaded over `http://`.  
- **wss:** WebSocket over TLS. Used when the page is loaded over `https://`.  
- **Behind Render:** The browser connects to `wss://your-app.onrender.com`; Render terminates TLS and forwards plain WebSocket to your Node server. So your app listens with `http.createServer`; you don’t need to configure TLS in Node.  
- **Direct (no proxy):** If you expose Node directly with HTTPS, you’d use `https.createServer` and the same server would serve `wss`; the browser would use `wss://` to match.

## Deployment (Render)

- **Build command:** `npm install --include=dev` is not needed (no build step). Use `npm install`.  
- **Start command:** `node server.js` or `npm start`.  
- **Env:** Set `PORT` (Render sets it), `ALLOWED_ORIGINS`, optional `REDIS_URL`, optional `PEERJS_PATH`/`PEERJS_PROXIED`/`SOCKET_IO_PATH`.  
- **Root directory:** If the app is in a subfolder (e.g. `production/`), set Render’s root to that folder so `package.json` and `server.js` are at the root of the deploy context.
