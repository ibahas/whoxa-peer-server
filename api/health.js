/**
 * Health check endpoint for Vercel
 */
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'vercel',
    uptime: process.uptime(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
    },
  });
}
