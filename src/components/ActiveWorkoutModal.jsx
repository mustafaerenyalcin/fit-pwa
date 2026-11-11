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
  Activity
} from 'lucide-react';
import ExerciseVisual from './ExerciseVisual.jsx';
import { getProgressiveOverloadAdvice } from '../lib/exerciseStats.js';
import { calculateOneRepMax } from '../lib/calculations.js';
import { sounds } from '../lib/audio.js';

const ACTIVE_WORKOUT_KEY = 'fit-active-session-v1';

export default function ActiveWorkoutModal({
  plan,
  previousWorkout,
  onFinish,
  onClose
}) {
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

  // Rest timer countdown
  useEffect(() => {
    let timer = null;
    if (restActive) {
      timer = setInterval(() => {
        setRestSeconds((curr) => {
          if (curr <= 1) {
            setRestActive(false);
            if (soundEnabled) sounds.chime();
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

  // Live total volume / tonnage calculation
  const liveTotalVolume = sessionData.exercises.reduce((total, ex) => {
    return (
      total +
      ex.sets.reduce((exTotal, s) => {
        if (s.done && s.kg && s.reps) {
          return exTotal + Number(s.kg) * Number(s.reps);
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

  // Toggle set done + Auto Rest Timer
  const toggleSetDone = (exIdx, setIdx) => {
    sounds.tap();
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
            <span>Dinlenme Sayacı: </span>
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
              {restActive ? 'Duraklat' : 'Başlat'}
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
              Sıfırla
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
              <option value={45}>45 sn</option>
              <option value={60}>60 sn</option>
              <option value={90}>90 sn</option>
              <option value={120}>120 sn</option>
              <option value={180}>180 sn</option>
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
                  <p className="exTargetReps">Hedef: {currentExercise.targetReps}</p>
                </div>

                <div className="exHeaderActionBtns">
                  {currentExercise.alternatives && currentExercise.alternatives.length > 0 && (
                    <button
                      type="button"
                      className="guideToggleBtn"
                      onClick={() => setShowReplaceModal(true)}
                      title="Bu hareketi alternatif bir egzersizle değiştir"
                    >
                      <RefreshCw size={13} /> Hareketi Değiştir
                    </button>
                  )}
                  <button
                    type="button"
                    className="guideToggleBtn"
                    onClick={() => setShowGuide((v) => !v)}
                  >
                    <HelpCircle size={14} /> Rehber {showGuide ? '−' : '+'}
                  </button>
                </div>
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

              {/* Form Guide */}
              {showGuide && (
                <div className="activeGuideBox">
                  <ExerciseVisual name={currentExercise.name} />
                  <div className="guideDetails">
                    <b>Doğru Uygulama:</b>
                    <p>{currentExercise.tip}</p>
                    <small>
                      Son sette tükenişe gitmek yerine 1–2 tekrar rezervde (RIR) bırak; formu asla bozma.
                    </small>
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
                  <span className="colSet">SET</span>
                  <span className="colPrev">ÖNCEKİ</span>
                  <span className="colKg">AĞIRLIK (KG)</span>
                  <span className="colReps">TEKRAR</span>
                  <span className="colRpe" title="RPE: Zorlanma Seviyesi (7-8: 2-3 tekrar rezerv)">RPE</span>
                  <span className="colCheck">TAMAM</span>
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
                            onClick={() => toggleSetDone(activeExIndex, sIdx)}
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
                    <Plus size={14} /> Yeni Set Ekle
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
                  ← Önceki Hareket
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
                    Sonraki Hareket →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="primary lightButton"
                    onClick={handleCompleteWorkout}
                  >
                    Antrenmanı Tamamla <Award size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* WORKOUT SUMMARY SCREEN */
          <div className="workoutSummaryScreen">
            <div className="summaryBanner">
              <div className="trophyIcon">
                <Award size={48} />
              </div>
              <h2>Harika İş! Antrenman Tamamlandı</h2>
              <p>{plan.name} başarıyla bitirildi.</p>
            </div>

            <div className="summaryMetricsGrid">
              <div className="summaryMetric">
                <Clock size={22} />
                <span className="lbl">Toplam Süre</span>
                <strong>{formatTime(elapsed)}</strong>
              </div>
              <div className="summaryMetric">
                <Dumbbell size={22} />
                <span className="lbl">Toplam Kaldırılan Hacim</span>
                <strong>{liveTotalVolume.toLocaleString('tr-TR')} kg</strong>
              </div>
              <div className="summaryMetric">
                <Award size={22} />
                <span className="lbl">Tamamlanan Set</span>
                <strong>{totalCompletedSets} Set</strong>
              </div>
            </div>

            <div className="summaryNote">
              <label>
                Antrenman Notun & Gözlemlerin:
                <textarea
                  rows="3"
                  placeholder="Örn: Omuz lateral raise hareketinde 10 kg çok temiz çıktı, haftaya artırılabilir."
                  value={sessionData.note}
                  onChange={(e) =>
                    setSessionData((prev) => ({ ...prev, note: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="summaryActions">
              <button
                type="button"
                className="secondary"
                onClick={() => setShowSummary(false)}
              >
                Geri Dön ve Düzenle
              </button>
              <button
                type="button"
                className="primary finishFinalBtn"
                onClick={handleSaveAndClose}
              >
                <Check size={18} /> Antrenmanı Kaydet ve Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
