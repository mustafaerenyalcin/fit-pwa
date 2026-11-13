import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import Layout from './components/Layout.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import Onboarding from './components/Onboarding.jsx';
import { Segmented, Skeleton } from './components/ui.jsx';
import TodayView from './views/TodayView.jsx';
import QuickActionDock from './components/QuickActionDock.jsx';
import CommandSpotlight from './components/CommandSpotlight.jsx';

const ActiveWorkoutModal = lazy(() => import('./components/ActiveWorkoutModal.jsx'));
const AiMealLogger = lazy(() => import('./components/AiMealLogger.jsx'));
const SmartMealRecommender = lazy(() => import('./components/SmartMealRecommender.jsx'));
const AdaptiveMacroCoach = lazy(() => import('./components/AdaptiveMacroCoach.jsx'));
const RecoveryStudio = lazy(() => import('./components/RecoveryStudio.jsx'));
const WeeklyReport = lazy(() => import('./components/WeeklyReport.jsx'));
const ProgramGenerator = lazy(() => import('./components/ProgramGenerator.jsx'));
const CustomWorkoutBuilder = lazy(() => import('./components/CustomWorkoutBuilder.jsx'));
const StrengthOverloadCard = lazy(() => import('./components/StrengthOverloadCard.jsx'));
const FastingTimer = lazy(() => import('./components/FastingTimer.jsx'));
const SmartReminders = lazy(() => import('./components/SmartReminders.jsx'));
const ToolsView = lazy(() => import('./views/ToolsView.jsx'));

const CalendarView = lazy(() => import('./views/CalendarView.jsx'));
const TrainingView = lazy(() => import('./views/TrainingView.jsx'));
const NutritionView = lazy(() => import('./views/NutritionView.jsx'));
const ProgressView = lazy(() => import('./views/ProgressView.jsx'));
const HabitsView = lazy(() => import('./views/HabitsView.jsx'));
const CoachView = lazy(() => import('./views/CoachView.jsx'));
const SettingsView = lazy(() => import('./views/SettingsView.jsx'));

import { targets, today, calculateCalories } from './lib/calculations.js';
import { calculateStreak } from './lib/streaks.js';
import { DEFAULT_PROFILE } from './lib/constants.js';
import { getSetting, setSetting, list, add, remove, subscribe } from './lib/store.js';
import { scheduleSync, getAuthState, getSyncState } from './lib/supabase.js';
import { getCustomProgram, getWorkoutForDay } from './lib/workoutPlans.js';
import { initTheme } from './lib/notifications.js';
import { useI18n } from './lib/i18n.js';

const CATEGORIES = ['workout', 'meal', 'habit', 'weight', 'supplement', 'checkin', 'report'];
const VALID_TABS = ['today', 'training', 'nutrition', 'coach', 'tools', 'settings'];

const readTabFromHash = () => {
  const h = (typeof window !== 'undefined' ? window.location.hash : '').replace('#', '');
  if (h === 'dashboard') return 'today';
  if (h === 'progress') return 'coach';
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
  const { t } = useI18n();
  const [tab, setTabState] = useState(readTabFromHash);
  const [day, setDay] = useState(today());
  const [storedProfile, setStoredProfile] = useState(readProfile);
  const [entries, setEntries] = useState(readEntries);
  const [program, setProgram] = useState(getCustomProgram);
  const [syncState, setSyncState] = useState(getSyncState());
  const [waitedForSync, setWaitedForSync] = useState(false);

  const [trainingSection, setTrainingSection] = useState('session');
  const [builderMode, setBuilderMode] = useState('ai');
  const [nutritionSection, setNutritionSection] = useState('log');
  const [coachSection, setCoachSection] = useState(() => {
    const h = window.location.hash.replace('#', '');
    return h === 'progress' ? 'report' : 'ai';
  });

  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const installed =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true);

  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [activeToolId, setActiveToolId] = useState(null);

  const profile = useMemo(() => ({ ...DEFAULT_PROFILE, ...(storedProfile || {}) }), [storedProfile]);

  const showToast = useCallback((msg, ms = 2800) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    if (msg) toastTimer.current = setTimeout(() => setToast(''), ms);
  }, []);

  const setTab = useCallback((t, subFeature = null) => {
    const resolvedTab = t === 'progress' ? 'coach' : t;
    setTabState(resolvedTab);
    if (resolvedTab === 'tools' && subFeature) {
      setActiveToolId(subFeature);
    } else if (resolvedTab === 'nutrition' && subFeature) {
      setNutritionSection(subFeature);
    } else if (resolvedTab === 'training' && subFeature) {
      setTrainingSection(subFeature);
    } else if (t === 'progress') {
      setCoachSection(subFeature || 'report');
    } else if (resolvedTab === 'coach' && subFeature) {
      setCoachSection(subFeature);
    }
    if (window.location.hash !== `#${resolvedTab}`) {
      window.history.replaceState(
        null,
        '',
        resolvedTab === 'today' ? window.location.pathname : `#${resolvedTab}`
      );
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
    const onHash = () => {
      const h = (typeof window !== 'undefined' ? window.location.hash : '').replace('#', '');
      if (h === 'progress') setCoachSection('report');
      setTabState(readTabFromHash());
    };
    const onVisible = () => document.visibilityState === 'visible' && scheduleSync();

    window.addEventListener('fit-sync-change', onSync);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('hashchange', onHash);
    document.addEventListener('visibilitychange', onVisible);

    // Android donanım geri tuşu ve Esc tuşu ile açık modalları zarifçe kapatma (App Store / Play Store native standardı)
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const topClose = document.querySelector('.fx-modalBackdrop .fx-modalClose, .fx-modalBackdrop .fx-closeBtn');
        if (topClose) topClose.click();
      }
    };
    const handleBackButton = (e) => {
      const topClose = document.querySelector('.fx-modalBackdrop .fx-modalClose, .fx-modalBackdrop .fx-closeBtn');
      if (topClose) {
        if (e.preventDefault) e.preventDefault();
        topClose.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('backbutton', handleBackButton);

    // Yeni cihazda ilk senkronizasyon gecikirse onboarding'e takılmamak için üst sınır
    const t = setTimeout(() => setWaitedForSync(true), 8000);

    return () => {
      unsubscribe();
      window.removeEventListener('fit-sync-change', onSync);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('backbutton', handleBackButton);
      clearTimeout(t);
    };
  }, []);

  const target = useMemo(() => targets(profile), [profile]);
  const streak = useMemo(() => calculateStreak(entries), [entries]);
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
          onQuickMealAdd={(payload) => {
            handleAddEntry('meal', payload);
            showToast(`${payload.name} eklendi (+${payload.protein}g protein)`);
          }}
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
              ['session', t('sub.session')],
              ['builder', t('sub.builder')],
              ['week', t('sub.week')]
            ]}
          />
          {trainingSection === 'session' && (
            <TrainingView
              key={program?.createdAt || 'default'}
              day={day}
              profile={profile}
              entries={entries}
              onStartActiveWorkout={(plan) => setActiveWorkoutPlan(plan)}
              onAddWorkout={(payload) => handleAddEntry('workout', payload)}
              onRemoveWorkout={(id) => handleRemoveEntry(id)}
            />
          )}
          {trainingSection === 'builder' && (
            <div className="fx-stack">
              <Segmented
                value={builderMode}
                onChange={setBuilderMode}
                options={[
                  ['ai', t('sub.aiBuilder')],
                  ['custom', t('sub.customBuilder')]
                ]}
              />
              {builderMode === 'ai' ? (
                <ProgramGenerator profile={profile} program={program} onDone={() => showToast('✓')} />
              ) : (
                <CustomWorkoutBuilder onStartWorkout={(plan) => setActiveWorkoutPlan(plan)} />
              )}
            </div>
          )}
          {trainingSection === 'week' && (
            <CalendarView
              day={day}
              setDay={setDay}
              profile={profile}
              entries={entries}
              onNavigateToTraining={() => setTrainingSection('session')}
            />
          )}
        </div>
      )}

      {tab === 'nutrition' && (
        <div className="fx-stack">
          <Segmented
            value={nutritionSection}
            onChange={setNutritionSection}
            options={[
              ['log', t('sub.nutritionLog')],
              ['ai', t('sub.nutritionAi')],
              ['coach', t('sub.nutritionCoach')]
            ]}
          />
          {nutritionSection === 'log' && (
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
          )}
          {nutritionSection === 'ai' && (
            <div className="fx-stack">
              <AiMealLogger profile={profile} onAddMeal={(payload) => handleAddEntry('meal', payload)} />
              <SmartMealRecommender
                totals={totals}
                target={target}
                targetCalories={calculateCalories(profile) || 2200}
                onAddMeal={(payload) => handleAddEntry('meal', payload)}
              />
            </div>
          )}
          {nutritionSection === 'coach' && (
            <AdaptiveMacroCoach profile={profile} entries={entries} target={target} />
          )}
        </div>
      )}

      {tab === 'tools' && (
        <ToolsView
          profile={profile}
          entries={entries}
          target={target}
          initialToolId={activeToolId}
          onClearInitialTool={() => setActiveToolId(null)}
          onStartWorkout={(plan) => setActiveWorkoutPlan(plan)}
        />
      )}

      {tab === 'coach' && (
        <div className="fx-stack">
          <Segmented
            value={coachSection}
            onChange={setCoachSection}
            options={[
              ['ai', t('sub.coachChat')],
              ['report', t('sub.report')],
              ['body', t('sub.body')],
              ['habits', t('sub.habits')]
            ]}
          />
          {coachSection === 'ai' && (
            <CoachView profile={profile} entries={entries} target={target} totals={totals} />
          )}
          {coachSection === 'report' && (
            <WeeklyReport profile={profile} entries={entries} target={target} onSaveReport={handleSaveReport} />
          )}
          {coachSection === 'body' && (
            <div className="fx-stack">
              <ProgressView
                day={day}
                profile={profile}
                entries={entries}
                onAddWeight={(payload) => handleAddEntry('weight', payload)}
                onRemoveWeight={(id) => handleRemoveEntry(id)}
              />
              <button
                type="button"
                className="fx-btn fx-btn-ghost"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => setTab('tools', 'body')}
              >
                {t('tools.bodyStudioCta')}
              </button>
            </div>
          )}
          {coachSection === 'habits' && (
            <>
              <SmartReminders totals={totals} target={target} setMessage={showToast} />
              <HabitsView
                day={day}
                profile={profile}
                entries={entries}
                target={target}
                onAddHabit={(payload) => handleAddEntry('habit', payload)}
                onRemoveHabit={(id) => handleRemoveEntry(id)}
                onQuickWaterAdd={handleQuickWaterAdd}
              />
            </>
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="fx-stack">
          <SmartReminders totals={totals} target={target} setMessage={showToast} />
          <SettingsView
            profile={profile}
            onSaveProfile={handleSaveProfile}
            installed={installed}
            setMessage={showToast}
            onRetakeOnboarding={() => setShowOnboardingModal(true)}
          />
        </div>
      )}
      </Suspense>

      {showOnboardingModal && (
        <Onboarding
          initialProfile={profile}
          onComplete={async (updatedProfile) => {
            await handleSaveProfile(updatedProfile);
            setShowOnboardingModal(false);
            showToast('🎯 Biyometrik kalibrasyonun başarıyla güncellendi.');
          }}
          onCancel={() => setShowOnboardingModal(false)}
        />
      )}

      {activeWorkoutPlan && (
        <Suspense fallback={null}>
          <ActiveWorkoutModal
            plan={activeWorkoutPlan}
            previousWorkout={entries.workout.find((e) => e.payload?.name === activeWorkoutPlan.name)}
            allWorkouts={entries.workout}
            profile={profile}
            streak={streak}
            onFinish={handleFinishActiveWorkout}
            onClose={() => setActiveWorkoutPlan(null)}
          />
        </Suspense>
      )}

      {toast && (
        <div className="fx-toast" role="status" onClick={() => setToast('')}>
          {toast}
        </div>
      )}

      {/* YÜZEN ERGONOMİK HIZLI EYLEM DOCK'I (SPEED DIAL) */}
      {!activeWorkoutPlan && !showOnboardingModal && (
        <QuickActionDock
          onQuickWaterAdd={handleQuickWaterAdd}
          onStartWorkout={(plan) => {
            const dayIdx = (new Date(day + 'T12:00:00').getDay() + 6) % 7;
            const targetPlan = plan || getWorkoutForDay(profile.training || 'home', dayIdx);
            setActiveWorkoutPlan(targetPlan);
          }}
          onOpenCheckin={() => {
            setTab('today');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('fit-open-checkin'));
            }, 60);
          }}
          onOpenBarcode={() => {
            setTab('nutrition', 'ai');
          }}
          todayPlan={getWorkoutForDay(profile.training || 'home', (new Date(day + 'T12:00:00').getDay() + 6) % 7)}
        />
      )}

      {/* HIZLI KOMUT & ARAÇ SPOTLIGHT PALETİ (Ctrl+K / ⌘K) */}
      <CommandSpotlight
        onNavigate={(nextTab, toolId) => {
          if (nextTab === 'tools' && toolId) {
            setActiveToolId(toolId);
          }
          setTab(nextTab);
        }}
        onQuickWater={handleQuickWaterAdd}
        onStartWorkout={() => {
          const dayIdx = (new Date(day + 'T12:00:00').getDay() + 6) % 7;
          setActiveWorkoutPlan(getWorkoutForDay(profile.training || 'home', dayIdx));
        }}
        onOpenBarcode={() => setTab('nutrition', 'ai')}
        onOpenSubscription={() => {
          setTab('settings');
          showToast('👑 Atelier Black');
        }}
      />
    </Layout>
  );
}
