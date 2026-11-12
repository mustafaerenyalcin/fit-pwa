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
  const { t, locale } = useI18n();
  const [showSubModal, setShowSubModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [biometricTab, setBiometricTab] = useState('recovery'); // 'recovery' | 'checkin'

  // Hızlı eylem çekmecesinden veya dış tetikleyiciden 20sn check-in açma dinleyicisi
  React.useEffect(() => {
    const handleOpenCheckin = () => {
      setBiometricTab('checkin');
      const el = document.querySelector('.fx-zenRecoverySection');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('fit-open-checkin', handleOpenCheckin);
    return () => window.removeEventListener('fit-open-checkin', handleOpenCheckin);
  }, []);

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
  const hasStreakAtRisk = !streak.loggedToday && !streak.shieldUsed && streak.current > 0;

  // Günün Yerel Tarih Başlığı (Örn: "12 KASIM ÇARŞAMBA" / "THURSDAY, NOV 12")
  const dateFormatted = new Date(day + 'T12:00:00')
    .toLocaleDateString(locale || 'tr-TR', {
      day: 'numeric',
      month: 'long',
      weekday: 'long'
    })
    .toLocaleUpperCase(locale || 'tr-TR');

  return (
    <div className="fx-zenTodayContainer animate-fade-in">
      {/* 0. ANA SAYFA MİKRO KOKPİT ŞERİDİ */}
      <div className="fx-homeEyebrowBar">
        <span className="fx-homeDateBadge">{dateFormatted}</span>
        <span className="fx-homeTag">{t('home.commandCenter')}</span>
      </div>

      {/* 1. SEVİYE, SERİ & AI ENERJİ SPORCU BAŞLIĞI */}
      <AthleteHeaderBar
        entries={entries}
        profile={profile}
        target={target}
        greeting={greeting}
        onOpenSubscription={() => setShowSubModal(true)}
      />

      {/* 2. DİNAMİK SERİ KORUMA HATIRLATICISI (YALNIZCA SERİ GERÇEKTEN TEHLİKEDE İSE GÖRÜNÜR) */}
      {hasStreakAtRisk && (
        <div
          className="fx-streakAuraBar risk"
          onClick={() => {
            sounds.tap();
            setShowStreakModal(true);
          }}
          role="button"
          tabIndex={0}
        >
          <div className="fx-streakAuraLeft">
            <div className="fx-streakMiniFlame">
              <Flame size={16} className="flame-risk" />
            </div>
            <div>
              <strong className="fx-streakAuraTitle">
                {t('home.streakRiskTitle', { count: streak.current })}
              </strong>
              <small className="fx-streakAuraSub">
                {t('home.streakRiskSub')}
              </small>
            </div>
          </div>
          <button type="button" className="fx-streakAuraActionBtn">
            <Shield size={13} />
            <span>{t('home.openShield')}</span>
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
              <span>{t('home.recoveryMapTab')}</span>
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
                <span>{t('home.checkinTab')}</span>
              </button>
            )}
          </div>
        </div>

        <div className="fx-biometricTabContent">
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
