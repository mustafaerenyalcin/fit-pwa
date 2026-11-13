import React, { useMemo, useState } from 'react';
import { Card, Ring } from './ui.jsx';
import { calculateUsNavyBodyFat } from '../lib/calculations.js';

/**
 * Profesyonel Vücut Kompozisyonu, Adonis Altın Oranı (Omuz/Bel = 1.618),
 * US Navy ↔ Pro BIA / Kaliper karşılaştırması, Yağ Oranı (%) ve FFMI Analizörü.
 */
export default function BodyCompositionPro({ profile, entries }) {
  const latestEntry = (entries.weight || [])[0]?.payload || {};
  const height = Number(profile.height) || 180;
  const weight = Number(latestEntry.weight || profile.weight) || 77;
  const waist = Number(latestEntry.waist) || 0;
  const shoulders = Number(latestEntry.shoulders) || 0;

  const [formulaMode, setFormulaMode] = useState('navy');
  const [neckCm, setNeckCm] = useState(() => String(latestEntry.neck || 38));
  const [hipCm, setHipCm] = useState(() => String(latestEntry.hip || 96));
  const [biaPct, setBiaPct] = useState(() => (profile.sex === 'female' ? '21.5' : '14.5'));

  const metrics = useMemo(() => {
    const hMeter = height / 100;

    // 1A. US Navy Ölçümü (Boyun + Bel [+ Kalça kadın]) veya yetersizse RFM hibrit tahmini
    let navyFat = calculateUsNavyBodyFat({
      sex: profile.sex === 'female' ? 'female' : 'male',
      heightCm: height,
      waistCm: waist,
      neckCm: Number(neckCm) || 38,
      hipCm: Number(hipCm) || 96
    });
    if (navyFat === null && waist > 45 && height > 120) {
      const sexFactor = profile.sex === 'female' ? 76 : 64;
      navyFat = Math.round((sexFactor - 20 * (height / waist)) * 10) / 10;
      navyFat = Math.max(5, Math.min(45, navyFat));
    }

    // 1B. Pro BIA / Kaliper (manuel ölçüm girdisi)
    const parsedBia = parseFloat(biaPct);
    const biaFat =
      !isNaN(parsedBia) && parsedBia >= 4 && parsedBia <= 50 ? Math.round(parsedBia * 10) / 10 : null;

    const bodyFat = formulaMode === 'bia' ? biaFat ?? navyFat : navyFat ?? biaFat;
    const formulaDiff =
      navyFat !== null && biaFat !== null ? Math.round((navyFat - biaFat) * 10) / 10 : null;

    // 2. Yağsız Kas Kütlesi (Lean Body Mass) ve FFMI
    const effectiveBf = bodyFat ?? (profile.sex === 'female' ? 22 : 15);
    const leanMass = Math.round(weight * (1 - effectiveBf / 100) * 10) / 10;
    const ffmi = Math.round((leanMass / (hMeter * hMeter) + 6.1 * (1.8 - hMeter)) * 10) / 10;

    let ffmiLabel = 'Başlangıç';
    if (ffmi >= 22) ffmiLabel = 'Elit Atletik';
    else if (ffmi >= 20) ffmiLabel = 'Kaslı / İleri';
    else if (ffmi >= 18.5) ffmiLabel = 'Atletik / Fit';

    // 3. Adonis İndeksi (Omuz / Bel Altın Oranı = 1.618)
    let adonis = null;
    let idealShoulder = null;
    let idealWaist = null;
    if (waist > 45) {
      idealShoulder = Math.round(waist * 1.618);
    }
    if (shoulders > 70 && waist > 45) {
      adonis = Math.round((shoulders / waist) * 100) / 100;
      idealWaist = Math.round(shoulders / 1.618);
    }

    // 4. Karın Kası Görünürlük Skoru (Six-Pack Visibility)
    let absScore = 50;
    let absStage = 'Bel ölçüsü eklendiğinde hesaplanır';
    if (bodyFat !== null) {
      if (bodyFat <= 11) {
        absScore = 96;
        absStage = 'Keskin 6-Pack Görünürlüğü (%8–11 yağ)';
      } else if (bodyFat <= 14) {
        absScore = 84;
        absStage = 'Üst ve Orta Karın Belirgin (%12–14 yağ)';
      } else if (bodyFat <= 17) {
        absScore = 68;
        absStage = 'Atletik Hatlar Başlangıcı (%15–17 yağ)';
      } else {
        absScore = 45;
        absStage = 'Definasyon Odaklı İlerleme (%18+ yağ)';
      }
    }

    return {
      navyFat,
      biaFat,
      formulaDiff,
      bodyFat,
      leanMass,
      ffmi,
      ffmiLabel,
      adonis,
      idealShoulder,
      idealWaist,
      absScore,
      absStage
    };
  }, [height, weight, waist, shoulders, profile.sex, formulaMode, neckCm, hipCm, biaPct]);

  const adonisPct = metrics.adonis
    ? Math.min(100, Math.round((metrics.adonis / 1.618) * 100))
    : 0;

  return (
    <Card
      tone="accent"
      title="Pro Vücut Kompozisyonu & Estetik Oranlar"
      subtitle="US Navy ↔ Pro BIA/Kaliper kıyaslaması, yağsız kas kütlesi (FFMI) ve Adonis altın oranı (1.618)"
      action={
        <div role="tablist" style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            role="tab"
            aria-selected={formulaMode === 'navy'}
            className={`fx-btn fx-btn--sm ${formulaMode === 'navy' ? 'fx-solarBtn' : 'fx-btn--ghost'}`}
            onClick={() => setFormulaMode('navy')}
          >
            US Navy Ölçüm
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={formulaMode === 'bia'}
            className={`fx-btn fx-btn--sm ${formulaMode === 'bia' ? 'fx-solarBtn' : 'fx-btn--ghost'}`}
            onClick={() => setFormulaMode('bia')}
          >
            Pro BIA / Kaliper
          </button>
        </div>
      }
    >
      {/* Formül Kalibrasyon & Kıyaslama Şeridi */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 10,
          marginBottom: 14,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--fx-border)'
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
          <span className="fx-muted">Boyun Çevresi (cm)</span>
          <input
            type="number"
            min="25"
            max="60"
            step="0.5"
            value={neckCm}
            onChange={(e) => setNeckCm(e.target.value)}
          />
        </label>
        {profile.sex === 'female' && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
            <span className="fx-muted">Kalça Çevresi (cm)</span>
            <input
              type="number"
              min="60"
              max="150"
              step="0.5"
              value={hipCm}
              onChange={(e) => setHipCm(e.target.value)}
            />
          </label>
        )}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
          <span className="fx-muted">BIA / Kaliper Yağ (%)</span>
          <input
            type="number"
            min="4"
            max="50"
            step="0.1"
            value={biaPct}
            onChange={(e) => setBiaPct(e.target.value)}
          />
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: 11 }}>
          <span className="fx-muted">Formül Kıyaslama</span>
          <b>
            {metrics.navyFat !== null ? `Navy %${metrics.navyFat}` : 'Bel ölçüsü eksik'} ·{' '}
            {metrics.biaFat !== null ? `BIA %${metrics.biaFat}` : '—'}
          </b>
          {metrics.formulaDiff !== null && (
            <small className="fx-muted">
              Fark: {metrics.formulaDiff > 0 ? `+${metrics.formulaDiff}` : metrics.formulaDiff} puan
            </small>
          )}
        </div>
      </div>

      <div className="fx-proCompGrid">
        <div className="fx-proCompStat">
          <span className="fx-eyebrow">TAHMİNİ YAĞ ORANI</span>
          <strong>{metrics.bodyFat !== null ? `%${metrics.bodyFat}` : '—'}</strong>
          <small className="fx-muted">
            {metrics.bodyFat !== null ? metrics.absStage : 'Bel ölçüsü girerek aktif et'}
          </small>
        </div>

        <div className="fx-proCompStat">
          <span className="fx-eyebrow">YAĞSIZ KÜTLE & FFMI</span>
          <strong>{metrics.leanMass} kg</strong>
          <small className="fx-muted">
            FFMI: <b>{metrics.ffmi}</b> ({metrics.ffmiLabel})
          </small>
        </div>

        <div className="fx-proCompStat">
          <span className="fx-eyebrow">ADONİS ORANI (OMUZ/BEL)</span>
          <strong>{metrics.adonis ? metrics.adonis : '—'}</strong>
          <small className="fx-muted">
            {metrics.adonis
              ? `Altın oran hedefi: 1.62 (${adonisPct}%)`
              : 'Omuz ve bel ölçüsü gir'}
          </small>
        </div>
      </div>

      {/* Karın Kası & Adonis Simetri Rehberi */}
      <div className="fx-symmetryBox">
        <div className="fx-symmetryLeft">
          <Ring value={metrics.absScore} max={100} size={68} stroke={7} color="var(--fx-accent)">
            <b>%{metrics.absScore}</b>
            <small>core</small>
          </Ring>
          <div>
            <b>Karın & Omuz Estetik Simetrisi</b>
            <p className="fx-muted fx-small" style={{ margin: '4px 0 0' }}>
              {metrics.adonis ? (
                metrics.adonis >= 1.58 ? (
                  <>
                    Harika V-taper formu! Omuz ({shoulders} cm) ve bel ({waist} cm) oranın altın
                    standarda çok yakın.
                  </>
                ) : (
                  <>
                    Altın oran (1.618) için mevcut bel ölçünle omuz hedefi{' '}
                    <b>{metrics.idealShoulder} cm</b> (şu an {shoulders} cm) veya mevcut omuzunla
                    bel hedefi <b>{metrics.idealWaist} cm</b>.
                  </>
                )
              ) : waist > 0 ? (
                <>
                  {waist} cm bel ölçün için altın oran omuz hedefi: <b>{metrics.idealShoulder} cm</b>.
                  Aşağıdan omuz ölçünü de ekleyerek V-taper skorunu gör.
                </>
              ) : (
                <>
                  Bel ve omuz çevreni kaydettiğinde karın kası görünürlük yüzdesi ve V-taper simetri
                  hedefin otomatik hesaplanır.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
