import React, { useState, useMemo } from 'react';
import { Dumbbell, Target, Layers, Calculator, Zap, Sparkles } from 'lucide-react';
import { Card } from './ui.jsx';
import { sounds } from '../lib/audio.js';

const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export default function OneRepMaxCalc() {
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(6);
  const [barWeight, setBarWeight] = useState(20);

  // Brzycki formula: 1RM = weight / (1.0278 - 0.0278 * reps)
  // Epley formula: 1RM = weight * (1 + 0.0333 * reps)
  const oneRepMax = useMemo(() => {
    if (!weight || !reps || reps <= 0) return 0;
    if (reps === 1) return Number(weight);
    const brzycki = weight / (1.0278 - 0.0278 * reps);
    const epley = weight * (1 + 0.0333 * reps);
    return Math.round((brzycki + epley) / 2);
  }, [weight, reps]);

  // % 1RM percentages table
  const percentages = useMemo(() => {
    if (!oneRepMax) return [];
    return [
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
  }, [oneRepMax]);

  // Barbell plate calculation per side
  const platesPerSide = useMemo(() => {
    let targetOnPlates = Math.max(0, weight - barWeight) / 2;
    const result = [];

    for (const plate of AVAILABLE_PLATES) {
      const count = Math.floor(targetOnPlates / plate);
      if (count > 0) {
        result.push({ plate, count });
        targetOnPlates -= count * plate;
      }
    }
    return result;
  }, [weight, barWeight]);

  return (
    <div className="fx-stack fx-1rmStudio">
      <div className="fx-cardHead">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={18} color="#ff4d1c" /> 1RM & Olimpik Barbell Plaka Hesaplayıcı
          </h3>
          <p>Kaldırdığın ağırlık ve tekrar sayısından tahmini maksimum tek tekrarını (1RM) ve bara takılacak plakaları anında hesapla.</p>
        </div>
      </div>

      <div className="fx-grid2" style={{ gap: 14 }}>
        <div className="fx-card fx-glassModule">
          <span className="fx-subLabel">KALDIRILAN AĞIRLIK & TEKRAR:</span>
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

          <div className="fx-1rmHeroBox" style={{ marginTop: 16 }}>
            <small>TAHMİNİ 1RM (TEK TEKRAR MAKSİMUMU)</small>
            <div className="fx-1rmHeroVal">
              <b className="fx-monoVal">{oneRepMax}</b> <span>KG</span>
            </div>
            <p>Brzycki &amp; Epley ortalaması baz alınmıştır.</p>
          </div>
        </div>

        {/* BARA TAKILACAK PLAKALAR */}
        <div className="fx-card fx-glassModule">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="fx-subLabel">HER BİR TARAFA TAKILACAK PLAKALAR:</span>
            <small className="fx-muted">Bar: {barWeight}kg</small>
          </div>

          <div className="fx-barbellVisual" style={{ marginTop: 12 }}>
            <div className="fx-barVisualLine">
              <span className="fx-barSleeve" />
              <div className="fx-platesStack">
                {platesPerSide.map((p, idx) =>
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
            {platesPerSide.length > 0 ? (
              platesPerSide.map((p) => (
                <div key={p.plate} className="fx-platePill">
                  <b>{p.count}×</b> {p.plate} kg
                </div>
              ))
            ) : (
              <small className="fx-muted">Sadece boş bar ({barWeight} kg)</small>
            )}
          </div>
        </div>
      </div>

      {/* YÜZDE DAĞILIM TABLOSU */}
      <div className="fx-card">
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--fx-muted)' }}>
          HEDEF BÖLGELERE GÖRE AĞIRLIK &amp; TEKRAR DAĞILIMI
        </h4>
        <div className="fx-tableWrap">
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
              {percentages.map((row) => (
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
