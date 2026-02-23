# Flutter Socket.IO – تجنب "Bad request" (code 3) خلف Render

الخطأ `code 3, message: "Bad request"` يظهر عندما يفتح العميل **WebSocket مباشرة** (`transport=websocket`) بدون بدء جلسة بـ **polling** أولاً. خلف الـ reverse proxy (مثل Render) يجب أن يبدأ الاتصال بـ polling.

## التعديل المطلوب في Flutter

في `SocketService` (أو مكان إنشاء الـ socket) غيّر **ترتيب** الـ transports بحيث يكون **polling أولاً** ثم websocket:

```dart
_socket = io.io(
  urlToUse,
  io.OptionBuilder()
      .setTransports(['polling', 'websocket'])  // ✅ polling أولاً ثم websocket
      .setPath(_socketPath)
      .setExtraHeaders({'token': token})
      .enableAutoConnect()
      .setReconnectionAttempts(5)
      .setReconnectionDelay(3000)
      .setReconnectionDelayMax(30000)
      .enableForceNew()
      .build(),
);
```

**مهم:** لا تستخدم `['websocket', 'polling']` — استخدم بالضبط **`['polling', 'websocket']`** حتى تُجرى الجلسة الأولى عبر HTTP (polling) ثم الترقية إلى WebSocket.

## لماذا؟

- مع `transport=websocket` فقط، الطلب الأول يكون upgrade لـ WebSocket؛ بعض الـ proxies لا تمرّر الـ upgrade بشكل صحيح فترجع السيرفر "Bad request".
- مع `polling` أولاً، الطلب الأول يكون GET عادي، السيرفر يرد بـ session، ثم العميل يرقّي إلى WebSocket. هذا المسار يعمل عادة خلف Render.

## التحقق

بعد التعديل وإعادة النشر (إن لزم)، يجب أن ترى في الـ log اتصالاً ناجحاً بدون `WebSocketException` أو `code: 3`.
