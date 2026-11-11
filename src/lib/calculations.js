/**
 * Fitness Calculations & Date Utility Functions
 * BMR (Mifflin-St Jeor), TDEE, macro distribution, 1RM, BMI, Waist-to-Height Ratio, and date helpers.
 */

import { ACTIVITY_LEVELS, FITNESS_GOALS, TURKISH_DAYS } from './constants.js';

/**
 * Returns today's date formatted as YYYY-MM-DD
 * @returns {string}
 */
export function today() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a given Date instance or date string to YYYY-MM-DD
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return today();
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return today();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns an array of 7 date objects representing Monday to Sunday for the week of the given date
 * @param {string} [dateString] - Reference date in YYYY-MM-DD format (defaults to today)
 * @returns {Array<{ date: string, dayNumber: number, dayName: string, isToday: boolean }>}
 */
export function getWeekDates(dateString) {
  const ref = dateString ? new Date(dateString + 'T12:00:00') : new Date();
  const dayOfWeek = (ref.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  const monday = new Date(ref);
  monday.setDate(ref.getDate() - dayOfWeek);

  const currentToday = today();
  const week = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = formatDate(d);

    week.push({
      date: iso,
      dayNumber: d.getDate(),
      dayName: TURKISH_DAYS[i],
      isToday: iso === currentToday
    });
  }

  return week;
}

/**
 * Calculates primary nutritional and habit targets for a user profile
 * @param {object} profile
 * @returns {{ protein: number, proteinMin: number, proteinMax: number, fat: number, water: number, steps: number }}
 */
export function targets(profile = {}) {
  const weight = Number(profile.weight) || 77;
  const water = Number(profile.water) || 2500;
  const steps = Number(profile.steps) || 8000;

  return {
    protein: Math.round(weight * 1.8),
    proteinMin: Math.round(weight * 1.6),
    proteinMax: Math.round(weight * 2.0),
    fat: Math.round(weight * 0.8),
    water,
    steps
  };
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 */
export function calculateBMR(profile = {}) {
  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const age = Number(profile.age);
  const sex = profile.sex;

  if (!weight || !height || !age || !sex) {
    return null;
  }

  const base = 10 * weight + 6.25 * height - 5 * age;

  if (sex === 'male') {
    return Math.round(base + 5);
  } else if (sex === 'female') {
    return Math.round(base - 161);
  }

  return null;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 */
export function calculateTDEE(profile = {}) {
  const bmr = calculateBMR(profile);
  if (!bmr) return null;

  const activity = profile.activity || 'medium';
  const multiplier = ACTIVITY_LEVELS[activity]?.multiplier || 1.6;

  return Math.round(bmr * multiplier);
}

/**
 * Calculates daily target calories based on user goal (recomp, gain, cut).
 */
export function calculateCalories(profile = {}) {
  const tdee = calculateTDEE(profile);
  if (!tdee) return null;

  const goal = profile.goal || 'recomp';
  const adjustment = FITNESS_GOALS[goal]?.calAdjustment ?? 0;

  return Math.max(1200, Math.round(tdee + adjustment));
}

/**
 * Calculates complete macronutrient targets in grams and percentages
 */
export function calculateMacros(profile = {}, targetCalories = null) {
  const basicTargets = targets(profile);
  const calories = targetCalories || calculateCalories(profile);

  const protein = basicTargets.protein;
  const fat = basicTargets.fat;

  if (!calories) {
    return {
      calories: null,
      protein,
      fat,
      carbs: null
    };
  }

  // Protein = 4 kcal/g, Fat = 9 kcal/g, Carbs = 4 kcal/g
  const proteinKcal = protein * 4;
  const fatKcal = fat * 9;
  const remainingKcal = Math.max(0, calories - (proteinKcal + fatKcal));
  const carbs = Math.round(remainingKcal / 4);

  return {
    calories,
    protein,
    fat,
    carbs
  };
}

/**
 * Brzycki ve Epley formülleri ortalamasıyla 1RM (Tek Tekrar Maksimumu) tahmini
 * @param {number} weight - Kaldırılan kg
 * @param {number} reps - Yapılan tekrar
 * @returns {number} Tahmini 1RM (kg)
 */
export function calculateOneRepMax(weight, reps) {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;

  // Epley: w * (1 + r / 30)
  const epley = w * (1 + r / 30);
  // Brzycki: w / (1.0278 - 0.0278 * r)
  const brzycki = r < 36 ? w / (1.0278 - 0.0278 * r) : epley;

  return Math.round(((epley + brzycki) / 2) * 10) / 10;
}

/**
 * Vücut Kitle İndeksi (BMI) hesabı
 * @param {number} weight - kg
 * @param {number} height - cm
 * @returns {{ bmi: number, label: string }}
 */
export function calculateBMI(weight, height) {
  const w = Number(weight);
  const hM = Number(height) / 100;
  if (!w || !hM) return { bmi: 0, label: 'Bilinmiyor' };

  const bmi = Math.round((w / (hM * hM)) * 10) / 10;
  let label = 'Normal';
  if (bmi < 18.5) label = 'Zayıf';
  else if (bmi < 25) label = 'Normal (İdeal)';
  else if (bmi < 30) label = 'Hafif Kilolu (Kas kütlesi yüksek olabilir)';
  else label = 'Yüksek';

  return { bmi, label };
}

/**
 * Bel / Boy Oranı (Waist-to-Height Ratio - WHtR)
 * Karın kası görünürlüğü ve metabolik sağlık için altın standart (< 0.47 belirgin karın bölgesi)
 * @param {number} waist - cm
 * @param {number} height - cm
 * @returns {{ ratio: number, status: string, score: number }}
 */
export function calculateWaistToHeightRatio(waist, height) {
  const w = Number(waist);
  const h = Number(height);
  if (!w || !h) return null;

  const ratio = Math.round((w / h) * 100) / 100;
  let status = 'İyi';
  let score = 80;

  if (ratio < 0.43) {
    status = 'Oldukça İnce / Definasyon';
    score = 95;
  } else if (ratio <= 0.48) {
    status = 'Atletik / Karın Kasları Belirgin';
    score = 90;
  } else if (ratio <= 0.52) {
    status = 'Dengeli / Sağlıklı Aralık';
    score = 75;
  } else {
    status = 'Dikkat / Yağ Kontrolü Önerilir';
    score = 60;
  }

  return { ratio, status, score };
}
