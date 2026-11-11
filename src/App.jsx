import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import Layout from './components/Layout.jsx';
import ActiveWorkoutModal from './components/ActiveWorkoutModal.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import Onboarding from './components/Onboarding.jsx';
import AiMealLogger from './components/AiMealLogger.jsx';
import SmartMealRecommender from './components/SmartMealRecommender.jsx';
import WeeklyReport from './components/WeeklyReport.jsx';
import ProgramGenerator from './components/ProgramGenerator.jsx';
import CustomWorkoutBuilder from './components/CustomWorkoutBuilder.jsx';
import { Segmented, Skeleton } from './components/ui.jsx';

import TodayView from './views/TodayView.jsx';
const CalendarView = lazy(() => import('./views/CalendarView.jsx'));
const TrainingView = lazy(() => import('./views/TrainingView.jsx'));
const NutritionView = lazy(() => import('./views/NutritionView.jsx'));
const ProgressView = lazy(() => import('./views/ProgressView.jsx'));
const HabitsView = lazy(() => import('./views/HabitsView.jsx'));
const CoachView = lazy(() => import('./views/CoachView.jsx'));
const SettingsView = lazy(() => import('./views/SettingsView.jsx'));

import { targets, today, calculateCalories } from './lib/calculations.js';
import { DEFAULT_PROFILE } from './lib/constants.js';
import { getSetting, setSetting, list, add, remove, subscribe } from './lib/store.js';
import { scheduleSync, getAuthState, getSyncState } from './lib/supabase.js';
import { getCustomProgram } from './lib/workoutPlans.js';
import { initTheme } from './lib/notifications.js';

const CATEGORIES = ['workout', 'meal', 'habit', 'weight', 'supplement', 'checkin', 'report'];
const VALID_TABS = ['today', 'training', 'nutrition', 'progress', 'coach', 'settings'];

const readTabFromHash = () => {
  const h = (typeof window !== 'undefined' ? window.location.hash : '').replace('#', '');
  if (h === 'dashboard') return 'today';
  return VALID_TABS.includes(h) ? h : 'today';
};

/* ================================================================== */
/* Kök: oturum durumuna göre ekran seçer                               */
/* ================================================================== */

export default function App() {
  const [auth, setAuth] = useState(getAuthState());

  useEffect(() => {
    initTheme();
    const h = () => setAuth(getAuthState());
    window.addEventListener('fit-sync-change', h);
    h();
    return () => window.removeEventListener('fit-sync-change', h);
  }, []);

  if (!auth.ready) return <Splash />;
  if (!auth.user) return <AuthScreen />;
  return <MainApp key={auth.user.id} />;
}

function Splash({ text }) {
  return (
    <div className="fx-splash">
      <div className="fx-logo fx-logo--xl">
        fit<span>.</span>
      </div>
      {text && <p className="fx-muted">{text}</p>}
    </div>
  );
}

/* ================================================================== */
/* Giriş yapılmış uygulama                                             */
/* ================================================================== */

function readProfile() {
  const raw = getSetting('profile');
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

function readEntries() {
  return Object.fromEntries(CATEGORIES.map((c) => [c, list(c)]));
}

function MainApp() {
  const [tab, setTabState] = useState(readTabFromHash);
  const [day, setDay] = useState(today());
  const [storedProfile, setStoredProfile] = useState(readProfile);
  const [entries, setEntries] = useState(readEntries);
  const [program, setProgram] = useState(getCustomProgram);
  const [syncState, setSyncState] = useState(getSyncState());
  const [waitedForSync, setWaitedForSync] = useState(false);

  const [trainingSection, setTrainingSection] = useState('program');
  const [progressSection, setProgressSection] = useState('report');

  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const installed =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true);

  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);

  const profile = useMemo(() => ({ ...DEFAULT_PROFILE, ...(storedProfile || {}) }), [storedProfile]);

  const showToast = useCallback((msg, ms = 2800) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    if (msg) toastTimer.current = setTimeout(() => setToast(''), ms);
  }, []);

  const setTab = useCallback((t) => {
    setTabState(t);
    if (window.location.hash !== `#${t}`) {
      window.history.replaceState(null, '', t === 'today' ? window.location.pathname : `#${t}`);
    }
    window.scrollTo({ top: 0 });
  }, []);

  // Store ve senkronizasyon dinleyicileri
  useEffect(() => {
    const reload = () => {
      setStoredProfile(readProfile());
      setEntries(readEntries());
      setProgram(getCustomProgram());
    };
    const unsubscribe = subscribe(reload);
    const onSync = () => setSyncState(getSyncState());
    const onOnline = () => {
      setOnline(true);
      scheduleSync();
    };
    const onOffline = () => setOnline(false);
    const onHash = () => setTabState(readTabFromHash());
    const onVisible = () => document.visibilityState === 'visible' && scheduleSync();

    window.addEventListener('fit-sync-change', onSync);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('hashchange', onHash);
    document.addEventListener('visibilitychange', onVisible);

    // Yeni cihazda ilk senkronizasyon gecikirse onboarding'e takılmamak için üst sınır
    const t = setTimeout(() => setWaitedForSync(true), 8000);

    return () => {
      unsubscribe();
      window.removeEventListener('fit-sync-change', onSync);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('visibilitychange', onVisible);
      clearTimeout(t);
    };
  }, []);

  const target = useMemo(() => targets(profile), [profile]);
  const todayMeals = useMemo(() => entries.meal.filter((x) => x.day === day), [entries.meal, day]);
  const totals = useMemo(
    () =>
      todayMeals.reduce(
        (a, x) => ({
          calories: a.calories + Number(x.payload?.calories || 0),
          protein: a.protein + Number(x.payload?.protein || 0),
          carbs: a.carbs + Number(x.payload?.carbs || 0),
          fat: a.fat + Number(x.payload?.fat || 0)
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [todayMeals]
  );

  /* ---------------- Handlers ---------------- */

  const handleSaveProfile = async (next) => {
    try {
      const merged = { ...(storedProfile || {}), ...next };
      setSetting('profile', merged);
      scheduleSync();
      showToast('Profil kaydedildi.');
      return true;
    } catch (e) {
      showToast('Profil kaydedilemedi: ' + e.message);
      return false;
    }
  };

  const handleAddEntry = (category, payload, customDay = null, silent = false) => {
    try {
      const id = add(category, customDay || day, payload);
      scheduleSync();
      if (!silent) showToast('Kaydedildi.');
      return id;
    } catch (e) {
      showToast('Kayıt eklenemedi: ' + e.message);
      return null;
    }
  };

  const handleRemoveEntry = (id, silent = false) => {
    try {
      remove(id);
      scheduleSync();
      if (!silent) showToast('Silindi.');
    } catch (e) {
      showToast('Silinemedi: ' + e.message);
    }
  };

  const handleQuickWaterAdd = (amount) => {
    const todayHabit = entries.habit.find((e) => e.day === day);
    const newWater = Number(todayHabit?.payload?.water || 0) + amount;
    if (todayHabit) remove(todayHabit.id);
    add('habit', day, { ...(todayHabit?.payload || { sleep: 0, steps: 0 }), water: newWater });
    scheduleSync();
    if (navigator.vibrate) navigator.vibrate(10);
    showToast(`+${amount} ml su · toplam ${newWater} ml`);
  };

  const handleSaveCheckin = (payload) => {
    const existing = entries.checkin.find((c) => c.day === day);
    if (existing) remove(existing.id);
    handleAddEntry('checkin', payload, today(), true);
  };

  const handleSaveReport = (payload) => {
    handleAddEntry('report', payload, today(), true);
    showToast('Haftalık raporun hazır.');
  };

  const handleFinishActiveWorkout = (workoutResult) => {
    handleAddEntry('workout', workoutResult, null, true);
    setActiveWorkoutPlan(null);
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
    showToast(`💪 ${workoutResult.name} tamamlandı!`, 4000);
  };

  /* ---------------- Onboarding kapısı ---------------- */

  const firstSyncSettled = !!syncState.lastSyncAt || !!syncState.error || !online || waitedForSync;
  // Eski sürümden gelen profil (boy+kilo dolu) onboarding'i atlar.
  const legacyComplete = !!(storedProfile && storedProfile.height && storedProfile.weight);
  const needsOnboarding = !storedProfile?.onboarded && !legacyComplete;

  if (needsOnboarding && !firstSyncSettled) {
    return <Splash text="Verilerin yükleniyor…" />;
  }
  if (needsOnboarding) {
    return <Onboarding initialProfile={storedProfile || {}} onComplete={handleSaveProfile} />;
  }

  /* ---------------- Ana ekranlar ---------------- */

  return (
    <Layout tab={tab} setTab={setTab} day={day} setDay={setDay} profile={profile} online={online}>
      <Suspense fallback={<div className="fx-card"><Skeleton lines={5} /></div>}>
      {tab === 'today' && (
        <TodayView
          day={day}
          profile={profile}
          entries={entries}
          target={target}
          totals={totals}
          onStartWorkout={(plan) => setActiveWorkoutPlan(plan)}
          onNavigate={setTab}
          onQuickWaterAdd={handleQuickWaterAdd}
          onSaveCheckin={handleSaveCheckin}
          onRemoveCheckin={(id) => handleRemoveEntry(id, true)}
        />
      )}

      {tab === 'training' && (
        <div className="fx-stack">
          <Segmented
            value={trainingSection}
            onChange={setTrainingSection}
            options={[
              ['program', 'Program'],
              ['week', 'Haftalık takvim']
            ]}
          />
          {trainingSection === 'program' && (
            <>
              <ProgramGenerator profile={profile} program={program} onDone={() => showToast('Yeni programın hazır!')} />
              <CustomWorkoutBuilder onStartWorkout={(plan) => setActiveWorkoutPlan(plan)} />
              <TrainingView
                key={program?.createdAt || 'default'}
                day={day}
                profile={profile}
                entries={entries}
                onStartActiveWorkout={(plan) => setActiveWorkoutPlan(plan)}
                onAddWorkout={(payload) => handleAddEntry('workout', payload)}
                onRemoveWorkout={(id) => handleRemoveEntry(id)}
              />
            </>
          )}
          {trainingSection === 'week' && (
            <CalendarView
              day={day}
              setDay={setDay}
              profile={profile}
              entries={entries}
              onNavigateToTraining={() => setTrainingSection('program')}
            />
          )}
        </div>
      )}

      {tab === 'nutrition' && (
        <div className="fx-stack">
          <AiMealLogger profile={profile} onAddMeal={(payload) => handleAddEntry('meal', payload)} />
          <SmartMealRecommender
            totals={totals}
            target={target}
            targetCalories={calculateCalories(profile) || 2200}
            onAddMeal={(payload) => handleAddEntry('meal', payload)}
          />
          <NutritionView
            day={day}
            profile={profile}
            entries={entries}
            target={target}
            totals={totals}
            onAddMeal={(payload) => handleAddEntry('meal', payload)}
            onRemoveMeal={(id) => handleRemoveEntry(id)}
            onAddSupplement={(payload) => handleAddEntry('supplement', payload)}
            onRemoveSupplement={(id) => handleRemoveEntry(id)}
          />
        </div>
      )}

      {tab === 'progress' && (
        <div className="fx-stack">
          <Segmented
            value={progressSection}
            onChange={setProgressSection}
            options={[
              ['report', 'Haftalık rapor'],
              ['body', 'Ölçümler'],
              ['habits', 'Alışkanlıklar']
            ]}
          />
          {progressSection === 'report' && (
            <WeeklyReport profile={profile} entries={entries} target={target} onSaveReport={handleSaveReport} />
          )}
          {progressSection === 'body' && (
            <ProgressView
              day={day}
              profile={profile}
              entries={entries}
              onAddWeight={(payload) => handleAddEntry('weight', payload)}
              onRemoveWeight={(id) => handleRemoveEntry(id)}
            />
          )}
          {progressSection === 'habits' && (
            <HabitsView
              day={day}
              profile={profile}
              entries={entries}
              target={target}
              onAddHabit={(payload) => handleAddEntry('habit', payload)}
              onRemoveHabit={(id) => handleRemoveEntry(id)}
              onQuickWaterAdd={handleQuickWaterAdd}
            />
          )}
        </div>
      )}

      {tab === 'coach' && <CoachView profile={profile} entries={entries} target={target} totals={totals} />}

      {tab === 'settings' && (
        <SettingsView profile={profile} onSaveProfile={handleSaveProfile} installed={installed} setMessage={showToast} />
      )}
      </Suspense>

      {activeWorkoutPlan && (
        <ActiveWorkoutModal
          plan={activeWorkoutPlan}
          previousWorkout={entries.workout.find((e) => e.payload?.name === activeWorkoutPlan.name)}
          onFinish={handleFinishActiveWorkout}
          onClose={() => setActiveWorkoutPlan(null)}
        />
      )}

      {toast && (
        <div className="fx-toast" role="status" onClick={() => setToast('')}>
          {toast}
        </div>
      )}
    </Layout>
  );
}
