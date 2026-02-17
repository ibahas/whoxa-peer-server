import { NextRequest, NextResponse } from 'next/server';

/**
 * PeerJS API Route for Vercel Deployment
 * 
 * IMPORTANT: Vercel Serverless Functions cannot maintain persistent WebSocket connections
 * required by PeerJS Server. Use one of these solutions:
 * 
 * Option A (Recommended): Use PeerJS Cloud (Free)
 *   - No server deployment needed
 *   - Client connects directly to peerjs.com
 *   - See PEERJS_CLOUD_SETUP.md for Flutter client configuration
 * 
 * Option B: Deploy server.js to Railway/Render
 *   - Full WebSocket support
 *   - Custom server configuration
 * 
 * Option C: Use alternative signaling (Pusher/Ably)
 *   - Serverless-compatible WebSocket services
 */
export async function GET(request: NextRequest) {
  try {
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    
    return NextResponse.json({
      status: 'ok',
      message: 'PeerJS configuration endpoint',
      platform: isVercel ? 'vercel' : 'custom',
      timestamp: new Date().toISOString(),
      recommendation: {
        forVercel: 'Use PeerJS Cloud (free) - no server needed',
        setup: 'See PEERJS_CLOUD_SETUP.md for client configuration',
        alternatives: [
          'Deploy server.js to Railway/Render for custom server',
          'Use Pusher/Ably for serverless WebSocket signaling'
        ]
      },
      peerjsCloud: {
        enabled: true,
        endpoint: 'peerjs.com',
        port: 443,
        secure: true,
        note: 'No configuration needed - just connect your client to peerjs.com'
      }
    });
  } catch (error: any) {
    console.error('Error in PeerJS API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests (same as GET)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
