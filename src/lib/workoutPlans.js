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
    focus: 'Üst göğüs, ön/yan omuz, triceps',
    moves: [
      {
        name: 'Incline Dumbbell Press',
        muscle: 'Üst Göğüs',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: '30° eğimli sehpada dambılları göğüs üst hizasına 45° dirsek açısıyla kontrollü indir ve bas.',
        commonMistakes: 'Dirsekleri 90° dışa açmak, beli sehpada aşırı kavislendirmek.',
        category: 'push',
        alternatives: ['Dumbbell Bench Press', 'Decline Dumbbell Press', 'Dumbbell Fly']
      },
      {
        name: 'Standing Dumbbell Press',
        muscle: 'Ön & Yan Omuz',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Karın ve kalça sıkı, ayakta gövde dik iken dambılları kulak hizasından baş üstüne dikey it.',
        commonMistakes: 'Ağırlığı kaldırırken beli geriye bükmek, dizlerden savurmak.',
        category: 'push',
        alternatives: ['Arnold Press', 'Seated Dumbbell Shoulder Press', 'Front Raise']
      },
      {
        name: 'Lateral Raise',
        muscle: 'Yan Omuz',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Dirsekler hafif kırık, omuzları kulaklara çekmeden kolları yanlara T gibi aç.',
        commonMistakes: 'Gövdeyi sallayarak ivme almak, dambılları omuz seviyesinden aşırı yükseğe savurmak.',
        category: 'push',
        alternatives: ['Cable Lateral Raise', 'Machine Lateral Raise', 'Front Raise']
      },
      {
        name: 'Dumbbell Fly',
        muscle: 'İç & Dış Göğüs',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 75,
        tip: 'Dirsek açısını bozmadan büyük bir ağaca sarılır gibi göğsü esneterek aç ve yukarı topla.',
        commonMistakes: 'Kolları fazla büküp harekete press formu vermek.',
        category: 'push',
        alternatives: ['Cable Fly', 'Pec Deck', 'Incline Dumbbell Press']
      },
      {
        name: 'Dumbbell Overhead Triceps Extension',
        muscle: 'Triceps (Uzun Baş)',
        sets: '3 × 10–15',
        defaultSets: 3,
        defaultReps: '10-15',
        restSeconds: 60,
        tip: 'Üst kolları başın iki yanında sabit tutarak dambılı enseye indir ve yukarı uzat.',
        commonMistakes: 'Dirsekleri yanlara açmak, belden destek almak.',
        category: 'push',
        alternatives: ['Single-Arm Dumbbell Tricep Extension', 'Dumbbell Skull Crusher', 'Triceps Kickback']
      }
    ]
  },
  {
    day: 1,
    name: 'Salı · Pull + Karın',
    focus: 'Sırt, arka omuz, biceps ve core',
    moves: [
      {
        name: 'One-Arm Dumbbell Row',
        muscle: 'Sırt (Kanat & Trapez)',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Sırt düz, bir el sehpada sabit. Dirseği kalça cebine doğru kavisli çekip kanadı sıkıştır.',
        commonMistakes: 'Gövdeyi döndürerek çekmek, ağırlığı omuzla fırlatmak.',
        category: 'pull',
        alternatives: ['Bent-Over Dumbbell Row', 'Chest-Supported Row', 'Barbell Row']
      },
      {
        name: 'Rear Delt Fly',
        muscle: 'Arka Omuz & Üst Sırt',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Kalçadan 45° öne eğil, omurga nötr. Kolları hafif kırık halde yanlara aç.',
        commonMistakes: 'Ağır seçip boyun kaslarını kasmak, sırtı kamburlaştırmak.',
        category: 'pull',
        alternatives: ['Bent-Over Rear Delt Raise', 'Face Pull', 'Band Pull-Apart']
      },
      {
        name: 'Inverted Row',
        muscle: 'Orta Sırt & Postür',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Sabit alçak barın altında vücut baştan topuğa düz hat halindeyken göğsü bara çek.',
        commonMistakes: 'Kalçayı sarkıtmak, dirsekleri yukarı dik açmak.',
        category: 'pull',
        alternatives: ['Doorway Rows', 'Towel Biceps Rows', 'Seated Cable Row']
      },
      {
        name: 'Hammer Curl',
        muscle: 'Biceps & Ön Kol',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 60,
        tip: 'Avuç içleri gövdeye dönük (nötr tutuş) dirsekleri sabitleyip dambılları yukarı bük.',
        commonMistakes: 'Dirsekleri öne arkaya savurmak, belden ivme almak.',
        category: 'pull',
        alternatives: ['Dumbbell Bicep Curl', 'Concentration Curl', 'Preacher Curl']
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
        alternatives: ['Lying Leg Raises', 'Hanging Knee Raise', 'Dead Bug']
      },
      {
        name: 'Dead Bug',
        muscle: 'Derin Core Kasları',
        sets: '2 × 10 / taraf',
        defaultSets: 2,
        defaultReps: '10 / taraf',
        restSeconds: 45,
        tip: 'Bel boşluğunu zemine yapıştır. Çapraz kol ve bacağı kontrollü uzat ve topla.',
        commonMistakes: 'Hareketi yaparken belin yerden havalanması, acele etmek.',
        category: 'core',
        alternatives: ['Bird Dog', 'Hollow Body Hold', 'Ab Wheel Rollout']
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
        commonMistakes: 'Topukların yerden kalkması, gövdenin öne devrilmesi.',
        category: 'legs',
        alternatives: ['Dumbbell Sumo Squat', 'Bulgarian Split Squat', 'Barbell Squat']
      },
      {
        name: 'Dumbbell Romanian Deadlift',
        muscle: 'Arka Bacak & Kalça',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Dizler hafif yumuşak, kalçayı geriye it. Dambıllar kaval kemiğine yakın insin.',
        commonMistakes: 'Sırtı yuvarlamak, dizleri squat gibi çok bükmek.',
        category: 'legs',
        alternatives: ['Single-Leg Romanian Deadlift', 'Barbell Romanian Deadlift', 'Good Morning']
      },
      {
        name: 'Reverse Lunge',
        muscle: 'Tüm Bacak & Denge',
        sets: '3 × 8–10 / bacak',
        defaultSets: 3,
        defaultReps: '8-10 / bacak',
        restSeconds: 75,
        tip: 'Geriye geniş bir adım at, ön diz 90° olacak şekilde dik alçal.',
        commonMistakes: 'Ön dizin içe kaçması, arka dizi yere sert çarpmak.',
        category: 'legs',
        alternatives: ['Walking Lunge', 'Step-Up', 'Split Squat']
      },
      {
        name: 'Dumbbell Glute Bridge',
        muscle: 'Kalça',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Dambılı kasık hizasına sabitle, topuklardan güç alarak kalçayı tepe noktada sık.',
        commonMistakes: 'Hareketi belden yapmak, tepede sıkıştırmamak.',
        category: 'legs',
        alternatives: ['Dumbbell Hip Thrust', 'Hip Thrust', 'Single-Leg Romanian Deadlift']
      },
      {
        name: 'Single-Leg Calf Raise',
        muscle: 'Baldır (Kalf)',
        sets: '3 × 15–20',
        defaultSets: 3,
        defaultReps: '15-20',
        restSeconds: 45,
        tip: 'Tek ayakla yükselip tepede 1 sn sık, basamak altına kontrollü esnet.',
        commonMistakes: 'Hızlıca yaylanmak, tam hareket aralığını kesmek.',
        category: 'legs',
        alternatives: ['Standing Calf Raise', 'Calf Raises']
      }
    ]
  },
  {
    day: 3,
    name: 'Perşembe · Üst Vücut + Omuz',
    focus: 'Düz göğüs, orta sırt, 3D omuz ve kol izolasyonu',
    moves: [
      {
        name: 'Dumbbell Bench Press',
        muscle: 'Orta Göğüs',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Düz sehpada sabit omuz kürekleriyle dambılları göğüs orta yanına indirip dikey it.',
        commonMistakes: 'Dambılları yukarıda birbirine çarpmak, kontrolsüz hızlı indirmek.',
        category: 'push',
        alternatives: ['Incline Dumbbell Press', 'Decline Dumbbell Press', 'Dumbbell Fly']
      },
      {
        name: 'Bent-Over Dumbbell Row',
        muscle: 'Orta & Kalın Sırt',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: '45° öne eğik bel düzken iki dambılı bel hizasına çekip sırt ortasını sık.',
        commonMistakes: 'Beli yuvarlamak, ağırlığı zıplatarak çekmek.',
        category: 'pull',
        alternatives: ['One-Arm Dumbbell Row', 'Chest-Supported Row', 'Barbell Row']
      },
      {
        name: 'Arnold Press',
        muscle: 'Tüm Omuz (3 Baş)',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Avuçlar çene önünde sana dönük başla, yukarı iterken 180° dışa çevir.',
        commonMistakes: 'Beli aşırı kavislendirmek, kolları kilitlemek.',
        category: 'push',
        alternatives: ['Standing Dumbbell Press', 'Seated Dumbbell Shoulder Press', 'Front Raise']
      },
      {
        name: 'Bent-Over Rear Delt Raise',
        muscle: 'Arka Omuz',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Gövde öne paralel eğik, dirsekler hafif kırık. Yalnızca arka omuzla yanlara kaldır.',
        commonMistakes: 'Trapeze yük bindirip omuz silkmek.',
        category: 'pull',
        alternatives: ['Rear Delt Fly', 'Face Pull', 'Band Pull-Apart']
      },
      {
        name: 'Concentration Curl',
        muscle: 'Biceps (Zirve İzolasyon)',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 60,
        tip: 'Otururken dirseği uyluğun iç kısmına yaslayıp savurma olmadan biceps tepe noktasını sık.',
        commonMistakes: 'Omuzu öne eğip dirseği dizden kaldırmak.',
        category: 'pull',
        alternatives: ['Dumbbell Bicep Curl', 'Hammer Curl', 'Preacher Curl']
      },
      {
        name: 'Triceps Kickback',
        muscle: 'Triceps',
        sets: '3 × 10–15',
        defaultSets: 3,
        defaultReps: '10-15',
        restSeconds: 60,
        tip: 'Üst kol gövdeye paralel sabit, sadece ön kolu geriye tam düz olana dek it.',
        commonMistakes: 'Üst kolu sallamak, dirseği aşağı düşürmek.',
        category: 'push',
        alternatives: ['Dumbbell Overhead Triceps Extension', 'Dumbbell Skull Crusher', 'Rope Triceps Pushdown']
      }
    ]
  },
  {
    day: 4,
    name: 'Cuma · Full Body + Core',
    focus: 'Hafif tüm vücut, denge, postür ve oblik',
    moves: [
      {
        name: 'Dumbbell Sumo Squat',
        muscle: 'İç Bacak & Kalça',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Ayaklar geniş 45° dışa açık, gövde dik şekilde ortadaki dambılla derine çök.',
        commonMistakes: 'Dizlerin içe kapanması, öne aşırı eğilmek.',
        category: 'legs',
        alternatives: ['Goblet Squat', 'Reverse Lunge', 'Step-Up']
      },
      {
        name: 'Single-Leg Romanian Deadlift',
        muscle: 'Tek Bacak Arka Zincir',
        sets: '3 × 8–10 / bacak',
        defaultSets: 3,
        defaultReps: '8-10 / bacak',
        restSeconds: 75,
        tip: 'Kalçayı yere paralel sabit tutarak serbest bacağı arkaya düz uzat ve dengeli eğil.',
        commonMistakes: 'Kalçayı yan açmak, beli yuvarlamak.',
        category: 'legs',
        alternatives: ['Dumbbell Romanian Deadlift', 'Dumbbell Glute Bridge']
      },
      {
        name: 'Seated Dumbbell Shoulder Press',
        muscle: 'Omuz Stabilitesi',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 75,
        tip: 'Sehpada sırt dayalı ve karın sıkı, kontrollü yukarı pres yap.',
        commonMistakes: 'Beli sehpadan koparıp kavislendirmek.',
        category: 'push',
        alternatives: ['Arnold Press', 'Standing Dumbbell Press', 'Machine Shoulder Press']
      },
      {
        name: 'Band Pull-Apart',
        muscle: 'Üst Sırt & Postür',
        sets: '3 × 15',
        defaultSets: 3,
        defaultReps: '15',
        restSeconds: 60,
        tip: 'Direnç bandını omuz hizasında düz kollarla göğse doğru açıp kürekleri sıkıştır.',
        commonMistakes: 'Omuzları kulaklara doğru kaldırmak.',
        category: 'pull',
        alternatives: ['Face Pull', 'Rear Delt Fly', 'Inverted Row']
      },
      {
        name: 'Ab Wheel Rollout',
        muscle: 'Tüm Ön Core',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 60,
        tip: 'Karın içeri çekili (hollow) kalçayla birlikte öne uzan, bel çökmeden merkeze çek.',
        commonMistakes: 'Alt beli çökertip kalçayı geride bırakmak.',
        category: 'core',
        alternatives: ['Dead Bug', 'Hollow Body Hold', 'Plank']
      },
      {
        name: 'Weighted Russian Twist',
        muscle: 'Oblik & Rotasyon Gücü',
        sets: '3 × 20',
        defaultSets: 3,
        defaultReps: '20',
        restSeconds: 45,
        tip: 'Göğüs önünde dambıl/plakayla gövdeyi 45° eğik tutup sağa sola kontrollü dön.',
        commonMistakes: 'Sadece kolları döndürüp omuzları sabit bırakmak.',
        category: 'core',
        alternatives: ['Russian Twist', 'Side Plank', 'Cable Crunch']
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
    focus: 'Halter squat, bench press, lat pulldown ve overhead press',
    moves: [
      {
        name: 'Barbell Squat',
        muscle: 'Bacak & Kalça',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 120,
        tip: 'Göğüs dik, kalça topuk hizasında derin çöküş, dizler ayak ucu yönünde.',
        commonMistakes: 'Dizlerin içeri çökmesi, topukların kalkması.',
        category: 'legs',
        alternatives: ['Leg Press', 'Goblet Squat', 'Bulgarian Split Squat']
      },
      {
        name: 'Barbell Bench Press',
        muscle: 'Göğüs & Triceps',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Barı göğsün alt kısmına kontrollü indir, kürek kemiklerini sehpaya sabitle.',
        commonMistakes: 'Barı göğse çarptırmak, kalçayı sehpadan kaldırmak.',
        category: 'push',
        alternatives: ['Incline Barbell Bench Press', 'Dumbbell Bench Press', 'Machine Chest Press']
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
        alternatives: ['Wide-Grip Lat Pulldown', 'Pull-Up', 'Close-Grip Lat Pulldown']
      },
      {
        name: 'Barbell Overhead Press',
        muscle: 'Omuz & Üst Gövde',
        sets: '3 × 6–10',
        defaultSets: 3,
        defaultReps: '6-10',
        restSeconds: 90,
        tip: 'Karın ve kalça kilitli, barı yüz önünden dikey baş üstüne bas.',
        commonMistakes: 'Beli aşırı boşluğa düşürmek.',
        category: 'push',
        alternatives: ['Machine Shoulder Press', 'Standing Dumbbell Press', 'Arnold Press']
      },
      {
        name: 'Cable Lateral Raise',
        muscle: 'Yan Omuz (Sürekli Gerilim)',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Alt makarada kolu yan yukarı sabit gerilimle omuz hizasına kaldır.',
        commonMistakes: 'Omuzları kulaklara doğru silkmek.',
        category: 'push',
        alternatives: ['Machine Lateral Raise', 'Lateral Raise']
      },
      {
        name: 'Hanging Knee Raise',
        muscle: 'Alt Karın',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Barda sallanmadan asıl, pelvisi öne kıvırarak dizleri göğse kaldır.',
        commonMistakes: 'Bacakları sallayarak ivme almak.',
        category: 'core',
        alternatives: ['Hanging Leg Raise', 'Cable Crunch', 'Reverse Crunch']
      }
    ]
  },
  {
    day: 2,
    name: 'Gün B · Tüm Vücut',
    focus: 'Arka zincir, kablo sırt çekişi, incline pres ve core',
    moves: [
      {
        name: 'Barbell Romanian Deadlift',
        muscle: 'Hamstring & Kalça',
        sets: '3 × 8–10',
        defaultSets: 3,
        defaultReps: '8-10',
        restSeconds: 120,
        tip: 'Kalçayı geriye doğru uzat, omurga nötr kalsın ve barı kaval boyunca indir.',
        commonMistakes: 'Sırtı yuvarlamak.',
        category: 'legs',
        alternatives: ['Dumbbell Romanian Deadlift', 'Good Morning', 'Conventional Deadlift']
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
        alternatives: ['Chest-Supported Row', 'Barbell Row', 'One-Arm Dumbbell Row']
      },
      {
        name: 'Incline Barbell Bench Press',
        muscle: 'Üst Göğüs & Ön Omuz',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: '30° eğimli sehpada barı üst göğse kontrollü indirip dikey bas.',
        commonMistakes: 'Açıyı çok dik tutup tamamen omuz presine çevirmek.',
        category: 'push',
        alternatives: ['Incline Dumbbell Press', 'Machine Chest Press']
      },
      {
        name: 'Split Squat',
        muscle: 'Tek Bacak & Kalça',
        sets: '3 × 8–10 / bacak',
        defaultSets: 3,
        defaultReps: '8-10 / bacak',
        restSeconds: 75,
        tip: 'İki ayak sabit açıkken arka diz yere yaklaşana dek dik alçal.',
        commonMistakes: 'Ön topuğu kaldırmak, yanlara sendelemek.',
        category: 'legs',
        alternatives: ['Bulgarian Split Squat', 'Reverse Lunge', 'Leg Press']
      },
      {
        name: 'Face Pull',
        muscle: 'Arka Omuz & Postür',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Halatı alına/kulak yanına çek, dirsekleri yüksek ve açık tut.',
        commonMistakes: 'Ağır takıp yalnızca kollarla çekmek.',
        category: 'pull',
        alternatives: ['Rear Delt Fly', 'Band Pull-Apart']
      },
      {
        name: 'Cable Pallof Press',
        muscle: 'Core Anti-Rotasyon',
        sets: '3 × 10 / taraf',
        defaultSets: 3,
        defaultReps: '10 / taraf',
        restSeconds: 45,
        tip: 'Kablo çekişine rağmen gövdeyi çevirmeden kolları öne uzatıp bekle.',
        commonMistakes: 'Omuzları kablo yönüne döndürmek.',
        category: 'core',
        alternatives: ['Ab Wheel Rollout', 'Plank', 'Cable Crunch']
      }
    ]
  },
  {
    day: 4,
    name: 'Gün C · Tüm Vücut',
    focus: 'Makine hipertrofi, geniş kanat, izole kollar ve karın',
    moves: [
      {
        name: 'Leg Press',
        muscle: 'Ön Bacak & Kalça',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 90,
        tip: 'Ayaklar omuz genişliğinde platformda, bel koltuktan kalkmadan derin iniş.',
        commonMistakes: 'Dizleri üstte tamamen kitleyip geri basmak.',
        category: 'legs',
        alternatives: ['Barbell Squat', 'Goblet Squat', 'Split Squat']
      },
      {
        name: 'Machine Chest Press',
        muscle: 'Göğüs',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Koltuk ayarını orta göğüs hizasında kurup stabil ve kontrollü itiş yap.',
        commonMistakes: 'Dirsekleri omuzdan fazla açıp omuzu öne yuvarlamak.',
        category: 'push',
        alternatives: ['Barbell Bench Press', 'Dumbbell Bench Press', 'Cable Fly']
      },
      {
        name: 'Wide-Grip Lat Pulldown',
        muscle: 'Geniş Kanat (V-Taper)',
        sets: '3 × 8–12',
        defaultSets: 3,
        defaultReps: '8-12',
        restSeconds: 90,
        tip: 'Omuzlardan geniş tutuşta dirsekleri yan-aşağı çekerek sırtı tam esnet.',
        commonMistakes: 'Yarım tekrar yapmak veya belden savrulmak.',
        category: 'pull',
        alternatives: ['Pull-Up', 'Lat Pulldown', 'Close-Grip Lat Pulldown']
      },
      {
        name: 'Machine Lateral Raise',
        muscle: 'Yan Omuz İzolasyon',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 60,
        tip: 'Pedleri dirsekle iterek yan omuz başlarını tepe noktada 1 sn sık.',
        commonMistakes: 'Gövdeyle yukarı zıplamak.',
        category: 'push',
        alternatives: ['Cable Lateral Raise', 'Lateral Raise']
      },
      {
        name: 'Cable Biceps Curl',
        muscle: 'Biceps (Sabit Tansiyon)',
        sets: '3 × 10–12',
        defaultSets: 3,
        defaultReps: '10-12',
        restSeconds: 60,
        tip: 'Dirsekler gövde yanında kilitli iken alt makara barını omzlara bük.',
        commonMistakes: 'Omuzları öne dahil etmek.',
        category: 'pull',
        alternatives: ['Preacher Curl', 'Hammer Curl', 'Dumbbell Bicep Curl']
      },
      {
        name: 'Rope Triceps Pushdown',
        muscle: 'Triceps',
        sets: '3 × 10–15',
        defaultSets: 3,
        defaultReps: '10-15',
        restSeconds: 60,
        tip: 'En alt noktada halat uçlarını yanlara açarak arka kolu sertçe sık.',
        commonMistakes: 'Dirsekleri öne arkaya gezdirmek.',
        category: 'push',
        alternatives: ['Triceps Pushdown', 'Overhead Tricep Extension', 'Close-Grip Bench Press']
      },
      {
        name: 'Cable Crunch',
        muscle: 'Üst & Tüm Karın',
        sets: '3 × 12–15',
        defaultSets: 3,
        defaultReps: '12-15',
        restSeconds: 45,
        tip: 'Kalçayı sabit tutarak omurgayı aşağı doğru kıvırıp karnı tam sıkıştır.',
        commonMistakes: 'Kalçadan oturup kalkarak ağırlığı sırtla çekmek.',
        category: 'core',
        alternatives: ['Weighted Crunch', 'Hanging Knee Raise', 'Ab Wheel Rollout']
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
