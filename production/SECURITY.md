# Security best practices

## 1. HTTPS / TLS

- In production, serve the app only behind HTTPS (e.g. Render’s proxy). Do not expose the Node server directly on the public internet over plain HTTP.
- Use **wss** (WebSocket over TLS) for Socket.IO and secure PeerJS connections when the site is loaded over **https**.

## 2. CORS

- Set `ALLOWED_ORIGINS` to your real app origins (e.g. `https://yourapp.com,https://www.yourapp.com`). Avoid `*` in production.
- Restrict methods and headers to what you need.

## 3. Authentication

- **Socket.IO:** Use the `auth` option and validate in middleware:
  ```js
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!isValidToken(token)) return next(new Error('Unauthorized'));
    socket.data.userId = decodeToken(token).userId;
    next();
  });
  ```
- **PeerJS:** Validate peer ids or use a custom key; optionally tie peer id to an authenticated user so only allowed peers can connect.

## 4. Rate limiting

- Add `express-rate-limit` (or similar) on Express routes (e.g. `/health` and any REST endpoints).
- Consider per-IP or per-user limits for Socket.IO connections (e.g. in middleware or a wrapper that counts connections per key).

## 5. Secrets and env

- Never commit `REDIS_URL`, API keys, or tokens. Use environment variables (e.g. Render env vars).
- Rotate keys and Redis URLs when compromised.

## 6. Dependencies

- Run `npm audit` and fix high/critical issues. Keep `express`, `socket.io`, `peer`, and Redis client up to date.

## 7. Input validation

- Validate and sanitize all client input (room ids, payloads). Reject invalid or oversized payloads to reduce risk of abuse and DoS.

## 8. Logging and monitoring

- Log connection/disconnection and errors; avoid logging full tokens or PII. Use structured logs and a secure logging pipeline in production.
