/**
 * Fit PWA Local Storage and State Management Store
 * Manages local persistence, reactive subscriptions, records, settings, and backups.
 * 
 * Compatible with 'fit-pwa-local-v1' storage schema.
 */

export const STORE_KEY = 'fit-pwa-local-v1';

/**
 * Valid record categories in the application
 */
export const CATEGORIES = Object.freeze([
  'workout',
  'meal',
  'habit',
  'weight',
  'supplement',
  'checkin',
  'report'
]);

/**
 * Default empty state structure
 */
const DEFAULT_STATE = {
  settings: {},
  records: [],
  deleted: []
};

// In-memory cache and subscriber listeners
let db = null;
const listeners = new Set();

/**
 * Per-user storage
 * Her hesabın verisi ayrı bir localStorage anahtarında tutulur: `fit-pwa-local-v1:<userId>`.
 * Böylece aynı cihazda farklı hesaplar açıldığında veriler birbirine karışmaz.
 *
 * Eski (tek kullanıcılı) sürümden kalan veri `fit-pwa-local-v1` anahtarındadır.
 * Bu cihazda giriş yapan İLK hesap bu veriyi devralır (LEGACY_OWNER_KEY ile işaretlenir);
 * eski veri silinmez, yedek olarak yerinde kalır.
 */
const LEGACY_OWNER_KEY = 'fit-legacy-owner';
let activeKey = null;
let activeUserId = null;

const userKey = (uid) => `${STORE_KEY}:${uid}`;

/**
 * Aktif kullanıcıyı ayarlar ve o kullanıcının yerel verisini yükler.
 * @param {string|null} uid - Supabase kullanıcı ID'si (çıkışta null)
 */
export function setStoreUser(uid) {
  if (uid === activeUserId && db) return;
  activeUserId = uid || null;
  activeKey = uid ? userKey(uid) : null;

  if (uid && typeof window !== 'undefined' && window.localStorage) {
    try {
      const hasOwn = localStorage.getItem(activeKey) !== null;
      const legacy = localStorage.getItem(STORE_KEY);
      const owner = localStorage.getItem(LEGACY_OWNER_KEY);
      if (!hasOwn && legacy && !owner) {
        localStorage.setItem(activeKey, legacy);
        localStorage.setItem(LEGACY_OWNER_KEY, uid);
      }
    } catch (err) {
      console.error('[Fit Store] Legacy migration failed:', err);
    }
  }

  db = read();
  notify();
}

/** @returns {string|null} */
export function getStoreUser() {
  return activeUserId;
}

/**
 * Bu cihazda eski (hesapsız) sürümden kalan veri var mı ve henüz sahiplenilmedi mi?
 */
export function hasUnclaimedLegacyData() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  return !!localStorage.getItem(STORE_KEY) && !localStorage.getItem(LEGACY_OWNER_KEY);
}

/**
 * Generates ISO 8601 timestamp string
 * @returns {string}
 */
const now = () => new Date().toISOString();

/**
 * Safely generates unique identifier
 * @returns {string}
 */
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'fit-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
};

/**
 * Notifies all active subscribers about store changes
 */
const notify = () => {
  for (const listener of listeners) {
    try {
      listener(db);
    } catch (err) {
      console.error('[Fit Store] Listener error:', err);
    }
  }
};

/**
 * Reads data directly from localStorage
 * @returns {{ settings: Record<string, any>, records: Array<any>, deleted: Array<any> }}
 */
export function read() {
  if (typeof window === 'undefined' || !window.localStorage || !activeKey) {
    return { settings: {}, records: [], deleted: [] };
  }

  try {
    const raw = localStorage.getItem(activeKey);
    if (!raw) {
      return { settings: {}, records: [], deleted: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {},
      records: Array.isArray(parsed.records) ? parsed.records : [],
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : []
    };
  } catch (error) {
    console.error('[Fit Store] Error reading from localStorage:', error);
    return { settings: {}, records: [], deleted: [] };
  }
}

/**
 * Initializes and returns current state cache
 * @returns {{ settings: Record<string, any>, records: Array<any>, deleted: Array<any> }}
 */
export function getStore() {
  if (!db) {
    db = read();
  }
  return db;
}

/**
 * Persists current store state to localStorage and alerts listeners
 * @param {object} [customDb] - Optional custom database object to persist
 */
export function persist(customDb) {
  if (customDb) {
    db = customDb;
  }
  if (!db) {
    db = read();
  }

  if (typeof window !== 'undefined' && window.localStorage && activeKey) {
    try {
      localStorage.setItem(activeKey, JSON.stringify(db));
    } catch (error) {
      console.error('[Fit Store] Failed to persist data to localStorage:', error);
      throw new Error('Yerel hafızaya kaydedilemedi. Depolama alanı dolu olabilir.');
    }
  }

  notify();
}

/**
 * Subscribes to store changes
 * @param {(state: typeof DEFAULT_STATE) => void} listener
 * @returns {() => void} Unsubscribe function
 */
export function subscribe(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('Subscriber must be a function');
  }
  listeners.add(listener);

  // Return unsubscribe function
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Retrieves setting value by key
 * @param {string} key
 * @returns {any} Setting value or null if not found
 */
export function getSetting(key) {
  const store = getStore();
  const entry = store.settings[key];
  return entry !== undefined ? entry.value : null;
}

/**
 * Sets a setting value and persists
 * @param {string} key
 * @param {any} value
 */
export function setSetting(key, value) {
  const store = getStore();
  store.settings[key] = {
    value,
    modified: now()
  };
  persist();
}

/**
 * Lists records for a specific category, sorted by day (desc) and created date (desc)
 * @param {string} category - Category name ('workout', 'meal', 'habit', 'weight', 'supplement')
 * @returns {Array<{ id: string, category: string, day: string, payload: any, created: string, modified: string }>}
 */
export function list(category) {
  const store = getStore();
  return store.records
    .filter(record => record.category === category)
    .sort((a, b) => b.day.localeCompare(a.day) || b.created.localeCompare(a.created));
}

/**
 * Adds a new record to the store
 * @param {string} category - Record category
 * @param {string} day - Date string (YYYY-MM-DD)
 * @param {object} payload - Custom data payload
 * @returns {string} Newly created record ID
 */
export function add(category, day, payload) {
  const store = getStore();
  const timestamp = now();
  const id = generateId();

  const record = {
    id,
    category,
    day,
    payload: payload || {},
    created: timestamp,
    modified: timestamp
  };

  store.records.push(record);
  persist();
  return id;
}

/**
 * Removes a record by ID and appends a tombstone to deleted list
 * @param {string} id - Record ID to delete
 * @returns {boolean} True if record was found and deleted
 */
export function remove(id) {
  const store = getStore();
  const initialLength = store.records.length;
  store.records = store.records.filter(record => record.id !== id);

  if (store.records.length !== initialLength) {
    store.deleted.push({
      id,
      modified: now()
    });
    persist();
    return true;
  }
  return false;
}

/**
 * Exports data as a downloadable JSON backup file
 */
export function exportBackup() {
  const store = getStore();
  const timestamp = now();
  const payload = {
    format: 'fit-backup',
    version: 1,
    exported_at: timestamp,
    data: store
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const uri = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = uri;
  a.download = `fit-yedek-${timestamp.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(uri), 30000);
}

/**
 * Validates and imports a JSON backup string into localStorage
 * @param {string} raw - JSON string to import
 * @returns {boolean} True on successful import
 */
export function importBackup(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Geçersiz yedek verisi.');
  }

  if (raw.length > 8_000_000) {
    throw new Error('Yedek dosyası boyutu çok büyük (maks 8MB).');
  }

  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    throw new Error('Geçerli bir JSON dosyası değil.');
  }

  if (
    !obj ||
    obj.format !== 'fit-backup' ||
    obj.version !== 1 ||
    !obj.data ||
    typeof obj.data.settings !== 'object' ||
    obj.data.settings === null ||
    !Array.isArray(obj.data.records) ||
    !Array.isArray(obj.data.deleted)
  ) {
    throw new Error('Fit yedek dosya formatı tanınmadı.');
  }

  if (obj.data.records.length > 20000 || obj.data.deleted.length > 20000) {
    throw new Error('Yedek içerisindeki kayıt sayısı izin verilen sınırı aşıyor.');
  }

  // Validate each record format
  for (const rec of obj.data.records) {
    if (
      !rec ||
      typeof rec.id !== 'string' ||
      typeof rec.day !== 'string' ||
      typeof rec.category !== 'string' ||
      typeof rec.created !== 'string' ||
      typeof rec.payload !== 'object' ||
      rec.payload === null
    ) {
      throw new Error('Yedekte bozuk veya geçersiz kayıt bulundu.');
    }
  }

  db = {
    settings: obj.data.settings,
    records: obj.data.records,
    deleted: obj.data.deleted
  };

  persist();
  return true;
}
