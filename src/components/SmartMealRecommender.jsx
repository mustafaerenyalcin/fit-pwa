import React, { useMemo } from 'react';
import { Utensils, Plus, CheckCircle2 } from 'lucide-react';
import { Card } from './ui.jsx';

const TURKISH_COMBOS = [
  {
    name: '150g Tavuk Göğsü + 1 Kase Süzme Yoğurt',
    desc: 'Yüksek protein, düşük kalori — akşam için ideal',
    calories: 380,
    protein: 58,
    carbs: 10,
    fat: 9,
    category: 'Akşam'
  },
  {
    name: '3 Yumurta Menemen + 100g Lor Peyniri',
    desc: 'Hızlı, ekonomik ve temiz protein',
    calories: 390,
    protein: 36,
    carbs: 8,
    fat: 22,
    category: 'Kahvaltı'
  },
  {
    name: '1 Kase Mercimek Çorbası + 150g Izgara Köfte',
    desc: 'Doyurucu geleneksel Türk öğünü',
    calories: 520,
    protein: 44,
    carbs: 32,
    fat: 22,
    category: 'Akşam'
  },
  {
    name: '160g Ton Balıklı Salata + 2 Dilim Tam Buğday',
    desc: 'Pişirme gerektirmez, 3 dakikada hazır',
    calories: 410,
    protein: 42,
    carbs: 30,
    fat: 11,
    category: 'Öğle'
  },
  {
    name: '200g Süzme Yoğurt + 1 Ölçek Whey / 30g Yulaf',
    desc: 'Antrenman sonrası hızlı protein takviyesi',
    calories: 310,
    protein: 38,
    carbs: 26,
    fat: 5,
    category: 'Ara Öğün'
  },
  {
    name: '100g Lor Peyniri + 1 Avuç Çiğ Badem',
    desc: 'Gece yatmadan önce kazein ağırlıklı hafif ara öğün',
    calories: 240,
    protein: 22,
    carbs: 5,
    fat: 14,
    category: 'Ara Öğün'
  }
];

/**
 * Kullanıcının kalan protein ve kalori hedefine göre en uygun 3 Türk mutfağı kombinasyonunu
 * sıralar ve tek dokunuşla öğün olarak kaydeder.
 */
export default function SmartMealRecommender({ totals, target, targetCalories = 2200, onAddMeal }) {
  const remProtein = Math.max(0, (target?.protein || 130) - (totals?.protein || 0));
  const remCalories = Math.max(0, targetCalories - (totals?.calories || 0));

  const suggestions = useMemo(() => {
    if (remProtein <= 5) return [];
    return [...TURKISH_COMBOS]
      .sort((a, b) => {
        const diffA = Math.abs(remProtein - a.protein) + Math.max(0, a.calories - remCalories) * 0.2;
        const diffB = Math.abs(remProtein - b.protein) + Math.max(0, b.calories - remCalories) * 0.2;
        return diffA - diffB;
      })
      .slice(0, 3);
  }, [remProtein, remCalories]);

  if (remProtein <= 5) {
    return (
      <Card tone="accent">
        <div className="fx-rowBetween">
          <div>
            <b>🎯 Günlük protein hedefine ulaştın!</b>
            <p className="fx-muted fx-small" style={{ margin: '4px 0 0' }}>
              Bugün toplam {totals.protein} g protein aldın. Kas onarımı için harika iş!
            </p>
          </div>
          <CheckCircle2 size={24} className="fx-accentIcon" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`Kalan ${remProtein} g protein için ne yesem?`}
      subtitle={`Hedefine ${remProtein} g protein ve ${remCalories} kcal kaldı. Tek dokunuşla ekle:`}
    >
      <div className="fx-comboList">
        {suggestions.map((item) => (
          <div key={item.name} className="fx-comboCard">
            <div className="fx-comboInfo">
              <b>{item.name}</b>
              <small className="fx-muted">{item.desc}</small>
              <div className="fx-comboBadges">
                <span className="fx-tag" style={{ color: '#7ee0ff' }}>
                  {item.protein} g protein
                </span>
                <span className="fx-tag">{item.calories} kcal</span>
              </div>
            </div>
            <button
              type="button"
              className="fx-btn fx-btn--ghost fx-btn--sm"
              onClick={() =>
                onAddMeal({
                  category: item.category,
                  name: item.name,
                  calories: item.calories,
                  protein: item.protein,
                  carbs: item.carbs,
                  fat: item.fat,
                  source: 'smart-combo'
                })
              }
            >
              <Plus size={15} /> Ekle
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
