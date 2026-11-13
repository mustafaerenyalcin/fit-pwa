import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Moon,
  ChevronDown,
  ChevronUp,
  Share2,
  Activity,
  Flame,
  Dumbbell,
  Sparkles,
  Droplets,
  Utensils,
  Target
} from 'lucide-react';
import { sounds } from '../lib/audio.js';
import { calculateReadiness } from '../lib/readinessEngine.js';
import { useI18n } from '../lib/i18n.js';

export default function HeroWorkoutCard({
  plan,
  isRest,
  doneToday = [],
  entries = {},
  profile = {},
  target = {},
  totals = { calories: 0, protein: 0 },
  water = 0,
  onStartWorkout,
  onNavigate,
  onOpenStoryCard
}) {
  const { t } = useI18n();
  const [showReadinessDetails, setShowReadinessDetails] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showAllMoves, setShowAllMoves] = useState(false);

  const readiness = calculateReadiness(entries, profile, target);
  const workoutDone = doneToday.length > 0;

  // Daily missions status
  const isProteinDone = totals.protein >= (target.protein || 140) * 0.9;
  const isWaterDone = water >= (target.water || 2500);
  const completedMissions = [workoutDone, isProteinDone, isWaterDone].filter(Boolean).length;

  const workoutName = workoutDone
    ? doneToday.map((w) => w.payload?.name).join(', ')
    : plan?.name || t('sub.todaySession');

  const moveCount = plan?.moves?.length || 0;

  const handleStart = () => {
    sounds.tap();
    onStartWorkout(plan);
  };

  const toggleReadiness = (e) => {
    e.stopPropagation();
    sounds.tap();
    setShowReadinessDetails((prev) => !prev);
  };

  return (
    <section className="fx-zenHeroCard">
      {/* KART BAŞLIĞI: KATEGORİ & HAZIRLIK PİLL */}
      <div className="fx-zenHeroTopRow">
        <div className="fx-zenHeroBadge">
          <Dumbbell size={13} color="#ff4d1c" />
          <span>{isRest ? t('hero.restTitle') : t('hero.workoutTitle')}</span>
        </div>

        {/* HAZIRLIK SKORU PİLLİ */}
        <button
          type="button"
          className="fx-zenReadinessPill"
          onClick={toggleReadiness}
          title={t('hero.readyPct', { score: readiness.score })}
          style={{ borderColor: readiness.color }}
        >
          <Activity size={12} color={readiness.color} />
          <b style={{ color: readiness.color }}>{t('hero.readyPct', { score: readiness.score })}</b>
          <span className="fx-zenDotSep">·</span>
          <span className="fx-zenReadinessTier">
            {readiness.tier === 'PEAK' ? t('hero.tierPeak') : readiness.tier === 'OPTIMAL' ? t('hero.tierOptimal') : t('hero.tierRecovery')}
          </span>
          {showReadinessDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* DETAYLI HAZIRLIK DRAWER'I (İSTEĞE BAĞLI AÇILIR) */}
      {showReadinessDetails && (
        <div className="fx-zenReadinessDrawer animate-fade-in">
          <div className="fx-zenReadinessGrid">
            <div className="fx-zenFactorCell">
              <Moon size={13} color="#00f0ff" />
              <div>
                <small>{t('hero.sleep')}</small>
                <b>{readiness.factors.sleep.val}</b>
              </div>
            </div>
            <div className="fx-zenFactorCell">
              <Utensils size={13} color="#ff4d1c" />
              <div>
                <small>{t('hero.protein')}</small>
                <b>{readiness.factors.nutrition.val}</b>
              </div>
            </div>
            <div className="fx-zenFactorCell">
              <Flame size={13} color="#c8ff00" />
              <div>
                <small>{t('hero.load')}</small>
                <b>{readiness.factors.fatigue.val}</b>
              </div>
            </div>
            <div className="fx-zenFactorCell">
              <Droplets size={13} color="#00b4d8" />
              <div>
                <small>{t('hero.hydration')}</small>
                <b>{readiness.factors.hydration.val}</b>
              </div>
            </div>
          </div>
          <p className="fx-zenReadinessAdvice">
            <Sparkles size={12} color={readiness.color} />
            <span>{readiness.advice}</span>
          </p>
        </div>
      )}

      {/* KART GÖVDESİ: ANTRENMAN İSMİ & METADATA */}
      <div className="fx-zenHeroBody">
        <h2 className="fx-zenHeroTitle">{workoutName}</h2>
        <p className="fx-zenHeroSub">
          {workoutDone ? (
            <span className="fx-zenDoneText">
              <CheckCircle2 size={15} color="#c8ff00" /> {t('hero.doneText')}
            </span>
          ) : isRest ? (
            plan?.tips?.[0] || t('hero.restDefaultSub')
          ) : (
            t('hero.movesMeta', { count: moveCount })
          )}
        </p>

        {/* HAREKET ÖNİZLEME ETİKETLERİ & AÇILIR LİSTE */}
        {!workoutDone && !isRest && plan?.moves?.length > 0 && (
          <div className="fx-zenMovesWrap">
            <div className="fx-zenMoveChips">
              {plan.moves.slice(0, 4).map((m, idx) => (
                <button
                  key={m.name || idx}
                  type="button"
                  className="fx-zenMoveChip fx-zenMoveChip--btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.tap();
                    setShowAllMoves((prev) => !prev);
                  }}
                >
                  <b>{m.name}</b>
                  <small>{m.sets || '3x10'}</small>
                </button>
              ))}
              {plan.moves.length > 4 && (
                <button
                  type="button"
                  className="fx-zenMoveChip fx-zenMoveChip--more fx-zenMoveChip--btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.tap();
                    setShowAllMoves((prev) => !prev);
                  }}
                >
                  {showAllMoves ? t('hero.close') : t('hero.moreMoves', { count: plan.moves.length - 4 })}
                </button>
              )}
            </div>

            {/* TÜM HAREKETLER LİSTESİ ÇEKMECESİ */}
            {showAllMoves && (
              <div className="fx-zenAllMovesDrawer animate-scale-in">
                <div className="fx-allMovesHead">
                  <span>{t('hero.allMovesHead', { count: plan.moves.length })}</span>
                  <button
                    type="button"
                    className="fx-closeMovesBtn"
                    onClick={() => setShowAllMoves(false)}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="fx-allMovesList">
                  {plan.moves.map((m, idx) => (
                    <div key={m.name || idx} className="fx-moveDetailRow">
                      <span className="fx-moveNum">{idx + 1}</span>
                      <div className="fx-moveMeta">
                        <b>{m.name}</b>
                        <small>
                          {m.muscle ? `${m.muscle} · ` : ''}
                          {m.sets || '3 × 10-12'}
                          {m.suggestedKg && m.suggestedKg !== '0' ? ` (${m.suggestedKg} kg)` : ''}
                        </small>
                        {m.tip && <span className="fx-moveTip">💡 {m.tip}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KART AKSİYONU (TEK, BELİRGİN VE OTORİTER BUTON) */}
      <div className="fx-zenHeroActions">
        {!workoutDone && !isRest ? (
          <button
            type="button"
            className="fx-neonActionBtn fx-solarBtn fx-btn--block"
            onClick={handleStart}
          >
            <Play size={18} fill="currentColor" /> {t('hero.startBtn')}
          </button>
        ) : workoutDone ? (
          <div className="fx-zenDoneButtonRow">
            <span className="fx-zenCompletedBadge">
              <CheckCircle2 size={16} /> {t('hero.completedBtn')}
            </span>
            {onOpenStoryCard && (
              <button
                type="button"
                className="fx-btn fx-btn--ghost fx-zenStoryBtn"
                onClick={() => {
                  sounds.tap();
                  onOpenStoryCard();
                }}
              >
                <Share2 size={15} color="#00f0ff" /> {t('hero.shareStory')}
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="fx-btn fx-btn--ghost fx-btn--block"
            onClick={() => onNavigate('training')}
          >
            <Moon size={15} /> {t('hero.restDetailsBtn')}
          </button>
        )}
      </div>

      {/* GÜNLÜK 3 GÖREV MİNİ ÇUBUĞU */}
      <div className="fx-zenMissionsBar">
        <button
          type="button"
          className="fx-zenMissionsToggle"
          onClick={() => {
            sounds.tap();
            setShowMissions((prev) => !prev);
          }}
        >
          <div className="fx-zenMissionsLeft">
            <Target size={13} color="#ff4d1c" />
            <span className="fx-zenMissionsEyebrow">{t('hero.dailyMissions')}</span>
            <span className="fx-zenMissionsCountPill">
              <b>{completedMissions}/3</b> {t('hero.completedCount')}
            </span>
          </div>
          <div className="fx-zenMissionsRight">
            <span className="fx-zenXpReward">+{completedMissions * 80 + 100} XP</span>
            {showMissions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </button>

        {showMissions && (
          <div className="fx-zenMissionsDropdown animate-fade-in">
            <div className={`fx-zenMissionRow ${workoutDone ? 'done' : ''}`}>
              <CheckCircle2 size={14} color={workoutDone ? '#c8ff00' : 'var(--fx-muted)'} />
              <span>{t('hero.missionWorkout')}</span>
              <b>+120 XP</b>
            </div>
            <div className={`fx-zenMissionRow ${isProteinDone ? 'done' : ''}`}>
              <CheckCircle2 size={14} color={isProteinDone ? '#c8ff00' : 'var(--fx-muted)'} />
              <span>{t('hero.missionProtein')}</span>
              <b>+80 XP</b>
            </div>
            <div className={`fx-zenMissionRow ${isWaterDone ? 'done' : ''}`}>
              <CheckCircle2 size={14} color={isWaterDone ? '#c8ff00' : 'var(--fx-muted)'} />
              <span>{t('hero.missionWater')}</span>
              <b>+60 XP</b>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
