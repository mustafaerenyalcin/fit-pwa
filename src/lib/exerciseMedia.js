// 3-Frame Anatomical Exercise Vector Mapping (Start -> Mid -> Peak)
// Backed by verified CC BY-SA 4.0 local SVG assets in /exercises/<slug>/{1,2,3}.svg
// Upstream: Workout Guide (Bryl Lim) & Everkinetic (Greg Priday)

const MUSCLE_TR = {
  Chest: 'Göğüs',
  Triceps: 'Arka Kol (Triceps)',
  Shoulders: 'Omuz',
  'Rear Delts': 'Arka Omuz',
  Lats: 'Kanat (Lat)',
  Back: 'Sırt',
  'Upper Back': 'Üst Sırt',
  'Lower Back': 'Alt Sırt / Bel',
  Biceps: 'Ön Kol (Biceps)',
  Forearms: 'Ön Kol / Kavrama',
  Core: 'Karın & Core',
  Quads: 'Ön Bacak (Quad)',
  Hamstrings: 'Arka Bacak (Hamstring)',
  Glutes: 'Kalça (Glute)',
  Calves: 'Baldır (Kalf)',
  'Posterior Chain': 'Arka Zincir',
  Legs: 'Tüm Bacak',
  Adductors: 'İç Bacak',
  Hips: 'Kalça Fleksörleri',
  Mobility: 'Mobilite & Esneme',
  Cardio: 'Kardiyo & Kondisyon',
  Grip: 'Kavrama'
};

const EQUIPMENT_TR = {
  Bodyweight: 'Ekipmansız',
  Dumbbell: 'Dambıl',
  Barbell: 'Halter (Barbell)',
  Cable: 'Kablo İstasyonu',
  Machine: 'Makine',
  Cardio: 'Kardiyo',
  Chair: 'Sandalye / Sehpa',
  Doorway: 'Kapı Çerçevesi',
  Towel: 'Havlu',
  Wall: 'Duvar',
  Plate: 'Ağırlık Plakası',
  'Pull-up Bar': 'Barfiks Barı',
  'Resistance Band': 'Direnç Bandı'
};

const tMuscle = (m) => MUSCLE_TR[m] || m;
const tEquip = (eq) => EQUIPMENT_TR[eq] || eq;

// Helper to define unique exercise entries concisely while preserving unique Turkish 3-step form cues
const ex = (slug, label, primary, secondary, equipment, steps) => ({
  slug,
  label,
  primaryMuscle: primary,
  primaryMuscleTr: tMuscle(primary),
  secondaryMusclesTr: (secondary || []).map(tMuscle).join(', '),
  equipmentTr: tEquip(equipment),
  step1: steps[0],
  step2: steps[1],
  step3: steps[2]
});

export const EXERCISE_MEDIA_DB = {
  // === LEAP CATALOG: KARIN & CORE (15) ===
  'jumping-jack': ex('jumping-jack', 'Jumping Jacks', 'Legs', ['Shoulders', 'Calves'], 'Bodyweight', [
    'Ayaklar bitişik, kollar gövde yanında dik ve rahat başla.',
    'Sıçrayarak ayakları omuzdan geniş açarken kolları yanlardan yukarı kaldır.',
    'Eller baş üstünde yaklaşsın; aynı akıcı ritimle başlangıca dön.'
  ]),
  crunch: ex('crunch', 'Abdominal Crunch', 'Core', [], 'Bodyweight', [
    'Sırtüstü yat, dizler 90° bükülü ve ayaklar yerde sabit.',
    'Çeneyi göğse yapıştırmadan üst karını sıkarak kürek kemiklerini yerden kaldır.',
    'Tepe noktada 1 saniye sıkıştırıp nefesi alarak kontrollü in.'
  ]),
  'russian-twist': ex('russian-twist', 'Russian Twist', 'Core', [], 'Bodyweight', [
    'Yere otur, dizleri büküp gövdeyi 45° geriye yasla ve karnı kilitle.',
    'Eller göğüs önünde birleşikken omuzları belden sağa doğru döndür.',
    'Aynı akıcı kontrolle diğer tarafa dönerek yan karın (oblik) kaslarını sık.'
  ]),
  'mountain-climber': ex('mountain-climber', 'Mountain Climber', 'Core', ['Shoulders', 'Quads'], 'Bodyweight', [
    'Eller tam omuz altında, baştan topuğa düz yüksek plank pozisyonuna geç.',
    'Kalçayı zıplatmadan bir dizini göğsüne doğru hızla çek.',
    'Bacakları seri ve ritmik şekilde değiştirirken karın duvarını sıkı tut.'
  ]),
  plank: ex('plank', 'Forearm Plank', 'Core', ['Shoulders'], 'Bodyweight', [
    'Dirsekler tam omuzların altında, ön kollar yere paralel başla.',
    'Karın, kalça ve bacakları sıkarak vücudu cetvel gibi düz hatta tut.',
    'Belin çökmesine izin vermeden düzenli nefesle süreyi tamamla.'
  ]),
  'bicycle-crunch': ex('bicycle-crunch', 'Bicycle Crunch (Bisiklet)', 'Core', [], 'Bodyweight', [
    'Sırtüstü uzan, eller şakaklarda ve bacaklar yerden hafif havada.',
    'Bir dizi göğse çekerken karşı dirseği o dize doğru döndürerek yaklaş.',
    'Diğer bacağı düz uzat ve taraf değiştirerek sürekli pedal ritmi koru.'
  ]),
  'lying-leg-raise': ex('lying-leg-raise', 'Lying Leg Raise', 'Core', ['Hips'], 'Bodyweight', [
    'Sırtüstü düz yat, eller kalça yanında ve bel boşluğu mata tam temaslı.',
    'Bacakları mümkün olduğunca düz tutarak alt karınla yukarı kaldır.',
    '90° noktaya ulaşınca yere değdirmeden yavaş ve kontrollü (3 sn) indir.'
  ]),
  'heel-tap': ex('heel-tap', 'Heel Touch (Topuk Dokunuş)', 'Core', [], 'Bodyweight', [
    'Dizler bükülü sırtüstü yat, kürek kemiklerini hafif yerden kaldır.',
    'Gövdeyi yana bükerek sağ elinle sağ topuğuna uzanıp dokun.',
    'Ortadan geçip hemen sol elinle sol topuğa dokunarak yanları yak.'
  ]),
  'side-plank': ex('side-plank', 'Side Plank (Yan Plank)', 'Core', ['Shoulders'], 'Bodyweight', [
    'Ön kol omuz altında dik olacak şekilde yan yat, ayakları üst üste koy.',
    'Kalçayı yerden iterek baştan topuğa düz yan köprü oluştur.',
    'Bel düşmeden pozisyonu koru ve her iki taraf için eşit süre bekle.'
  ]),
  'hollow-body-hold': ex('hollow-body-hold', 'Hollow Body Hold', 'Core', ['Quads'], 'Bodyweight', [
    'Sırtüstü yat, beli yere kilitleyip dizleri göğse yaklaştırarak karnı kur.',
    'Kolları baş arkasına, bacakları ileriye doğru kayık formunda aç.',
    'Alt sırt yerden kalkmayacak yükseklikte tüm core duvarını sıkıp bekle.'
  ]),
  burpee: ex('burpee', 'Full Burpee', 'Legs', ['Chest', 'Shoulders', 'Core'], 'Bodyweight', [
    'Ayakta dik başla, ardından çömelip ellerini ayaklarının önüne yere koy.',
    'Ayakları geriye sıçratarak plank/şınav pozisyonuna inip gövdeyi topla.',
    'Ayakları tekrar ellere çek ve eller yukarıda patlayıcı sıçrayışla bitir.'
  ]),
  'v-up': ex('v-up', 'V-Up', 'Core', ['Hips'], 'Bodyweight', [
    'Kollar baş üstünde, bacaklar düz ve gergin şekilde sırtüstü başla.',
    'Aynı anda hem gövdeyi hem bacakları yukarı bükmeden kaldır.',
    'Tepede V formu oluşturup parmak uçlarıyla ayaklara uzan ve kontrollü in.'
  ]),
  'flutter-kick': ex('flutter-kick', 'Flutter Kicks (Makas)', 'Core', ['Quads'], 'Bodyweight', [
    'Sırtüstü yat, eller kalça altında bel boşluğunu sıfırlayarak destek al.',
    'İki düz bacağı yerden 10-15 cm yukarı kaldırıp karnı kilitle.',
    'Bacakları küçük adımlarla aşağı-yukarı seri çırparken belini sabit tut.'
  ]),
  'plank-jack': ex('plank-jack', 'Plank Jacks', 'Core', ['Shoulders', 'Legs'], 'Bodyweight', [
    'Yüksek plankta eller omuz hizasında sabit, karın ve omuzlar kilitli.',
    'Üst gövdeyi sarsmadan iki ayağı aynı anda yanlara doğru sıçratarak aç.',
    'Hemen ardından ayakları merkeze toplayarak yüksek tempolu ritmi sürdür.'
  ]),
  'plank-shoulder-tap': ex('plank-shoulder-tap', 'Plank Shoulder Taps', 'Core', ['Shoulders'], 'Bodyweight', [
    'Ayakları omuzdan hafif geniş açarak yüksek plankta dengeyi sağla.',
    'Kalçayı sağa sola çevirmeden bir elinle karşı omza kontrollü dokun.',
    'Elini yere koy ve diğer elle sırayla dokunarak anti-rotasyon gücünü koru.'
  ]),

  // === LEAP CATALOG: GÖĞÜS (13) ===
  'incline-push-up': ex('incline-push-up', 'Incline Push-Up (Eğimli Şınav)', 'Chest', ['Triceps', 'Shoulders'], 'Bodyweight', [
    'Ellerini sağlam yüksek bir sehpa veya platform üzerine omuz hizasında koy.',
    'Vücut düz bir çizgi halindeyken dirsekleri 45° kırıp göğsü desteğe yaklaştır.',
    'Alt göğüs liflerini sıkarak kolları kilitlemeden başlangıca güçlüce it.'
  ]),
  'knee-push-up': ex('knee-push-up', 'Knee Push-Up (Diz Üstü Şınav)', 'Chest', ['Triceps', 'Shoulders'], 'Bodyweight', [
    'Dizler yumuşak zeminde, kalça bükülmeden omuzdan dize düz hat oluştur.',
    'Karını sıkı tutup göğsünü ellerinin arasına doğru kontrollü şekilde indir.',
    'Nefes vererek avuç içleriyle yeri it ve başlangıç kol açıklığına dön.'
  ]),
  'push-up': ex('push-up', 'Push-Up (Klasik Şınav)', 'Chest', ['Triceps', 'Shoulders'], 'Bodyweight', [
    'Eller omuz genişliğinde, ayak parmak uçları yerde gergin plank duruşu al.',
    'Dirsekleri gövdeye ~45° açıyla geriye kırarak göğüs yere 2 cm kalana dek in.',
    'Core’u bozmadan tüm göğüsle yeri itip üst noktada kürekleri stabilize et.'
  ]),
  'wide-push-up': ex('wide-push-up', 'Wide Push-Up (Geniş Şınav)', 'Chest', ['Shoulders', 'Triceps'], 'Bodyweight', [
    'Ellerini standart şınavdan 10-15 cm daha geniş yerleştir ve parmakları hafif dışa aç.',
    'Göğüs kaslarındaki gerilimi hissederek gövdeyi düz şekilde zemine yaklaştır.',
    'Dış göğüs liflerini merkeze sıkıştırarak yukarı güçlü itiş yap.'
  ]),
  'doorway-chest-stretch': ex('doorway-chest-stretch', 'Doorway Chest Stretch (Göğüs Açma)', 'Chest', ['Shoulders'], 'Doorway', [
    'Kapı çerçevesinde kolları 90° L açıyla her iki pervaza dayayarak dur.',
    'Bir ayağını öne atıp göğsünü nazikçe ileri bırakarak ön göğsü aç.',
    'Omuzları kulaklardan uzak tut, derin nefeslerle 20-30 saniye esnemeyi hisset.'
  ]),
  'push-up-shoulder-tap': ex('push-up-shoulder-tap', 'Push-Up Shoulder Tap', 'Core', ['Chest', 'Shoulders'], 'Bodyweight', [
    'Şınav başlangıcında göğsü yere doğru indirip güçlü tek şınavı tamamla.',
    'Üst pozisyona çıktığında kalçayı oynatmadan sağ elinle sol omza dokun.',
    'Her tekrar sonrası karşı omza dokunarak göğüs + core stabilitesini birleştir.'
  ]),
  'decline-push-up': ex('decline-push-up', 'Decline Push-Up (Ayak Yüksekte)', 'Chest', ['Shoulders', 'Triceps'], 'Bodyweight', [
    'Ayaklarını yüksek bir sehpaya yerleştir, elleri omuz hizasında yere sabitle.',
    'Ağırlığı üst göğse ve ön omuza vererek başı ellerin biraz önüne doğru indir.',
    'Üst göğsü sıkarak gövdeyi düz hatta bozmadan yukarı it.'
  ]),
  'chest-dip': ex('chest-dip', 'Chest Dip (Göğüs Dips)', 'Chest', ['Triceps', 'Shoulders'], 'Bodyweight', [
    'Paralel barları kavra, dizleri hafif geriye büküp gövdeyi ~25° öne eğ.',
    'Dirsekleri hafif dışa vererek omuz dirsek hizasının altına inene dek alçal.',
    'Alt göğüs gücüyle yukarı it ve tepe noktada göğsü sıkıştır.'
  ]),
  'hindu-push-up': ex('hindu-push-up', 'Hindu Push-Up', 'Chest', ['Shoulders', 'Triceps'], 'Bodyweight', [
    'Kalça yukarıda ters V (Downward Dog) pozisyonunda başla.',
    'Dirsekleri kırıp göğsü yere paralel bir kavisle iki elin arasından süz.',
    'Belini esnetip başı yukarı kaldırarak kobra pozisyonuna açıl ve kalçayı geri çek.'
  ]),
  'explosive-push-up': ex('explosive-push-up', 'Explosive Push-Up (Patlayıcı)', 'Chest', ['Triceps', 'Shoulders'], 'Bodyweight', [
    'Klasik şınav başlangıcında tüm sinir sistemini ve karnı patlamaya hazırla.',
    'Göğsü yere yaklaştırdıktan sonra dip noktada kısa anlık gerilim topla.',
    'Tüm kuvvetinle yeri itip ellerin havada yerden kesilsin; yumuşak inişle sönümle.'
  ]),
  'archer-push-up': ex('archer-push-up', 'Archer Push-Up (Okçu Şınavı)', 'Chest', ['Shoulders', 'Triceps'], 'Bodyweight', [
    'Elleri çok geniş yerleştir; çalışacak taraftaki el düz, diğeri yana açık.',
    'Bir kolunu yana doğru tamamen düz tutarken ağırlığı tek tarafa yıkıp göğsü o ele indir.',
    'Çalışan göğüs ve omuzla yeri güçlüce itip diğer kola geçerek tekrarla.'
  ]),
  'typewriter-push-up': ex('typewriter-push-up', 'Typewriter Push-Up', 'Chest', ['Shoulders', 'Triceps'], 'Bodyweight', [
    'Eller geniş pozisyonda şınavın en alt (yere yakın) noktasına in.',
    'Göğüs yerden yukarı kalkmadan gövdeni yatay olarak bir eline doğru kaydır.',
    'Merkezden geçip daktilo gibi diğer ele yatay kayarak sürekli gerilim üret.'
  ]),
  'weighted-push-up': ex('weighted-push-up', 'Weighted / Deep Tempo Push-Up', 'Chest', ['Triceps', 'Shoulders'], 'Bodyweight', [
    'Sırt çantası veya ağırlık yeleğiyle (ya da 4 sn yavaş iniş temposuyla) plank kur.',
    'Gövdeyi tek parça halinde yere paralel indirerek derin göğüs esnemesi al.',
    'Alt noktada beklemeden göğsü sıkarak kontrollü şekilde tam itiş yap.'
  ]),

  // === LEAP CATALOG: KOL & TRİCEPS (8) ===
  'arm-circles': ex('arm-circles', 'Arm Circles (Omuz Isınma)', 'Shoulders', [], 'Bodyweight', [
    'Dik dur ve iki kolunu omuz hizasında yanlara T şeklinde dümdüz aç.',
    'Omuz eklemini kontrollü döndürerek önce öne doğru orta boy daireler çiz.',
    'Yarı sürede yön değiştirip geriye doğru dairelerle eklem ısınmasını tamamla.'
  ]),
  'chair-dip': ex('chair-dip', 'Chair Triceps Dips (Sandalye)', 'Triceps', ['Shoulders', 'Chest'], 'Chair', [
    'Sağlam sandalye kenarını omuz genişliğinde kavra, kalçayı hemen öne al.',
    'Sırt sandalyeye yakın dik inerken dirsekleri geriye doğru ~90° bük.',
    'Dirsekleri yanlara açmadan arka kol gücüyle yukarı tam itiş yap.'
  ]),
  'wall-push-up': ex('wall-push-up', 'Wall Push-Up (Dar Dikey İtiş)', 'Chest', ['Triceps', 'Shoulders'], 'Wall', [
    'Duvara bir kol boyu uzakta dur, elleri omuzdan biraz dar duvara yerleştir.',
    'Vücudu bozmadan dirsekleri gövdeye yakın büküp göğsünü duvara yaklaştır.',
    'Arka kol ve iç göğsü sıkarak kontrollü itişle başlangıca dön.'
  ]),
  'crab-walk': ex('crab-walk', 'Crab Walk (Arka Kol & Denge)', 'Triceps', ['Shoulders', 'Core'], 'Bodyweight', [
    'Avuç içleri parmaklar öne/yana bakacak şekilde geride, ayaklar yerde ters masa kur.',
    'Kalçayı yerden kaldırıp kolları kilitlemeden arka kolda tansiyonu hisset.',
    'Karşı el ve karşı ayağı senkronize ederek kontrollü adımlarla ileri-geri yürü.'
  ]),
  'diamond-push-up': ex('diamond-push-up', 'Diamond Push-Up (Elmas Şınav)', 'Triceps', ['Chest', 'Shoulders'], 'Bodyweight', [
    'Ellerini tam göğüs kafesinin altında başparmak ve işaret parmakları üçgen yapacak şekilde birleştir.',
    'Dirsekleri gövdeye yakın tutup göğsü ellerinin üzerine kontrollü indir.',
    'Tüm gücü triceps ve iç göğüse vererek yukarı it ve tepede arka kolu sık.'
  ]),
  'bench-dip': ex('bench-dip', 'Bench Dips (Sehpa Triceps)', 'Triceps', ['Shoulders'], 'Bodyweight', [
    'Avuç içlerini arkadaki sehpaya bas, bacakları öne uzatıp topukları yere koy.',
    'Gövdeni sehpaya sıyıracak kadar yakın tutarak dirsekleri 90° büküp alçal.',
    'Ön omuzu çökertmeden tamamen arka kol kasılmasıyla yukarı çık.'
  ]),
  'towel-row': ex('towel-row', 'Towel Biceps Rows (Havlu Çekiş)', 'Back', ['Biceps', 'Forearms'], 'Towel', [
    'Sağlam direk veya kapı koluna havlu geçirip geriye hafif yaslanarak uçlarından kavra.',
    'Avuç içleri birbirine bakarken göğsü açık tutup dirsekleri gövdeye çek.',
    'Ön kol ve biceps kaslarını tepe noktada 1 saniye sıkıp kontrollü uzat.'
  ]),
  inchworm: ex('inchworm', 'Inchworm (Kol, Omuz & Core)', 'Core', ['Shoulders', 'Hamstrings'], 'Bodyweight', [
    'Dik başla, dizleri çok hafif büküp avuç içlerini ayak ucunun önüne yere koy.',
    'Bacakları mümkün olduğunca sabit tutup ellerle yürüyerek tam plank pozisyonuna uzan.',
    'Gövdeyi stabilize ettikten sonra ellerle veya ayaklarla küçük adımlarla geri topla.'
  ]),

  // === LEAP CATALOG: BACAK & KALÇA (8) ===
  'bodyweight-squat': ex('bodyweight-squat', 'Bodyweight Squat', 'Quads', ['Glutes', 'Hamstrings'], 'Bodyweight', [
    'Ayaklar omuz genişliğinde hafif dışa dönük, göğüs açık ve kollar önde dengede.',
    'Hareketi kalçayı geriye iterek başlat; uyluk yere paralel olana dek çömel.',
    'Topuklardan ve ayak orta hattından zemini iterek kalçayı sıkıp kalk.'
  ]),
  'forward-lunge': ex('forward-lunge', 'Forward Lunges (Öne Adım)', 'Quads', ['Glutes', 'Hamstrings'], 'Bodyweight', [
    'Gövde dik, eller belde veya yanda kalça genişliğinde ayakta başla.',
    'Bir ayağınla öne orta-geniş adım at ve arka diz yere yaklaşana dek dikey in.',
    'Ön topuktan güçlüce iterek başlangıç duruşuna dön ve diğer bacakla tekrarla.'
  ]),
  'glute-bridge': ex('glute-bridge', 'Glute Bridge (Kalça Köprüsü)', 'Glutes', ['Hamstrings'], 'Bodyweight', [
    'Sırtüstü yat, dizler bükülü ve topuklar kalçaya yaklaşık 25 cm mesafede.',
    'Karını sıkıp topukları yere basarak kalçayı omuz-diz düz hattına dek kaldır.',
    'Tepede kalça kaslarını 1-2 saniye sertçe sık ve beli bükmeden yavaşça indir.'
  ]),
  'calf-raise': ex('calf-raise', 'Standing Bodyweight Calf Raise', 'Calves', [], 'Bodyweight', [
    'Ayaklar kalça genişliğinde paralel, denge için duvar veya sandalye yanında dik dur.',
    'Dizleri kilitlemeden ayak parmak uçlarının üzerinde olabildiğince yükseğe çık.',
    'Baldırların tepe kasılmasında 1 saniye bekle ve topukları kontrollü indir.'
  ]),
  'jump-squat': ex('jump-squat', 'Jump Squats (Patlayıcı Squat)', 'Quads', ['Glutes', 'Calves'], 'Bodyweight', [
    'Ayaklar omuz genişliğinde hazır dur ve kontrollü derin squat pozisyonuna in.',
    'En alt noktadan beklemeksizin kalça ve quad patlamasıyla yukarı sıçra.',
    'Ayak parmak ucundan topuğa yumuşak bir şekilde inip doğrudan sonraki squat’a ak.'
  ]),
  'bulgarian-split-squat': ex('bulgarian-split-squat', 'Bulgarian Split Squat', 'Quads', ['Glutes', 'Hamstrings'], 'Dumbbell', [
    'Arka ayağının üstünü diz hizasındaki sehpaya yerleştir, ön ayakla sağlam öne adım at.',
    'Gövde hafif öne açıda arka diz yere yaklaşana dek dikey olarak aşağı çök.',
    'Tüm yükü ön bacak topuğuna ve kalçaya vererek başlangıç noktasına yüksel.'
  ]),
  'skater-hop': ex('skater-hop', 'Skater Hops (Yanal Patlayıcı)', 'Legs', ['Glutes', 'Calves'], 'Bodyweight', [
    'Tek ayak üzerinde hafif çömelmiş atletik duruş al, gövde hafif öne eğik.',
    'Diğer ayağın üzerine yanlamasına patlayıcı şekilde sıçrayıp arka ayağı çapraza geçir.',
    'Dengeni hemen kilitleyip beklemeden diğer tarafa süratle sıçramaya devam et.'
  ]),
  'wall-sit': ex('wall-sit', 'Wall Sit (Duvar Oturuşu)', 'Quads', ['Glutes'], 'Wall', [
    'Sırtını düz bir duvara yasla, ayaklarını duvardan yaklaşık iki adım öne al.',
    'Dizlerin ayak bileğinin tam üstünde 90° açı yapana dek sırtını aşağı kaydır.',
    'Eller duvara ya da bacağa bastırmadan ön bacaktaki yanmaya rağmen sabit bekle.'
  ]),

  // === LEAP CATALOG: SIRT & OMUZ (8) ===
  'superman-hold': ex('superman-hold', 'Superman Hold (Bel & Sırt)', 'Lower Back', ['Glutes', 'Upper Back'], 'Bodyweight', [
    'Yüzüstü mata uzan, kollar baş üstünde ileri, bacaklar arkaya düz uzatılmış.',
    'Boynu germeden aynı anda kolları, göğsü ve düz bacakları yerden kaldır.',
    'Alt sırt, kürek arası ve kalça sıkılıyken üst pozisyonda nefes kesmeden tut.'
  ]),
  'prone-y-raise': ex('prone-y-raise', 'Prone Y Raises (Alt Trapez)', 'Upper Back', ['Rear Delts'], 'Bodyweight', [
    'Yüzüstü yere uzan, başparmaklar tavana bakacak şekilde kolları Y açısında öne aç.',
    'Omuzları kulaklardan uzaklaştırıp alt trapez gücüyle kolları yerden kaldır.',
    'Tepe noktada 1 saniye tutup kürek kemiklerini aşağı-arkaya sabitle ve in.'
  ]),
  'pike-push-up': ex('pike-push-up', 'Pike Push-Up (V Omuz İtiş)', 'Shoulders', ['Triceps'], 'Bodyweight', [
    'Kalçayı yüksekte tutup vücutla ters V açısı oluştur; eller omuz genişliğinde.',
    'Dirsekleri hafif içeri bükerek başının üstünü iki elinin biraz önüne doğru indir.',
    'Omuz başlarıyla yeri dikey olarak itip başlangıç ters V pozisyonuna dön.'
  ]),
  'bird-dog': ex('bird-dog', 'Bird Dog (Omurga & Denge)', 'Core', ['Lower Back', 'Glutes'], 'Bodyweight', [
    'Eller tam omuz altında, dizler kalça altında dört ayak pozisyonunda belini nötr kur.',
    'Kalçayı döndürmeden sağ kolunu öne, sol bacağını arkaya düz hizada tam uzat.',
    '1 saniye dengeyi kilitle, merkeze topla ve çapraz tarafla kontrollü tekrarla.'
  ]),
  'feet-elevated-pike-push-up': ex('feet-elevated-pike-push-up', 'Elevated Pike Push-Up', 'Shoulders', ['Triceps'], 'Bodyweight', [
    'Ayak parmaklarını sağlam sehpaya koy, elleri geride tutarak gövdeyi yere dikey yaklaştır.',
    'Bakış ellerin biraz gerisinde, başı kontrollüce iki elin arasındaki noktaya indir.',
    'Ön ve yan omuzun tam gücüyle dikey itiş yaparak kolları yukarı uzat.'
  ]),
  'doorway-row': ex('doorway-row', 'Doorway Row (Kapı Çekiş)', 'Back', ['Biceps', 'Upper Back'], 'Doorway', [
    'Kapı çerçevesinin iki yanını göğüs hizasında kavra, ayakları çerçeveye yakın koy.',
    'Vücut düz kalacak şekilde kolları tamamen uzatarak kontrollü geriye eğil.',
    'Kürek kemiklerini sırt ortasında sıkıştırarak göğsünü çerçeveye doğru çek.'
  ]),
  'prone-t-raise': ex('prone-t-raise', 'Prone T Raises (Arka Omuz)', 'Upper Back', ['Rear Delts'], 'Bodyweight', [
    'Yüzüstü uzanıp kollarını T harfi gibi yanlara aç, başparmaklar yukarı baksın.',
    'Beli zorlamadan yalnızca kürek kemiklerini sıkarak kolları yerden yükselt.',
    'Arka omuz ve orta sırt kasılmasını 1 saniye hissedip yavaşça yere in.'
  ]),
  'reverse-snow-angel': ex('reverse-snow-angel', 'Reverse Snow Angels', 'Upper Back', ['Rear Delts', 'Lower Back'], 'Bodyweight', [
    'Yüzüstü yat, göğüs yerden çok hafif yukarıda ve kollar baş önünde uzanık.',
    'Avuç içlerini yere çevirerek kolları büyük yarım daire şeklinde kalçaya doğru çek.',
    'Alt noktada kürek kemiklerini birbirine kilitleyip kontrollü kavisle öne getir.'
  ]),

  // === HOME DUMBBELL PLANS (28 STRICTLY UNIQUE) ===
  'incline-dumbbell-press': ex('incline-dumbbell-press', 'Incline Dumbbell Press', 'Chest', ['Shoulders', 'Triceps'], 'Dumbbell', [
    '30° eğimli sehpada dambılları göğüs üst hizasında avuçlar ileri bakacak şekilde tut.',
    'Kürek kemiklerini sehpaya kilitleyerek dambılları 45° dirsek açısıyla üst göğse indir.',
    'Üst göğsü sıkıştırarak dambılları hafif içe doğru kavisle yukarı presle.'
  ]),
  'standing-dumbbell-press': ex('standing-dumbbell-press', 'Standing Dumbbell Press', 'Shoulders', ['Triceps', 'Core'], 'Dumbbell', [
    'Ayakta kalça genişliğinde basıp karnı taş gibi kilitle; dambıllar omuz hizasında.',
    'Beli geriye bükmeden dambılları baş üstüne dikey eksende yukarı doğru it.',
    'Üstte kulak hizasında kilitle ve omuzlarda tansiyonu kaybetmeden kontrollü in.'
  ]),
  'lateral-raise': ex('lateral-raise', 'Dumbbell Lateral Raise', 'Shoulders', [], 'Dumbbell', [
    'Dambıllar yanlarda, dirsekler ~15° sabit kırık ve gövde hafif dik duruşta.',
    'Savurmadan dirsekleri önde tutarak kolları omuz hizasına T gibi aç.',
    'Yan omuz kasılmasını tepe noktada hissedip 3 saniyede kontrollü aşağı indir.'
  ]),
  'dumbbell-fly': ex('dumbbell-fly', 'Dumbbell Fly (Göğüs Açış)', 'Chest', ['Shoulders'], 'Dumbbell', [
    'Düz sehpada avuç içleri birbirine bakacak şekilde kolları göğüs üzerinde tut.',
    'Dirsek açısını kilitli koruyarak kolları büyük bir ağaca sarılır gibi yana aç.',
    'Göğsün derin esnediği hizada dur ve iç göğüs liflerini sıkarak yukarı topla.'
  ]),
  'dumbbell-overhead-tricep-extension': ex('dumbbell-overhead-tricep-extension', 'Dumbbell Overhead Triceps Extension', 'Triceps', [], 'Dumbbell', [
    'Tek dambılı iki elinle üst plakasından kavrayıp kollar gergin baş üstünde tut.',
    'Üst kolları kulak hizasında sabit tutup ön kolu baş arkasına doğru bük.',
    'Arka kolun gerilmesini hissedip yalnızca dirsekten iterek yukarı uzat.'
  ]),
  'one-arm-dumbbell-row': ex('one-arm-dumbbell-row', 'One-Arm Dumbbell Row', 'Back', ['Lats', 'Biceps'], 'Dumbbell', [
    'Bir elin ve aynı taraf dizin sehpada, sırt yere paralel tamamen düz.',
    'Diğer elle dambılı aşağı sarkıtıp küreği esnet, gövdeyi çevirmeden kavra.',
    'Dirseği geriye kalça cebine doğru kavisli çekip kanadı 1 saniye sık.'
  ]),
  'rear-delt-fly': ex('rear-delt-fly', 'Rear Delt Fly (Arka Omuz)', 'Rear Delts', ['Upper Back'], 'Dumbbell', [
    'Kalçadan 45° öne eğil, bel düz ve dambıllar dizlerin altında serbest.',
    'Trapezleri sıkmadan yalnızca arka omuzla kolları yanlara doğru genişçe aç.',
    'Üstte kısa bir duraklamanın ardından ağırlıkları savurmadan yavaşça indir.'
  ]),
  'inverted-row': ex('inverted-row', 'Inverted Row (Vücut Çekişi)', 'Back', ['Biceps', 'Rear Delts'], 'Bodyweight', [
    'Sabit alçak barın veya sağlam masanın altına gir, elleri omuzdan biraz geniş tut.',
    'Topuklardan başa vücut düz çizgi halindeyken göğsü bara doğru çek.',
    'Tepe noktada kürek kemiklerini sıktıktan sonra kollar düz olana dek in.'
  ]),
  'hammer-curl': ex('hammer-curl', 'Hammer Curl', 'Biceps', ['Forearms'], 'Dumbbell', [
    'Avuç içleri gövdeye dönük (nötr çekiç tutuş) dirsekleri kaburga yanında sabitle.',
    'Dirseği öne savurmadan dambılı omza doğru ön kol + brachialis ile bük.',
    'Tepede 1 saniye sıkıştır ve ağırlığı yere kadar kontrollü şekilde indir.'
  ]),
  'reverse-crunch': ex('reverse-crunch', 'Reverse Crunch (Alt Karın)', 'Core', [], 'Bodyweight', [
    'Sırtüstü uzan, dizler 90° havada ve eller gövde yanında yerde sabit.',
    'Bacakları savurmadan alt karın kasılmasıyla kalçayı yerden hafif yuvarla.',
    'Dizleri alna yaklaştırdıktan sonra belini yere ezmeden başlangıca kontrolle in.'
  ]),
  'dead-bug': ex('dead-bug', 'Dead Bug (Derin Core)', 'Core', ['Lower Back'], 'Bodyweight', [
    'Sırtüstü yat, kollar dikey tavana, dizler ve kalça 90° bükülü havada.',
    'Beli yere tam kilitleyerek sağ kolu baş arkasına, sol bacağı ileri yavaşça uzat.',
    'Bel boşluğu oluşmadan merkeze topla ve ters kol-bacakla sırayla uygula.'
  ]),
  'goblet-squat': ex('goblet-squat', 'Goblet Squat', 'Quads', ['Glutes', 'Core'], 'Dumbbell', [
    'Tek dambılı göğüs önünde dikey tut, ayaklar omuz genişliğinde hafif dışa açık.',
    'Göğüs dik şekilde dirsekleri dizlerin iç tarafına alarak tam derine çömel.',
    'Topuklardan güçlüçe basarak dizleri aç ve dik başlangıç konumuna dön.'
  ]),
  'dumbbell-romanian-deadlift': ex('dumbbell-romanian-deadlift', 'Dumbbell Romanian Deadlift', 'Hamstrings', ['Glutes', 'Lower Back'], 'Dumbbell', [
    'Dambıllar üst bacak önünde, dizler çok hafif kırık ve omuzlar geride sabit.',
    'Dizleri daha fazla bükmeden kalçayı arkaya itip dambılları kaval hizasına indir.',
    'Arka bacaktaki derin esnemeyi hissedince kalçayı ileri iterek dik pozisyona kalk.'
  ]),
  'reverse-lunge': ex('reverse-lunge', 'Reverse Lunge (Geriye Adım)', 'Quads', ['Glutes', 'Hamstrings'], 'Dumbbell', [
    'İki elde dambıllar yanlarda, kalça genişliğinde dik başlangıç duruşu al.',
    'Bir ayağını geriye geniş adım alarak indir ve her iki dizde ~90° açı yakala.',
    'Ön bacağın topuğuna basarak başlangıç pozisyonuna güçlüçe yüksel.'
  ]),
  'dumbbell-glute-bridge': ex('dumbbell-glute-bridge', 'Dumbbell Glute Bridge', 'Glutes', ['Hamstrings'], 'Dumbbell', [
    'Sırtüstü uzan, bir dambılı kalça/kasık kıvrımına iki elinle sabitle.',
    'Dizler yukarı bakarken topuklardan güç alıp kalçayı tavana düz hizada it.',
    'Kalça kaslarını tepede 1-2 saniye sertçe sık ve kontrollü şekilde mata indir.'
  ]),
  'single-leg-calf-raise': ex('single-leg-calf-raise', 'Single-Leg Calf Raise', 'Calves', [], 'Bodyweight', [
    'Bir elinle duvar veya sehpaya hafifçe tutun, tek ayakla basamakta dur.',
    'Topuğu basamak seviyesinin altına kontrollüce düşürerek baldırı tam esnet.',
    'Parmak ucunun üstünde olabildiğince dik yüksel ve kalfı 1 sn sık.'
  ]),
  'dumbbell-bench-press': ex('dumbbell-bench-press', 'Dumbbell Bench Press', 'Chest', ['Triceps', 'Shoulders'], 'Dumbbell', [
    'Düz sehpaya sırtüstü yat, ayakları yere sağlam basıp kürekleri sıkıştır.',
    'Dambılları göğsün orta yan hizasına 45° dirsek açısıyla kontrollü indir.',
    'Göğüs merkezine doğru paralel basıp kolları kilitlemeden tekrarla.'
  ]),
  'dumbbell-bent-over-row': ex('dumbbell-bent-over-row', 'Bent-Over Dumbbell Row', 'Back', ['Lats', 'Biceps'], 'Dumbbell', [
    'Kalçadan ~45° öne eğil, bel düz ve iki eldeki dambıllar bacak önünde serbest.',
    'Dirsekleri gövde yanından geriye çekerek dambılları kalça hizasına getir.',
    'Kürek kemiklerini tepe noktada 1 saniye sıkıp ağırlıkları kontrollü indir.'
  ]),
  'arnold-press': ex('arnold-press', 'Arnold Press', 'Shoulders', ['Triceps'], 'Dumbbell', [
    'Dambılları çene önünde avuç içleri yüzüne dönük şekilde tutarak başla.',
    'Yukarı iterken bileklerini kontrollü biçimde dışa doğru 180° döndür.',
    'Tepe noktada avuçlar ileri bakarken presi tamamla ve ters rota ile in.'
  ]),
  'bent-over-rear-delt-raise': ex('bent-over-rear-delt-raise', 'Bent-Over Rear Delt Raise', 'Rear Delts', ['Upper Back'], 'Dumbbell', [
    'Sehpa ucu veya ayakta gövdeyi neredeyse yere paralel konuma eğerek hazırlan.',
    'Dirsek açısını kilitleyip dambılları arka omuz gücüyle T şeklinde yanlara kaldır.',
    'Gövdeden savurma almadan kontrollü inişle arka omuz yanmasını koru.'
  ]),
  'concentration-curl': ex('concentration-curl', 'Concentration Curl', 'Biceps', [], 'Dumbbell', [
    'Sehpa ucuna otur, dirseğinin arka kısmını aynı taraf uyluğunun içine yasla.',
    'Omuzu düşürmeden sadece biceps gücüyle dambılı omzuna doğru bük.',
    'Tepe noktada serçe parmağı hafifçe dışa çevirip biceps zirvesini sık.'
  ]),
  'tricep-kickback': ex('tricep-kickback', 'Tricep Kickback', 'Triceps', [], 'Dumbbell', [
    'Öne eğilip sırtı düz tut, üst kolunu gövdeye tamamen paralel arkaya kilitle.',
    'Dirseği sabit tutarak yalnızca ön kolunu dambılla geriye tamamen düz olana dek it.',
    'En arka noktada arka kolu 1 saniye sıkıştırıp 90° konuma kontrollü getir.'
  ]),
  'dumbbell-sumo-squat': ex('dumbbell-sumo-squat', 'Dumbbell Sumo Squat', 'Glutes', ['Quads', 'Adductors'], 'Dumbbell', [
    'Ayakları omuzdan çok geniş aç, ayak uçları 45° dışa dönük ve dambıl ortada.',
    'Gövde dik şekilde dizleri parmak ucu yönüne açarak derin iç bacak/kalça çöküşü yap.',
    'İç bacak ve kalçayı sıkarak topuklardan yere basıp başlangıca dön.'
  ]),
  'single-leg-romanian-deadlift': ex('single-leg-romanian-deadlift', 'Single-Leg Romanian Deadlift', 'Hamstrings', ['Glutes', 'Core'], 'Dumbbell', [
    'Tek ayak üzerinde hafif kırık dizle denge kur, dambıl karşı/her iki elde hazır.',
    'Serbest bacağı düz olarak arkaya kaldırırken gövdeyi kalçadan menteşe gibi eğ.',
    'Arka bacak gerildiğinde kalçayı öne iterek dengeni bozmadan dik konuma dön.'
  ]),
  'seated-dumbbell-press': ex('seated-dumbbell-press', 'Seated Dumbbell Press', 'Shoulders', ['Triceps'], 'Dumbbell', [
    'Dik sırtlı sehpaya otur, sırtı ve ayakları yere sabitle; dambıllar kulak yanında.',
    'Dirsekler çok hafif önde açılıyken ağırlıkları baş üstünde birbirine yaklaştır.',
    'Dambılları birbirine çarpmadan kontrollü indirip omuz tansiyonunu koru.'
  ]),
  'band-pull-apart': ex('band-pull-apart', 'Band Pull-Apart (Postür)', 'Upper Back', ['Rear Delts'], 'Resistance Band', [
    'Direnç bandını omuz hizasında iki elle öne düz uzatarak gergin şekilde tut.',
    'Dirsekleri bükmeden bandı göğsüne doğru yanlara çekip kürekleri yaklaştır.',
    'Omuzları aşağıda sabit tutarak arka omuzu 1 sn sık ve yavaşça ortaya dön.'
  ]),
  'ab-wheel': ex('ab-wheel', 'Ab Wheel Rollout (Core Tekerlek)', 'Core', ['Shoulders', 'Lats'], 'Bodyweight', [
    'Dizler mat üstünde, eller ab wheel saplarında ve karın içe çekili (hollow) başla.',
    'Kalçayı ileri bırakırken tekerleği öne doğru bel çökmeden kontrollüce sür.',
    'Core kontrolünü kaybetmeden kanat ve karın gücüyle tekerleği başlangıca çek.'
  ]),
  'weighted-russian-twist': ex('weighted-russian-twist', 'Weighted Russian Twist', 'Core', [], 'Dumbbell', [
    'Yerde oturma pozisyonunda göğüs önünde tek dambıl/plaka tut, 45° geriye yaslan.',
    'Gözlerin ve ağırlığın ellerle birlikte omuzlardan önce sağ kalçana dönsün.',
    'Alt sırt sabitken akıcı şekilde diğer kalça yanına çevirerek oblikleri çalıştır.'
  ]),

  // === GYM PLANS (19 STRICTLY UNIQUE) ===
  squat: ex('squat', 'Barbell Back Squat', 'Quads', ['Glutes', 'Core'], 'Barbell', [
    'Barı üst trapezlerin üzerine güvenli yerleştir, ayaklar omuz genişliğinde.',
    'Derin nefesle göğsü kilitle, kalçayı geriye vererek uyluk paralel altına in.',
    'Bar yolu dikey kalacak şekilde topuk ve orta ayaktan patlayıcı güçle kalk.'
  ]),
  'bench-press': ex('bench-press', 'Barbell Bench Press', 'Chest', ['Triceps', 'Shoulders'], 'Barbell', [
    'Gözlerin barın altında, kürek kemikleri sehpada birbirine kenetli ve ayaklar basılı.',
    'Barı omuzdan geniş kavrayıp göğsün alt-orta çizgisine kontrollü (2-3 sn) indir.',
    'Bacak itişiyle destek alıp barı başlangıç çizgisine güçlüce yukarı it.'
  ]),
  'lat-pulldown': ex('lat-pulldown', 'Lat Pulldown', 'Lats', ['Biceps', 'Upper Back'], 'Cable', [
    'Barı omuzdan geniş kavra, uylukları pedin altına sıkıca sabitle.',
    'Gövde çok hafif gerideyken dirsekleri aşağı yanlara çekerek barı üst göğse getir.',
    'Sırt kanatlarını alt noktada sık, ardından kolları tam yukarı uzat.'
  ]),
  'overhead-press': ex('overhead-press', 'Barbell Overhead Press', 'Shoulders', ['Triceps', 'Core'], 'Barbell', [
    'Bar köprücük kemiği üzerinde, eller omuz genişliğinin hemen dışında.',
    'Kalça ve karnı sıkıp çeneyi hafif geri alarak barı dikey baş üstüne it.',
    'Bar başı geçtiğinde başı hafif öne alıp üst noktada kilitle, yavaşça indir.'
  ]),
  'cable-lateral-raise': ex('cable-lateral-raise', 'Cable Lateral Raise', 'Shoulders', [], 'Cable', [
    'Kabloyu en alt seviyeye takıp yan tarafa dur, tutamacı dış elinle kavra.',
    'Kablonun alt noktadaki sabit gerilimini koruyarak kolu omuz hizasına aç.',
    'Omuzu kulaklara çekmeden kontrollü aşağı indirip sürekli gerilim sağla.'
  ]),
  'hanging-knee-raise': ex('hanging-knee-raise', 'Hanging Knee Raise', 'Core', ['Forearms'], 'Pull-up Bar', [
    'Barfiks barından omuz genişliğinde asıl, sallanmayı tamamen durdur.',
    'Dizleri göğse çekerken kalçayı da hafifçe yukarı yuvarlayarak alt karnı sık.',
    'Sallanmaya izin vermeden bacakları kontrollü başlangıca uzat.'
  ]),
  'romanian-deadlift': ex('romanian-deadlift', 'Barbell Romanian Deadlift', 'Hamstrings', ['Glutes', 'Lower Back'], 'Barbell', [
    'Bar uyluğun önünde, dizler yumuşak kırık ve kürek kemikleri geride sabit.',
    'Barı bacaklara sürtecek kadar yakın tutarak kalçayı geriye it ve diz altına in.',
    'Hamstring geriliminde durup kalçayı sıkarak barı yukarı kaldır.'
  ]),
  'seated-row': ex('seated-row', 'Seated Cable Row', 'Back', ['Lats', 'Biceps'], 'Cable', [
    'Ayaklar platformda dizler hafif bükülü, sırt dik ve kollar öne uzanmış.',
    'Gövdeyi aşırı geriye atmadan dirsekleri gövde yanından bele doğru çek.',
    'Kürek kemiklerini sırt ortasında birleştirip ağırlığı kontrollü ileri sal.'
  ]),
  'incline-bench-press': ex('incline-bench-press', 'Incline Barbell Bench Press', 'Chest', ['Shoulders', 'Triceps'], 'Barbell', [
    '30-45° eğimli sehpada barı omuzdan geniş kavra, omuzları sehpaya sabitle.',
    'Dirsekleri ~45° açıyla kırarak barı üst göğse (köprücük hizası altına) indir.',
    'Üst göğsü sıkarak barı dikey çizgide başlangıca bas.'
  ]),
  'split-squat': ex('split-squat', 'Split Squat (Sabit Hamle)', 'Quads', ['Glutes'], 'Dumbbell', [
    'Bir ayak önde diğeri arkada sabit geniş adım pozisyonunda dik dur.',
    'Ayakları oynatmadan ağırlık merkezini tam aşağı indirip ön diz 90° yakala.',
    'Ön bacak ve kalçayla dikey yukarı iterek aynı bacakta tüm tekrarı bitir.'
  ]),
  'face-pull': ex('face-pull', 'Face Pull (Kablo Arka Omuz)', 'Upper Back', ['Rear Delts'], 'Cable', [
    'Halat aparatını alın/yüz hizasına ayarla, iki elle avuç içleri içe bakar tut.',
    'Halatı iki yana açarak kulakların hizasına doğru çek, dirsekleri yüksek tut.',
    'Arka omuz ve dış döndürücüleri 1 saniye sıkıp kabloyu kontrollü uzat.'
  ]),
  'pallof-press': ex('pallof-press', 'Cable Pallof Press (Anti-Rotasyon)', 'Core', ['Shoulders'], 'Cable', [
    'Kablo istasyonuna yan dön, tutamacı iki elinle göğüs ortasında tut ve yana adım at.',
    'Kablo seni yana döndürmeye çalışırken karnı kilitleyip kolları öne tam uzat.',
    '2 saniye boyunca dönmeye diren ve göğse geri çekerek yan core gücünü artır.'
  ]),
  'leg-press': ex('leg-press', 'Leg Press', 'Quads', ['Glutes', 'Hamstrings'], 'Machine', [
    'Sırt ve kalçayı koltuğa tamamen yapıştır, ayakları omuz genişliğinde platforma bas.',
    'Emniyet kollarını aç, dizleri göğse doğru kontrollü indir (bel kalkmasın).',
    'Dizleri tam kilitlemeden ön bacak ve topuk itişiyle platformu yukarı it.'
  ]),
  'machine-chest-press': ex('machine-chest-press', 'Machine Chest Press', 'Chest', ['Triceps', 'Shoulders'], 'Machine', [
    'Koltuk yüksekliğini kolların göğsün orta çizgisine hizalı olacak şekilde ayarla.',
    'Kürek kemiklerini sırt yastığına sabitleyip kolları öne kontrollü it.',
    'Göğsü sıkarak ağırlık plakaları değmeden başlangıç noktasına yavaşça dön.'
  ]),
  'wide-grip-lat-pulldown': ex('wide-grip-lat-pulldown', 'Wide-Grip Lat Pulldown', 'Lats', ['Upper Back', 'Biceps'], 'Cable', [
    'Geniş barı omuzlardan 1.5 kat geniş üstten kavra ve gövdeyi stabilize et.',
    'Dirsekleri aşağı-yana doğru çekerek üst göğse kadar temiz çekiş yap.',
    'Kanatları alt noktada sıkıştır ve yukarı dönüşte omuzları tam esnet.'
  ]),
  'machine-lateral-raise': ex('machine-lateral-raise', 'Machine Lateral Raise', 'Shoulders', [], 'Machine', [
    'Oturakta pedlerin dirsek/ön kol yanına rahat temas ettiği yüksekliği ayarla.',
    'Omuz başlarıyla dirsekleri yanlara doğru omuz hizasına kaldır.',
    'Ağırlığı bırakmadan kontrollü inişle yan deltoid gerilimini koru.'
  ]),
  'cable-curl': ex('cable-curl', 'Cable Biceps Curl', 'Biceps', ['Forearms'], 'Cable', [
    'Alt makaraya düz/EZ bar tak, omuz genişliğinde kavra ve dirsekleri yanlara sabitle.',
    'Omuzları öne düşürmeden ön kolları göğse doğru bükerek kabloyu yukarı çek.',
    'Tepe kasılmasında 1 saniye bekle ve kablo çekişine direnerek yavaşça in.'
  ]),
  'rope-tricep-pushdown': ex('rope-tricep-pushdown', 'Rope Triceps Pushdown', 'Triceps', [], 'Cable', [
    'Üst makaradaki halatı iki ucundan kavra, dirsekleri gövde yanlarına kilitle.',
    'Yalnızca ön kolları aşağı itip en alt noktada halat uçlarını iki yana aç.',
    'Arka kolu 1 sn sıkıştır, dirsekleri kaldırmadan 90° üzerine kontrollü çık.'
  ]),
  'cable-crunch': ex('cable-crunch', 'Cable Crunch (Diz Üstü)', 'Core', [], 'Cable', [
    'Üst makaradaki halatı iki elinle şakak/boyun yanında tutarak diz çök.',
    'Kalçayı sabit kilitli tutup yalnızca omurgayı aşağı doğru kıvırarak karnı sık.',
    'Dirsekler dizlere yaklaşsın; alt sırtını zorlamadan kontrollü yukarı dön.'
  ]),

  // === BUILDER / FORM CHECK / ALTERNATIVES POOL (34 UNIQUE EXTRA) ===
  'bicep-curl': ex('bicep-curl', 'Dumbbell Biceps Curl', 'Biceps', ['Forearms'], 'Dumbbell', [
    'Dirsekler gövde yanında sabit, dambılları avuçlar ileri bakacak şekilde tut.',
    'Savurmadan ön kolları omuzlara doğru bük ve biceps tepesini sık.',
    '3 saniye kontrollü negatif inişle kolları tam uzat.'
  ]),
  'single-arm-dumbbell-tricep-extension': ex('single-arm-dumbbell-tricep-extension', 'Single-Arm Triceps Extension', 'Triceps', [], 'Dumbbell', [
    'Tek elde dambılı baş üstüne kaldır, üst kol kulağa yakın dikey sabit.',
    'Dirseği sabit tutarak dambılı başın arkasına yavaşça indir.',
    'Arka kol gücüyle yukarı tam dik konuma uzat.'
  ]),
  'dumbbell-skull-crusher': ex('dumbbell-skull-crusher', 'Dumbbell Skull Crusher', 'Triceps', [], 'Dumbbell', [
    'Sehpada sırtüstü yat, kolları göğsün üstünde dikey tut (nötr avuç içi).',
    'Üst kolları hafif geriye eğerek dambılları şakakların yanına indir.',
    'Dirsekleri dışa açmadan arka kolla başlangıç noktasına it.'
  ]),
  'standing-calf-raise': ex('standing-calf-raise', 'Standing Calf Raise', 'Calves', [], 'Machine', [
    'Ayak ön kısmıyla platform ucuna bas, topuklar aşağı serbest sarksın.',
    'Baldırı esnetmek için en altta 1 sn bekle, ardından parmak ucunda zirveye çık.',
    'En tepede baldırı sık ve kontrollü in.'
  ]),
  'weighted-crunch': ex('weighted-crunch', 'Weighted Crunch', 'Core', [], 'Plate', [
    'Sırtüstü yat, göğüs önünde veya şakakta hafif plaka/dambıl tut.',
    'Karını sıkarak kürek kemiklerini kontrollü yerden kaldır.',
    'Ağırlığı savurmadan alt noktaya yavaşça in.'
  ]),
  'decline-dumbbell-press': ex('decline-dumbbell-press', 'Decline Dumbbell Press', 'Chest', ['Triceps', 'Shoulders'], 'Dumbbell', [
    'Eğimi aşağı sehpada ayakları sabitle, dambıllar göğüs alt hizasında.',
    'Dirsekler 45° açılı şekilde dambılları alt göğse kontrollü indir.',
    'Alt göğüs lifleriyle yukarı güçlü itiş yap.'
  ]),
  'pull-up': ex('pull-up', 'Pull-Up (Geniş Barfiks)', 'Lats', ['Back', 'Biceps'], 'Pull-up Bar', [
    'Barı omuzdan geniş üstten tut, omuzları kulaklardan aşağı çekerek kur.',
    'Dirsekleri yanlara ve aşağı çekerek çeneyi/göğsü bara yaklaştır.',
    'Sallanmadan omuz kontrolünü koruyarak tamamen aşağı in.'
  ]),
  'chin-up': ex('chin-up', 'Chin-Up (Ters Tutuş Barfiks)', 'Biceps', ['Lats', 'Back'], 'Pull-up Bar', [
    'Barı avuç içleri sana bakacak şekilde omuz genişliğinde kavra.',
    'Biceps ve kanat gücüyle çeneni bar seviyesinin üzerine çek.',
    'Tepe noktada kısa sıkıştırma sonrası yavaşça kolları aç.'
  ]),
  'front-raise': ex('front-raise', 'Dumbbell Front Raise', 'Shoulders', [], 'Dumbbell', [
    'Dambıllar uyluk önünde, omuzlar geride ve core stabil.',
    'Bir veya iki kolu omuz yüksekliğine dek öne dümdüz kaldır.',
    'Ön omuz gerilimiyle savurmadan kontrollü indir.'
  ]),
  'straight-arm-pulldown': ex('straight-arm-pulldown', 'Straight-Arm Pulldown', 'Lats', ['Core', 'Triceps'], 'Cable', [
    'Üst kablodaki düz barı omuz genişliğinde kavra, kalçadan hafif eğil.',
    'Dirsekleri neredeyse tamamen düz tutup barı kanat gücüyle uyluğa çek.',
    'Kolların düz formunu bozmadan omuz hizasına kontrollü geri bırak.'
  ]),
  deadlift: ex('deadlift', 'Conventional Deadlift', 'Posterior Chain', ['Glutes', 'Lower Back', 'Hamstrings'], 'Barbell', [
    'Ayaklar kalça genişliğinde orta taban bar altında, sırt düz ve lats gergin.',
    'Bardaki boşluğu alıp bacaklarla zemini iterek barı kaval boyunca kaldır.',
    'Bar diz üstüne çıkınca kalçayı öne vurarak dik kilitle ve bel bükmeden in.'
  ]),
  'walking-lunge': ex('walking-lunge', 'Walking Lunge (Yürüyen Adım)', 'Quads', ['Glutes', 'Hamstrings'], 'Dumbbell', [
    'İki elde dambıl yanlarda, gövde dik ileri adımla alçal.',
    'Arka diz yere yaklaşırken ön bacak topuğundan iterek yüksel.',
    'Öteki ayağı doğrudan öne atarak sürekli yürüyen adımlarla ilerle.'
  ]),
  'hip-thrust': ex('hip-thrust', 'Barbell Hip Thrust', 'Glutes', ['Hamstrings'], 'Barbell', [
    'Kürek kemiklerinin alt kenarını sehpaya yasla, pedli bar kalça kıvrımında.',
    'Çene hafif göğüste, topuktan itip kalçayı gövdeyle paralel düz çizgiye yükselt.',
    'Tepede 1-2 saniye sert kalça kasılması yapıp kontrollü alçal.'
  ]),
  'dumbbell-hip-thrust': ex('dumbbell-hip-thrust', 'Dumbbell Hip Thrust', 'Glutes', ['Hamstrings'], 'Dumbbell', [
    'Üst sırt sehpaya dayalı, dambıl iki elle kalça üzerinde dengelenmiş.',
    'Topuklardan güç alarak kalçayı yukarı tam düzlüğe it.',
    'Bel boşluğu yapmadan kalçayı tepede sıkıp yavaşça indir.'
  ]),
  'hanging-leg-raise': ex('hanging-leg-raise', 'Hanging Leg Raise', 'Core', ['Hips'], 'Pull-up Bar', [
    'Barfiks barında omuzları aşağı aktif tutarak sallanmadan asıl.',
    'Bacakları düz veya çok hafif kırık tutup kalça seviyesinin üzerine kaldır.',
    'Geri inişte ivmeyi keserek alt karın kontrolüyle indir.'
  ]),
  'preacher-curl': ex('preacher-curl', 'Preacher Curl', 'Biceps', [], 'Machine', [
    'Koltuğu koltuk altı pede tam oturacak şekilde ayarla, üst kollar sabit.',
    'Alt noktadan omuzu kaldırmadan ön kolu tepeye doğru bük.',
    'Biceps uzamasını tam koruyarak ağır ve kontrollü indir.'
  ]),
  'tricep-pushdown': ex('tricep-pushdown', 'Bar Triceps Pushdown', 'Triceps', [], 'Cable', [
    'Üst makara barını omuz genişliğinde kavra, dirsekleri yanlara sabitle.',
    'Ön kolları aşağı düz itip altta tricepsi 1 sn sık.',
    'Dirsekleri öne oynatmadan 90° hizasına geri kontrol et.'
  ]),
  'overhead-tricep-extension': ex('overhead-tricep-extension', 'Cable Overhead Tricep Extension', 'Triceps', [], 'Cable', [
    'Kablo istasyonuna sırtını dön, halatı baş üstünde öne doğru hazırla.',
    'Dirsekleri baş yanında kilitleyip ön kolları ileri-yukarı tam uzat.',
    'Baş arkasına kontrollü büküp arka kolda derin esneme yakala.'
  ]),
  'skull-crusher': ex('skull-crusher', 'EZ-Bar Skull Crusher', 'Triceps', [], 'Barbell', [
    'Sehpada barı göğüs üstünde dikey tut, üst kollar hafif başa eğik.',
    'Dirsekleri sabit tutarak barı alın/baş arkasına kontrollü indir.',
    'Arka kol kasılmasıyla başlangıç noktasına geri it.'
  ]),
  'close-grip-bench-press': ex('close-grip-bench-press', 'Close-Grip Bench Press', 'Triceps', ['Chest', 'Shoulders'], 'Barbell', [
    'Barı omuz genişliğinde (dar tutuş) kavrayıp dirsekleri gövdeye yakın tut.',
    'Barı alt göğse kontrollü indirerek triceps ve iç göğsü yükle.',
    'Güçlü şekilde yukarı bas ve üstte kilitle.'
  ]),
  'close-grip-lat-pulldown': ex('close-grip-lat-pulldown', 'Close-Grip Lat Pulldown', 'Lats', ['Biceps'], 'Cable', [
    'Dar V-bar aparatını iki elle kavra, göğüs hafif yukarı açık.',
    'Dirsekleri gövde yanına sürterek V-barı üst göğse doğru indir.',
    'Kanatları alt noktada sık ve yukarıda tam omuz esnemesi al.'
  ]),
  'machine-shoulder-press': ex('machine-shoulder-press', 'Machine Shoulder Press', 'Shoulders', ['Triceps'], 'Machine', [
    'Tutacaklar omuz hizasında olacak şekilde koltuğu ayarla, sırt pedde.',
    'Beli öne itmeden tutacakları baş üstüne düzgün yukarı bas.',
    'Ağırlık plakalarını vurdurmadan kontrollü in.'
  ]),
  'barbell-row': ex('barbell-row', 'Barbell Bent-Over Row', 'Back', ['Lats', 'Biceps'], 'Barbell', [
    'Barı omuzdan biraz geniş tut, kalçadan 45° eğil ve belini düz kilitle.',
    'Barı alt göğüs/göbek hizasına çekip sırt ortasını sıkıştır.',
    'Omuzları bırakmadan barı bacak boyu kontrollü aşağı uzat.'
  ]),
  'chest-supported-row': ex('chest-supported-row', 'Chest-Supported Row', 'Back', ['Rear Delts', 'Biceps'], 'Machine', [
    'Göğsünü eğimli/dikey pede yaslayarak bel yükünü sıfırla.',
    'Tutacakları geriye çekip kürek kemiklerini birbirine yaklaştır.',
    'Tam öne uzanarak sırtı esnet ve tekrar çek.'
  ]),
  'good-morning': ex('good-morning', 'Good Morning (Arka Zincir)', 'Hamstrings', ['Glutes', 'Lower Back'], 'Barbell', [
    'Bar üst sırtta, dizler hafif yumuşak ve göğüs açık.',
    'Kalçayı geriye iterek sırt düz halde gövdeyi yere paralelliğe yaklaştır.',
    'Hamstring ve kalçayla sırtı düz tutarak başlangıca kalk.'
  ]),
  'step-up': ex('step-up', 'Dumbbell Step-Up', 'Quads', ['Glutes', 'Hamstrings'], 'Dumbbell', [
    'Tek ayağını sağlam yüksek kutuya/sehpaya tam bas.',
    'Arka bacaktan zıplamadan yalnızca üstteki bacak topuğuyla yukarı çık.',
    'Yavaş ve kontrollü (2-3 sn) aşağı in.'
  ]),
  'pec-deck': ex('pec-deck', 'Pec Deck Fly (Kelebek)', 'Chest', ['Shoulders'], 'Machine', [
    'Sırt yastığa yapışık, kollar göğüs hizasında hafif kırık pozisyonda.',
    'Dirsek açısını koruyarak kolları göğsün ortasında birleştir.',
    'İç göğsü 1 sn sıkıp kontrollü yanlara aç.'
  ]),
  'cable-fly': ex('cable-fly', 'Cable Chest Fly', 'Chest', ['Shoulders'], 'Cable', [
    'Çift makara ortasında bir adım öne at, kollar yanlarda hafif kırık.',
    'Büyük bir ağaca sarılır gibi elleri göğsün orta hattında kavuştur.',
    'Omuz önü değil göğsü sıktığından emin olarak yavaşça aç.'
  ]),
  dip: ex('dip', 'Parallel Bar Triceps Dip', 'Triceps', ['Chest', 'Shoulders'], 'Bodyweight', [
    'Paralel barlara çıkıp gövdeyi neredeyse dik, dirsekleri geriye hizalı tut.',
    'Üst kol yere paralel olana dek kontrollü alçal.',
    'Arka kol gücüyle yukarı it ve başlangıç duruşuna çık.'
  ]),
  superman: ex('superman', 'Dynamic Superman', 'Lower Back', ['Glutes', 'Upper Back'], 'Bodyweight', [
    'Yüzüstü yere uzan, kollar ileri uzatılmış ve bakış mata dönük.',
    'Nefes verirken göğsü, kolları ve bacakları kontrollü yerden kaldır.',
    'Tepe kasılmasından sonra yavaşça mata dönüp tekrar et.'
  ]),
  'high-knees': ex('high-knees', 'High Knees (Yüksek Diz Koşusu)', 'Legs', ['Core', 'Calves'], 'Bodyweight', [
    'Ayakta atletik duruş al, gövde dik ve kollar koşu açısında bükülü.',
    'Dizleri sırayla kalça hizasına dek seri yukarı çekerek parmak ucunda sek.',
    'Kol-bacak senkronunu hızlandırıp nefesini ritmik koru.'
  ]),
  'jump-rope': ex('jump-rope', 'Jump Rope (İp Atlama)', 'Calves', ['Shoulders', 'Legs'], 'Cardio', [
    'Dirsekler gövde yanında yakın, bileklerden küçük dairelerle ipi çevir.',
    'Ayak parmak uçlarında hafif ve düşük yükseklikte sürekli sek.',
    'Dizleri kilitlemeden esnek bilek ve ayak temasıyla tempoyu sürdür.'
  ]),
  'childs-pose': ex('childs-pose', "Child's Pose (Sırt & Omuz Esneme)", 'Back', ['Shoulders', 'Hips'], 'Bodyweight', [
    'Dizlerin üzerinde oturup topuklara yaslan, gövdeyi öne doğru uzat.',
    'Kolları mata ileri kaydırıp alnını yere yaklaştırırken sırtını serbest bırak.',
    'Derin diyafram nefesleriyle omurga ve omuz gerilimini 30 sn boşalt.'
  ]),
  'cat-cow-stretch': ex('cat-cow-stretch', 'Cat-Cow Stretch (Omurga Mobilite)', 'Mobility', ['Core', 'Lower Back'], 'Bodyweight', [
    'Eller omuz altında, dizler kalça altında dört ayak pozisyonuna geç.',
    'Nefes alırken karnı yere yaklaştırıp göğsü aç (Cow).',
    'Nefes verirken sırtı tavana kambur gibi yuvarlayıp karnı sık (Cat).'
  ])
};

// Normalized exact lookup table mapping every app exercise name -> unique slug
const EXACT_NAME_TO_SLUG = {
  // LeapWorkoutCatalog (52)
  'jumping jacks': 'jumping-jack',
  'abdominal crunches': 'crunch',
  'russian twist': 'russian-twist',
  'mountain climber': 'mountain-climber',
  plank: 'plank',
  'bicycle crunches': 'bicycle-crunch',
  'lying leg raises': 'lying-leg-raise',
  'heel touch': 'heel-tap',
  'side plank': 'side-plank',
  'hollow body hold': 'hollow-body-hold',
  burpees: 'burpee',
  'v-ups': 'v-up',
  'flutter kicks': 'flutter-kick',
  'plank jacks': 'plank-jack',
  'plank shoulder taps': 'plank-shoulder-tap',
  'incline push-ups': 'incline-push-up',
  'knee push-ups': 'knee-push-up',
  'push-ups': 'push-up',
  'wide arm push-ups': 'wide-push-up',
  'doorway chest stretch': 'doorway-chest-stretch',
  'push-up shoulder taps': 'push-up-shoulder-tap',
  'decline push-ups': 'decline-push-up',
  'chest dips': 'chest-dip',
  'hindu push-ups': 'hindu-push-up',
  'explosive push-ups': 'explosive-push-up',
  'archer push-ups': 'archer-push-up',
  'typewriter push-ups': 'typewriter-push-up',
  'weighted push-ups': 'weighted-push-up',
  'arm circles': 'arm-circles',
  'chair triceps dips': 'chair-dip',
  'wall push-ups': 'wall-push-up',
  'crab walk': 'crab-walk',
  'diamond push-ups': 'diamond-push-up',
  'bench triceps dips': 'bench-dip',
  'towel biceps rows': 'towel-row',
  'inchworm walkouts': 'inchworm',
  'bodyweight squat': 'bodyweight-squat',
  'forward lunges': 'forward-lunge',
  'glute bridge': 'glute-bridge',
  'calf raises': 'calf-raise',
  'jump squats': 'jump-squat',
  'bulgarian split squat': 'bulgarian-split-squat',
  'skater hops': 'skater-hop',
  'wall sit': 'wall-sit',
  'superman hold': 'superman-hold',
  'prone y raises': 'prone-y-raise',
  'pike push-ups': 'pike-push-up',
  'bird dog': 'bird-dog',
  'elevated pike push-ups': 'feet-elevated-pike-push-up',
  'doorway rows': 'doorway-row',
  'prone t raises': 'prone-t-raise',
  'reverse snow angels': 'reverse-snow-angel',

  // Home Plans (28)
  'incline dumbbell press': 'incline-dumbbell-press',
  'standing dumbbell press': 'standing-dumbbell-press',
  'lateral raise': 'lateral-raise',
  'dumbbell fly': 'dumbbell-fly',
  'dumbbell overhead triceps extension': 'dumbbell-overhead-tricep-extension',
  'dumbbell overhead tricep extension': 'dumbbell-overhead-tricep-extension',
  'one-arm dumbbell row': 'one-arm-dumbbell-row',
  'rear delt fly': 'rear-delt-fly',
  'inverted row': 'inverted-row',
  'hammer curl': 'hammer-curl',
  'reverse crunch': 'reverse-crunch',
  'dead bug': 'dead-bug',
  'goblet squat': 'goblet-squat',
  'dumbbell romanian deadlift': 'dumbbell-romanian-deadlift',
  'reverse lunge': 'reverse-lunge',
  'dumbbell glute bridge': 'dumbbell-glute-bridge',
  'single-leg calf raise': 'single-leg-calf-raise',
  'dumbbell bench press': 'dumbbell-bench-press',
  'bent-over dumbbell row': 'dumbbell-bent-over-row',
  'arnold press': 'arnold-press',
  'bent-over rear delt raise': 'bent-over-rear-delt-raise',
  'concentration curl': 'concentration-curl',
  'triceps kickback': 'tricep-kickback',
  'tricep kickback': 'tricep-kickback',
  'dumbbell sumo squat': 'dumbbell-sumo-squat',
  'single-leg romanian deadlift': 'single-leg-romanian-deadlift',
  'seated dumbbell shoulder press': 'seated-dumbbell-press',
  'seated dumbbell press': 'seated-dumbbell-press',
  'band pull-apart': 'band-pull-apart',
  'ab wheel rollout': 'ab-wheel',
  'weighted russian twist': 'weighted-russian-twist',

  // Gym Plans (19)
  'barbell squat': 'squat',
  'barbell back squat': 'squat',
  'barbell bench press': 'bench-press',
  'lat pulldown': 'lat-pulldown',
  'barbell overhead press': 'overhead-press',
  'cable lateral raise': 'cable-lateral-raise',
  'hanging knee raise': 'hanging-knee-raise',
  'barbell romanian deadlift': 'romanian-deadlift',
  'seated cable row': 'seated-row',
  'incline barbell bench press': 'incline-bench-press',
  'split squat': 'split-squat',
  'face pull': 'face-pull',
  'cable pallof press': 'pallof-press',
  'leg press': 'leg-press',
  'machine chest press': 'machine-chest-press',
  'wide-grip lat pulldown': 'wide-grip-lat-pulldown',
  'machine lateral raise': 'machine-lateral-raise',
  'cable biceps curl': 'cable-curl',
  'rope triceps pushdown': 'rope-tricep-pushdown',
  'cable crunch': 'cable-crunch',

  // Builder / Form Check / Common Alternatives
  'dumbbell bicep curl': 'bicep-curl',
  'single-arm dumbbell tricep extension': 'single-arm-dumbbell-tricep-extension',
  'dumbbell skull crusher': 'dumbbell-skull-crusher',
  'standing calf raise': 'standing-calf-raise',
  'weighted crunch': 'weighted-crunch',
  'decline dumbbell press': 'decline-dumbbell-press',
  'pull-up': 'pull-up',
  'chin-up': 'chin-up',
  'front raise': 'front-raise',
  'straight-arm pulldown': 'straight-arm-pulldown',
  'conventional deadlift': 'deadlift',
  deadlift: 'deadlift',
  'walking lunge': 'walking-lunge',
  'hip thrust': 'hip-thrust',
  'dumbbell hip thrust': 'dumbbell-hip-thrust',
  'hanging leg raise': 'hanging-leg-raise',
  'preacher curl': 'preacher-curl',
  'triceps pushdown': 'tricep-pushdown',
  'overhead triceps extension': 'overhead-tricep-extension',
  'skull crusher': 'skull-crusher',
  'close-grip bench press': 'close-grip-bench-press',
  'close-grip lat pulldown': 'close-grip-lat-pulldown',
  'machine shoulder press': 'machine-shoulder-press',
  'barbell row': 'barbell-row',
  'chest-supported row': 'chest-supported-row',
  'good morning': 'good-morning',
  'step-up': 'step-up',
  'pec deck': 'pec-deck',
  'cable fly': 'cable-fly',
  dips: 'dip',
  dip: 'dip',
  superman: 'superman',
  'high knees': 'high-knees',
  'jump rope': 'jump-rope',
  "child's pose": 'childs-pose',
  'cat-cow stretch': 'cat-cow-stretch'
};

// Prioritized regex fallback only for unseen custom/AI names (specific first)
const FALLBACK_PATTERNS = [
  [/elevated.*pike|feet.*pike/i, 'feet-elevated-pike-push-up'],
  [/pike.*push/i, 'pike-push-up'],
  [/archer/i, 'archer-push-up'],
  [/typewriter/i, 'typewriter-push-up'],
  [/hindu/i, 'hindu-push-up'],
  [/clapping|explosive|plyo/i, 'explosive-push-up'],
  [/decline.*push/i, 'decline-push-up'],
  [/incline.*push/i, 'incline-push-up'],
  [/knee.*push/i, 'knee-push-up'],
  [/wide.*push/i, 'wide-push-up'],
  [/diamond|close-grip push/i, 'diamond-push-up'],
  [/wall.*push/i, 'wall-push-up'],
  [/push-up shoulder/i, 'push-up-shoulder-tap'],
  [/weighted.*push/i, 'weighted-push-up'],
  [/push-up|push up|şınav|sinav/i, 'push-up'],
  [/chest dip/i, 'chest-dip'],
  [/chair.*dip/i, 'chair-dip'],
  [/bench.*dip/i, 'bench-dip'],
  [/dip/i, 'dip'],
  [/doorway.*stretch|chest stretch/i, 'doorway-chest-stretch'],
  [/cat.*cow|cobra/i, 'cat-cow-stretch'],
  [/child.*pose/i, 'childs-pose'],
  [/bulgarian/i, 'bulgarian-split-squat'],
  [/split squat/i, 'split-squat'],
  [/goblet squat/i, 'goblet-squat'],
  [/jump squat/i, 'jump-squat'],
  [/sumo squat/i, 'dumbbell-sumo-squat'],
  [/wall sit/i, 'wall-sit'],
  [/barbell.*squat|back squat/i, 'squat'],
  [/squat/i, 'bodyweight-squat'],
  [/leg press/i, 'leg-press'],
  [/skater/i, 'skater-hop'],
  [/reverse lunge/i, 'reverse-lunge'],
  [/walking lunge/i, 'walking-lunge'],
  [/lunge|adım/i, 'forward-lunge'],
  [/single-leg.*rdl|single-leg.*romanian/i, 'single-leg-romanian-deadlift'],
  [/dumbbell.*rdl|dumbbell.*romanian|db rdl/i, 'dumbbell-romanian-deadlift'],
  [/romanian|rdl/i, 'romanian-deadlift'],
  [/deadlift/i, 'deadlift'],
  [/dumbbell.*hip thrust/i, 'dumbbell-hip-thrust'],
  [/hip thrust/i, 'hip-thrust'],
  [/dumbbell.*glute bridge|glute bridge.*db/i, 'dumbbell-glute-bridge'],
  [/glute bridge|köprü/i, 'glute-bridge'],
  [/single-leg.*calf/i, 'single-leg-calf-raise'],
  [/standing calf/i, 'standing-calf-raise'],
  [/calf|kalf/i, 'calf-raise'],
  [/step-up/i, 'step-up'],
  [/good morning/i, 'good-morning'],
  [/plank shoulder/i, 'plank-shoulder-tap'],
  [/plank jack/i, 'plank-jack'],
  [/side plank/i, 'side-plank'],
  [/plank/i, 'plank'],
  [/hollow/i, 'hollow-body-hold'],
  [/v-up/i, 'v-up'],
  [/flutter/i, 'flutter-kick'],
  [/bicycle|bisiklet/i, 'bicycle-crunch'],
  [/mountain/i, 'mountain-climber'],
  [/heel touch|heel tap/i, 'heel-tap'],
  [/hanging knee/i, 'hanging-knee-raise'],
  [/hanging leg/i, 'hanging-leg-raise'],
  [/leg raise|bacak kaldırma/i, 'lying-leg-raise'],
  [/reverse crunch/i, 'reverse-crunch'],
  [/weighted crunch/i, 'weighted-crunch'],
  [/cable crunch/i, 'cable-crunch'],
  [/crunch|mekik/i, 'crunch'],
  [/weighted.*russian/i, 'weighted-russian-twist'],
  [/russian twist/i, 'russian-twist'],
  [/dead bug/i, 'dead-bug'],
  [/bird dog/i, 'bird-dog'],
  [/ab wheel/i, 'ab-wheel'],
  [/pallof/i, 'pallof-press'],
  [/inchworm/i, 'inchworm'],
  [/crab walk/i, 'crab-walk'],
  [/burpee/i, 'burpee'],
  [/jumping jack/i, 'jumping-jack'],
  [/high knee/i, 'high-knees'],
  [/jump rope|rope/i, 'jump-rope'],
  [/arm circle/i, 'arm-circles'],
  [/superman hold/i, 'superman-hold'],
  [/superman/i, 'superman'],
  [/prone y/i, 'prone-y-raise'],
  [/prone t/i, 'prone-t-raise'],
  [/snow angel/i, 'reverse-snow-angel'],
  [/towel.*row/i, 'towel-row'],
  [/doorway.*row/i, 'doorway-row'],
  [/inverted row/i, 'inverted-row'],
  [/one-arm|single-arm.*row/i, 'one-arm-dumbbell-row'],
  [/bent-over.*row|db row|dumbbell.*row/i, 'dumbbell-bent-over-row'],
  [/chest-supported/i, 'chest-supported-row'],
  [/barbell row/i, 'barbell-row'],
  [/cable row|seated.*row/i, 'seated-row'],
  [/band pull/i, 'band-pull-apart'],
  [/face pull/i, 'face-pull'],
  [/wide-grip.*lat/i, 'wide-grip-lat-pulldown'],
  [/close-grip.*lat/i, 'close-grip-lat-pulldown'],
  [/straight-arm.*pulldown/i, 'straight-arm-pulldown'],
  [/lat pulldown/i, 'lat-pulldown'],
  [/chin-up/i, 'chin-up'],
  [/pull-up|barfiks/i, 'pull-up'],
  [/bent-over.*rear delt/i, 'bent-over-rear-delt-raise'],
  [/rear delt|reverse fly/i, 'rear-delt-fly'],
  [/arnold/i, 'arnold-press'],
  [/seated.*dumbbell.*press|seated.*db.*press/i, 'seated-dumbbell-press'],
  [/standing.*dumbbell.*press/i, 'standing-dumbbell-press'],
  [/machine.*shoulder.*press/i, 'machine-shoulder-press'],
  [/barbell.*overhead press/i, 'overhead-press'],
  [/shoulder press|omuz press/i, 'standing-dumbbell-press'],
  [/cable.*lateral raise/i, 'cable-lateral-raise'],
  [/machine.*lateral raise/i, 'machine-lateral-raise'],
  [/lateral raise/i, 'lateral-raise'],
  [/front raise/i, 'front-raise'],
  [/incline.*dumbbell.*press|incline.*db.*press/i, 'incline-dumbbell-press'],
  [/decline.*dumbbell.*press/i, 'decline-dumbbell-press'],
  [/incline.*barbell.*press|incline bench/i, 'incline-bench-press'],
  [/dumbbell.*bench.*press|floor press/i, 'dumbbell-bench-press'],
  [/machine.*chest press/i, 'machine-chest-press'],
  [/close-grip.*bench/i, 'close-grip-bench-press'],
  [/bench press|chest press/i, 'bench-press'],
  [/pec deck/i, 'pec-deck'],
  [/cable.*fly/i, 'cable-fly'],
  [/dumbbell fly|chest fly/i, 'dumbbell-fly'],
  [/hammer curl/i, 'hammer-curl'],
  [/concentration curl/i, 'concentration-curl'],
  [/preacher curl/i, 'preacher-curl'],
  [/cable.*curl/i, 'cable-curl'],
  [/curl|biceps/i, 'bicep-curl'],
  [/single-arm.*tricep.*ext/i, 'single-arm-dumbbell-tricep-extension'],
  [/dumbbell.*overhead.*tricep/i, 'dumbbell-overhead-tricep-extension'],
  [/overhead.*tricep/i, 'overhead-tricep-extension'],
  [/dumbbell.*skull/i, 'dumbbell-skull-crusher'],
  [/skull.*crusher/i, 'skull-crusher'],
  [/kickback/i, 'tricep-kickback'],
  [/rope.*pushdown/i, 'rope-tricep-pushdown'],
  [/pushdown/i, 'tricep-pushdown']
];

export function resolveExerciseMedia(name = '') {
  const normalized = (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const noParens = normalized.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();

  let slug = EXACT_NAME_TO_SLUG[normalized] || EXACT_NAME_TO_SLUG[noParens];

  if (!slug) {
    const hit = FALLBACK_PATTERNS.find(([re]) => re.test(normalized));
    slug = hit ? hit[1] : 'push-up';
  }

  const info = EXERCISE_MEDIA_DB[slug] || EXERCISE_MEDIA_DB['push-up'];

  return {
    folder: info.slug,
    frame0: `/exercises/${info.slug}/1.svg`,
    frame1: `/exercises/${info.slug}/1.svg`,
    frame2: `/exercises/${info.slug}/2.svg`,
    frame3: `/exercises/${info.slug}/3.svg`,
    label: info.label,
    primaryMuscleTr: info.primaryMuscleTr,
    secondaryMusclesTr: info.secondaryMusclesTr,
    equipmentTr: info.equipmentTr,
    step1: info.step1,
    step2: info.step2,
    step3: info.step3
  };
}
