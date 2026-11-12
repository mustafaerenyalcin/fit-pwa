import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  Droplets,
  Plus,
  Utensils,
  ChevronRight,
  Moon,
  Dumbbell,
  Flame,
  Zap,
  Sparkles,
  Camera,
  Activity,
  Users
} from 'lucide-react';
import DailyCheckin from '../components/DailyCheckin.jsx';
import StreakBar from '../components/StreakBar.jsx';
import MuscleRecoveryMap from '../components/MuscleRecoveryMap.jsx';
import UserAvatar from '../components/UserAvatar.jsx';
import ReadinessCockpitCard from '../components/ReadinessCockpitCard.jsx';
import AiEnergyPill from '../components/AiEnergyPill.jsx';
import SubscriptionModal from '../components/SubscriptionModal.jsx';
import AthleteStatusHUD from '../components/AthleteStatusHUD.jsx';
import DailyAthleteMissions from '../components/DailyAthleteMissions.jsx';
import AthleteQuickLaunchBar from '../components/AthleteQuickLaunchBar.jsx';
import BarcodeScannerModal from '../components/BarcodeScannerModal.jsx';
import { Ring } from '../components/ui.jsx';
import { getWorkoutForDay } from '../lib/workoutPlans.js';
import { calculateCalories, today } from '../lib/calculations.js';
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
  const dayIndex = (new Date(day + 'T12:00:00').getDay() + 6) % 7;
  const plan = getWorkoutForDay(profile.training || 'home', dayIndex);
  const isRest = !plan || plan.rest || !plan.moves;
  const doneToday = entries.workout.filter((e) => e.day === day);
  const isToday = day === today();

  const targetCalories = calculateCalories(profile) || 2200;
  const habit = entries.habit.find((e) => e.day === day)?.payload || {};
  const water = Number(habit.water || 0);

  // Bu hafta (Pzt-Paz) tamamlanan antrenman günleri
  const monday = new Date(day + 'T12:00:00');
  monday.setDate(monday.getDate() - dayIndex);
  const weekIso = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const weekDone = weekIso.filter((d) => entries.workout.some((w) => w.day === d)).length;
  const weekGoal = Number(profile.trainingFrequency) || 5;

  const remCalories = Math.max(0, targetCalories - totals.calories);
  const remProtein = Math.max(0, (target.protein || 140) - totals.protein);
  const calPct = Math.min(100, Math.round((totals.calories / targetCalories) * 100) || 0);
  const proPct = Math.min(100, Math.round((totals.protein / (target.protein || 140)) * 100) || 0);
  const waterPct = Math.min(100, Math.round((water / (target.water || 2500)) * 100) || 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 6
      ? t('today.greetNight')
      : hour < 12
        ? t('today.greetMorning')
        : hour < 18
          ? t('today.greetDay')
          : t('today.greetEvening');

  return (
    <div className="fx-cockpit animate-fade-in">
      {/* 1. SEVİYE, RÜTBE & XP SPORCU HUD KARTI */}
      <AthleteStatusHUD entries={entries} profile={profile} target={target} />

      {/* 2. APP STORE / PLAY STORE TARZI HIZLI FIRLATMA ÇUBUĞU */}
      <AthleteQuickLaunchBar
        plan={plan}
        onStartWorkout={onStartWorkout}
        onOpenBarcode={() => setShowBarcodeModal(true)}
        onNavigate={onNavigate}
        onQuickWaterAdd={onQuickWaterAdd}
      />

      {/* 3. GÜNLÜK SPORCU GÖREVLERİ & MEYDAN OKUMALARI */}
      <DailyAthleteMissions
        plan={plan}
        doneToday={doneToday}
        totals={totals}
        target={target}
        water={water}
        onStartWorkout={onStartWorkout}
        onNavigate={onNavigate}
        onQuickWaterAdd={onQuickWaterAdd}
      />

      {/* 4. GÜNLÜK ATLETİK HAZIRLIK TELEMETRİSİ (WHOOP & MACROFACTOR KÖPRÜSÜ) */}
      <ReadinessCockpitCard
        entries={entries}
        profile={profile}
        target={target}
        doneToday={doneToday}
      />

      {/* Asimetrik Uzamsal Bento Matrisi (Spatial Bento Grid) */}
      <div className="fx-bentoMatrix">
        {/* KART 1 (SOL GENİŞ): BİYOMETRİK ENERJİ, MAKRO & HİDRASYON KOKPİTİ */}
        <section className="fx-bentoCell fx-bentoCell--span7 fx-glassModule fx-atelierModule">
          <div className="fx-moduleTopRow">
            <span className="fx-moduleEyebrow">
              <b>01</b> // GÜNLÜK MAKRO & ENERJİ DENGESİ
            </span>
            <button type="button" className="fx-linkMini" onClick={() => onNavigate('nutrition')}>
              <Camera size={12} /> {t('today.aiCamera')} →
            </button>
          </div>

          <div className="fx-telemetryGauges">
            <button
              type="button"
              className="fx-gaugePod"
              onClick={() => onNavigate('nutrition')}
            >
              <Ring value={totals.calories} max={targetCalories} size={78} stroke={7} color="#c8ff00">
                <b className="fx-monoVal">{calPct}%</b>
              </Ring>
              <div className="fx-gaugeMeta">
                <small>ENERJİ (KCAL)</small>
                <strong className="fx-monoBig">{totals.calories}</strong>
                <span>/ {targetCalories} kcal</span>
              </div>
            </button>

            <button
              type="button"
              className="fx-gaugePod"
              onClick={() => onNavigate('nutrition')}
            >
              <Ring value={totals.protein} max={target.protein} size={78} stroke={7} color="#00f0ff">
                <b className="fx-monoVal">{proPct}%</b>
              </Ring>
              <div className="fx-gaugeMeta">
                <small>PROTEİN SENTEZİ</small>
                <strong className="fx-monoBig" style={{ color: '#00f0ff' }}>
                  {totals.protein}g
                </strong>
                <span>/ {target.protein}g hedef</span>
              </div>
            </button>

            <button
              type="button"
              className="fx-gaugePod"
              onClick={() => onNavigate('training')}
            >
              <Ring value={weekDone} max={weekGoal} size={78} stroke={7} color="#a855f7">
                <b className="fx-monoVal">
                  {weekDone}/{weekGoal}
                </b>
              </Ring>
              <div className="fx-gaugeMeta">
                <small>{t('today.thisWeek').toUpperCase()}</small>
                <strong className="fx-monoBig" style={{ color: '#c084fc' }}>
                  {weekDone} Seans
                </strong>
                <span>Hedef: {weekGoal} gün</span>
              </div>
            </button>
          </div>

          {/* Hızlı Yakıt & Hidrasyon Dock'u */}
          <div className="fx-fuelDock">
            <div className="fx-hydrationPod">
              <div className="fx-hydrationTop">
                <span>
                  <Droplets size={15} style={{ color: '#00f0ff' }} />{' '}
                  <b className="fx-monoVal">
                    {(water / 1000).toFixed(water % 1000 ? 2 : 1)}L
                  </b>{' '}
                  <small>/ {(target.water / 1000).toFixed(1)}L</small>
                </span>
                <div className="fx-miniPillPair">
                  <button type="button" onClick={() => onQuickWaterAdd(250)}>
                    +250ml
                  </button>
                  <button type="button" onClick={() => onQuickWaterAdd(500)}>
                    +500ml
                  </button>
                </div>
              </div>
              <div className="fx-cyberProgress">
                <span style={{ width: `${waterPct}%` }} />
              </div>
            </div>

            <div className="fx-quickProteinPod">
              <small className="fx-podLabel">
                <Utensils size={12} /> {t('today.quickMealTitle')}
              </small>
              <div className="fx-quickActionPills">
                {onQuickMealAdd && (
                  <>
                    <button
                      type="button"
                      className="fx-cyberChip fx-cyberChip--volt"
                      onClick={() =>
                        onQuickMealAdd({
                          name: '1 Ölçek Whey / Protein Shake',
                          calories: 130,
                          protein: 26,
                          carbs: 3,
                          fat: 2
                        })
                      }
                    >
                      <Zap size={12} /> +26g Whey
                    </button>
                    <button
                      type="button"
                      className="fx-cyberChip"
                      onClick={() =>
                        onQuickMealAdd({
                          name: '200g Süzme Yoğurt + Yulaf',
                          calories: 240,
                          protein: 18,
                          carbs: 22,
                          fat: 8
                        })
                      }
                    >
                      <Plus size={12} /> +18g Yoğurt
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="fx-cyberChip"
                  onClick={() => onNavigate('nutrition')}
                >
                  <Flame size={12} /> {t('today.logMeal')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* KART 2 (SAĞ 5 SÜTUN): ANTRENMAN STÜDYOSU (LAUNCHPAD) */}
        <section className="fx-bentoCell fx-bentoCell--span5 fx-glassModule fx-workoutLaunchpad fx-atelierLaunchpad">
          <div className="fx-moduleTopRow">
            <span className="fx-moduleEyebrow">
              <b>02</b> // ANTRENMAN STÜDYOSU
            </span>
            {doneToday.length ? (
              <span className="fx-statusPill fx-statusPill--done">
                <CheckCircle2 size={13} /> TAMAMLANDI
              </span>
            ) : isRest ? (
              <span className="fx-statusPill">
                <Moon size={13} /> RECOVERY
              </span>
            ) : (
              <span className="fx-statusPill fx-statusPill--ready">AKTİF SEANS</span>
            )}
          </div>

          <div className="fx-launchpadBody">
            <h3 className="fx-launchpadTitle">
              {doneToday.length
                ? doneToday.map((w) => w.payload?.name).join(', ')
                : plan?.name || t('today.scheduledWorkout')}
            </h3>
            <p className="fx-launchpadSub">
              {doneToday.length
                ? t('today.workoutDone')
                : isRest
                  ? plan?.tips?.[0] || t('today.restDay')
                  : `${plan?.moves?.length || 0} biyomekanik hareket · Otomatik 1RM & dinlenme sayacı`}
            </p>

            {!doneToday.length && !isRest && (
              <div className="fx-launchpadMoves">
                {plan.moves.slice(0, 5).map((m, idx) => (
                  <div key={m.name} className="fx-launchpadMoveRow">
                    <span className="fx-moveIndex">0{idx + 1}</span>
                    <b>{m.name}</b>
                    <small>{m.sets || '3 × 10'}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="fx-launchpadFooter">
            {!doneToday.length && !isRest ? (
              <button
                type="button"
                className="fx-neonActionBtn fx-solarBtn fx-btn--block"
                onClick={() => onStartWorkout(plan)}
              >
                <Play size={16} fill="currentColor" /> {t('today.startWorkout')}
              </button>
            ) : (
              <button
                type="button"
                className="fx-btn fx-btn--ghost fx-btn--block"
                onClick={() => onNavigate('training')}
              >
                <Dumbbell size={15} /> {t('today.openProgram')} <ChevronRight size={15} />
              </button>
            )}
          </div>
        </section>

        {/* KART 3 (SOL 6 SÜTUN): SABAH AI CHECK-IN & GAMIFICATION SERİ */}
        <div className="fx-bentoCell fx-bentoCell--span6 fx-stack">
          <StreakBar entries={entries} target={target} />
          {isToday && (
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
          )}
        </div>

        {/* KART 4 (SAĞ 6 SÜTUN): İNTERAKTİF ANATOMİK KAS TOPARLANMA RADARI */}
        <div className="fx-bentoCell fx-bentoCell--span6">
          <MuscleRecoveryMap entries={entries} day={day} />
        </div>
      </div>

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
    </div>
  );
}
