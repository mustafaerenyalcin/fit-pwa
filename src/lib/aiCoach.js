/**
 * Fit AI Coach - DeepSeek Engine
 * Communicates with Netlify serverless function or directly via DeepSeek API
 */

// API key is loaded from environment variable (VITE_DEEPSEEK_API_KEY) or localStorage at runtime

export async function askCoach(profile, summary, question) {
  if (!question || !question.trim()) {
    throw new Error('Lütfen bir soru yazın.');
  }

  // 1. First attempt: Netlify serverless function
  try {
    const netlifyResp = await fetch('/.netlify/functions/fit-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, summary, question })
    });

    if (netlifyResp.ok) {
      const netlifyData = await netlifyResp.json();
      if (netlifyData.answer) {
        return netlifyData.answer;
      }
    }
  } catch (_e) {
    // If not running on Netlify or function unreachable, fallback to direct DeepSeek call below
  }

  // 2. Direct DeepSeek fallback (Client-side with full CORS support)
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY ||
    (typeof window !== 'undefined' && localStorage.getItem('fit_deepseek_key'));

  if (!apiKey) {
    throw new Error('DeepSeek API anahtarı bulunamadı. Lütfen Netlify veya yerel ayarlarda DEEPSEEK_API_KEY tanımlayın.');
  }

  const systemPrompt = `Sen "Fit AI" adında profesyonel, bilimsel ve samimi bir kişisel spor ve beslenme koçusun.
Kullanıcı Profili:
- Boy: ${profile.height || 180} cm, Kilo: ${profile.weight || 77} kg
- Antrenman yeri: Ev, Ekipman: Dambıl (${profile.equipmentDumbbells || 'Mevcut dambıllar'})
- Deneyim: Spora ara verip geri dönen kullanıcı (ilk haftalarda kontrollü yüklenme ve eklem adaptasyonu önemli)
- Hedef: Atletik, kaslı, geniş omuzlu ve belirgin karın kaslarına sahip olmak (Öncelik: Omuz ve Karın)
- Haftalık Antrenman Sıklığı: 5 gün
- Takviyeler: Kreatin (günlük 3-5g), Protein Tozu (günlük hedefe göre), BCAA (protein yeterliyse ek faydası sınırlıdır, gereksiz tüketimi teşvik etme).

Kullanıcı Güncel Durumu ve Verileri:
${summary}

Davranış ve Yanıt Kuralların:
1. Türkçe, samimi, motive edici, net ve bilimsel konuş.
2. Omuz ve karın kası gelişimine özel form ipuçları ve progressive overload stratejileri sun.
3. Beslenme sorularında Türk mutfağından yüksek proteinli pratik öneriler ve tarifler üret.
4. Tıbbi teşhis koyma, kesin sağlık garantisi verme.
5. Kullanıcı bir antrenman veya beslenme değişikliği isterse öneriyi net ve uygulanabilir sun.
6. Yanıtlarını okunabilir maddeler, emojiler ve başlıklarla şık bir şekilde formatla.`;

  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`AI yanıt veremedi (${resp.status}): ${errorText}`);
  }

  const data = await resp.json();
  const answer = data.choices?.[0]?.message?.content;
  if (!answer) {
    throw new Error('Geçerli bir AI yanıtı alınamadı.');
  }

  return answer;
}
