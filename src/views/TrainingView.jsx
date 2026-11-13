import React, { useState } from 'react';
import {
  Dumbbell,
  Play,
  Check,
  Trash2,
  HelpCircle,
  TrendingUp,
  Award,
  Sparkles,
  Info,
  RotateCcw,
  Calculator,
  Flame,
  CheckCircle2
} from 'lucide-react';
import Panel from '../components/Panel.jsx';
import ExerciseVisual from '../components/ExerciseVisual.jsx';
import RestTimer from '../components/RestTimer.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { homePlans, gymPlans, getCustomTrainingDays } from '../lib/workoutPlans.js';
import { calculatePersonalRecords, getProgressiveOverloadAdvice } from '../lib/exerciseStats.js';
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
  const [session, setSession] = useState({});
  const [workoutNote, setWorkoutNote] = useState('');
  const [planMode, setPlanMode] = useState(() =>
    getCustomTrainingDays().length ? 'ai' : profile.training || 'home'
  );

  // 1RM Calculator State
  const [calcWeight, setCalcWeight] = useState(15);
  const [calcReps, setCalcReps] = useState(10);
  const [calculated1RM, setCalculated1RM] = useState(null);

  const customDays = getCustomTrainingDays();
  const effectiveMode = planMode === 'ai' && !customDays.length ? profile.training || 'home' : planMode;
  const currentPlans = effectiveMode === 'ai' ? customDays : effectiveMode === 'gym' ? gymPlans : homePlans;
  const personalRecords = calculatePersonalRecords(entries.workout);
  const prEntries = Object.entries(personalRecords).filter(([_, data]) => data.maxWeight > 0);

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

      {/* Program Grid */}
      <div className="trainingGrid">
        {currentPlans.map((plan, i) => {
          const isDoneToday = entries.workout.some(
            (e) => e.day === day && e.payload?.name === plan.name
          );

          return (
            <Panel
              key={plan.name}
              title={plan.name}
              sub={plan.focus}
              action={
                <button
                  type="button"
                  className="primary startLiveBtn"
                  onClick={() => onStartActiveWorkout(plan)}
                >
                  <Play size={14} fill="currentColor" /> {t('tr.start')}
                </button>
              }
            >
              <div className="exerciseList">
                {plan.moves.map((move, j) => {
                  const n = move.name || move[0];
                  const reps = move.sets || move[1];
                  const muscle = move.muscle || move[2] || 'Kas';
                  const tip = move.tip || move[3] || '';
                  const mistakes = move.commonMistakes || '';

                  const key = i + '|' + n;
                  const lastWorkout = entries.workout.find((e) => e.payload?.sets?.[n]);
                  const prevSet = lastWorkout?.payload?.sets?.[n];
                  const pr = personalRecords[n];
                  const advice = prevSet ? getProgressiveOverloadAdvice(prevSet, reps) : null;
                  const media = resolveExerciseMedia(n);

                  return (
                    <div className="exercise fx-studioExCard" key={key} style={{ display: 'block' }}>
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
                            {muscle} · {media.equipmentTr}
                          </small>
                        </div>
                        <div className="fx-exCardRightCluster">
                          <b className="exRepsBadge">{reps}</b>
                          <button
                            type="button"
                            className={`guideButton ${guide === key ? 'is-open' : ''}`}
                            onClick={() => setGuide(guide === key ? null : key)}
                          >
                            <HelpCircle size={12} /> Rehber {guide === key ? '−' : '+'}
                          </button>
                        </div>
                      </div>

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

                      {/* Manual Set Logging Inputs */}
                      <div className="fitInputs">
                        <label>
                          Kg
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder={prevSet?.kg ?? '0'}
                            value={session[key]?.kg ?? ''}
                            onChange={(e) =>
                              setSession((x) => ({
                                ...x,
                                [key]: { ...x[key], kg: e.target.value }
                              }))
                            }
                          />
                        </label>
                        <label>
                          Tekrar
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder={prevSet?.reps ?? '10'}
                            value={session[key]?.reps ?? ''}
                            onChange={(e) =>
                              setSession((x) => ({
                                ...x,
                                [key]: { ...x[key], reps: e.target.value }
                              }))
                            }
                          />
                        </label>
                        <label>
                          Set
                          <input
                            type="number"
                            min="1"
                            max="10"
                            placeholder="3"
                            value={session[key]?.sets ?? ''}
                            onChange={(e) =>
                              setSession((x) => ({
                                ...x,
                                [key]: { ...x[key], sets: e.target.value }
                              }))
                            }
                          />
                        </label>
                      </div>

                      {prevSet && (
                        <small className="smallHelp">
                          Önceki seans: {prevSet.kg} kg × {prevSet.reps} tekrar ({prevSet.sets} set).
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* End Workout with manual inputs */}
              <button
                type="button"
                className="secondary full"
                onClick={() => {
                  const sets = {};
                  plan.moves.forEach((m) => {
                    const n = m.name || m[0];
                    const v = session[i + '|' + n];
                    if (v && v.kg !== '' && v.reps !== '' && v.sets !== '') {
                      sets[n] = { kg: +v.kg, reps: +v.reps, sets: +v.sets };
                    }
                  });

                  if (!Object.keys(sets).length) {
                    alert('Lütfen en az bir hareketin kg, tekrar ve setini doldur veya yukarıdan "Başla" ile canlı antrenman modunu aç.');
                    return;
                  }

                  onAddWorkout({
                    name: plan.name,
                    note: workoutNote,
                    sets
                  });
                  setWorkoutNote('');
                  setSession({});
                }}
              >
                <Check size={16} /> Manuel Olarak Kaydet ve Bitir
              </button>
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
