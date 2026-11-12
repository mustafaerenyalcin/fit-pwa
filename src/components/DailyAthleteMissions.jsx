import React from 'react';
import { Target, CheckCircle2, Play, Plus, Droplets, Utensils, Award, Zap, ChevronRight } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function DailyAthleteMissions({
  plan,
  doneToday = [],
  totals = { calories: 0, protein: 0 },
  target = { protein: 140, water: 2500 },
  water = 0,
  onStartWorkout,
  onNavigate,
  onQuickWaterAdd
}) {
  const isWorkoutDone = doneToday.length > 0;
  const isProteinDone = totals.protein >= (target.protein || 140) * 0.9;
  const isWaterDone = water >= (target.water || 2500);

  const completedCount = [isWorkoutDone, isProteinDone, isWaterDone].filter(Boolean).length;

  const handleStartWorkout = () => {
    sounds.tap();
    onStartWorkout(plan);
  };

  const handleAddWater = () => {
    sounds.chime();
    if (onQuickWaterAdd) {
      onQuickWaterAdd(250);
    }
  };

  const handleGoNutrition = () => {
    sounds.tap();
    onNavigate('nutrition');
  };

  return (
    <div className="fx-card fx-dailyMissionsCard">
      <div className="fx-missionsHeadRow">
        <div className="fx-missionsTitleGroup">
          <div className="fx-missionsBadge">
            <Target size={14} color="#ff4d1c" />
            <span>GÜNLÜK SPORCU PROTOKOLÜ</span>
          </div>
          <h3>Bugünün 3 Kritik Görevi</h3>
        </div>
        <div className="fx-missionsProgressPill">
          <b>{completedCount} / 3</b> TAMAMLANDI
        </div>
      </div>

      <div className="fx-missionsStack">
        {/* GÖREV 1: ANTRENMAN */}
        <div className={`fx-missionItem ${isWorkoutDone ? 'done' : 'pending'}`}>
          <div className="fx-missionLeft">
            <div className="fx-missionStatusIcon">
              {isWorkoutDone ? (
                <CheckCircle2 size={20} color="#c8ff00" />
              ) : (
                <span className="fx-missionIndexDot">1</span>
              )}
            </div>
            <div>
              <div className="fx-missionLabelRow">
                <b>{isWorkoutDone ? 'Günün Antrenmanı Tamamlandı' : plan.name || 'Günün Antrenmanı'}</b>
                <span className="fx-missionXpBadge">+120 XP</span>
              </div>
              <p>
                {isWorkoutDone
                  ? `Bugün ${doneToday[0]?.payload?.name || 'Seans'} başarıyla kaydedildi. Kas adaptasyonu devrede!`
                  : `${plan.focus || 'Hipertrofi'} odaklı ${plan.moves?.length || 5} biyomekanik hareket.`}
              </p>
            </div>
          </div>

          <div className="fx-missionAction">
            {isWorkoutDone ? (
              <span className="fx-missionDoneTag">TAMAMLANDI</span>
            ) : (
              <button
                type="button"
                className="fx-btn fx-solarBtn fx-btn--sm"
                onClick={handleStartWorkout}
              >
                <Play size={13} fill="currentColor" /> Başla
              </button>
            )}
          </div>
        </div>

        {/* GÖREV 2: PROTEİN */}
        <div className={`fx-missionItem ${isProteinDone ? 'done' : 'pending'}`}>
          <div className="fx-missionLeft">
            <div className="fx-missionStatusIcon">
              {isProteinDone ? (
                <CheckCircle2 size={20} color="#c8ff00" />
              ) : (
                <span className="fx-missionIndexDot">2</span>
              )}
            </div>
            <div>
              <div className="fx-missionLabelRow">
                <b>{isProteinDone ? 'Protein Hedefi Yakalandı' : 'Günlük Protein Barajı'}</b>
                <span className="fx-missionXpBadge">+60 XP</span>
              </div>
              <p>
                {totals.protein}g / {target.protein || 140}g alındı{' '}
                {!isProteinDone && `· ${Math.max(0, (target.protein || 140) - totals.protein)}g kaldı`}
              </p>
            </div>
          </div>

          <div className="fx-missionAction">
            {isProteinDone ? (
              <span className="fx-missionDoneTag">TAMAMLANDI</span>
            ) : (
              <button
                type="button"
                className="fx-btn fx-btn--ghost fx-btn--sm"
                onClick={handleGoNutrition}
              >
                <Plus size={13} /> Öğün Ekle
              </button>
            )}
          </div>
        </div>

        {/* GÖREV 3: HİDRASYON */}
        <div className={`fx-missionItem ${isWaterDone ? 'done' : 'pending'}`}>
          <div className="fx-missionLeft">
            <div className="fx-missionStatusIcon">
              {isWaterDone ? (
                <CheckCircle2 size={20} color="#c8ff00" />
              ) : (
                <span className="fx-missionIndexDot">3</span>
              )}
            </div>
            <div>
              <div className="fx-missionLabelRow">
                <b>{isWaterDone ? 'Optimal Hidrasyon Sağlandı' : 'Su ve Elektrolit Dengesi'}</b>
                <span className="fx-missionXpBadge">+40 XP</span>
              </div>
              <p>
                {water} ml / {target.water || 2500} ml{' '}
                {!isWaterDone && `· ${Math.max(0, (target.water || 2500) - water)} ml kaldı`}
              </p>
            </div>
          </div>

          <div className="fx-missionAction">
            {isWaterDone ? (
              <span className="fx-missionDoneTag">TAMAMLANDI</span>
            ) : (
              <button
                type="button"
                className="fx-btn fx-hydroBtn fx-btn--sm"
                onClick={handleAddWater}
                title="Hemen 250ml su ekle"
              >
                <Droplets size={13} /> +250ml
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
