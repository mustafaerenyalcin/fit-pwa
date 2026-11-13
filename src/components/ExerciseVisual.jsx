import React from 'react';

function detectPoseVariant(name = '') {
  const n = (name || '').toLowerCase();
  if (/(jumping jack|burpee|high knee|cardio|arm circle)/i.test(n)) return 'jacks';
  if (/(leg raise|flutter|dead bug|reverse crunch|v-up)/i.test(n)) return 'leg_raise';
  if (/(mountain climber|spiderman|plank|hollow)/i.test(n)) return 'plank';
  if (/(crunch|mekik|bicycle|russian twist|heel touch|ab wheel|karın|abs)/i.test(n)) return 'crunch';
  if (/(cobra|superman|prone y-t-w|snow angel)/i.test(n)) return 'prone';
  if (/(glute bridge|hip thrust|köprü)/i.test(n)) return 'bridge';
  if (/(dip|kickback|pushdown)/i.test(n)) return 'dips';
  if (/(bulgarian)/i.test(n)) return 'bulgarian';
  if (/(lunge|split squat)/i.test(n)) return 'lunge';
  if (/(deadlift|rdl)/i.test(n)) return 'rdl';
  if (/(squat|wall sit|calf|leg press|bacak|leg)/i.test(n)) return 'squat';
  if (/(incline push)/i.test(n)) return 'incline_pushup';
  if (/(decline push)/i.test(n)) return 'decline_pushup';
  if (/(knee push)/i.test(n)) return 'knee_pushup';
  if (/(push-up|push up|şınav|sinav|pseudo planche|archer|hindu|dive bomber)/i.test(n)) return 'pushup';
  if (/(curl|biceps)/i.test(n)) return 'curl';
  if (/(row|pull|barfiks|kürek|reverse fly|rear delt fly|face pull)/i.test(n)) return 'row';
  if (/(lateral raise|fly)/i.test(n)) return 'fly';
  if (/(bench press|floor press|chest press|incline.*press)/i.test(n)) return 'bench_press';
  if (/(press|raise|triceps extension|omuz|shoulder|göğüs|chest|bench)/i.test(n)) return 'press';
  return 'pushup';
}

const POSE_STEPS = {
  incline_pushup: {
    label: 'Eğimli Şınav (Sehpa / Duvar)',
    step1: 'Ellerini yüksek sehpaya omuz genişliğinde koy, vücudun düz olsun.',
    step2: 'Göğsünü sehpaya yaklaştırıp kontrollü şekilde yukarı it.',
  },
  decline_pushup: {
    label: 'Ayak Yüksekte Şınav',
    step1: 'Ayaklarını sehpa/koltuk üzerine yerleştir, eller yerde.',
    step2: 'Üst göğsünü yere doğru indirip nefes vererek yukarı it.',
  },
  knee_pushup: {
    label: 'Diz Üstü Şınav',
    step1: 'Dizlerini matın üzerine koy, belini çukurlaştırmadan düz tut.',
    step2: 'Dirsekleri 45° geriye bükerek göğsü yere yaklaştır ve it.',
  },
  pushup: {
    label: 'Şınav Pozisyonu',
    step1: 'Eller omuz hizasında, karın ve kalça sıkı düz bir çizgide.',
    step2: 'Göğsü yere yaklaştır (2 sn), patlayıcı şekilde yukarı it.',
  },
  squat: {
    label: 'Çömelme (Squat) Formu',
    step1: 'Ayaklar omuz genişliğinde, göğüs dik ve ağırlık topuklarda.',
    step2: 'Kalçayı geriye iterek dizleri bük, paralel inip kalçayı sıkarak kalk.',
  },
  rdl: {
    label: 'Kalça Menteşesi (Romanian Deadlift)',
    step1: 'Dizler hafif bükülü, sırt tamamen düz, ağırlıklar bacak önünde.',
    step2: 'Kalçayı geriye iterek öne eğil, arka bacağı ger ve dikel.',
  },
  lunge: {
    label: 'Adım Çömelme (Lunge)',
    step1: 'Bir adım öne at, gövde dik ve karın sıkı.',
    step2: 'Arka diz yere yaklaşana kadar in, ön topuktan güç alarak kalk.',
  },
  bulgarian: {
    label: 'Tek Bacak Sehpa Squat',
    step1: 'Arka ayağının üstünü sehpaya koy, ön ayakla denge kur.',
    step2: 'Ön dizin parmak ucunu geçmeden dikey in ve topuktan it.',
  },
  crunch: {
    label: 'Karın Sıkıştırma (Crunch)',
    step1: 'Sırtüstü yat, dizler bükülü ve belin mata tam temas etsin.',
    step2: 'Boynu çekmeden kürek kemiklerini yerden kaldırıp karnı sık.',
  },
  leg_raise: {
    label: 'Bacak Kaldırma / Core Kontrol',
    step1: 'Belini mata bastır, eller kalça yanında destek pozisyonunda.',
    step2: 'Bacakları kontrollü indirip bel kalkmadan yukarı topla.',
  },
  plank: {
    label: 'Plank & Core Stabilizasyon',
    step1: 'Dirsek veya eller omuz altında, baştan topuğa düz hat.',
    step2: 'Kalçayı düşürmeden karnı sık; hareketli varyasyonda dizi göğse çek.',
  },
  bridge: {
    label: 'Kalça Köprüsü (Glute Bridge)',
    step1: 'Sırtüstü yat, topuklar kalçaya yakın ve dizler bükülü.',
    step2: 'Topuklardan iterek kalçayı yukarı kaldır, tepede 1 sn sık.',
  },
  prone: {
    label: 'Yüzüstü Sırt & Omurga Aktivasyonu',
    step1: 'Yüzüstü uzan, boyun nötr ve bakışlar aşağıda.',
    step2: 'Göğsü ve kolları kontrollü kaldırıp sırt kaslarını sık.',
  },
  dips: {
    label: 'Triceps Dips (Arka Kol)',
    step1: 'Eller sehpa kenarında, göğüs açık ve kalça sehpaya yakın.',
    step2: 'Dirsekleri geriye bükerek in, arka kolu sıkarak yukarı it.',
  },
  jacks: {
    label: 'Dinamik Kardiyo / Isınma',
    step1: 'Ayaklar bitişik veya atletik duruşta, omurga dik.',
    step2: 'Kolları ve bacakları ritmik açıp kapatarak tempoyu koru.',
  },
  curl: {
    label: 'Biceps Bükme (Curl)',
    step1: 'Dirsekler gövdeye sabit, bilekler düz.',
    step2: 'Sadece ön kolu yukarı kaldırıp biceps’i sık, yavaşça indir.',
  },
  row: {
    label: 'Sırt Çekişi (Row / Pull)',
    step1: 'Gövde öne eğik veya dik, sırt düz ve omuzlar geride.',
    step2: 'Dirsekleri geriye çekerek kürek kemiklerini birbirine yaklaştır.',
  },
  fly: {
    label: 'Yana Açış (Raise / Fly)',
    step1: 'Dirsekler hafif bükülü sabit, omuzlar kulaklardan uzak.',
    step2: 'Kolları omuz hizasına kadar yarım daire şeklinde aç ve yavaş indir.',
  },
  bench_press: {
    label: 'Yatarak İtiş (Floor / Bench Press)',
    step1: 'Sırtüstü pozisyonda kürek kemikleri sıkı, ağırlıklar göğüs hizasında.',
    step2: 'Dirsekleri 45° açıyla indirip göğsü sıkarak yukarı it.',
  },
  press: {
    label: 'Üst İtiş (Shoulder / Overhead Press)',
    step1: 'Karın sıkı, ağırlıklar kulak/omuz hizasında.',
    step2: 'Beli bükmeden baş üzerine doğru düz it ve kontrollü indir.',
  },
};

export default function ExerciseVisual({ name = '', size = 'compact', muscle = '', tip = '' }) {
  const pose = detectPoseVariant(name);
  const isStage = size === 'stage';
  const guide = POSE_STEPS[pose] || POSE_STEPS.pushup;

  return (
    <div
      className={`exerciseVisual fx-animStage fx-animStage--${size}`}
      title={name}
    >
      <div className="fx-animStageBadgeRow">
        <span className="fx-animLiveDot" />
        <span>CANLI FORM REHBERİ</span>
        <span className="fx-animPoseSub">{guide.label}</span>
        {muscle && <span className="fx-animMuscleTag">{muscle}</span>}
      </div>

      <svg
        viewBox="0 0 320 164"
        className={`exerciseVisualSvg fx-animSvg fx-anim-${pose}`}
        width="100%"
        height={isStage ? 185 : 96}
        aria-label={`${name} animated anatomical demonstration`}
      >
        <defs>
          <linearGradient id="fxSkin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="fxSuit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="fxMuscle" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff5e57" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="fxBench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <filter id="fxGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Studio Floor & Mat */}
        <ellipse cx="160" cy="146" rx="128" ry="8" fill="currentColor" fillOpacity="0.08" />
        <rect x="44" y="140" width="232" height="6" rx="3" fill="#007aff" fillOpacity="0.22" />

        {/* INCLINE PUSH-UP (Elevated Bench) */}
        {pose === 'incline_pushup' && (
          <g>
            {/* Elevated Bench */}
            <rect x="64" y="96" width="52" height="10" rx="4" fill="url(#fxBench)" />
            <rect x="72" y="106" width="8" height="34" rx="2" fill="#334155" />
            <rect x="100" y="106" width="8" height="34" rx="2" fill="#334155" />
            {/* Motion Arrow */}
            <path d="M 136 52 L 136 82" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="136,88 131,79 141,79" fill="#22c55e" />
            <g className="fx-pushup-body">
              {/* Leg + Foot */}
              <path d="M 164 102 L 222 132" stroke="url(#fxSuit)" strokeWidth="14" strokeLinecap="round" />
              <ellipse cx="228" cy="136" rx="9" ry="5" fill="#e2e8f0" />
              {/* Sculpted Torso */}
              <path d="M 110 66 L 166 102" stroke="url(#fxSuit)" strokeWidth="19" strokeLinecap="round" />
              {/* Highlighted Chest */}
              <ellipse cx="122" cy="76" rx="14" ry="8" transform="rotate(32 122 76)" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
              {/* Head */}
              <circle cx="96" cy="52" r="11" fill="url(#fxSkin)" />
              {/* Arm to Bench */}
              <path d="M 114 70 L 94 84 L 94 96" fill="none" stroke="url(#fxSkin)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}

        {/* DECLINE PUSH-UP (Feet on Bench) */}
        {pose === 'decline_pushup' && (
          <g>
            <rect x="206" y="100" width="52" height="10" rx="4" fill="url(#fxBench)" />
            <rect x="214" y="110" width="8" height="30" rx="2" fill="#334155" />
            <rect x="242" y="110" width="8" height="30" rx="2" fill="#334155" />
            <path d="M 100 84 L 100 116" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="100,122 95,113 105,113" fill="#22c55e" />
            <g className="fx-pushup-body">
              <path d="M 164 104 L 220 96" stroke="url(#fxSuit)" strokeWidth="14" strokeLinecap="round" />
              <ellipse cx="224" cy="96" rx="7" ry="6" fill="#e2e8f0" />
              <path d="M 106 108 L 166 104" stroke="url(#fxSuit)" strokeWidth="19" strokeLinecap="round" />
              <ellipse cx="118" cy="110" rx="14" ry="8" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
              <circle cx="90" cy="98" r="11" fill="url(#fxSkin)" />
              <path d="M 110 112 L 96 126 L 106 138" fill="none" stroke="url(#fxSkin)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}

        {/* KNEE PUSH-UP */}
        {pose === 'knee_pushup' && (
          <g>
            <path d="M 112 72 L 112 106" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="112,112 107,103 117,103" fill="#22c55e" />
            <g className="fx-pushup-body">
              {/* Thigh on mat + lower leg lifted */}
              <path d="M 176 116 L 204 136 L 228 116" fill="none" stroke="url(#fxSuit)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 112 86 L 176 116" stroke="url(#fxSuit)" strokeWidth="19" strokeLinecap="round" />
              <ellipse cx="126" cy="95" rx="14" ry="8" transform="rotate(24 126 95)" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
              <circle cx="96" cy="74" r="11" fill="url(#fxSkin)" />
              <path d="M 116 90 L 102 114 L 110 138" fill="none" stroke="url(#fxSkin)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}

        {/* STANDARD PUSH-UP */}
        {pose === 'pushup' && (
          <g>
            <path d="M 112 70 L 112 104" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="112,110 107,101 117,101" fill="#22c55e" />
            <g className="fx-pushup-body">
              <path d="M 168 114 L 232 135" stroke="url(#fxSuit)" strokeWidth="14" strokeLinecap="round" />
              <ellipse cx="238" cy="137" rx="9" ry="5" fill="#e2e8f0" />
              <path d="M 106 90 L 168 114" stroke="url(#fxSuit)" strokeWidth="19" strokeLinecap="round" />
              <ellipse cx="122" cy="98" rx="15" ry="8" transform="rotate(20 122 98)" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
              <circle cx="90" cy="78" r="11" fill="url(#fxSkin)" />
              <path d="M 110 94 L 96 116 L 106 138" fill="none" stroke="url(#fxSkin)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}

        {/* SQUAT */}
        {pose === 'squat' && (
          <g>
            <path d="M 112 42 L 112 88" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="112,94 107,85 117,85" fill="#22c55e" />
            <g className="fx-squat-torso">
              <circle cx="164" cy="36" r="11.5" fill="url(#fxSkin)" />
              <path d="M 162 49 L 152 88" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
              <path d="M 160 56 L 188 64 L 204 60" fill="none" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g className="fx-squat-legs">
              {/* Thigh (Quads Highlight) */}
              <path d="M 152 88 L 186 102" stroke="url(#fxMuscle)" strokeWidth="16" strokeLinecap="round" filter="url(#fxGlow)" />
              {/* Shin */}
              <path d="M 186 102 L 168 136" stroke="url(#fxSuit)" strokeWidth="13" strokeLinecap="round" />
              <ellipse cx="176" cy="138" rx="11" ry="5" fill="#e2e8f0" />
            </g>
          </g>
        )}

        {/* ROMANIAN DEADLIFT (HIP HINGE) */}
        {pose === 'rdl' && (
          <g>
            <path d="M 205 64 Q 218 86 205 108" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="204,113 200,103 210,106" fill="#22c55e" />
            {/* Legs & Hamstrings Highlight */}
            <path d="M 152 86 L 158 136" stroke="url(#fxSuit)" strokeWidth="15" strokeLinecap="round" />
            <path d="M 146 86 L 150 116" stroke="url(#fxMuscle)" strokeWidth="8" strokeLinecap="round" filter="url(#fxGlow)" />
            <ellipse cx="164" cy="138" rx="11" ry="5" fill="#e2e8f0" />
            <g className="fx-crunch-torso" style={{ transformOrigin: '152px 86px' }}>
              <path d="M 152 86 L 188 54" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
              <circle cx="198" cy="44" r="11" fill="url(#fxSkin)" />
              {/* Arm + Dumbbell */}
              <path d="M 182 58 L 184 96" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" />
              <rect x="174" y="96" width="20" height="8" rx="3" fill="#94a3b8" />
            </g>
          </g>
        )}

        {/* LUNGE & BULGARIAN SPLIT SQUAT */}
        {(pose === 'lunge' || pose === 'bulgarian') && (
          <g>
            {pose === 'bulgarian' && (
              <g>
                <rect x="76" y="106" width="42" height="9" rx="3" fill="url(#fxBench)" />
                <rect x="92" y="115" width="8" height="25" rx="2" fill="#334155" />
              </g>
            )}
            <path d="M 122 50 L 122 86" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="122,92 117,83 127,83" fill="#22c55e" />
            <g className="fx-squat-torso">
              <circle cx="160" cy="36" r="11" fill="url(#fxSkin)" />
              <path d="M 160 48 L 160 88" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
              <path d="M 160 56 L 148 80" stroke="url(#fxSkin)" strokeWidth="9" strokeLinecap="round" />
            </g>
            {/* Front Leg (Highlighted) */}
            <path d="M 160 88 L 198 98 L 198 136" fill="none" stroke="url(#fxMuscle)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" filter="url(#fxGlow)" />
            <ellipse cx="204" cy="138" rx="10" ry="5" fill="#e2e8f0" />
            {/* Rear Leg */}
            <path d={pose === 'bulgarian' ? 'M 160 88 L 122 112 L 102 106' : 'M 160 88 L 124 114 L 114 136'} fill="none" stroke="url(#fxSuit)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* CRUNCH */}
        {pose === 'crunch' && (
          <g>
            <path d="M 102 72 Q 124 58 144 72" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="148,76 138,76 144,67" fill="#22c55e" />
            {/* Bent Legs */}
            <path d="M 166 130 L 198 92 L 222 134" fill="none" stroke="url(#fxSuit)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="228" cy="136" rx="9" ry="5" fill="#e2e8f0" />
            {/* Curling Torso + Abs */}
            <g className="fx-crunch-torso" style={{ transformOrigin: '166px 130px' }}>
              <path d="M 166 130 L 112 104" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
              <ellipse cx="140" cy="116" rx="16" ry="8" transform="rotate(26 140 116)" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
              <circle cx="96" cy="96" r="11" fill="url(#fxSkin)" />
              <path d="M 118 106 L 106 86" stroke="url(#fxSkin)" strokeWidth="8.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* LEG RAISE / DEAD BUG */}
        {pose === 'leg_raise' && (
          <g>
            <path d="M 222 122 Q 214 88 186 76" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="180,74 190,71 187,81" fill="#22c55e" />
            {/* Lying Torso */}
            <circle cx="88" cy="124" r="11" fill="url(#fxSkin)" />
            <path d="M 102 128 L 164 128" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
            <ellipse cx="136" cy="126" rx="16" ry="7" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
            {/* Animated Raising Legs */}
            <g className="fx-crunch-torso" style={{ transformOrigin: '164px 128px' }}>
              <path d="M 164 128 L 226 112" stroke="url(#fxSuit)" strokeWidth="14" strokeLinecap="round" />
              <ellipse cx="232" cy="110" rx="8" ry="5" fill="#e2e8f0" />
            </g>
          </g>
        )}

        {/* PLANK */}
        {pose === 'plank' && (
          <g>
            <circle cx="92" cy="84" r="11" fill="url(#fxSkin)" />
            <path d="M 106 92 L 214 114" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
            <ellipse cx="154" cy="102" rx="22" ry="8" transform="rotate(11 154 102)" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
            {/* Forearm */}
            <path d="M 110 96 L 106 132 L 90 135" fill="none" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Rear Leg */}
            <path d="M 214 114 L 236 136" stroke="url(#fxSuit)" strokeWidth="13" strokeLinecap="round" />
            {/* Knee Drive */}
            <path d="M 206 114 L 178 118 L 188 136" fill="none" stroke="url(#fxSkin)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" className="fx-plank-knee" />
          </g>
        )}

        {/* GLUTE BRIDGE */}
        {pose === 'bridge' && (
          <g>
            <path d="M 158 118 L 158 84" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="158,78 153,87 163,87" fill="#22c55e" />
            <circle cx="88" cy="124" r="11" fill="url(#fxSkin)" />
            <g className="fx-bridge-hips">
              <path d="M 102 128 L 160 96 L 204 134" fill="none" stroke="url(#fxSuit)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="160" cy="98" rx="15" ry="9" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
            </g>
            <ellipse cx="212" cy="136" rx="10" ry="5" fill="#e2e8f0" />
          </g>
        )}

        {/* PRONE (COBRA / SUPERMAN / SNOW ANGELS) */}
        {pose === 'prone' && (
          <g>
            <path d="M 104 118 L 104 86" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="104,80 99,89 109,89" fill="#22c55e" />
            <path d="M 164 130 L 228 134" stroke="url(#fxSuit)" strokeWidth="14" strokeLinecap="round" />
            <g className="fx-bridge-hips">
              <path d="M 164 130 L 114 102" stroke="url(#fxSuit)" strokeWidth="19" strokeLinecap="round" />
              <ellipse cx="136" cy="114" rx="15" ry="8" transform="rotate(28 136 114)" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
              <circle cx="102" cy="90" r="11" fill="url(#fxSkin)" />
              <path d="M 116 106 L 104 136" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* TRICEPS DIPS */}
        {pose === 'dips' && (
          <g>
            <rect x="68" y="92" width="44" height="10" rx="4" fill="url(#fxBench)" />
            <rect x="74" y="102" width="8" height="38" rx="2" fill="#334155" />
            <rect x="98" y="102" width="8" height="38" rx="2" fill="#334155" />
            <path d="M 148 56 L 148 92" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="148,98 143,89 153,89" fill="#22c55e" />
            <g className="fx-dips-body">
              <circle cx="128" cy="48" r="11" fill="url(#fxSkin)" />
              <path d="M 128 60 L 128 98" stroke="url(#fxSuit)" strokeWidth="19" strokeLinecap="round" />
              <path d="M 128 66 L 104 78 L 104 92" fill="none" stroke="url(#fxMuscle)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" filter="url(#fxGlow)" />
              <path d="M 128 98 L 182 108 L 200 136" fill="none" stroke="url(#fxSuit)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="206" cy="138" rx="9" ry="5" fill="#e2e8f0" />
            </g>
          </g>
        )}

        {/* JUMPING JACKS / CARDIO */}
        {pose === 'jacks' && (
          <g>
            <circle cx="160" cy="34" r="11" fill="url(#fxSkin)" />
            <path d="M 160 46 L 160 92" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
            <ellipse cx="160" cy="68" rx="11" ry="16" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
            <g className="fx-jacks-arms">
              <path d="M 116 34 L 142 56 L 160 56 L 178 56 L 204 34" fill="none" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g className="fx-jacks-legs" style={{ transformOrigin: '160px 92px' }}>
              <path d="M 134 136 L 152 104 L 160 92 L 168 104 L 186 136" fill="none" stroke="url(#fxSuit)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}

        {/* BICEPS CURL */}
        {pose === 'curl' && (
          <g>
            <path d="M 192 94 Q 204 72 192 54" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="190,49 186,59 196,57" fill="#22c55e" />
            <circle cx="154" cy="34" r="11" fill="url(#fxSkin)" />
            <path d="M 154 46 L 154 92" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
            <path d="M 154 92 L 154 136" stroke="url(#fxSuit)" strokeWidth="15" strokeLinecap="round" />
            <ellipse cx="160" cy="138" rx="10" ry="5" fill="#e2e8f0" />
            {/* Upper Arm */}
            <path d="M 156 54 L 156 80" stroke="url(#fxMuscle)" strokeWidth="11" strokeLinecap="round" filter="url(#fxGlow)" />
            {/* Animated Forearm + Dumbbell */}
            <g className="fx-crunch-torso" style={{ transformOrigin: '156px 80px' }}>
              <path d="M 156 80 L 184 62" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" />
              <rect x="179" y="53" width="14" height="10" rx="3" fill="#94a3b8" />
            </g>
          </g>
        )}

        {/* ROW / PULL */}
        {pose === 'row' && (
          <g>
            <path d="M 176 112 L 176 78" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="176,72 171,81 181,81" fill="#22c55e" />
            <path d="M 142 90 L 146 136" stroke="url(#fxSuit)" strokeWidth="15" strokeLinecap="round" />
            <path d="M 142 90 L 182 64" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
            <ellipse cx="162" cy="76" rx="14" ry="8" transform="rotate(-32 162 76)" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
            <circle cx="194" cy="54" r="11" fill="url(#fxSkin)" />
            <g className="fx-press-arms">
              <path d="M 176 68 L 176 106" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" />
              <rect x="166" y="106" width="20" height="8" rx="3" fill="#94a3b8" />
            </g>
          </g>
        )}

        {/* LATERAL RAISE / FLY */}
        {pose === 'fly' && (
          <g>
            <circle cx="160" cy="34" r="11" fill="url(#fxSkin)" />
            <path d="M 160 46 L 160 92" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
            <ellipse cx="160" cy="56" rx="20" ry="9" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
            <path d="M 146 136 L 154 92 L 166 92 L 174 136" fill="none" stroke="url(#fxSuit)" strokeWidth="13" strokeLinecap="round" />
            <g className="fx-jacks-arms">
              <path d="M 110 56 L 142 56 L 178 56 L 210 56" fill="none" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" />
              <rect x="102" y="51" width="12" height="10" rx="3" fill="#94a3b8" />
              <rect x="206" y="51" width="12" height="10" rx="3" fill="#94a3b8" />
            </g>
          </g>
        )}

        {/* BENCH / FLOOR PRESS */}
        {pose === 'bench_press' && (
          <g>
            <rect x="84" y="106" width="120" height="11" rx="4" fill="url(#fxBench)" />
            <rect x="98" y="117" width="10" height="23" rx="2" fill="#334155" />
            <rect x="180" y="117" width="10" height="23" rx="2" fill="#334155" />
            <circle cx="96" cy="96" r="10.5" fill="url(#fxSkin)" />
            <path d="M 108 100 L 168 100" stroke="url(#fxSuit)" strokeWidth="18" strokeLinecap="round" />
            <ellipse cx="128" cy="96" rx="15" ry="7" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
            <path d="M 168 100 L 198 102 L 206 136" fill="none" stroke="url(#fxSuit)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            <g className="fx-press-arms">
              <path d="M 128 96 L 128 58" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" />
              <rect x="116" y="52" width="24" height="8" rx="3" fill="#94a3b8" />
            </g>
          </g>
        )}

        {/* OVERHEAD PRESS */}
        {pose === 'press' && (
          <g>
            <path d="M 110 72 L 110 38" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="3 3" />
            <polygon points="110,32 105,41 115,41" fill="#22c55e" />
            <circle cx="160" cy="36" r="11" fill="url(#fxSkin)" />
            <path d="M 160 48 L 160 92" stroke="url(#fxSuit)" strokeWidth="20" strokeLinecap="round" />
            <ellipse cx="160" cy="56" rx="18" ry="8" fill="url(#fxMuscle)" filter="url(#fxGlow)" />
            <path d="M 146 136 L 154 92 L 166 92 L 174 136" fill="none" stroke="url(#fxSuit)" strokeWidth="13" strokeLinecap="round" />
            <g className="fx-press-arms">
              <path d="M 124 38 L 142 56 L 160 56 L 178 56 L 196 38" fill="none" stroke="url(#fxSkin)" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="112" y1="36" x2="208" y2="36" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            </g>
          </g>
        )}
      </svg>

      {isStage && (
        <div className="fx-animStepGuide">
          <div className="fx-animStepPill">
            <strong>1. Hazırlık</strong>
            <span>{guide.step1}</span>
          </div>
          <div className="fx-animStepPill">
            <strong>2. Uygulama</strong>
            <span>{guide.step2}</span>
          </div>
        </div>
      )}

      {isStage && tip && (
        <p className="fx-animStageTip">💡 {tip}</p>
      )}
    </div>
  );
}
