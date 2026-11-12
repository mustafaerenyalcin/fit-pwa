import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Check,
  Clock,
  Dumbbell,
  TimerReset,
  Award,
  Plus,
  Volume2,
  VolumeX,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Trash2,
  Activity,
  Zap
} from 'lucide-react';
import ExerciseVisual from './ExerciseVisual.jsx';
import WorkoutSummaryCard from './WorkoutSummaryCard.jsx';
import AthleteStoryCardModal from './AthleteStoryCardModal.jsx';
import { getProgressiveOverloadAdvice } from '../lib/exerciseStats.js';
import { getDetailedExerciseGuide } from '../lib/exerciseGuide.js';
import { calculateOneRepMax } from '../lib/calculations.js';
import { sounds } from '../lib/audio.js';
import { celebration } from '../lib/celebration.js';
import { useI18n } from '../lib/i18n.js';

const ACTIVE_WORKOUT_KEY = 'fit-active-session-v1';

export default function ActiveWorkoutModal({
  plan,
  previousWorkout,
  profile,
  streak,
  onFinish,
  onClose
}) {
  const { t } = useI18n();
  // Session restore from localStorage if ongoing
  const [sessionData, setSessionData] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_WORKOUT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.planName === plan.name) {
          return parsed;
        }
      }
    } catch {}

    const initialExercises = plan.moves.map((move) => {
      const name = move.name || move[0];
      const reps = move.sets || move[1];
      const muscle = move.muscle || move[2] || 'Kas';
      const tip = move.tip || move[3] || '';
      const alternatives = move.alternatives || [];

      const prev = previousWorkout?.payload?.sets?.[name];
      // AI planlarında önerilen ağırlık ve set sayısı gelir; önceki kayıt varsa o önceliklidir.
      const startKg = prev?.kg || (move.suggestedKg && move.suggestedKg !== '0' ? String(move.suggestedKg) : '');
      const setCount = Math.min(6, Math.max(1, Number(move.defaultSets) || 3));
      return {
        name,
        targetReps: reps,
        muscle,
        tip,
        alternatives,
        previousKg: prev?.kg || '',
        previousReps: prev?.reps || '',
        sets: Array.from({ length: setCount }, () => ({
          type: 'normal',
          kg: startKg,
          reps: prev?.reps || '',
          rpe: 8,
          done: false
        }))
      };
    });

    return {
      planName: plan.name,
      planFocus: plan.focus,
      startTime: Date.now(),
      elapsedSeconds: 0,
      exercises: initialExercises,
      note: ''
    };
  });

  const [activeExIndex, setActiveExIndex] = useState(0);
  const [elapsed, setElapsed] = useState(sessionData.elapsedSeconds || 0);
  const [minimized, setMinimized] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Rest timer
  const [restSeconds, setRestSeconds] = useState(90);
  const [restDuration, setRestDuration] = useState(90);
  const [restActive, setRestActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals & Popovers
  const [showSummary, setShowSummary] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  // Hipertrofi Tempo Metronomu (3-1-1-0) & 40Hz Nöral Odak
  const [tempoActive, setTempoActive] = useState(false);
  const [tempoSec, setTempoSec] = useState(3);
  const [tempoPhase, setTempoPhase] = useState('down');
  const [neuralPrimingActive, setNeuralPrimingActive] = useState(false);

  useEffect(() => {
    let t = null;
    if (tempoActive) {
      t = setInterval(() => {
        setTempoSec((prev) => {
          if (prev <= 1) {
            setTempoPhase((ph) => {
              if (ph === 'down') {
                sounds.tempoTick('pause');
                return 'pause';
              }
              if (ph === 'pause') {
                sounds.tempoTick('up');
                return 'up';
              }
              sounds.tempoTick('down');
              return 'down';
            });
            return 3;
          }
          sounds.tempoTick('down');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [tempoActive]);

  const handleTriggerNeuralPrime = () => {
    sounds.neuralPulse(4);
    setNeuralPrimingActive(true);
    setTimeout(() => setNeuralPrimingActive(false), 4500);
  };

  // Workout duration counter
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !showSummary) {
      interval = setInterval(() => {
        setElapsed((sec) => {
          const next = sec + 1;
          setSessionData((prev) => {
            const updated = { ...prev, elapsedSeconds: next };
            try {
              localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, showSummary]);

  // Rest timer countdown with In-Ear Voice Coach
  useEffect(() => {
    let timer = null;
    if (restActive) {
      timer = setInterval(() => {
        setRestSeconds((curr) => {
          if (curr <= 1) {
            setRestActive(false);
            if (soundEnabled) {
              sounds.chime();
              sounds.speak(t('wm.voiceRestDone'));
            }
            return 0;
          }
          return curr - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [restActive, soundEnabled]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}:${String(remM).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Live total volume / tonnage calculation (with 2x dumbbell multiplier)
  const liveTotalVolume = sessionData.exercises.reduce((total, ex) => {
    const mult = ex.isDoubleDumbbell ? 2 : 1;
    return (
      total +
      ex.sets.reduce((exTotal, s) => {
        if (s.done && s.kg && s.reps) {
          return exTotal + Number(s.kg) * mult * Number(s.reps);
        }
        return exTotal;
      }, 0)
    );
  }, 0);

  // Set field updater
  const handleSetChange = (exIdx, setIdx, field, val) => {
    setSessionData((prev) => {
      const nextExercises = [...prev.exercises];
      const ex = { ...nextExercises[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: val };
      ex.sets = sets;
      nextExercises[exIdx] = ex;
      const updated = { ...prev, exercises: nextExercises };
      try {
        localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Add set
  const addSetToExercise = (exIdx) => {
    sounds.tap();
    setSessionData((prev) => {
      const nextExercises = [...prev.exercises];
      const ex = { ...nextExercises[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets = [
        ...ex.sets,
        {
          type: 'normal',
          kg: lastSet?.kg || '',
          reps: lastSet?.reps || '',
          rpe: lastSet?.rpe || 8,
          done: false
        }
      ];
      nextExercises[exIdx] = ex;
      const updated = { ...prev, exercises: nextExercises };
      try {
        localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Remove set
  const removeSetFromExercise = (exIdx, setIdx) => {
    sounds.tap();
    setSessionData((prev) => {
      const nextExercises = [...prev.exercises];
      const ex = { ...nextExercises[exIdx] };
      if (ex.sets.length <= 1) return prev;
      ex.sets = ex.sets.filter((_, i) => i !== setIdx);
      nextExercises[exIdx] = ex;
      const updated = { ...prev, exercises: nextExercises };
      try {
        localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Toggle set done + Auto Rest Timer + Spark & Haptic Delight
  const toggleSetDone = (exIdx, setIdx, event = null) => {
    setSessionData((prev) => {
      const nextExercises = [...prev.exercises];
      const ex = { ...nextExercises[exIdx] };
      const sets = [...ex.sets];
      const willBeDone = !sets[setIdx].done;
      sets[setIdx] = { ...sets[setIdx], done: willBeDone };
      ex.sets = sets;
      nextExercises[exIdx] = ex;
      const updated = { ...prev, exercises: nextExercises };
      try {
        localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updated));
      } catch {}

      if (willBeDone) {
        setRestSeconds(restDuration);
        setRestActive(true);

        // Dopamin artırıcı görsel ve işitsel kutlama
        if (event && event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          celebration.sparks({ x, y, color: '#c8ff00' });
          celebration.floatingBadge({ text: 'SET TAMAMLANDI! 🔥', x, y: y - 24, icon: '⚡' });
        } else {
          celebration.sparks({ color: '#c8ff00' });
          celebration.floatingBadge({ text: 'SET TAMAMLANDI! 🔥', icon: '⚡' });
        }

        sounds.bellDing();
      } else {
        sounds.tap();
      }
      return updated;
    });
  };

  // Swap / Replace exercise with an alternative
  const handleSwapExercise = (alternativeName) => {
    sounds.tap();
    setSessionData((prev) => {
      const nextExercises = [...prev.exercises];
      const ex = { ...nextExercises[activeExIndex] };
      ex.name = alternativeName;
      nextExercises[activeExIndex] = ex;
      const updated = { ...prev, exercises: nextExercises };
      try {
        localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setShowReplaceModal(false);
  };

  // Otomatik Bilimsel Isınma Piramidi Setleri Ekle (%45x10, %70x5, %85x2)
  const handleAddWarmupSets = (exIdx) => {
    sounds.tap();
    setSessionData((prev) => {
      const nextExercises = [...prev.exercises];
      const ex = { ...nextExercises[exIdx] };
      const targetKg = Number(ex.sets.find((s) => s.type === 'normal' && s.kg)?.kg) || Number(ex.previousKg) || 50;

      const warmup1 = {
        type: 'warmup',
        kg: String(Math.max(10, Math.round(targetKg * 0.45))),
        reps: 10,
        rpe: 6,
        done: false
      };
      const warmup2 = {
        type: 'warmup',
        kg: String(Math.max(15, Math.round(targetKg * 0.70))),
        reps: 5,
        rpe: 7,
        done: false
      };
      const warmup3 = {
        type: 'warmup',
        kg: String(Math.max(20, Math.round(targetKg * 0.85))),
        reps: 2,
        rpe: 8,
        done: false
      };

      const normalSets = ex.sets.filter((s) => s.type !== 'warmup');
      ex.sets = [warmup1, warmup2, warmup3, ...normalSets];
      nextExercises[exIdx] = ex;
      const updated = { ...prev, exercises: nextExercises };
      try {
        localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCompleteWorkout = () => {
    sounds.success();
    setShowSummary(true);
    setIsTimerRunning(false);
    setRestActive(false);
  };

  const handleSaveAndClose = () => {
    const finalSets = {};
    sessionData.exercises.forEach((ex) => {
      const completedSets = ex.sets.filter((s) => s.done || (s.kg && s.reps));
      if (completedSets.length > 0) {
        const last = completedSets[completedSets.length - 1];
        finalSets[ex.name] = {
          kg: Number(last.kg) || 0,
          reps: Number(last.reps) || 0,
          sets: completedSets.length
        };
      }
    });

    try {
      localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    } catch {}

    celebration.confetti({ count: 95 });
    celebration.floatingBadge({ text: 'SEANS TAMAMLANDI! 🏆', color: '#ffd700', icon: '🏆' });

    onFinish({
      name: plan.name,
      durationSeconds: elapsed,
      sets: finalSets,
      totalVolume: liveTotalVolume,
      note: sessionData.note
    });
  };

  const currentExercise = sessionData.exercises[activeExIndex] || sessionData.exercises[0];
  const totalCompletedSets = sessionData.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
    0
  );

  const prevData = previousWorkout?.payload?.sets?.[currentExercise?.name];
  const overloadAdvice = prevData
    ? getProgressiveOverloadAdvice(prevData, currentExercise?.targetReps)
    : null;
  const detailedGuide = getDetailedExerciseGuide(
    currentExercise?.name,
    currentExercise?.muscle,
    currentExercise?.tip
  );

  if (minimized) {
    return (
      <div className="fx-miniWorkoutBar" onClick={() => setMinimized(false)} role="button" tabIndex={0}>
        <div className="fx-miniWorkoutLeft">
          <span className="liveDot" />
          <div>
            <b>{plan.name}</b>
            <small>
              {formatTime(elapsed)} · {totalCompletedSets} set tamamlandı
              {restActive && restSeconds > 0 ? ` · Dinlenme: ${restSeconds}s` : ''}
            </small>
          </div>
        </div>
        <button type="button" className="fx-btn fx-btn--primary fx-btn--sm">
          Antrenmana Dön
        </button>
      </div>
    );
  }

  return (
    <div className="activeWorkoutOverlay">
      <div className="activeWorkoutModal">
        {/* Top Header */}
        <div className="activeModalHeader">
          <div className="headerLeft">
            <span className="liveBadge">
              <span className="liveDot" /> CANLI ANTRENMAN
            </span>
            <h3>{plan.name}</h3>
          </div>

          <div className="headerCenter">
            <div className="timerDisplay">
              <Clock size={16} />
              <span>{formatTime(elapsed)}</span>
              <button
                type="button"
                className="iconBtnSmall"
                onClick={() => setIsTimerRunning((v) => !v)}
                title={isTimerRunning ? 'Duraklat' : 'Devam et'}
              >
                {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </div>

            {liveTotalVolume > 0 && (
              <span className="liveVolumePill" title="Şu ana kadar kaldırılan toplam hacim">
                <Activity size={13} /> {liveTotalVolume.toLocaleString('tr-TR')} kg
              </span>
            )}
          </div>

          <div className="headerRight">
            <button
              type="button"
              className="secondary finishBtnTop"
              onClick={() => setMinimized(true)}
              title="Antrenmanı küçült ve uygulamada gezin"
            >
              Küçült
            </button>
            <button
              type="button"
              className="primary finishBtnTop"
              onClick={handleCompleteWorkout}
            >
              <Check size={16} /> Bitir
            </button>
            <button
              type="button"
              className="iconBtnClose"
              onClick={onClose}
              title="Kapat (Oturum kaydedilir, veriler kaybolmaz)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Automatic Rest Timer Bar */}
        <div className={`activeRestBar ${restActive ? 'active' : ''}`}>
          <div className="restBarLeft">
            <TimerReset size={18} className={restActive ? 'pulse' : ''} />
            <span>{t('wm.restTimer')} </span>
            <strong className="restClock">
              {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')}
            </strong>
          </div>

          <div className="restBarControls">
            <button
              type="button"
              className="pillBtn"
              onClick={() => {
                sounds.tap();
                setRestActive((v) => !v);
              }}
            >
              {restActive ? t('wm.pause') : t('wm.start')}
            </button>
            <button
              type="button"
              className="pillBtn"
              onClick={() => {
                sounds.tap();
                setRestSeconds(restDuration);
                setRestActive(false);
              }}
            >
              {t('wm.reset')}
            </button>
            <select
              value={restDuration}
              onChange={(e) => {
                const dur = Number(e.target.value);
                setRestDuration(dur);
                setRestSeconds(dur);
              }}
              className="restDurationSelect"
            >
              <option value={45}>45 {t('wm.sec')}</option>
              <option value={60}>60 {t('wm.sec')}</option>
              <option value={90}>90 {t('wm.sec')}</option>
              <option value={120}>120 {t('wm.sec')}</option>
              <option value={180}>180 {t('wm.sec')}</option>
            </select>
            <button
              type="button"
              className="iconBtnSmall"
              onClick={() => setSoundEnabled((v) => !v)}
              title={soundEnabled ? 'Ses açık' : 'Ses kapalı'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        {!showSummary ? (
          <div className="activeModalBody">
            {/* Exercise Stepper Column */}
            <div className="exerciseStepper">
              {sessionData.exercises.map((ex, idx) => {
                const allDone = ex.sets.every((s) => s.done);
                const hasSome = ex.sets.some((s) => s.done);
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`stepItem ${idx === activeExIndex ? 'current' : ''} ${allDone ? 'allDone' : hasSome ? 'partDone' : ''}`}
                    onClick={() => {
                      sounds.tap();
                      setActiveExIndex(idx);
                    }}
                  >
                    <span className="stepNum">
                      {allDone ? <Check size={12} /> : idx + 1}
                    </span>
                    <span className="stepName">{ex.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Exercise Execution Screen */}
            <div className="currentExerciseSection">
              <div className="exerciseHeaderRow">
                <div>
                  <div className="exMuscleTag">{currentExercise.muscle}</div>
                  <h2>{currentExercise.name}</h2>
                  <p className="exTargetReps">{t('wm.target')} {currentExercise.targetReps}</p>
                </div>

                <div className="exHeaderActionBtns">
                  <button
                    type="button"
                    className={`guideToggleBtn ${currentExercise.isDoubleDumbbell ? 'active-accent' : ''}`}
                    onClick={() => {
                      sounds.tap();
                      setSessionData((prev) => {
                        const updated = { ...prev };
                        updated.exercises[activeExIndex].isDoubleDumbbell = !updated.exercises[activeExIndex].isDoubleDumbbell;
                        return updated;
                      });
                    }}
                  >
                    <Dumbbell size={13} /> {currentExercise.isDoubleDumbbell ? t('wm.doubleDbActive') : t('wm.doubleDb')}
                  </button>

                  <button
                    type="button"
                    className="guideToggleBtn"
                    onClick={() => handleAddWarmupSets(activeExIndex)}
                  >
                    {t('wm.warmup')}
                  </button>

                  {currentExercise.alternatives && currentExercise.alternatives.length > 0 && (
                    <button
                      type="button"
                      className="guideToggleBtn"
                      onClick={() => setShowReplaceModal(true)}
                    >
                      <RefreshCw size={13} /> {t('wm.swap')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="guideToggleBtn"
                    onClick={() => setShowGuide((v) => !v)}
                  >
                    <HelpCircle size={14} /> {t('wm.guide')} {showGuide ? '−' : '+'}
                  </button>
                </div>
              </div>

              {/* HİPERTROFİ TEMPO METRONOMU & 40HZ NÖRAL ODAKLANMA BARI */}
              <div className="fx-tempoNeuralBar">
                <button
                  type="button"
                  className={`fx-tempoToggleBtn ${tempoActive ? 'active' : ''}`}
                  onClick={() => {
                    sounds.tap();
                    setTempoActive(!tempoActive);
                  }}
                >
                  <Clock size={13} /> {tempoActive ? `${tempoPhase === 'down' ? t('wm.tempoDown') : tempoPhase === 'pause' ? t('wm.tempoPause') : t('wm.tempoUp')}` : t('wm.tempoBtn')}
                </button>

                <button
                  type="button"
                  className={`fx-neuralPrimeBtn ${neuralPrimingActive ? 'pulsing' : ''}`}
                  onClick={handleTriggerNeuralPrime}
                >
                  <Zap size={13} color="#00f0ff" /> {neuralPrimingActive ? t('wm.neuralActive') : t('wm.neuralBtn')}
                </button>
              </div>

              {/* Alternative Exercise Selection Modal */}
              {showReplaceModal && (
                <div className="replaceExBox">
                  <div className="replaceExHeader">
                    <b>Alternatif Egzersiz Seç</b>
                    <button type="button" onClick={() => setShowReplaceModal(false)}>×</button>
                  </div>
                  <div className="replaceExList">
                    {currentExercise.alternatives.map((alt) => (
                      <button
                        key={alt}
                        type="button"
                        className="replaceExItem"
                        onClick={() => handleSwapExercise(alt)}
                      >
                        <span>{alt}</span>
                        <small>Seç ve Değiştir →</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form & Anatomy Guide */}
              {showGuide && (
                <div className="activeGuideBox fx-proGuideBox">
                  <div className="fx-proGuideVisualCol">
                    <ExerciseVisual name={currentExercise.name} />
                    <div className="fx-proGuideMuscles">
                      <span><b>Birincil:</b> {detailedGuide.primary}</span>
                      <span><b>İkincil:</b> {detailedGuide.secondary}</span>
                    </div>
                  </div>
                  <div className="guideDetails fx-proGuideDetails">
                    <div className="fx-guideBreathPill">
                      <b>🌬️ Nefes Ritmi:</b> {detailedGuide.breathing}
                    </div>
                    <b>✅ 3 Adımda Kusursuz Form:</b>
                    <ul className="fx-guideStepList">
                      {detailedGuide.steps.map((st, idx) => (
                        <li key={idx}>{st}</li>
                      ))}
                    </ul>
                    <b>⚠️ En Sık Yapılan Hatalar:</b>
                    <ul className="fx-guideMistakeList">
                      {detailedGuide.mistakes.map((ms, idx) => (
                        <li key={idx}>{ms}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Progressive Overload Notice */}
              {overloadAdvice && (
                <div className={`overloadAlert ${overloadAdvice.shouldIncrease ? 'suggestIncrease' : ''}`}>
                  <TrendingUp size={16} />
                  <div>
                    <b>İlerleme Tavsiyesi: </b>
                    <span>{overloadAdvice.reason}</span>
                    {overloadAdvice.shouldIncrease && (
                      <button
                        type="button"
                        className="applyAdviceBtn"
                        onClick={() => {
                          sounds.tap();
                          sessionData.exercises[activeExIndex].sets.forEach((_, sIdx) => {
                            handleSetChange(activeExIndex, sIdx, 'kg', overloadAdvice.suggestedKg);
                          });
                        }}
                      >
                        {overloadAdvice.suggestedKg} kg'ı Uygula
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Set Tracker Table with RPE & Set Type */}
              <div className="setTrackerTable">
                <div className="setTableHeader">
                  <span className="colSet">{t('wm.colSet')}</span>
                  <span className="colPrev">{t('wm.colPrev')}</span>
                  <span className="colKg">{t('wm.colKg')}</span>
                  <span className="colReps">{t('wm.colReps')}</span>
                  <span className="colRpe">RPE</span>
                  <span className="colCheck">{t('wm.colCheck')}</span>
                  <span className="colDel"></span>
                </div>

                <div className="setTableRows">
                  {currentExercise.sets.map((set, sIdx) => {
                    const est1RM = set.kg && set.reps ? calculateOneRepMax(set.kg, set.reps) : null;
                    return (
                      <div
                        key={sIdx}
                        className={`setRow ${set.done ? 'isDone' : ''}`}
                      >
                        <div className="colSet setIndexCol">
                          <select
                            value={set.type}
                            onChange={(e) => handleSetChange(activeExIndex, sIdx, 'type', e.target.value)}
                            className="setTypeSelect"
                          >
                            <option value="normal">{sIdx + 1}</option>
                            <option value="warmup">W</option>
                            <option value="drop">D</option>
                          </select>
                        </div>

                        <span className="colPrev prevPerformance">
                          {currentExercise.previousKg
                            ? `${currentExercise.previousKg}k × ${currentExercise.previousReps}`
                            : '—'}
                        </span>

                        <div className="colKg">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            placeholder={currentExercise.previousKg || '0'}
                            value={set.kg}
                            onChange={(e) =>
                              handleSetChange(activeExIndex, sIdx, 'kg', e.target.value)
                            }
                          />
                          {currentExercise.isDoubleDumbbell && Boolean(set.kg) && (
                            <small className="fx-multHint">Top: {Number(set.kg) * 2}kg</small>
                          )}
                        </div>

                        <div className="colReps">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder={currentExercise.previousReps || '10'}
                            value={set.reps}
                            onChange={(e) =>
                              handleSetChange(activeExIndex, sIdx, 'reps', e.target.value)
                            }
                          />
                        </div>

                        <div className="colRpe">
                          <select
                            value={set.rpe || 8}
                            onChange={(e) =>
                              handleSetChange(activeExIndex, sIdx, 'rpe', Number(e.target.value))
                            }
                            className="rpeSelect"
                          >
                            <option value={6}>RPE 6 (4+ rezerv)</option>
                            <option value={7}>RPE 7 (3 rezerv)</option>
                            <option value={8}>RPE 8 (2 rezerv)</option>
                            <option value={9}>RPE 9 (1 rezerv)</option>
                            <option value={10}>RPE 10 (Tükeniş)</option>
                          </select>
                        </div>

                        <div className="colCheck">
                          <button
                            type="button"
                            className={`setCheckBtn ${set.done ? 'checked' : ''}`}
                            onClick={(e) => toggleSetDone(activeExIndex, sIdx, e)}
                          >
                            <Check size={18} />
                          </button>
                        </div>

                        <div className="colDel">
                          {currentExercise.sets.length > 1 && (
                            <button
                              type="button"
                              className="trashSetBtn"
                              onClick={() => removeSetFromExercise(activeExIndex, sIdx)}
                              title="Seti Sil"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="setTableFooter">
                  <button
                    type="button"
                    className="addSetBtn"
                    onClick={() => addSetToExercise(activeExIndex)}
                  >
                    <Plus size={14} /> {t('wm.addSet')}
                  </button>
                </div>
              </div>

              {/* Navigation Between Exercises */}
              <div className="exerciseNavActions">
                <button
                  type="button"
                  className="secondary"
                  disabled={activeExIndex === 0}
                  onClick={() => {
                    sounds.tap();
                    setActiveExIndex((idx) => Math.max(0, idx - 1));
                  }}
                >
                  {t('wm.prevEx')}
                </button>

                {activeExIndex < sessionData.exercises.length - 1 ? (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      sounds.tap();
                      setActiveExIndex((idx) => idx + 1);
                    }}
                  >
                    {t('wm.nextEx')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="primary lightButton"
                    onClick={handleCompleteWorkout}
                  >
                    {t('wm.finishEx')} <Award size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* WORKOUT SUMMARY SCREEN */
          <div className="workoutSummaryScreen">
            <WorkoutSummaryCard
              planName={plan.name}
              planFocus={plan.focus}
              elapsedSeconds={elapsed}
              totalVolume={liveTotalVolume}
              completedSetsCount={totalCompletedSets}
              exercises={sessionData.exercises}
              newPRs={sessionData.exercises
                .map((ex) => {
                  const maxKg = ex.sets.reduce((m, s) => (s.done ? Math.max(m, Number(s.kg) || 0) : m), 0);
                  const prevKg = Number(ex.previousKg) || 0;
                  if (maxKg > prevKg && prevKg > 0) {
                    const bestSet = ex.sets.find((s) => s.done && Number(s.kg) === maxKg);
                    return { name: ex.name, kg: maxKg, reps: bestSet?.reps || '10' };
                  }
                  return null;
                })
                .filter(Boolean)}
              onConfirmFinish={handleSaveAndClose}
            />

            <div className="summaryNote" style={{ marginTop: 14 }}>
              <label>
                {t('wm.noteLabel')}
                <textarea
                  rows="2"
                  placeholder="RPE / Form / Weight notes..."
                  value={sessionData.note}
                  onChange={(e) =>
                    setSessionData((prev) => ({ ...prev, note: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="summaryActions" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="secondary"
                onClick={() => setShowSummary(false)}
              >
                {t('wm.backToSets')}
              </button>
            </div>

            <button
              type="button"
              className="fx-btn fx-solarBtn"
              style={{
                width: '100%',
                marginTop: 12,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 800
              }}
              onClick={() => setShowStoryModal(true)}
            >
              {t('wm.shareStory')}
            </button>
          </div>
        )}
      </div>

      {showStoryModal && (
        <AthleteStoryCardModal
          workoutResult={{
            name: plan.name,
            durationSeconds: elapsed,
            totalVolume: liveTotalVolume,
            sets: sessionData.exercises.reduce((acc, ex) => {
              const comp = ex.sets.filter((s) => s.done);
              if (comp.length > 0) {
                const last = comp[comp.length - 1];
                acc[ex.name] = { kg: last.kg || 0, reps: last.reps || 0 };
              }
              return acc;
            }, {})
          }}
          profile={profile}
          streak={streak}
          onClose={() => setShowStoryModal(false)}
        />
      )}
    </div>
  );
}
