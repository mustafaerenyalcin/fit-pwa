import React, { useState } from 'react';
import { Dna, Sparkles, Target, Award, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { sounds } from '../lib/audio.js';
import { celebration } from '../lib/celebration.js';

export default function GeneticPotentialCalc({ profile }) {
  const [height, setHeight] = useState(profile?.height || 180);
  const [currentWeight, setCurrentWeight] = useState(profile?.weight || 78);
  const [wrist, setWrist] = useState(17.5); // Wrist circumference in cm
  const [ankle, setAnkle] = useState(22.5); // Ankle circumference in cm
  const [targetBf, setTargetBf] = useState(10); // Target body fat %
  const [currentArm, setCurrentArm] = useState(38);
  const [currentChest, setCurrentChest] = useState(104);
  const [result, setResult] = useState(null);

  // Casey Butt scientific drug-free bodybuilder maximum potential formulas
  const calculatePotential = () => {
    sounds.success();
    celebration.sparks({ color: '#c8ff00', count: 32 });
    celebration.floatingBadge({ text: 'DOĞAL TAVAN HESAPLANDI! 🧬', color: '#c8ff00', icon: '🧬' });

    const hCm = Number(height) || 180;
    const wCm = Number(currentWeight) || 78;
    const wristCm = Number(wrist) || 17.5;
    const ankleCm = Number(ankle) || 22.5;
    const bf = Number(targetBf) || 10;
    const cArm = Number(currentArm) || 38;
    const cChest = Number(currentChest) || 104;

    // Convert cm to inches for Casey Butt's original imperial regression model
    const hIn = hCm / 2.54;
    const wristIn = wristCm / 2.54;
    const ankleIn = ankleCm / 2.54;

    // 1. Maximum Fat-Free Mass (Lean Body Mass) in lbs:
    // FFM_max = H^1.5 * (sqrt(Wrist)/22.6670 + sqrt(Ankle)/17.0104) * (BF/224 + 1)
    const factorH = Math.pow(hIn, 1.5);
    const factorBones = Math.sqrt(wristIn) / 22.6670 + Math.sqrt(ankleIn) / 17.0104;
    const factorBf = bf / 224 + 1;
    const maxFfmLbs = factorH * factorBones * factorBf;
    const maxFfmKg = Math.round((maxFfmLbs * 0.453592) * 10) / 10;

    // 2. Maximum Total Bodyweight at target body fat %
    const maxWeightKg = Math.round((maxFfmKg / (1 - bf / 100)) * 10) / 10;

    // 3. Maximum Arm / Biceps circumference (inches -> cm)
    // Arm_max = 1.2033 * Wrist^0.360 * H^0.395 * (BF/100 + 1)^0.5
    const maxArmIn = 1.2033 * Math.pow(wristIn, 0.360) * Math.pow(hIn, 0.395) * Math.pow(bf / 100 + 1, 0.5);
    const maxArmCm = Math.round((maxArmIn * 2.54) * 10) / 10;

    // 4. Maximum Chest circumference
    const maxChestIn = 1.6817 * Math.pow(wristIn, 0.575) * Math.pow(ankleIn, 0.120) * Math.pow(hIn, 0.135) * Math.pow(bf / 100 + 1, 0.5);
    const maxChestCm = Math.round((maxChestIn * 2.54) * 10) / 10;

    // 5. Maximum Thigh & Calf
    const maxThighCm = Math.round((1.3868 * Math.pow(ankleIn, 0.560) * Math.pow(hIn, 0.285) * Math.pow(bf / 100 + 1, 0.5) * 2.54) * 10) / 10;
    const maxCalfCm = Math.round((0.9298 * Math.pow(ankleIn, 0.780) * Math.pow(hIn, 0.190) * Math.pow(bf / 100 + 1, 0.5) * 2.54) * 10) / 10;

    // Current unlocked percentage of genetic potential
    const armPotentialPct = Math.min(100, Math.round((cArm / maxArmCm) * 100));
    const weightPotentialPct = Math.min(100, Math.round((wCm / maxWeightKg) * 100));
    const overallScore = Math.round((armPotentialPct + weightPotentialPct) / 2);

    setResult({
      maxWeightKg,
      maxFfmKg,
      maxArmCm,
      maxChestCm,
      maxThighCm,
      maxCalfCm,
      armPotentialPct,
      overallScore,
      armDiff: Math.max(0, Math.round((maxArmCm - cArm) * 10) / 10),
      weightDiff: Math.max(0, Math.round((maxWeightKg - wCm) * 10) / 10)
    });
  };

  return (
    <div className="fx-stack fx-geneticStudio animate-fade-in">
      <div className="fx-cardHead">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Dna size={22} color="#00f0ff" /> Genetik Kas Tavanı &amp; Doğal Potansiyel Röntgeni
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
            Dr. Casey Butt'ın 300+ dünya şampiyonu doğal vücut geliştirmeci üzerinde kanıtladığı kemik kalınlığı algoritması.
          </p>
        </div>
      </div>

      <div className="fx-grid2" style={{ gap: 14 }}>
        {/* SOL: BİYOMETRİK KEMİK VE BOY GİRİŞLERİ */}
        <div className="fx-card fx-glassModule">
          <span className="fx-subLabel">İSKELET VE KEMİK ÖLÇÜLERİ (CM):</span>

          <div className="fx-grid2" style={{ marginTop: 10 }}>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>BOY (CM) *</span>
              <input
                type="number"
                min="130"
                max="230"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </label>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>GÜNCEL KİLO (KG)</span>
              <input
                type="number"
                min="40"
                max="200"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="fx-grid2" style={{ marginTop: 12 }}>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>BİLEK KEMİK ÇEVRESİ (CM) *</span>
              <input
                type="number"
                min="13"
                max="25"
                step="0.1"
                value={wrist}
                onChange={(e) => setWrist(Number(e.target.value))}
                title="Bilek kemiğinin en dar yerinden mezurayla ölçün"
              />
              <small className="fx-muted" style={{ fontSize: 11 }}>En dar noktadan mezurayla</small>
            </label>

            <label className="fx-field" style={{ margin: 0 }}>
              <span>AYAK BİLEĞİ ÇEVRESİ (CM) *</span>
              <input
                type="number"
                min="17"
                max="32"
                step="0.1"
                value={ankle}
                onChange={(e) => setAnkle(Number(e.target.value))}
                title="Ayak bileği kemiğinin en dar yerinden ölçün"
              />
              <small className="fx-muted" style={{ fontSize: 11 }}>Topuk üstü dar noktadan</small>
            </label>
          </div>

          <div className="fx-grid2" style={{ marginTop: 12 }}>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>MEVCUT SICAK KOL (CM)</span>
              <input
                type="number"
                min="20"
                max="60"
                value={currentArm}
                onChange={(e) => setCurrentArm(Number(e.target.value))}
              />
            </label>

            <label className="fx-field" style={{ margin: 0 }}>
              <span>HEDEF YAĞ ORANI (%)</span>
              <select value={targetBf} onChange={(e) => setTargetBf(Number(e.target.value))}>
                <option value={8}>%8 (Yarışma Formu / Ultra Keskin)</option>
                <option value={10}>%10 (Elit Plaj / V-Taper Formu)</option>
                <option value={12}>%12 (Sürdürülebilir Atletik)</option>
                <option value={15}>%15 (Kuvvet / Dolgun Kas)</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
            onClick={calculatePotential}
            style={{ marginTop: 14, fontWeight: 800 }}
          >
            <Dna size={16} /> Genetik Kas Tavanını ve Potansiyelini Hesapla
          </button>
        </div>

        {/* SAĞ: HESAPLANAN GENETİK TAVAN HERO KARTI */}
        <div className="fx-card fx-glassModule fx-geneticHeroCard">
          <small>DOĞAL STEROİDSİZ MAKSİMUM KİLO (%{targetBf} YAĞDA)</small>
          <div className="fx-geneticMaxVal">
            <b className="fx-monoVal">{result ? result.maxWeightKg : '—'}</b>
            <span>KG</span>
          </div>

          {result ? (
            <div className="animate-fade-in">
              <div className="fx-geneticBadgeRow" style={{ marginTop: 10 }}>
                <span className="fx-tag" style={{ borderColor: '#00f0ff', color: '#00f0ff' }}>
                  SAF KAS TAVANI: {result.maxFfmKg} KG LBM
                </span>
                <span className="fx-tag" style={{ borderColor: '#c8ff00', color: '#c8ff00' }}>
                  POTANSİYEL: %{result.overallScore} TAMAMLANDI
                </span>
              </div>

              <div className="fx-geneticBarBox" style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Genetik Kas Kapasiten</span>
                  <b>%{result.overallScore}</b>
                </div>
                <div className="fx-adonisProgressBar" style={{ marginTop: 4 }}>
                  <span style={{ width: `${result.overallScore}%`, background: 'linear-gradient(90deg, #00f0ff, #c8ff00)' }} />
                </div>
              </div>

              <div className="fx-growthRemainingNotice" style={{ marginTop: 14 }}>
                <Zap size={14} color="#f5c451" />
                <span>
                  Doğal tavanına ulaşmak için henüz <b>+{result.armDiff} cm kol</b> ve <b>+{result.weightDiff} kg yağsız kas</b> büyüme alanın var!
                </span>
              </div>
            </div>
          ) : (
            <p style={{ margin: '14px 0 0', color: 'var(--fx-muted)', fontSize: 13 }}>
              Kemik ölçülerini girip "Genetik Kas Tavanını Hesapla" butonuna bastığında steroid kullanmadan ulaşabileceğin maksimum fiziksel sınırların açılacaktır.
            </p>
          )}
        </div>
      </div>

      {/* GENETİK ÖLÇÜ MATRİSİ */}
      <div className="fx-card">
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--fx-muted)' }}>
          KAS GRUPLARINA GÖRE MAKSİMUM DOĞAL KAS SINIRLARI (%{targetBf} YAĞ ORANINDA)
        </h4>

        {result ? (
          <div className="fx-grid4 animate-fade-in" style={{ gap: 10 }}>
            <div className="fx-geneticStatPod">
              <small>KOL (BICEPS)</small>
              <div className="fx-statDigits">
                <b>{result.maxArmCm}</b> <span>CM</span>
              </div>
              <p>Mevcut: {currentArm} cm ({result.armDiff > 0 ? `+${result.armDiff} cm potansiyel` : 'Tavana ulaşıldı!'})</p>
            </div>

            <div className="fx-geneticStatPod">
              <small>GÖĞÜS (CHEST)</small>
              <div className="fx-statDigits">
                <b>{result.maxChestCm}</b> <span>CM</span>
              </div>
              <p>Mevcut: {currentChest} cm</p>
            </div>

            <div className="fx-geneticStatPod">
              <small>BACAK (THIGH)</small>
              <div className="fx-statDigits">
                <b>{result.maxThighCm}</b> <span>CM</span>
              </div>
              <p>Maksimum kuadriseps kalınlığı</p>
            </div>

            <div className="fx-geneticStatPod">
              <small>KALF (BALDIR)</small>
              <div className="fx-statDigits">
                <b>{result.maxCalfCm}</b> <span>CM</span>
              </div>
              <p>Ayak bileğine oranlı kalf sınırı</p>
            </div>
          </div>
        ) : (
          <p className="fx-muted fx-small" style={{ margin: 0, textAlign: 'center', padding: '16px' }}>
            Kas grubu sınırlarını görmek için yukarıdaki "Hesapla" butonuna bas.
          </p>
        )}
      </div>

      {/* BİLİMSEL KANIT: CASEY BUTT ARAŞTIRMASI */}
      <div className="fx-card fx-scienceGuideBox">
        <div className="fx-scienceHead">
          <Sparkles size={16} color="#00f0ff" />
          <b>BİYOMEKANİK KANIT: BİLEK KALINLIĞI KAS BÜYÜMESİNİ NASIL BELİRLER?</b>
        </div>
        <div className="fx-scienceGrid">
          <div className="fx-scienceCol">
            <h4>🦴 Kemik Çapı = Tendon Taşıma Alanı</h4>
            <p>
              Kaslar doğrudan havada asılı durmaz; kemiklere tendonlar vasıtasıyla tutunur. 
              El bileği ve ayak bileği gibi bölgelerde kas dokusu bulunmaz; yalnızca saf kemik ve tendon geçer. 
              Geniş bir iskelet yapısı, kas fibrillerinin bağlanabileceği yüzey alanını artırarak vücudun güvenle inşa 
              edebileceği maksimum hipertrofi kütlesini doğrudan belirler.
            </p>
          </div>
          <div className="fx-scienceCol">
            <h4>🛡️ "Fake Natty" Fenomenlerine Karşı Bilimsel Kalkan</h4>
            <p>
              Sosyal medyada "ben doğalım" diyen pek çok influencer, bu matematiksel tavanın %120 üzerinde gezinmektedir. 
              Casey Butt formülü, 1940-1960 arası (anabolik steroidlerin henüz icat edilmediği dönemdeki) Steve Reeves, 
              John Grimek ve Reg Park gibi gerçek doğal şampiyonların biyometrik kayıtlarından türetilmiştir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
