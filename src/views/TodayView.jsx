import React, { useState } from 'react';
import { Activity, Sparkles, Flame, Shield, ShieldCheck } from 'lucide-react';
import AthleteHeaderBar from '../components/AthleteHeaderBar.jsx';
import HeroWorkoutCard from '../components/HeroWorkoutCard.jsx';
import DailyTelemetryCard from '../components/DailyTelemetryCard.jsx';
import AthleteToolsLaunchpad from '../components/AthleteToolsLaunchpad.jsx';
import DailyCheckin from '../components/DailyCheckin.jsx';
import MuscleRecoveryMap from '../components/MuscleRecoveryMap.jsx';
import SubscriptionModal from '../components/SubscriptionModal.jsx';
import BarcodeScannerModal from '../components/BarcodeScannerModal.jsx';
import AthleteStoryCardModal from '../components/AthleteStoryCardModal.jsx';
import StreakVaultModal from '../components/StreakVaultModal.jsx';
import { getWorkoutForDay } from '../lib/workoutPlans.js';
import { calculateCalories, today } from '../lib/calculations.js';
import { calculateGamification } from '../lib/streaks.js';
import { calculateReadiness } from '../lib/readinessEngine.js';
import { sounds } from '../lib/audio.js';
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
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [biometricTab, setBiometricTab] = useState('recovery'); // 'recovery' | 'checkin'

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
  const streak = g.streak || { current: 0 };
  const hasStreakAtRisk = !streak.loggedToday && streak.current > 0;

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

      {/* 2. DİNAMİK SERİ KORUMA HATIRLATICISI (KUTSAL SERİ ŞERİDİ) */}
      {streak.current > 0 && (
        <div
          className={`fx-streakAuraBar ${hasStreakAtRisk ? 'risk' : 'safe'}`}
          onClick={() => {
            sounds.tap();
            setShowStreakModal(true);
          }}
          role="button"
          tabIndex={0}
        >
          <div className="fx-streakAuraLeft">
            <div className="fx-streakMiniFlame">
              <Flame size={16} className={hasStreakAtRisk ? 'flame-risk' : 'flame-safe'} />
            </div>
            <div>
              <strong className="fx-streakAuraTitle">
                {streak.current} Gün Kesintisiz Seri
              </strong>
              <small className="fx-streakAuraSub">
                {streak.loggedToday
                  ? 'Bugünkü seri kilitlendi · Yarın aynı saatte devam!'
                  : streak.shieldUsed
                  ? 'Dinlenme kalkanı devrede · Serin korundu.'
                  : '⚠️ Henüz seans kaydetmedin · Serini koru veya kalkan kullan!'}
              </small>
            </div>
          </div>
          <button type="button" className="fx-streakAuraActionBtn">
            {streak.shieldUsed ? <ShieldCheck size={13} /> : <Shield size={13} />}
            <span>Kasayı Aç</span>
          </button>
        </div>
      )}

      {/* 3. GÜNÜN ODAĞI: ANTRENMAN VE HAZIRLIK HERO KARTI */}
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

      {/* 4. GÜNLÜK HEDEFLER & HİDRASYON KOKPİTİ (3 HALKA + HIZLI YAKIT) */}
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

      {/* 5. HIZLI SPORCU LABORATUVARI (4 TEMİZ AKSİYON KAROSU) */}
      <AthleteToolsLaunchpad
        onOpenBarcode={() => setShowBarcodeModal(true)}
        onNavigate={onNavigate}
      />

      {/* 6. TOPARLANMA & SABAH BİYOMETRİSİ (ZARİF GEÇİŞLİ ELİT KAPSÜL) */}
      <div className="fx-zenRecoverySection">
        <div className="fx-biometricTabHeader">
          <div className="fx-biometricTabGroup">
            <button
              type="button"
              className={`fx-biometricTabBtn ${biometricTab === 'recovery' ? 'active' : ''}`}
              onClick={() => {
                sounds.tap();
                setBiometricTab('recovery');
              }}
            >
              <Activity size={14} />
              <span>Kas Toparlanma Haritası</span>
            </button>
            {isToday && (
              <button
                type="button"
                className={`fx-biometricTabBtn ${biometricTab === 'checkin' ? 'active' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setBiometricTab('checkin');
                }}
              >
                <Sparkles size={14} />
                <span>20 Sn Check-in</span>
              </button>
            )}
          </div>
        </div>

        {biometricTab === 'recovery' ? (
          <div className="animate-fade-in">
            <MuscleRecoveryMap entries={entries} day={day} />
          </div>
        ) : (
          isToday && (
            <div className="animate-fade-in">
              <DailyCheckin
                day={day}
                profile={profile}
                entries={entries}
                target={target}
                todayPlan={plan}
                onStartWorkout={onStartWorkout}
                onSave={(payload) => {
                  onSaveCheckin(payload);
                  setBiometricTab('recovery');
                }}
                onRemove={onRemoveCheckin}
              />
            </div>
          )
        )}
      </div>

      {/* MODALLAR */}
      {showStreakModal && (
        <StreakVaultModal
          streak={streak}
          onClose={() => setShowStreakModal(false)}
        />
      )}

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
