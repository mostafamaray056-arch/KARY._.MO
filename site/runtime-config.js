const localHosts = new Set(['localhost', '127.0.0.1']);
window.KARY_AD_API_URL = localHosts.has(window.location.hostname)
  ? '/api/telegram/order'
  : 'https://kary-mo-telegram-api-056-arch.onrender.com/api/telegram/order';
