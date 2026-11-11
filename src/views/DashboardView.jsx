import React from 'react';
import {
  Activity,
  Dumbbell,
  Utensils,
  Target,
  Flame,
  Droplets,
  Moon,
  Footprints,
  CalendarDays,
  ArrowRight,
  Play,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Plus,
  Info,
  Award,
  Clock
} from 'lucide-react';
import Metric from '../components/Metric.jsx';
import Panel from '../components/Panel.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import FitnessRings from '../components/FitnessRings.jsx';
import DailyCheckin from '../components/DailyCheckin.jsx';
import { getWorkoutForDay } from '../lib/workoutPlans.js';
import { calculateCalories, calculateMacros, calculateWaistToHeightRatio, calculateBMI } from '../lib/calculations.js';
import { calculateWorkoutVolume } from '../lib/exerciseStats.js';

export default function DashboardView({
  day,
  profile,
  entries,
  target,
  totals,
  onStartWorkout,
  onNavigate,
  onQuickWaterAdd
}) {
  const currentDayIndex = (new Date(day + 'T12:00:00').getDay() + 6) % 7;
  const todayWorkoutPlan = getWorkoutForDay(profile.training || 'home', currentDayIndex);
  const isTodayWorkoutDone = entries.workout.some((e) => e.day === day);

  // Weekly workout completed count & volume (Monday to Sunday)
  const monday = new Date(day + 'T12:00:00');
  monday.setDate(monday.getDate() - currentDayIndex);

  let weeklyCompletedCount = 0;
  let weeklyTotalVolume = 0;
  let weeklyTotalDurationSeconds = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayWorkouts = entries.workout.filter((e) => e.day === iso);

    if (dayWorkouts.length > 0) {
      weeklyCompletedCount++;
      dayWorkouts.forEach((w) => {
        weeklyTotalVolume += calculateWorkoutVolume(w.payload?.sets || {});
        weeklyTotalDurationSeconds += Number(w.payload?.durationSeconds || 0);
      });
    }
  }

  // Weight progression
  const latestWeight = entries.weight[0]?.payload?.weight || profile.weight || 77;
  const initialWeight = Number(profile.weight) || 77;
  const weightDiff = Math.round((latestWeight - initialWeight) * 10) / 10;
  const latestWaist = entries.weight[0]?.payload?.waist;

  // Waist-to-Height Ratio (Abs Visibility standard)
  const waistRatioData = latestWaist
    ? calculateWaistToHeightRatio(latestWaist, profile.height || 180)
    : null;

  const bmiData = calculateBMI(latestWeight, profile.height || 180);

  // Calorie calculations
  const targetCalories = calculateCalories(profile) || 2400;
  const targetMacros = calculateMacros(profile, targetCalories);
  const remainingCalories = Math.max(0, targetCalories - totals.calories);
  const remainingProtein = Math.max(0, target.protein - totals.protein);

  // Today habits
  const todayHabit = entries.habit.find((e) => e.day === day)?.payload || {};
  const todayWater = Number(todayHabit.water || 0);
  const todaySleep = Number(todayHabit.sleep || 0);
  const todaySteps = Number(todayHabit.steps || 0);

  // Dynamic daily AI advice based on status
  const getDynamicCoachAdvice = () => {
    if (todayWorkoutPlan && !isTodayWorkoutDone) {
      return `Bugün ${todayWorkoutPlan.name} planlandı. Omuz ve karın kası gelişimini maksimize etmek için setlerde 1–2 tekrar rezervde (RIR) bırak, formu bozma.`;
    }
    if (isTodayWorkoutDone) {
      if (totals.protein < target.protein) {
        return `Harika seans! Bugünkü antrenmanını tamamladın. Kas liflerinin hipertrofisi için kalan ${remainingProtein} g protein hedefine ulaşmayı unutma.`;
      }
      return 'Bugünkü antrenmanını ve protein hedefini başarıyla tamamladın! Şimdi 7–9 saatlik derin uyku ile toparlanmaya odaklan.';
    }
    return 'Haftalık hedeflerine doğru ilerliyorsun. Bol su içmeyi ve hareketli kalmayı unutma.';
  };

  return (
    <div className="dashboardView">
      {/* 1. Daily Personalized Greeting */}
      <div className="dashboardGreeting">
        <div>
          <h2>Merhaba, {profile.name || 'Eren'}! 👋</h2>
          <p className="mutedText">
            Hedefin: <b>{profile.focus === 'shoulders-abs' ? 'Geniş Omuz & Belirgin Karın' : profile.focus || 'Atletik Vücut'}</b>.
            Her gün düzenli giriş yaparak formunu zirveye taşı.
          </p>
        </div>
      </div>

      {/* 2. Interactive AI Daily Readiness & Mood Check-in */}
      <DailyCheckin
        day={day}
        profile={profile}
        entries={entries}
        todayWorkout={todayWorkoutPlan}
        onStartWorkout={onStartWorkout}
      />

      {/* 3. Top Banner Grid: Hero Workout Card & Apple Fitness Concentric Rings */}
      <div className="heroDashboardGrid">
        <div className="heroDashboard">
          <div className="heroContent">
            <div className="eyebrowBadge">
              <Sparkles size={14} /> GÜNLÜK AKILLI ASİSTAN
            </div>
            <h2>
              Bugün: <em>{todayWorkoutPlan?.name || 'Dinlenme Günü'}</em>
            </h2>
            <p>
              {todayWorkoutPlan
                ? `Hedef: ${todayWorkoutPlan.focus}. Omuz ve karın kaslarını şekillendirmek için seansı başlat.`
                : 'Aktif dinlenme: Hafif yürüyüş, esneme ve yeterli protein alımı ile kaslarını toparla.'}
            </p>

            <div className="heroActions">
              {todayWorkoutPlan && !isTodayWorkoutDone ? (
                <button
                  type="button"
                  className="primary heroStartBtn"
                  onClick={() => onStartWorkout(todayWorkoutPlan)}
                >
                  <Play size={18} fill="currentColor" /> Antrenmana Başla
                </button>
              ) : isTodayWorkoutDone ? (
                <div className="completedNotice">
                  <CheckCircle2 size={20} /> Bugünkü antrenman tamamlandı!
                </div>
              ) : null}

              <button
                type="button"
                className="secondary heroSecBtn"
                onClick={() => onNavigate('training')}
              >
                Programı İncele <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="heroIconShape">
            <Dumbbell size={160} strokeWidth={0.9} />
          </div>
        </div>

        {/* Concentric Activity Rings */}
        <FitnessRings
          workoutDone={weeklyCompletedCount}
          workoutTarget={5}
          proteinCurrent={totals.protein}
          proteinTarget={target.protein}
          waterCurrent={todayWater}
          waterTarget={target.water}
        />
      </div>

      {/* Top 4 Key Metrics */}
      <div className="metrics four">
        <Metric
          label="GÜNCEL KİLO"
          value={`${latestWeight} kg`}
          extra={
            weightDiff !== 0
              ? `${weightDiff > 0 ? '+' : ''}${weightDiff} kg (başlangıç: ${initialWeight})`
              : 'Başlangıç kilosu'
          }
          icon={Target}
        />
        <Metric
          label="GÜNLÜK KALORİ HEDEFİ"
          value={`${targetCalories} kcal`}
          extra={`${totals.calories} kcal tüketildi · ${remainingCalories} kcal kaldı`}
          icon={Flame}
        />
        <Metric
          label="GÜNLÜK PROTEİN HEDEFİ"
          value={`${target.protein} g`}
          extra={`${totals.protein} g alındı · ${remainingProtein} g kaldı`}
          icon={Utensils}
        />
        <Metric
          label="HAFTALIK ANTRENMAN"
          value={`${weeklyCompletedCount} / 5 gün`}
          extra={weeklyCompletedCount >= 5 ? 'Haftalık hedef tamamlandı!' : `${5 - weeklyCompletedCount} gün kaldı`}
          icon={Dumbbell}
        />
      </div>

      {/* Two Column Grid: Nutrition & Today's Life */}
      <div className="twoCols">
        {/* Nutrition Panel */}
        <Panel
          title="Beslenme ve Makro Durumu"
          sub={`${day} · Alınan kaloriler ve makrolar`}
          action={
            <button
              type="button"
              className="inlineAction"
              onClick={() => onNavigate('nutrition')}
            >
              Öğün Ekle <ArrowRight size={15} />
            </button>
          }
        >
          <div className="macroProgressContainer">
            <div className="macroCard">
              <div className="macroTop">
                <span className="macroLabel">Kalori</span>
                <span className="macroNums">
                  <b>{totals.calories}</b> / {targetCalories} kcal
                </span>
              </div>
              <ProgressBar current={totals.calories} target={targetCalories} color="#b3f46f" />
              <small className="mutedText">{remainingCalories} kcal kaldı</small>
            </div>

            <div className="macroCard">
              <div className="macroTop">
                <span className="macroLabel">Protein</span>
                <span className="macroNums">
                  <b>{totals.protein}</b> / {target.protein} g
                </span>
              </div>
              <ProgressBar current={totals.protein} target={target.protein} color="#7ee787" />
              <small className="mutedText">{remainingProtein} g protein kaldı</small>
            </div>

            <div className="macroSubGrid">
              <div className="subMacro">
                <span>Karbonhidrat</span>
                <b>{totals.carbs} g</b>
                <small className="mutedText">Hedef: ~{targetMacros.carbs || 250} g</small>
              </div>
              <div className="subMacro">
                <span>Sağlıklı Yağ</span>
                <b>{totals.fat} g</b>
                <small className="mutedText">Hedef: ~{target.fat} g</small>
              </div>
              <div className="subMacro">
                <span>Öğün Sayısı</span>
                <b>{entries.meal.filter((m) => m.day === day).length} Öğün</b>
                <small className="mutedText">Bugün kaydedilen</small>
              </div>
            </div>
          </div>
        </Panel>

        {/* Daily Habits & Recovery Panel */}
        <Panel
          title="Sağlıklı Yaşam & Alışkanlıklar"
          sub="Su, uyku, adım ve günlük toparlanma"
          action={
            <button
              type="button"
              className="inlineAction"
              onClick={() => onNavigate('habits')}
            >
              Düzenle <ArrowRight size={15} />
            </button>
          }
        >
          <div className="habitsQuickList">
            {/* Water row */}
            <div className="habitQuickItem">
              <div className="habitIcon waterIcon">
                <Droplets size={20} />
              </div>
              <div className="habitInfo">
                <div className="habitHeader">
                  <b>İçilen Su</b>
                  <span>
                    <strong>{todayWater} ml</strong> / {target.water} ml
                  </span>
                </div>
                <ProgressBar current={todayWater} target={target.water} color="#58a6ff" />
              </div>
              <div className="quickAddWater">
                <button
                  type="button"
                  className="quickAddBtn"
                  onClick={() => onQuickWaterAdd(250)}
                  title="+250 ml su ekle"
                >
                  +250ml
                </button>
                <button
                  type="button"
                  className="quickAddBtn"
                  onClick={() => onQuickWaterAdd(500)}
                  title="+500 ml su ekle"
                >
                  +500ml
                </button>
              </div>
            </div>

            {/* Sleep row */}
            <div className="habitQuickItem">
              <div className="habitIcon sleepIcon">
                <Moon size={20} />
              </div>
              <div className="habitInfo">
                <div className="habitHeader">
                  <b>Uyku Süresi</b>
                  <span>
                    <strong>{todaySleep || '—'} saat</strong> (Hedef: 7–9 saat)
                  </span>
                </div>
                <ProgressBar current={todaySleep} target={8} color="#bc8cff" />
              </div>
            </div>

            {/* Steps row */}
            <div className="habitQuickItem">
              <div className="habitIcon stepsIcon">
                <Footprints size={20} />
              </div>
              <div className="habitInfo">
                <div className="habitHeader">
                  <b>Günlük Adım</b>
                  <span>
                    <strong>{todaySteps.toLocaleString('tr-TR')}</strong> / {target.steps.toLocaleString('tr-TR')}
                  </span>
                </div>
                <ProgressBar current={todaySteps} target={target.steps} color="#f0883e" />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Weekly Scorecard & Composition Insights */}
      <div className="twoCols">
        <Panel title="Haftalık Performans Karnesi" sub="Pazartesi'den Pazar'a toplam spor istatistikleri">
          <div className="scorecardGrid">
            <div className="scorecardItem">
              <Award size={20} />
              <span className="lbl">Kaldırılan Toplam Tonaj</span>
              <strong>{weeklyTotalVolume > 0 ? `${weeklyTotalVolume.toLocaleString('tr-TR')} kg` : '0 kg'}</strong>
            </div>

            <div className="scorecardItem">
              <Clock size={20} />
              <span className="lbl">Toplam Antrenman Süresi</span>
              <strong>
                {weeklyTotalDurationSeconds > 0
                  ? `${Math.floor(weeklyTotalDurationSeconds / 60)} dakika`
                  : '—'}
              </strong>
            </div>

            <div className="scorecardItem">
              <Activity size={20} />
              <span className="lbl">BMI (Vücut Kitle İndeksi)</span>
              <strong>{bmiData.bmi} ({bmiData.label})</strong>
            </div>
          </div>
        </Panel>

        <Panel title="Karın ve Omuz Hedef Durumu" sub="Vücut kompozisyonu altın oranları">
          {waistRatioData ? (
            <div className="waistMetricBox">
              <div className="waistMetricTop">
                <div>
                  <span className="lbl">Bel / Boy Oranı (WHtR)</span>
                  <strong>{waistRatioData.ratio}</strong>
                </div>
                <span className="badge success">{waistRatioData.status}</span>
              </div>
              <ProgressBar current={waistRatioData.score} target={100} color="#b3f46f" />
              <small className="mutedText">
                180 cm boy için {latestWaist} cm bel ölçüsü. İdeal atletik karın kası görünürlüğü için
                oran 0.48 altındadır.
              </small>
            </div>
          ) : (
            <div className="waistEmptyBox">
              <p>Gelişim bölümünden ilk bel çevreni eklediğinde karın kası belirginlik analizi burada aktifleşir.</p>
              <button type="button" className="inlineAction" onClick={() => onNavigate('progress')}>
                Bel Ölçüsü Ekle <ArrowRight size={15} />
              </button>
            </div>
          )}
        </Panel>
      </div>

      {/* Fit AI Daily Coach Tip */}
      <div className="coachTipCard">
        <div className="coachTipHeader">
          <Sparkles size={20} className="coachSparkle" />
          <b>Fit AI Koç Günlük Önerisi</b>
        </div>
        <p>{getDynamicCoachAdvice()}</p>
        <button
          type="button"
          className="coachChatLink"
          onClick={() => onNavigate('coach')}
        >
          Koça soru sor veya programı optimize et →
        </button>
      </div>
    </div>
  );
}
