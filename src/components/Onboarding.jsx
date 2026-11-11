import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Check, Loader2, Flame, Utensils, Droplets, Dumbbell } from 'lucide-react';
import { Choice } from './ui.jsx';
import { generateProgram } from './ProgramGenerator.jsx';
import { calculateCalories, targets } from '../lib/calculations.js';

const EQUIPMENT = [
  ['bodyweight', 'Sadece vücut ağırlığı'],
  ['adjustable', 'Ayarlanabilir dambıl seti'],
  ['fixed', 'Sabit dambıllar'],
  ['bands', 'Direnç bandı'],
  ['pullup', 'Barfiks barı'],
  ['bench', 'Sehpa / bench'],
  ['kettlebell', 'Kettlebell'],
  ['gym', 'Tam donanımlı spor salonu']
];

const STEPS = [
  { id: 'who', title: 'Kimlik & Profil' },
  { id: 'body', title: 'Vücut Ölçüleri' },
  { id: 'goal', title: 'Hedef & Odak' },
  { id: 'gear', title: 'Ekipman & Sıklık' },
  { id: 'ready', title: 'AI Kalibrasyonu' }
];

export default function Onboarding({ initialProfile = {}, onComplete }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState({
    name: initialProfile.name || '',
    sex: initialProfile.sex || 'male',
    age: initialProfile.age || 26,
    height: initialProfile.height || 180,
    weight: initialProfile.weight || 77,
    goal: initialProfile.goal || 'recomp',
    focus: initialProfile.focus || 'shoulders-abs',
    experience: initialProfile.experience || 'returning',
    equipment: initialProfile.equipment || ['adjustable'],
    dumbbellWeights: initialProfile.dumbbellWeights || '2×5 kg, 2×10 kg',
    trainingFrequency: initialProfile.trainingFrequency || 5,
    injuries: initialProfile.injuries || '',
    diet: initialProfile.diet || ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setP((prev) => ({ ...prev, [k]: v }));
  const toggleEq = (id) =>
    set('equipment', p.equipment.includes(id) ? p.equipment.filter((x) => x !== id) : [...p.equipment, id]);

  // Canlı hesaplanan hedefler (kullanıcı değerleri değiştirdikçe anında güncellenir)
  const liveTargets = useMemo(() => {
    const kcal = calculateCalories({ ...p, activity: 'medium' }) || 2350;
    const t = targets(p);
    const waterL = ((Math.round((Number(p.weight || 75) * 35) / 100) * 100) / 1000).toFixed(1);
    return { kcal, protein: t.protein, waterL };
  }, [p]);

  const valid = [
    () => p.name.trim().length > 0,
    () => Number(p.height) >= 120 && Number(p.height) <= 230 && Number(p.weight) >= 30 && Number(p.weight) <= 250,
    () => !!p.goal && !!p.focus,
    () => p.equipment.length > 0,
    () => true
  ];

  const buildProfile = () => {
    const eqLabels = EQUIPMENT.filter(([id]) => p.equipment.includes(id)).map(([, l]) => l);
    const isGym = p.equipment.includes('gym');
    const equipmentText = [eqLabels.join(', '), p.dumbbellWeights && `Ağırlıklar: ${p.dumbbellWeights}`]
      .filter(Boolean)
      .join(' · ');
    return {
      ...initialProfile,
      name: p.name.trim(),
      sex: p.sex,
      age: Number(p.age) || 26,
      height: Number(p.height),
      weight: Number(p.weight),
      goal: p.goal,
      focus: p.focus,
      experience: p.experience,
      equipment: p.equipment,
      dumbbellWeights: p.dumbbellWeights,
      equipmentDumbbells: equipmentText,
      training: isGym ? 'gym' : 'home',
      trainingFrequency: Number(p.trainingFrequency),
      injuries: p.injuries.trim() || 'Yok',
      diet: p.diet,
      activity: initialProfile.activity || 'medium',
      water: initialProfile.water || Math.round((Number(p.weight) * 35) / 100) * 100,
      steps: initialProfile.steps || 8000,
      startWeight: initialProfile.startWeight || Number(p.weight),
      onboarded: true,
      onboardedAt: new Date().toISOString()
    };
  };

  const finish = async (withProgram) => {
    setError('');
    const profile = buildProfile();
    if (withProgram) {
      setBusy(true);
      try {
        await generateProgram(profile);
      } catch (err) {
        setBusy(false);
        setError(`AI programı şu an oluşturulamadı (${err.message}). Alttaki hazır program düğmesiyle hemen başlayabilirsin.`);
        return;
      }
    }
    await onComplete(profile);
  };

  const next = () => valid[step]() && setStep((s) => Math.min(STEPS.length - 1, s + 1));

  return (
    <div className="fx-authPro">
      <div className="fx-authBackdrop" aria-hidden="true">
        <div className="fx-orb fx-orb--green" />
        <div className="fx-orb fx-orb--blue" />
        <div className="fx-gridMesh" />
      </div>

      <div className="fx-onboardProCard">
        <div className="fx-onboardTop">
          <div className="fx-brandBadgeRow">
            <div className="fx-logo">
              fit<span>.</span>
            </div>
            <span className="fx-proPill">ADIM {step + 1} / {STEPS.length} · {STEPS[step].title.toUpperCase()}</span>
          </div>
          <div className="fx-stepper">
            {STEPS.map((s, i) => (
              <span key={s.id} className={i <= step ? 'on' : ''} />
            ))}
          </div>
        </div>

        {/* Canlı Kalibrasyon Özeti Barı */}
        <div className="fx-liveCalcStrip">
          <div>
            <Flame size={15} className="fx-accentIcon" />
            <span>Hedef Kalori: <b>{liveTargets.kcal} kcal</b></span>
          </div>
          <div>
            <Utensils size={15} style={{ color: '#7ee0ff' }} />
            <span>Günlük Protein: <b>{liveTargets.protein} g</b></span>
          </div>
          <div>
            <Droplets size={15} style={{ color: '#58a6ff' }} />
            <span>Su İhtiyacı: <b>{liveTargets.waterL} L</b></span>
          </div>
        </div>

        <div className="fx-onboardBody" key={step}>
          {step === 0 && (
            <>
              <h1>Seni tanıyalım.</h1>
              <p className="fx-muted">AI koçun sana isminle hitap edecek ve metabolizma hızını yaş/cinsiyetine göre kalibre edecek.</p>
              <label className="fx-proField" style={{ marginTop: 14 }}>
                <span>ADIN VEYA KULLANICI ADIN</span>
                <div className="fx-proInputWrap">
                  <input
                    autoFocus
                    style={{ paddingLeft: 16 }}
                    value={p.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Örn: Eren"
                  />
                </div>
              </label>

              <div className="fx-grid2" style={{ marginTop: 14 }}>
                <div className="fx-proField">
                  <span>BİYOLOJİK CİNSİYET</span>
                  <div className="fx-choiceRow">
                    <Choice compact active={p.sex === 'male'} onClick={() => set('sex', 'male')} title="Erkek" />
                    <Choice compact active={p.sex === 'female'} onClick={() => set('sex', 'female')} title="Kadın" />
                  </div>
                </div>
                <label className="fx-proField">
                  <span>YAŞ</span>
                  <div className="fx-proInputWrap">
                    <input
                      type="number"
                      inputMode="numeric"
                      style={{ paddingLeft: 16 }}
                      min="14"
                      max="90"
                      value={p.age}
                      onChange={(e) => set('age', e.target.value)}
                      placeholder="26"
                    />
                  </div>
                </label>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1>Vücut ölçülerin ve seviyen</h1>
              <p className="fx-muted">Üstteki canlı çubukta boy ve kilona göre makro hedeflerinin anında değiştiğini görebilirsin.</p>
              <div className="fx-grid2" style={{ marginTop: 14 }}>
                <label className="fx-proField">
                  <span>BOY (CM)</span>
                  <div className="fx-proInputWrap">
                    <input
                      type="number"
                      inputMode="numeric"
                      style={{ paddingLeft: 16 }}
                      value={p.height}
                      onChange={(e) => set('height', e.target.value)}
                      placeholder="180"
                    />
                  </div>
                </label>
                <label className="fx-proField">
                  <span>GÜNCEL KİLO (KG)</span>
                  <div className="fx-proInputWrap">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      style={{ paddingLeft: 16 }}
                      value={p.weight}
                      onChange={(e) => set('weight', e.target.value)}
                      placeholder="77"
                    />
                  </div>
                </label>
              </div>

              <div className="fx-proField" style={{ marginTop: 16 }}>
                <span>SPOR GEÇMİŞİN</span>
                <div className="fx-choiceCol">
                  <Choice active={p.experience === 'returning'} onClick={() => set('experience', 'returning')} title="Spora ara verip geri dönüyorum" desc="Kas hafızasını kontrollü yüklenmeyle devreye sokacağız" />
                  <Choice active={p.experience === 'beginner'} onClick={() => set('experience', 'beginner')} title="Yeni başlıyorum" desc="Temel form, eklem adaptasyonu ve düzenli alışkanlık" />
                  <Choice active={p.experience === 'intermediate'} onClick={() => set('experience', 'intermediate')} title="Düzenli antrenman yapıyorum" desc="Yüksek yoğunluk ve progressive overload odaklı" />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1>Ana hedefin ve öncelikli bölgen</h1>
              <div className="fx-choiceCol" style={{ marginTop: 12 }}>
                <Choice icon="⚖️" active={p.goal === 'recomp'} onClick={() => set('goal', 'recomp')} title="Atletik Kas & Yağ Kontrolü (Recomposition)" desc="Yağ oranını düşürürken temiz kas kütlesi kazan" />
                <Choice icon="💪" active={p.goal === 'gain'} onClick={() => set('goal', 'gain')} title="Hacim & Kas Kütlesi Artışı (Lean Bulk)" desc="Kontrollü kalori fazlası (+300 kcal) ile maksimum büyüme" />
                <Choice icon="🔥" active={p.goal === 'cut'} onClick={() => set('goal', 'cut')} title="Definasyon & Yağ Yakımı (Cut)" desc="Mevcut kasları koruyarak karın hatlarını belirginleştir (-400 kcal)" />
              </div>

              <div className="fx-proField" style={{ marginTop: 16 }}>
                <span>ÖNCELİKLİ ESTETİK ODAK</span>
                <div className="fx-choiceRow wrap">
                  <Choice compact active={p.focus === 'shoulders-abs'} onClick={() => set('focus', 'shoulders-abs')} title="🛡️ Geniş Omuz & Belirgin Karın" />
                  <Choice compact active={p.focus === 'upper-body'} onClick={() => set('focus', 'upper-body')} title="💪 Tüm Üst Vücut" />
                  <Choice compact active={p.focus === 'balanced'} onClick={() => set('focus', 'balanced')} title="⚡ Tüm Vücut Dengeli" />
                  <Choice compact active={p.focus === 'glutes-legs'} onClick={() => set('focus', 'glutes-legs')} title="🦵 Bacak & Kalça" />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1>Ekipmanların ve antrenman sıklığın</h1>
              <p className="fx-muted">Hareketlerin ve önerilen başlangıç kiloların tamamen seçtiğin ekipmana göre kurulur.</p>
              <div className="fx-choiceRow wrap" style={{ marginTop: 12 }}>
                {EQUIPMENT.map(([id, label]) => (
                  <Choice key={id} compact active={p.equipment.includes(id)} onClick={() => toggleEq(id)} title={label} />
                ))}
              </div>

              {(p.equipment.includes('adjustable') || p.equipment.includes('fixed') || p.equipment.includes('kettlebell')) && (
                <label className="fx-proField" style={{ marginTop: 14 }}>
                  <span>KULLANABİLECEĞİN AĞIRLIKLAR</span>
                  <div className="fx-proInputWrap">
                    <input
                      style={{ paddingLeft: 16 }}
                      value={p.dumbbellWeights}
                      onChange={(e) => set('dumbbellWeights', e.target.value)}
                      placeholder="Örn: 2×5 kg, 2×10 kg veya 2–20 kg ayarlanabilir"
                    />
                  </div>
                </label>
              )}

              <div className="fx-proField" style={{ marginTop: 14 }}>
                <span>HAFTADA KAÇ GÜN ANTRENMAN YAPACAKSIN?</span>
                <div className="fx-choiceRow">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <Choice key={n} compact active={Number(p.trainingFrequency) === n} onClick={() => set('trainingFrequency', n)} title={`${n} Gün`} />
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1>Son Rötuşlar & AI Kalibrasyonu</h1>
              <label className="fx-proField" style={{ marginTop: 12 }}>
                <span>SAKATLIK VEYA HASSAS BÖLGE VAR MI? (OPSİYONEL)</span>
                <div className="fx-proInputWrap">
                  <input
                    style={{ paddingLeft: 16 }}
                    value={p.injuries}
                    onChange={(e) => set('injuries', e.target.value)}
                    placeholder="Örn: Bel hassasiyeti, sol omuz ağrısı (Yoksa boş bırak)"
                  />
                </div>
              </label>

              <label className="fx-proField" style={{ marginTop: 12 }}>
                <span>BESLENME TERCİHİ (OPSİYONEL)</span>
                <div className="fx-proInputWrap">
                  <input
                    style={{ paddingLeft: 16 }}
                    value={p.diet}
                    onChange={(e) => set('diet', e.target.value)}
                    placeholder="Örn: Yüksek proteinli ev yemekleri, laktozsuz, ekonomik"
                  />
                </div>
              </label>

              <div className="fx-summaryBox">
                <Sparkles size={20} />
                <div>
                  <b>Profilin Hazır, {p.name || 'Şampiyon'}!</b>
                  <p>
                    Günlük <b>{liveTargets.kcal} kcal</b> ve <b>{liveTargets.protein} g protein</b> hedefinle birlikte{' '}
                    <b>{p.trainingFrequency} günlük</b> antrenman sistemin kuruldu.
                  </p>
                </div>
              </div>

              {error && <div className="fx-alert fx-alert--error">{error}</div>}
            </>
          )}
        </div>

        <div className="fx-onboardActions">
          {step > 0 && (
            <button type="button" className="fx-btn fx-btn--ghost" onClick={() => setStep((s) => s - 1)} disabled={busy}>
              <ArrowLeft size={18} /> Geri
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" className="fx-btn fx-btn--primary fx-btn--lg fx-grow" onClick={next} disabled={!valid[step]()}>
              Devam Et <ArrowRight size={18} />
            </button>
          ) : (
            <div className="fx-onboardFinal">
              <button type="button" className="fx-btn fx-btn--primary fx-btn--lg fx-grow" onClick={() => finish(false)} disabled={busy}>
                <Dumbbell size={18} /> Hemen Uygulamayı Başlat
              </button>
              <button type="button" className="fx-btn fx-btn--ghost fx-grow" onClick={() => finish(true)} disabled={busy}>
                {busy ? <Loader2 size={18} className="fx-spin" /> : <Sparkles size={18} />}
                {busy ? 'AI Programın Hazırlanıyor…' : 'AI ile Özel Program Üreterek Başlat (~15 sn)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
