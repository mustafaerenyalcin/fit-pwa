import React, { useState, useMemo } from 'react';
import { Flame, Calculator, Sparkles, Target, Check, ChevronRight } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function MetabolicEngineCalc({ profile, onApplyTarget }) {
  const [age, setAge] = useState(profile?.age || 26);
  const [sex, setSex] = useState(profile?.sex || 'male');
  const [height, setHeight] = useState(profile?.height || 180);
  const [weight, setWeight] = useState(profile?.weight || 78);
  const [activity, setActivity] = useState(profile?.activity || 'medium');
  const [goalType, setGoalType] = useState('recomp'); // 'cut' | 'hard_cut' | 'recomp' | 'bulk'

  // BMR calculation (Mifflin-St Jeor)
  const bmr = useMemo(() => {
    let base = 10 * weight + 6.25 * height - 5 * age;
    return Math.round(sex === 'female' ? base - 161 : base + 5);
  }, [weight, height, age, sex]);

  // Activity multipliers
  const actMult = {
    low: 1.2,
    medium: 1.45,
    high: 1.725
  }[activity] || 1.45;

  const tdee = useMemo(() => Math.round(bmr * actMult), [bmr, actMult]);

  // Target kcal
  const targetKcal = useMemo(() => {
    switch (goalType) {
      case 'hard_cut':
        return Math.round(tdee - 600);
      case 'cut':
        return Math.round(tdee - 400);
      case 'bulk':
        return Math.round(tdee + 350);
      case 'recomp':
      default:
        return Math.round(tdee - 100);
    }
  }, [tdee, goalType]);

  // Macro calculation
  const macros = useMemo(() => {
    const proteinGrams = Math.round(weight * 2.2); // ~2.2g per kg
    const fatGrams = Math.round((targetKcal * 0.25) / 9); // 25% fat
    const carbKcal = targetKcal - proteinGrams * 4 - fatGrams * 9;
    const carbGrams = Math.max(50, Math.round(carbKcal / 4));
    return {
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbGrams
    };
  }, [weight, targetKcal]);

  return (
    <div className="fx-stack fx-metabolicStudio">
      <div className="fx-cardHead">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Flame size={20} color="#ff4d1c" /> Metabolik Motor &amp; TDEE Kalori Hesaplayıcı
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
            Mifflin-St Jeor klinik standardı ile BMR (Bazal Metabolizma) ve TDEE (Günlük Enerji Tüketimi) telemetrisi.
          </p>
        </div>
      </div>

      <div className="fx-grid2" style={{ gap: 14 }}>
        {/* SOL: GİRİŞLER */}
        <div className="fx-card fx-glassModule">
          <span className="fx-subLabel">METABOLİK VERİLER:</span>

          <div className="fx-grid2" style={{ marginTop: 10 }}>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>YAŞ</span>
              <input
                type="number"
                min="14"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </label>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>CİNSİYET</span>
              <select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
              </select>
            </label>
          </div>

          <div className="fx-grid2" style={{ marginTop: 12 }}>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>BOY (CM)</span>
              <input
                type="number"
                min="120"
                max="240"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </label>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>KİLO (KG)</span>
              <input
                type="number"
                min="35"
                max="250"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="fx-field" style={{ marginTop: 12 }}>
            <span>HAFTALIK HAREKET SEVİYESİ</span>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="low">Masa Başı / Sedanter (1.20)</option>
              <option value="medium">Orta Seviye Sporcu · Haftada 3-5 Gün (1.45)</option>
              <option value="high">Yüksek Yoğunluklu Atlet · Haftada 6+ Gün (1.72)</option>
            </select>
          </div>
        </div>

        {/* SAĞ: HESAPLANAN ENERJİ TABLOSU */}
        <div className="fx-card fx-glassModule fx-metabolicHeroCard">
          <div className="fx-metabolicTopRow">
            <div>
              <small>BAZAL METABOLİZMA (BMR)</small>
              <b className="fx-monoVal">{bmr}</b> <span>kcal</span>
            </div>
            <div>
              <small>GÜNLÜK TÜKETİM (TDEE)</small>
              <b className="fx-monoVal" style={{ color: '#00f0ff' }}>{tdee}</b> <span>kcal</span>
            </div>
          </div>

          <div className="fx-goalTypeSelector" style={{ marginTop: 14 }}>
            <span className="fx-subLabel">HEDEF SEÇİMİ:</span>
            <div className="fx-miniPillPair" style={{ marginTop: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={goalType === 'cut' ? 'active' : ''}
                onClick={() => setGoalType('cut')}
              >
                Definasyon (-400)
              </button>
              <button
                type="button"
                className={goalType === 'recomp' ? 'active' : ''}
                onClick={() => setGoalType('recomp')}
              >
                Rekompozisyon (-100)
              </button>
              <button
                type="button"
                className={goalType === 'bulk' ? 'active' : ''}
                onClick={() => setGoalType('bulk')}
              >
                Temiz Bulk (+350)
              </button>
              <button
                type="button"
                className={goalType === 'hard_cut' ? 'active' : ''}
                onClick={() => setGoalType('hard_cut')}
              >
                Agresif Cut (-600)
              </button>
            </div>
          </div>

          <div className="fx-targetKcalBig" style={{ marginTop: 14 }}>
            <small>ÖNERİLEN GÜNLÜK HEDEF ENERJİ</small>
            <div className="fx-targetDigits">
              <b className="fx-monoVal">{targetKcal}</b> <span>KCAL / GÜN</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAKRO BESİN DAĞILIMI */}
      <div className="fx-card">
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--fx-muted)' }}>
          HEDEFE ÖZEL GÜNLÜK MAKRO DAĞILIMI
        </h4>
        <div className="fx-grid3 fx-macroTrioGrid">
          <div className="fx-macroBox" style={{ borderColor: 'rgba(0, 240, 255, 0.4)' }}>
            <small style={{ color: '#00f0ff' }}>PROTEİN SENTEZİ</small>
            <b>{macros.protein} g</b>
            <span>{macros.protein * 4} kcal (%{Math.round((macros.protein * 400) / targetKcal)})</span>
          </div>

          <div className="fx-macroBox" style={{ borderColor: 'rgba(200, 255, 0, 0.4)' }}>
            <small style={{ color: '#c8ff00' }}>KOMPLEKS KARBONHİDRAT</small>
            <b>{macros.carbs} g</b>
            <span>{macros.carbs * 4} kcal (%{Math.round((macros.carbs * 400) / targetKcal)})</span>
          </div>

          <div className="fx-macroBox" style={{ borderColor: 'rgba(255, 77, 28, 0.4)' }}>
            <small style={{ color: '#ff4d1c' }}>ESANSİYEL SAĞLIKLI YAĞ</small>
            <b>{macros.fat} g</b>
            <span>{macros.fat * 9} kcal (%{Math.round((macros.fat * 900) / targetKcal)})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
