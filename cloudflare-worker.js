// KARY..MO — Cloudflare Worker
// Keep Telegram credentials and the administrator ID in Worker secrets.
// Bind a Cloudflare KV namespace named APP_DATA for saved settings and requests.

const MAX_PHOTO_BYTES = 1_400_000;
const MAX_MESSAGE = 3500;
const MAX_CONFIG_BYTES = 40_000;
const MAX_TELEGRAM_AUTH_AGE_SECONDS = 86_400;
const editableOptionKeys = new Set(['links', 'bag', 'resources', 'equipment']);
const editableQuestionKeys = new Set([
  'whatsapp', 'links', 'castle', 'science', 'reserve', 'seals',
  'heroes_infantry', 'heroes_chariots', 'heroes_cavalry', 'heroes_archers',
  'bag', 'resources', 'gold', 'bombs', 'farming', 'ignition', 'medals',
  'power', 'reset', 'equipment', 'price'
]);
const defaultWelcomeText = '👋 منوّر يمزرعة متجر KAREY...MO 🌱💚\n✨ متنساش تدخل جروب التليجرام عشان يوصلك كل جديد!\n🤖 استمتع بالبوت، ونتمنالك تجربة ممتعة! 😊';
const defaultBotPlans = [
  { id: 'month', title: 'شهر واحد', priceEgp: 320, priceUsd: 6, detail: '' },
  { id: 'two-months', title: 'شهرين', priceEgp: 480, priceUsd: 9, detail: 'بسعر شهر ونصف' },
  { id: 'three-months', title: '3 شهور + شهر هدية', priceEgp: 960, priceUsd: 18, detail: 'ادفع 3 شهور وخد شهر هدية' },
  { id: 'six-months', title: '6 شهور + شهرين هدية', priceEgp: 1920, priceUsd: 36, detail: 'ادفع 6 شهور وخد شهرين هدية' }
];

function cors(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-Init-Data',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function json(env, status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...cors(env)
    }
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

async function readJson(request, maxBytes = MAX_CONFIG_BYTES) {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new Error('حجم البيانات أكبر من المسموح.');
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('بيانات الطلب غير صالحة.');
  }
}

function toHex(bytes) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return mismatch === 0;
}

async function verifyTelegramUser(initData, token) {
  if (!initData || !token) return null;
  const params = new URLSearchParams(initData);
  const receivedHash = params.get('hash');
  const authDate = Number(params.get('auth_date'));
  const now = Math.floor(Date.now() / 1000);
  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)
    || !Number.isInteger(authDate)
    || authDate > now + 60
    || now - authDate > MAX_TELEGRAM_AUTH_AGE_SECONDS) return null;

  const dataCheckString = [...params.entries()]
    .filter(([key]) => key !== 'hash')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  if ([...params.keys()].length !== new Set(params.keys()).size) return null;
  const encoder = new TextEncoder();
  const webAppKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const secretKey = await crypto.subtle.sign('HMAC', webAppKey, encoder.encode(token));
  const validationKey = await crypto.subtle.importKey(
    'raw',
    secretKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const calculatedHash = toHex(await crypto.subtle.sign('HMAC', validationKey, encoder.encode(dataCheckString)));
  if (!safeEqual(calculatedHash.toLowerCase(), receivedHash.toLowerCase())) return null;

  try {
    const user = JSON.parse(params.get('user') || 'null');
    return user && /^\d+$/.test(String(user.id)) ? user : null;
  } catch {
    return null;
  }
}

async function authenticate(request, env, adminOnly = true) {
  if (!env.TELEGRAM_BOT_TOKEN) return { error: json(env, 503, { error: 'التحقق من حساب تيليجرام غير جاهز.' }) };
  const user = await verifyTelegramUser(request.headers.get('X-Telegram-Init-Data'), env.TELEGRAM_BOT_TOKEN);
  if (!user) return { error: json(env, 401, { error: 'افتح الموقع من داخل البوت على تيليجرام ثم حاول مرة أخرى.' }) };
  if (adminOnly && (!env.ADMIN_TELEGRAM_ID || String(user.id) !== String(env.ADMIN_TELEGRAM_ID))) {
    return { error: json(env, 403, { error: 'لوحة الإدارة للأدمن فقط.' }) };
  }
  return { user };
}

function defaultConfig() {
  return { welcomeText: defaultWelcomeText, botPlans: defaultBotPlans, questionOverrides: {} };
}

async function loadConfig(env) {
  if (!env.APP_DATA) return defaultConfig();
  const saved = await env.APP_DATA.get('public-config');
  if (!saved) return defaultConfig();
  let config;
  try {
    config = JSON.parse(saved);
  } catch {
    throw new Error('تعذر قراءة إعدادات المتجر المحفوظة.');
  }
  return {
    ...defaultConfig(),
    ...config,
    botPlans: Array.isArray(config.botPlans) ? config.botPlans : defaultBotPlans,
    questionOverrides: config.questionOverrides && typeof config.questionOverrides === 'object'
      ? config.questionOverrides
      : {}
  };
}

function validateConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const welcomeText = typeof value.welcomeText === 'string' ? value.welcomeText.trim() : '';
  if (!welcomeText || welcomeText.length > 1000) return null;
  if (!Array.isArray(value.botPlans) || value.botPlans.length < 1 || value.botPlans.length > 20) return null;
  const seenIds = new Set();
  const botPlans = [];
  for (const plan of value.botPlans) {
    if (!plan || typeof plan !== 'object'
      || typeof plan.id !== 'string'
      || !/^[a-z0-9-]{2,40}$/.test(plan.id)
      || seenIds.has(plan.id)
      || typeof plan.title !== 'string'
      || !plan.title.trim()
      || plan.title.length > 100
      || !Number.isFinite(plan.priceEgp)
      || plan.priceEgp < 0
      || plan.priceEgp > 100_000_000
      || !Number.isFinite(plan.priceUsd)
      || plan.priceUsd < 0
      || plan.priceUsd > 100_000
      || typeof (plan.detail || '') !== 'string'
      || (plan.detail || '').length > 240) return null;
    seenIds.add(plan.id);
    botPlans.push({
      id: plan.id,
      title: plan.title.trim(),
      priceEgp: plan.priceEgp,
      priceUsd: plan.priceUsd,
      detail: (plan.detail || '').trim()
    });
  }

  if (!value.questionOverrides || typeof value.questionOverrides !== 'object'
    || Array.isArray(value.questionOverrides)) return null;
  const questionOverrides = {};
  for (const [key, override] of Object.entries(value.questionOverrides)) {
    if (!editableQuestionKeys.has(key) || !override || typeof override !== 'object' || Array.isArray(override)) return null;
    const cleaned = {};
    for (const field of ['text', 'placeholder']) {
      if (override[field] !== undefined) {
        if (typeof override[field] !== 'string' || override[field].length > 300
          || (field === 'text' && !override[field].trim())) return null;
        cleaned[field] = override[field].trim();
      }
    }
    if (override.options !== undefined) {
      if (!editableOptionKeys.has(key)
        || !Array.isArray(override.options)
        || override.options.length > 50
        || override.options.some((option) => typeof option !== 'string' || !option.trim() || option.length > 100)) return null;
      cleaned.options = [...new Set(override.options.map((option) => option.trim()))];
    }
    questionOverrides[key] = cleaned;
  }
  return { welcomeText, botPlans, questionOverrides };
}

async function handleTelegramOrder(request, env) {
  if (request.method !== 'POST') return json(env, 405, { error: 'Method not allowed.' });
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json(env, 503, { error: 'استقبال الطلبات غير جاهز حاليًا. حاول لاحقًا أو تواصل معنا.' });
  }

  let body;
  try {
    body = await readJson(request, 2_000_000);
  } catch (error) {
    return json(env, 400, { error: error.message });
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > MAX_MESSAGE) return json(env, 400, { error: 'بيانات الإعلان فارغة أو أطول من المسموح.' });

  const match = typeof body?.photo === 'string'
    ? body.photo.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/)
    : null;
  if (!match) return json(env, 400, { error: 'صورة الإعلان غير صالحة. أعد المحاولة.' });
  const bytes = Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0));
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

async function handleSubscription(request, env) {
  if (request.method !== 'POST') return json(env, 405, { error: 'Method not allowed.' });
  if (!env.APP_DATA) return json(env, 503, { error: 'تخزين طلبات الاشتراك غير جاهز. راجع إعدادات الموقع.' });
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json(env, 503, { error: 'استقبال طلبات الاشتراك غير جاهز حاليًا.' });
  }

  const auth = await authenticate(request, env, false);
  if (auth.error) return auth.error;
  let body;
  try {
    body = await readJson(request, 4000);
  } catch (error) {
    return json(env, 400, { error: error.message });
  }

  const config = await loadConfig(env);
  const plan = config.botPlans.find((item) => item.id === body?.planId);
  if (!plan) return json(env, 400, { error: 'الباقة غير موجودة. حدّث الصفحة واختار باقة متاحة.' });

  const user = auth.user;
  const rateLimitKey = `subscription-rate:${user.id}`;
  const lastRequestAt = Number(await env.APP_DATA.get(rateLimitKey));
  if (Number.isFinite(lastRequestAt) && Date.now() - lastRequestAt < 30_000) {
    return json(env, 429, { error: 'استنى نصف دقيقة قبل إرسال طلب اشتراك آخر.' });
  }
  await env.APP_DATA.put(rateLimitKey, String(Date.now()), { expirationTtl: 60 });
  const order = {
    id: crypto.randomUUID(),
    planId: plan.id,
    planTitle: plan.title,
    priceEgp: plan.priceEgp,
    priceUsd: plan.priceUsd,
    telegramUserId: String(user.id),
    telegramUsername: typeof user.username === 'string' ? user.username.slice(0, 64) : '',
    customerName: typeof user.first_name === 'string' ? user.first_name.slice(0, 100) : '',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  await env.APP_DATA.put(`subscription:${order.id}`, JSON.stringify(order), { expirationTtl: 90 * 24 * 60 * 60 });
  const customer = order.telegramUsername ? `@${order.telegramUsername}` : order.customerName || 'بدون اسم';
  const text = [
    '🤖 طلب اشتراك بوت جديد',
    `الباقة: ${plan.title}`,
    `السعر: ${plan.priceEgp} جنيه أو ${plan.priceUsd} دولار`,
    `العميل: ${customer}`,
    `Telegram ID: ${order.telegramUserId}`,
    `رقم الطلب: ${order.id}`
  ].join('\n');

  try {
    await telegram(env.TELEGRAM_BOT_TOKEN, 'sendMessage', JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }));
  } catch {
    return json(env, 502, { error: 'حُفظ الطلب لكن تعذر تنبيه الإدارة على تيليجرام. حاول مرة أخرى أو تواصل مع المتجر.' });
  }
  return json(env, 200, { ok: true, orderId: order.id });
}

async function handleAdmin(request, env, pathname) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  if (pathname === '/api/admin/auth' && request.method === 'POST') return json(env, 200, { ok: true });
  if (!env.APP_DATA) return json(env, 503, { error: 'لوحة الإدارة تحتاج ربط مساحة Cloudflare KV باسم APP_DATA.' });

  if (pathname === '/api/admin/config' && request.method === 'GET') {
    try {
      return json(env, 200, { config: await loadConfig(env) });
    } catch (error) {
      return json(env, 500, { error: error.message });
    }
  }

  if (pathname === '/api/admin/config' && request.method === 'PUT') {
    let body;
    try {
      body = await readJson(request);
    } catch (error) {
      return json(env, 400, { error: error.message });
    }
    const config = validateConfig(body);
    if (!config) return json(env, 400, { error: 'راجع نص الترحيب والباقات وتفاصيل الأسئلة وحاول مرة أخرى.' });
    await env.APP_DATA.put('public-config', JSON.stringify(config));
    return json(env, 200, { ok: true, config });
  }

  if (pathname === '/api/admin/subscriptions' && request.method === 'GET') {
    let cursor;
    let hasMore = false;
    const keys = [];
    do {
      const page = await env.APP_DATA.list({ prefix: 'subscription:', limit: 1000, ...(cursor ? { cursor } : {}) });
      keys.push(...page.keys);
      hasMore = !page.list_complete;
      cursor = page.cursor;
    } while (hasMore && cursor);
    const allOrders = (await Promise.all(keys.map((key) => env.APP_DATA.get(key.name, 'json'))))
      .filter(Boolean)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    return json(env, 200, { orders: allOrders.slice(0, 100), hasMore: allOrders.length > 100 });
  }

  const orderMatch = pathname.match(/^\/api\/admin\/subscriptions\/([0-9a-f-]{36})$/i);
  if (orderMatch && request.method === 'PATCH') {
    let body;
    try {
      body = await readJson(request, 1000);
    } catch (error) {
      return json(env, 400, { error: error.message });
    }
    if (!['approved', 'rejected'].includes(body?.status)) {
      return json(env, 400, { error: 'حالة الطلب غير صالحة.' });
    }
    const key = `subscription:${orderMatch[1]}`;
    const order = await env.APP_DATA.get(key, 'json');
    if (!order) return json(env, 404, { error: 'الطلب غير موجود أو انتهت صلاحيته.' });
    order.status = body.status;
    order.updatedAt = new Date().toISOString();
    await env.APP_DATA.put(key, JSON.stringify(order), { expirationTtl: 90 * 24 * 60 * 60 });
    return json(env, 200, { ok: true, order });
  }

  return json(env, 405, { error: 'Method not allowed.' });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) {
      return json(env, 403, { error: 'Request origin is not allowed.' });
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });

    const { pathname } = new URL(request.url);
    if (pathname === '/api/telegram/order') return handleTelegramOrder(request, env);
    if (pathname === '/api/public/config' && request.method === 'GET') {
      try {
        const config = await loadConfig(env);
        return json(env, 200, { welcomeText: config.welcomeText, botPlans: config.botPlans, questionOverrides: config.questionOverrides });
      } catch (error) {
        return json(env, 500, { error: error.message });
      }
    }
    if (pathname === '/api/subscriptions') return handleSubscription(request, env);
    if (pathname.startsWith('/api/admin/')) return handleAdmin(request, env, pathname);
    return json(env, 404, { error: 'Not found' });
  }
};
