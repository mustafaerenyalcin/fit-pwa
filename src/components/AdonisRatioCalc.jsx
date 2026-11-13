import React, { useState } from 'react';
import { Target, Award, Sparkles, TrendingUp, Check, Shield } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function AdonisRatioCalc({ profile }) {
  const [shoulder, setShoulder] = useState(122);
  const [waist, setWaist] = useState(79);
  const [chest, setChest] = useState(104);
  const [arm, setArm] = useState(38);
  const [result, setResult] = useState(null);

  const getTier = (ratio) => {
    if (ratio >= 1.58 && ratio <= 1.65) return { label: 'Adonis Zirve Altın Oran 1.618 (Grecian Ideal)', color: '#10b981' };
    if (ratio >= 1.50) return { label: 'Gelişmiş V-Taper Atletik Form', color: '#00f0ff' };
    if (ratio >= 1.40) return { label: 'Sağlam Temel Atletik Yapı', color: '#ff4d1c' };
    return { label: 'Başlangıç V-Taper Fazı', color: '#94a3b8' };
  };

  const handleCalculate = () => {
    sounds.success();
    const s = Number(shoulder) || 0;
    const w = Number(waist) || 0;

    if (w <= 0 || s <= 0) {
      setResult(null);
      return;
    }

    const currentRatio = Number((s / w).toFixed(3));
    const diff = Math.abs(currentRatio - 1.618);
    const matchPct = Math.max(50, Math.min(100, Math.round(100 - diff * 120)));
    const idealWaist = Math.round(s / 1.618);
    const idealShoulder = Math.round(w * 1.618);
    const tier = getTier(currentRatio);

    setResult({
      currentRatio,
      matchPct,
      idealWaist,
      idealShoulder,
      tier,
      calcShoulder: s,
      calcWaist: w
    });
  };

  return (
    <div className="fx-stack fx-adonisStudio animate-fade-in">
      <div className="fx-cardHead">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Award size={20} color="#ff4d1c" /> Adonis 1.618 Altın Oran &amp; V-Taper Analizörü
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
            Antik Yunan heykellerinden modern estetik vücut geliştirmeye kadar kabul gören omuz/bel altın oran algoritması.
          </p>
        </div>
      </div>

      <div className="fx-grid2" style={{ gap: 14 }}>
        {/* SOL: ÖLÇÜ GİRİŞLERİ */}
        <div className="fx-card fx-glassModule">
          <span className="fx-subLabel">BİYOMETRİK ÇEVRE ÖLÇÜLERİ (CM):</span>

          <div className="fx-grid2" style={{ marginTop: 10 }}>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>OMUZ ÇEVRESİ (CM) *</span>
              <input
                type="number"
                min="80"
                max="180"
                value={shoulder}
                onChange={(e) => setShoulder(Number(e.target.value))}
              />
            </label>

            <label className="fx-field" style={{ margin: 0 }}>
              <span>BEL ÇEVRESİ (CM) *</span>
              <input
                type="number"
                min="50"
                max="160"
                value={waist}
                onChange={(e) => setWaist(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="fx-grid2" style={{ marginTop: 12 }}>
            <label className="fx-field" style={{ margin: 0 }}>
              <span>GÖĞÜS ÇEVRESİ (CM)</span>
              <input
                type="number"
                min="70"
                max="180"
                value={chest}
                onChange={(e) => setChest(Number(e.target.value))}
              />
            </label>

            <label className="fx-field" style={{ margin: 0 }}>
              <span>KOL (BICEPS) ÇEVRESİ (CM)</span>
              <input
                type="number"
                min="20"
                max="65"
                value={arm}
                onChange={(e) => setArm(Number(e.target.value))}
              />
            </label>
          </div>

          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
            onClick={handleCalculate}
            style={{ marginTop: 14, fontWeight: 800 }}
          >
            <Sparkles size={16} /> Altın Oranı &amp; V-Taper Formunu Hesapla
          </button>
        </div>

        {/* SAĞ: HESAPLANAN SKOR KARTI */}
        <div className="fx-card fx-glassModule fx-adonisHeroCard">
          <small>MEVCUT OMUZ / BEL ORANIN</small>
          <div className="fx-adonisRatioVal">
            <b className="fx-monoVal">{result ? result.currentRatio : '—'}</b>
            <span>/ 1.618</span>
          </div>

          {result ? (
            <div className="animate-fade-in">
              <div className="fx-adonisStatusBadge" style={{ borderColor: result.tier.color, color: result.tier.color }}>
                <span>{result.tier.label}</span>
              </div>

              <div className="fx-adonisProgressBar">
                <span style={{ width: `${result.matchPct}%`, background: result.tier.color }} />
              </div>
              <small style={{ marginTop: 6, color: 'var(--fx-muted)', display: 'block' }}>
                Altın Orana Yakınlık Skoru: <b>%{result.matchPct}</b>
              </small>
            </div>
          ) : (
            <p style={{ margin: '14px 0 0', color: 'var(--fx-muted)', fontSize: 13 }}>
              Ölçülerini girip "Altın Oranı Hesapla" butonuna dokun.
            </p>
          )}
        </div>
      </div>

      {/* KALİBRASYON YOL HARİTASI */}
      <div className="fx-card">
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--fx-muted)' }}>
          1.618 ALTIN ORANA ULAŞMAK İÇİN HEDEF MATRİSİ
        </h4>
        {result ? (
          <div className="fx-grid2 animate-fade-in">
            <div className="fx-roadmapBox">
              <small>SENARYO A: MEVCUT OMUZLA ALTIN ORAN</small>
              <b>Hedef Bel: {result.idealWaist} cm</b>
              <p>
                Omuz genişliğini korurken bel çevresini {Math.abs(result.calcWaist - result.idealWaist)} cm{' '}
                {result.calcWaist > result.idealWaist ? 'inceltmen' : 'genişletmen'} gerekir.
              </p>
            </div>

            <div className="fx-roadmapBox">
              <small>SENARYO B: MEVCUT BELLE ALTIN ORAN</small>
              <b>Hedef Omuz: {result.idealShoulder} cm</b>
              <p>
                Belini korurken omuz başlarına {Math.abs(result.idealShoulder - result.calcShoulder)} cm kütle eklemen gerekir.
              </p>
            </div>
          </div>
        ) : (
          <p className="fx-muted fx-small" style={{ margin: 0, textAlign: 'center', padding: '14px' }}>
            Hedef bel ve omuz yol haritasını görmek için yukarıdaki "Altın Oranı Hesapla" butonuna bas.
          </p>
        )}
      </div>

      {/* KLASİK ESTETİK ANATOMİSİ: STEVE REEVES KANONU */}
      <div className="fx-card fx-scienceGuideBox">
        <div className="fx-scienceHead">
          <Sparkles size={16} color="#eab308" />
          <b>BİYOMEKANİK V-TAPER KANONU (STEVE REEVES &amp; FIBONACCI ORANTISI)</b>
        </div>
        <div className="fx-scienceGrid">
          <div className="fx-scienceCol">
            <h4>🏛️ Altın Oranı Yaratan 3 Anahtar Kas Grubu</h4>
            <p>
              V-Taper silueti sadece kilo vermekle oluşmaz. İllüzyonu yaratan 3 anatomik sütun vardır:
              <b> Lateral Deltoid (Yan Omuz)</b> omuz genişliğini dışa açar, 
              <b> Latissimus Dorsi (Kanat)</b> koltuk altından bele doğru açılan V çizgisi çizer, 
              <b> Transversus Abdominis (Vakum Kası)</b> beli korse gibi sıkılaştırır.
            </p>
          </div>
          <div className="fx-scienceCol">
            <h4>📐 Steve Reeves 1:1:1 Simetri Kuralı</h4>
            <p>
              Efsanevi doğal vücut geliştirici Steve Reeves'in klasik proporsiyon kuralına göre:
              <b> Kol Çevresi = Boyun Çevresi = Kalf Çevresi</b> olmalıdır. 
              Göğüs çevresi ise bel çevresinin tam <b>1.40 katı</b> olduğunda vücut heykelsi bir dengeye ulaşır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
