/**
 * Netlify Serverless Function: fit-coach
 *
 * Tüm AI çağrıları buradan geçer. API anahtarları YALNIZCA sunucuda (Netlify ortam değişkenleri) durur.
 *
 * Güvenlik:
 *  - Her istek Supabase oturum token'ı ile doğrulanır (Authorization: Bearer <access_token>).
 *  - Kullanıcı başına günlük AI kotası (public.ai_usage tablosu, RLS ile korunur).
 *
 * Modlar:
 *  - chat        : Serbest koç sohbeti (metin yanıt)
 *  - checkin     : Sabah check-in -> günün antrenman + beslenme planı (JSON)
 *  - meal        : Serbest metinden yemek analizi (JSON)
 *  - meal_photo  : Yemek fotoğrafından analiz (JSON, Gemini gerekir)
 *  - weekly      : Haftalık ilerleme raporu ve teşhis (JSON)
 *  - program     : Ekipmana göre haftalık program üretimi (JSON)
 *
 * Ortam değişkenleri (Netlify -> Site configuration -> Environment variables):
 *  - DEEPSEEK_API_KEY   (metin modları için; yoksa Gemini kullanılır)
 *  - GEMINI_API_KEY     (fotoğraf analizi için zorunlu; metin için de yedek)
 *  - GEMINI_MODEL       (opsiyonel, varsayılan: gemini-2.5-flash)
 *  - SUPABASE_URL       (opsiyonel, varsayılan proje URL'i)
 *  - SUPABASE_ANON_KEY  (opsiyonel, varsayılan publishable key)
 *  - AI_DAILY_LIMIT     (opsiyonel, varsayılan: 40)
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://igxwxfowdabiyvbcgjjp.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_QJM6xxpDpS49JTlq7OVl9A_MVLZLiJC';
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 40);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const MODES = new Set(['chat', 'checkin', 'meal', 'meal_photo', 'form_check', 'weekly', 'program']);
const MAX_BODY_BYTES = 4_500_000;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...CORS },
  body: JSON.stringify(body)
});

/* ------------------------------------------------------------------ */
/* Auth + kota                                                         */
/* ------------------------------------------------------------------ */

async function verifyUser(token) {
  if (!token) return null;
  if (token.startsWith('local:')) {
    const localId = token.slice(6).trim();
    return localId ? { id: localId, isLocal: true } : null;
  }
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
  });
  if (!resp.ok) return null;
  const user = await resp.json();
  return user?.id ? user : null;
}

/**
 * Bugünkü kullanım sayısını döndürür. Tablo henüz oluşturulmamışsa null döner (kota uygulanmaz).
 */
async function getTodayUsage(token, userId) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const url =
    `${SUPABASE_URL}/rest/v1/ai_usage?select=id&user_id=eq.${userId}` +
    `&created_at=gte.${encodeURIComponent(start.toISOString())}`;
  const resp = await fetch(url, {
    method: 'HEAD',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      Prefer: 'count=exact'
    }
  });
  if (!resp.ok) return null;
  const range = resp.headers.get('content-range') || '';
  const total = Number(range.split('/')[1]);
  return Number.isFinite(total) ? total : null;
}

async function recordUsage(token, userId, kind) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/ai_usage`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ user_id: userId, kind })
    });
  } catch (err) {
    console.error('[fit-coach] usage record failed', err);
  }
}

/* ------------------------------------------------------------------ */
/* Prompt'lar                                                          */
/* ------------------------------------------------------------------ */

const GOALS = {
  recomp: 'Kas kazanırken yağ oranını dengede tutmak (recomposition)',
  gain: 'Kas kütlesi artırmak (lean bulk)',
  cut: 'Kas kütlesini koruyarak yağ yakmak (definasyon)'
};
const FOCUS = {
  'shoulders-abs': 'Omuz ve karın',
  'upper-body': 'Tüm üst vücut',
  'glutes-legs': 'Bacak ve kalça',
  balanced: 'Tüm vücut dengeli'
};
const EXPERIENCE = {
  beginner: 'Yeni başlayan',
  returning: 'Spora ara verip geri dönen',
  intermediate: 'Orta / ileri seviye'
};
const SEX = { male: 'Erkek', female: 'Kadın' };

const clean = (v, max = 300) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

function profileBlock(p = {}) {
  return [
    `- İsim: ${clean(p.name, 40) || 'Belirtilmemiş'}`,
    `- Cinsiyet: ${SEX[p.sex] || 'Belirtilmemiş'}, Yaş: ${clean(p.age, 3) || 'Belirtilmemiş'}`,
    `- Boy: ${clean(p.height, 5) || '?'} cm, Kilo: ${clean(p.weight, 6) || '?'} kg`,
    `- Hedef: ${GOALS[p.goal] || GOALS.recomp}`,
    `- Öncelikli bölge: ${FOCUS[p.focus] || clean(p.focus, 60) || 'Dengeli'}`,
    `- Deneyim: ${EXPERIENCE[p.experience] || 'Belirtilmemiş'}`,
    `- Antrenman yeri: ${p.training === 'gym' ? 'Spor salonu' : 'Ev'}`,
    `- Ekipman: ${clean(p.equipmentDumbbells, 200) || 'Belirtilmemiş'}`,
    `- Haftalık antrenman günü: ${clean(p.trainingFrequency, 2) || 4}`,
    `- Sakatlık / hassasiyet: ${clean(p.injuries, 200) || 'Yok'}`,
    `- Beslenme tercihi: ${clean(p.diet, 80) || 'Standart Türk mutfağı'}`
  ].join('\n');
}

const BASE_RULES = `Sen "Fit Koç" adında, Türkçe konuşan, bilimsel ve samimi bir kişisel antrenör ve beslenme koçusun.
Kurallar:
- Her zaman Türkçe yaz. Samimi ama net ol, gereksiz uzatma.
- Önerilerini kullanıcının ekipmanına, seviyesine, hedefine ve sakatlıklarına göre kişiselleştir. Sakatlık varsa o bölgeyi zorlayan hareket önerme.
- Beslenmede Türk mutfağından gerçekçi, ulaşılabilir yiyecekler öner (yumurta, yoğurt, mercimek, tavuk, bulgur, lor, ton balığı vb.).
- Tıbbi teşhis koyma; ciddi ağrı veya sağlık sorunu varsa doktora yönlendir.
- Uydurma kesinlik verme; kalori/makro tahminlerinin yaklaşık olduğunu bil.`;

const MOVE_SCHEMA = `{"name":"Hareket adı (Türkçe/İngilizce yaygın ad)","muscle":"Çalışan kas","sets":"3 × 10-12","defaultSets":3,"restSeconds":60,"suggestedKg":"8","tip":"Tek cümlelik form ipucu","alternatives":["Alternatif 1","Alternatif 2"]}`;

const LANG_RULES = {
  tr: 'DİL KURALI: Tüm yanıtlarını ve JSON içindeki tüm metinleri Türkçe yaz. Beslenmede ulaşılabilir Türk mutfağı örnekleri ver.',
  en: 'LANGUAGE RULE: Write ALL responses and ALL text values inside JSON in English. Suggest realistic, accessible high-protein meals.',
  de: 'SPRACHREGEL: Schreibe ALLE Antworten und ALLE Textwerte im JSON auf Deutsch. Schlage realistische, proteinreiche Mahlzeiten vor.',
  es: 'REGLA DE IDIOMA: Escribe TODAS las respuestas y TODOS los textos dentro del JSON en Español. Sugiere comidas ricas en proteínas y accesibles.'
};

function buildPrompt(mode, body) {
  const p = body.profile || {};
  const lang = ['tr', 'en', 'de', 'es'].includes(body.lang) ? body.lang : 'tr';
  const ctx = clean(body.context, 4000);
  const q = clean(body.question, 2000);
  const header = `${BASE_RULES}\n${LANG_RULES[lang]}\n\nKullanıcı profili:\n${profileBlock(p)}\n\nKullanıcının güncel verileri:\n${ctx || 'Henüz kayıt yok.'}`;

  switch (mode) {
    case 'chat':
      return {
        system: `${header}\n\nYanıtlarını kısa başlıklar ve maddelerle, okunabilir şekilde yaz. En fazla ~250 kelime.`,
        user: q,
        json: false
      };

    case 'checkin':
      return {
        system: `${header}

Görev: Kullanıcı sabah check-in yaptı. Bugünkü durumuna göre GÜNÜN PLANINI kur.
- Enerji düşük / az uyku / ağrı varsa hacmi ve yoğunluğu azalt, ağrıyan bölgeyi çalıştırma.
- Süre kısıtlıysa hareket sayısını azalt, süperset öner.
- "Dinlenme" seçildiyse veya toparlanma gerekiyorsa workout'u null yap ve aktif dinlenme öner.
- Hareketler kullanıcının ekipmanıyla yapılabilir olmalı. suggestedKg kullanıcının dambıl ağırlıklarından biri olsun (vücut ağırlığıysa "0").
- 3 öğün/ara öğün fikri ver; günlük protein hedefine ulaşmaya odaklan.

SADECE şu JSON formatında yanıt ver:
{"headline":"Kısa motive edici başlık (max 8 kelime)","readiness":0-100 arası sayı,"message":"2-3 cümle: bugünkü durumunu nasıl yorumladığın ve stratejin","workout":{"name":"Antrenman adı","focus":"Odak","durationMin":35,"moves":[${MOVE_SCHEMA}]} veya null,"meals":[{"title":"Kahvaltı","idea":"Somut öneri","protein":30}],"tips":["Kısa ipucu 1","Kısa ipucu 2"]}`,
        user: q,
        json: true
      };

    case 'meal':
      return {
        system: `${header}

Görev: Kullanıcının yazdığı yemeği/öğünü analiz et. Türk porsiyon ölçülerini kullan (1 kepçe, 1 tabak, 1 dilim, 1 kase vb.).
SADECE şu JSON formatında yanıt ver:
{"items":[{"name":"Yemek adı","portion":"Porsiyon","calories":0,"protein":0,"carbs":0,"fat":0}],"category":"Kahvaltı|Öğle|Akşam|Ara Öğün","note":"Tek cümlelik yorum (protein yeterli mi vb.)"}
Sayılar tam sayı olsun.`,
        user: q,
        json: true
      };

    case 'meal_photo':
      return {
        system: `${header}

Görev: Fotoğraftaki yemekleri tanı ve porsiyonları tahmin et. Türk mutfağını iyi tanıyorsun. Emin değilsen en olası yemeği seç ve note'ta belirt.
SADECE şu JSON formatında yanıt ver:
{"items":[{"name":"Yemek adı","portion":"Tahmini porsiyon","calories":0,"protein":0,"carbs":0,"fat":0}],"category":"Kahvaltı|Öğle|Akşam|Ara Öğün","note":"Tek cümlelik yorum"}
Sayılar tam sayı olsun. Fotoğrafta yemek yoksa items boş dizi olsun ve note'ta açıkla.`,
        user: q || 'Bu fotoğraftaki öğünü analiz et.',
        json: true
      };

    case 'form_check':
      return {
        system: `${header}

Görev: Kullanıcının yüklediği egzersiz fotoğrafını/karesini biyomekanik açıdan değerlendir (Seçili hareket: ${clean(body.exerciseName, 80) || 'Antrenman'}).
Kurallar:
- Görüntüde gerçekten bir kişi ve egzersiz duruşu varsa eklem açıları, bel/omurga nötrlüğü, diz/dirsek hizalaması ve dengeyi objektif analiz edip 1.0–10.0 arası puanla.
- Eğer görsel çok karanlık, belirsiz veya içinde insan/egzersiz yoksa UYDURMA; valid:false döndür ve note içinde açıkla.
SADECE şu JSON formatında yanıt ver:
{"valid":true,"score":8.5,"riskLabel":"DÜŞÜK RİSK|ORTA RİSK|DİKKAT","joints":[{"name":"Ölçüt adı","status":"İyi|Orta|Dikkat","detail":"Gözlenen somut durum"}],"tips":["Somut düzeltme 1","Somut düzeltme 2","Somut düzeltme 3"],"note":"Kısa genel biyomekanik yorum"}`,
        user: q || `${clean(body.exerciseName, 80) || 'Egzersiz'} duruşumu ve eklem hizalamamı analiz et.`,
        json: true
      };

    case 'weekly':
      return {
        system: `${header}

Görev: Son 7 günün verilerine göre HAFTALIK İLERLEME RAPORU hazırla. Dürüst ol: ilerleme yoksa nedenini verilere dayanarak teşhis et (protein düşük, antrenman aksamış, uyku az, kalori dengesi hedefe uymuyor vb.). Veri eksikse bunu da belirt.
SADECE şu JSON formatında yanıt ver:
{"score":0-100 arası sayı,"headline":"Haftanın tek cümlelik özeti","wins":["İyi giden şey"],"issues":["Sorun"],"diagnosis":"2-3 cümle: neden ilerliyor/ilerlemiyor","actions":["Gelecek hafta için somut aksiyon 1","Aksiyon 2","Aksiyon 3"]}`,
        user: q || 'Bu haftaki ilerlememi analiz et.',
        json: true
      };

    case 'program':
      return {
        system: `${header}

Görev: Kullanıcı için 7 günlük (Pazartesi=0 ... Pazar=6) haftalık antrenman programı oluştur.
- Antrenman günü sayısı tam olarak kullanıcının haftalık gün sayısı kadar olsun, kalan günler dinlenme.
- Dinlenme günlerini antrenman günleri arasına dengeli dağıt.
- Her antrenman günü 4-6 hareket; öncelikli bölgeye haftada en az 2 kez vurgu yap.
- Tüm hareketler kullanıcının ekipmanıyla yapılabilir olmalı. suggestedKg kullanıcının sahip olduğu ağırlıklardan biri olsun (vücut ağırlığıysa "0").
- Seviyeye uygun set/tekrar seç; geri dönen/yeni başlayan için ilk haftalar kontrollü.
SADECE şu JSON formatında yanıt ver:
{"name":"Program adı","summary":"1-2 cümle açıklama","days":[{"dayIndex":0,"rest":false,"name":"Pazartesi · Üst Vücut","focus":"Odak kaslar","moves":[${MOVE_SCHEMA}]},{"dayIndex":5,"rest":true,"name":"Cumartesi · Dinlenme","focus":"Toparlanma","tips":["İpucu"]}]}
days dizisinde 0'dan 6'ya 7 gün olmalı.`,
        user: q || 'Bana uygun haftalık programı oluştur.',
        json: true
      };

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Sağlayıcılar                                                        */
/* ------------------------------------------------------------------ */

async function callDeepSeek({ system, user, json: wantJson }) {
  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: wantJson ? 0.4 : 0.7,
      max_tokens: wantJson ? 3000 : 1200,
      ...(wantJson ? { response_format: { type: 'json_object' } } : {})
    })
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`DeepSeek ${resp.status}: ${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini({ system, user, json: wantJson }, image) {
  const parts = [{ text: user }];
  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  }
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: wantJson ? 0.4 : 0.7,
          maxOutputTokens: wantJson ? 4000 : 1500,
          ...(wantJson ? { responseMimeType: 'application/json' } : {})
        }
      })
    }
  );
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Gemini ${resp.status}: ${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  return (data.candidates?.[0]?.content?.parts || []).map((x) => x.text || '').join('');
}

function parseJson(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error('AI yanıtı okunamadı.');
  }
}

function parseImage(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) return null;
  return { mimeType: m[1], data: m[2] };
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }
  if ((event.body || '').length > MAX_BODY_BYTES) {
    return json(413, { error: 'İstek çok büyük. Daha küçük bir fotoğraf dene.' });
  }

  // 1) Kimlik doğrulama
  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  let user;
  try {
    user = await verifyUser(token);
  } catch (err) {
    console.error('[fit-coach] auth error', err);
  }
  if (!user) {
    return json(401, { error: 'Oturum doğrulanamadı. Lütfen tekrar giriş yap.' });
  }

  // 2) İstek
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Geçersiz istek.' });
  }
  const mode = MODES.has(body.mode) ? body.mode : 'chat';
  if (mode === 'chat' && !clean(body.question)) {
    return json(400, { error: 'Soru boş olamaz.' });
  }

  const needsVision = mode === 'meal_photo' || mode === 'form_check';
  const image = needsVision ? parseImage(body.image) : null;
  if (needsVision && !image) {
    return json(400, { error: 'Görsel okunamadı (JPEG/PNG/WebP olmalı).' });
  }

  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  if (needsVision && !hasGemini) {
    return json(503, { error: 'Görüntü analizi (Vision AI) sunucuda yapılandırılmamış.', code: 'NO_VISION' });
  }
  if (!hasDeepSeek && !hasGemini) {
    return json(503, { error: 'AI servisi yapılandırılmamış.' });
  }

  // 3) Kota
  const used = user.isLocal ? null : await getTodayUsage(token, user.id).catch(() => null);
  if (used !== null && used >= DAILY_LIMIT) {
    return json(429, {
      error: `Bugünkü AI kullanım hakkın doldu (${DAILY_LIMIT}). Yarın tekrar dene.`,
      code: 'QUOTA'
    });
  }

  // 4) AI çağrısı
  const prompt = buildPrompt(mode, body);
  try {
    const useGemini = image || !hasDeepSeek;
    const text = useGemini ? await callGemini(prompt, image) : await callDeepSeek(prompt);

    if (!user.isLocal) await recordUsage(token, user.id, mode);
    const remaining = used === null ? null : Math.max(0, DAILY_LIMIT - used - 1);

    if (prompt.json) {
      return json(200, { data: parseJson(text), remaining });
    }
    return json(200, { answer: text || 'Yanıt alınamadı.', remaining });
  } catch (err) {
    console.error('[fit-coach] AI error', err);
    return json(502, { error: 'AI şu an yanıt veremedi. Biraz sonra tekrar dene.' });
  }
}
