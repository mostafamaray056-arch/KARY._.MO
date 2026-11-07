# 🚀 دليل تشغيل KARY..MO — إرسال الإعلانات لـ تيليجرام

## المشكلة الحالية
الموقع على GitHub Pages لكن GitHub Pages **ما تدعمش إرسال requests لـ تيليجرام**. لازم نستخدم سيرفر وسيط (Proxy Server).

---

## ✅ الحل: إعداد Cloudflare Worker (مجاني تماماً)

### الخطوة 1️⃣: إنشاء حساب Cloudflare
1. اذهب إلى https://dash.cloudflare.com
2. اعمل حساب جديد (أو لوج إن لو عندك حساب بالفعل)

### الخطوة 2️⃣: إنشاء Cloudflare Worker
1. من القائمة اليمين، اختر **Workers & Pages**
2. اضغط **Create** → **Create Worker**
3. اسم الـ Worker: `kary-mo` (أو أي اسم تحبه)
4. اضغط **Deploy**

### الخطوة 3️⃣: رفع كود الـ Worker
1. بعد الـ Deploy، اضغط **Edit code**
2. امسح الكود الموجود كله
3. انسخ الكود من ملف `cloudflare-worker.js` وألصقه هنا
4. اضغط **Deploy** (الزر الأسود)

### الخطوة 4️⃣: إضافة المتغيرات السرية
1. روح **Settings** (في الـ Worker)
2. اختر **Variables and Secrets**
3. أضف المتغيرات التالية:

| الاسم | النوع | القيمة |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Secret | توكن البوت من BotFather |
| `TELEGRAM_CHAT_ID` | Secret | رقم الشات بتاعك |
| `ADMIN_TELEGRAM_ID` | Secret | User ID الشخصي للأدمن الذي يرسله @userinfobot |
| `ALLOWED_ORIGIN` | Text | `https://mostafamaray056-arch.github.io` |

#### إزاي تجيب التوكن والـ Chat ID:
1. **التوكن**: تكلم مع **@BotFather** على تيليجرام
   - ابعت `/start`
   - ابعت `/newbot`
   - اتبع التعليمات، آخر رسالة فيها التوكن

2. **Chat ID**: 
   - ابعت `/start` لبوتك
   - افتح الرابط ده في المتصفح (بعد ما تحط التوكن):
   ```
   https://api.telegram.org/botTOKEN_HERE/getUpdates
   ```
   - شوف الـ `"chat":{"id":123456789` — الرقم ده هو Chat ID

### الخطوة 5️⃣: نسخ رابط الـ Worker
1. في صفحة الـ Worker، اضغط على الرابط تحت "Preview" أو في **Deployments**
2. الرابط شكله: `https://kary-mo.xxxxxx.workers.dev`

### الخطوة 6️⃣: تحديث الموقع
1. افتح ملف `site/runtime-config.js`
2. غيّر الرابط الموجود إلى رابط الـ Worker:
   ```javascript
   window.KARY_API_URL = 'https://kary-mo.REPLACE_WITH_YOUR_WORKER.workers.dev/api/telegram/order';
   ```
3. غيّر `REPLACE_WITH_YOUR_WORKER` برابط الـ Worker بتاعك، ثم ارفع محتويات `site/` كلها على GitHub Pages، بما فيها `admin.html` و`runtime-config.js`.

### تفعيل لوحة الإدارة وطلبات الباقات
1. أنشئ **KV namespace** في Cloudflare، ثم أضف binding باسم `APP_DATA` في إعدادات الـ Worker واربطه بالـ namespace. تُحفظ فيه الأسعار ورسالة الترحيب وأسئلة الفورم وطلبات الاشتراك.
2. أضف `ADMIN_TELEGRAM_ID` كـ **Secret** في إعدادات الـ Worker. استخدم رقم User ID لحساب الأدمن من @userinfobot؛ ليس رقم الهاتف أو Bot ID أو توكن البوت.
3. في تيليجرام افتح @BotFather → `/mybots` → اختر البوت → **Bot Settings → Menu Button → Configure menu button**. اربط زر القائمة برابط الموقع المنشور، مثل `https://mostafamaray056-arch.github.io/KARY._.MO/`.
4. افتح الموقع من زر القائمة في تيليجرام. حساب الأدمن فقط سيظهر له رابط **لوحة إدارة البوت**. من `admin.html` يمكن تعديل الترحيب والباقات وأسئلة فورم القلاع، ومراجعة طلبات الاشتراك بالموافقة أو الرفض.
5. طلبات الاشتراك تُحفظ في KV لمدة 90 يومًا وتصل كذلك إلى `TELEGRAM_CHAT_ID`.

> طلب الاشتراك ولوحة الإدارة يحتاجان فتح الموقع من داخل البوت على تيليجرام؛ الرابط العادي في المتصفح لا يوفر بيانات هوية Telegram الموقعة.
   - مثال: `https://kary-mo.myname123.workers.dev/api/telegram/order`

4. احفظ الملف
5. ارفع `index.html` الجديد على GitHub Pages

---

## 🧪 اختبار
1. افتح الموقع
2. اضغط "بيع وشراء قلاع"
3. ملا البيانات كلها
4. اضغط "إرسال صورة الإعلان"
5. تفقد تيليجرام — لازم توصلك صورة الإعلان + التفاصيل

---

## 🆘 عندك مشكلة؟

### الإعلان ما بيتبعتش:
- ✅ تأكد من التوكن صحيح (من BotFather)
- ✅ تأكد من Chat ID صحيح
- ✅ تأكد من ALLOWED_ORIGIN صحيح (رابط الموقع كام تمام)
- ✅ افتح console في المتصفح (F12) وشوف الأخطاء

### رسالة خطأ "CORS"؟
- تأكد من `ALLOWED_ORIGIN` في الـ Worker = رابط الموقع بتاعك

### رسالة خطأ "توكن غلط"؟
- انسخ التوكن من BotFather ثاني واتأكد ما فيش مسافات

---

## 📝 ملخص الملفات المهمة

| الملف | الوظيفة |
|---|---|
| `site/index.html` | الموقع الرئيسي (فيه API_URL) |
| `cloudflare-worker.js` | كود الـ Worker (بتحط في Cloudflare) |
| `.env` | متغيرات البيئة (ما ترفعش على GitHub) |

---

## 🎯 تم!
الآن الموقع بتاعك هيبعت الإعلانات لـ تيليجرام تمام! ✅
