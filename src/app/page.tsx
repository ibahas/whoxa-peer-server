export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Whoxa PeerJS Server</h1>
      <p>PeerJS Server is running and ready to handle WebRTC signaling.</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Endpoints:</h2>
        <ul>
          <li>
            <strong>Health Check:</strong>{' '}
            <a href="/health">/health</a>
          </li>
          <li>
            <strong>PeerJS API:</strong>{' '}
            <a href="/api/peerjs">/api/peerjs</a>
          </li>
        </ul>
      </div>
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Configuration:</h3>
        <p>
          <strong>Port:</strong> {process.env.PEERJS_PORT || '4001'}
        </p>
        <p>
          <strong>Path:</strong> {process.env.PEERJS_PATH || '/'}
        </p>
        <p>
          <strong>Secure:</strong> {process.env.PEERJS_SECURE === 'true' ? 'Yes' : 'No'}
        </p>
      </div>
    </main>
  );
}
