/**
 * Daily Athletic Readiness & Recovery Engine (Whoop & Athlytic Equivalent)
 * Calculates a comprehensive 0-100 score based on:
 * 1. Sleep Quality & Duration (35%)
 * 2. Nutrition & Protein Synthesis Status (30%)
 * 3. Musculoskeletal Fatigue & Consecutive Training Days (25%)
 * 4. Cellular Hydration (10%)
 */

import { today, formatDate } from './calculations.js';

export function calculateReadiness(entries = { workout: [], meal: [], habit: [] }, profile = {}, target = {}) {
  const currentDay = today();

  // Get yesterday's date
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = formatDate(d);

  // 1. Sleep Factor (Target: 7-8 hours)
  const todayHabit = entries.habit?.find((e) => e.day === currentDay)?.payload || {};
  const yestHabit = entries.habit?.find((e) => e.day === yesterday)?.payload || {};
  const sleepHours = Number(todayHabit.sleep || yestHabit.sleep || profile.sleep || 7.5);

  let sleepScore = 75;
  if (sleepHours >= 8) sleepScore = 100;
  else if (sleepHours >= 7) sleepScore = 88;
  else if (sleepHours >= 6) sleepScore = 70;
  else sleepScore = 50;

  // 2. Nutrition & Protein Recovery Factor
  const yestMeals = entries.meal?.filter((e) => e.day === yesterday) || [];
  const yestProtein = yestMeals.reduce((acc, m) => acc + Number(m.payload?.protein || 0), 0);
  const targetProtein = Number(target?.protein || 140);

  let nutritionScore = 80;
  if (yestMeals.length > 0) {
    const proteinRatio = yestProtein / targetProtein;
    if (proteinRatio >= 0.9) nutritionScore = 100;
    else if (proteinRatio >= 0.7) nutritionScore = 80;
    else nutritionScore = 60;
  }

  // 3. Training Fatigue & Central Nervous System (CNS) Load
  // Count consecutive training days up to yesterday
  let consecutiveDays = 0;
  for (let i = 1; i <= 5; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    const iso = formatDate(checkDate);
    const trained = entries.workout?.some((w) => w.day === iso);
    if (trained) consecutiveDays++;
    else break;
  }

  let fatigueScore = 95;
  if (consecutiveDays === 0) fatigueScore = 100; // Well rested
  else if (consecutiveDays === 1) fatigueScore = 90;
  else if (consecutiveDays === 2) fatigueScore = 80;
  else if (consecutiveDays >= 3) fatigueScore = 65; // High accumulated fatigue

  // 4. Hydration Factor
  const water = Number(todayHabit.water || 0);
  const waterTarget = Number(target?.water || 2500);
  const hydrationScore = Math.min(100, Math.round((water / waterTarget) * 100) || 75);

  // Weighted Composite Score
  const rawScore = Math.round(
    sleepScore * 0.35 +
    nutritionScore * 0.30 +
    fatigueScore * 0.25 +
    hydrationScore * 0.10
  );

  const score = Math.max(30, Math.min(99, rawScore));

  let tier = 'OPTIMAL';
  let tierLabel = 'Optimum Antrenman Hazırlığı';
  let color = '#059669';
  let advice = 'Vücudun standart hipertrofi ve hacim antrenmanı için dengeli durumda.';

  if (score >= 85) {
    tier = 'PEAK';
    tierLabel = 'Zirve Atletik Form (PR Günü)';
    color = '#0284c7';
    advice = 'Sinir sistemin ve kas depoların tamamen yenilendi! Bugün ağır ağırlıklar ve yeni PR denemek için harika bir gün.';
  } else if (score < 70) {
    tier = 'RECOVERY';
    tierLabel = 'Aktif Toparlanma / Deload Önerilir';
    color = '#d97706';
    advice = 'Birikmiş kas yorgunluğu veya uyku eksiği tespit edildi. Bugün RPE 7 sınırında kalın veya kardiyo/mobiliteye odaklanın.';
  }

  return {
    score,
    tier,
    tierLabel,
    color,
    advice,
    factors: {
      sleep: { val: `${sleepHours}s`, score: sleepScore, label: 'Uyku Kalitesi' },
      nutrition: { val: `${Math.round(yestProtein)}g`, score: nutritionScore, label: 'Protein Sentezi' },
      fatigue: { val: `${consecutiveDays} Gün`, score: fatigueScore, label: 'Kümülatif Yük' },
      hydration: { val: `${(water / 1000).toFixed(1)}L`, score: hydrationScore, label: 'Hidrasyon' }
    }
  };
}
