# ⚡ البدء السريع — 5 دقائق فقط

## المشكلة اللي صارت
الموقع كان بيحاول يبعت الإعلانات لتليجرام من GitHub Pages، لكن **GitHub Pages ما تدعمش API requests**. 

✅ **الحل**: استخدام Cloudflare Worker (سيرفر مجاني).

---

## 🚀 اتبع هذه الخطوات

### 1️⃣ اعمل حساب Cloudflare (5 دقائق)
- اذهب: https://dash.cloudflare.com
- اعمل حساب جديد
- لوج إن

### 2️⃣ اعمل Cloudflare Worker (3 دقائق)
```
Workers & Pages → Create → Create Worker
اسم: kary-mo
Deploy
```

### 3️⃣ رفع كود الـ Worker (2 دقائق)
1. اضغط **Edit code**
2. امسح الكود الموجود
3. انسخ كل محتوى ملف `cloudflare-worker.js` من المشروع
4. الصق الكود هنا
5. اضغط **Deploy**

### 4️⃣ اضف المتغيرات السرية (3 دقائق)
اذهب: **Settings** → **Variables and Secrets**

أضف التالي:

```
TELEGRAM_BOT_TOKEN = [Secret]
القيمة: توكن البوت من BotFather

TELEGRAM_CHAT_ID = [Secret]
القيمة: رقم الشات (Chat ID)

ALLOWED_ORIGIN = [Text]
القيمة: https://mostafamaray056-arch.github.io
```

#### إزاي تجيب التوكن والـ Chat ID:
**التوكن من BotFather:**
1. اتكلم مع @BotFather على تليجرام
2. ابعت `/newbot`
3. اتبع التعليمات
4. آخر رسالة فيها التوكن

**Chat ID:**
1. ابعت `/start` لبوتك
2. افتح الرابط ده (ضع التوكن مكانه):
```
https://api.telegram.org/botTOKEN/getUpdates
```
3. شوف `"chat":{"id":123456789` — الرقم ده هو Chat ID

### 5️⃣ نسخ رابط الـ Worker (1 دقيقة)
في صفحة الـ Worker → شوف الرابط تحت "Deployment"
```
https://kary-mo.XXXXX.workers.dev
```
انسخ هذا الرابط.

### 6️⃣ تحديث الموقع (1 دقيقة)
افتح `site/runtime-config.js` وتأكد إن `window.KARY_API_URL` يحتوي على رابط الـ Worker وينتهي بـ `/api/telegram/order`.

### 7️⃣ ارفع الموقع على GitHub (1 دقيقة)
ارفع محتويات فولدر `site/` كلها على GitHub Pages، بما فيها `runtime-config.js`.

---

## ✅ اختبار
1. افتح الموقع
2. اضغط "بيع وشراء قلاع"
3. ملا البيانات
4. اضغط "إرسال صورة الإعلان"
5. تفقد تيليجرام ✅

---

## 🆘 عندك مشكلة؟
اقرأ ملف `TROUBLESHOOTING.md` للحلول الشاملة.

---

## 📝 هذا هو الآن!
✅ تم تعديل الملفات بنجاح
✅ كل حاجة موجودة وجاهزة
✅ اتبع الخطوات فوق وهتشتغل!
