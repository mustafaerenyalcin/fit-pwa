import React, { useState } from 'react';
import AthleteHeaderBar from '../components/AthleteHeaderBar.jsx';
import HeroWorkoutCard from '../components/HeroWorkoutCard.jsx';
import DailyTelemetryCard from '../components/DailyTelemetryCard.jsx';
import AthleteToolsLaunchpad from '../components/AthleteToolsLaunchpad.jsx';
import DailyCheckin from '../components/DailyCheckin.jsx';
import MuscleRecoveryMap from '../components/MuscleRecoveryMap.jsx';
import SubscriptionModal from '../components/SubscriptionModal.jsx';
import BarcodeScannerModal from '../components/BarcodeScannerModal.jsx';
import AthleteStoryCardModal from '../components/AthleteStoryCardModal.jsx';
import { getWorkoutForDay } from '../lib/workoutPlans.js';
import { calculateCalories, today } from '../lib/calculations.js';
import { calculateGamification } from '../lib/streaks.js';
import { calculateReadiness } from '../lib/readinessEngine.js';
import { useI18n } from '../lib/i18n.js';

export default function TodayView({
  day,
  profile,
  entries,
  target,
  totals,
  onStartWorkout,
  onNavigate,
  onQuickWaterAdd,
  onQuickMealAdd,
  onSaveCheckin,
  onRemoveCheckin
}) {
  const { t } = useI18n();
  const [showSubModal, setShowSubModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const dayIndex = (new Date(day + 'T12:00:00').getDay() + 6) % 7;
  const plan = getWorkoutForDay(profile.training || 'home', dayIndex);
  const isRest = !plan || plan.rest || !plan.moves;
  const doneToday = entries.workout.filter((e) => e.day === day);
  const isToday = day === today();

  const targetCalories = calculateCalories(profile) || 2200;
  const habit = entries.habit.find((e) => e.day === day)?.payload || {};
  const water = Number(habit.water || 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 6
      ? t('today.greetNight')
      : hour < 12
        ? t('today.greetMorning')
        : hour < 18
          ? t('today.greetDay')
          : t('today.greetEvening');

  const g = calculateGamification(entries, target);
  const readiness = calculateReadiness(entries, profile, target);

  return (
    <div className="fx-zenTodayContainer animate-fade-in">
      {/* 1. SEVİYE, SERİ & AI ENERJİ SPORCU BAŞLIĞI */}
      <AthleteHeaderBar
        entries={entries}
        profile={profile}
        target={target}
        greeting={greeting}
        onOpenSubscription={() => setShowSubModal(true)}
      />

      {/* 2. GÜNÜN ODAĞI: ANTRENMAN VE HAZIRLIK HERO KARTI */}
      <HeroWorkoutCard
        plan={plan}
        isRest={isRest}
        doneToday={doneToday}
        entries={entries}
        profile={profile}
        target={target}
        totals={totals}
        water={water}
        onStartWorkout={onStartWorkout}
        onNavigate={onNavigate}
        onOpenStoryCard={() => setShowStoryModal(true)}
      />

      {/* 3. GÜNLÜK HEDEFLER & HİDRASYON KOKPİTİ (3 HALKA + HIZLI YAKIT) */}
      <DailyTelemetryCard
        totals={totals}
        targetCalories={targetCalories}
        targetProtein={target.protein || 140}
        water={water}
        targetWater={target.water || 2500}
        onQuickWaterAdd={onQuickWaterAdd}
        onQuickMealAdd={onQuickMealAdd}
        onOpenBarcode={() => setShowBarcodeModal(true)}
        onNavigate={onNavigate}
      />

      {/* 4. HIZLI SPORCU LABORATUVARI (4 TEMİZ AKSİYON KAROSU) */}
      <AthleteToolsLaunchpad
        onOpenBarcode={() => setShowBarcodeModal(true)}
        onNavigate={onNavigate}
      />

      {/* 5. TOPARLANMA & SABAH BİYOMETRİSİ (SABAH CHECK-IN + KAS RADARI) */}
      <div className="fx-zenRecoverySection">
        {/* SOL: SABAH CHECK-IN FORMU */}
        {isToday && (
          <div className="fx-zenRecoveryCol">
            <DailyCheckin
              day={day}
              profile={profile}
              entries={entries}
              target={target}
              todayPlan={plan}
              onStartWorkout={onStartWorkout}
              onSave={onSaveCheckin}
              onRemove={onRemoveCheckin}
            />
          </div>
        )}

        {/* SAĞ: İNTERAKTİF ANATOMİK KAS TOPARLANMA HARİTASI */}
        <div className="fx-zenRecoveryCol">
          <MuscleRecoveryMap entries={entries} day={day} />
        </div>
      </div>

      {/* MODALLAR */}
      {showSubModal && (
        <SubscriptionModal onClose={() => setShowSubModal(false)} />
      )}

      {showBarcodeModal && (
        <BarcodeScannerModal
          onAddMeal={(foodItem) => {
            if (onQuickMealAdd) {
              onQuickMealAdd({
                category: 'Öğün',
                name: foodItem.name,
                calories: foodItem.calories,
                protein: foodItem.protein,
                carbs: foodItem.carbs,
                fat: foodItem.fat
              });
            }
            setShowBarcodeModal(false);
          }}
          onClose={() => setShowBarcodeModal(false)}
        />
      )}

      {showStoryModal && (
        <AthleteStoryCardModal
          workoutResult={doneToday[0]?.payload || { name: plan?.name }}
          profile={profile}
          streak={g.streak?.current || 1}
          readinessScore={readiness.score}
          onClose={() => setShowStoryModal(false)}
        />
      )}
    </div>
  );
}
