import React, { useRef, useState } from 'react';
import { Camera, Sparkles, Loader2, Trash2, Check, X } from 'lucide-react';
import { callAI, compressImage } from '../lib/api.js';

const CATEGORIES = ['Kahvaltı', 'Öğle', 'Akşam', 'Ara Öğün'];

const guessCategory = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Kahvaltı';
  if (h < 16) return 'Öğle';
  if (h < 21) return 'Akşam';
  return 'Ara Öğün';
};

const toInt = (v) => Math.max(0, Math.round(Number(v) || 0));

/**
 * AI yemek kaydı: serbest metin ya da fotoğraf -> düzenlenebilir öğe listesi -> onayla ve kaydet.
 * AI sonucu kullanıcı onaylamadan kaydedilmez.
 */
export default function AiMealLogger({ profile, onAddMeal }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { items, category, note, photo }
  const fileRef = useRef(null);

  const analyzeText = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await callAI('meal', { profile, question: text.trim() });
      accept(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const analyzePhoto = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const image = await compressImage(file);
      const res = await callAI('meal_photo', { profile, image, question: text.trim() || undefined });
      accept(res.data, image);
    } catch (err) {
      setError(err.code === 'NO_VISION' ? err.message : `Fotoğraf analiz edilemedi: ${err.message}`);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const accept = (data = {}, photo = null) => {
    const items = (data.items || []).map((it) => ({
      name: String(it.name || 'Yemek'),
      portion: String(it.portion || ''),
      calories: toInt(it.calories),
      protein: toInt(it.protein),
      carbs: toInt(it.carbs),
      fat: toInt(it.fat)
    }));
    if (!items.length) {
      setError(data.note || 'Yemek tanınamadı. Biraz daha detaylı yazmayı dene.');
      return;
    }
    setResult({
      items,
      category: CATEGORIES.includes(data.category) ? data.category : guessCategory(),
      note: data.note || '',
      photo
    });
  };

  const updateItem = (i, key, value) =>
    setResult((r) => ({
      ...r,
      items: r.items.map((it, idx) => (idx === i ? { ...it, [key]: key === 'name' || key === 'portion' ? value : toInt(value) } : it))
    }));

  const removeItem = (i) => setResult((r) => ({ ...r, items: r.items.filter((_, idx) => idx !== i) }));

  const save = () => {
    for (const it of result.items) {
      onAddMeal({
        category: result.category,
        name: it.portion ? `${it.name} (${it.portion})` : it.name,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
        source: result.photo ? 'ai-photo' : 'ai-text'
      });
    }
    setResult(null);
    setText('');
  };

  const total = result?.items.reduce(
    (a, x) => ({ calories: a.calories + x.calories, protein: a.protein + x.protein, carbs: a.carbs + x.carbs, fat: a.fat + x.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (result) {
    return (
      <section className="fx-card fx-mealResult">
        <header className="fx-cardHead">
          <div>
            <h3>Bunu mu yedin?</h3>
            <p>Değerleri kontrol et, gerekirse düzelt ve kaydet.</p>
          </div>
          <button type="button" className="fx-iconBtn" onClick={() => setResult(null)} aria-label="Vazgeç">
            <X size={18} />
          </button>
        </header>

        {result.photo && <img src={result.photo} alt="Öğün fotoğrafı" className="fx-mealPhoto" />}

        <div className="fx-mealItems">
          {result.items.map((it, i) => (
            <div key={i} className="fx-mealItem">
              <div className="fx-mealItemTop">
                <input value={it.name} onChange={(e) => updateItem(i, 'name', e.target.value)} aria-label="Yemek adı" />
                <button type="button" className="fx-iconBtn" onClick={() => removeItem(i)} aria-label="Sil">
                  <Trash2 size={15} />
                </button>
              </div>
              <input className="fx-portion" value={it.portion} onChange={(e) => updateItem(i, 'portion', e.target.value)} aria-label="Porsiyon" />
              <div className="fx-macroInputs">
                {[
                  ['calories', 'kcal'],
                  ['protein', 'P g'],
                  ['carbs', 'K g'],
                  ['fat', 'Y g']
                ].map(([k, l]) => (
                  <label key={k}>
                    <input type="number" inputMode="numeric" value={it[k]} onChange={(e) => updateItem(i, k, e.target.value)} />
                    <small>{l}</small>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="fx-mealTotal">
          <b>{total.calories} kcal</b>
          <span>
            {total.protein} g protein · {total.carbs} g karb · {total.fat} g yağ
          </span>
        </div>
        {result.note && <p className="fx-muted fx-small">💬 {result.note}</p>}

        <div className="fx-choiceRow wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`fx-chip ${result.category === c ? 'active' : ''}`}
              onClick={() => setResult((r) => ({ ...r, category: c }))}
            >
              {c}
            </button>
          ))}
        </div>

        <button type="button" className="fx-btn fx-btn--primary fx-btn--block" onClick={save} disabled={!result.items.length}>
          <Check size={18} /> Kaydet
        </button>
      </section>
    );
  }

  return (
    <section className="fx-card fx-mealLogger">
      <header className="fx-cardHead">
        <div>
          <h3>
            <Sparkles size={16} className="fx-accentIcon" /> Ne yedin?
          </h3>
          <p>Yaz ya da fotoğrafını çek; kaloriyi ve proteini AI hesaplasın.</p>
        </div>
      </header>

      <div className="fx-mealInputRow">
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Örn: 1 tabak kuru fasulye, yarım tabak pilav, 1 kase cacık"
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              analyzeText();
            }
          }}
        />
      </div>

      {error && <div className="fx-alert fx-alert--error">{error}</div>}

      <div className="fx-mealActions">
        <button type="button" className="fx-btn fx-btn--ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Camera size={18} /> Fotoğraf
        </button>
        <button type="button" className="fx-btn fx-btn--primary fx-grow" onClick={analyzeText} disabled={busy || !text.trim()}>
          {busy ? <Loader2 size={18} className="fx-spin" /> : <Sparkles size={18} />}
          {busy ? 'Analiz ediliyor…' : 'Hesapla'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => analyzePhoto(e.target.files?.[0])}
        />
      </div>
    </section>
  );
}
