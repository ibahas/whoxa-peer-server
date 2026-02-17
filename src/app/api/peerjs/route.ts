import { NextRequest, NextResponse } from 'next/server';

/**
 * PeerJS API Route for Vercel Deployment
 * 
 * Note: Vercel Serverless Functions have limitations with WebSocket connections.
 * For full WebSocket support, deploy using a custom server (see server.js).
 * This endpoint provides a status check for Vercel deployments.
 */
export async function GET(request: NextRequest) {
  try {
    // Check if we're running on Vercel (serverless)
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    
    return NextResponse.json({
      status: 'ok',
      message: isVercel 
        ? 'PeerJS API endpoint is available (Vercel Serverless). For full WebSocket support, use a custom server deployment.'
        : 'PeerJS API endpoint is available',
      platform: isVercel ? 'vercel' : 'custom',
      timestamp: new Date().toISOString(),
      note: isVercel 
        ? 'WebSocket connections require a persistent server. Consider deploying server.js separately or using a service that supports WebSockets.'
        : undefined,
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
