# 🧪 قائمة تحقق نهائية

## ✅ ما تم إصلاحه

- [x] تعديل رابط API في `site/index.html`
- [x] تحديث `.env.example` مع تعليقات واضحة
- [x] إنشاء 5 ملفات توثيق شاملة
- [x] التحقق من أن الملفات موجودة

## 🎯 الخطوات القادمة (بالترتيب)

### أولاً: إعداد Cloudflare Worker (15 دقيقة)

- [ ] اذهب إلى https://dash.cloudflare.com
- [ ] اعمل حساب جديد (لو ما عندك)
- [ ] اختر **Workers & Pages**
- [ ] اضغط **Create Worker**
- [ ] اسمه: `kary-mo`
- [ ] اضغط **Deploy**

### ثانياً: رفع كود الـ Worker (5 دقائق)

- [ ] اضغط **Edit code**
- [ ] امسح الكود الموجود
- [ ] انسخ محتوى `cloudflare-worker.js`
- [ ] الصقه في الـ Worker
- [ ] اضغط **Deploy**

### ثالثاً: إضافة البيانات السرية (5 دقائق)

اذهب للـ Worker → **Settings** → **Variables and Secrets**

- [ ] أضف `TELEGRAM_BOT_TOKEN` (Secret)
  - القيمة: التوكن من BotFather
  
- [ ] أضف `TELEGRAM_CHAT_ID` (Secret)
  - القيمة: رقم الشات من getUpdates
  
- [ ] أضف `ALLOWED_ORIGIN` (Text)
  - القيمة: `https://mostafamaray056-arch.github.io`

### رابعاً: تحديث الموقع (5 دقائق)

- [ ] افتح `site/index.html`
- [ ] ادور على السطر اللي فيه `const API_URL`
- [ ] استبدل `REPLACE_WITH_YOUR_WORKER` برقم الـ Worker
  - مثال: `https://kary-mo.abc123.workers.dev/api/telegram/order`
- [ ] احفظ الملف

### خامساً: ارفع على GitHub (5 دقائق)

- [ ] ارفع `site/index.html` الجديد على GitHub Pages
- [ ] تأكد من أن الملف تم رفعه بنجاح

### سادساً: اختبر الموقع ✅

- [ ] افتح الموقع على الرابط: https://mostafamaray056-arch.github.io
- [ ] اضغط "بيع وشراء قلاع"
- [ ] ملا جميع البيانات
- [ ] اضغط "إرسال صورة الإعلان"
- [ ] تفقد تيليجرام
- [ ] يجب أن تصلك الصورة + التفاصيل ✅

## 🆘 لو حصلت مشكلة

| المشكلة | الحل |
|--------|------|
| الإعلان ما بيتبعتش | اقرأ TROUBLESHOOTING.md |
| "رابط Worker غلط" | تأكد من الرابط مكتوب صح |
| "CORS error" | تحقق من ALLOWED_ORIGIN |
| "توكن غلط" | انسخ التوكن من BotFather ثاني |

---

## 📞 التواصل لو احتجت مساعدة

- اقرأ **TROUBLESHOOTING.md** أولاً
- لو ما حصلت على الحل، اقول لي:
  - رسالة الخطأ كاملة
  - الخطوة اللي وقفت عندها
  - رابط الموقع بتاعك

---

## ✨ كل التوفيق!

الآن أنت جاهز. اتبع الخطوات فوق وهتشتغل كل حاجة بنجاح! 🚀
