import React, { useState } from 'react';
import { Flame, Calculator, Sparkles, Target, Check, ChevronRight } from 'lucide-react';
import { sounds } from '../lib/audio.js';
import { calculateKatchMcArdleBMR, calculateCalorieCycleSplit } from '../lib/calculations.js';

export default function MetabolicEngineCalc({ profile, onApplyTarget }) {
  const [age, setAge] = useState(profile?.age || 26);
  const [sex, setSex] = useState(profile?.sex || 'male');
  const [height, setHeight] = useState(profile?.height || 180);
  const [weight, setWeight] = useState(profile?.weight || 78);
  const [bodyFat, setBodyFat] = useState(profile?.sex === 'female' ? 22 : 15);
  const [formula, setFormula] = useState('mifflin'); // 'mifflin' | 'katch'
  const [activity, setActivity] = useState(profile?.activity || 'medium');
  const [goalType, setGoalType] = useState('recomp'); // 'cut' | 'hard_cut' | 'recomp' | 'bulk'
  const [result, setResult] = useState(null);

  const computeMetrics = (a, s, h, w, act, goal, nextFormula = formula, nextBf = bodyFat) => {
    let bmr;
    let leanMass = null;
    if (nextFormula === 'katch') {
      const bfVal = Math.min(55, Math.max(4, Number(nextBf) || 15));
      leanMass = Math.round(w * (1 - bfVal / 100) * 10) / 10;
      bmr = calculateKatchMcArdleBMR(w, bfVal) || Math.round(10 * w + 6.25 * h - 5 * a + (s === 'female' ? -161 : 5));
    } else {
      const base = 10 * w + 6.25 * h - 5 * a;
      bmr = Math.round(s === 'female' ? base - 161 : base + 5);
    }

    const actMult = {
      low: 1.2,
      medium: 1.45,
      high: 1.725
    }[act] || 1.45;

    const tdee = Math.round(bmr * actMult);

    let targetKcal;
    switch (goal) {
      case 'hard_cut':
        targetKcal = Math.round(tdee - 600);
        break;
      case 'cut':
        targetKcal = Math.round(tdee - 400);
        break;
      case 'bulk':
        targetKcal = Math.round(tdee + 350);
        break;
      case 'recomp':
      default:
        targetKcal = Math.round(tdee - 100);
        break;
    }

    const proteinGrams = Math.round(w * 2.2);
    const fatGrams = Math.round((targetKcal * 0.25) / 9);
    const carbKcal = targetKcal - proteinGrams * 4 - fatGrams * 9;
    const carbGrams = Math.max(50, Math.round(carbKcal / 4));
    const cycle = calculateCalorieCycleSplit(targetKcal, proteinGrams, fatGrams, 150);

    return {
      bmr,
      tdee,
      targetKcal,
      formula: nextFormula,
      leanMass,
      cycle,
      macros: {
        protein: proteinGrams,
        fat: fatGrams,
        carbs: carbGrams
      }
    };
  };

  const handleCalculate = (nextGoal = goalType, nextFormula = formula) => {
    sounds.success();
    const a = Number(age) || 26;
    const h = Number(height) || 180;
    const w = Number(weight) || 78;

    const res = computeMetrics(a, sex, h, w, activity, nextGoal, nextFormula, bodyFat);
    setResult(res);
  };

  const changeGoal = (g) => {
    sounds.tap();
    setGoalType(g);
    if (result) {
      handleCalculate(g, formula);
    }
  };

  const changeFormula = (f) => {
    sounds.tap();
    setFormula(f);
    if (result) {
      handleCalculate(goalType, f);
    }
  };

  return (
    <div className="fx-stack fx-metabolicStudio animate-fade-in">
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
          <span className="fx-subLabel">HESAPLAMA FORMÜLÜ &amp; METABOLİK VERİLER:</span>

          <div
            role="tablist"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={formula === 'mifflin'}
              className={`fx-btn fx-btn--sm ${formula === 'mifflin' ? 'fx-solarBtn' : 'fx-btn--ghost'}`}
              onClick={() => changeFormula('mifflin')}
            >
              Mifflin-St Jeor
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={formula === 'katch'}
              className={`fx-btn fx-btn--sm ${formula === 'katch' ? 'fx-solarBtn' : 'fx-btn--ghost'}`}
              onClick={() => changeFormula('katch')}
            >
              Katch-McArdle (Yağsız Kütle)
            </button>
          </div>

          {formula === 'katch' && (
            <label className="fx-field" style={{ margin: '10px 0 0' }}>
              <span>TAHMİNİ VÜCUT YAĞ ORANI (%)</span>
              <input
                type="number"
                min="4"
                max="55"
                step="0.5"
                value={bodyFat}
                onChange={(e) => setBodyFat(Number(e.target.value))}
              />
            </label>
          )}

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

          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
            onClick={() => handleCalculate(goalType)}
            style={{ marginTop: 14, fontWeight: 800 }}
          >
            <Flame size={16} /> BMR ve Günlük Kalori İhtiyacını Hesapla
          </button>
        </div>

        {/* SAĞ: HESAPLANAN ENERJİ TABLOSU */}
        <div className="fx-card fx-glassModule fx-metabolicHeroCard">
          <div className="fx-metabolicTopRow">
            <div>
              <small>BAZAL METABOLİZMA (BMR)</small>
              <b className="fx-monoVal">{result ? result.bmr : '—'}</b> <span>kcal</span>
            </div>
            <div>
              <small>GÜNLÜK TÜKETİM (TDEE)</small>
              <b className="fx-monoVal" style={{ color: '#00f0ff' }}>{result ? result.tdee : '—'}</b> <span>kcal</span>
            </div>
          </div>

          <div className="fx-goalTypeSelector" style={{ marginTop: 14 }}>
            <span className="fx-subLabel">SPORCU STRATEJİNİ SEÇ:</span>
            <div className="fx-goalPillGroup" style={{ marginTop: 6 }}>
              {[
                { id: 'hard_cut', label: 'Agresif Definasyon (-600)' },
                { id: 'cut', label: 'Temiz Yağ Yakımı (-400)' },
                { id: 'recomp', label: 'Lean Recomp (-100)' },
                { id: 'bulk', label: 'Temiz Kas Kazanımı (+350)' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={goalType === g.id ? 'active' : ''}
                  onClick={() => changeGoal(g.id)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fx-targetKcalHero" style={{ marginTop: 16 }}>
            <small>GÜNLÜK HEDEF ENERJİ ALIMI</small>
            <div className="fx-targetKcalVal">
              <b className="fx-monoVal">{result ? result.targetKcal : '—'}</b> <span>KCAL / GÜN</span>
            </div>
            <p>
              {result
                ? `${goalType === 'bulk' ? 'Kas hipertrofisi için kalori fazlası' : 'Yağ yakımı için hedeflenen kalori açığı'} uygulandı.`
                : 'Verilerini girip yukarıdaki "Hesapla" butonuna bas.'}
            </p>
          </div>
        </div>
      </div>

      {/* MAKRO AYRIŞIMI KARTLARI */}
      <div className="fx-card">
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--fx-muted)' }}>
          GÜNLÜK ÖNERİLEN MAKRO BESİN DAĞILIMI
        </h4>
        {result ? (
          <>
            <div className="fx-grid3 animate-fade-in">
              <div className="fx-macroCard protein">
                <span className="fx-macroType">PROTEİN (2.2g / KG)</span>
                <strong>{result.macros.protein} g</strong>
                <small>{result.macros.protein * 4} kcal · Kas onarımı &amp; toparlanma</small>
              </div>
              <div className="fx-macroCard carbs">
                <span className="fx-macroType">KOMPLEKS KARBONHİDRAT</span>
                <strong>{result.macros.carbs} g</strong>
                <small>{result.macros.carbs * 4} kcal · Glikojen &amp; antrenman yakıtı</small>
              </div>
              <div className="fx-macroCard fat">
                <span className="fx-macroType">SAĞLIKLI YAĞ (%25)</span>
                <strong>{result.macros.fat} g</strong>
                <small>{result.macros.fat * 9} kcal · Hormon dengesi &amp; eklemler</small>
              </div>
            </div>

            {result.cycle && (
              <div
                className="fx-grid2 animate-fade-in"
                style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--fx-border)', gap: 10 }}
              >
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255, 107, 53, 0.08)', border: '1px solid rgba(255, 107, 53, 0.25)' }}>
                  <small style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#ff6b35' }}>
                    🔥 ANTRENMAN GÜNÜ (+150 KCAL · KARBONHİDRAT ODAKLI)
                  </small>
                  <b className="fx-monoVal" style={{ fontSize: 16 }}>{result.cycle.training.kcal} kcal</b>
                  <span className="fx-muted" style={{ fontSize: 12, display: 'block' }}>
                    Karb: <b>{result.cycle.training.carbs}g</b> · Pro: {result.cycle.training.protein}g
                  </span>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0, 240, 255, 0.06)', border: '1px solid rgba(0, 240, 255, 0.22)' }}>
                  <small style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#00f0ff' }}>
                    🧊 DİNLENME GÜNÜ (-150 KCAL · DÜŞÜK KARBONHİDRAT)
                  </small>
                  <b className="fx-monoVal" style={{ fontSize: 16 }}>{result.cycle.rest.kcal} kcal</b>
                  <span className="fx-muted" style={{ fontSize: 12, display: 'block' }}>
                    Karb: <b>{result.cycle.rest.carbs}g</b> · Pro: {result.cycle.rest.protein}g
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="fx-muted fx-small" style={{ margin: 0, textAlign: 'center', padding: '14px' }}>
            Önerilen makro ayrışımını görmek için "BMR ve Günlük Kalori İhtiyacını Hesapla" butonuna dokun.
          </p>
        )}
      </div>

      {/* KLİNİK METABOLİZMA BİLİMİ: BMR & METABOLİK ADAPTASYON */}
      <div className="fx-card fx-scienceGuideBox">
        <div className="fx-scienceHead">
          <Sparkles size={16} color="#ff4d1c" />
          <b>KLİNİK METABOLİZMA PROTOKOLÜ (MIFFLIN-ST JEOR &amp; ADAPTİF TERMOGENEZ)</b>
        </div>
        <div className="fx-scienceGrid">
          <div className="fx-scienceCol">
            <h4>🔬 Mifflin-St Jeor Neden Altın Standart?</h4>
            <p>
              Amerikan Diyetetik Derneği (ADA) klinik araştırmalarına göre Mifflin-St Jeor formülü, 
              eski Harris-Benedict formülüne kıyasla <b>%5 daha yüksek doğruluk payına</b> sahiptir. 
              Kas kütlesi arttıkça BMR doğal olarak yükselir çünkü 1 kg kas dokusu dinlenirken bile yağ dokusunun 
              3 katı kalori tüketir.
            </p>
          </div>
          <div className="fx-scienceCol">
            <h4>🛑 "Açlık Modu" Efsanesi &amp; NEAT Enerjisi</h4>
            <p>
              Metabolizma bir gecede durmaz. Aşırı düşük kalorili diyetlerde yaşanan duraklamanın asıl sebebi 
              metabolizmanın çökmesi değil, vücudun bilinçsizce <b>NEAT (Egzersiz Dışı Aktivite Termogenezi)</b> 
              enerjisini (hareketlilik, kıpırdanma, adımlar) %40'a varan oranda kısmasıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
