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
import { resolveExerciseMedia, EXERCISE_MEDIA_DB } from '../exerciseMedia.js';
import { PROGRAMS } from '../../components/LeapWorkoutCatalog.jsx';
import { EXERCISE_LIBRARY } from '../../components/CustomWorkoutBuilder.jsx';
import { homePlans, gymPlans } from '../workoutPlans.js';
import fs from 'node:fs';
import path from 'node:path';

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
    expect(translate('hero.readyPct', { score: 83 })).toBe('%83 Hazır');
    expect(translate('hero.movesMeta', { count: 5 })).not.toContain('{count}');
  });
});

describe('exerciseMedia resolver, CC BY-SA 4.0 vector availability & strict uniqueness', () => {
  it('stores 133+ unique 3-frame SVG sets with legal attribution and zero scraped JPGs on disk', () => {
    const publicDir = path.resolve(process.cwd(), 'public');
    const exercisesDir = path.join(publicDir, 'exercises');
    expect(fs.existsSync(path.join(exercisesDir, 'LICENSE-ASSETS'))).toBe(true);
    expect(fs.existsSync(path.join(exercisesDir, 'ATTRIBUTION.md'))).toBe(true);

    const entries = Object.values(EXERCISE_MEDIA_DB);
    expect(entries.length).toBeGreaterThanOrEqual(133);

    const uniqueSlugs = new Set(entries.map((e) => e.slug));
    expect(uniqueSlugs.size).toBe(entries.length);

    for (const entry of entries) {
      const frame1 = `/exercises/${entry.slug}/1.svg`;
      const frame2 = `/exercises/${entry.slug}/2.svg`;
      const frame3 = `/exercises/${entry.slug}/3.svg`;
      expect(fs.existsSync(path.join(publicDir, frame1))).toBe(true);
      expect(fs.existsSync(path.join(publicDir, frame2))).toBe(true);
      expect(fs.existsSync(path.join(publicDir, frame3))).toBe(true);
      expect(fs.existsSync(path.join(exercisesDir, entry.slug, '0.jpg'))).toBe(false);
      expect(entry.label.length).toBeGreaterThan(2);
      expect(entry.primaryMuscleTr.length).toBeGreaterThan(2);
      expect(entry.step1.length).toBeGreaterThan(8);
      expect(entry.step2.length).toBeGreaterThan(8);
      expect(entry.step3.length).toBeGreaterThan(8);
    }
  });

  it('guarantees zero repeated exercises or shared SVG folders across catalog, homePlans, gymPlans & builder', () => {
    const normalize = (s) => String(s || '').trim().toLowerCase();

    const catalogMoves = PROGRAMS.flatMap((p) => p.moves.map((m) => m.name));
    const homeMoves = homePlans.flatMap((d) => (d.moves || []).map((e) => e.name));
    const gymMoves = gymPlans.flatMap((d) => (d.moves || []).map((e) => e.name));
    const builderMoves = Object.values(EXERCISE_LIBRARY).flat().map((e) => e.name);

    expect(new Set(catalogMoves.map(normalize)).size).toBe(catalogMoves.length);
    expect(new Set(catalogMoves.map((n) => resolveExerciseMedia(n).folder)).size).toBe(catalogMoves.length);

    expect(new Set(homeMoves.map(normalize)).size).toBe(homeMoves.length);
    expect(new Set(homeMoves.map((n) => resolveExerciseMedia(n).folder)).size).toBe(homeMoves.length);

    expect(new Set(gymMoves.map(normalize)).size).toBe(gymMoves.length);
    expect(new Set(gymMoves.map((n) => resolveExerciseMedia(n).folder)).size).toBe(gymMoves.length);

    const allPrebuilt = [...catalogMoves, ...homeMoves, ...gymMoves];
    expect(allPrebuilt.length).toBe(99);
    expect(new Set(allPrebuilt.map(normalize)).size).toBe(allPrebuilt.length);
    expect(new Set(allPrebuilt.map((n) => resolveExerciseMedia(n).folder)).size).toBe(allPrebuilt.length);

    expect(new Set(builderMoves.map(normalize)).size).toBe(builderMoves.length);
    expect(new Set(builderMoves.map((n) => resolveExerciseMedia(n).folder)).size).toBe(builderMoves.length);

    for (const n of [...allPrebuilt, ...builderMoves]) {
      const resolved = resolveExerciseMedia(n);
      expect(resolved.frame1).toMatch(/^\/exercises\/.+\/1\.svg$/);
      expect(resolved.frame2).toMatch(/^\/exercises\/.+\/2\.svg$/);
      expect(resolved.frame3).toMatch(/^\/exercises\/.+\/3\.svg$/);
    }
  });
});
