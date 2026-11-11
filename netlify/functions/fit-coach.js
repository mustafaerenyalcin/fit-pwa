/**
 * Netlify Serverless Function: fit-coach
 * Proxies AI Coach questions securely to DeepSeek API
 */

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { profile = {}, summary = '', question = '' } = JSON.parse(event.body || '{}');

    if (!question.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Soru boş olamaz.' })
      };
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Sunucuda DEEPSEEK_API_KEY ortam değişkeni tanımlanmamış.' })
      };
    }

    const systemPrompt = `Sen "Fit AI" adında profesyonel, bilimsel ve motive edici bir kişisel fitness ve beslenme koçusun.
Kullanıcı Profili:
- Boy: ${profile.height || 180} cm, Kilo: ${profile.weight || 77} kg
- Antrenman yeri: Ev, Ekipman: Dambıl (${profile.equipmentDumbbells || 'Mevcut ayarlanabilir dambıllar'})
- Deneyim: Spora ara verip geri dönen kullanıcı (ilk haftalarda kontrollü yüklenme ve eklem adaptasyonu önemli)
- Hedef: Atletik, kaslı, geniş omuzlu ve belirgin karın kaslarına sahip olmak (Öncelik: Omuz ve Karın)
- Haftalık Antrenman Sıklığı: 5 gün
- Takviyeler: Kreatin (günlük 3-5g), Protein Tozu (günlük hedefe göre), BCAA (protein yeterliyse ek faydası sınırlıdır, gereksiz tüketimi teşvik etme).

Kullanıcı Güncel Durumu ve Verileri:
${summary}

Davranış ve Yanıt Kuralların:
1. Türkçe, motive edici, net ve bilimsel konuş.
2. Omuz ve karın kası gelişimine özel form ipuçları ve progressive overload stratejileri sun.
3. Beslenme sorularında Türk mutfağından yüksek proteinli pratik öneriler ve tarifler üret.
4. Tıbbi teşhis koyma, kesin sağlık garantisi verme.
5. Kullanıcı bir antrenman veya beslenme değişikliği isterse öneriyi net ve uygulanabilir sun.
6. Yanıtlarını okunabilir maddeler, emojiler ve başlıklarla şık bir şekilde formatla.`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
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

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API Hatası: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Yanıt alınamadı.';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ answer })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err.message || 'Sunucu hatası oluştu.' })
    };
  }
}
