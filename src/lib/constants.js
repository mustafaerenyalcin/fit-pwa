/**
 * Fit PWA Application Constants
 * Default profiles, navigation configuration, food examples, supplements, and Turkish day names.
 */

/**
 * Default user profile settings
 */
export const DEFAULT_PROFILE = Object.freeze({
  name: '',
  height: 180,
  weight: 77,
  age: '',
  sex: '',
  activity: 'medium',
  training: 'home',
  experience: 'returning',
  goal: 'recomp',
  focus: 'shoulders-abs',
  sleep: 8,
  water: 2500,
  steps: 8000
});

/**
 * Navigation menu configuration items
 * [id, label, icon_name]
 */
export const NAV_ITEMS = Object.freeze([
  ['dashboard', 'Genel Bakış', 'LayoutDashboard'],
  ['calendar', 'Haftalık Plan', 'CalendarDays'],
  ['training', 'Antrenman', 'Dumbbell'],
  ['nutrition', 'Beslenme', 'Utensils'],
  ['progress', 'Gelişim', 'ChartNoAxesCombined'],
  ['habits', 'Sağlıklı Yaşam', 'HeartPulse'],
  ['profile', 'Profil ve Hedefler', 'Settings2'],
  ['coach', 'Fit AI Koç', 'Bot'],
  ['sync', 'Senkronizasyon', 'KeyRound']
]);

/**
 * Turkish protein food source examples for nutrition guidance
 */
export const FOOD_EXAMPLES = Object.freeze([
  ['3 yumurta', 'yaklaşık 19 g protein'],
  ['150 g pişmiş tavuk göğsü', 'yaklaşık 45 g protein'],
  ['200 g yoğurt / süzme yoğurt', 'yaklaşık 8–18 g protein'],
  ['1 kase mercimek çorbası/yemeği', 'yaklaşık 12–18 g protein'],
  ['150 g pişmiş balık (somon/levrek)', 'yaklaşık 30–35 g protein'],
  ['100 g lor peyniri', 'yaklaşık 16–19 g protein'],
  ['150 g yağsız dana kıyma/biftek', 'yaklaşık 38–42 g protein']
]);

/**
 * Common fitness supplements list
 */
export const SUPPLEMENT_LIST = Object.freeze([
  'Kreatin',
  'Protein tozu',
  'BCAA'
]);

/**
 * Days of the week in Turkish starting from Monday
 */
export const TURKISH_DAYS = Object.freeze([
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar'
]);

/**
 * Short Turkish day names
 */
export const TURKISH_DAYS_SHORT = Object.freeze([
  'Pzt',
  'Sal',
  'Çar',
  'Per',
  'Cum',
  'Cmt',
  'Paz'
]);

/**
 * Activity levels with Turkish labels and multipliers
 */
export const ACTIVITY_LEVELS = Object.freeze({
  low: { label: 'Az hareketli (Masa başı, hareketsiz)', multiplier: 1.4 },
  medium: { label: 'Orta hareketli (Haftada 3-5 antrenman veya tempolu gün)', multiplier: 1.6 },
  high: { label: 'Çok hareketli (Ağır egzersiz, fiziksel iş)', multiplier: 1.8 }
});

/**
 * Fitness goals
 */
export const FITNESS_GOALS = Object.freeze({
  recomp: { label: 'Kas + yağ kontrolü (Body Recomposition)', calAdjustment: 0 },
  gain: { label: 'Kas kütlesi artır (Lean Bulk)', calAdjustment: 300 },
  cut: { label: 'Yağ azalt (Cut)', calAdjustment: -400 }
});
