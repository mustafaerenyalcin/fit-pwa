import React, { useState } from 'react';
import { Zap, Clock, Flame, Play, ChevronRight, Trophy, Check } from 'lucide-react';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';

const LEAP_COPY = {
  tr: {
    weeklyGoal: 'HAFTALIK HEDEF',
    workouts: 'Antrenman',
    minutes: 'Dakika',
    challengeTag: '28 GÜNLÜK MEYDAN OKUMA',
    challengeTitle: 'Tam Vücut Yağ Yakım & Fit Form',
    challengeSub: 'Ekipmansız · Günde 15-20 Dakika · 4 Haftalık Plan',
    startNow: 'BAŞLA',
    filterAll: 'Tümü',
    filterBeg: 'Başlangıç',
    filterInt: 'Orta',
    filterAdv: 'İleri',
    mins: 'Dk',
    moves: 'Hareket',
    secAbs: 'KARIN & CORE',
    secChest: 'GÖĞÜS',
    secArms: 'KOL & TRİCEPS',
    secLegs: 'BACAK & KALÇA',
    secBack: 'SIRT & OMUZ',
    cards: {
      abs_1: { title: 'KARIN BAŞLANGIÇ', sub: 'Düz karın ve temel core aktivasyonu' },
      abs_2: { title: 'KARIN ORTA SEVİYE', sub: 'Alt karın & oblik şekillendirme' },
      abs_3: { title: 'KARIN İLERİ (SIX-PACK)', sub: 'Yüksek yoğunluklu baklava kası' },
      chest_1: { title: 'GÖĞÜS BAŞLANGIÇ', sub: 'Temel şınav ve göğüs sıkılaştırma' },
      chest_2: { title: 'GÖĞÜS ORTA SEVİYE', sub: 'Üst, alt ve iç göğüs hacmi' },
      chest_3: { title: 'GÖĞÜS İLERİ SEVİYE', sub: 'Patlayıcı güç ve maksimum pump' },
      arm_1: { title: 'KOL BAŞLANGIÇ', sub: 'Biceps, triceps ve ön kol temeli' },
      arm_2: { title: 'KOL ORTA SEVİYE', sub: 'Ekipmansız kol hacmi ve sıkılık' },
      leg_1: { title: 'BACAK BAŞLANGIÇ', sub: 'Squat, lunge ve alt vücut gücü' },
      leg_3: { title: 'BACAK İLERİ SEVİYE', sub: 'Patlayıcı quad, kalça ve kalf' },
      back_1: { title: 'SIRT & OMUZ BAŞLANGIÇ', sub: 'Dik duruş ve V-şekli omuz temeli' },
      back_3: { title: 'SIRT & OMUZ İLERİ', sub: 'Geniş kanat ve 3D omuz başları' }
    }
  },
  en: {
    weeklyGoal: 'WEEKLY GOAL',
    workouts: 'Workouts',
    minutes: 'Minutes',
    challengeTag: '28-DAY CHALLENGE',
    challengeTitle: 'Full Body Fat Burn & Tone',
    challengeSub: 'No Equipment · 15-20 Min/Day · 4-Week Plan',
    startNow: 'START',
    filterAll: 'All',
    filterBeg: 'Beginner',
    filterInt: 'Intermediate',
    filterAdv: 'Advanced',
    mins: 'Min',
    moves: 'Exercises',
    secAbs: 'ABS & CORE',
    secChest: 'CHEST',
    secArms: 'ARMS & TRICEPS',
    secLegs: 'LEGS & GLUTES',
    secBack: 'BACK & SHOULDERS',
    cards: {
      abs_1: { title: 'ABS BEGINNER', sub: 'Flat belly & core foundation' },
      abs_2: { title: 'ABS INTERMEDIATE', sub: 'Lower abs & oblique sculpting' },
      abs_3: { title: 'ABS ADVANCED (SIX-PACK)', sub: 'High-intensity six-pack shred' },
      chest_1: { title: 'CHEST BEGINNER', sub: 'Push-up foundation & chest tone' },
      chest_2: { title: 'CHEST INTERMEDIATE', sub: 'Upper, lower & inner chest build' },
      chest_3: { title: 'CHEST ADVANCED', sub: 'Explosive power & maximum pump' },
      arm_1: { title: 'ARM BEGINNER', sub: 'Biceps, triceps & forearm basics' },
      arm_2: { title: 'ARM INTERMEDIATE', sub: 'No-equipment arm tone & volume' },
      leg_1: { title: 'LEG BEGINNER', sub: 'Squat, lunge & lower-body base' },
      leg_3: { title: 'LEG ADVANCED', sub: 'Explosive quads, glutes & calves' },
      back_1: { title: 'SHOULDER & BACK BEGINNER', sub: 'Posture fix & V-taper base' },
      back_3: { title: 'SHOULDER & BACK ADVANCED', sub: 'Wide lats & 3D deltoids' }
    }
  },
  de: {
    weeklyGoal: 'WOCHENZIEL',
    workouts: 'Workouts',
    minutes: 'Minuten',
    challengeTag: '28-TAGE-CHALLENGE',
    challengeTitle: 'Ganzkörper Fettverbrennung',
    challengeSub: 'Ohne Geräte · 15-20 Min/Tag · 4-Wochen-Plan',
    startNow: 'START',
    filterAll: 'Alle',
    filterBeg: 'Anfänger',
    filterInt: 'Mittel',
    filterAdv: 'Fortgeschritten',
    mins: 'Min',
    moves: 'Übungen',
    secAbs: 'BAUCH & CORE',
    secChest: 'BRUST',
    secArms: 'ARME & TRIZEPS',
    secLegs: 'BEINE & PO',
    secBack: 'RÜCKEN & SCHULTERN',
    cards: {
      abs_1: { title: 'BAUCH ANFÄNGER', sub: 'Flacher Bauch & Core-Basis' },
      abs_2: { title: 'BAUCH MITTEL', sub: 'Unterbauch & seitliche Bauchmuskeln' },
      abs_3: { title: 'BAUCH FORTGESCHRITTEN', sub: 'Intensives Sixpack-Training' },
      chest_1: { title: 'BRUST ANFÄNGER', sub: 'Liegestütz-Basis & Brustformung' },
      chest_2: { title: 'BRUST MITTEL', sub: 'Obere, untere & innere Brust' },
      chest_3: { title: 'BRUST FORTGESCHRITTEN', sub: 'Explosive Kraft & maximaler Pump' },
      arm_1: { title: 'ARME ANFÄNGER', sub: 'Bizeps, Trizeps & Unterarm-Basis' },
      arm_2: { title: 'ARME MITTEL', sub: 'Armvolumen ohne Geräte' },
      leg_1: { title: 'BEINE ANFÄNGER', sub: 'Squats, Lunges & Beinkraft' },
      leg_3: { title: 'BEINE FORTGESCHRITTEN', sub: 'Explosive Quads, Glutes & Waden' },
      back_1: { title: 'RÜCKEN & SCHULTER ANFÄNGER', sub: 'Haltung & V-Form Basis' },
      back_3: { title: 'RÜCKEN & SCHULTER PRO', sub: 'Breiter Lat & 3D-Schultern' }
    }
  },
  es: {
    weeklyGoal: 'META SEMANAL',
    workouts: 'Entrenos',
    minutes: 'Minutos',
    challengeTag: 'RETO DE 28 DÍAS',
    challengeTitle: 'Cuerpo Completo Quema Grasa',
    challengeSub: 'Sin Equipo · 15-20 Min/Día · Plan 4 Semanas',
    startNow: 'INICIAR',
    filterAll: 'Todos',
    filterBeg: 'Principiante',
    filterInt: 'Intermedio',
    filterAdv: 'Avanzado',
    mins: 'Min',
    moves: 'Ejercicios',
    secAbs: 'ABDOMEN Y CORE',
    secChest: 'PECHO',
    secArms: 'BRAZOS Y TRÍCEPS',
    secLegs: 'PIERNAS Y GLÚTEOS',
    secBack: 'ESPALDA Y HOMBROS',
    cards: {
      abs_1: { title: 'ABDOMEN PRINCIPIANTE', sub: 'Vientre plano y base de core' },
      abs_2: { title: 'ABDOMEN INTERMEDIO', sub: 'Abdomen inferior y oblicuos' },
      abs_3: { title: 'ABDOMEN AVANZADO', sub: 'Definición six-pack de alta intensidad' },
      chest_1: { title: 'PECHO PRINCIPIANTE', sub: 'Base de flexiones y tono pectoral' },
      chest_2: { title: 'PECHO INTERMEDIO', sub: 'Pecho superior, inferior e interno' },
      chest_3: { title: 'PECHO AVANZADO', sub: 'Potencia explosiva y máximo bombeo' },
      arm_1: { title: 'BRAZOS PRINCIPIANTE', sub: 'Base de bíceps, tríceps y antebrazo' },
      arm_2: { title: 'BRAZOS INTERMEDIO', sub: 'Volumen de brazos sin equipo' },
      leg_1: { title: 'PIERNAS PRINCIPIANTE', sub: 'Sentadillas, zancadas y base inferior' },
      leg_3: { title: 'PIERNAS AVANZADO', sub: 'Cuádriceps, glúteos y gemelos explosivos' },
      back_1: { title: 'ESPALDA Y HOMBROS INICIO', sub: 'Mejora postural y base en V' },
      back_3: { title: 'ESPALDA Y HOMBROS PRO', sub: 'Dorsales amplios y hombros 3D' }
    }
  }
};

export const PROGRAMS = [
  {
    id: 'abs_1',
    section: 'abs',
    level: 1,
    mins: 14,
    kcal: 140,
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    image: '/images/tools/body.jpg',
    moves: [
      { name: 'Jumping Jacks', sets: '30 sn', muscle: 'Kardiyo', tip: 'Kolları tam yukarı aç, ayakları omuz genişliğinde zıpla.' },
      { name: 'Abdominal Crunches', sets: '3 × 16', muscle: 'Üst Karın', tip: 'Boyunu çekmeden kürek kemiklerini yerden kaldır.' },
      { name: 'Russian Twist', sets: '3 × 20', muscle: 'Oblik', tip: 'Gövdeni hafif geriye yatırıp sağa sola kontrollü dön.' },
      { name: 'Mountain Climber', sets: '3 × 20', muscle: 'Alt Karın', tip: 'Plank pozisyonunda dizlerini sırayla göğsüne çek.' },
      { name: 'Plank', sets: '3 × 30 sn', muscle: 'Core', tip: 'Kalçayı düşürmeden tüm merkez bölgeyi sık.' }
    ]
  },
  {
    id: 'abs_2',
    section: 'abs',
    level: 2,
    mins: 18,
    kcal: 195,
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    image: '/images/tools/fasting-v2.jpg',
    moves: [
      { name: 'Bicycle Crunches', sets: '3 × 24', muscle: 'Oblik & Karın', tip: 'Karşı dirsek ile karşı dizi tam sıkıştır.' },
      { name: 'Lying Leg Raises', sets: '3 × 15', muscle: 'Alt Karın', tip: 'Beli yerden kaldırmadan bacakları kontrollü indir.' },
      { name: 'Heel Touch', sets: '3 × 24', muscle: 'Yan Karın', tip: 'Parmak uçlarınla topuklarına dokunarak yanları sık.' },
      { name: 'Side Plank', sets: '2 × 30 sn', muscle: 'Oblik', tip: 'Kalçayı yukarı iterek yan karın hattını aktif tut.' },
      { name: 'Hollow Body Hold', sets: '3 × 25 sn', muscle: 'Derin Core', tip: 'Bel boşluğunu yere bastırıp kol ve bacakları uzat.' }
    ]
  },
  {
    id: 'abs_3',
    section: 'abs',
    level: 3,
    mins: 24,
    kcal: 270,
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    image: '/images/tools/adonis-v2.jpg',
    moves: [
      { name: 'Burpees', sets: '3 × 12', muscle: 'Tam Vücut', tip: 'Şınav + patlayıcı sıçrama ile nabzı zirveye çıkar.' },
      { name: 'V-Ups', sets: '4 × 15', muscle: 'Tüm Karın', tip: 'Kol ve bacakları aynı anda V şeklinde yukarıda buluştur.' },
      { name: 'Flutter Kicks', sets: '4 × 30 sn', muscle: 'Alt Karın', tip: 'Bacakları yere değdirmeden hızlı makas hareketi yap.' },
      { name: 'Plank Jacks', sets: '3 × 24', muscle: 'Karın & Kondisyon', tip: 'Plank sabitken bacakları yanlara zıplatıp kapat.' },
      { name: 'Plank Shoulder Taps', sets: '3 × 24', muscle: 'Core Stabilite', tip: 'Kalçayı oynatmadan ellerinle karşı omuza dokun.' }
    ]
  },
  {
    id: 'chest_1',
    section: 'chest',
    level: 1,
    mins: 15,
    kcal: 155,
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    image: '/images/tools/1rm.jpg',
    moves: [
      { name: 'Incline Push-Ups', sets: '3 × 12', muscle: 'Alt Göğüs', tip: 'Ellerini yüksek bir yüzeye koyarak kontrollü in.' },
      { name: 'Knee Push-Ups', sets: '3 × 12', muscle: 'Göğüs', tip: 'Dizlerin yerde, gövden düz şekilde göğsünü yere yaklaştır.' },
      { name: 'Push-Ups', sets: '3 × 10', muscle: 'Orta Göğüs', tip: 'Dirsekleri 45° açıda tutarak göğsünü yere indir.' },
      { name: 'Wide Arm Push-Ups', sets: '3 × 10', muscle: 'Dış Göğüs', tip: 'Eller omuzdan geniş, göğüs kaslarını tam esnet.' },
      { name: 'Doorway Chest Stretch', sets: '2 × 30 sn', muscle: 'Göğüs Esneme', tip: 'Kolları kapı pervazına dayayıp göğsü ileri nazikçe aç.' }
    ]
  },
  {
    id: 'chest_2',
    section: 'chest',
    level: 2,
    mins: 20,
    kcal: 220,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    image: '/images/tools/buddy.jpg',
    moves: [
      { name: 'Push-Up Shoulder Taps', sets: '4 × 12', muscle: 'Göğüs & Core', tip: 'Her tam şınavın tepesinde karşı omuza dokun.' },
      { name: 'Decline Push-Ups', sets: '3 × 12', muscle: 'Üst Göğüs', tip: 'Ayaklarını yüksek bir yere koyup üst göğse odaklan.' },
      { name: 'Chest Dips', sets: '3 × 10', muscle: 'Alt Göğüs', tip: 'Gövde hafif öne eğik paralel barda alt göğsü yükle.' },
      { name: 'Hindu Push-Ups', sets: '3 × 10', muscle: 'Göğüs & Omuz', tip: 'Akıcı dalga hareketiyle göğsü yere yaklaştırıp yukarı aç.' }
    ]
  },
  {
    id: 'chest_3',
    section: 'chest',
    level: 3,
    mins: 26,
    kcal: 290,
    gradient: 'linear-gradient(135deg, #be123c 0%, #881337 100%)',
    image: '/images/tools/metabolic-v2.jpg',
    moves: [
      { name: 'Explosive Push-Ups', sets: '4 × 10', muscle: 'Patlayıcı Göğüs', tip: 'Göğüsten tüm gücünle iterek ellerini yerden kes.' },
      { name: 'Archer Push-Ups', sets: '3 × 12', muscle: 'Tek Kol Göğüs', tip: 'Bir kolunu yana açıp ağırlığı diğer göğse yükle.' },
      { name: 'Typewriter Push-Ups', sets: '3 × 10', muscle: 'İç & Dış Göğüs', tip: 'Alçak şınav noktasında bir elden diğerine yatay kay.' },
      { name: 'Weighted Push-Ups', sets: '3 × 10', muscle: 'Göğüs Güç & Hacim', tip: '4 saniye yavaş iniş veya sırt ağırlığıyla derin itiş.' }
    ]
  },
  {
    id: 'arm_1',
    section: 'arms',
    level: 1,
    mins: 14,
    kcal: 135,
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    image: '/images/tools/tabata.jpg',
    moves: [
      { name: 'Arm Circles', sets: '2 × 30 sn', muscle: 'Omuz & Kol Isınma', tip: 'Kolları yana açıp küçük ve kontrollü daireler çiz.' },
      { name: 'Chair Triceps Dips', sets: '3 × 12', muscle: 'Triceps', tip: 'Sırtını sandalyeye yakın tutarak dirseklerini 90° bük.' },
      { name: 'Wall Push-Ups', sets: '3 × 15', muscle: 'Triceps & Ön Kol', tip: 'Eller duvarda omuzdan dar tutuşla kontrollü it.' },
      { name: 'Crab Walk', sets: '3 × 20 sn', muscle: 'Arka Kol & Omuz', tip: 'Ters masa duruşunda dirsek gerginliğiyle ileri-geri yürü.' }
    ]
  },
  {
    id: 'arm_2',
    section: 'arms',
    level: 2,
    mins: 19,
    kcal: 205,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    image: '/images/tools/genetic.jpg',
    moves: [
      { name: 'Diamond Push-Ups', sets: '4 × 12', muscle: 'Triceps & İç Göğüs', tip: 'Eller üçgen formda arka kolu yakana kadar kontrollü in.' },
      { name: 'Bench Triceps Dips', sets: '3 × 15', muscle: 'Triceps', tip: 'Bacaklar önde düz sehpadan derin iniş ve kilit itiş.' },
      { name: 'Towel Biceps Rows', sets: '3 × 12', muscle: 'Biceps & Ön Kol', tip: 'Sağlam havlu direnciyle dirsekleri gövdeye doğru bük.' },
      { name: 'Inchworm Walkouts', sets: '3 × 10', muscle: 'Kol & Omuz Stabilite', tip: 'Ayaklar sabitken ellerle ileri plank konumuna yürü ve dön.' }
    ]
  },
  {
    id: 'leg_1',
    section: 'legs',
    level: 1,
    mins: 16,
    kcal: 185,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    image: '/images/tools/form_check.jpg',
    moves: [
      { name: 'Bodyweight Squat', sets: '3 × 16', muscle: 'Quad & Kalça', tip: 'Topukların yerde, kalçayı geriye iterek paralel in.' },
      { name: 'Forward Lunges', sets: '3 × 16', muscle: 'Bacak & Kalça', tip: 'Gövde dik, öne adımla arka diz yere yaklaşana dek in.' },
      { name: 'Glute Bridge', sets: '3 × 15', muscle: 'Kalça & Hamstring', tip: 'Tepede kalçayı 1 saniye sertçe sık.' },
      { name: 'Calf Raises', sets: '3 × 20', muscle: 'Kalf', tip: 'Parmak ucunda en tepeye çıkıp 1 sn bekle.' }
    ]
  },
  {
    id: 'leg_3',
    section: 'legs',
    level: 3,
    mins: 24,
    kcal: 310,
    gradient: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
    image: '/images/tools/recovery.jpg',
    moves: [
      { name: 'Jump Squats', sets: '4 × 15', muscle: 'Patlayıcı Quad', tip: 'Derin çömelip patlayıcı şekilde yukarı sıçra.' },
      { name: 'Bulgarian Split Squat', sets: '3 × 12', muscle: 'Quad & Kalça', tip: 'Arka ayağı koltuk/sandalyeye koyup tek bacak çök.' },
      { name: 'Skater Hops', sets: '3 × 18', muscle: 'Yan Kalça & Kondisyon', tip: 'Tek ayaktan yanlamasına diğerine patlayıcı sıçra.' },
      { name: 'Wall Sit', sets: '3 × 45 sn', muscle: 'Quad Dayanıklılık', tip: 'Sırt duvara yaslı, dizler 90° açıda bekle.' }
    ]
  },
  {
    id: 'back_1',
    section: 'back',
    level: 1,
    mins: 15,
    kcal: 145,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    image: '/images/tools/hydration.jpg',
    moves: [
      { name: 'Superman Hold', sets: '3 × 15', muscle: 'Alt Sırt', tip: 'Yüzüstü uzanıp kol ve bacakları aynı anda yerden kaldır.' },
      { name: 'Prone Y Raises', sets: '3 × 12', muscle: 'Alt Trapez & Omuz', tip: 'Kolları Y açısında öne uzatarak kürek kemiklerini çek.' },
      { name: 'Pike Push-Ups', sets: '3 × 10', muscle: 'Ön & Yan Omuz', tip: 'Kalça yukarıda ters V pozisyonunda başını yere yaklaştır.' },
      { name: 'Bird Dog', sets: '3 × 16', muscle: 'Omurga & Postür', tip: 'Dört ayak üzerinde çapraz kol ve bacağı düz hizada uzat.' }
    ]
  },
  {
    id: 'back_3',
    section: 'back',
    level: 3,
    mins: 22,
    kcal: 245,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    image: '/images/tools/form_check.jpg',
    moves: [
      { name: 'Elevated Pike Push-Ups', sets: '4 × 12', muscle: 'Omuz Başları', tip: 'Ayaklar yüksekte dikey omuz itişi yap.' },
      { name: 'Doorway Rows', sets: '4 × 12', muscle: 'Sırt & Kanat', tip: 'Kapı çerçevesinden kürek kemiklerini sıkarak çekil.' },
      { name: 'Prone T Raises', sets: '3 × 14', muscle: 'Arka Omuz & Orta Sırt', tip: 'Yüzüstü kolları T harfi şeklinde yanlara kaldırıp sık.' },
      { name: 'Reverse Snow Angels', sets: '3 × 15', muscle: 'Arka Omuz & Trapez', tip: 'Geniş kavisle geriye çekip sırt kaslarını 2 saniye kilitle.' }
    ]
  }
];

function LightningRating({ level }) {
  return (
    <span className="fx-leapBolts" aria-label={`Level ${level}`}>
      {[1, 2, 3].map((n) => (
        <Zap
          key={n}
          size={13}
          fill={n <= level ? '#fff' : 'transparent'}
          color={n <= level ? '#fff' : 'rgba(255,255,255,0.4)'}
        />
      ))}
    </span>
  );
}

export default function LeapWorkoutCatalog({ entries = {}, onStartWorkout, streak = {} }) {
  const { lang, t } = useI18n();
  const copy = LEAP_COPY[lang] || LEAP_COPY.tr;
  const [levelFilter, setLevelFilter] = useState('all');

  const totalWorkouts = (entries.workout || []).length;
  const totalMinutes = Math.round(
    (entries.workout || []).reduce((sum, w) => sum + (Number(w.payload?.durationSeconds) || 900) / 60, 0)
  );
  const last7 = streak.last7 || [];
  const activeThisWeek = last7.filter((d) => d.active).length;

  const startProgram = (prog, customTitle) => {
    sounds.tap();
    if (onStartWorkout) {
      onStartWorkout({
        name: customTitle,
        focus: `${prog.mins} ${copy.mins} · ${prog.moves.length} ${copy.moves}`,
        moves: prog.moves
      });
    }
  };

  const sections = [
    ['abs', copy.secAbs],
    ['chest', copy.secChest],
    ['arms', copy.secArms],
    ['legs', copy.secLegs],
    ['back', copy.secBack]
  ];

  return (
    <div className="fx-leapCatalog">
      {/* 1. HAFTALIK HEDEF 7 GÜN ŞERİDİ (EV EGZERSİZLERİ İMZA KARTI) */}
      <section className="fx-leapWeeklyCard">
        <div className="fx-leapWeeklyTop">
          <div>
            <span className="fx-leapEyebrow">{copy.weeklyGoal}</span>
            <h3 className="fx-leapWeeklyCount">
              {activeThisWeek} <span>/ 7</span>
            </h3>
          </div>
          <div className="fx-leapStatsRow">
            <div className="fx-leapStatCell">
              <b>{totalWorkouts}</b>
              <small>{copy.workouts}</small>
            </div>
            <div className="fx-leapStatCell">
              <b>{totalMinutes}</b>
              <small>{copy.minutes}</small>
            </div>
            <div className="fx-leapStatCell">
              <b>{streak.current || 0} 🔥</b>
              <small>{t('header.dayShort')}</small>
            </div>
          </div>
        </div>

        <div className="fx-leapWeekDays">
          {last7.map((d) => (
            <div
              key={d.day}
              className={`fx-leapDayPill ${d.active ? 'done' : ''} ${d.isToday ? 'today' : ''}`}
            >
              <span className="fx-leapDayLabel">{d.label}</span>
              <div className="fx-leapDayCircle">
                {d.active ? <Check size={13} strokeWidth={3} /> : d.day.slice(-2)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 28 GÜNLÜK MEYDAN OKUMA HERO BANNERI */}
      <section
        className="fx-leapChallengeBanner"
        onClick={() => startProgram(PROGRAMS[2], copy.challengeTitle)}
        role="button"
        tabIndex={0}
      >
        <div className="fx-leapChallengeBody">
          <span className="fx-leapChallengeBadge">
            <Trophy size={12} /> {copy.challengeTag}
          </span>
          <h2>{copy.challengeTitle}</h2>
          <p>{copy.challengeSub}</p>
          <span className="fx-leapChallengeBtn">
            <Play size={14} fill="currentColor" /> {copy.startNow}
          </span>
        </div>
      </section>

      {/* 3. SEVİYE FİLTRE ÇUBUĞU */}
      <div className="fx-leapFilterRow">
        {[
          ['all', copy.filterAll],
          [1, `⚡ ${copy.filterBeg}`],
          [2, `⚡⚡ ${copy.filterInt}`],
          [3, `⚡⚡⚡ ${copy.filterAdv}`]
        ].map(([val, label]) => (
          <button
            key={String(val)}
            type="button"
            className={`fx-leapFilterChip ${levelFilter === val ? 'active' : ''}`}
            onClick={() => {
              sounds.tap();
              setLevelFilter(val);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 4. KAS GRUBU BÖLÜMLERİ (KARIN, GÖĞÜS, KOL, BACAK, SIRT & OMUZ) */}
      {sections.map(([secId, secTitle]) => {
        const items = PROGRAMS.filter(
          (p) => p.section === secId && (levelFilter === 'all' || p.level === levelFilter)
        );
        if (!items.length) return null;

        return (
          <div key={secId} className="fx-leapSection">
            <div className="fx-leapSectionHead">
              <h3>{secTitle}</h3>
              <span>{items.length}</span>
            </div>

            <div className="fx-leapCardsStack">
              {items.map((prog) => {
                const c = copy.cards[prog.id];
                return (
                  <button
                    key={prog.id}
                    type="button"
                    className="fx-leapProgramCard"
                    onClick={() => startProgram(prog, c.title)}
                    style={{
                      backgroundImage: `${prog.gradient}, url('${prog.image}')`
                    }}
                  >
                    <div className="fx-leapCardOverlay" />
                    <div className="fx-leapCardContent">
                      <div className="fx-leapCardTop">
                        <LightningRating level={prog.level} />
                        <span className="fx-leapCardMetaPill">
                          <Clock size={11} /> {prog.mins} {copy.mins} · {prog.moves.length} {copy.moves}
                        </span>
                      </div>

                      <div className="fx-leapCardBottom">
                        <div>
                          <h4>{c.title}</h4>
                          <p>{c.sub}</p>
                        </div>
                        <span className="fx-leapGoCircle">
                          <ChevronRight size={18} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
