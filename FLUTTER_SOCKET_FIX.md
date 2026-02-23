# Flutter SocketService – التعديلات المطلوبة للاتصال بـ Render

## 1) ترتيب الـ transports (مهم جداً)

استخدم **polling أولاً** ثم websocket حتى لا يظهر خطأ "Bad request" (code 3) خلف الـ proxy:

```dart
// ❌ قبل (يسبب code 3 خلف Render)
.setTransports(['websocket', 'polling'])

// ✅ بعد
.setTransports(['polling', 'websocket'])
```

## 2) عنوان السيرفر: استخدم HTTPS وليس WSS

مكتبة Socket.IO تريد عنوان السيرفر **https://** أو **http://**؛ هي من تقوم بفتح الطلبات (polling ثم websocket). إذا مرّرتَ **wss://** قد تُرسل الطلب الأول كـ WebSocket فقط فتفشل خلف الـ proxy.

```dart
// ❌ تجنّب: تحويل كل شيء إلى wss/ws
final String urlToUse = needExplicitPort
    ? (isSecure ? 'wss://${uri.host}:443' : 'ws://${uri.host}:80')
    : ...;

// ✅ استخدم نفس الـ scheme الأصلي (https أو http)
final String urlToUse = needExplicitPort
    ? (isSecure ? 'https://${uri.host}:443' : 'http://${uri.host}:80')
    : (isSecure ? 'https://${uri.host}:${uri.port}' : 'http://${uri.host}:${uri.port}');
```

أو إذا كان `ApiEndpoints.socketUrl` بالفعل مثل `https://whoxa-peer-server.onrender.com` فمرّرها كما هي:

```dart
final String urlToUse = _socketUrl;
```

## 3) ملخص التعديل في connect()

استبدل كتلة بناء الـ URL والـ OptionBuilder بهذا:

```dart
// Base URL: استخدم https:// أو http:// (ليس wss/ws)
final uri = Uri.parse(_socketUrl);
final bool isSecure = uri.scheme == 'https' || uri.scheme == 'wss';
final bool needExplicitPort = uri.host.isNotEmpty && (!uri.hasPort || uri.port == 0);
final String urlToUse = needExplicitPort
    ? (isSecure ? 'https://${uri.host}:443' : 'http://${uri.host}:80')
    : (isSecure ? 'https://${uri.host}:${uri.port}' : 'http://${uri.host}:${uri.port}');
print('🔌 [SOCKET] Connecting with URL: $urlToUse');

_socket = io.io(
  urlToUse,
  io.OptionBuilder()
      .setTransports(['polling', 'websocket'])  // polling أولاً
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

## 4) _fetchAndPrintServerResponse

استخدم **https** (أو http) لطلب التشخيص، وليس Upgrade مباشر:

```dart
final url = '$scheme://${uri.host}:$port$path';
// لا تضف Upgrade/Connection للـ GET العادي؛ اترك الطلب كـ GET عادي.
final request = await client.getUrl(Uri.parse(url));
// احذف السطرين التاليين للـ GET العادي:
// request.headers.set('Connection', 'Upgrade');
// request.headers.set('Upgrade', 'websocket');
final response = await request.close();
```

بهذا ستحصل على رد السيرفر الحقيقي على طلب polling (GET) بدلاً من محاكاة upgrade.

---

بعد هذه التعديلات، احفظ الملف، شغّل التطبيق من جديد، ثم جرّب الاتصال. إذا استمر الخطأ، أرسل السطور الجديدة لـ `urlToUse` و `setTransports` ورسالة الخطأ الكاملة.
