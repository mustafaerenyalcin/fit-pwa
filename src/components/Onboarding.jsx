import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Check, Loader2 } from 'lucide-react';
import { Choice } from './ui.jsx';
import { generateProgram } from './ProgramGenerator.jsx';

const EQUIPMENT = [
  ['bodyweight', 'Sadece vücut ağırlığı'],
  ['adjustable', 'Ayarlanabilir dambıl'],
  ['fixed', 'Sabit dambıllar'],
  ['bands', 'Direnç bandı'],
  ['pullup', 'Barfiks barı'],
  ['bench', 'Sehpa / bench'],
  ['kettlebell', 'Kettlebell'],
  ['gym', 'Spor salonu üyeliği']
];

const STEPS = ['Sen', 'Vücut', 'Hedef', 'Ekipman', 'Plan'];

export default function Onboarding({ initialProfile = {}, onComplete }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState({
    name: initialProfile.name || '',
    sex: initialProfile.sex || '',
    age: initialProfile.age || '',
    height: initialProfile.height || '',
    weight: initialProfile.weight || '',
    goal: initialProfile.goal || 'recomp',
    focus: initialProfile.focus || 'balanced',
    experience: initialProfile.experience || 'beginner',
    equipment: initialProfile.equipment || ['adjustable'],
    dumbbellWeights: initialProfile.dumbbellWeights || '',
    trainingFrequency: initialProfile.trainingFrequency || 4,
    injuries: initialProfile.injuries || '',
    diet: initialProfile.diet || ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setP((prev) => ({ ...prev, [k]: v }));
  const toggleEq = (id) =>
    set('equipment', p.equipment.includes(id) ? p.equipment.filter((x) => x !== id) : [...p.equipment, id]);

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
    const equipmentText = [eqLabels.join(', '), p.dumbbellWeights && `Dambıl ağırlıkları: ${p.dumbbellWeights}`]
      .filter(Boolean)
      .join(' · ');
    return {
      ...initialProfile,
      name: p.name.trim(),
      sex: p.sex,
      age: p.age,
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
        setError(`Program şimdilik oluşturulamadı: ${err.message} Hazır programla başlayıp daha sonra Antrenman sekmesinden tekrar deneyebilirsin.`);
        return;
      }
    }
    await onComplete(profile);
  };

  const next = () => valid[step]() && setStep((s) => Math.min(STEPS.length - 1, s + 1));

  return (
    <div className="fx-onboard">
      <div className="fx-onboardTop">
        <div className="fx-logo">
          fit<span>.</span>
        </div>
        <div className="fx-stepper" aria-label={`Adım ${step + 1} / ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <span key={s} className={i <= step ? 'on' : ''} />
          ))}
        </div>
      </div>

      <div className="fx-onboardBody" key={step}>
        {step === 0 && (
          <>
            <h1>Merhaba! Seni tanıyalım.</h1>
            <p className="fx-muted">Koçun sana adınla hitap edecek ve hesaplamaları buna göre yapacak.</p>
            <label className="fx-field">
              <span>Adın</span>
              <input autoFocus value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="Adın veya takma adın" />
            </label>
            <div className="fx-field">
              <span>Cinsiyet (kalori hesabı için)</span>
              <div className="fx-choiceRow">
                <Choice compact active={p.sex === 'male'} onClick={() => set('sex', 'male')} title="Erkek" />
                <Choice compact active={p.sex === 'female'} onClick={() => set('sex', 'female')} title="Kadın" />
                <Choice compact active={p.sex === ''} onClick={() => set('sex', '')} title="Belirtmeyeyim" />
              </div>
            </div>
            <label className="fx-field">
              <span>Yaş</span>
              <input type="number" inputMode="numeric" min="14" max="90" value={p.age} onChange={(e) => set('age', e.target.value)} placeholder="Örn: 27" />
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <h1>Vücut ölçülerin</h1>
            <p className="fx-muted">Protein ve kalori hedeflerin bunlara göre hesaplanır. İstediğin zaman değiştirebilirsin.</p>
            <div className="fx-grid2">
              <label className="fx-field">
                <span>Boy (cm)</span>
                <input type="number" inputMode="numeric" value={p.height} onChange={(e) => set('height', e.target.value)} placeholder="175" />
              </label>
              <label className="fx-field">
                <span>Kilo (kg)</span>
                <input type="number" inputMode="decimal" step="0.1" value={p.weight} onChange={(e) => set('weight', e.target.value)} placeholder="75" />
              </label>
            </div>
            <div className="fx-field">
              <span>Spor geçmişin</span>
              <div className="fx-choiceCol">
                <Choice active={p.experience === 'beginner'} onClick={() => set('experience', 'beginner')} title="Yeni başlıyorum" desc="Düzenli antrenman yapmadım" />
                <Choice active={p.experience === 'returning'} onClick={() => set('experience', 'returning')} title="Ara verip dönüyorum" desc="Daha önce yaptım, şimdi yeniden başlıyorum" />
                <Choice active={p.experience === 'intermediate'} onClick={() => set('experience', 'intermediate')} title="Düzenli çalışıyorum" desc="En az 6 aydır antrenman yapıyorum" />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Hedefin ne?</h1>
            <div className="fx-choiceCol">
              <Choice icon="🔥" active={p.goal === 'cut'} onClick={() => set('goal', 'cut')} title="Yağ yakmak" desc="Kası koruyarak incelmek" />
              <Choice icon="⚖️" active={p.goal === 'recomp'} onClick={() => set('goal', 'recomp')} title="Sıkılaşmak" desc="Kas kazanıp yağ oranını düşürmek" />
              <Choice icon="💪" active={p.goal === 'gain'} onClick={() => set('goal', 'gain')} title="Kas kütlesi kazanmak" desc="Kontrollü kalori fazlası ile büyümek" />
            </div>
            <div className="fx-field">
              <span>Öncelikli bölge</span>
              <div className="fx-choiceRow wrap">
                <Choice compact active={p.focus === 'balanced'} onClick={() => set('focus', 'balanced')} title="Tüm vücut" />
                <Choice compact active={p.focus === 'shoulders-abs'} onClick={() => set('focus', 'shoulders-abs')} title="Omuz & karın" />
                <Choice compact active={p.focus === 'upper-body'} onClick={() => set('focus', 'upper-body')} title="Üst vücut" />
                <Choice compact active={p.focus === 'glutes-legs'} onClick={() => set('focus', 'glutes-legs')} title="Bacak & kalça" />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Neyle çalışacaksın?</h1>
            <p className="fx-muted">Programın tamamen elindeki ekipmana göre hazırlanır.</p>
            <div className="fx-choiceRow wrap">
              {EQUIPMENT.map(([id, label]) => (
                <Choice key={id} compact active={p.equipment.includes(id)} onClick={() => toggleEq(id)} title={label} />
              ))}
            </div>
            {(p.equipment.includes('adjustable') || p.equipment.includes('fixed') || p.equipment.includes('kettlebell')) && (
              <label className="fx-field">
                <span>Hangi ağırlıklar var?</span>
                <input value={p.dumbbellWeights} onChange={(e) => set('dumbbellWeights', e.target.value)} placeholder="Örn: 2×5 kg, 2×10 kg veya 2–20 kg ayarlanabilir" />
              </label>
            )}
            <div className="fx-field">
              <span>Haftada kaç gün antrenman?</span>
              <div className="fx-choiceRow">
                {[2, 3, 4, 5, 6].map((n) => (
                  <Choice key={n} compact active={Number(p.trainingFrequency) === n} onClick={() => set('trainingFrequency', n)} title={`${n}`} />
                ))}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1>Son birkaç detay</h1>
            <label className="fx-field">
              <span>Sakatlık veya hassas bölgen var mı? (opsiyonel)</span>
              <input value={p.injuries} onChange={(e) => set('injuries', e.target.value)} placeholder="Örn: Bel fıtığı, sol omuz ağrısı" />
            </label>
            <label className="fx-field">
              <span>Beslenme tercihin (opsiyonel)</span>
              <input value={p.diet} onChange={(e) => set('diet', e.target.value)} placeholder="Örn: Vejetaryen, laktoz hassasiyeti, öğrenci bütçesi" />
            </label>

            <div className="fx-summaryBox">
              <Sparkles size={18} />
              <div>
                <b>Koçun hazır.</b>
                <p>
                  Ekipmanına göre <b>{p.trainingFrequency} günlük</b> kişisel programını şimdi AI ile oluşturabiliriz
                  (yaklaşık 20 saniye).
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
            Devam <ArrowRight size={18} />
          </button>
        ) : (
          <div className="fx-onboardFinal">
            <button type="button" className="fx-btn fx-btn--primary fx-btn--lg fx-grow" onClick={() => finish(true)} disabled={busy}>
              {busy ? <Loader2 size={18} className="fx-spin" /> : <Sparkles size={18} />}
              {busy ? 'Programın hazırlanıyor…' : 'Programımı oluştur'}
            </button>
            <button type="button" className="fx-btn fx-btn--text" onClick={() => finish(false)} disabled={busy}>
              <Check size={16} /> Şimdilik hazır programla başla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
