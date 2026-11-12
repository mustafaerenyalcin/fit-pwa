import React, { useState } from 'react';
import { Droplets, Plus, Zap, Heart, Sparkles, Check, Flame } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function HydrationSmartLab({ profile, entries, target }) {
  const [weight, setWeight] = useState(profile?.weight || 75);
  const [workoutMins, setWorkoutMins] = useState(45);
  const [tempMode, setTempMode] = useState('moderate'); // 'cool' | 'moderate' | 'hot'
  const [calculatedTarget, setCalculatedTarget] = useState(null);
  const [currentWater, setCurrentWater] = useState(1750);

  const computeTarget = (w, mins, temp) => {
    let base = w * 35;
    let sweat = mins * 12;
    let tempBonus = temp === 'hot' ? 600 : temp === 'cool' ? 0 : 250;
    return Math.round(base + sweat + tempBonus);
  };

  const handleCalculate = () => {
    sounds.success();
    const w = Number(weight) || 75;
    const mins = Number(workoutMins) || 0;
    const t = computeTarget(w, mins, tempMode);
    setCalculatedTarget(t);
  };

  const addWater = (amount) => {
    sounds.tap();
    setCurrentWater((prev) => prev + amount);
  };

  const resetWater = () => {
    sounds.tap();
    setCurrentWater(0);
  };

  const effectiveTarget = calculatedTarget || 2800;
  const progressPct = Math.min(100, Math.round((currentWater / effectiveTarget) * 100));

  return (
    <div className="fx-stack fx-hydrationStudio animate-fade-in">
      <div className="fx-cardHead">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Droplets size={20} color="#00f0ff" /> Akıllı Hidrasyon &amp; Elektrolit Laboratuvarı
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
            Vücut ağırlığı, antrenman süresi ve terleme faktörüne göre optimize edilmiş hücresel hidrasyon hedefi.
          </p>
        </div>
      </div>

      <div className="fx-grid2" style={{ gap: 14 }}>
        {/* SOL: HESAPLAMA PARAMETRELERİ */}
        <div className="fx-card fx-glassModule">
          <span className="fx-subLabel">HİDRASYON PARAMETRELERİ:</span>

          <div className="fx-field" style={{ marginTop: 10 }}>
            <span>VÜCUT AĞIRLIĞI (KG)</span>
            <input
              type="number"
              min="40"
              max="200"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>

          <div className="fx-field">
            <span>GÜNLÜK ANTRENMAN SÜRESİ (DAKİKA)</span>
            <div className="fx-miniPillPair" style={{ marginTop: 4 }}>
              {[0, 30, 45, 60, 90].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={workoutMins === m ? 'active' : ''}
                  onClick={() => {
                    sounds.tap();
                    setWorkoutMins(m);
                  }}
                >
                  {m === 0 ? 'Dinlenme' : `${m} dk`}
                </button>
              ))}
            </div>
          </div>

          <div className="fx-field">
            <span>HAVA SICAKLIĞI &amp; TERLEME SEVİYESİ</span>
            <div className="fx-miniPillPair" style={{ marginTop: 4 }}>
              <button
                type="button"
                className={tempMode === 'cool' ? 'active' : ''}
                onClick={() => setTempMode('cool')}
              >
                Serin
              </button>
              <button
                type="button"
                className={tempMode === 'moderate' ? 'active' : ''}
                onClick={() => setTempMode('moderate')}
              >
                Ilıman
              </button>
              <button
                type="button"
                className={tempMode === 'hot' ? 'active' : ''}
                onClick={() => setTempMode('hot')}
              >
                Sıcak
              </button>
            </div>
          </div>

          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
            onClick={handleCalculate}
            style={{ marginTop: 14, fontWeight: 800 }}
          >
            <Droplets size={16} /> Günlük Su İhtiyacını Hesapla
          </button>
        </div>

        {/* SAĞ: HİDRASYON SU VE DALGA KARTI */}
        <div className="fx-card fx-glassModule fx-hydrationWaveCard">
          <div className="fx-hydrationWaveVisual">
            <div className="fx-waveFill" style={{ height: `${progressPct}%` }} />
            <div className="fx-waveContent">
              <span className="fx-wavePct">%{progressPct}</span>
              <small>HÜCRESEL HİDRASYON</small>
            </div>
          </div>

          <div className="fx-hydrationMetaRow" style={{ marginTop: 16 }}>
            <div>
              <small>GÜNCEL İÇİLEN</small>
              <b className="fx-monoVal">{currentWater}</b> <span>ML</span>
            </div>
            <div>
              <small>HESAPLANAN HEDEF</small>
              <b className="fx-monoVal" style={{ color: '#00f0ff' }}>
                {calculatedTarget ? `${calculatedTarget} ML` : '—'}
              </b>
            </div>
          </div>

          {calculatedTarget ? (
            <div className="fx-quickWaterRow animate-fade-in" style={{ marginTop: 14 }}>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => addWater(250)}>
                <Plus size={13} /> 250 ml
              </button>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => addWater(500)}>
                <Plus size={13} /> 500 ml
              </button>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={resetWater}>
                Sıfırla
              </button>
            </div>
          ) : (
            <p style={{ margin: '14px 0 0', color: 'var(--fx-muted)', fontSize: 13, textAlign: 'center' }}>
              Hedefini görmek için soldaki "Hesapla" butonuna dokun.
            </p>
          )}
        </div>
      </div>

      {/* SPORCU HİDRASYONU & ELEKTROLİT DENGE BİLİMİ */}
      <div className="fx-card fx-scienceGuideBox">
        <div className="fx-scienceHead">
          <Sparkles size={16} color="#00b4d8" />
          <b>SPORCU HİDRASYONU &amp; ELEKTROLİT KANONU (ACSM BİLİMSEL PROTOKOLÜ)</b>
        </div>
        <div className="fx-scienceGrid">
          <div className="fx-scienceCol">
            <h4>⚡ %2 Sıvı Kaybı = %15 Güç Düşüşü</h4>
            <p>
              Amerikan Spor Hekimliği Koleji (ACSM) araştırmalarına göre, vücut ağırlığının sadece 
              <b> %2'si kadar su kaybedildiğinde</b> kas krampları başlar ve bench press / squat kuvveti 
              <b> %10 ila %15 düşer</b>. Hücreler dehidre olduğunda protein sentezi yavaşlar ve glikojen depolanması durur.
            </p>
          </div>
          <div className="fx-scienceCol">
            <h4>🧂 Sodyum, Potasyum &amp; Magnezyum Dengesi</h4>
            <p>
              Sadece saf su içmek yetmez; terle birlikte atılan sodyum ve potasyumu yerine koymak için 
              yoğun antrenman günlerinde <b>1 litre suya 1 çimdik Himalaya tuzu ve yarım limon</b> ekleyin. 
              Bu formül, kas içi osmotik basıncı koruyarak hücresel pompalamayı (pump) maksimuma taşır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
