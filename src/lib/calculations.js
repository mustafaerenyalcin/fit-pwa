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

/**
 * Olimpik bar (varsayılan 20 kg) için hedef kiloya göre tek tarafa takılacak plaka dağılımını hesaplar.
 * @param {number} targetKg
 * @param {number} [barKg=20]
 * @param {number[]} [availablePlates]
 * @returns {{ barKg: number, targetKg: number, loadedTotalKg: number, remainderKg: number, perSide: Array<{ weight: number, count: number }> }}
 */
export function calculatePlateLoadout(
  targetKg,
  barKg = 20,
  availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25]
) {
  const total = Number(targetKg) || 0;
  const bar = Math.max(0, Number(barKg) || 0);
  if (total <= bar) {
    return { barKg: bar, targetKg: total, loadedTotalKg: total > 0 ? bar : 0, remainderKg: 0, perSide: [] };
  }

  let perSideRemaining = Math.round(((total - bar) / 2) * 100) / 100;
  const perSide = [];
  const sorted = [...availablePlates].sort((a, b) => b - a);

  for (const plate of sorted) {
    if (plate <= 0 || perSideRemaining + 1e-6 < plate) continue;
    const count = Math.floor((perSideRemaining + 1e-6) / plate);
    if (count > 0) {
      perSide.push({ weight: plate, count });
      perSideRemaining = Math.round((perSideRemaining - count * plate) * 100) / 100;
    }
  }

  const perSideLoaded = perSide.reduce((sum, p) => sum + p.weight * p.count, 0);
  const loadedTotalKg = Math.round((bar + perSideLoaded * 2) * 100) / 100;
  const remainderKg = Math.round(Math.max(0, total - loadedTotalKg) * 100) / 100;

  return { barKg: bar, targetKg: total, loadedTotalKg, remainderKg, perSide };
}

const KG_TO_LBS = 2.20462262;
const CM_TO_IN = 0.39370079;

/**
 * Kilogram değerini seçili birim sistemine dönüştürür.
 */
export function convertWeight(kg, unitSystem = 'metric') {
  const n = Number(kg) || 0;
  if (unitSystem === 'imperial') {
    return Math.round(n * KG_TO_LBS * 2) / 2;
  }
  return Math.round(n * 10) / 10;
}

/**
 * Ekrandaki ağırlık değerini saklama birimi olan kilograma çevirir.
 */
export function toMetricWeight(displayVal, unitSystem = 'metric') {
  const n = Number(displayVal) || 0;
  if (unitSystem === 'imperial') {
    return Math.round((n / KG_TO_LBS) * 10) / 10;
  }
  return Math.round(n * 10) / 10;
}

export function weightUnitLabel(unitSystem = 'metric') {
  return unitSystem === 'imperial' ? 'lbs' : 'kg';
}

export function convertLength(cm, unitSystem = 'metric') {
  const n = Number(cm) || 0;
  if (unitSystem === 'imperial') {
    return Math.round(n * CM_TO_IN * 10) / 10;
  }
  return Math.round(n * 10) / 10;
}

export function lengthUnitLabel(unitSystem = 'metric') {
  return unitSystem === 'imperial' ? 'in' : 'cm';
}

/**
 * Verilen hareket için tüm geçmiş antrenmanlardan Kişisel Rekor (PR) ve son seans özetini çıkarır.
 * @param {Array} workouts
 * @param {string} exerciseName
 */
export function getExerciseRecord(workouts = [], exerciseName = '') {
  if (!Array.isArray(workouts) || !exerciseName) return null;
  let bestKg = 0;
  let bestReps = 0;
  let best1RM = 0;
  let sessions = 0;
  let lastDay = null;
  let lastKg = 0;
  let lastReps = 0;

  const sorted = [...workouts].sort((a, b) => String(a.day).localeCompare(String(b.day)));
  for (const w of sorted) {
    const data = w?.payload?.sets?.[exerciseName];
    if (!data) continue;
    const kg = Number(data.kg) || 0;
    const reps = Number(data.reps) || 0;
    if (reps <= 0 && kg <= 0) continue;

    sessions += 1;
    lastDay = w.day || lastDay;
    lastKg = kg;
    lastReps = reps;

    const est = kg > 0 && reps > 0 ? calculateOneRepMax(kg, reps) : 0;
    if (est > best1RM || (est === best1RM && kg > bestKg) || (best1RM === 0 && reps > bestReps)) {
      best1RM = est;
      bestKg = kg;
      bestReps = reps;
    }
  }

  if (sessions === 0) return null;
  return { bestKg, bestReps, best1RM, sessions, lastDay, lastKg, lastReps };
}

/**
 * Katch-McArdle formülü (Yağsız vücut kütlesine dayalı BMR hesabı).
 * @param {number} weightKg
 * @param {number} bodyFatPct - % vücut yağ oranı (ör. 15)
 * @returns {number|null}
 */
export function calculateKatchMcArdleBMR(weightKg, bodyFatPct) {
  const w = Number(weightKg);
  const bf = Number(bodyFatPct);
  if (!w || w <= 0 || isNaN(bf) || bf < 3 || bf > 60) return null;
  const leanMass = w * (1 - bf / 100);
  return Math.round(370 + 21.6 * leanMass);
}

/**
 * Antrenman vs Dinlenme günü kalori döngüsü (Kalori & Karbonhidrat Döngüsü).
 */
export function calculateCalorieCycleSplit(targetKcal, proteinGrams, fatGrams, swingKcal = 150) {
  const base = Math.max(1200, Number(targetKcal) || 2200);
  const p = Math.max(0, Number(proteinGrams) || 140);
  const f = Math.max(0, Number(fatGrams) || 60);
  const makeDay = (kcal) => {
    const carbs = Math.max(30, Math.round((kcal - (p * 4 + f * 9)) / 4));
    return { kcal, protein: p, fat: f, carbs };
  };
  return {
    training: makeDay(base + swingKcal),
    rest: makeDay(Math.max(1200, base - swingKcal))
  };
}

/**
 * US Navy Çevre Ölçümü Yöntemi ile Vücut Yağ Oranı (%) tahmini.
 */
export function calculateUsNavyBodyFat({ sex = 'male', heightCm, waistCm, neckCm, hipCm = 0 }) {
  const h = Number(heightCm);
  const waist = Number(waistCm);
  const neck = Number(neckCm);
  const hip = Number(hipCm);
  if (!h || !waist || !neck || h < 120) return null;

  if (sex === 'female') {
    const sum = waist + (hip > 50 ? hip : waist * 1.15) - neck;
    if (sum <= 0) return null;
    const bf = 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.221 * Math.log10(h)) - 450;
    return Math.round(Math.max(6, Math.min(50, bf)) * 10) / 10;
  }

  const diff = waist - neck;
  if (diff <= 0) return null;
  const bf = 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(h)) - 450;
  return Math.round(Math.max(4, Math.min(48, bf)) * 10) / 10;
}

const DOTS_COEFFS = {
  male: [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093],
  female: [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706]
};

const WILKS_COEFFS = {
  male: [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8],
  female: [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8]
};

function evalPoly(coeffs, x) {
  return coeffs.reduce((sum, c, idx) => sum + c * Math.pow(x, idx), 0);
}

/**
 * DOTS Powerlifting Göreceli Kuvvet Puanı.
 */
export function calculateDotsScore(liftedKg, bodyWeightKg, sex = 'male') {
  const total = Number(liftedKg);
  const rawBw = Number(bodyWeightKg);
  if (!total || total <= 0 || !rawBw || rawBw <= 0) return 0;
  const bw = Math.min(210, Math.max(40, rawBw));
  const coeffs = sex === 'female' ? DOTS_COEFFS.female : DOTS_COEFFS.male;
  const denom = evalPoly(coeffs, bw);
  if (!denom || denom <= 0) return 0;
  return Math.round((total * (500 / denom)) * 100) / 100;
}

/**
 * Wilks Powerlifting Göreceli Kuvvet Puanı.
 */
export function calculateWilksScore(liftedKg, bodyWeightKg, sex = 'male') {
  const total = Number(liftedKg);
  const rawBw = Number(bodyWeightKg);
  if (!total || total <= 0 || !rawBw || rawBw <= 0) return 0;
  const bw = Math.min(200, Math.max(40, rawBw));
  const coeffs = sex === 'female' ? WILKS_COEFFS.female : WILKS_COEFFS.male;
  const denom = evalPoly(coeffs, bw);
  if (!denom || denom <= 0) return 0;
  return Math.round((total * (500 / denom)) * 100) / 100;
}
