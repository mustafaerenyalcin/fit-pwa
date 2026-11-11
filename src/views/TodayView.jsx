import React from 'react';
import { Play, CheckCircle2, Droplets, Plus, Utensils, ChevronRight, Moon, Dumbbell } from 'lucide-react';
import DailyCheckin from '../components/DailyCheckin.jsx';
import StreakBar from '../components/StreakBar.jsx';
import MuscleRecoveryMap from '../components/MuscleRecoveryMap.jsx';
import { Card, Ring } from '../components/ui.jsx';
import { getWorkoutForDay } from '../lib/workoutPlans.js';
import { calculateCalories, today } from '../lib/calculations.js';

export default function TodayView({
  day,
  profile,
  entries,
  target,
  totals,
  onStartWorkout,
  onNavigate,
  onQuickWaterAdd,
  onSaveCheckin,
  onRemoveCheckin
}) {
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

  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'İyi geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  return (
    <div className="fx-today">
      {isToday && (
        <p className="fx-greeting">
          {greeting}, <b>{profile.name || 'şampiyon'}</b> 👋
        </p>
      )}

      {/* 0. Seri (Streak), Seviye ve Rozet Çubuğu */}
      <StreakBar entries={entries} target={target} />

      {/* 1. Günlük özet halkaları */}
      <div className="fx-summary">
        <button type="button" className="fx-summaryItem" onClick={() => onNavigate('nutrition')}>
          <Ring value={totals.calories} max={targetCalories} size={62} stroke={6}>
            <b>{Math.round((totals.calories / targetCalories) * 100) || 0}%</b>
          </Ring>
          <span>
            <b>{totals.calories}</b>
            <small>/ {targetCalories} kcal</small>
          </span>
        </button>
        <button type="button" className="fx-summaryItem" onClick={() => onNavigate('nutrition')}>
          <Ring value={totals.protein} max={target.protein} size={62} stroke={6} color="#7ee0ff">
            <b>{Math.round((totals.protein / target.protein) * 100) || 0}%</b>
          </Ring>
          <span>
            <b>{totals.protein} g</b>
            <small>/ {target.protein} g protein</small>
          </span>
        </button>
        <button type="button" className="fx-summaryItem" onClick={() => onNavigate('training')}>
          <Ring value={weekDone} max={weekGoal} size={62} stroke={6} color="#ffb86b">
            <b>
              {weekDone}/{weekGoal}
            </b>
          </Ring>
          <span>
            <b>Bu hafta</b>
            <small>antrenman</small>
          </span>
        </button>
      </div>

      {/* 2. AI check-in (sadece bugün için) */}
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

      {/* 3. Programdaki antrenman */}
      <Card
        title={doneToday.length ? 'Antrenman tamamlandı' : isRest ? 'Dinlenme günü' : 'Programdaki antrenman'}
        subtitle={doneToday.length ? doneToday.map((w) => w.payload?.name).join(', ') : plan?.name}
        action={
          doneToday.length ? (
            <CheckCircle2 size={22} className="fx-accentIcon" />
          ) : !isRest ? (
            <button type="button" className="fx-btn fx-btn--primary" onClick={() => onStartWorkout(plan)}>
              <Play size={16} fill="currentColor" /> Başla
            </button>
          ) : (
            <Moon size={20} className="fx-mutedIcon" />
          )
        }
      >
        {!doneToday.length && !isRest && (
          <div className="fx-chipsInline">
            {plan.moves.slice(0, 6).map((m) => (
              <span key={m.name} className="fx-tag">
                {m.name}
              </span>
            ))}
          </div>
        )}
        {!doneToday.length && isRest && plan?.tips?.length > 0 && <p className="fx-muted fx-small">{plan.tips[0]}</p>}
        <button type="button" className="fx-linkRow" onClick={() => onNavigate('training')}>
          <Dumbbell size={15} /> Tüm program <ChevronRight size={16} />
        </button>
      </Card>

      {/* 4. Hızlı işlemler */}
      <div className="fx-quick">
        <Card className="fx-water">
          <div className="fx-waterHead">
            <Droplets size={18} />
            <div>
              <b>{(water / 1000).toFixed(water % 1000 ? 2 : 1)} L</b>
              <small>/ {(target.water / 1000).toFixed(1)} L su</small>
            </div>
          </div>
          <div className="fx-waterBar">
            <span style={{ width: `${Math.min(100, (water / target.water) * 100)}%` }} />
          </div>
          <div className="fx-waterBtns">
            <button type="button" className="fx-chip" onClick={() => onQuickWaterAdd(250)}>
              <Plus size={14} /> 1 bardak
            </button>
            <button type="button" className="fx-chip" onClick={() => onQuickWaterAdd(500)}>
              <Plus size={14} /> 500 ml
            </button>
          </div>
        </Card>

        <button type="button" className="fx-card fx-quickMeal" onClick={() => onNavigate('nutrition')}>
          <Utensils size={20} />
          <b>Öğün ekle</b>
          <small>Yaz ya da fotoğrafla</small>
        </button>
      </div>

      {/* 5. İnteraktif Kas Toparlanma Haritası */}
      <MuscleRecoveryMap entries={entries} day={day} />
    </div>
  );
}
