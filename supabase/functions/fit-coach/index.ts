import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  if (req.method === 'OPTIONS') return new Response('', { headers: cors });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });

  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || ''
  );

  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token || '');

  if (error || !user) {
    return new Response(JSON.stringify({ error: 'Giriş gerekli' }), {
      status: 401,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { profile, summary, question } = await req.json();

    if (typeof question !== 'string' || !question.trim() || question.length > 1400) {
      throw new Error('Geçersiz soru metni');
    }

    const key = Deno.env.get('OPENAI_API_KEY');
    if (!key) {
      throw new Error('AI servis anahtarı (OPENAI_API_KEY) sunucu ortamında tanımlanmamış');
    }

    // Call OpenAI Chat Completions API with gpt-4o-mini
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 750,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `Sen "Fit" kişisel spor ve sağlık asistanısın. Türkçe yanıt ver.
Kullanıcının profili (180 cm, 77 kg, evde dambılla haftada 5 gün antrenman, omuz ve karın odaklı) ve son kayıtlarını analiz ederek motive edici, bilimsel, uygulanabilir ve güvenli tavsiyeler ver.
Hastalık teşhisi koyma, aşırı kalori kısıtlamaları veya gereksiz riskli takviye önerme.
Kullanıcıya önerdiğin program veya beslenme değişikliklerini açık ve net adımlarla sun.`
          },
          {
            role: 'user',
            content: `[Kullanıcı Profili]: ${JSON.stringify(profile).slice(0, 1600)}\n[Son Kayıt Özeti]: ${String(summary).slice(0, 1000)}\n[Soru]: ${question}`
          }
        ]
      })
    });

    const response = await r.json();
    if (!r.ok) {
      throw new Error(response.error?.message || 'OpenAI API isteği başarısız oldu');
    }

    const answer = response.choices?.[0]?.message?.content || 'Yanıt oluşturulamadı.';

    return new Response(JSON.stringify({ answer }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e) }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});