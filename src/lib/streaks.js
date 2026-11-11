/**
 * Fit Seri (Streak), XP, Seviye ve Başarı Rozetleri Motoru
 * Kullanıcıyı her gün uygulamaya geri getiren oyunlaştırma katmanı.
 */

import { today } from './calculations.js';
import { calculateWorkoutVolume } from './exerciseStats.js';

const shiftIso = (iso, delta) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Kullanıcının aktif günlerini (antrenman, öğün, check-in veya alışkanlık kaydı olan günler) bulur
 * ve güncel + en uzun seriyi (streak) hesaplar.
 */
export function calculateStreak(entries = {}) {
  const activeDays = new Set();
  for (const cat of ['workout', 'meal', 'checkin', 'habit', 'weight']) {
    for (const item of entries[cat] || []) {
      if (item?.day) activeDays.add(item.day);
    }
  }

  const t = today();
  const yesterday = shiftIso(t, -1);
  const loggedToday = activeDays.has(t);

  // Güncel seri: bugün kayıt varsa bugünden, yoksa dünden geriye doğru say
  let current = 0;
  let cursor = loggedToday ? t : activeDays.has(yesterday) ? yesterday : null;
  while (cursor && activeDays.has(cursor)) {
    current++;
    cursor = shiftIso(cursor, -1);
  }

  // En iyi seri
  const sorted = Array.from(activeDays).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of sorted) {
    if (prev && shiftIso(prev, 1) === d) {
      run++;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = d;
  }

  // Son 7 günün seri durumu (Pzt..Paz yerine son 7 gün)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = shiftIso(t, -(6 - i));
    return {
      day: d,
      label: new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'narrow' }),
      active: activeDays.has(d),
      isToday: d === t
    };
  });

  return { current, best: Math.max(best, current), loggedToday, totalActiveDays: activeDays.size, last7 };
}

/**
 * XP, Seviye ve Rozetleri hesaplar.
 */
export function calculateGamification(entries = {}, target = {}) {
  const streak = calculateStreak(entries);
  const workouts = entries.workout || [];
  const meals = entries.meal || [];
  const checkins = entries.checkin || [];

  const totalVolume = workouts.reduce(
    (sum, w) => sum + calculateWorkoutVolume(w.payload?.sets || {}),
    0
  );

  // Günlük protein hedefini tutturan gün sayısı
  const proteinByDay = {};
  for (const m of meals) {
    proteinByDay[m.day] = (proteinByDay[m.day] || 0) + Number(m.payload?.protein || 0);
  }
  const proteinHitDays = Object.values(proteinByDay).filter((p) => p >= (target.protein || 120) * 0.9).length;

  // XP hesabı
  const xp =
    workouts.length * 120 +
    checkins.length * 40 +
    proteinHitDays * 60 +
    streak.totalActiveDays * 25 +
    Math.floor(totalVolume / 500) * 15;

  const level = Math.floor(xp / 500) + 1;
  const currentLevelXp = xp % 500;
  const nextLevelXp = 500;

  const titles = [
    'Çaylak Sporcu',
    'Disiplinli Başlangıç',
    'Ev Savaşçısı',
    'Form Ustası',
    'Hipertrofi Makinesi',
    'Demir İrade',
    'Atletik Elit',
    'Fit Efsanesi'
  ];
  const title = titles[Math.min(titles.length - 1, level - 1)];

  const badges = [
    {
      id: 'first_workout',
      icon: '💪',
      name: 'İlk Adım',
      desc: 'İlk antrenmanını tamamladın',
      unlocked: workouts.length >= 1
    },
    {
      id: 'streak_3',
      icon: '🔥',
      name: '3 Gün Ateşi',
      desc: '3 gün üst üste aktif kaldın',
      unlocked: streak.best >= 3
    },
    {
      id: 'streak_7',
      icon: '⚡',
      name: 'Tam Hafta',
      desc: '7 günlük kesintisiz seri yaptın',
      unlocked: streak.best >= 7
    },
    {
      id: 'protein_5',
      icon: '🥩',
      name: 'Protein Ustası',
      desc: '5 gün protein hedefine ulaştın',
      unlocked: proteinHitDays >= 5
    },
    {
      id: 'checkin_5',
      icon: '🧠',
      name: 'Bilinçli Sporcu',
      desc: '5 kez sabah AI check-in yaptın',
      unlocked: checkins.length >= 5
    },
    {
      id: 'volume_10k',
      icon: '🏆',
      name: '10 Ton Kulübü',
      desc: 'Toplam 10.000 kg ağırlık kaldırdın',
      unlocked: totalVolume >= 10000
    }
  ];

  return {
    streak,
    xp,
    level,
    title,
    currentLevelXp,
    nextLevelXp,
    totalVolume,
    proteinHitDays,
    badges
  };
}
