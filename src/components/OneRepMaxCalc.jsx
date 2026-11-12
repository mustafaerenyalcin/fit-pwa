import React, { useState } from 'react';
import { Dumbbell, Target, Layers, Calculator, Zap, Sparkles } from 'lucide-react';
import { sounds } from '../lib/audio.js';
import { celebration } from '../lib/celebration.js';

const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export default function OneRepMaxCalc() {
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(6);
  const [barWeight, setBarWeight] = useState(20);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    sounds.success();
    celebration.sparks({ color: '#c8ff00', count: 28 });
    celebration.floatingBadge({ text: '1RM HESAPLANDI! ⚡', color: '#c8ff00', icon: '⚡' });
    const w = Number(weight) || 0;
    const r = Number(reps) || 0;
    const bW = Number(barWeight) || 20;

    if (w <= 0 || r <= 0) {
      setResult(null);
      return;
    }

    const brzycki = w / (1.0278 - 0.0278 * r);
    const epley = w * (1 + 0.0333 * r);
    const oneRepMax = r === 1 ? w : Math.round((brzycki + epley) / 2);

    const percentages = [
      { pct: 100, label: 'Maksimum Güç (1RM)', reps: '1 tekrar', zone: 'Saf Güç' },
      { pct: 95, label: 'Ağır Yüklenme', reps: '2 tekrar', zone: 'Güç' },
      { pct: 90, label: 'Nöral Adaptasyon', reps: '3–4 tekrar', zone: 'Güç / Hacim' },
      { pct: 85, label: 'Miyofibriler Hipertrofi', reps: '5–6 tekrar', zone: 'Temel Kuvvet' },
      { pct: 80, label: 'Optimal Kas Kütlesi', reps: '7–8 tekrar', zone: 'Hipertrofi' },
      { pct: 75, label: 'Metabolik Stres', reps: '9–10 tekrar', zone: 'Hipertrofi' },
      { pct: 70, label: 'Hacim & Kondisyon', reps: '11–12 tekrar', zone: 'Dayanıklılık' },
      { pct: 65, label: 'Pompalama / Dayanıklılık', reps: '13–15 tekrar', zone: 'Dayanıklılık' }
    ].map((item) => ({
      ...item,
      kg: Math.round((oneRepMax * item.pct) / 100)
    }));

    let targetOnPlates = Math.max(0, w - bW) / 2;
    const platesPerSide = [];
    for (const plate of AVAILABLE_PLATES) {
      const count = Math.floor(targetOnPlates / plate);
      if (count > 0) {
        platesPerSide.push({ plate, count });
        targetOnPlates -= count * plate;
      }
    }

    setResult({
      oneRepMax,
      percentages,
      platesPerSide,
      calcWeight: w,
      calcReps: r
    });
  };

  return (
    <div className="fx-stack fx-1rmStudio animate-fade-in">
      <div className="fx-cardHead">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={18} color="#ff4d1c" /> 1RM &amp; Olimpik Barbell Plaka Hesaplayıcı
          </h3>
          <p>Kaldırdığın ağırlık ve tekrar sayısından tahmini maksimum tek tekrarını (1RM) ve bara takılacak plakaları hesapla.</p>
        </div>
      </div>

      <div className="fx-grid2" style={{ gap: 14 }}>
        <div className="fx-card fx-glassModule">
          <span className="fx-subLabel">KALDIRILAN AĞIRLIK &amp; TEKRAR:</span>
          <div className="fx-grid2" style={{ marginTop: 10 }}>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>AĞIRLIK (KG)</span>
              <input
                type="number"
                min="1"
                max="500"
                step="2.5"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </label>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>TEKRAR (REPS)</span>
              <input
                type="number"
                min="1"
                max="25"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
              />
            </label>
          </div>

          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
            onClick={handleCalculate}
            style={{ marginTop: 14, fontWeight: 800 }}
          >
            <Calculator size={16} /> 1RM ve Plakaları Hesapla
          </button>

          <div className="fx-1rmHeroBox" style={{ marginTop: 16 }}>
            <small>TAHMİNİ 1RM (TEK TEKRAR MAKSİMUMU)</small>
            <div className="fx-1rmHeroVal">
              <b className="fx-monoVal">{result ? result.oneRepMax : '—'}</b> <span>KG</span>
            </div>
            <p>
              {result
                ? `${result.calcWeight} kg × ${result.calcReps} tekrar (Brzycki & Epley bilimsel formülü)`
                : 'Ağırlık ve tekrar girip "Hesapla" butonuna bas.'}
            </p>
          </div>
        </div>

        {/* BARA TAKILACAK PLAKALAR */}
        <div className="fx-card fx-glassModule">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="fx-subLabel">HER BİR TARAFA TAKILACAK PLAKALAR:</span>
            <small className="fx-muted">Bar: {barWeight}kg</small>
          </div>

          {result ? (
            <div className="animate-fade-in">
              <div className="fx-barbellVisual" style={{ marginTop: 12 }}>
                <div className="fx-barVisualLine">
                  <span className="fx-barSleeve" />
                  <div className="fx-platesStack">
                    {result.platesPerSide.map((p, idx) =>
                      Array.from({ length: p.count }).map((_, cIdx) => (
                        <span
                          key={`${idx}-${cIdx}`}
                          className={`fx-plateDisc plate-${p.plate}`}
                          title={`${p.plate} kg`}
                        >
                          {p.plate}
                        </span>
                      ))
                    )}
                  </div>
                  <span className="fx-barShaft" />
                </div>
              </div>

              <div className="fx-plateSummaryRow" style={{ marginTop: 14 }}>
                {result.platesPerSide.length > 0 ? (
                  result.platesPerSide.map((p) => (
                    <div key={p.plate} className="fx-platePill">
                      <b>{p.count}×</b> {p.plate} kg
                    </div>
                  ))
                ) : (
                  <small className="fx-muted">Sadece boş bar ({barWeight} kg)</small>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '42px 16px', textAlign: 'center', color: 'var(--fx-muted)', fontSize: 13 }}>
              <Zap size={30} style={{ opacity: 0.35, marginBottom: 8 }} />
              <p style={{ margin: 0 }}>Hesaplama yapıldığında bara takılacak olimpik plakalar burada görselleştirilecek.</p>
            </div>
          )}
        </div>
      </div>

      {/* YÜZDE DAĞILIM TABLOSU */}
      <div className="fx-card">
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--fx-muted)' }}>
          HEDEF BÖLGELERE GÖRE AĞIRLIK &amp; TEKRAR DAĞILIMI
        </h4>
        {result ? (
          <div className="fx-tableWrap animate-fade-in">
            <table className="fx-blueprintMatrixTable">
              <thead>
                <tr>
                  <th>YÜZDE</th>
                  <th>AĞIRLIK</th>
                  <th>HEDEF TEKRAR</th>
                  <th>ANTRENMAN ODAĞI</th>
                </tr>
              </thead>
              <tbody>
                {result.percentages.map((row) => (
                  <tr key={row.pct}>
                    <td>
                      <b>%{row.pct}</b>
                    </td>
                    <td>
                      <span className="fx-monoVal" style={{ color: '#00f0ff', fontWeight: 700 }}>
                        {row.kg} kg
                      </span>
                    </td>
                    <td>{row.reps}</td>
                    <td>
                      <span className="fx-tag">{row.zone}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="fx-muted fx-small" style={{ margin: 0, textAlign: 'center', padding: '16px' }}>
            Yüzde dağılımını görmek için yukarıdaki "1RM ve Plakaları Hesapla" butonuna bas.
          </p>
        )}
      </div>

      {/* SOVYET HALTER BİLİMİ & PRİLEPİN KURALI REHBERİ */}
      <div className="fx-card fx-scienceGuideBox">
        <div className="fx-scienceHead">
          <Sparkles size={16} color="#00f0ff" />
          <b>PRİLEPİN TABLOSU: OPTİMAL SET &amp; TEKRAR DENGESİ (1974 SOVYET ÇALIŞMASI)</b>
        </div>
        <div className="fx-scienceGrid">
          <div className="fx-scienceCol">
            <h4>📊 Aşırı Yorgunluk Olmadan Maksimum Güç</h4>
            <p>
              Sovyet spor bilimci A.S. Prilepin'in binlerce olimpik şampiyon üzerinde kanıtladığı kurala göre:
              <b> %70-80 1RM</b> ağırlıklarda seans başına toplam <b>18 tekrar</b> (örn: 6 set × 3 tekrar) yapmak,
              tükenişe gidilen 10 tekrarlı setlerden çok daha fazla saf güç ve kas fibrili uyarımı sağlar.
            </p>
          </div>
          <div className="fx-scienceCol">
            <h4>⚙️ RPE ve RIR (Reps in Reserve) Stratejisi</h4>
            <p>
              Hipertrofi için her sette tükenişe gitmek sinir sistemini (CNS) tüketir. İdeal gelişim için son sette 
              <b> RPE 8 (Cebinde 2 tekrar payı bırakarak)</b> durun. Ağırlığı artırmak yerine barın kalkış hızını (bar speed)
              korumak kasın nöral adaptasyonunu ikiye katlar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
