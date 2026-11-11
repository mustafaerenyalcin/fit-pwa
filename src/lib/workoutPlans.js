import { getSetting } from './store.js';

/**
 * Scientifically-structured Workout Programs
 * Features:
 * - 5-day Home Dumbbell Program focused on shoulder width, core definition, and balanced hypertrophy.
 * - 3-day Gym Full Body Program.
 * - Exercise alternatives for each movement (for injury prevention, variety, or equipment limits).
 * - Rest day guidance.
 */

/**
 * 5-Day Home Dumbbell Program
 * Day 0: Monday (Push + Omuz)
 * Day 1: Tuesday (Pull + Karın)
 * Day 2: Wednesday (Bacak)
 * Day 3: Thursday (Üst Vücut + Omuz)
 * Day 4: Friday (Full Body + Karın)
 */
export const homePlans = [
  {
    day: 0,
    name: 'Pazartesi · Push + Omuz',
    focus: 'Göğüs, ön/yan omuz, triceps',
    moves: [
      {
        name: 'Dumbbell Floor Press',
        muscle: 'Göğüs',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Yerde uzanıp dambılları göğsünden yukarı it. Dirsekleri gövdeye 45° açıda tut.',
        commonMistakes: 'Dirsekleri omuz hizasında 90° açmak, beli aşırı kavislendirmek.',
        category: 'push',
        alternatives: ['Push-ups / Incline Push-ups', 'Dumbbell Incline Press', 'Deficit Push-up']
      },
      {
        name: 'Dumbbell Shoulder Press',
        muscle: 'Ön ve Yan Omuz',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Karın sıkı, gövde dik. Dambılları kulak hizasından kontrollü baş üstüne it.',
        commonMistakes: 'Ağırlığı kaldırırken beli arkaya bükmek, boynu öne itmek.',
        category: 'push',
        alternatives: ['Arnold Press', 'Seated DB Press', 'Pike Push-ups']
      },
      {
        name: 'Lateral Raise',
        muscle: 'Yan Omuz',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Dirsekler hafif bükülü, omuzları kulaklara çekmeden kolları yana doğru uzat.',
        commonMistakes: 'Gövdeyi sallayarak ivme almak, dambılları omuz seviyesinden çok yukarı savurmak.',
        category: 'push',
        alternatives: ['Dumbbell Y-Raise', 'Lean-away Lateral Raise', 'Dumbbell Upright Row']
      },
      {
        name: 'Push-ups / Incline Push-ups',
        muscle: 'Göğüs & Triceps',
        sets: '2 × 8–15',
        defaultSets: 2,
        defaultReps: '8-15',
        restSeconds: 75,
        tip: 'Vücut baştan topuğa tek hat. Bel çökmeden göğsü zemine kontrollü yaklaştır.',
        commonMistakes: 'Kalçayı düşürmek, dirsekleri iki yana açmak.',
        category: 'push',
        alternatives: ['Dumbbell Floor Press', 'Close-grip Push-up', 'Bench Dip']
      },
      {
        name: 'Overhead Triceps Extension',
        muscle: 'Triceps',
        sets: '2 × 10–15',
        defaultSets: 2,
        defaultReps: '10-15',
        restSeconds: 60,
        tip: 'Dirsekleri başın iki yanında sabit tutarak dambılı enseye doğru indir ve yukarı uzat.',
        commonMistakes: 'Dirsekleri dışarı açmak, omuzlardan destek almak.',
        category: 'push',
        alternatives: ['Triceps Kickback', 'Diamond Push-ups', 'Floor Skullcrusher']
      }
    ]
  },
  {
    day: 1,
    name: 'Salı · Pull + Karın',
    focus: 'Sırt, arka omuz, biceps ve core',
    moves: [
      {
        name: 'Single-arm DB Row',
        muscle: 'Sırt (Kanat & Trapez)',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Sırt düz, hafifçe öne eğil. Dirseği kalçana doğru çekerek sırt kaslarını sıkıştır.',
        commonMistakes: 'Gövdeyi döndürerek çekmek, ağırlığı omuzla fırlatmak.',
        category: 'pull',
        alternatives: ['Chest-supported DB Row', 'Dumbbell Gorilla Row', 'Two-arm DB Row']
      },
      {
        name: 'Reverse Fly',
        muscle: 'Arka Omuz & Üst Sırt',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Kalçadan öne eğil, omurga nötr. Kolları hafif bükük şekilde yana doğru aç.',
        commonMistakes: 'Ağır dambıl seçip boyun kaslarını kasmak, sırtı kamburlaştırmak.',
        category: 'pull',
        alternatives: ['Rear Delt Row', 'Prone Y-Raise', 'Band Face Pull']
      },
      {
        name: 'DB Pullover',
        muscle: 'Sırt & Göğüs Genişliği',
        sets: '2 × 10–12',
        defaultSets: 2,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Yerde uzan, dambılı iki elle tutup başının arkasına kontrollü uzat ve geri çek.',
        commonMistakes: 'Aşırı derinliğe zorlayıp omuz eklemini zorlamak, beli yerden koparmak.',
        category: 'pull',
        alternatives: ['Straight-arm DB Kickback', 'Floor Dumbbell Pull', 'Single-arm DB Row']
      },
      {
        name: 'Hammer Curl',
        muscle: 'Biceps & Ön Kol',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 60,
        tip: 'Avuç içleri birbirine bakacak şekilde dirsekleri gövdeye sabitleyip kaldır.',
        commonMistakes: 'Dirsekleri öne arkaya oynatmak, beli sallamak.',
        category: 'pull',
        alternatives: ['Standard Biceps Curl', 'Concentration Curl', 'Zottman Curl']
      },
      {
        name: 'Reverse Crunch',
        muscle: 'Alt Karın',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 45,
        tip: 'Dizler 90° bükülü, alt karnı sıkarak kalçayı birkaç santim yerden yukarı yuvarla.',
        commonMistakes: 'Bacakları savurarak ivme kullanmak, beli yere sert çarpmak.',
        category: 'core',
        alternatives: ['Dead Bug', 'Hanging Knee Raise', 'Lying Leg Raise']
      },
      {
        name: 'Dead Bug',
        muscle: 'Derin Core Kasları',
        sets: '2 × 10 / taraf',
        defaultSets: 2,
        defaultReps: '10 / taraf',
        restSeconds: 45,
        tip: 'Bel boşluğunu zemine yapıştır. Çapraz kol ve bacağı kontrollü uzat.',
        commonMistakes: 'Hareketi yaparken belin yerden havalanması, hızlı yapmak.',
        category: 'core',
        alternatives: ['Plank', 'Bird Dog', 'Hollow Body Hold']
      }
    ]
  },
  {
    day: 2,
    name: 'Çarşamba · Bacak',
    focus: 'Quadriceps, hamstring, kalça ve baldır',
    moves: [
      {
        name: 'Goblet Squat',
        muscle: 'Ön Bacak & Kalça',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Dambılı göğsünün önünde dikey tut. Dizleri ayak parmak yönünde açarak derin çök.',
        commonMistakes: 'Topukların yerden kalkması, gövdenin öne aşırı devrilmesi.',
        category: 'legs',
        alternatives: ['Dumbbell Front Squat', 'Bulgarian Split Squat', 'Bodyweight Pause Squat']
      },
      {
        name: 'DB Romanian Deadlift',
        muscle: 'Arka Bacak & Kalça',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Dizler hafif yumuşak, kalçayı geriye it. Dambıllar bacaklara yakın kalarak kaval kemiğine insin.',
        commonMistakes: 'Sırtı yuvarlamak, dizleri squat gibi çok bükmek.',
        category: 'legs',
        alternatives: ['Single-leg DB RDL', 'B-Stance DB RDL', 'Good Morning with DB']
      },
      {
        name: 'Reverse Lunge',
        muscle: 'Tüm Bacak & Denge',
        sets: '3 × 8–10 / bacak',
        defaultSets: 3,
        defaultReps: '8-10 / bacak',
        restSeconds: 75,
        tip: 'Geriye geniş bir adım at, ön diz 90° olacak şekilde dik alçal.',
        commonMistakes: 'Ön dizin içe kaçması, arkadaki dizi sertçe yere çarpmak.',
        category: 'legs',
        alternatives: ['Walking Lunge', 'Bulgarian Split Squat', 'Step-up']
      },
      {
        name: 'Glute Bridge with DB',
        muscle: 'Kalça',
        sets: '2 × 12–15',
        defaultSets: 2,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Dambılı kasık hizasına yerleştir, topuklardan güç alarak kalçayı tepe noktada sık.',
        commonMistakes: 'Hareketi belden yapmak, kalçayı tepe noktada sıkıştırmamak.',
        category: 'legs',
        alternatives: ['Single-leg Glute Bridge', 'Hip Thrust', 'Frog Pump']
      },
      {
        name: 'Standing Calf Raise',
        muscle: 'Baldır (Kalf)',
        sets: '3 × 15–20',
        defaultSets: 3,
        defaultReps: '15-20',
        restSeconds: 45,
        tip: 'Parmak uçlarında tepeye kadar yüksel, 1 saniye durakla, yavaşça in.',
        commonMistakes: 'Hızlıca zıplamak, tam hareket aralığını kullanmamak.',
        category: 'legs',
        alternatives: ['Single-leg Calf Raise', 'Seated DB Calf Raise', 'Stair Calf Raise']
      }
    ]
  },
  {
    day: 3,
    name: 'Perşembe · Üst Vücut + Omuz',
    focus: 'Göğüs, sırt, yan/arka omuz ve kol hipertrofisi',
    moves: [
      {
        name: 'Dumbbell Floor Press',
        muscle: 'Göğüs',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Yerde sabit omuz kürekleriyle dambılları göğsün orta hattına doğru it.',
        commonMistakes: 'Dambılları yukarıda birbirine çarpmak, kontrolsüz hızlı indirmek.',
        category: 'push',
        alternatives: ['Push-ups', 'Close-grip Floor Press', 'Incline Push-ups']
      },
      {
        name: 'Single-arm DB Row',
        muscle: 'Sırt',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Sırtı düz tutarak dambılı kontrollü çek, kanat kasını 1 saniye sık.',
        commonMistakes: 'Vücudu döndürmek, ağırlığı düşürmek.',
        category: 'pull',
        alternatives: ['Gorilla Row', 'Two-arm DB Row', 'Deadstop Row']
      },
      {
        name: 'Lateral Raise',
        muscle: 'Yan Omuz',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Dambılları yanlara doğru genişçe uzat. Omuz başlarında yanmayı hisset.',
        commonMistakes: 'Bacaklardan güç almak, omuzları kulaklara yapıştırmak.',
        category: 'push',
        alternatives: ['DB Y-Raise', 'Arnold Press', 'Lean-away Lateral Raise']
      },
      {
        name: 'Reverse Fly',
        muscle: 'Arka Omuz',
        sets: '2 × 12–15',
        defaultSets: 2,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Gövde öne eğik, dirsekler hafif kırık. Arka omuzla çekiş yap.',
        commonMistakes: 'Ağır dambıllarla formu bozmak.',
        category: 'pull',
        alternatives: ['Rear Delt Row', 'Band Pull-apart', 'Prone Y-Raise']
      },
      {
        name: 'DB Curl',
        muscle: 'Biceps',
        sets: '2 × 10–12',
        defaultSets: 2,
        defaultReps: '10-12',
        restSeconds: 60,
        tip: 'Avuç içlerini yukarı çevirerek kontrollü kaldır ve yavaşça indir.',
        commonMistakes: 'Dirsekleri öne fırlatmak.',
        category: 'pull',
        alternatives: ['Hammer Curl', 'Incline DB Curl', 'Concentration Curl']
      },
      {
        name: 'Triceps Kickback',
        muscle: 'Triceps',
        sets: '2 × 10–15',
        defaultSets: 2,
        defaultReps: '10-15',
        restSeconds: 60,
        tip: 'Üst kol gövdeye paralel sabit, sadece ön kolu geriye doğru uzatıp tricepsi sık.',
        commonMistakes: 'Üst kolu sallamak, dirseği aşağı düşürmek.',
        category: 'push',
        alternatives: ['Overhead Triceps Extension', 'Diamond Push-ups', 'Bench Dip']
      }
    ]
  },
  {
    day: 4,
    name: 'Cuma · Full Body + Core',
    focus: 'Hafif tüm vücut, omuz stabilitesi ve core',
    moves: [
      {
        name: 'Goblet Squat',
        muscle: 'Ön Bacak & Kalça',
        sets: '2 × 10–12',
        defaultSets: 2,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Kontrollü tempo, temiz derinlik. Form odaklı.',
        commonMistakes: 'Tükenişe kadar zorlamak (Cuma toparlanma vurguludur).',
        category: 'legs',
        alternatives: ['Bulgarian Split Squat', 'Reverse Lunge', 'Bodyweight Squat']
      },
      {
        name: 'DB Romanian Deadlift',
        muscle: 'Arka Bacak',
        sets: '2 × 10–12',
        defaultSets: 2,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Kalçayı geriye it, arka bacakta esnemeyi hisset ve dik konuma gel.',
        commonMistakes: 'Beli bükmek.',
        category: 'legs',
        alternatives: ['Single-leg RDL', 'Glute Bridge with DB']
      },
      {
        name: 'DB Shoulder Press',
        muscle: 'Omuz',
        sets: '2 × 10–12',
        defaultSets: 2,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Karın sıkı, kontrollü yukarı pres.',
        commonMistakes: 'Beli aşırı kavislendirmek.',
        category: 'push',
        alternatives: ['Lateral Raise', 'Arnold Press', 'Pike Push-ups']
      },
      {
        name: 'Single-arm DB Row',
        muscle: 'Sırt',
        sets: '2 × 10–12',
        defaultSets: 2,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Temiz ve kontrollü çekiş, sırtı tam aktif et.',
        commonMistakes: 'İvme kullanmak.',
        category: 'pull',
        alternatives: ['Two-arm DB Row', 'Reverse Fly', 'Gorilla Row']
      },
      {
        name: 'Plank',
        muscle: 'Tüm Core',
        sets: '3 × 30–45 sn',
        defaultSets: 3,
        defaultReps: '30-45 sn',
        restSeconds: 60,
        tip: 'Dirsekler omuzların altında, kalça ve karın taş gibi sıkı, baş nötr.',
        commonMistakes: 'Kalçayı yukarı dikmek veya beli aşağı sarkıtmak.',
        category: 'core',
        alternatives: ['Side Plank', 'Dead Bug', 'Ab Wheel / Walkout']
      },
      {
        name: 'Reverse Crunch',
        muscle: 'Karın',
        sets: '2 × 12–15',
        defaultSets: 2,
        defaultReps: '12-15',
        restSeconds: 45,
        tip: 'Yavaşça karnı sıkıştırarak kalçayı kaldır.',
        commonMistakes: 'Bacakları savurmak.',
        category: 'core',
        alternatives: ['Hollow Hold', 'Bicycle Crunch', 'Dead Bug']
      }
    ]
  }
];

/**
 * 3-Day Gym Full Body Program (Spor Salonu)
 */
export const gymPlans = [
  {
    day: 0,
    name: 'Gün A · Tüm Vücut',
    focus: 'Göğüs, sırt, omuz, bacak ve karın',
    moves: [
      {
        name: 'Barbell / Goblet Squat',
        muscle: 'Bacak & Kalça',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 120,
        tip: 'Göğüs dik, kalça topuk hizasında derin çöküş, dizler ayak ucu yönünde.',
        commonMistakes: 'Dizlerin içeri çökmesi, topukların kalkması.',
        category: 'legs',
        alternatives: ['Leg Press', 'Hack Squat', 'Bulgarian Split Squat']
      },
      {
        name: 'Bench Press',
        muscle: 'Göğüs & Triceps',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Barı göğsün alt kısmına kontrollü indir, kürek kemiklerini sehpaya sabitle.',
        commonMistakes: 'Barı göğse çarptırmak, kalçayı sehpadan kaldırmak.',
        category: 'push',
        alternatives: ['Dumbbell Bench Press', 'Incline DB Press', 'Chest Press Machine']
      },
      {
        name: 'Lat Pulldown',
        muscle: 'Sırt (Kanat)',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 90,
        tip: 'Gövde hafif geriye yatık, barı köprücük kemiğine doğru çek, sırtı sıkıştır.',
        commonMistakes: 'Aşırı geriye yatarak ivme almak.',
        category: 'pull',
        alternatives: ['Pull-up (Barfiks)', 'Assisted Pull-up', 'Neutral-grip Pulldown']
      },
      {
        name: 'Dumbbell Shoulder Press',
        muscle: 'Omuz',
        sets: '2 × 8–12',
        defaultSets: 2,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Sehpada dik veya 80° açıda dambılları baş üstüne presle.',
        commonMistakes: 'Beli aşırı boşluğa düşürmek.',
        category: 'push',
        alternatives: ['Overhead Barbell Press', 'Arnold Press', 'Machine Shoulder Press']
      },
      {
        name: 'Lateral Raise',
        muscle: 'Yan Omuz',
        sets: '2 × 12–15',
        defaultSets: 2,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Dirsekleri hafif bükülü tutarak dambılları omuz hizasına aç.',
        commonMistakes: 'Omuzları yukarı silkmek.',
        category: 'push',
        alternatives: ['Cable Lateral Raise', 'Machine Lateral Raise', 'DB Y-Raise']
      },
      {
        name: 'Plank',
        muscle: 'Core',
        sets: '3 × 30–45 sn',
        defaultSets: 3,
        defaultReps: '30-45 sn',
        restSeconds: 60,
        tip: 'Gövde düz, karın ve kalça sıkı.',
        commonMistakes: 'Beli çökertmek.',
        category: 'core',
        alternatives: ['Hanging Leg Raise', 'Abdominal Crunch Machine', 'Dead Bug']
      }
    ]
  },
  {
    day: 2,
    name: 'Gün B · Tüm Vücut',
    focus: 'Posterior zincir, sırt, omuz ve karın',
    moves: [
      {
        name: 'Romanian Deadlift',
        muscle: 'Hamstring & Kalça',
        sets: '3 × 8–10',
        defaultSets: 3,
        defaultReps: '8-10',
        restSeconds: 120,
        tip: 'Kalçayı geriye doğru uzat, omurga nötr kalsın.',
        commonMistakes: 'Sırtı yuvarlamak.',
        category: 'legs',
        alternatives: ['Dumbbell RDL', 'Leg Curl Machine', 'Glute Ham Raise']
      },
      {
        name: 'Seated Cable Row',
        muscle: 'Sırt & Orta Sırt',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 90,
        tip: 'Kolları çekerken göğsü aç, omuz küreklerini birbirine yaklaştır.',
        commonMistakes: 'Öne arkaya aşırı sallanmak.',
        category: 'pull',
        alternatives: ['Chest-supported T-Bar Row', 'Single-arm DB Row', 'Barbell Row']
      },
      {
        name: 'Incline Dumbbell Press',
        muscle: 'Üst Göğüs & Ön Omuz',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: '30° açılı sehpada kontrollü göğüs presi.',
        commonMistakes: 'Açıyı çok dik tutup omuz presine çevirmek.',
        category: 'push',
        alternatives: ['Incline Barbell Bench Press', 'Incline Machine Press']
      },
      {
        name: 'Bulgarian Split Squat',
        muscle: 'Bacak & Kalça',
        sets: '2 × 8–10 / bacak',
        defaultSets: 2,
        defaultReps: '8-10 / bacak',
        restSeconds: 75,
        tip: 'Arka ayak sehpa üzerinde, ön bacakla derin ve dengeli çök.',
        commonMistakes: 'Ön topuğu kaldırmak, dengesiz inmek.',
        category: 'legs',
        alternatives: ['Walking Lunge', 'Reverse Lunge', 'Leg Press']
      },
      {
        name: 'Face Pull / Reverse Fly',
        muscle: 'Arka Omuz & Postür',
        sets: '2 × 12–15',
        defaultSets: 2,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Halatı alına doğru çek, dirsekleri yüksek tut.',
        commonMistakes: 'Ağır takıp kollardan çekmek.',
        category: 'pull',
        alternatives: ['Reverse Pec Deck', 'Dumbbell Reverse Fly', 'Band Pull-apart']
      },
      {
        name: 'Dead Bug',
        muscle: 'Core',
        sets: '3 × 10 / taraf',
        defaultSets: 3,
        defaultReps: '10 / taraf',
        restSeconds: 45,
        tip: 'Beli yere yapıştır, çapraz kol-bacak kontrollü uzansın.',
        commonMistakes: 'Belin yerden kalkması.',
        category: 'core',
        alternatives: ['Cable Crunch', 'Hanging Knee Raise']
      }
    ]
  },
  {
    day: 4,
    name: 'Gün C · Tüm Vücut',
    focus: 'Dengeli hipertrofi, omuz ve kol vurgusu',
    moves: [
      {
        name: 'Leg Press / Squat',
        muscle: 'Bacak',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 90,
        tip: 'Ayaklar omuz genişliğinde, kontrollü iniş ve güçlü itiş.',
        commonMistakes: 'Dizleri kitleyip geriye atmak.',
        category: 'legs',
        alternatives: ['Goblet Squat', 'Front Squat', 'Hack Squat']
      },
      {
        name: 'Chest Press',
        muscle: 'Göğüs',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Makinada veya dambıllarla stabil göğüs presi.',
        commonMistakes: 'Dirsekleri çok açmak.',
        category: 'push',
        alternatives: ['Bench Press', 'Dumbbell Floor Press', 'Push-ups']
      },
      {
        name: 'Lat Pulldown / Pull-up',
        muscle: 'Sırt',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Tam esneme ve göğse doğru tam çekiş.',
        commonMistakes: 'Yarım tekrar yapmak.',
        category: 'pull',
        alternatives: ['Single-arm DB Row', 'Close-grip Cable Pulldown']
      },
      {
        name: 'Lateral Raise',
        muscle: 'Yan Omuz',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Kabloda veya dambılla omuz yan başlarını izole et.',
        commonMistakes: 'Savurma yapmak.',
        category: 'push',
        alternatives: ['Cable Y-Raise', 'Dumbbell Upright Row']
      },
      {
        name: 'Biceps Curl + Triceps Pushdown',
        muscle: 'Kollar',
        sets: '2 × 10–12',
        defaultSets: 2,
        defaultReps: '10-12',
        restSeconds: 60,
        tip: 'Kolları izole eden süperset veya sıralı setler.',
        commonMistakes: 'Omuzları dahil etmek.',
        category: 'pull',
        alternatives: ['Hammer Curl & Skullcrusher', 'Preacher Curl & Dips']
      },
      {
        name: 'Cable Crunch / Reverse Crunch',
        muscle: 'Karın',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 45,
        tip: 'Omurgayı bükerek karnı tam sıkıştır.',
        commonMistakes: 'Kalçadan çekmek.',
        category: 'core',
        alternatives: ['Plank', 'Dead Bug', 'Hanging Knee Raise']
      }
    ]
  }
];

/**
 * Rest day recommendations for Saturday and Sunday
 */
export const restDayInfo = Object.freeze({
  saturday: {
    day: 5,
    name: 'Cumartesi · Aktif Dinlenme',
    focus: 'Toparlanma, hafif yürüyüş ve esneme',
    tips: [
      'Günü 6.000–10.000 adım hafif yürüyüş ile değerlendir.',
      'Su ve protein hedefini aksatmadan kas onarımını destekle.',
      'Hafif esneme ve foam roller yapabilirsin.'
    ]
  },
  sunday: {
    day: 6,
    name: 'Pazar · Tam Dinlenme',
    focus: 'Merkezi sinir sistemi ve kas toparlanması',
    tips: [
      '7–9 saat kaliteli uyku ile haftaya yenilenmiş başla.',
      'Yeni haftanın öğünlerini ve hedeflerini gözden geçir.',
      'Ağır fiziksel efordan kaçın, dinlenmenin tadını çıkar.'
    ]
  }
});

/**
 * AI tarafından kullanıcıya özel üretilen program (settings -> 'customProgram').
 * Biçim: { name, summary, createdAt, days: [{ dayIndex, rest, name, focus, moves?, tips? }] }
 * @returns {object|null}
 */
export function getCustomProgram() {
  try {
    const program = getSetting('customProgram');
    if (program && Array.isArray(program.days) && program.days.length) return program;
  } catch {}
  return null;
}

/**
 * Bir program gününü uygulamanın plan biçimine dönüştürür.
 */
function normalizeCustomDay(day) {
  if (!day) return null;
  if (day.rest || !Array.isArray(day.moves) || !day.moves.length) {
    return {
      day: day.dayIndex,
      rest: true,
      name: day.name || 'Dinlenme',
      focus: day.focus || 'Toparlanma',
      tips: Array.isArray(day.tips) && day.tips.length ? day.tips : ['Hafif yürüyüş ve esneme ile toparlan.']
    };
  }
  return {
    day: day.dayIndex,
    name: day.name,
    focus: day.focus || '',
    custom: true,
    moves: day.moves.map((m) => ({
      name: m.name,
      muscle: m.muscle || 'Kas',
      sets: m.sets || `${m.defaultSets || 3} × 10-12`,
      defaultSets: Number(m.defaultSets) || 3,
      restSeconds: Number(m.restSeconds) || 75,
      suggestedKg: m.suggestedKg ?? '',
      tip: m.tip || '',
      alternatives: Array.isArray(m.alternatives) ? m.alternatives : []
    }))
  };
}

/**
 * AI programındaki antrenman günlerini (dinlenme hariç) döndürür.
 */
export function getCustomTrainingDays() {
  const program = getCustomProgram();
  if (!program) return [];
  return program.days
    .map(normalizeCustomDay)
    .filter((d) => d && !d.rest)
    .sort((a, b) => a.day - b.day);
}

/**
 * Helper to get workout plan by training mode and day index.
 * Kullanıcının AI programı varsa öncelik onundur.
 */
export function getWorkoutForDay(trainingMode = 'home', dayIndex = 0) {
  const program = getCustomProgram();
  if (program) {
    const custom = program.days.find((d) => Number(d.dayIndex) === Number(dayIndex));
    return normalizeCustomDay(custom) || { day: dayIndex, rest: true, name: 'Dinlenme', focus: 'Toparlanma', tips: [] };
  }

  if (dayIndex === 5) return restDayInfo.saturday;
  if (dayIndex === 6) return restDayInfo.sunday;

  const plans = trainingMode === 'gym' ? gymPlans : homePlans;
  return plans[dayIndex] || null;
}
