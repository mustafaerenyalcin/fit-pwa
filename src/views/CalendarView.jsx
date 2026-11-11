import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import Panel from '../components/Panel.jsx';
import { getWorkoutForDay } from '../lib/workoutPlans.js';
import { getWeekDates } from '../lib/calculations.js';
import { calculateWorkoutVolume } from '../lib/exerciseStats.js';

export default function CalendarView({
  day,
  setDay,
  profile,
  entries,
  onNavigateToTraining
}) {
  const weekDates = getWeekDates(day);

  // Calculate week stats
  let completedWorkouts = 0;
  let totalWeekVolume = 0;

  weekDates.forEach((w) => {
    const workouts = entries.workout.filter((e) => e.day === w.date);
    if (workouts.length > 0) {
      completedWorkouts++;
      workouts.forEach((item) => {
        totalWeekVolume += calculateWorkoutVolume(item.payload?.sets || {});
      });
    }
  });

  return (
    <div className="calendarView">
      <div className="intro">
        <h2>Haftalık Spor Takvimi ve Plan</h2>
        <p>
          Haftalık 5 günlük antrenman ritmini ve dinlenme günlerini takip et. Günlerin üzerine
          dokunarak ilgili günün antrenmanına gidebilir ve performansını inceleyebilirsin.
        </p>
      </div>

      {/* Week Grid */}
      <div className="calendarGrid">
        {weekDates.map((item, idx) => {
          const isSelected = item.date === day;
          const dayWorkouts = entries.workout.filter((e) => e.day === item.date);
          const isDone = dayWorkouts.length > 0;

          // Determine plan for that day (AI programı varsa o kullanılır)
          const plan = getWorkoutForDay(profile.training || 'home', idx);
          const dayPlanName = plan?.name || (idx < 5 ? 'Antrenman' : 'Dinlenme');
          const dayFocus = plan?.focus || '';

          return (
            <button
              key={item.date}
              type="button"
              className={`dayTile ${isSelected ? 'today' : ''} ${isDone ? 'doneTile' : ''}`}
              onClick={() => {
                setDay(item.date);
                if (idx < 5) {
                  onNavigateToTraining();
                }
              }}
            >
              <div className="dayTileHeader">
                <small>{item.dayName}</small>
                {isDone && <CheckCircle2 size={16} className="doneIcon" />}
              </div>

              <strong>{item.dayNumber}</strong>
              <span className="dayFocusText">{dayFocus}</span>

              <b className={isDone ? 'success' : ''}>
                {isDone
                  ? `${dayWorkouts.length} Antrenman Yapıldı`
                  : idx < 5
                  ? 'Planlandı'
                  : 'Aktif Dinlenme'}
              </b>
            </button>
          );
        })}
      </div>

      {/* Weekly Performance Summary */}
      <div className="twoCols">
        <Panel title="Bu Haftanın Özeti" sub="Gerçek kayıtlarından hesaplanan performans">
          <div className="statusRow">
            <span>Tamamlanan Antrenman</span>
            <b>{completedWorkouts} / 5 Gün</b>
          </div>
          <div className="statusRow">
            <span>Toplam Kaldırılan Hacim</span>
            <b>{totalWeekVolume > 0 ? `${totalWeekVolume.toLocaleString('tr-TR')} kg` : '0 kg'}</b>
          </div>
          <div className="statusRow">
            <span>Dinlenme Günü Durumu</span>
            <b>{completedWorkouts >= 5 ? 'Hedef Tamamlandı' : `${5 - completedWorkouts} seans planlandı`}</b>
          </div>

          <p className="smallHelp">
            Beş günlük program bilimsel hipertrofi için idealdir. Ancak yorgunluk, stres veya eklem
            ağrısı hissettiğinde dinlenme günlerini esnetebilirsin.
          </p>
        </Panel>

        <Panel title="Haftalık Dinlenme ve Toparlanma">
          <div className="priority">
            <div className="number">01</div>
            <div>
              <b>Hafta Sonu Aktif Dinlenme</b>
              <span>Cumartesi hafif tempolu yürüyüş ve esneme kaslardaki kan akışını hızlandırır.</span>
            </div>
          </div>
          <div className="priority">
            <div className="number">02</div>
            <div>
              <b>Pazar Tam Dinlenme</b>
              <span>Ağır fiziksel efordan kaçın, yeni haftanın protein ve öğünlerini planla.</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
