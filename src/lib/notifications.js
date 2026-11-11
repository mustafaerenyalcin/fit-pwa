/**
 * Bildirim & Hatırlatıcı Yöneticisi (Web Notifications API + PWA Service Worker uyumlu)
 * Ayrıca Açık/Koyu tema tercihini yönetir.
 */

const THEME_KEY = 'fit-theme-mode';
const REMINDER_KEY = 'fit-morning-reminder';

export function getTheme() {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function setTheme(mode) {
  const next = mode === 'light' ? 'light' : 'dark';
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
  }
  return next;
}

export function initTheme() {
  const current = getTheme();
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', current);
  }
  return current;
}

export function getReminderConfig() {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    return raw ? JSON.parse(raw) : { enabled: false, time: '09:00' };
  } catch {
    return { enabled: false, time: '09:00' };
  }
}

export async function toggleMorningReminder(enabled, time = '09:00') {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    throw new Error('Tarayıcın veya cihazın bildirimleri desteklemiyor.');
  }

  if (enabled) {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      throw new Error('Bildirim izni verilmedi. Tarayıcı/telefon ayarlarından izin verebilirsin.');
    }
    try {
      new Notification('Fit Koç Bildirimleri Aktif 💪', {
        body: `Her gün ${time} civarında sabah check-in ve su hatırlatması alacaksın.`,
        icon: '/icons/icon-192.png'
      });
    } catch {}
  }

  const cfg = { enabled: !!enabled, time };
  localStorage.setItem(REMINDER_KEY, JSON.stringify(cfg));
  return cfg;
}
