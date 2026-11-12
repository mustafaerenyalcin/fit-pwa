/**
 * Zero-Waste AI Architecture: Quota, Semantic Cache & Pro Membership Engine
 * Eliminates redundant LLM calls and manages Free vs Pro usage tiers.
 */

const STORAGE_MEMBERSHIP_KEY = 'fit-ai-membership-v1';
const STORAGE_QUOTA_KEY = 'fit-ai-daily-quota-v1';
const STORAGE_CACHE_KEY = 'fit-ai-semantic-cache-v1';

export const FREE_DAILY_CREDITS = 3;
export const MAX_CACHE_ENTRIES = 80;

const getTodayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Membership status
 */
export function getAiMembership() {
  if (typeof window === 'undefined') return { isPro: false, plan: 'free' };
  try {
    const raw = localStorage.getItem(STORAGE_MEMBERSHIP_KEY);
    if (!raw) return { isPro: false, plan: 'free' };
    const parsed = JSON.parse(raw);
    if (parsed.isPro) {
      // Check expiration if set
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        cancelPro();
        return { isPro: false, plan: 'free' };
      }
      return parsed;
    }
  } catch {}
  return { isPro: false, plan: 'free' };
}

/**
 * Upgrade to Atelier Black (Pro)
 */
export function upgradeToPro(plan = 'yearly') {
  if (typeof window === 'undefined') return;
  const expiresAt = Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000;
  const data = {
    isPro: true,
    plan,
    startedAt: Date.now(),
    expiresAt
  };
  localStorage.setItem(STORAGE_MEMBERSHIP_KEY, JSON.stringify(data));
  notifyChange();
}

/**
 * Cancel or revert to Core Free tier (useful for testing)
 */
export function cancelPro() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_MEMBERSHIP_KEY);
  notifyChange();
}

/**
 * Daily Quota status
 */
export function getAiQuota() {
  const membership = getAiMembership();
  if (membership.isPro) {
    return {
      isPro: true,
      plan: membership.plan,
      remaining: Infinity,
      max: Infinity,
      usedToday: 0
    };
  }

  const today = getTodayIso();
  let used = 0;

  try {
    const raw = localStorage.getItem(STORAGE_QUOTA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        used = Number(parsed.used) || 0;
      }
    }
  } catch {}

  const remaining = Math.max(0, FREE_DAILY_CREDITS - used);
  return {
    isPro: false,
    plan: 'free',
    remaining,
    max: FREE_DAILY_CREDITS,
    usedToday: used,
    date: today
  };
}

/**
 * Consume 1 AI credit.
 * Returns true if allowed, false if quota is depleted.
 */
export function consumeAiCredit() {
  const membership = getAiMembership();
  if (membership.isPro) {
    return true;
  }

  const quota = getAiQuota();
  if (quota.remaining <= 0) {
    return false;
  }

  const nextUsed = quota.usedToday + 1;
  try {
    localStorage.setItem(
      STORAGE_QUOTA_KEY,
      JSON.stringify({
        date: quota.date,
        used: nextUsed
      })
    );
  } catch {}

  notifyChange();
  return true;
}

/**
 * Local Semantic Cache to avoid redundant API calls
 */
export function getAiCache(key) {
  if (!key) return null;
  const normKey = String(key).toLowerCase().trim().slice(0, 140);
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const hit = cache[normKey];
    if (hit && Date.now() - hit.timestamp < 30 * 24 * 60 * 60 * 1000) {
      return hit.data;
    }
  } catch {}
  return null;
}

export function setAiCache(key, data) {
  if (!key || !data) return;
  const normKey = String(key).toLowerCase().trim().slice(0, 140);
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    
    // Evict oldest if exceeding limit
    const keys = Object.keys(cache);
    if (keys.length >= MAX_CACHE_ENTRIES) {
      delete cache[keys[0]];
    }

    cache[normKey] = {
      timestamp: Date.now(),
      data
    };
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fit-ai-quota-changed'));
  }
}
