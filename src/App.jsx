import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout.jsx';
import ActiveWorkoutModal from './components/ActiveWorkoutModal.jsx';

// Modular Views
import DashboardView from './views/DashboardView.jsx';
import CalendarView from './views/CalendarView.jsx';
import TrainingView from './views/TrainingView.jsx';
import NutritionView from './views/NutritionView.jsx';
import ProgressView from './views/ProgressView.jsx';
import HabitsView from './views/HabitsView.jsx';
import ProfileView from './views/ProfileView.jsx';
import CoachView from './views/CoachView.jsx';
import SyncView from './views/SyncView.jsx';

import { targets, today } from './lib/calculations.js';
import { DEFAULT_PROFILE } from './lib/constants.js';
import { getSetting, setSetting, list, add, remove, subscribe } from './lib/store.js';
import { scheduleSync } from './lib/supabase.js';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [day, setDay] = useState(today());
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [entries, setEntries] = useState({
    workout: [],
    meal: [],
    habit: [],
    weight: [],
    supplement: []
  });
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [installed, setInstalled] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
      : false
  );

  // Active Live Workout Modal
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);

  // Load data from store
  const loadData = async () => {
    try {
      const rawProfile = getSetting('profile');
      if (rawProfile) {
        const parsed = typeof rawProfile === 'string' ? JSON.parse(rawProfile) : rawProfile;
        setProfile((prev) => ({ ...DEFAULT_PROFILE, ...prev, ...parsed }));
      }

      setEntries({
        workout: list('workout'),
        meal: list('meal'),
        habit: list('habit'),
        weight: list('weight'),
        supplement: list('supplement')
      });
      setReady(true);
    } catch (e) {
      console.error('Data load error:', e);
      setMessage('Yerel veriler okunamadı: ' + e.message);
      setReady(true);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to store mutations
    const unsubscribe = subscribe(() => {
      loadData();
    });

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if there is an active session in localStorage to restore
    try {
      const saved = localStorage.getItem('fit-active-session-v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.planName) {
          setMessage(`Devam eden bir antrenman oturumun var: ${parsed.planName}`);
        }
      }
    } catch {}

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Targets and Today's Nutrition totals
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

  // Profile save handler
  const handleSaveProfile = async (newProfile) => {
    try {
      setProfile(newProfile);
      setSetting('profile', newProfile);
      scheduleSync();
      setMessage('Profil başarıyla kaydedildi.');
      setTimeout(() => setMessage(''), 3500);
      return true;
    } catch (e) {
      setMessage('Profil kaydedilemedi: ' + e.message);
      return false;
    }
  };

  // Generic entry handlers
  const handleAddEntry = (category, payload, customDay = null) => {
    try {
      const targetDay = customDay || day;
      const id = add(category, targetDay, payload);
      scheduleSync();
      setMessage('Kayıt başarıyla eklendi.');
      setTimeout(() => setMessage(''), 3000);
      return id;
    } catch (e) {
      setMessage('Kayıt ekleme hatası: ' + e.message);
      return null;
    }
  };

  const handleRemoveEntry = (id) => {
    try {
      remove(id);
      scheduleSync();
      setMessage('Kayıt silindi.');
      setTimeout(() => setMessage(''), 2500);
    } catch (e) {
      setMessage('Kayıt silinemedi: ' + e.message);
    }
  };

  // Quick Water Addition
  const handleQuickWaterAdd = (amount) => {
    const todayHabit = entries.habit.find((e) => e.day === day);
    const prevWater = Number(todayHabit?.payload?.water || 0);
    const newWater = prevWater + amount;

    if (todayHabit) {
      remove(todayHabit.id);
      add('habit', day, {
        ...todayHabit.payload,
        water: newWater
      });
    } else {
      add('habit', day, {
        sleep: 0,
        water: newWater,
        steps: 0
      });
    }
    scheduleSync();
    setMessage(`+${amount} ml su eklendi (${newWater} ml).`);
    setTimeout(() => setMessage(''), 3000);
  };

  // Finish Live Workout Session
  const handleFinishActiveWorkout = (workoutResult) => {
    handleAddEntry('workout', workoutResult);
    setActiveWorkoutPlan(null);
    setMessage(`${workoutResult.name} başarıyla tamamlandı ve kaydedildi!`);
  };

  return (
    <Layout
      tab={tab}
      setTab={setTab}
      day={day}
      setDay={setDay}
      profile={profile}
      online={online}
      installed={installed}
    >
      {/* Top Notification */}
      {message && (
        <div className="notice" role="status">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage('')}>
            ×
          </button>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {tab === 'dashboard' && (
        <DashboardView
          day={day}
          profile={profile}
          entries={entries}
          target={target}
          totals={totals}
          onStartWorkout={(plan) => setActiveWorkoutPlan(plan)}
          onNavigate={(targetTab) => setTab(targetTab)}
          onQuickWaterAdd={handleQuickWaterAdd}
        />
      )}

      {/* CALENDAR TAB */}
      {tab === 'calendar' && (
        <CalendarView
          day={day}
          setDay={setDay}
          profile={profile}
          entries={entries}
          onNavigateToTraining={() => setTab('training')}
        />
      )}

      {/* TRAINING TAB */}
      {tab === 'training' && (
        <TrainingView
          day={day}
          profile={profile}
          entries={entries}
          onStartActiveWorkout={(plan) => setActiveWorkoutPlan(plan)}
          onAddWorkout={(payload) => handleAddEntry('workout', payload)}
          onRemoveWorkout={(id) => handleRemoveEntry(id)}
        />
      )}

      {/* NUTRITION TAB */}
      {tab === 'nutrition' && (
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

      {/* PROGRESS TAB */}
      {tab === 'progress' && (
        <ProgressView
          day={day}
          profile={profile}
          entries={entries}
          onAddWeight={(payload) => handleAddEntry('weight', payload)}
          onRemoveWeight={(id) => handleRemoveEntry(id)}
        />
      )}

      {/* HABITS TAB */}
      {tab === 'habits' && (
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

      {/* PROFILE TAB */}
      {tab === 'profile' && (
        <ProfileView
          profile={profile}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* AI COACH TAB */}
      {tab === 'coach' && (
        <CoachView
          profile={profile}
          entries={entries}
          target={target}
          totals={totals}
        />
      )}

      {/* SYNC TAB */}
      {tab === 'sync' && (
        <SyncView
          online={online}
          installed={installed}
          onReload={loadData}
          setMessage={setMessage}
        />
      )}

      {/* Active Workout Live Session Modal */}
      {activeWorkoutPlan && (
        <ActiveWorkoutModal
          plan={activeWorkoutPlan}
          previousWorkout={entries.workout.find((e) => e.payload?.name === activeWorkoutPlan.name)}
          onFinish={handleFinishActiveWorkout}
          onClose={() => setActiveWorkoutPlan(null)}
        />
      )}

      <footer>
        FIT · Kişisel Spor ve Sağlık Asistanı · v0.6.0 · {ready ? (installed ? 'PWA Yüklü' : 'Yerel / Çevrimdışı Hazır') : 'Yükleniyor…'}
      </footer>
    </Layout>
  );
}
