# 🔧 استكشاف الأخطاء والحلول

## ❌ الإعلان ما بيتبعتش لتيليجرام

### 1. تفقد الـ Console
1. افتح الموقع
2. اضغط `F12` (أو `Ctrl+Shift+I`)
3. اختر تبويب **Console**
4. جرب إرسال إعلان وشوف الأخطاء

### 2. تحقق من رابط الـ Worker
في `site/runtime-config.js` تأكد من:
```javascript
window.KARY_API_URL = 'https://kary-mo.YOURNAME.workers.dev/api/telegram/order';
```
- استبدل `YOURNAME` برقم الـ Worker الفعلي
- مثال الصيغة الصحيحة: `https://kary-mo.abc123.workers.dev/api/telegram/order`

### 3. تحقق من إعدادات Cloudflare Worker

#### Variables المطلوبة:
اذهب لـ Worker بتاعك → **Settings** → **Variables and Secrets**

✅ تأكد من وجود كل هذه:
- `TELEGRAM_BOT_TOKEN` (Secret) — من BotFather
- `TELEGRAM_CHAT_ID` (Secret) — رقم الشات
- `ALLOWED_ORIGIN` (Text) — `https://mostafamaray056-arch.github.io`

#### الأخطاء الشائعة:
| الخطأ | الحل |
|---|---|
| "Request origin is not allowed" | تحقق من `ALLOWED_ORIGIN` يساوي رابط الموقع بتاعك |
| "استقبال الطلبات غير جاهز" | التوكن أو Chat ID ناقص في الـ Worker Settings |
| "توكن غلط" | انسخ التوكن من BotFather ثاني، ممكن فيه مسافات زيادة |

### 4. اختبر التوكن والـ Chat ID
افتح المتصفح وجرب الرابط ده (بعد ما تحط التوكن):
```
https://api.telegram.org/botTOKEN/getMe
```
لو ما ردش، التوكن غلط.

---

## ❌ صورة الإعلان ما بتظهرش في المعاينة

### السبب الأكثر شيوعاً: مسار الصور غلط

تأكد من:
1. صورة `hero.jpg` موجودة في مجلد `site/`
2. صور الأبطال موجودة في `site/hero-portraits/`
   - مثال: `site/hero-portraits/qalawun.jpg`

### إذا الصور ناقصة:
- ارفع الصور في المكان الصحيح
- تأكد من اسم الملف يطابق الاسم في الكود

---

## ❌ خطأ CORS (Cross-Origin)

### المشكلة:
```
Access to XMLHttpRequest at 'https://...' from origin 'https://mostafamaray056-arch.github.io' 
has been blocked by CORS policy
```

### الحل:
اذهب لـ Cloudflare Worker → **Settings** → **Variables and Secrets**

تأكد من:
```
ALLOWED_ORIGIN = https://mostafamaray056-arch.github.io
```

لو الموقع عندك على رابط تاني، غيّر الـ `ALLOWED_ORIGIN` لراقط الموقع الفعلي.

---

## ❌ "صورة الإعلان كبيرة"

### السبب:
صورة الإعلان أكبر من 1.4 MB

### الحل:
1. قلل عدد الأبطال في الإعلان
2. قلل تفاصيل البيانات
3. حاول من جديد

---

## ❌ "رقم واتساب غلط"

### الصيغة الصحيحة:
- مع كود الدولة: `+201012345678` (مصر)
- مع كود دولة تاني: `+966501234567` (السعودية)

### ما تكتب:
- ❌ `01012345678` (بدون كود)
- ❌ `+2001012345678` (كود مكرر)
- ❌ `0201012345678` (الصفر أول)

---

## 🆘 عندك مشكلة ما فيش حل لها؟

### اطلب مساعدة:
1. افتح الـ Console (`F12`)
2. انسخ رسالة الخطأ
3. قول لي:
   - رابط الموقع بتاعك
   - رسالة الخطأ كاملة
   - ايش الخطوة اللي وقفت عندها

---

## ✅ تفقد قائمة الاختبار

لو الإعلان ما بيتبعتش:

- [ ] هل الموقع يشتغل على HTTPS؟ (مش HTTP)
- [ ] هل البيانات موجودة في Cloudflare Worker Settings؟
- [ ] هل التوكن صحيح من BotFather؟
- [ ] هل Chat ID صحيح؟
- [ ] هل `ALLOWED_ORIGIN` يساوي رابط الموقع؟
- [ ] هل كل الصور موجودة في المكان الصحيح؟
- [ ] هل حدثت الموقع على GitHub Pages بآخر نسخة من `index.html`؟

✅ إذا كل الحاجات تمام، جرب الإرسال من جديد!
