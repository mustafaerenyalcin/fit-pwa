// Real 2-frame (Start -> Peak) exercise photography mapping
// Backed by public-domain local assets in /exercises/<id>/{0,1}.jpg

const EXERCISE_MEDIA_RULES = [
  // Abs & Core
  {
    match: /(bicycle|bisiklet)/i,
    folder: 'Air_Bike',
    label: 'Bisiklet Mekik',
    step1: 'Sırtüstü yat, eller başın arkasında, bacakları yerden kaldır.',
    step2: 'Bir dizi göğse çekerken karşı dirseği o dize doğru döndür.'
  },
  {
    match: /(russian twist)/i,
    folder: 'Russian_Twist',
    label: 'Russian Twist (Oblik Rotasyon)',
    step1: 'Gövdeyi 45° geriye yasla, topuklar yerde veya hafif havada.',
    step2: 'Omuzları sırayla sağa ve sola döndürerek yan karın kaslarını sık.'
  },
  {
    match: /(mountain climber)/i,
    folder: 'Mountain_Climbers',
    label: 'Mountain Climber',
    step1: 'Eller omuzların altında yüksek plank pozisyonuna geç.',
    step2: 'Kalçayı sabit tutup dizleri sırayla göğse doğru seri çek.'
  },
  {
    match: /(side plank|yan plank)/i,
    folder: 'Side_Bridge',
    label: 'Yan Plank (Side Bridge)',
    step1: 'Ön kolun üzerinde yan yat, ayakları üst üste veya öne-arkaya koy.',
    step2: 'Kalçayı yerden kaldırarak vücudu baştan topuğa düz tut.'
  },
  {
    match: /(plank|hollow)/i,
    folder: 'Plank',
    label: 'Plank Core Stabilizasyon',
    step1: 'Dirsekler tam omuzların altında, karın ve kalça sıkı düz çizgide.',
    step2: 'Bel çökmeden ve kalça yükselmeden nefesi kontrollü tutup bekle.'
  },
  {
    match: /(flutter)/i,
    folder: 'Flutter_Kicks',
    label: 'Flutter Kicks (Makas)',
    step1: 'Sırtüstü yat, beli yere bastırıp bacakları düz uzat.',
    step2: 'Belin yerden kalkmasına izin vermeden bacakları kısa adımlarla çırp.'
  },
  {
    match: /(v-up|jackknife|heel touch)/i,
    folder: 'Jackknife_Sit-Up',
    label: 'V-Up / Üst & Alt Karın',
    step1: 'Kollar ve bacaklar düz uzanarak sırtüstü başla.',
    step2: 'Gövde ve bacakları aynı anda yukarı kaldırıp ortada buluştur.'
  },
  {
    match: /(dead bug)/i,
    folder: 'Dead_Bug',
    label: 'Dead Bug (Derin Core)',
    step1: 'Dizler 90° bükülü, kollar tavana uzanık sırtüstü başla.',
    step2: 'Belini yere kilitleyerek karşı kol ve bacağı yavaşça uzatıp topla.'
  },
  {
    match: /(reverse crunch)/i,
    folder: 'Reverse_Crunch',
    label: 'Reverse Crunch (Alt Karın)',
    step1: 'Sırtüstü yat, dizleri 90° büküp yukarı kaldır.',
    step2: 'Alt karın gücüyle kalçayı yerden hafifçe yuvarlayıp kontrollü in.'
  },
  {
    match: /(leg raise|bacak kaldırma)/i,
    folder: 'Flat_Bench_Lying_Leg_Raise',
    label: 'Leg Raise (Alt Karın)',
    step1: 'Sırtüstü uzan, eller kalça yanında ve bel mata tam temaslı.',
    step2: 'Bacakları dik konuma kaldırıp yere değdirmeden kontrollü indir.'
  },
  {
    match: /(crunch|mekik)/i,
    folder: 'Crunches',
    label: 'Abdominal Crunch',
    step1: 'Dizler bükülü sırtüstü yat, çene ile göğüs arasında yumruk mesafe bırak.',
    step2: 'Nefes vererek kürek kemiklerini yerden kaldır, karnı tepede 1 sn sık.'
  },

  // Push-Ups & Chest
  {
    match: /(incline push)/i,
    folder: 'Incline_Push-Up',
    label: 'Eğimli Şınav (Incline Push-Up)',
    step1: 'Ellerini yüksek sehpa veya destek üzerine omuz genişliğinde yerleştir.',
    step2: 'Vücut düz bir hat halindeyken göğsünü desteğe yaklaştır ve it.'
  },
  {
    match: /(decline.*push|decline diamond)/i,
    folder: 'Decline_Push-Up',
    label: 'Ayak Yüksekte Şınav (Decline Push-Up)',
    step1: 'Ayak parmaklarını sehpaya koy, ellerini omuz hizasında yere yerleştir.',
    step2: 'Üst göğsünü yere doğru kontrollü indirip güçlü şekilde yukarı it.'
  },
  {
    match: /(wide.*push)/i,
    folder: 'Push-Up_Wide',
    label: 'Geniş Tutuş Şınav',
    step1: 'Ellerini omuz genişliğinden biraz daha açık açıyla yere koy.',
    step2: 'Göğsü yere doğru derin indirerek dış göğsü hissedip yukarı it.'
  },
  {
    match: /(diamond|close-grip push|close triceps)/i,
    folder: 'Push-Ups_-_Close_Triceps_Position',
    label: 'Elmas / Dar Tutuş Şınav',
    step1: 'Ellerini göğüs altında birbirine yaklaştır, başparmak ve işaret parmak üçgen olsun.',
    step2: 'Dirsekleri gövdeye yakın tutarak in; iç göğüs ve arka kolu sıkarak it.'
  },
  {
    match: /(clapping|explosive|plyo)/i,
    folder: 'Plyo_Push-up',
    label: 'Patlayıcı Şınav (Plyo Push-Up)',
    step1: 'Standart şınav başlangıcında gövdeni gergin ve hazır tut.',
    step2: 'Kontrollü indikten sonra eller yerden kesilecek güçle yukarı patla.'
  },
  {
    match: /(push-up|push up|şınav|sinav)/i,
    folder: 'Pushups',
    label: 'Klasik Şınav (Push-Up)',
    step1: 'Eller omuz hizasında, baştan topuğa dümdüz plank çizgisinde dur.',
    step2: 'Dirsekleri 45° geriye kırarak göğsü yere yaklaştır ve nefes vererek it.'
  },
  {
    match: /(floor press)/i,
    folder: 'Dumbbell_Floor_Press',
    label: 'Dumbbell Floor Press',
    step1: 'Sırtüstü yere yat, dizler bükülü, dambılları göğüs hizasında tut.',
    step2: 'Üst kolun yere hafifçe değene kadar indirip göğsü sıkarak it.'
  },
  {
    match: /(incline dumbbell press|dumbbell bench|bench press|chest press)/i,
    folder: 'Dumbbell_Bench_Press',
    label: 'Dumbbell / Bench Press',
    step1: 'Kürek kemiklerini sehpaya kilitle, ağırlıkları göğüs yanlarında tut.',
    step2: 'Dirsekleri 45° açıyla indirip göğüs kaslarını sıkarak yukarı it.'
  },
  {
    match: /(dumbbell fly|chest fly)/i,
    folder: 'Dumbbell_Flyes',
    label: 'Dumbbell Fly (Göğüs Açış)',
    step1: 'Sehpada kollar yukarıda, dirsekler hafif bükülü şekilde kilitli.',
    step2: 'Göğsü esneterek kolları yana aç, büyük bir ağaca sarılır gibi topla.'
  },
  {
    match: /(pullover)/i,
    folder: 'Bent-Arm_Dumbbell_Pullover',
    label: 'Dumbbell Pullover',
    step1: 'Sırtüstü sehpada tek dambılı iki elinle göğsün üzerinde tut.',
    step2: 'Dirsek açısını koruyarak ağırlığı başının gerisine indirip kanatlarla çek.'
  },

  // Legs & Glutes
  {
    match: /(goblet squat)/i,
    folder: 'Goblet_Squat',
    label: 'Goblet Squat',
    step1: 'Dambılı iki elinle çene/göğüs önünde dik tut, ayaklar omuz genişliğinde.',
    step2: 'Dirsekleri dizlerin içine doğru indirerek derin çömel ve topuktan kalk.'
  },
  {
    match: /(bulgarian|split squat)/i,
    folder: 'Split_Squats',
    label: 'Bulgarian / Split Squat',
    step1: 'Arka ayağını geriye veya sehpa üstüne koy, ön ayakla sağlam bas.',
    step2: 'Arka diz yere yaklaşana dek dikey in, ön bacak ve kalçayla yüksel.'
  },
  {
    match: /(lunge|adım)/i,
    folder: 'Bodyweight_Walking_Lunge',
    label: 'Lunge (Adım Çömelme)',
    step1: 'Gövde dik, bir adımı öne atarak denge pozisyonuna geç.',
    step2: 'İki diz de yaklaşık 90° bükülene dek alçal ve güçlüce yukarı çık.'
  },
  {
    match: /(romanian deadlift|rdl)/i,
    folder: 'Romanian_Deadlift',
    label: 'Romanian Deadlift (RDL)',
    step1: 'Ayaklar kalça genişliğinde, dizler hafif kırık ve sırt tamamen düz.',
    step2: 'Kalçayı geriye iterek eğil; arka bacağı gerdirip kalçayı sıkarak kalk.'
  },
  {
    match: /(glute bridge|hip thrust|köprü)/i,
    folder: 'Butt_Lift_Bridge',
    label: 'Glute Bridge (Kalça Köprüsü)',
    step1: 'Sırtüstü yat, topuklar kalçaya yakın ve dizler yukarı bakar.',
    step2: 'Belini aşırı çukurlaştırmadan kalçayı tavana itip tepede 1 sn sık.'
  },
  {
    match: /(calf|kalf)/i,
    folder: 'Standing_Calf_Raises',
    label: 'Standing Calf Raise',
    step1: 'Ayak parmak uçlarında dik dur, topuklar serbest hareket edebilsin.',
    step2: 'Mümkün olduğunca yukarı yükselip tepede 1 sn sık, yavaşça in.'
  },
  {
    match: /(leg press)/i,
    folder: 'Leg_Press',
    label: 'Leg Press',
    step1: 'Ayakları platforma omuz genişliğinde koy, sırt ve kalça koltuğa yapışık.',
    step2: 'Dizleri göğse doğru kontrollü indir, dizleri tamamen kilitlemeden it.'
  },
  {
    match: /(squat|wall sit)/i,
    folder: 'Bodyweight_Squat',
    label: 'Squat (Temel Çömelme)',
    step1: 'Ayaklar omuz genişliğinde hafif dışa dönük, göğüs açık.',
    step2: 'Kalçayı geriye vererek sandalye oturur gibi paralel in ve kalk.'
  },

  // Back & Shoulders & Posture
  {
    match: /(cobra|superman|prone y|snow angel)/i,
    folder: 'Superman',
    label: 'Sırt Ekstansiyonu / Cobra',
    step1: 'Mat üzerine yüzüstü uzan, boyun omurgayla aynı hizada nötr kalsın.',
    step2: 'Göğsü (veya sırt-omuzları) nazikçe kaldırıp sırt kaslarını hisset.'
  },
  {
    match: /(single-arm.*row|one-arm.*row)/i,
    folder: 'One-Arm_Dumbbell_Row',
    label: 'Tek Kol Dumbbell Row',
    step1: 'Bir elini sehpaya/dizine dayayıp sırtı yere paralel düz tut.',
    step2: 'Dambılı beline/kalçana doğru kavisli çekip kürek kemiğini sık.'
  },
  {
    match: /(cable row|inverted row|towel.*row)/i,
    folder: 'Seated_Cable_Rows',
    label: 'Row (Yatay Sırt Çekiş)',
    step1: 'Omuzlar aşağıda, göğüs açık ve kollar öne tam uzanmış başla.',
    step2: 'Dirsekleri gövde yanından geriye çekerek kürek kemiklerini sıkıştır.'
  },
  {
    match: /(bent-over.*row|row|kürek)/i,
    folder: 'Bent_Over_Two-Dumbbell_Row',
    label: 'Bent-Over Dumbbell Row',
    step1: 'Kalçadan 45° öne eğil, bel düz ve dizler hafif esnek kalsın.',
    step2: 'Her iki dambılı bel hizasına çekip sırt ortasını sık.'
  },
  {
    match: /(lat pulldown)/i,
    folder: 'Wide-Grip_Lat_Pulldown',
    label: 'Lat Pulldown',
    step1: 'Barı omuzdan biraz geniş tut, göğsü hafif yukarı kaldır.',
    step2: 'Dirsekleri yanlara ve aşağı doğru çekerek barı üst göğse indir.'
  },
  {
    match: /(pull-up|chin-up|barfiks)/i,
    folder: 'Pullups',
    label: 'Pull-Up / Barfiks',
    step1: 'Barı omuzdan geniş kavra, omuzları aşağı çekip core’u sık.',
    step2: 'Göğsünü bara yaklaştıracak şekilde yukarı çekil ve kontrollü in.'
  },
  {
    match: /(face pull)/i,
    folder: 'Face_Pull',
    label: 'Face Pull (Arka Omuz & Postür)',
    step1: 'Halatı veya direnci göz hizasında iki elinle avuçlar birbirine bakar tut.',
    step2: 'Ellerini yüzünün yanına doğru açarak çekip arka omzu sık.'
  },
  {
    match: /(reverse fly|rear delt)/i,
    folder: 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
    label: 'Reverse Fly (Arka Omuz)',
    step1: 'Gövde öne eğik, dirsekler hafif kırık şekilde ağırlıkları salla.',
    step2: 'Savurmadan yalnızca arka omuzla kolları yana T şeklinde aç.'
  },
  {
    match: /(arnold press)/i,
    folder: 'Arnold_Dumbbell_Press',
    label: 'Arnold Press',
    step1: 'Dambılları omuz önünde avuç içleri sana dönük şekilde tut.',
    step2: 'Yukarı iterken bilekleri dışa döndür, tepe noktada avuçlar öne baksın.'
  },
  {
    match: /(shoulder press|omuz press)/i,
    folder: 'Dumbbell_Shoulder_Press',
    label: 'Dumbbell Shoulder Press',
    step1: 'Dambılları kulak hizasında tut, karın ve bel stabil.',
    step2: 'Beli aşırı bükmeden ağırlıkları baş üstünde birleştirir gibi it.'
  },
  {
    match: /(lateral raise)/i,
    folder: 'Side_Lateral_Raise',
    label: 'Lateral Raise (Yan Omuz)',
    step1: 'Dambıllar yanlarda, dirsekler çok hafif kırık sabit dursun.',
    step2: 'Sürahi döker gibi dirsekleri önde tutarak kolları omuz hizasına aç.'
  },

  // Arms (Biceps & Triceps)
  {
    match: /(hammer curl)/i,
    folder: 'Alternate_Hammer_Curl',
    label: 'Hammer Curl (Çekiç Bükme)',
    step1: 'Avuç içleri gövdeye dönük (nötr tutuş) ayakta sabit dur.',
    step2: 'Dirsekleri oynatmadan ağırlığı omza doğru kaldır ve ön kolu sık.'
  },
  {
    match: /(curl|biceps)/i,
    folder: 'Dumbbell_Bicep_Curl',
    label: 'Biceps Curl',
    step1: 'Dirsekleri kaburgalarına sabitle, avuçlar ileri baksın.',
    step2: 'Omuzdan savurmadan ön kolu yukarı bük ve kontrollü (3 sn) indir.'
  },
  {
    match: /(overhead triceps|triceps extension)/i,
    folder: 'Standing_Dumbbell_Triceps_Extension',
    label: 'Overhead Triceps Extension',
    step1: 'Dambılı başının üzerinde tut, üst kollar kulak yanında sabit kalsın.',
    step2: 'Sadece dirsekten büküp enseye indir, arka kolla baş üstüne it.'
  },
  {
    match: /(kickback)/i,
    folder: 'Tricep_Dumbbell_Kickback',
    label: 'Triceps Kickback',
    step1: 'Öne eğilip üst kolu gövdeye paralel yere paralel sabitle.',
    step2: 'Üst kolu kıpırdatmadan ön kolu geriye tam düz olana dek it.'
  },
  {
    match: /(pushdown)/i,
    folder: 'Triceps_Pushdown',
    label: 'Triceps Pushdown',
    step1: 'Dirsekleri gövde yanlarına kilitle, göğüs dik.',
    step2: 'Ön kolları aşağı düz itip altta arka kolu 1 sn sık.'
  },
  {
    match: /(dip)/i,
    folder: 'Bench_Dips',
    label: 'Bench Triceps Dips',
    step1: 'Ellerini arkadaki sehpanın kenarına yerleştir, sırtın sehpaya yakın.',
    step2: 'Dirsekleri geriye bükerek kalçayı indir, arka kol gücüyle it.'
  },

  // Cardio / Warmup
  {
    match: /(arm circle)/i,
    folder: 'Arm_Circles',
    label: 'Arm Circles (Omuz Isınma)',
    step1: 'Kolları omuz hizasında iki yana dümdüz aç.',
    step2: 'Önce öne sonra geriye doğru orta genişlikte kontrollü daireler çiz.'
  },
  {
    match: /(jumping jack|burpee|high knee|cardio|rope)/i,
    folder: 'Rope_Jumping',
    label: 'Dinamik Kardiyo & Nabız',
    step1: 'Ayak parmak uçlarında hafif ve yaylanan bir duruş al.',
    step2: 'Omuzları serbest bırakıp ritmik nefeslerle sürekli hareket et.'
  }
];

export function resolveExerciseMedia(name = '') {
  const n = (name || '').toLowerCase();
  const matched =
    EXERCISE_MEDIA_RULES.find((rule) => rule.match.test(n)) ||
    EXERCISE_MEDIA_RULES.find((rule) => rule.folder === 'Pushups');

  return {
    folder: matched.folder,
    frame0: `/exercises/${matched.folder}/0.jpg`,
    frame1: `/exercises/${matched.folder}/1.jpg`,
    label: matched.label,
    step1: matched.step1,
    step2: matched.step2
  };
}
