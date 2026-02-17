# نشر PeerServer على Vercel

## ⚠️ ملاحظة مهمة

**Vercel Free/Hobby Plan** لا يدعم WebSocket بشكل كامل، وهو مطلوب لـ PeerJS Server.

**الحلول الموصى بها:**
1. **Vercel Pro Plan** - يدعم WebSocket بشكل كامل
2. **Railway** - يدعم WebSocket في الخطة المجانية
3. **Render** - يدعم WebSocket
4. **VPS/Dedicated Server** - حل كامل

## خطوات النشر على Vercel (Pro Plan)

### 1. تثبيت Vercel CLI

```bash
npm install -g vercel
```

### 2. تسجيل الدخول

```bash
vercel login
```

### 3. الانتقال إلى مجلد المشروع

```bash
cd peer_server
```

### 4. النشر

```bash
vercel
```

للإنتاج:
```bash
vercel --prod
```

### 5. إعداد Environment Variables

في Vercel Dashboard → Settings → Environment Variables:

```
PEERJS_PORT=4001
PEERJS_PATH=/
PEERJS_SECURE=true
ALLOWED_ORIGINS=https://your-app-domain.com
NODE_ENV=production
```

**ملاحظة:** Vercel يوفر HTTPS تلقائياً، لذا `PEERJS_SECURE=true` مطلوب.

## بدائل للنشر (WebSocket Support)

### Railway (موصى به)

```bash
# تثبيت Railway CLI
npm install -g @railway/cli

# تسجيل الدخول
railway login

# النشر
railway up
```

### Render

1. اذهب إلى [render.com](https://render.com)
2. أنشئ Web Service جديد
3. اربط Git repository
4. استخدم الإعدادات:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### DigitalOcean App Platform

1. اذهب إلى DigitalOcean
2. أنشئ App جديد
3. اربط Git repository
4. استخدم نفس الإعدادات

## تحديث Flutter App

بعد النشر، حدّث `lib/core/config/peer_server_config.dart`:

```dart
static const String _prodHost = 'your-vercel-domain.vercel.app';
```

أو استخدم environment variables عند البناء.

## اختبار النشر

1. تحقق من Health Endpoint:
   ```
   https://your-project.vercel.app/health
   ```

2. اختبر الاتصال من Flutter App

3. راقب Logs في Vercel Dashboard

## استكشاف الأخطاء

### WebSocket Connection Failed
- تأكد من استخدام Vercel Pro Plan
- تحقق من `ALLOWED_ORIGINS`
- تأكد من `PEERJS_SECURE=true`

### CORS Errors
- أضف domain التطبيق إلى `ALLOWED_ORIGINS`
- تأكد من استخدام HTTPS

### Port Issues
- Vercel يستخدم منافذ ديناميكية
- لا تحدد منفذ ثابت
- استخدم `process.env.PORT`
