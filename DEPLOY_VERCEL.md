# Deploy PeerServer to Vercel

## Quick Deployment Guide

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Navigate to project:**
```bash
cd peer_server
```

4. **Deploy:**
```bash
vercel
```

5. **For production:**
```bash
vercel --prod
```

### Method 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `peer_server`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

### Required:
- `PEERJS_PORT`: `4001` (or your port)
- `PEERJS_PATH`: `/`
- `PEERJS_SECURE`: `true` (Vercel provides HTTPS)
- `ALLOWED_ORIGINS`: Your app domains (e.g., `https://yourapp.com,https://api.yourapp.com`)

### Optional:
- `PEERJS_HOST`: Auto-set by Vercel as `VERCEL_URL`
- `NODE_ENV`: `production`

## Important Notes

### WebSocket Support
- ✅ **Vercel Pro Plan**: Full WebSocket support
- ⚠️ **Vercel Free/Hobby**: Limited WebSocket support
- For production WebRTC, consider Vercel Pro or alternative hosting

### HTTPS
- Vercel automatically provides HTTPS
- Set `PEERJS_SECURE=true` in environment variables
- SSL certificates are managed by Vercel

### Custom Domain
1. Add your domain in Vercel Dashboard → Settings → Domains
2. Update `ALLOWED_ORIGINS` to include your custom domain
3. Update Flutter app's `PeerServerConfig` with your domain

## Post-Deployment

1. **Test Health Endpoint:**
   ```
   https://your-project.vercel.app/health
   ```

2. **Update Flutter App:**
   - Update `lib/core/config/peer_server_config.dart`
   - Set production host to your Vercel domain
   - Or use environment variables when building

3. **Monitor:**
   - Check Vercel Dashboard → Functions for logs
   - Monitor WebSocket connections

## Troubleshooting

### WebSocket Connection Failed
- Ensure you're on Vercel Pro plan
- Check `ALLOWED_ORIGINS` includes your app domain
- Verify `PEERJS_SECURE=true`

### Port Issues
- Vercel uses dynamic ports
- Use `process.env.PORT` or `process.env.VERCEL_URL`
- Don't hardcode port numbers

### CORS Errors
- Update `ALLOWED_ORIGINS` in environment variables
- Include protocol (https://) in origins
- Restart deployment after changing env vars

## Alternative Hosting Options

If WebSocket support is critical and Vercel Free tier doesn't meet your needs:

1. **Railway** - Good WebSocket support
2. **Render** - Free tier with WebSocket
3. **DigitalOcean App Platform** - Full control
4. **AWS/GCP** - Enterprise solutions
