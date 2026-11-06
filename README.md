# KARY..MO — موقع المملكة (Mini App لبوت @Karey3_bot)

## الموقع بيعمل إيه
- **بيع وشراء قلاع:** الزبون بيملا الفورم، والموقع بيرسم **صورة إعلان** أوتوماتيك من بياناته (الإحصائيات، مواصفات القلعة، الأبطال بصورهم والأهلة، رقم العرض، العتاد).
- الصورة بتوصلك على تليجرام، و**تحتها رسالة** فيها التفاصيل اللي مش في الصورة: رقم العرض، واتساب صاحب الإعلان (ومعاه لينك تكلّمه منه على طول)، الروابط، الموارد، السعر.
- **رقم العرض** هو آخر 5 أرقام من واتساب الزبون.
- **البوتات:** بيعرض الباقات والأسعار. **الموارد والأحداث:** بيحوّلوا الزبون على واتساب.

## الملفات
| الملف | وظيفته |
|---|---|
| `site/index.html` | الموقع كله |
| `site/hero.jpg` | صورة المملكة |
| `site/hero-portraits/` | صور وشوش الأبطال (اسم الملف بالإنجليزي) |
| `cloudflare-worker.js` | السيرفر الصغير اللي بيبعت لتليجرام لو الموقع على **GitHub Pages** |
| `server.js` | نفس الشغل بس لو هتشغّل الموقع على سيرفر Node (Render / Railway / جهازك) |
| `get-chat-id.js` | بيجيبلك الـ Chat ID بتاعك |

> ⚠️ **ما ترفعش ملف `.env` على GitHub أبدًا**، ولا تبعته لحد، لأن فيه توكن البوت.

---

## الطريقة 1: الموقع على GitHub Pages + Cloudflare Worker (مجانًا)
GitHub Pages بيعرض الموقع بس، ومينفعش يبعت لتليجرام لوحده. عشان كده هنعمل Worker مجاني على Cloudflare يمسك التوكن ويبعت الإعلان.

1. ارفع محتوى فولدر `site/` على الريبو بتاع GitHub Pages، واستبدل بيه الملفات القديمة.
2. ادخل على **dash.cloudflare.com** واعمل حساب.
3. من القائمة اختار **Workers & Pages** ← **Create** ← **Create Worker**، وسمّيه مثلًا `kary-mo`، وبعدين **Deploy**.
4. دوس **Edit code**، امسح الكود اللي موجود، والصق مكانه محتوى `cloudflare-worker.js` كله، وبعدين **Deploy**.
5. ارجع للـ Worker وادخل على **Settings** ← **Variables and Secrets** وضيف:
   - `TELEGRAM_BOT_TOKEN` نوعه **Secret**: حط فيه توكن البوت.
   - `TELEGRAM_CHAT_ID` نوعه **Secret**: حط فيه الـ Chat ID بتاعك (شوف تحت إزاي تجيبه).
   - `ALLOWED_ORIGIN` نوعه **Text**: حط فيه `https://mostafamaray056-arch.github.io`
6. انسخ رابط الـ Worker (شكله كده: `https://kary-mo.xxxx.workers.dev`).
7. افتح `site/index.html` ودوّر على السطر ده:
   ```js
   const API_URL = '/api/telegram/order';
   ```
   وغيّره للرابط بتاع الـ Worker:
   ```js
   const API_URL = 'https://kary-mo.xxxx.workers.dev/api/telegram/order';
   ```
8. ارفع `index.html` تاني على GitHub. وبكده خلصت ✅

### إزاي تجيب الـ Chat ID
ابعت `/start` للبوت، وبعدين افتح الرابط ده في المتصفح، بعد ما تحط التوكن مكان `TOKEN`:
`https://api.telegram.org/botTOKEN/getUpdates`
هتلاقي `"chat":{"id":123456789` والرقم ده هو الـ Chat ID.
ولو معاك Node على جهازك، ممكن بدل ده تشغّل `node get-chat-id.js`.

---

## الطريقة 2: سيرفر Node (Render / Railway)
1. ارفع المشروع كله، **من غير** ملف `.env`.
2. حط `TELEGRAM_BOT_TOKEN` و `TELEGRAM_CHAT_ID` في الإعدادات السرية بتاعة الاستضافة.
3. أمر التشغيل هو `node server.js`. سيب `API_URL` زي ما هو.

## تعديلات سريعة جوه `index.html`
- أرقام المتجر اللي بتظهر في الصورة: `const STORE_PHONES = ['+201018351663'];` (تقدر تضيف رقم تاني).
- رقم واتساب المتجر في الأزرار: `const WHATSAPP_PHONE = "201018351663";`
