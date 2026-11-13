import React, { useState, useMemo, useEffect } from 'react';
import {
  Dumbbell,
  Play,
  Check,
  Trash2,
  HelpCircle,
  TrendingUp,
  Award,
  Calculator,
  SlidersHorizontal,
  Minus,
  Plus,
  Layers
} from 'lucide-react';
import Panel from '../components/Panel.jsx';
import ExerciseVisual from '../components/ExerciseVisual.jsx';
import RestTimer from '../components/RestTimer.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { homePlans, gymPlans, getCustomTrainingDays } from '../lib/workoutPlans.js';
import {
  calculatePersonalRecords,
  getProgressiveOverloadAdvice,
  getSmartExerciseDefaults
} from '../lib/exerciseStats.js';
import { calculateOneRepMax } from '../lib/calculations.js';
import { resolveExerciseMedia } from '../lib/exerciseMedia.js';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';

export default function TrainingView({
  day,
  profile,
  entries,
  onStartActiveWorkout,
  onAddWorkout,
  onRemoveWorkout
}) {
  const { t } = useI18n();
  const [guide, setGuide] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [checkedMoves, setCheckedMoves] = useState({});
  const [session, setSession] = useState({});
  const [savedPlanBanner, setSavedPlanBanner] = useState('');
  const [workoutNote, setWorkoutNote] = useState('');
  const [planMode, setPlanMode] = useState(() =>
    getCustomTrainingDays().length ? 'ai' : profile.training || 'home'
  );
  const [showAllDays, setShowAllDays] = useState(false);

  // 1RM Calculator State
  const [calcWeight, setCalcWeight] = useState(15);
  const [calcReps, setCalcReps] = useState(10);
  const [calculated1RM, setCalculated1RM] = useState(null);

  const customDays = getCustomTrainingDays();
  const effectiveMode = planMode === 'ai' && !customDays.length ? profile.training || 'home' : planMode;
  const currentPlans = effectiveMode === 'ai' ? customDays : effectiveMode === 'gym' ? gymPlans : homePlans;
  const personalRecords = calculatePersonalRecords(entries.workout);
  const prEntries = Object.entries(personalRecords).filter(([_, data]) => data.maxWeight > 0);

  // Bugünün haftanın gününe en uygun antrenman gününü otomatik seç
  const defaultDayIdx = useMemo(() => {
    if (!currentPlans.length) return 0;
    const weekday = (new Date(day + 'T12:00:00').getDay() + 6) % 7;
    const exact = currentPlans.findIndex((p) => Number(p.day) === weekday);
    return exact >= 0 ? exact : 0;
  }, [currentPlans, day]);

  const [selectedDayIdx, setSelectedDayIdx] = useState(defaultDayIdx);

  useEffect(() => {
    setSelectedDayIdx(defaultDayIdx);
    setEditingKey(null);
    setGuide(null);
  }, [effectiveMode, defaultDayIdx]);

  const safeDayIdx = Math.min(selectedDayIdx, Math.max(0, currentPlans.length - 1));
  const displayedPlans = showAllDays
    ? currentPlans.map((plan, idx) => ({ plan, idx }))
    : currentPlans[safeDayIdx]
      ? [{ plan: currentPlans[safeDayIdx], idx: safeDayIdx }]
      : [];

  const updateExerciseMetric = (key, field, nextVal, baseDefaults) => {
    const min = field === 'sets' ? 1 : 0;
    const max = field === 'sets' ? 10 : field === 'reps' ? 120 : 400;
    const clamped = Math.min(max, Math.max(min, Number(nextVal) || 0));
    setSession((prev) => ({
      ...prev,
      [key]: {
        kg: prev[key]?.kg ?? baseDefaults.kg,
        reps: prev[key]?.reps ?? baseDefaults.reps,
        sets: prev[key]?.sets ?? baseDefaults.sets,
        [field]: clamped
      }
    }));
  };

  const toggleMoveChecked = (key) => {
    sounds.tap();
    setCheckedMoves((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="trainingView">
      <div className="intro">
        <div className="introHeaderRow">
          <div>
            <h2>{t('tr.title')}</h2>
            <p>{t('tr.sub')}</p>
          </div>

          <div className="planSwitcher">
            {customDays.length > 0 && (
              <button
                type="button"
                className={`planSwitchBtn ${effectiveMode === 'ai' ? 'active' : ''}`}
                onClick={() => setPlanMode('ai')}
              >
                {t('tr.myProgram')} · {customDays.length} {t('tr.days')}
              </button>
            )}
            <button
              type="button"
              className={`planSwitchBtn ${effectiveMode === 'home' ? 'active' : ''}`}
              onClick={() => setPlanMode('home')}
            >
              {t('tr.homePlan')}
            </button>
            <button
              type="button"
              className={`planSwitchBtn ${effectiveMode === 'gym' ? 'active' : ''}`}
              onClick={() => setPlanMode('gym')}
            >
              {t('tr.gymPlan')}
            </button>
          </div>
        </div>
      </div>

      {/* Standalone Rest Timer Bar */}
      <RestTimer />

      {/* Personal Records Showcase (PR Vitrini) */}
      {prEntries.length > 0 && (
        <Panel title={t('tr.prTitle')} sub={t('tr.prSub')}>
          <div className="prShowcaseGrid">
            {prEntries.map(([exerciseName, data]) => {
              const estimated1RM = calculateOneRepMax(data.maxWeight, data.maxRepsAtMaxWeight);
              return (
                <div key={exerciseName} className="prShowcaseCard">
                  <div className="prCardTop">
                    <Award size={18} className="prMedal" />
                    <span className="prExName">{exerciseName}</span>
                  </div>
                  <div className="prWeightBig">
                    <strong>{data.maxWeight} kg</strong>
                    <small>× {data.maxRepsAtMaxWeight} tekrar</small>
                  </div>
                  <div className="prSubMeta">
                    <span>Est. 1RM: <b>{estimated1RM} kg</b></span>
                    <small>{data.lastDate}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Day Selector Pills Strip */}
      {currentPlans.length > 1 && (
        <div className="fx-dayTabRow" role="tablist" aria-label="Program günleri">
          {currentPlans.map((p, idx) => {
            const shortName = (p.name || `Gün ${idx + 1}`).split('·')[0].trim();
            const isTodayMatch = idx === defaultDayIdx;
            const isSelected = !showAllDays && safeDayIdx === idx;
            const doneToday = entries.workout.some(
              (e) => e.day === day && e.payload?.name === p.name
            );
            return (
              <button
                key={p.name}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`fx-dayTabPill ${isSelected ? 'active' : ''} ${doneToday ? 'is-done' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setShowAllDays(false);
                  setSelectedDayIdx(idx);
                }}
              >
                {doneToday && <Check size={12} className="fx-dayDoneIcon" />}
                <span>{shortName}</span>
                {isTodayMatch && !doneToday && <small className="fx-dayTodayTag">Bugün</small>}
              </button>
            );
          })}
          <button
            type="button"
            className={`fx-dayTabPill fx-dayTabAll ${showAllDays ? 'active' : ''}`}
            onClick={() => {
              sounds.tap();
              setShowAllDays((v) => !v);
            }}
          >
            <Layers size={12} />
            <span>{showAllDays ? 'Tek Gün Göster' : `Tüm Hafta (${currentPlans.length})`}</span>
          </button>
        </div>
      )}

      {/* Program Grid */}
      <div className={`trainingGrid ${!showAllDays ? 'fx-singleDayGrid' : ''}`}>
        {displayedPlans.map(({ plan, idx: i }) => {
          const isDoneToday = entries.workout.some(
            (e) => e.day === day && e.payload?.name === plan.name
          );

          const resolvedMoves = plan.moves.map((move) => {
            const n = move.name || move[0];
            const reps = move.sets || move[1];
            const muscle = move.muscle || move[2] || 'Kas';
            const tip = move.tip || move[3] || '';
            const mistakes = move.commonMistakes || '';
            const key = i + '|' + n;
            const lastWorkout = entries.workout.find((e) => e.payload?.sets?.[n]);
            const prevSet = lastWorkout?.payload?.sets?.[n];
            const media = resolveExerciseMedia(n);
            const defaults = getSmartExerciseDefaults(move, prevSet, media.equipmentTr);
            const currentVal = {
              kg: session[key]?.kg ?? defaults.kg,
              reps: session[key]?.reps ?? defaults.reps,
              sets: session[key]?.sets ?? defaults.sets
            };
            return {
              move,
              n,
              reps,
              muscle,
              tip,
              mistakes,
              key,
              prevSet,
              media,
              defaults,
              currentVal,
              isChecked: !!checkedMoves[key],
              pr: personalRecords[n],
              advice: prevSet ? getProgressiveOverloadAdvice(prevSet, reps) : null
            };
          });

          const checkedCount = resolvedMoves.filter((m) => m.isChecked).length;
          const totalMoves = resolvedMoves.length;

          return (
            <Panel
              key={plan.name}
              title={plan.name}
              sub={`${plan.focus} · ${totalMoves} hareket`}
              action={
                <div className="fx-planHeaderActions">
                  {isDoneToday && (
                    <span className="fx-doneDayBadge">
                      <Check size={12} /> Bugün Tamamlandı
                    </span>
                  )}
                  <button
                    type="button"
                    className="primary startLiveBtn"
                    onClick={() => onStartActiveWorkout(plan)}
                  >
                    <Play size={14} fill="currentColor" /> {t('tr.start')}
                  </button>
                </div>
              }
            >
              <div className="exerciseList">
                {resolvedMoves.map((item, j) => {
                  const {
                    n,
                    reps,
                    muscle,
                    tip,
                    mistakes,
                    key,
                    prevSet,
                    media,
                    defaults,
                    currentVal,
                    isChecked,
                    pr,
                    advice
                  } = item;
                  const isEditing = editingKey === key;
                  const weightLabel =
                    Number(currentVal.kg) === 0
                      ? 'Vücut Ağırlığı'
                      : `${currentVal.kg} kg`;
                  const repUnit = defaults.isTimeBased ? 'sn' : 'tek';

                  return (
                    <div
                      className={`exercise fx-studioExCard ${isChecked ? 'is-checked' : ''}`}
                      key={key}
                      style={{ display: 'block' }}
                    >
                      <div className="exerciseMainRow">
                        <span className="exerciseIndex">{j + 1}</span>
                        <button
                          type="button"
                          className="fx-miniMoveThumb"
                          onClick={() => setGuide(guide === key ? null : key)}
                          title={`${media.label} · 3-fazlı rehber`}
                          aria-label={`${n} form rehberi`}
                        >
                          <img src={media.frame1} alt={n} loading="lazy" />
                        </button>
                        <div className="exerciseInfoCol">
                          <div className="exTitleRow">
                            <b>{n}</b>
                            {pr && pr.maxWeight > 0 && (
                              <span className="prBadge" title={`Kişisel Rekor: ${pr.maxWeight} kg`}>
                                <Award size={11} /> PR: {pr.maxWeight}kg
                              </span>
                            )}
                          </div>
                          <small className="exerciseSubDesc">
                            {muscle} · {media.equipmentTr} · Hedef {reps}
                          </small>
                        </div>

                        <div className="fx-exCardRightCluster">
                          <div className="fx-exActionGroup">
                            <button
                              type="button"
                              className={`fx-exPresetPill ${isEditing ? 'is-open' : ''}`}
                              onClick={() => {
                                sounds.tap();
                                setEditingKey(isEditing ? null : key);
                              }}
                              title="Ağırlık, tekrar veya seti hızlıca ayarla"
                            >
                              <SlidersHorizontal size={11} />
                              <span>
                                {currentVal.sets}×{currentVal.reps} {repUnit === 'sn' ? 'sn' : ''} · {weightLabel}
                              </span>
                            </button>

                            <button
                              type="button"
                              className={`guideButton ${guide === key ? 'is-open' : ''}`}
                              onClick={() => setGuide(guide === key ? null : key)}
                            >
                              <HelpCircle size={12} /> Rehber {guide === key ? '−' : '+'}
                            </button>

                            <button
                              type="button"
                              className={`fx-exCheckPill ${isChecked ? 'checked' : ''}`}
                              onClick={() => toggleMoveChecked(key)}
                              aria-pressed={isChecked}
                              title={isChecked ? 'İşareti kaldır' : 'Ortalama değerle tamamlandı işaretle'}
                            >
                              <Check size={13} />
                              <span>{isChecked ? 'Yapıldı' : 'Yaptım'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Optional Compact Stepper Adjuster (Hidden until user taps metric chip) */}
                      {isEditing && (
                        <div className="fx-exStepperDrawer">
                          <div className="fx-stepperControl">
                            <small>Ağırlık</small>
                            <div className="fx-stepperBtns">
                              <button
                                type="button"
                                onClick={() =>
                                  updateExerciseMetric(key, 'kg', Number(currentVal.kg) - 2.5, defaults)
                                }
                                aria-label="Ağırlığı azalt"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={currentVal.kg}
                                onChange={(e) =>
                                  updateExerciseMetric(key, 'kg', e.target.value, defaults)
                                }
                                aria-label={`${n} kg`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateExerciseMetric(key, 'kg', Number(currentVal.kg) + 2.5, defaults)
                                }
                                aria-label="Ağırlığı artır"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="fx-stepperControl">
                            <small>{defaults.isTimeBased ? 'Süre (sn)' : 'Tekrar'}</small>
                            <div className="fx-stepperBtns">
                              <button
                                type="button"
                                onClick={() =>
                                  updateExerciseMetric(
                                    key,
                                    'reps',
                                    Number(currentVal.reps) - (defaults.isTimeBased ? 5 : 1),
                                    defaults
                                  )
                                }
                                aria-label="Tekrarı azalt"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="120"
                                value={currentVal.reps}
                                onChange={(e) =>
                                  updateExerciseMetric(key, 'reps', e.target.value, defaults)
                                }
                                aria-label={`${n} tekrar`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateExerciseMetric(
                                    key,
                                    'reps',
                                    Number(currentVal.reps) + (defaults.isTimeBased ? 5 : 1),
                                    defaults
                                  )
                                }
                                aria-label="Tekrarı artır"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="fx-stepperControl">
                            <small>Set</small>
                            <div className="fx-stepperBtns">
                              <button
                                type="button"
                                onClick={() =>
                                  updateExerciseMetric(key, 'sets', Number(currentVal.sets) - 1, defaults)
                                }
                                aria-label="Seti azalt"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={currentVal.sets}
                                onChange={(e) =>
                                  updateExerciseMetric(key, 'sets', e.target.value, defaults)
                                }
                                aria-label={`${n} set`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateExerciseMetric(key, 'sets', Number(currentVal.sets) + 1, defaults)
                                }
                                aria-label="Seti artır"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="fx-quickWeightChips">
                            {[0, 5, 10, 15, 20].map((w) => (
                              <button
                                key={w}
                                type="button"
                                className={`fx-quickWeightChip ${Number(currentVal.kg) === w ? 'active' : ''}`}
                                onClick={() => updateExerciseMetric(key, 'kg', w, defaults)}
                              >
                                {w === 0 ? 'Vücut Ağ.' : `${w} kg`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Technique Guide Box */}
                      {guide === key && (
                        <div className="guideBox">
                          <ExerciseVisual name={n} />
                          <div>
                            <b>Doğru Uygulama:</b>
                            <p>{tip}</p>
                            {mistakes && (
                              <p className="mistakesText">
                                <b>Yaygın Hatalar:</b> {mistakes}
                              </p>
                            )}
                            <small className="mutedText">
                              2–3 tekrar rezervde bırak; hareketi yavaş ve kontrollü uygula.
                            </small>
                          </div>
                        </div>
                      )}

                      {/* Progressive Overload Suggestion */}
                      {advice && advice.shouldIncrease && (
                        <div className="overloadMiniTip">
                          <TrendingUp size={13} />
                          <span>{advice.reason}</span>
                        </div>
                      )}

                      {prevSet && (
                        <small className="smallHelp">
                          Son kayıt: {prevSet.kg > 0 ? `${prevSet.kg} kg` : 'Vücut Ağırlığı'} × {prevSet.reps}{' '}
                          ({prevSet.sets} set)
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* One-Tap Save With Smart Averages */}
              <div className="fx-daySaveFooter">
                <div className="fx-daySaveMeta">
                  <b>
                    {checkedCount > 0
                      ? `${checkedCount} / ${totalMoves} hareket işaretlendi`
                      : `Ortalama program ayarları hazır (${totalMoves} hareket)`}
                  </b>
                  <small>
                    {checkedCount > 0
                      ? 'İşaretlediğin hareketler kendi/ortalama değerleriyle kaydedilecek.'
                      : 'Tek tek doldurmana gerek yok; tek tıkla bu günü ortalama setlerle kaydet.'}
                  </small>
                  {savedPlanBanner === plan.name && (
                    <span className="fx-inlineSavedMsg">✓ {plan.name} kaydedildi!</span>
                  )}
                </div>

                <button
                  type="button"
                  className="secondary fx-quickSaveDayBtn"
                  onClick={() => {
                    sounds.tap();
                    const sets = {};
                    const itemsToSave =
                      checkedCount > 0
                        ? resolvedMoves.filter((m) => m.isChecked)
                        : resolvedMoves;

                    itemsToSave.forEach((m) => {
                      sets[m.n] = {
                        kg: Number(m.currentVal.kg) || 0,
                        reps: Number(m.currentVal.reps) || 10,
                        sets: Number(m.currentVal.sets) || 3
                      };
                    });

                    onAddWorkout({
                      name: plan.name,
                      note: workoutNote,
                      sets
                    });
                    setWorkoutNote('');
                    setCheckedMoves({});
                    setEditingKey(null);
                    setSavedPlanBanner(plan.name);
                    setTimeout(() => setSavedPlanBanner(''), 3500);
                  }}
                >
                  <Check size={15} />
                  {checkedCount > 0
                    ? `Seçili ${checkedCount} Hareketi Kaydet`
                    : 'Ortalama Değerlerle Günü Kaydet'}
                </button>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* 1RM Calculator & Workout Notes Grid */}
      <div className="twoCols">
        <Panel title="1RM (Tek Tekrar Maksimumu) Hesaplayıcı" sub="Epley ve Brzycki bilimsel formülleriyle güç tahmini">
          <div className="oneRmCalcBox">
            <div className="formGrid">
              <label>
                Ağırlık (Tek dambıl kg)
                <input
                  type="number"
                  min="1"
                  max="150"
                  step="0.5"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value) || 0)}
                />
              </label>

              <label>
                Yapılan Tekrar
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={calcReps}
                  onChange={(e) => setCalcReps(Number(e.target.value) || 0)}
                />
              </label>
            </div>

            <button
              type="button"
              className="fx-btn fx-solarBtn fx-btn--block fx-btn--sm"
              onClick={() => {
                sounds.tap();
                setCalculated1RM(calculateOneRepMax(calcWeight, calcReps));
              }}
              style={{ marginTop: 10 }}
            >
              <Calculator size={14} /> 1RM Hesapla
            </button>

            <div className="oneRmResults" style={{ marginTop: 14 }}>
              <div className="oneRmMain">
                <span>Tahmini 1RM:</span>
                <strong>{calculated1RM !== null ? `${calculated1RM} kg` : '—'}</strong>
              </div>

              {calculated1RM !== null ? (
                <div className="oneRmPercentages animate-fade-in">
                  <div><span>%85 (5RM):</span> <b>{Math.round(calculated1RM * 0.85 * 10) / 10} kg</b></div>
                  <div><span>%75 (10RM):</span> <b>{Math.round(calculated1RM * 0.75 * 10) / 10} kg</b></div>
                  <div><span>%65 (15RM):</span> <b>{Math.round(calculated1RM * 0.65 * 10) / 10} kg</b></div>
                </div>
              ) : (
                <p className="fx-muted fx-small" style={{ margin: '8px 0 0' }}>
                  Ağırlık ve tekrar girip "1RM Hesapla" butonuna bas.
                </p>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Antrenman Notun & Gözlemler">
          <textarea
            placeholder="Örn: Omuz press hareketinde 10 kg rahat geldi; haftaya 12 kg denenebilir. Bel ağrısı yok."
            value={workoutNote}
            onChange={(e) => setWorkoutNote(e.target.value)}
            rows="3"
          />
          <p className="smallHelp">
            Büyük kas gruplarında yaklaşık 90–180 saniye, küçük kas gruplarında 60–120 saniye dinlenme
            önerilir. Eklemlerde batıcı ağrı hissedersen hareketi derhal durdur.
          </p>
        </Panel>
      </div>

      {/* Workout History */}
      <Panel title="Antrenman Geçmişi">
        <div className="history">
          {entries.workout.length ? (
            entries.workout.slice(0, 25).map((e) => (
              <div key={e.id} className="historyRow">
                <span>
                  <b>
                    {e.day} · {e.payload?.name}
                  </b>
                  <small>
                    {Object.keys(e.payload?.sets || {}).length} hareket kaydedildi
                    {e.payload?.durationSeconds
                      ? ` · ${Math.floor(e.payload.durationSeconds / 60)} dk sürdü`
                      : ''}
                    {e.payload?.totalVolume
                      ? ` · ${e.payload.totalVolume.toLocaleString('tr-TR')} kg hacim`
                      : ''}
                    {e.payload?.note ? ` · ${e.payload.note}` : ''}
                  </small>
                </span>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onRemoveWorkout(e.id)}
                  title="Kaydı sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Dumbbell}
              title="Henüz antrenman kaydı yok"
              description="Yukarıdaki programlardan birini seçip canlı antrenman başlat veya setlerini gir."
            />
          )}
        </div>
      </Panel>
    </div>
  );
}
