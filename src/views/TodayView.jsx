import React from 'react';
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
  Camera
} from 'lucide-react';
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
  onQuickMealAdd,
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

  const remCalories = Math.max(0, targetCalories - totals.calories);
  const remProtein = Math.max(0, (target.protein || 140) - totals.protein);
  const calPct = Math.min(100, Math.round((totals.calories / targetCalories) * 100) || 0);
  const proPct = Math.min(100, Math.round((totals.protein / (target.protein || 140)) * 100) || 0);
  const waterPct = Math.min(100, Math.round((water / (target.water || 2500)) * 100) || 0);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'İyi geceler' : hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  return (
    <div className="fx-today">
      {/* Üst Karşılama & Hedef Rozeti */}
      <div className="fx-todayHeader">
        <div>
          <p className="fx-greeting">
            {greeting}, <b>{profile.name || 'Şampiyon'}</b> 👋
          </p>
          <span className="fx-todaySub">
            {remProtein > 0
              ? `Hedefe ${remProtein}g protein ve ${remCalories} kcal kaldı`
              : 'Günlük protein hedefin tamamlandı, harika gidiyorsun!'}
          </span>
        </div>
        <button type="button" className="fx-coachShortcut" onClick={() => onNavigate('coach')}>
          <Sparkles size={14} /> AI Koça Sor
        </button>
      </div>

      {/* 0. Seri (Streak), Seviye ve Rozet Çubuğu */}
      <StreakBar entries={entries} target={target} />

      {/* 1. Komuta Merkezi (Apple Fitness + MacroFactor Bento Kartı) */}
      <div className="fx-commandHero">
        <div className="fx-commandRingsRow">
          <button type="button" className="fx-summaryItem" onClick={() => onNavigate('nutrition')}>
            <Ring value={totals.calories} max={targetCalories} size={64} stroke={6}>
              <b>{calPct}%</b>
            </Ring>
            <span>
              <b>{totals.calories}</b>
              <small>/ {targetCalories} kcal</small>
            </span>
          </button>

          <button type="button" className="fx-summaryItem" onClick={() => onNavigate('nutrition')}>
            <Ring value={totals.protein} max={target.protein} size={64} stroke={6} color="#7ee0ff">
              <b>{proPct}%</b>
            </Ring>
            <span>
              <b>{totals.protein} g</b>
              <small>/ {target.protein} g protein</small>
            </span>
          </button>

          <button type="button" className="fx-summaryItem" onClick={() => onNavigate('training')}>
            <Ring value={weekDone} max={weekGoal} size={64} stroke={6} color="#ffb86b">
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

        {/* Canlı Hidrasyon & Hızlı Aksiyon Barı */}
        <div className="fx-commandQuickGrid">
          <div className="fx-commandWaterBox">
            <div className="fx-waterHead">
              <Droplets size={18} />
              <div>
                <b>{(water / 1000).toFixed(water % 1000 ? 2 : 1)} L</b>
                <small>/ {(target.water / 1000).toFixed(1)} L su ({waterPct}%)</small>
              </div>
            </div>
            <div className="fx-waterBar">
              <span style={{ width: `${waterPct}%` }} />
            </div>
            <div className="fx-waterBtns">
              <button type="button" className="fx-chip" onClick={() => onQuickWaterAdd(250)}>
                <Plus size={13} /> 250 ml
              </button>
              <button type="button" className="fx-chip" onClick={() => onQuickWaterAdd(500)}>
                <Plus size={13} /> 500 ml
              </button>
            </div>
          </div>

          <div className="fx-commandMealBox">
            <div className="fx-commandMealHead">
              <span>
                <Utensils size={15} /> <b>1-Tık Hızlı Beslenme</b>
              </span>
              <button type="button" className="fx-linkMini" onClick={() => onNavigate('nutrition')}>
                <Camera size={13} /> AI Kamera
              </button>
            </div>
            <div className="fx-quickProteinChips">
              {onQuickMealAdd && (
                <>
                  <button
                    type="button"
                    className="fx-chip fx-chip--accent"
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
                    <Zap size={13} /> +26g Whey
                  </button>
                  <button
                    type="button"
                    className="fx-chip"
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
                    <Plus size={13} /> +18g Yoğurt
                  </button>
                </>
              )}
              <button type="button" className="fx-chip" onClick={() => onNavigate('nutrition')}>
                <Flame size={13} /> Öğün Yaz
              </button>
            </div>
          </div>
        </div>
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
        title={doneToday.length ? 'Antrenman Tamamlandı' : isRest ? 'Aktif Dinlenme & Mobilite Günü' : 'Günün Programlı Antrenmanı'}
        subtitle={doneToday.length ? doneToday.map((w) => w.payload?.name).join(', ') : plan?.name}
        action={
          doneToday.length ? (
            <CheckCircle2 size={22} className="fx-accentIcon" />
          ) : !isRest ? (
            <button type="button" className="fx-btn fx-btn--primary" onClick={() => onStartWorkout(plan)}>
              <Play size={16} fill="currentColor" /> Antrenmana Başla
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
                {m.name} {m.sets ? `· ${m.sets}` : ''}
              </span>
            ))}
          </div>
        )}
        {!doneToday.length && isRest && plan?.tips?.length > 0 && <p className="fx-muted fx-small">{plan.tips[0]}</p>}
        <button type="button" className="fx-linkRow" onClick={() => onNavigate('training')}>
          <Dumbbell size={15} /> Tüm haftalık programı ve özel rutinleri aç <ChevronRight size={16} />
        </button>
      </Card>

      {/* 4. İnteraktif Kas Toparlanma Haritası */}
      <MuscleRecoveryMap entries={entries} day={day} />
    </div>
  );
}
