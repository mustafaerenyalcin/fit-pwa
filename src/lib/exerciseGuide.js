/**
 * Egzersiz Biyomekanik, Nefes Ritmi ve Form Hatası Rehberi
 */

const GUIDE_DB = [
  {
    match: ['şınav', 'push-up', 'push up'],
    primary: 'Göğüs (Pectoralis Major), Ön Omuz',
    secondary: 'Triceps, Merkez (Core)',
    breathing: 'İnerken burnundan derin nefes al (2 sn), kendini yukarı iterken ağzından güçlü nefes ver (1 sn).',
    steps: [
      'Ellerini omuz genişliğinden hafifçe açık yerleştir, dirseklerin gövdenle 45° açı yapsın (90° yana açma).',
      'Karın ve kalçanı sıkarak başından topuğuna kadar düz bir çizgi oluştur.',
      'Göğsün yere 2–3 cm kalana dek kontrollü in ve kürek kemiklerini koruyarak patlayıcı biçimde it.'
    ],
    mistakes: [
      'Belin aşağı sarkması (karın kaslarını gevşek bırakmak)',
      'Dirsekleri tamamen T şeklinde 90° yana açarak omuz eklemine yük bindirmek'
    ]
  },
  {
    match: ['bench press', 'göğüs pres', 'dumbbell press', 'incline'],
    primary: 'Göğüs (Orta / Üst Pektoral Lifler)',
    secondary: 'Ön Deltoid, Triceps',
    breathing: 'Ağırlığı kontrollü indirirken nefes al, göğsünden yukarı iterken nefes ver.',
    steps: [
      'Kürek kemiklerini geriye ve aşağıya kilitle (sehpa üzerinde göğüs kafesini dik tut).',
      'Ayak tabanlarını yere sağlam basarak alt vücuttan stabilite al.',
      'Barı veya dambılları göğüs ucunun hafif altına kontrollü indirip dirseklerini kilitlemeden yukarı sür.'
    ],
    mistakes: [
      'İtiş sırasında omuzları öne yuvarlayıp göğüs gerginliğini kaybetmek',
      'Ağırlığı göğüsten sektirerek (momentumla) kaldırmak'
    ]
  },
  {
    match: ['squat', 'çömelme', 'goblet'],
    primary: 'Ön Bacak (Quadriceps), Kalça (Gluteus)',
    secondary: 'Arka Bacak (Hamstring), Bel & Core',
    breathing: 'İnmeden önce diyafram nefesi alıp karnını kilitle (Bracing), kalkışın ortasını geçince nefes ver.',
    steps: [
      'Ayaklarını omuz genişliğinde aç, parmak uçların 15–30° dışa baksın.',
      'Hareketi kalçanı geriye ve aşağıya indirerek başlat; dizlerin ayak parmaklarınla aynı yönde ilerlesin.',
      'Üst bacakların yere paralel (veya altına) indikten sonra topuklarından yeri iterek dik kalk.'
    ],
    mistakes: [
      'Kalkarken dizlerin içe doğru çökmesi (Valgus)',
      'Topukların yerden kalkması ve ağırlığın parmak uçlarına kayması'
    ]
  },
  {
    match: ['row', 'çekiş', 'barfiks', 'pull-up', 'lat pulldown'],
    primary: 'Sırt (Latissimus Dorsi, Rhomboidler)',
    secondary: 'Arka Omuz, Biceps, Ön Kol',
    breathing: 'Ağırlığı kendine çekerken nefes ver ve sırtını 1 saniye sık, uzatırken kontrollü nefes al.',
    steps: [
      'Hareketi kollarınla değil, omuzlarını geriye ve aşağıya bastırarak (Depresyon/Retraksiyon) başlat.',
      'Dirseklerini gövdene yakın tutarak kalçana/alt kaburgana doğru çek.',
      'Tepe noktada kürek kemiklerinin arasında bir kalem sıkıştırıyormuş gibi 1 sn bekle ve yavaşça sal.'
    ],
    mistakes: [
      'Ağırlığı sırt yerine sadece biceps (kol) gücüyle çekmek',
      'Gövdeyi aşırı sallayarak momentum kullanmak'
    ]
  },
  {
    match: ['shoulder press', 'overhead', 'omuz pres', 'pike', 'lateral raise', 'yana açış'],
    primary: 'Omuz (Ön ve Yan Deltoid)',
    secondary: 'Triceps, Üst Trapez, Core',
    breathing: 'Yukarı kaldırırken nefes ver, başlangıç noktasına kontrollü indirirken (2-3 sn) nefes al.',
    steps: [
      'Kaburgalarını aşağıda ve karın kaslarını sıkı tutarak bel çukurunu aşırı artırmaktan kaçın.',
      'Lateral Raise yapıyorsan dirseklerini hafif bükülü tut ve dambılları tam yana değil 20° öne (Skapular düzlemde) kaldır.',
      'Omuz hizasına ulaştığında serçe parmağını aşırı kaldırmadan yan omuzda yanmayı hisset.'
    ],
    mistakes: [
      'Trapez kaslarını (boynu) yukarı çekerek omuz yerine boynu çalıştırmak',
      'Ağır kilo uğruna belden geriye yaslanmak veya sallanmak'
    ]
  },
  {
    match: ['plank', 'mekik', 'crunch', 'hollow', 'leg raise', 'karın'],
    primary: 'Merkez (Rectus Abdominis, Transverse Abdominis)',
    secondary: 'Oblikler, Kalça Fleksörleri',
    breathing: 'Nefesini tutma! Göbek deliğini omurgana çekerken kısa ve kontrollü nefesler alıp ver.',
    steps: [
      'Bel boşluğunu zemine bastır (Posterior Pelvic Tilt) ve kalçanı sık.',
      'Boynunu çekiştirmek yerine çeneni göğsünden bir yumruk mesafede sabit tut.',
      'Her tekrarda karın kaslarını bilinçli olarak sıkıp 1 saniye zirvede tut.'
    ],
    mistakes: [
      'Hareketi karın yerine boyundan veya bel çukurundan güç alarak yapmak',
      'Nefesi tamamen tutup tansiyonu yükseltmek'
    ]
  }
];

export function getDetailedExerciseGuide(name = '', fallbackMuscle = 'Kas Grubu', fallbackTip = '') {
  const lower = String(name).toLowerCase();
  const found = GUIDE_DB.find((item) => item.match.some((k) => lower.includes(k)));
  if (found) return found;

  return {
    primary: fallbackMuscle || 'Hedef Kas Grubu',
    secondary: 'Stabilizatör ve Merkez (Core) Kasları',
    breathing: 'Zorlandığın (itme/çekme) fazda nefes ver, ağırlığı indirdiğin (negatif) fazda 2–3 saniyede nefes al.',
    steps: [
      fallbackTip || 'Eklem hizanı koruyarak tam hareket açıklığında (Full ROM) çalış.',
      'Ağırlığı yerçekimine bırakma; indiriş (eksantrik) fazını en az 2 saniye kontrol et.',
      'Son 2 tekrarda yanma başlasa bile postürünü bozmadan hedef kası sık.'
    ],
    mistakes: [
      'Ağırlığı savurarak (momentumla) kaldırmak',
      'Hareketi yarım açıklıkta kesip kasın tam esnemesini engellemek'
    ]
  };
}
