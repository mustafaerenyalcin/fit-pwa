import React, { useState, useMemo } from 'react';
import { Droplets, Plus, Zap, Heart, Sparkles, Check, Flame } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function HydrationSmartLab({ profile, entries, target }) {
  const [weight, setWeight] = useState(profile?.weight || 75);
  const [workoutMins, setWorkoutMins] = useState(45);
  const [tempMode, setTempMode] = useState('moderate'); // 'cool' | 'moderate' | 'hot'

  // Hydration calculation: base (35ml/kg) + workout sweat (12ml/min) + climate adjustment
  const calculatedTarget = useMemo(() => {
    let base = weight * 35;
    let sweat = workoutMins * 12;
    let tempBonus = tempMode === 'hot' ? 600 : tempMode === 'cool' ? 0 : 250;
    return Math.round(base + sweat + tempBonus);
  }, [weight, workoutMins, tempMode]);

  const [currentWater, setCurrentWater] = useState(1750);

  const addWater = (amount) => {
    sounds.tap();
    setCurrentWater((prev) => prev + amount);
  };

  const resetWater = () => {
    sounds.tap();
    setCurrentWater(0);
  };

  const progressPct = Math.min(100, Math.round((currentWater / calculatedTarget) * 100));

  return (
    <div className="fx-stack fx-hydrationStudio">
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
                Sıcak / Yoğun Ter
              </button>
            </div>
          </div>
        </div>

        {/* SAĞ: CANLI SU TANKI / ANİMASYONLU GÖSTERGE */}
        <div className="fx-card fx-glassModule fx-waterTankCard">
          <div className="fx-waterTankTop">
            <div>
              <small>HESAPLANAN GÜNLÜK HEDEF</small>
              <div className="fx-waterTankTargetVal">
                <b className="fx-monoVal">{(calculatedTarget / 1000).toFixed(2)}</b> <span>LİTRE</span>
              </div>
            </div>
            <div className="fx-waterCurrentBadge">
              <span>ŞU AN: <b>{(currentWater / 1000).toFixed(2)}L</b> (%{progressPct})</span>
            </div>
          </div>

          {/* DİKEY SU HAZNESİ */}
          <div className="fx-waterBeakerContainer">
            <div className="fx-waterWaveFill" style={{ height: `${progressPct}%` }}>
              <div className="fx-waterWave" />
            </div>
            <div className="fx-waterMarks">
              <span>%100</span>
              <span>%75</span>
              <span>%50</span>
              <span>%25</span>
            </div>
          </div>

          {/* HIZLI EKLE BUTONLARI */}
          <div className="fx-quickWaterRow">
            <button type="button" className="fx-quickWaterBtn" onClick={() => addWater(200)}>
              <Plus size={13} /> 200ml (Bardak)
            </button>
            <button type="button" className="fx-quickWaterBtn" onClick={() => addWater(330)}>
              <Plus size={13} /> 330ml (Şişe)
            </button>
            <button type="button" className="fx-quickWaterBtn" onClick={() => addWater(500)}>
              <Plus size={13} /> 500ml (Matara)
            </button>
            <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={resetWater}>
              Sıfırla
            </button>
          </div>
        </div>
      </div>

      {/* ELEKTROLİT REHBERİ */}
      <div className="fx-card">
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--fx-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={15} color="#c8ff00" /> KAS KRAMPI VE YORGUNLUK ÖNLEME ELEKTROLİT PROTOKOLÜ
        </h4>
        <div className="fx-grid2">
          <div className="fx-electrolyteBox">
            <b>Sodyum (Na+) · ~1000-2000 mg</b>
            <p>Terleme ile kaybedilen birincil mineral. Antrenman suyuna bir çimdik kaliteli kaya/deniz tuzu eklemek kas pompalamasını ve dayanıklılığı artırır.</p>
          </div>
          <div className="fx-electrolyteBox">
            <b>Potasyum (K+) &amp; Magnezyum (Mg2+)</b>
            <p>Kas kasılmaları ve kalp ritmi dengesi. 1 adet maden suyu veya muz ile antrenman sonrası tükenmiş depoları yenileyin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
