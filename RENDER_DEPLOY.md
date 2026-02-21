# Deploying to Render

## Dashboard settings (Web Service)

| Setting | Value |
|--------|--------|
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `node server.js` |
| **Node Version** | 20 (or set in Environment: `NODE_VERSION=20`) |

## Environment variables (optional)

- `NODE_ENV` = `production` (Render usually sets this)
- `PEERJS_PATH` = `/`
- `PEERJS_SECURE` = `false` (Render provides HTTPS in front; no need for app-level SSL)
- `ALLOWED_ORIGINS` = `*` or your app URL(s)

Do **not** set `PORT` — Render sets it automatically.

## Common deploy failures

### 1. Build fails: "prerender" / "useContext" / "<Html>"

- Ensure you have the latest code: `dynamic = 'force-dynamic'` in `src/app/layout.tsx` and `src/app/page.tsx`, and `src/app/not-found.tsx` exists.
- Redeploy after pulling these changes.

### 2. Build fails: "TypeScript but do not have the required package(s)"

- Render skips devDependencies by default. Use **Build Command:** `npm install --include=dev && npm run build`.

### 3. Build fails: "Module not found" / "Can't resolve"

- In **Build Command** use: `npm install --include=dev && npm run build` (so dependencies including TypeScript install before build).
- If you use a monorepo, set **Root Directory** to the folder that contains `package.json` (e.g. `peer_server`).

### 4. Service starts then crashes or "Application failed to respond"

- **Start Command** must be exactly: `node server.js` (not `npm start` if that causes issues on Render’s shell).
- Check **Logs** for the real error (e.g. missing env, port, or file).

### 5. Wrong port

- The app must listen on `process.env.PORT`. This repo’s `server.js` already uses `process.env.PORT`; do not set `PORT` in Environment unless Render support tells you to.

### 6. Need Node 20

- In Dashboard: **Environment** → add `NODE_VERSION` = `20`.
- Or rely on `package.json` `engines.node`: `"20.x"` if Render respects it.

## Links

- [Render: Deploy Next.js](https://render.com/docs/deploy-nextjs-app)
- [Render: Troubleshooting deploys](https://render.com/docs/troubleshooting-deploys)
