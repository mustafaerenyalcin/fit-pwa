import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  Loader2,
  Flame,
  Utensils,
  Droplets,
  Dumbbell,
  Shield,
  Activity,
  Zap,
  Target,
  Trophy,
  Clock,
  HeartPulse,
  TrendingUp,
  Cpu,
  Layers,
  Scale,
  Award
} from 'lucide-react';
import { generateProgram } from '../lib/programGenerator.js';
import { calculateCalories, targets } from '../lib/calculations.js';
import { sounds } from '../lib/audio.js';

const TOTAL_STEPS = 8;

export default function Onboarding({ initialProfile = {}, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [p, setP] = useState({
    name: initialProfile.name || '',
    sex: initialProfile.sex || 'male',
    age: initialProfile.age || 26,
    height: initialProfile.height || 180,
    weight: initialProfile.weight || 78,
    targetWeight: initialProfile.targetWeight || 74,
    bodyType: initialProfile.bodyType || 'athletic', // 'lean' | 'athletic' | 'stocky' | 'heavy'
    goal: initialProfile.goal || 'recomp', // 'cut' | 'gain' | 'recomp' | 'strength'
    focus: initialProfile.focus || 'shoulders-abs', // 'shoulders-abs' | 'sixpack' | 'upper' | 'balanced'
    training: initialProfile.training || 'home', // 'home' | 'gym' | 'calisthenics' | 'hiit'
    equipment: initialProfile.equipment || ['adjustable'],
    dumbbellWeights: initialProfile.dumbbellWeights || '2×5 kg, 2×10 kg',
    trainingFrequency: initialProfile.trainingFrequency || 4,
    sessionDuration: initialProfile.sessionDuration || 45, // 30, 45, 60
    dietStyle: initialProfile.dietStyle || 'turkish', // 'turkish' | 'fasting' | 'lowcarb' | 'balanced'
    experience: initialProfile.experience || 'returning', // 'beginner' | 'returning' | 'intermediate'
    directorMode: initialProfile.directorMode || 'ai_auto', // 'ai_auto' | 'hybrid_custom'
    injuries: initialProfile.injuries || 'Yok'
  });

  const setField = (key, value) => {
    sounds.tap();
    setP((prev) => ({ ...prev, [key]: value }));
  };

  // Real-time metabolic calculations
  const liveStats = useMemo(() => {
    const w = Number(p.weight) || 75;
    const h = Number(p.height) || 178;
    const a = Number(p.age) || 26;
    const isMale = p.sex === 'male';

    // Mifflin-St Jeor BMR
    const bmr = Math.round(
      isMale
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161
    );

    // TDEE multiplier based on training frequency
    const freq = Number(p.trainingFrequency) || 4;
    const mult = freq <= 3 ? 1.35 : freq <= 5 ? 1.5 : 1.65;
    const tdee = Math.round(bmr * mult);

    // Target Calories
    let targetKcal = tdee;
    if (p.goal === 'cut') targetKcal = Math.round(tdee - 450);
    else if (p.goal === 'gain') targetKcal = Math.round(tdee + 350);
    else if (p.goal === 'recomp') targetKcal = Math.round(tdee - 150);

    // Macros
    const proteinG = Math.round(w * (p.goal === 'cut' ? 2.2 : 2.0));
    const fatG = Math.round((targetKcal * 0.25) / 9);
    const carbsG = Math.max(80, Math.round((targetKcal - (proteinG * 4 + fatG * 9)) / 4));
    const waterL = ((Math.round((w * 35) / 100) * 100) / 1000).toFixed(1);

    // BMI & Adonis target
    const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
    const targetLossOrGain = (Number(p.targetWeight || w) - w).toFixed(1);

    return {
      bmr,
      tdee,
      targetKcal,
      proteinG,
      carbsG,
      fatG,
      waterL,
      bmi,
      targetLossOrGain
    };
  }, [p]);

  const stepValid = useMemo(() => {
    if (step === 1) return p.name.trim().length >= 2 && p.age >= 14 && p.height >= 130 && p.weight >= 35;
    return true;
  }, [step, p]);

  const handleNext = () => {
    if (!stepValid) return;
    sounds.tap();
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      if (step === TOTAL_STEPS - 1) {
        sounds.success();
      }
    }
  };

  const handleBack = () => {
    sounds.tap();
    setStep((s) => Math.max(1, s - 1));
  };

  const buildFinalProfile = () => {
    const isGym = p.training === 'gym';
    return {
      ...initialProfile,
      name: p.name.trim() || 'Şampiyon',
      sex: p.sex,
      age: Number(p.age),
      height: Number(p.height),
      weight: Number(p.weight),
      targetWeight: Number(p.targetWeight),
      bodyType: p.bodyType,
      goal: p.goal,
      focus: p.focus,
      training: isGym ? 'gym' : 'home',
      trainingFrequency: Number(p.trainingFrequency),
      sessionDuration: Number(p.sessionDuration),
      equipment: isGym ? ['gym', 'barbell', 'cables'] : p.equipment,
      dumbbellWeights: p.dumbbellWeights,
      dietStyle: p.dietStyle,
      diet: p.dietStyle === 'fasting' ? 'Aralıklı Oruç (16:8)' : 'Yüksek Proteinli Türk Sporcu Mutfağı',
      experience: p.experience,
      directorMode: p.directorMode,
      injuries: p.injuries || 'Yok',
      water: Math.round(Number(p.weight) * 35),
      startWeight: Number(p.weight),
      onboarded: true,
      onboardedAt: new Date().toISOString()
    };
  };

  const handleComplete = async (generateWithAI = true) => {
    setError('');
    const finalProfile = buildFinalProfile();

    if (generateWithAI) {
      setBusy(true);
      try {
        await generateProgram(finalProfile);
      } catch (err) {
        setBusy(false);
        setError(`AI program üretimi atlandı: ${err.message}. Standart optimize programla devam ediliyor.`);
      }
    }

    sounds.success();
    await onComplete(finalProfile);
  };

  return (
    <div className="fx-quizOverlay">
      {/* Üst Mimari Kapsül Barı */}
      <header className="fx-quizTopBar">
        <div className="fx-quizBrand">
          <span className="fx-logo">
            FIT<span>.</span>
          </span>
          <span className="fx-quizTag">BİYOMETRİK KALİBRASYON ATÖLYESİ</span>
        </div>

        {/* Canlı İlerleme Göstergesi */}
        <div className="fx-quizProgressWrap">
          <div className="fx-quizProgressMeta">
            <span>AŞAMA {step} / {TOTAL_STEPS}</span>
            <b>{Math.round((step / TOTAL_STEPS) * 100)}%</b>
          </div>
          <div className="fx-quizProgressBar">
            <span style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>

        {onCancel && (
          <button type="button" className="fx-iconBtn" onClick={onCancel} title="Vazgeç / Kapat">
            ✕
          </button>
        )}
      </header>

      {/* Canlı Metabolik Telemetri Şeridi (Her adımda kullanıcının gözü önünde güncellenir) */}
      <div className="fx-quizTelemetryStrip">
        <div className="fx-stripPod">
          <small>HEDEF ENERJİ</small>
          <strong>{liveStats.targetKcal} <span className="unit">kcal</span></strong>
        </div>
        <div className="fx-stripPod">
          <small>GÜNLÜK PROTEİN</small>
          <strong style={{ color: '#00f0ff' }}>{liveStats.proteinG} <span className="unit">g</span></strong>
        </div>
        <div className="fx-stripPod">
          <small>TDEE HARCAMA</small>
          <strong>{liveStats.tdee} <span className="unit">kcal</span></strong>
        </div>
        <div className="fx-stripPod">
          <small>HİDRASYON</small>
          <strong style={{ color: '#c8ff00' }}>{liveStats.waterL} <span className="unit">L</span></strong>
        </div>
      </div>

      {/* Ana Soru Sahnesi */}
      <main className="fx-quizStage">
        {/* ======================================================== */}
        {/* ADIM 1: BİYOMETRİK DONANIM & VÜCUT PARAMETRELERİ         */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="fx-quizStep animate-slideUp">
            <span className="fx-stepBadge">ADIM 01 // METABOLİK DONANIM</span>
            <h1 className="fx-stepHeadline">Fiziksel parametrelerini kalibre edelim.</h1>
            <p className="fx-stepDesc">
              Metabolizma hızın, yağsız doku oranının ve enerji ihtiyacının tam hesaplanması için temel biyometrik verilerini gir.
            </p>

            <div className="fx-stepFormBox">
              <label className="fx-quizInputRow">
                <span>ADIN VEYA SANA NASIL HİTAP EDELİM?</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="Örn: Mustafa Eren"
                  value={p.name}
                  onChange={(e) => setP({ ...p, name: e.target.value })}
                />
              </label>

              <div className="fx-quizGrid2">
                <div className="fx-quizField">
                  <span>BİYOLOJİK CİNSİYET</span>
                  <div className="fx-binaryChoiceRow">
                    <button
                      type="button"
                      className={`fx-binaryBtn ${p.sex === 'male' ? 'active' : ''}`}
                      onClick={() => setField('sex', 'male')}
                    >
                      ERKEK
                    </button>
                    <button
                      type="button"
                      className={`fx-binaryBtn ${p.sex === 'female' ? 'active' : ''}`}
                      onClick={() => setField('sex', 'female')}
                    >
                      KADIN
                    </button>
                  </div>
                </div>

                <label className="fx-quizInputRow">
                  <span>YAŞ</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="14"
                    max="90"
                    value={p.age}
                    onChange={(e) => setField('age', e.target.value)}
                  />
                </label>
              </div>

              <div className="fx-quizGrid3">
                <label className="fx-quizInputRow">
                  <span>BOY (CM)</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={p.height}
                    onChange={(e) => setField('height', e.target.value)}
                  />
                </label>

                <label className="fx-quizInputRow">
                  <span>GÜNCEL KİLO (KG)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={p.weight}
                    onChange={(e) => setField('weight', e.target.value)}
                  />
                </label>

                <label className="fx-quizInputRow">
                  <span>HEDEF KİLO (KG)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={p.targetWeight}
                    onChange={(e) => setField('targetWeight', e.target.value)}
                  />
                </label>
              </div>

              <div className="fx-telemetryInsight">
                <Activity size={16} className="fx-accentIcon" />
                <span>
                  Mevcut Vücut Kitle İndeksin (BMI): <b>{liveStats.bmi}</b>. Hedefe ulaşmak için:{' '}
                  <b>{Math.abs(Number(liveStats.targetLossOrGain))} kg {Number(liveStats.targetLossOrGain) < 0 ? 'yağ yakımı' : 'temiz kütle kazanımı'}</b> öngörülüyor.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADIM 2: MEVCUT VÜCUT TİPİ / YAĞ ORANI (4 ŞIKLI BENTO)     */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="fx-quizStep animate-slideUp">
            <span className="fx-stepBadge">ADIM 02 // VÜCUT KOMPOZİSYONU</span>
            <h1 className="fx-stepHeadline">Aynadaki mevcut fiziksel silüetin hangisine en yakın?</h1>
            <p className="fx-stepDesc">
              Doğru beslenme açığını ve insülin duyarlılığını tahmin etmek için şu anki yağ oranını seç.
            </p>

            <div className="fx-quizBentoGrid4">
              <button
                type="button"
                className={`fx-quizCard ${p.bodyType === 'lean' ? 'selected' : ''}`}
                onClick={() => setField('bodyType', 'lean')}
              >
                <div className="fx-cardTag">[ %10 – 14 YAĞ ]</div>
                <div className="fx-cardIconBox">
                  <Zap size={26} />
                </div>
                <h3>Yalın & Hızlı Metabolizma</h3>
                <p>Zor kilo alan, damarları belirgin, omuz ve bel hattı ince ektomorf yapı.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.bodyType === 'athletic' ? 'selected' : ''}`}
                onClick={() => setField('bodyType', 'athletic')}
              >
                <div className="fx-cardTag">[ %15 – 18 YAĞ ]</div>
                <div className="fx-cardIconBox" style={{ color: '#00f0ff' }}>
                  <Award size={26} />
                </div>
                <h3>Fit & Atletik Doku</h3>
                <p>Dengeli kas ve yağ kütlesi, temel spor geçmişi, belirgin omuz ve kol hatları.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.bodyType === 'stocky' ? 'selected' : ''}`}
                onClick={() => setField('bodyType', 'stocky')}
              >
                <div className="fx-cardTag">[ %19 – 24 YAĞ ]</div>
                <div className="fx-cardIconBox" style={{ color: '#f5c451' }}>
                  <Scale size={26} />
                </div>
                <h3>Güçlü & Hafif Yağlı</h3>
                <p>Kuvvetli kemik ve kas yapısı, ancak bel ve göğüs bölgesinde inatçı yağ tabakası.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.bodyType === 'heavy' ? 'selected' : ''}`}
                onClick={() => setField('bodyType', 'heavy')}
              >
                <div className="fx-cardTag">[ %25+ YAĞ ]</div>
                <div className="fx-cardIconBox" style={{ color: '#ff4d1c' }}>
                  <Flame size={26} />
                </div>
                <h3>Yoğun Yağ Yakımı Odaklı</h3>
                <p>İnsülin dengesi ve hızlı toparlanma gerektiren, yüksek yağ kütlesi bulunan fizik.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADIM 3: ANA ATLETİK DİREKTİF (4 ŞIKLI BENTO)             */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="fx-quizStep animate-slideUp">
            <span className="fx-stepBadge">ADIM 03 // BİRİNCİL DİREKTİF</span>
            <h1 className="fx-stepHeadline">Önümüzdeki 90 gün boyunca 1 numaralı önceliğin nedir?</h1>
            <p className="fx-stepDesc">
              Metabolizma stratejin bu amaca kilitlenecek ve kalori dengen milimetrik olarak buna göre yönetilecek.
            </p>

            <div className="fx-quizBentoGrid4">
              <button
                type="button"
                className={`fx-quizCard ${p.goal === 'cut' ? 'selected' : ''}`}
                onClick={() => setField('goal', 'cut')}
              >
                <div className="fx-cardTag">[-450 KCAL DEFİSİT]</div>
                <div className="fx-cardIconBox" style={{ color: '#ff4d1c' }}>
                  <Flame size={26} />
                </div>
                <h3>Hızlı Definasyon & Parçalanma</h3>
                <p>Mevcut kas kütleni son damlasına kadar korurken karın kası hatlarını ortaya çıkar.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.goal === 'gain' ? 'selected' : ''}`}
                onClick={() => setField('goal', 'gain')}
              >
                <div className="fx-cardTag">[+350 KCAL FAZLA]</div>
                <div className="fx-cardIconBox" style={{ color: '#c8ff00' }}>
                  <Dumbbell size={26} />
                </div>
                <h3>Temiz Kas Kütlesi (Lean Bulk)</h3>
                <p>Yağlanmadan maksimum kas hipertrofisi kazanmak için kontrollü anabolik ortam kur.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.goal === 'recomp' ? 'selected' : ''}`}
                onClick={() => setField('goal', 'recomp')}
              >
                <div className="fx-cardTag">[EŞ ZAMANLI DÖNÜŞÜM]</div>
                <div className="fx-cardIconBox" style={{ color: '#00f0ff' }}>
                  <TrendingUp size={26} />
                </div>
                <h3>Vücut Yeniden Yapılanması (Recomp)</h3>
                <p>Aynı anda hem yağ oranını aşağı çek hem de yeni kas lifleri inşa et (Altın Standart).</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.goal === 'strength' ? 'selected' : ''}`}
                onClick={() => setField('goal', 'strength')}
              >
                <div className="fx-cardTag">[1RM MAKSİMUM GÜÇ]</div>
                <div className="fx-cardIconBox" style={{ color: '#a855f7' }}>
                  <Trophy size={26} />
                </div>
                <h3>Saf Güç & Atletik Kondisyon</h3>
                <p>Merkezi sinir sistemi adaptasyonu ve patlayıcı kuvvet artışına odaklan.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADIM 4: ESTETİK ODAK & ADONIS ORANI (4 ŞIKLI BENTO)       */}
        {/* ======================================================== */}
        {step === 4 && (
          <div className="fx-quizStep animate-slideUp">
            <span className="fx-stepBadge">ADIM 04 // ESTETİK VE PROPORSIYON</span>
            <h1 className="fx-stepHeadline">Fiziğinde en çok hangi bölgenin patlama yapmasını istersin?</h1>
            <p className="fx-stepDesc">
              Antrenman hacmin (set sayıları ve egzersiz seçimi) bu estetik bölgeye öncelik tanıyacak.
            </p>

            <div className="fx-quizBentoGrid4">
              <button
                type="button"
                className={`fx-quizCard ${p.focus === 'shoulders-abs' ? 'selected' : ''}`}
                onClick={() => setField('focus', 'shoulders-abs')}
              >
                <div className="fx-cardTag">[ADONIS 1.618 ORANI]</div>
                <div className="fx-cardIconBox" style={{ color: '#c8ff00' }}>
                  <Shield size={26} />
                </div>
                <h3>Geniş Omuz & Kanat (V-Taper)</h3>
                <p>Yan deltoid, latissimus ve dar bel illüzyonu ile klasik Yunan heykeli silüeti.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.focus === 'sixpack' ? 'selected' : ''}`}
                onClick={() => setField('focus', 'sixpack')}
              >
                <div className="fx-cardTag">[CORE ZIRHI]</div>
                <div className="fx-cardIconBox" style={{ color: '#00f0ff' }}>
                  <Target size={26} />
                </div>
                <h3>Derin Six-Pack & İnce Bel</h3>
                <p>Oblikler, alt karın ve derin core stabilizatörlerini kalınlaştırıp beli incelt.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.focus === 'upper' ? 'selected' : ''}`}
                onClick={() => setField('focus', 'upper')}
              >
                <div className="fx-cardTag">[ÜST GÖVDE KALINLIĞI]</div>
                <div className="fx-cardIconBox" style={{ color: '#ff4d1c' }}>
                  <Dumbbell size={26} />
                </div>
                <h3>Zırh Göğüs & Dolgun Kollar</h3>
                <p>Üst göğüs, tepe biceps ve arka kol (triceps) hacmini maksimize et.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.focus === 'balanced' ? 'selected' : ''}`}
                onClick={() => setField('focus', 'balanced')}
              >
                <div className="fx-cardTag">[FONKSİYONEL SİMETRİ]</div>
                <div className="fx-cardIconBox" style={{ color: '#a855f7' }}>
                  <Activity size={26} />
                </div>
                <h3>Dengeli Tüm Vücut & Bacak</h3>
                <p>Kuvvetli quad, hamstring ve kalça zinciri ile kusursuz atletik simetri.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADIM 5: ANTRENMAN ORTAMI & HAFTALIK DÜZEN (4 ŞIKLI BENTO) */}
        {/* ======================================================== */}
        {step === 5 && (
          <div className="fx-quizStep animate-slideUp">
            <span className="fx-stepBadge">ADIM 05 // EKİPMAN & ZAMAN</span>
            <h1 className="fx-stepHeadline">Antrenmanlarını nerede ve ne sıklıkla yapacaksın?</h1>
            <p className="fx-stepDesc">
              Sadece gerçekten sahip olduğun ekipmanlarla yapılabilen hareketler seçilir.
            </p>

            <div className="fx-quizBentoGrid4">
              <button
                type="button"
                className={`fx-quizCard ${p.training === 'home' ? 'selected' : ''}`}
                onClick={() => setField('training', 'home')}
              >
                <div className="fx-cardTag">[EVDE PERFORMANS]</div>
                <div className="fx-cardIconBox" style={{ color: '#c8ff00' }}>
                  <Dumbbell size={26} />
                </div>
                <h3>Evde Dambıl Atölyesi</h3>
                <p>Ayarlanabilir veya sabit dambıllarla odanın konforunda tam hipertrofi.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.training === 'gym' ? 'selected' : ''}`}
                onClick={() => setField('training', 'gym')}
              >
                <div className="fx-cardTag">[TAM DONANIM]</div>
                <div className="fx-cardIconBox" style={{ color: '#00f0ff' }}>
                  <Layers size={26} />
                </div>
                <h3>Tam Donanımlı Spor Salonu</h3>
                <p>Barbell, serbest ağırlıklar, kablolar ve izole makinelerle sınırsız açı.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.training === 'calisthenics' ? 'selected' : ''}`}
                onClick={() => setField('training', 'calisthenics')}
              >
                <div className="fx-cardTag">[VÜCUT AĞIRLIĞI]</div>
                <div className="fx-cardIconBox" style={{ color: '#ff4d1c' }}>
                  <HeartPulse size={26} />
                </div>
                <h3>Kalistenik & Vücut Ağırlığı</h3>
                <p>Sıfır ekipmanla şınav, barfiks ve dip varyasyonlarıyla saf fonksiyonel güç.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.training === 'hiit' ? 'selected' : ''}`}
                onClick={() => setField('training', 'hiit')}
              >
                <div className="fx-cardTag">[ZAMAN TASARRUFU]</div>
                <div className="fx-cardIconBox" style={{ color: '#a855f7' }}>
                  <Clock size={26} />
                </div>
                <h3>30 Dk Yüksek Yoğunluklu Split</h3>
                <p>Yoğun çalışanlar için süpersetler ve minimum dinlenmeli yoğun seanslar.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>
            </div>

            {/* Haftalık Gün Sayısı Seçici */}
            <div className="fx-stepSubSection">
              <span className="fx-subLabel">HAFTADA KAÇ GÜN AYIRABİLİRSİN?</span>
              <div className="fx-frequencySelector">
                {[3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    type="button"
                    className={`fx-freqBtn ${Number(p.trainingFrequency) === days ? 'active' : ''}`}
                    onClick={() => setField('trainingFrequency', days)}
                  >
                    <strong>{days} Gün</strong>
                    <small>
                      {days === 3
                        ? 'Tüm Vücut'
                        : days === 4
                          ? 'Üst / Alt Split'
                          : days === 5
                            ? 'İtiş / Çekiş / Bacak'
                            : 'Elit Periyodizasyon'}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADIM 6: BESLENME İŞLETİM SİSTEMİ (4 ŞIKLI BENTO)          */}
        {/* ======================================================== */}
        {step === 6 && (
          <div className="fx-quizStep animate-slideUp">
            <span className="fx-stepBadge">ADIM 06 // BESLENME İŞLETİM SİSTEMİ</span>
            <h1 className="fx-stepHeadline">Hangi beslenme tarzını yaşam boyu sürdürebilirsin?</h1>
            <p className="fx-stepDesc">
              AI beslenme koçun ve Türk mutfağı önerileri bu felsefeye göre öğün kombinasyonları kurar.
            </p>

            <div className="fx-quizBentoGrid4">
              <button
                type="button"
                className={`fx-quizCard ${p.dietStyle === 'turkish' ? 'selected' : ''}`}
                onClick={() => setField('dietStyle', 'turkish')}
              >
                <div className="fx-cardTag">[YÜKSEK PROTEİN]</div>
                <div className="fx-cardIconBox" style={{ color: '#c8ff00' }}>
                  <Utensils size={26} />
                </div>
                <h3>Geleneksel Türk Sporcu Mutfağı</h3>
                <p>Yumurta, yoğurt, kuru baklagil, tavuk, dana eti ve bulgur gibi tanıdık lezzetler.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.dietStyle === 'fasting' ? 'selected' : ''}`}
                onClick={() => setField('dietStyle', 'fasting')}
              >
                <div className="fx-cardTag">[16:8 OTOFAJİ]</div>
                <div className="fx-cardIconBox" style={{ color: '#00f0ff' }}>
                  <Clock size={26} />
                </div>
                <h3>Aralıklı Oruç (Intermittent Fasting)</h3>
                <p>Günde 2 büyük öğün, 16 saat açlık penceresiyle insülin sıfırlama ve yüksek yağ yakımı.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.dietStyle === 'lowcarb' ? 'selected' : ''}`}
                onClick={() => setField('dietStyle', 'lowcarb')}
              >
                <div className="fx-cardTag">[DÜŞÜK KARBONHİDRAT]</div>
                <div className="fx-cardIconBox" style={{ color: '#ff4d1c' }}>
                  <Flame size={26} />
                </div>
                <h3>Low-Carb & Ketojenik</h3>
                <p>Hızlı ödem ve su atımı, sıfır şeker çöküşü ve sabit gün boyu enerji odağı.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>

              <button
                type="button"
                className={`fx-quizCard ${p.dietStyle === 'balanced' ? 'selected' : ''}`}
                onClick={() => setField('dietStyle', 'balanced')}
              >
                <div className="fx-cardTag">[ESNEK DİYET]</div>
                <div className="fx-cardIconBox" style={{ color: '#a855f7' }}>
                  <Sparkles size={26} />
                </div>
                <h3>Esnek Makro & IIFYM</h3>
                <p>Yasak yemek olmadan, günlük protein ve kalori kotalarını doldurma özgürlüğü.</p>
                <span className="fx-cardSelectTick"><Check size={14} /></span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADIM 7: SİSTEM KONTROLÜ (KENDİN Mİ YÖNETECEKSİN YOKSA AI MI?) */}
        {/* ======================================================== */}
        {step === 7 && (
          <div className="fx-quizStep animate-slideUp">
            <span className="fx-stepBadge">ADIM 07 // SİSTEM KONTROL MİMARİSİ</span>
            <h1 className="fx-stepHeadline">Antrenman ve gelişim sistemini nasıl yönetmek istersin?</h1>
            <p className="fx-stepDesc">
              Kontrol tamamen sende. İster her şeyi yapay zekaya emanet et, ister kendi özel rutinlerini kendin inşa et.
            </p>

            <div className="fx-quizGrid2" style={{ marginTop: 20 }}>
              <button
                type="button"
                className={`fx-directorCard ${p.directorMode === 'ai_auto' ? 'selected' : ''}`}
                onClick={() => setField('directorMode', 'ai_auto')}
              >
                <div className="fx-directorBadge">ÖNERİLEN ÇÖZÜM</div>
                <div className="fx-directorIcon">
                  <Cpu size={32} />
                </div>
                <h2>Otonom AI Başantrenör</h2>
                <p>
                  Yapay zeka ekipmanına göre 7 günlük programını, set/tekrar sayılarını, dinlenme aralıklarını
                  ve haftalık ağırlık artışını (Progressive Overload) otomatik olarak yönetsin.
                </p>
                <ul className="fx-directorList">
                  <li>✓ Her sabah uyku ve ağrına göre antrenman uyarlaması</li>
                  <li>✓ Otomatik 1RM hesaplaması ve ağırlık artış hedefleri</li>
                  <li>✓ Kalan proteine göre 1-tıkla yemek önerileri</li>
                </ul>
              </button>

              <button
                type="button"
                className={`fx-directorCard ${p.directorMode === 'hybrid_custom' ? 'selected' : ''}`}
                onClick={() => setField('directorMode', 'hybrid_custom')}
              >
                <div className="fx-directorBadge">TAM KONTROL</div>
                <div className="fx-directorIcon" style={{ color: '#00f0ff' }}>
                  <Layers size={32} />
                </div>
                <h2>Özel Rutin & Manuel Mimari</h2>
                <p>
                  Kendi hareketlerini, setlerini ve favori egzersizlerini 40+ hareket kütüphanesinden kendin seç.
                  AI sadece senin belirlediğin programın performans analizini yapsın.
                </p>
                <ul className="fx-directorList">
                  <li>✓ Kendi özel antrenman şablonlarını oluşturma yetkisi</li>
                  <li>✓ Egzersizleri ve alternatifleri anında değiştirebilme</li>
                  <li>✓ Makrolarını ve hedeflerini istediğin an serbestçe düzenleme</li>
                </ul>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADIM 8: BÜYÜK FİNAL — BİYOMETRİK BLUEPRINT & 90 GÜNLÜK TABLO */}
        {/* ======================================================== */}
        {step === 8 && (
          <div className="fx-quizStep animate-slideUp">
            <div className="fx-blueprintHero">
              <span className="fx-blueprintEyebrow">
                <Sparkles size={14} /> SİSTEM KALİBRE EDİLDİ // HAZIR
              </span>
              <h1 className="fx-blueprintTitle">
                {p.name || 'Şampiyon'}, işte senin Kişisel Atletik Blueprint'in!
              </h1>
              <p className="fx-blueprintSub">
                Girdiğin biyometrik parametrelere göre 90 günlük metabolik projeksiyonun ve günlük hedeflerin çıkarıldı.
              </p>
            </div>

            {/* 1. Metabolizma & Makro Matrisi Tablosu */}
            <div className="fx-blueprintMatrixTable">
              <div className="fx-matrixCol">
                <small>BAZAL METABOLİZMA</small>
                <strong>{liveStats.bmr} <span className="unit">kcal</span></strong>
                <span>Organların dinlenirken yaktığı enerji</span>
              </div>
              <div className="fx-matrixCol">
                <small>GÜNLÜK TOPLAM HARCAMA</small>
                <strong>{liveStats.tdee} <span className="unit">kcal</span></strong>
                <span>{p.trainingFrequency} gün antrenman dahil TDEE</span>
              </div>
              <div className="fx-matrixCol fx-matrixCol--accent">
                <small>GÜNLÜK HEDEF ENERJİ</small>
                <strong style={{ color: '#ff4d1c' }}>{liveStats.targetKcal} <span className="unit">kcal</span></strong>
                <span>{p.goal === 'cut' ? '-450 kcal Yağ Açığı' : p.goal === 'gain' ? '+350 kcal Kas Fazlası' : 'Eşit Dağılım'}</span>
              </div>
              <div className="fx-matrixCol">
                <small>PROTEİN SENTEZİ</small>
                <strong style={{ color: '#00f0ff' }}>{liveStats.proteinG} <span className="unit">g</span></strong>
                <span>Vücut ağırlığının 2.0–2.2 katı</span>
              </div>
            </div>

            {/* 2. 90 Günlük Fazlar ve Değişim Tablosu */}
            <div className="fx-roadmapBox">
              <div className="fx-roadmapHead">
                <TrendingUp size={18} className="fx-accentIcon" />
                <b>90 GÜNLÜK GELİŞİM VE DÖNÜŞÜM TAKVİMİ</b>
              </div>

              <div className="fx-roadmapGrid">
                <div className="fx-roadmapPhase">
                  <div className="fx-phaseNumber">FAZ 01</div>
                  <h4>1 – 30. GÜN // Nöral Adaptasyon</h4>
                  <p>Merkezi sinir sistemi hareket formlarına kilitlenir. Vücuttaki ödem atılır ve ilk kuvvet sıçraması gerçekleşir.</p>
                  <div className="fx-phaseOutcome">
                    <span>Öngörülen: <b>{p.goal === 'cut' ? '-2.5 kg Yağ' : '+1.2 kg Kas'}</b></span>
                    <span>1RM Artışı: <b>+%15</b></span>
                  </div>
                </div>

                <div className="fx-roadmapPhase">
                  <div className="fx-phaseNumber" style={{ color: '#00f0ff' }}>FAZ 02</div>
                  <h4>31 – 60. GÜN // Hipertrofi & V-Taper</h4>
                  <p>Kas lifleri kalınlaşır. Omuz ve kanat genişliği belirginleşirken bel çevresi sıkılaşır.</p>
                  <div className="fx-phaseOutcome">
                    <span>Görünüm: <b>Belirgin Çizgiler</b></span>
                    <span>Adonis Oranı: <b>1.54</b></span>
                  </div>
                </div>

                <div className="fx-roadmapPhase fx-roadmapPhase--highlight">
                  <div className="fx-phaseNumber" style={{ color: '#ff4d1c' }}>FAZ 03</div>
                  <h4>61 – 90. GÜN // Zirve Form & Simetri</h4>
                  <p>Hedef kiloya ({p.targetWeight} kg) ulaşılır. Karın kasları ve damar belirginliği zirve yapar.</p>
                  <div className="fx-phaseOutcome">
                    <span>Hedef: <b>Kusursuz Simetri</b></span>
                    <span>Altın Oran: <b>1.618</b></span>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="fx-alert fx-alert--error">{error}</div>}
          </div>
        )}
      </main>

      {/* Alt Navigasyon & Aksiyon Barı */}
      <footer className="fx-quizFooterBar">
        <div className="fx-footerInner">
          {step > 1 && step < TOTAL_STEPS && (
            <button type="button" className="fx-quizBackBtn" onClick={handleBack} disabled={busy}>
              <ArrowLeft size={16} /> Geri
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              className="fx-quizNextBtn"
              onClick={handleNext}
              disabled={!stepValid || busy}
            >
              <span>{step === TOTAL_STEPS - 1 ? 'Analizi Tamamla ve Tabloyu Çiz' : 'Sonraki Aşama'}</span>
              <ArrowRight size={17} />
            </button>
          ) : (
            <div className="fx-blueprintActionGroup">
              <button
                type="button"
                className="fx-btn fx-solarBtn fx-btn--lg"
                onClick={() => handleComplete(true)}
                disabled={busy}
              >
                {busy ? <Loader2 size={18} className="fx-spin" /> : <Flame size={18} />}
                <span>{busy ? 'AI Programın Üretiliyor… (~10 sn)' : '🔥 AI Özel 7 Günlük Programımı Üret ve Başlat'}</span>
              </button>

              <button
                type="button"
                className="fx-btn fx-ivoryBtn fx-btn--lg"
                onClick={() => handleComplete(false)}
                disabled={busy}
              >
                <Zap size={18} />
                <span>⚡ Doğrudan Kontrol Merkezine Gir (Kendi Rutinimi Seçeceğim)</span>
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
