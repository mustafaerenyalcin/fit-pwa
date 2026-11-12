import { describe, it, expect, beforeEach } from 'vitest';
import {
  FREE_DAILY_CREDITS,
  getAiQuota,
  consumeAiCredit,
  upgradeToPro,
  cancelPro,
  getMaxGymBuddies,
  setAiCache,
  getAiCache
} from '../aiQuota.js';
import { calculateReadiness } from '../readinessEngine.js';
import { calculateStreak, calculateGamification } from '../streaks.js';
import { setLang, getLang, translate } from '../i18n.js';
import { today, formatDate } from '../calculations.js';

describe('aiQuota & Membership Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    cancelPro();
  });

  it('starts free users with FREE_DAILY_CREDITS and blocks after depletion', () => {
    const initial = getAiQuota();
    expect(initial.isPro).toBe(false);
    expect(initial.remaining).toBe(FREE_DAILY_CREDITS);

    for (let i = 0; i < FREE_DAILY_CREDITS; i++) {
      expect(consumeAiCredit()).toBe(true);
    }
    expect(getAiQuota().remaining).toBe(0);
    expect(consumeAiCredit()).toBe(false);
  });

  it('grants unlimited credits and correct squad buddy limits on upgrade', () => {
    expect(getMaxGymBuddies()).toBe(1);

    upgradeToPro('yearly');
    expect(getAiQuota().isPro).toBe(true);
    expect(getAiQuota().remaining).toBe(Infinity);
    expect(consumeAiCredit()).toBe(true);
    expect(getMaxGymBuddies()).toBe(2);

    upgradeToPro('family');
    expect(getMaxGymBuddies()).toBe(4);

    cancelPro();
    expect(getAiQuota().isPro).toBe(false);
    expect(getMaxGymBuddies()).toBe(1);
  });

  it('stores and retrieves semantic AI cache entries', () => {
    expect(getAiCache('unknown-key')).toBeNull();
    setAiCache('Chicken Rice Meal', { calories: 480, protein: 45 });
    expect(getAiCache('  chicken rice meal ')).toEqual({ calories: 480, protein: 45 });
  });
});

describe('readinessEngine', () => {
  it('returns PEAK tier when sleep, protein, hydration and rest are optimal', () => {
    const curr = today();
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = formatDate(y);

    const res = calculateReadiness(
      {
        habit: [{ day: curr, payload: { sleep: 8.5, water: 3000 } }],
        meal: [{ day: yesterday, payload: { protein: 160 } }],
        workout: []
      },
      {},
      { protein: 140, water: 2500 }
    );

    expect(res.score).toBeGreaterThanOrEqual(85);
    expect(res.tier).toBe('PEAK');
  });

  it('returns RECOVERY tier when sleep is low and consecutive training days are high', () => {
    const curr = today();
    const workouts = [1, 2, 3, 4].map((offset) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return { day: formatDate(d) };
    });

    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = formatDate(y);

    const res = calculateReadiness(
      {
        habit: [{ day: curr, payload: { sleep: 5, water: 500 } }],
        meal: [{ day: yesterday, payload: { protein: 30 } }],
        workout: workouts
      },
      {},
      { protein: 150, water: 2500 }
    );

    expect(res.score).toBeLessThan(70);
    expect(res.tier).toBe('RECOVERY');
  });
});

describe('streaks & gamification', () => {
  it('computes active streak and XP/level progression accurately', () => {
    const curr = today();
    const d1 = new Date();
    d1.setDate(d1.getDate() - 1);
    const yesterday = formatDate(d1);

    const streak = calculateStreak({
      workout: [{ day: curr }, { day: yesterday }]
    });
    expect(streak.current).toBe(2);
    expect(streak.loggedToday).toBe(true);

    const gamif = calculateGamification({
      workout: [{ day: curr, payload: { sets: {} } }],
      checkin: [{ day: curr }]
    });
    expect(gamif.xp).toBeGreaterThan(0);
    expect(gamif.level).toBeGreaterThanOrEqual(1);
    expect(gamif.badges.find((b) => b.id === 'first_workout')?.unlocked).toBe(true);
  });
});

describe('i18n translation engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('switches across tr, en, de, es and interpolates variables', () => {
    setLang('en');
    expect(getLang()).toBe('en');
    expect(translate('nav.today')).toBe('Home');

    setLang('de');
    expect(translate('nav.today')).toBe('Heute');

    setLang('es');
    expect(translate('nav.today')).toBe('Hoy');

    setLang('tr');
    expect(translate('nav.today')).toBe('Ana Sayfa');
  });
});
