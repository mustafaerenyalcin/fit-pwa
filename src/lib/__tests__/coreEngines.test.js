import { describe, it, expect, beforeEach } from 'vitest';
import {
  FREE_DAILY_CREDITS,
  getAiQuota,
  consumeAiCredit,
  upgradeToPro,
  cancelPro,
  getMaxGymBuddies,
  setAiCache,
  getAiCache,
  setQuotaUserScope,
  getAiMembership
} from '../aiQuota.js';
import {
  FAMILY_MAX_SEATS,
  activateFamilyPlan,
  joinFamilyByCode,
  leaveOrRemoveFamilyMember,
  getFamilyStatus,
  buildFamilyInviteUrl,
  normalizeInviteCode
} from '../familyPlan.js';
import { deleteAccount, continueAsLocalUser, getAuthState } from '../supabase.js';
import { calculateReadiness } from '../readinessEngine.js';
import { calculateStreak, calculateGamification } from '../streaks.js';
import { setLang, getLang, translate } from '../i18n.js';
import {
  today,
  formatDate,
  calculatePlateLoadout,
  convertWeight,
  toMetricWeight,
  weightUnitLabel,
  convertLength,
  lengthUnitLabel,
  getExerciseRecord,
  calculateDotsScore,
  calculateWilksScore,
  calculateKatchMcArdleBMR,
  calculateCalorieCycleSplit,
  calculateUsNavyBodyFat
} from '../calculations.js';
import { resolveExerciseMedia, EXERCISE_MEDIA_DB } from '../exerciseMedia.js';
import { parseSetRepTarget, getSmartExerciseDefaults } from '../exerciseStats.js';
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

  it('unlocks local squad slots for all users in Open Beta and scales AI credits on upgrade', () => {
    expect(getMaxGymBuddies()).toBe(4);

    upgradeToPro('yearly');
    expect(getAiQuota().isPro).toBe(true);
    expect(getAiQuota().remaining).toBe(Infinity);
    expect(consumeAiCredit()).toBe(true);
    expect(getMaxGymBuddies()).toBe(4);

    upgradeToPro('family');
    expect(getMaxGymBuddies()).toBe(4);

    cancelPro();
    expect(getAiQuota().isPro).toBe(false);
    expect(getMaxGymBuddies()).toBe(4);
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

describe('workout smart average defaults', () => {
  it('parses target set/rep schemes into clean middle averages', () => {
    expect(parseSetRepTarget('3 × 8–12')).toEqual({ sets: 3, reps: 10, isTimeBased: false });
    expect(parseSetRepTarget('4 × 12-15')).toEqual({ sets: 4, reps: 14, isTimeBased: false });
    expect(parseSetRepTarget('3 × 45–60 sn')).toEqual({ sets: 3, reps: 55, isTimeBased: true });
    expect(parseSetRepTarget('3 × Maks')).toEqual({ sets: 3, reps: 12, isTimeBased: false });
  });

  it('produces equipment-aware average kg/reps/sets and honors previous logs', () => {
    const pushup = getSmartExerciseDefaults({ name: 'Push-Ups', sets: '3 × 8–12' }, null, 'Ekipmansız');
    expect(pushup).toEqual({ kg: 0, reps: 10, sets: 3, isBodyweight: true, isTimeBased: false });

    const latRaise = getSmartExerciseDefaults({ name: 'Lateral Raise', sets: '3 × 12–15' }, null, 'Dambıl');
    expect(latRaise).toEqual({ kg: 6, reps: 14, sets: 3, isBodyweight: false, isTimeBased: false });

    const dbPress = getSmartExerciseDefaults({ name: 'Incline Dumbbell Press', sets: '3 × 8–12' }, null, 'Dambıl');
    expect(dbPress).toEqual({ kg: 10, reps: 10, sets: 3, isBodyweight: false, isTimeBased: false });

    const barbellSq = getSmartExerciseDefaults({ name: 'Barbell Squat', sets: '4 × 8–10' }, null, 'Halter (Barbell)');
    expect(barbellSq).toEqual({ kg: 30, reps: 9, sets: 4, isBodyweight: false, isTimeBased: false });

    const fromHistory = getSmartExerciseDefaults(
      { name: 'Incline Dumbbell Press', sets: '3 × 8–12' },
      { kg: 17.5, reps: 11, sets: 4 },
      'Dambıl'
    );
    expect(fromHistory).toEqual({ kg: 17.5, reps: 11, sets: 4, isBodyweight: false, isTimeBased: false });
  });
});

describe('Power Athlete Calculations (Plates, Units, PRs)', () => {
  it('computes greedy Olympic plate breakdown per side accurately', () => {
    const clean100 = calculatePlateLoadout(100, 20);
    expect(clean100).toEqual({
      barKg: 20,
      targetKg: 100,
      loadedTotalKg: 100,
      remainderKg: 0,
      perSide: [
        { weight: 25, count: 1 },
        { weight: 15, count: 1 }
      ]
    });

    const withRemainder = calculatePlateLoadout(61, 20);
    expect(withRemainder.loadedTotalKg).toBe(60);
    expect(withRemainder.remainderKg).toBe(1);
    expect(withRemainder.perSide).toEqual([{ weight: 20, count: 1 }]);

    const belowBar = calculatePlateLoadout(15, 20);
    expect(belowBar.loadedTotalKg).toBe(20);
    expect(belowBar.perSide).toEqual([]);
  });

  it('converts weights and lengths cleanly between metric and imperial systems', () => {
    expect(convertWeight(100, 'metric')).toBe(100);
    expect(convertWeight(100, 'imperial')).toBe(220.5);
    expect(toMetricWeight(220.5, 'imperial')).toBe(100);
    expect(weightUnitLabel('metric')).toBe('kg');
    expect(weightUnitLabel('imperial')).toBe('lbs');

    expect(convertLength(180, 'metric')).toBe(180);
    expect(convertLength(180, 'imperial')).toBe(70.9);
    expect(lengthUnitLabel('imperial')).toBe('in');
  });

  it('extracts all-time 1RM PR and latest session summary from workout history', () => {
    expect(getExerciseRecord([], 'Bench Press')).toBeNull();

    const workouts = [
      { day: '2026-10-01', payload: { sets: { 'Bench Press': { kg: 80, reps: 8, sets: 4 } } } },
      { day: '2026-10-15', payload: { sets: { 'Bench Press': { kg: 100, reps: 5, sets: 4 } } } },
      { day: '2026-11-01', payload: { sets: { 'Bench Press': { kg: 90, reps: 5, sets: 3 } } } }
    ];

    const record = getExerciseRecord(workouts, 'Bench Press');
    expect(record).not.toBeNull();
    expect(record.bestKg).toBe(100);
    expect(record.bestReps).toBe(5);
    expect(record.best1RM).toBeGreaterThan(110);
    expect(record.sessions).toBe(3);
    expect(record.lastDay).toBe('2026-11-01');
    expect(record.lastKg).toBe(90);
    expect(record.lastReps).toBe(5);
  });
});

describe('Cover Image Uniqueness & Asset Integrity', () => {
  it('guarantees every Leap program card and Tools card has a unique existing cover asset', () => {
    const publicDir = path.resolve(process.cwd(), 'public');
    const progImages = PROGRAMS.map((p) => p.image);
    expect(new Set(progImages).size).toBe(PROGRAMS.length);

    for (const imgPath of progImages) {
      expect(imgPath).toMatch(/^\/images\/programs\/.+\.jpg$/);
      const diskPath = path.join(publicDir, imgPath.replace(/^\//, ''));
      expect(fs.existsSync(diskPath)).toBe(true);
    }

    const toolsSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/views/ToolsView.jsx'), 'utf8');
    const toolImageMatches = [...toolsSrc.matchAll(/image:\s*'([^']+)'/g)].map((m) => m[1]);
    expect(toolImageMatches.length).toBeGreaterThanOrEqual(11);
    expect(new Set(toolImageMatches).size).toBe(toolImageMatches.length);

    for (const imgPath of toolImageMatches) {
      expect(progImages).not.toContain(imgPath);
      const diskPath = path.join(publicDir, imgPath.replace(/^\//, ''));
      expect(diskPath && fs.existsSync(diskPath)).toBe(true);
    }
  });
});

describe('Pro Biometrics, DOTS/Wilks, Katch-McArdle & i18n telemetry label', () => {
  it('computes accurate DOTS, Wilks, Katch-McArdle, US Navy and Calorie Cycling outputs', () => {
    const dots = calculateDotsScore(500, 80, 'male');
    const wilks = calculateWilksScore(500, 80, 'male');
    expect(dots).toBeGreaterThan(330);
    expect(dots).toBeLessThan(360);
    expect(wilks).toBeGreaterThan(330);
    expect(wilks).toBeLessThan(360);
    expect(calculateDotsScore(0, 80, 'male')).toBe(0);

    // 80 kg, %15 yağ -> LBM = 68 kg -> BMR = 370 + 21.6 * 68 = 1839 kcal
    expect(calculateKatchMcArdleBMR(80, 15)).toBe(1839);

    const cycle = calculateCalorieCycleSplit(2400, 160, 65, 150);
    expect(cycle.training.kcal).toBe(2550);
    expect(cycle.rest.kcal).toBe(2250);
    expect(cycle.training.carbs).toBeGreaterThan(cycle.rest.carbs);

    const navyBf = calculateUsNavyBodyFat({ sex: 'male', heightCm: 180, waistCm: 84, neckCm: 38 });
    expect(navyBf).toBeGreaterThan(10);
    expect(navyBf).toBeLessThan(25);
  });

  it('has no trailing colon on telemetry.remaining across all 4 locales', () => {
    for (const locale of ['tr', 'en', 'de', 'es']) {
      setLang(locale);
      expect(translate('telemetry.remaining').endsWith(':')).toBe(false);
    }
    setLang('tr');
  });
});

describe('Multi-Account Family Plan Engine (4 seats, independent accounts)', () => {
  beforeEach(() => {
    localStorage.clear();
    setQuotaUserScope(null);
  });

  it('allows owner to create a 4-seat family plan and separate friend accounts to join via invite code', async () => {
    const owner = { id: 'local_owner_1', email: 'owner@fit.local', isLocal: true };
    const friend1 = { id: 'local_friend_1', email: 'ali@fit.local', isLocal: true };
    const friend2 = { id: 'local_friend_2', email: 'veli@fit.local', isLocal: true };
    const friend3 = { id: 'local_friend_3', email: 'can@fit.local', isLocal: true };
    const friend4 = { id: 'local_friend_4', email: 'extra@fit.local', isLocal: true };

    setQuotaUserScope(owner.id);
    const created = await activateFamilyPlan(owner, 'Eren');
    const code = normalizeInviteCode(created.group.inviteCode);
    expect(code).toMatch(/^FIT-FAM-[A-Z0-9]+$/);
    expect(buildFamilyInviteUrl(code, 'https://fit.app')).toBe(`https://fit.app/?family=${code}`);
    expect(getAiMembership().plan).toBe('family');
    expect(getAiMembership().isPro).toBe(true);

    // Unrelated account starts Free (accounts are strictly isolated)
    setQuotaUserScope(friend1.id);
    expect(getAiMembership().isPro).toBe(false);

    // Friend 1 joins using THEIR OWN account & code -> gets Family Pro on their own account
    await joinFamilyByCode(friend1, code, 'Ali');
    expect(getAiMembership().isPro).toBe(true);
    expect(getAiMembership().plan).toBe('family');
    expect(getAiMembership().familyRole).toBe('member');

    // Fill seats 3 and 4
    setQuotaUserScope(friend2.id);
    await joinFamilyByCode(friend2, code, 'Veli');
    setQuotaUserScope(friend3.id);
    const fullStatus = await joinFamilyByCode(friend3, code, 'Can');
    expect(fullStatus.group.members).toHaveLength(FAMILY_MAX_SEATS);

    // Seat #5 must be rejected (max 4 accounts)
    setQuotaUserScope(friend4.id);
    await expect(joinFamilyByCode(friend4, code, 'Extra')).rejects.toThrow(/4 kişilik/);
    expect(getAiMembership().isPro).toBe(false);

    // Owner removes friend1 -> friend1's own account drops back to Free & seat opens
    setQuotaUserScope(owner.id);
    await leaveOrRemoveFamilyMember(owner, friend1.id);
    setQuotaUserScope(friend1.id);
    const f1Status = await getFamilyStatus(friend1);
    expect(f1Status.group).toBeNull();
    expect(getAiMembership().isPro).toBe(false);
  });
});

describe('App Store & Google Play Store Release Readiness', () => {
  const readPngDimensions = (filePath) => {
    const buf = fs.readFileSync(filePath);
    // PNG signature check (bytes 0..7) + IHDR width (bytes 16..19) & height (bytes 20..23)
    expect(buf.slice(1, 4).toString('ascii')).toBe('PNG');
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20)
    };
  };

  it('provides exact-resolution PNG icons required by Play Store, iOS & PWA manifest', () => {
    const publicDir = path.resolve(process.cwd(), 'public');
    expect(readPngDimensions(path.join(publicDir, 'icons/icon-192.png'))).toEqual({ width: 192, height: 192 });
    expect(readPngDimensions(path.join(publicDir, 'icons/icon-512.png'))).toEqual({ width: 512, height: 512 });
    expect(readPngDimensions(path.join(publicDir, 'icons/icon-maskable-512.png'))).toEqual({ width: 512, height: 512 });
    expect(readPngDimensions(path.join(publicDir, 'icons/app-icon.png'))).toEqual({ width: 512, height: 512 });
    expect(readPngDimensions(path.join(publicDir, 'icons/app-icon-1024.png'))).toEqual({ width: 1024, height: 1024 });

    const manifest = JSON.parse(fs.readFileSync(path.join(publicDir, 'manifest.webmanifest'), 'utf8'));
    const purposes = manifest.icons.map((i) => i.purpose);
    expect(purposes).toContain('any');
    expect(purposes).toContain('maskable');
    expect(purposes).not.toContain('any maskable');
  });

  it('includes valid legal pages, native Capacitor config & .well-known deep-link templates', () => {
    const rootDir = process.cwd();
    const publicDir = path.join(rootDir, 'public');

    const cap = JSON.parse(fs.readFileSync(path.join(rootDir, 'capacitor.config.json'), 'utf8'));
    expect(cap.appId).toBe('com.fitatelier.app');
    expect(cap.ios?.handleApplicationURL).toBe(true);

    const assetLinks = JSON.parse(fs.readFileSync(path.join(publicDir, '.well-known/assetlinks.json'), 'utf8'));
    expect(assetLinks[0]?.target?.package_name).toBe('com.fitatelier.app');

    const aasa = JSON.parse(fs.readFileSync(path.join(publicDir, '.well-known/apple-app-site-association'), 'utf8'));
    expect(aasa.applinks?.details?.[0]?.appID).toContain('com.fitatelier.app');

    expect(fs.existsSync(path.join(publicDir, 'gizlilik.html'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'kosullar.html'))).toBe(true);
  });

  it('allows permanent in-app account deletion for local/guest users per App Store 5.1.1(v)', async () => {
    localStorage.clear();
    const localUser = continueAsLocalUser();
    expect(getAuthState().user?.id).toBe(localUser.id);

    await activateFamilyPlan(localUser, 'Test');
    expect(localStorage.getItem('fit-family-registry-v1')).toBeTruthy();

    await deleteAccount();
    expect(getAuthState().user).toBeNull();
    expect(localStorage.getItem('fit-local-user-v1')).toBeNull();
    expect(localStorage.getItem('fit-ai-membership-v1')).toBeNull();
  });
});
