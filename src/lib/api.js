/**
 * Fit AI istemcisi
 * Tüm AI çağrıları sunucu fonksiyonuna (netlify/functions/fit-coach) gider.
 * API anahtarı ASLA istemcide bulunmaz; istek kullanıcının Supabase oturum token'ı ile doğrulanır.
 */

import { supabase, getAuthState } from './supabase.js';
import { getLang } from './i18n.js';

const PRODUCTION_ORIGIN = 'https://lighthearted-gaufre-61028a.netlify.app';

/**
 * Fonksiyonun tam adresi.
 * - Netlify'da yayınlanan sitede: aynı origin
 * - Yerel geliştirme (localhost) veya native uygulama (capacitor://, file://): canlı site
 */
export function getApiUrl() {
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase) return `${envBase.replace(/\/$/, '')}/.netlify/functions/fit-coach`;

  if (typeof window !== 'undefined') {
    const { protocol } = window.location;
    const isWeb = protocol === 'http:' || protocol === 'https:';
    if (isWeb) return '/.netlify/functions/fit-coach';
  }
  return `${PRODUCTION_ORIGIN}/.netlify/functions/fit-coach`;
}

export class AiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

async function getToken() {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) return data.session.access_token;
  }
  const { user } = getAuthState();
  if (user?.id) return `local:${user.id}`;
  return null;
}

/**
 * Sunucuya AI isteği gönderir.
 * @param {'chat'|'checkin'|'meal'|'meal_photo'|'weekly'|'program'} mode
 * @param {{ profile?: object, context?: string, question?: string, image?: string }} payload
 * @returns {Promise<{ answer?: string, data?: any, remaining?: number|null }>}
 */
export async function callAI(mode, payload = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new AiError('İnternet bağlantısı yok. AI özellikleri için çevrimiçi olmalısın.', 'OFFLINE');
  }

  const token = await getToken();
  if (!token) {
    throw new AiError('AI koçu kullanmak için giriş yapmalısın.', 'AUTH');
  }

  let resp;
  try {
    resp = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ mode, lang: getLang(), ...payload })
    });
  } catch {
    throw new AiError('Sunucuya ulaşılamadı. Bağlantını kontrol et.', 'NETWORK');
  }

  let body = {};
  try {
    body = await resp.json();
  } catch {
    /* boş yanıt */
  }

  if (!resp.ok) {
    throw new AiError(body.error || `AI isteği başarısız (${resp.status}).`, body.code || String(resp.status));
  }
  return body;
}

/* ------------------------------------------------------------------ */
/* Bağlam (context) üretimi: AI'a kullanıcının son verilerini özetler  */
/* ------------------------------------------------------------------ */

const isoDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Son N günün verilerinden kısa, okunabilir bir özet çıkarır.
 */
export function buildContext({ entries = {}, target = {}, totals = null, days = 7 } = {}) {
  const since = isoDaysAgo(days - 1);
  const inRange = (arr = []) => arr.filter((e) => e.day >= since);

  const workouts = inRange(entries.workout);
  const meals = inRange(entries.meal);
  const habits = inRange(entries.habit);
  const weights = (entries.weight || []).slice(0, 6);
  const checkins = inRange(entries.checkin);

  const mealDays = {};
  for (const m of meals) {
    const d = (mealDays[m.day] ||= { kcal: 0, p: 0 });
    d.kcal += Number(m.payload?.calories || 0);
    d.p += Number(m.payload?.protein || 0);
  }
  const loggedDays = Object.keys(mealDays).length;
  const avgKcal = loggedDays ? Math.round(Object.values(mealDays).reduce((a, x) => a + x.kcal, 0) / loggedDays) : 0;
  const avgProtein = loggedDays ? Math.round(Object.values(mealDays).reduce((a, x) => a + x.p, 0) / loggedDays) : 0;

  const sleeps = habits.map((h) => Number(h.payload?.sleep || 0)).filter(Boolean);
  const avgSleep = sleeps.length ? (sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1) : null;

  const lines = [
    `Son ${days} gün antrenman: ${workouts.length} seans` +
      (workouts.length ? ` (${workouts.slice(0, 6).map((w) => `${w.day} ${w.payload?.name || ''}`.trim()).join('; ')})` : ''),
    `Beslenme kaydı olan gün: ${loggedDays}/${days}` +
      (loggedDays ? `, ortalama ${avgKcal} kcal ve ${avgProtein} g protein (protein hedefi ${target.protein || '?'} g)` : ''),
    `Ortalama uyku: ${avgSleep ? `${avgSleep} saat` : 'kayıt yok'}`,
    `Son kilo/ölçüm kayıtları: ${
      weights.length
        ? weights.map((w) => `${w.day}: ${w.payload?.weight} kg${w.payload?.waist ? `, bel ${w.payload.waist} cm` : ''}`).join('; ')
        : 'kayıt yok'
    }`
  ];

  if (checkins.length) {
    lines.push(
      `Son check-in'ler: ${checkins
        .slice(0, 5)
        .map((c) => `${c.day} enerji=${c.payload?.energyLabel || c.payload?.energy}, uyku=${c.payload?.sleep || '?'}s`)
        .join('; ')}`
    );
  }
  if (totals) {
    lines.push(`Bugün şu ana kadar: ${totals.calories} kcal, ${totals.protein} g protein`);
  }
  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* Fotoğraf sıkıştırma                                                 */
/* ------------------------------------------------------------------ */

/**
 * Fotoğrafı en uzun kenarı maxSize px olacak şekilde küçültüp JPEG data URL döndürür.
 */
export function compressImage(file, maxSize = 1024, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Fotoğraf okunamadı.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Fotoğraf formatı desteklenmiyor.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
