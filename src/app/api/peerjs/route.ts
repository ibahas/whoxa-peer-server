import { NextRequest, NextResponse } from 'next/server';
import { startPeerServer, getPeerServerInstance } from '@/server/peer-server';

let serverStarted = false;

/**
 * Initialize PeerJS Server on first request
 */
export async function GET(request: NextRequest) {
  try {
    if (!serverStarted) {
      await startPeerServer();
      serverStarted = true;
    }

    const peerServer = getPeerServerInstance();
    
    if (!peerServer) {
      return NextResponse.json(
        { error: 'PeerJS Server not initialized' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'PeerJS Server is running',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in PeerJS API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize PeerJS Server' },
      { status: 500 }
    );
  }
}

/**
 * Handle WebSocket upgrade requests
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
