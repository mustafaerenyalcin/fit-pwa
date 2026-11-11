import React, { useMemo, useState } from 'react';
import { Sparkles, Play, RotateCcw, Loader2, Clock, Utensils, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Choice, Ring, Skeleton } from './ui.jsx';
import { callAI, buildContext } from '../lib/api.js';

const ENERGY = [
  { id: 'high', icon: '🔥', label: 'Zindeyim' },
  { id: 'normal', icon: '🙂', label: 'Normal' },
  { id: 'low', icon: '🥱', label: 'Yorgunum' },
  { id: 'stressed', icon: '😵‍💫', label: 'Stresliyim' }
];
const SLEEP = [
  { id: 5, label: '≤5 sa' },
  { id: 6, label: '6 sa' },
  { id: 7, label: '7 sa' },
  { id: 8, label: '8 sa' },
  { id: 9, label: '9+ sa' }
];
const SORE = [
  ['none', 'Ağrı yok'],
  ['shoulders', 'Omuz'],
  ['chest', 'Göğüs'],
  ['back', 'Sırt'],
  ['lowerback', 'Bel'],
  ['arms', 'Kol'],
  ['legs', 'Bacak']
];
const TIME = [
  { id: 'full', label: '45+ dk' },
  { id: 'medium', label: '30 dk' },
  { id: 'short', label: '15 dk' },
  { id: 'rest', label: 'Dinlenmek istiyorum' }
];

const labelOf = (list, id) => list.find((x) => (x.id ?? x[0]) === id)?.label ?? id;

/**
 * Günlük check-in kartı: 4 hızlı soru -> AI günün planını kurar.
 * Sonuç 'checkin' kaydı olarak saklanır ve cihazlar arası senkronize olur.
 */
export default function DailyCheckin({ day, profile, entries, target, todayPlan, onStartWorkout, onSave, onRemove }) {
  const existing = useMemo(() => (entries.checkin || []).find((c) => c.day === day), [entries.checkin, day]);
  const plan = existing?.payload?.plan;

  const [energy, setEnergy] = useState('normal');
  const [sleep, setSleep] = useState(7);
  const [sore, setSore] = useState(['none']);
  const [time, setTime] = useState('full');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showMeals, setShowMeals] = useState(false);

  const toggleSore = (id) => {
    if (id === 'none') return setSore(['none']);
    const next = sore.filter((x) => x !== 'none');
    const updated = next.includes(id) ? next.filter((x) => x !== id) : [...next, id];
    setSore(updated.length ? updated : ['none']);
  };

  const analyze = async () => {
    setBusy(true);
    setError('');
    const soreLabels = sore.includes('none') ? 'Yok' : sore.map((s) => SORE.find(([id]) => id === s)?.[1]).join(', ');
    const planText = todayPlan && !todayPlan.rest && todayPlan.moves
      ? `${todayPlan.name} (${todayPlan.moves.map((m) => m.name).join(', ')})`
      : 'Bugün programda dinlenme günü';

    const question = `Bugünkü check-in'im:
- Enerji/mod: ${labelOf(ENERGY, energy)}
- Dün gece uyku: ${labelOf(SLEEP, sleep)}
- Ağrıyan/yorgun bölgeler: ${soreLabels}
- Ayırabileceğim süre: ${labelOf(TIME, time)}
- Programdaki bugünkü antrenman: ${planText}
${note.trim() ? `- Not: ${note.trim()}` : ''}
Günlük protein hedefim: ${target?.protein || '?'} g.`;

    try {
      const res = await callAI('checkin', {
        profile,
        context: buildContext({ entries, target }),
        question
      });
      const data = res.data || {};
      onSave({
        energy,
        energyLabel: labelOf(ENERGY, energy),
        sleep,
        sore,
        time,
        note: note.trim(),
        plan: {
          headline: data.headline || 'Günün planı hazır',
          readiness: Math.max(0, Math.min(100, Number(data.readiness) || 70)),
          message: data.message || '',
          workout: data.workout && Array.isArray(data.workout.moves) && data.workout.moves.length ? data.workout : null,
          meals: Array.isArray(data.meals) ? data.meals.slice(0, 5) : [],
          tips: Array.isArray(data.tips) ? data.tips.slice(0, 4) : []
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startAiWorkout = () => {
    const w = plan.workout;
    onStartWorkout({
      name: w.name || 'Günün Antrenmanı',
      focus: w.focus || '',
      custom: true,
      moves: w.moves.map((m) => ({
        name: m.name,
        muscle: m.muscle || 'Kas',
        sets: m.sets || '3 × 10-12',
        defaultSets: Number(m.defaultSets) || 3,
        restSeconds: Number(m.restSeconds) || 75,
        suggestedKg: m.suggestedKg ?? '',
        tip: m.tip || '',
        alternatives: Array.isArray(m.alternatives) ? m.alternatives : []
      }))
    });
  };

  /* ---------- Sonuç ---------- */
  if (plan) {
    const readinessColor = plan.readiness >= 75 ? 'var(--fx-accent)' : plan.readiness >= 50 ? '#f5c451' : '#ff8a65';
    return (
      <section className="fx-card fx-plan">
        <div className="fx-planHead">
          <Ring value={plan.readiness} size={68} stroke={7} color={readinessColor}>
            <b>{plan.readiness}</b>
            <small>hazır</small>
          </Ring>
          <div className="fx-planTitle">
            <span className="fx-eyebrow">
              <Sparkles size={12} /> BUGÜNÜN PLANI
            </span>
            <h2>{plan.headline}</h2>
            {plan.message && <p>{plan.message}</p>}
          </div>
        </div>

        {plan.workout ? (
          <div className="fx-planWorkout">
            <div className="fx-planWorkoutHead">
              <div>
                <b>{plan.workout.name}</b>
                <small>
                  <Clock size={12} /> ~{plan.workout.durationMin || 30} dk · {plan.workout.moves.length} hareket
                </small>
              </div>
              <button type="button" className="fx-btn fx-btn--primary" onClick={startAiWorkout}>
                <Play size={16} fill="currentColor" /> Başla
              </button>
            </div>
            <ol className="fx-moveList">
              {plan.workout.moves.map((m, i) => (
                <li key={i}>
                  <span>{m.name}</span>
                  <small>
                    {m.sets}
                    {m.suggestedKg && m.suggestedKg !== '0' ? ` · ${m.suggestedKg} kg` : ''}
                  </small>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="fx-alert fx-alert--info">Bugün toparlanma günü. Hafif yürüyüş ve esneme yeterli.</div>
        )}

        {plan.meals?.length > 0 && (
          <div className="fx-planSection">
            <button type="button" className="fx-collapse" onClick={() => setShowMeals((v) => !v)}>
              <Utensils size={15} /> Bugünün öğün önerileri
              {showMeals ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showMeals && (
              <ul className="fx-mealIdeas">
                {plan.meals.map((m, i) => (
                  <li key={i}>
                    <b>{m.title}</b>
                    <span>{m.idea}</span>
                    {m.protein ? <em>{m.protein} g protein</em> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {plan.tips?.length > 0 && (
          <ul className="fx-tips">
            {plan.tips.map((t, i) => (
              <li key={i}>
                <Lightbulb size={14} /> {t}
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="fx-btn fx-btn--text fx-btn--sm" onClick={() => onRemove(existing.id)}>
          <RotateCcw size={14} /> Check-in'i yenile
        </button>
      </section>
    );
  }

  /* ---------- Sorular ---------- */
  return (
    <section className="fx-card fx-checkin">
      <div className="fx-checkinHead">
        <span className="fx-eyebrow">
          <Sparkles size={12} /> GÜNLÜK CHECK-IN · 20 SANİYE
        </span>
        <h2>Bugün nasılsın, {profile.name || 'şampiyon'}?</h2>
        <p className="fx-muted">Cevaplarına göre bugünkü antrenmanını ve öğünlerini yeniden kuracağım.</p>
      </div>

      {busy ? (
        <div className="fx-thinking">
          <Loader2 size={20} className="fx-spin" />
          <span>Verilerini inceliyorum ve planını hazırlıyorum…</span>
          <Skeleton lines={4} />
        </div>
      ) : (
        <>
          <div className="fx-q">
            <span className="fx-qLabel">Enerjin</span>
            <div className="fx-choiceRow">
              {ENERGY.map((o) => (
                <Choice key={o.id} compact active={energy === o.id} onClick={() => setEnergy(o.id)} icon={o.icon} title={o.label} />
              ))}
            </div>
          </div>

          <div className="fx-q">
            <span className="fx-qLabel">Dün gece uyku</span>
            <div className="fx-choiceRow">
              {SLEEP.map((o) => (
                <Choice key={o.id} compact active={sleep === o.id} onClick={() => setSleep(o.id)} title={o.label} />
              ))}
            </div>
          </div>

          <div className="fx-q">
            <span className="fx-qLabel">Ağrı / yorgunluk</span>
            <div className="fx-choiceRow wrap">
              {SORE.map(([id, label]) => (
                <Choice key={id} compact active={sore.includes(id)} onClick={() => toggleSore(id)} title={label} />
              ))}
            </div>
          </div>

          <div className="fx-q">
            <span className="fx-qLabel">Bugün ne kadar vaktin var?</span>
            <div className="fx-choiceRow wrap">
              {TIME.map((o) => (
                <Choice key={o.id} compact active={time === o.id} onClick={() => setTime(o.id)} title={o.label} />
              ))}
            </div>
          </div>

          <input
            className="fx-noteInput"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Eklemek istediğin bir şey var mı? (opsiyonel)"
            maxLength={200}
          />

          {error && <div className="fx-alert fx-alert--error">{error}</div>}

          <button type="button" className="fx-btn fx-btn--primary fx-btn--block fx-btn--lg" onClick={analyze}>
            <Sparkles size={18} /> Günümü planla
          </button>
        </>
      )}
    </section>
  );
}
