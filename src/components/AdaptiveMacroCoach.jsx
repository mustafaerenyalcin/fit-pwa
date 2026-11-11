import React, { useMemo, useState } from 'react';
import { Flame, ShoppingBag, CheckSquare, Square, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Card } from './ui.jsx';
import { calculateCalories, calculateTDEE } from '../lib/calculations.js';

const SHOPPING_ITEMS = [
  { id: 'yumurta', label: '30’lu Yumurta (Sabah & menemen için)', cat: 'Protein' },
  { id: 'tavuk', label: '1.5 kg Tavuk Göğsü / Bonfile', cat: 'Protein' },
  { id: 'suzme', label: '1 kg Süzme Yoğurt (Yüksek proteinli)', cat: 'Protein' },
  { id: 'lor', label: '500 g Yağsız / Tatlı Lor Peyniri', cat: 'Protein' },
  { id: 'ton', label: '3x Ton Balığı (Acil pratik öğün)', cat: 'Protein' },
  { id: 'kiyma', label: '500 g Az Yağlı Dana Kıyma / Köfte', cat: 'Protein' },
  { id: 'yulaf', label: '1 Paket Yulaf Ezmesi (500 g)', cat: 'Karbonhidrat' },
  { id: 'bulgur', label: '1 kg Pilavlık Bulgur / Basmati Pirinç', cat: 'Karbonhidrat' },
  { id: 'bakliyat', label: 'Kırmızı Mercimek & Haşlanmış Nohut/Fasulye', cat: 'Karbonhidrat' },
  { id: 'muz', label: 'Muz & Mevsim Meyvesi (Antrenman öncesi)', cat: 'Karbonhidrat' },
  { id: 'kuruyemis', label: 'Çiğ Badem / Ceviz & Doğal Fıstık Ezmesi', cat: 'Sağlıklı Yağ' },
  { id: 'yesillik', label: 'Yulaf/Salata için Roka, Maydanoz, Limon, Zeytinyağı', cat: 'Mikro Besin' }
];

export default function AdaptiveMacroCoach({ profile, entries, target }) {
  const [showShopping, setShowShopping] = useState(false);
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fit-shopping-checked')) || [];
    } catch {
      return [];
    }
  });

  const toggleShopItem = (id) => {
    const next = checkedItems.includes(id)
      ? checkedItems.filter((x) => x !== id)
      : [...checkedItems, id];
    setCheckedItems(next);
    try {
      localStorage.setItem('fit-shopping-checked', JSON.stringify(next));
    } catch {}
  };

  // Son 14 günün ortalama kalorisi ve kilo trendinden Adaptif TDEE tahmini
  const adaptive = useMemo(() => {
    const formulaTdee = calculateTDEE(profile) || 2350;
    const formulaTarget = calculateCalories(profile) || 2200;

    const mealByDay = {};
    for (const m of (entries.meal || []).slice(0, 80)) {
      mealByDay[m.day] = (mealByDay[m.day] || 0) + Number(m.payload?.calories || 0);
    }
    const validDays = Object.values(mealByDay).filter((kcal) => kcal >= 900);
    const avgIntake = validDays.length
      ? Math.round(validDays.reduce((a, b) => a + b, 0) / validDays.length)
      : null;

    const weights = (entries.weight || []).filter((w) => w.payload?.weight);
    let adaptiveTdee = formulaTdee;
    let statusText = 'Formül tabanlı başlangıç metabolizma hızı aktif.';

    if (validDays.length >= 4 && weights.length >= 2) {
      const latestW = Number(weights[0].payload.weight);
      const olderW = Number(weights[Math.min(weights.length - 1, 5)].payload.weight);
      const diffKg = latestW - olderW;
      // 1 kg değişim ~ 7700 kcal
      const dailyCalorieDelta = Math.round((diffKg * 7700) / 14);
      adaptiveTdee = Math.max(1400, Math.min(4200, avgIntake - dailyCalorieDelta));
      statusText = `Son kayıtlarına göre gerçek yakımın ~${adaptiveTdee} kcal/gün olarak kalibre edildi.`;
    }

    return {
      formulaTdee,
      adaptiveTdee,
      formulaTarget,
      avgIntake,
      loggedDays: validDays.length,
      statusText
    };
  }, [profile, entries.meal, entries.weight]);

  return (
    <Card
      title="Adaptif Metabolizma (TDEE) & Alışveriş Listesi"
      subtitle={adaptive.statusText}
      action={
        <button
          type="button"
          className="fx-btn fx-btn--ghost fx-btn--sm"
          onClick={() => setShowShopping((v) => !v)}
        >
          <ShoppingBag size={15} />
          {showShopping ? 'Listeyi Gizle' : 'Alışveriş Listesi'}
          {showShopping ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      }
    >
      <div className="fx-proCompGrid">
        <div className="fx-proCompStat">
          <span className="fx-eyebrow">GERÇEK YAKIM (TDEE)</span>
          <strong>{adaptive.adaptiveTdee} kcal</strong>
          <small className="fx-muted">Günlük toplam enerji harcaman</small>
        </div>
        <div className="fx-proCompStat">
          <span className="fx-eyebrow">ÖNERİLEN HEDEF</span>
          <strong>{adaptive.formulaTarget} kcal</strong>
          <small className="fx-muted">Protein: {target.protein} g / gün</small>
        </div>
        <div className="fx-proCompStat">
          <span className="fx-eyebrow">ORTALAMA ALIMIN</span>
          <strong>{adaptive.avgIntake ? `${adaptive.avgIntake} kcal` : '—'}</strong>
          <small className="fx-muted">{adaptive.loggedDays} tam gün kaydından</small>
        </div>
      </div>

      {showShopping && (
        <div className="fx-shoppingDrawer">
          <div className="fx-rowBetween" style={{ marginBottom: 10 }}>
            <b>🛒 Haftalık Yüksek Proteinli Sporcu Market Listesi</b>
            {checkedItems.length > 0 && (
              <button
                type="button"
                className="fx-btn fx-btn--text fx-btn--sm"
                onClick={() => {
                  setCheckedItems([]);
                  localStorage.removeItem('fit-shopping-checked');
                }}
              >
                Temizle ({checkedItems.length})
              </button>
            )}
          </div>
          <div className="fx-shoppingGrid">
            {SHOPPING_ITEMS.map((item) => {
              const done = checkedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`fx-shopItem ${done ? 'done' : ''}`}
                  onClick={() => toggleShopItem(item.id)}
                >
                  {done ? <CheckSquare size={17} className="fx-accentIcon" /> : <Square size={17} />}
                  <div>
                    <b>{item.label}</b>
                    <small>{item.cat}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
