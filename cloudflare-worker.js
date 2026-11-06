// KARY..MO — Cloudflare Worker
// ده "السيرفر الصغير" اللي بيستقبل الإعلان من الموقع (GitHub Pages) ويبعته لتليجرام.
// التوكن بيتحط في إعدادات الـ Worker كـ Secret، مش في الكود ولا في الموقع.
//
// Variables المطلوبة في Settings → Variables and Secrets:
//   TELEGRAM_BOT_TOKEN  (Secret)  توكن البوت من BotFather
//   TELEGRAM_CHAT_ID    (Secret)  رقم الشات اللي هيوصلك عليه الإعلان
//   ALLOWED_ORIGIN      (Text)    رابط موقعك، مثال: https://mostafamaray056-arch.github.io

const MAX_PHOTO_BYTES = 1_400_000;
const MAX_MESSAGE = 3500;

function cors(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(env, status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors(env) }
  });
}

async function telegram(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: typeof body === 'string' ? { 'Content-Type': 'application/json' } : undefined,
    body
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error('لم يتم إرسال الطلب. راجع إعدادات البوت وحاول مرة أخرى.');
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });

    const url = new URL(request.url);
    if (url.pathname !== '/api/telegram/order') return json(env, 404, { error: 'Not found' });
    if (request.method !== 'POST') return json(env, 405, { error: 'Method not allowed.' });

    const origin = request.headers.get('Origin');
    if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) {
      return json(env, 403, { error: 'Request origin is not allowed.' });
    }
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json(env, 503, { error: 'استقبال الطلبات غير جاهز حاليًا. حاول لاحقًا أو تواصل معنا.' });
    }

    let body;
    try { body = await request.json(); } catch { return json(env, 400, { error: 'Request body must be valid JSON.' }); }

    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > MAX_MESSAGE) return json(env, 400, { error: 'بيانات الإعلان فارغة أو أطول من المسموح.' });

    const match = typeof body?.photo === 'string'
      ? body.photo.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/)
      : null;
    if (!match) return json(env, 400, { error: 'صورة الإعلان غير صالحة. أعد المحاولة.' });
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
    if (bytes.length > MAX_PHOTO_BYTES) return json(env, 400, { error: 'صورة الإعلان كبيرة. أعد المحاولة.' });

    try {
      const form = new FormData();
      const useCaption = message.length <= 1024;
      form.set('chat_id', env.TELEGRAM_CHAT_ID);
      form.set('caption', useCaption ? message : '🏰 إعلان جديد — بيع قلعة');
      form.set('photo', new Blob([bytes], { type: `image/${match[1]}` }), `kary-mo-ad.${match[1] === 'jpeg' ? 'jpg' : 'png'}`);
      await telegram(env.TELEGRAM_BOT_TOKEN, 'sendPhoto', form);
      if (!useCaption) {
        await telegram(env.TELEGRAM_BOT_TOKEN, 'sendMessage', JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message }));
      }
    } catch (error) {
      return json(env, 502, { error: error.message });
    }
    return json(env, 200, { ok: true });
  }
};
