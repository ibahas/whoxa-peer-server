# Using PeerJS Cloud with Your Flutter App

Since Vercel Serverless Functions cannot maintain persistent WebSocket connections required by PeerJS Server, the easiest solution is to use **PeerJS Cloud** - a free, hosted PeerJS server provided by the PeerJS team.

## What is PeerJS Cloud?

PeerJS Cloud is a free, public PeerJS signaling server hosted at `peerjs.com`. It handles all the WebSocket connections and peer discovery, so you don't need to host your own server.

## Benefits

- ✅ **Free** - No cost, no limits
- ✅ **No Server Deployment** - Nothing to host or maintain
- ✅ **Always Available** - Managed by PeerJS team
- ✅ **HTTPS/WSS** - Secure connections
- ✅ **Simple Setup** - Just change your client configuration

## Flutter Client Configuration

### Option 1: Using peerjs_client Package

If you're using the `peerjs_client` package in Flutter:

```dart
import 'package:peerjs_client/peerjs_client.dart';

// Connect to PeerJS Cloud (no host/port needed)
final peer = Peer(
  // Leave host and port empty to use PeerJS Cloud
  // Or explicitly set:
  host: 'peerjs.com',
  port: 443,
  secure: true,
  path: '/',
);

// Your peer ID will be generated automatically
peer.on('open', (id) {
  print('Connected to PeerJS Cloud with ID: $id');
});
```

### Option 2: Using WebSocket Directly

If you're using WebSocket connections directly:

```dart
// Connect to PeerJS Cloud WebSocket
final ws = WebSocket.connect(
  'wss://peerjs.com/peerjs?key=peerjs&id=YOUR_PEER_ID&token=YOUR_TOKEN'
);
```

### Option 3: Using HTTP/HTTPS API

For REST API calls:

```dart
// PeerJS Cloud REST endpoint
final baseUrl = 'https://peerjs.com';
```

## Complete Example

Here's a complete example for your Flutter app:

```dart
import 'package:peerjs_client/peerjs_client.dart';

class PeerService {
  Peer? _peer;
  String? _peerId;

  Future<void> initialize() async {
    try {
      // Connect to PeerJS Cloud
      _peer = Peer(
        host: 'peerjs.com',
        port: 443,
        secure: true,
        path: '/',
        // Optional: Add your API key if you have one
        // key: 'your-api-key',
      );

      // Listen for connection open
      _peer!.on('open', (id) {
        _peerId = id;
        print('✅ Connected to PeerJS Cloud');
        print('📍 Peer ID: $id');
      });

      // Listen for incoming calls
      _peer!.on('call', (call) {
        print('📞 Incoming call from: ${call.peer}');
        // Handle the call
      });

      // Listen for connection
      _peer!.on('connection', (conn) {
        print('🔗 New connection from: ${conn.peer}');
        // Handle the connection
      });

      // Error handling
      _peer!.on('error', (error) {
        print('❌ PeerJS Error: $error');
      });

    } catch (e) {
      print('❌ Failed to initialize PeerJS: $e');
    }
  }

  String? get peerId => _peerId;

  void dispose() {
    _peer?.disconnect();
    _peer?.destroy();
  }
}
```

## Update Your Config File

Update your `lib/core/config/peer_server_config.dart`:

```dart
class PeerServerConfig {
  // Use PeerJS Cloud
  static const String host = 'peerjs.com';
  static const int port = 443;
  static const bool secure = true;
  static const String path = '/';
  
  // Or leave empty to use default PeerJS Cloud
  // static const String? host = null;
  // static const int? port = null;
}
```

## Migration Checklist

- [ ] Update Flutter client to use `peerjs.com` as host
- [ ] Set `secure: true` and `port: 443`
- [ ] Remove any custom server URLs from your config
- [ ] Test peer connections
- [ ] Update any documentation referencing your custom server

## Limitations

- **No Custom Configuration** - You can't customize the server behavior
- **Public Server** - All peers use the same public server
- **Rate Limits** - May have rate limits (check PeerJS documentation)
- **No Custom Authentication** - Uses PeerJS's default auth

## Alternative: Custom Server on Railway/Render

If you need custom configuration, deploy `server.js` to:
- **Railway**: https://railway.app (Free tier available)
- **Render**: https://render.com (Free tier available)

Both support persistent WebSocket connections and can run your custom PeerJS server.

## Support

- PeerJS Documentation: https://peerjs.com/docs
- PeerJS Cloud Info: https://peerjs.com/peerserver
- Issues: Check PeerJS GitHub repository
