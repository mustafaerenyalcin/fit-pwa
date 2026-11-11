import React, { useMemo, useState } from 'react';
import { Sparkles, Loader2, TrendingUp, AlertTriangle, Target, Dumbbell, Utensils, Moon, Scale } from 'lucide-react';
import { Card, Ring } from './ui.jsx';
import { callAI, buildContext } from '../lib/api.js';

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(iso(d));
  }
  return out;
}

/**
 * Haftalık rapor: son 7 günün yerel istatistikleri + AI teşhisi ("neden ilerlemiyorum?").
 * AI raporu 'report' kaydı olarak saklanır.
 */
export default function WeeklyReport({ profile, entries, target, onSaveReport }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const days = useMemo(() => lastDays(7), []);
  const since = days[0];

  const stats = useMemo(() => {
    const workouts = (entries.workout || []).filter((w) => w.day >= since);
    const workoutDays = new Set(workouts.map((w) => w.day)).size;

    const mealByDay = {};
    for (const m of (entries.meal || []).filter((x) => x.day >= since)) {
      mealByDay[m.day] = (mealByDay[m.day] || 0) + Number(m.payload?.protein || 0);
    }
    const loggedDays = Object.keys(mealByDay).length;
    const avgProtein = loggedDays ? Math.round(Object.values(mealByDay).reduce((a, b) => a + b, 0) / loggedDays) : 0;

    const sleeps = [
      ...(entries.habit || []).filter((h) => h.day >= since).map((h) => Number(h.payload?.sleep || 0)),
      ...(entries.checkin || []).filter((c) => c.day >= since).map((c) => Number(c.payload?.sleep || 0))
    ].filter(Boolean);
    const avgSleep = sleeps.length ? Math.round((sleeps.reduce((a, b) => a + b, 0) / sleeps.length) * 10) / 10 : null;

    const weights = (entries.weight || []).filter((w) => w.payload?.weight);
    const recent = weights.find((w) => w.day >= since);
    const before = weights.find((w) => w.day < since);
    const weightDelta = recent && before ? Math.round((recent.payload.weight - before.payload.weight) * 10) / 10 : null;

    const heat = days.map((d) => ({
      d,
      workout: workouts.some((w) => w.day === d),
      meal: !!mealByDay[d]
    }));

    return { workoutDays, loggedDays, avgProtein, avgSleep, weightDelta, heat };
  }, [entries, since, days]);

  const latestReport = (entries.report || [])[0];
  const report = latestReport?.payload;
  const reportIsFresh = latestReport && latestReport.day >= since;

  const generate = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await callAI('weekly', {
        profile,
        context: buildContext({ entries, target, days: 7 }) + `\nHaftalık hedef antrenman günü: ${profile.trainingFrequency || 4}`
      });
      const d = res.data || {};
      onSaveReport({
        score: Math.max(0, Math.min(100, Number(d.score) || 0)),
        headline: d.headline || '',
        wins: Array.isArray(d.wins) ? d.wins : [],
        issues: Array.isArray(d.issues) ? d.issues : [],
        diagnosis: d.diagnosis || '',
        actions: Array.isArray(d.actions) ? d.actions.slice(0, 3) : [],
        stats: { ...stats, heat: undefined }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const goal = Number(profile.trainingFrequency) || 4;

  return (
    <div className="fx-stack">
      <Card title="Son 7 gün" subtitle="Verilerinden otomatik hesaplanır">
        <div className="fx-statGrid">
          <div className="fx-stat">
            <Dumbbell size={16} />
            <b>
              {stats.workoutDays}/{goal}
            </b>
            <small>antrenman günü</small>
          </div>
          <div className="fx-stat">
            <Utensils size={16} />
            <b>{stats.avgProtein || '—'} g</b>
            <small>ort. protein (hedef {target.protein})</small>
          </div>
          <div className="fx-stat">
            <Moon size={16} />
            <b>{stats.avgSleep ?? '—'} sa</b>
            <small>ort. uyku</small>
          </div>
          <div className="fx-stat">
            <Scale size={16} />
            <b>{stats.weightDelta === null ? '—' : `${stats.weightDelta > 0 ? '+' : ''}${stats.weightDelta} kg`}</b>
            <small>kilo değişimi</small>
          </div>
        </div>
        <div className="fx-heat">
          {stats.heat.map((h) => (
            <div key={h.d} className="fx-heatDay">
              <span className={`dot ${h.workout ? 'on' : ''}`} title="Antrenman" />
              <span className={`dot meal ${h.meal ? 'on' : ''}`} title="Beslenme kaydı" />
              <small>{new Date(h.d + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'narrow' })}</small>
            </div>
          ))}
        </div>
      </Card>

      {report && (
        <Card tone="accent">
          <div className="fx-reportHead">
            <Ring value={report.score} size={76} stroke={8}>
              <b>{report.score}</b>
              <small>puan</small>
            </Ring>
            <div>
              <span className="fx-eyebrow">
                <Sparkles size={12} /> AI HAFTALIK RAPOR · {latestReport.day}
              </span>
              <h3>{report.headline}</h3>
            </div>
          </div>

          {report.diagnosis && (
            <div className="fx-diagnosis">
              <b>Teşhis</b>
              <p>{report.diagnosis}</p>
            </div>
          )}

          <div className="fx-grid2 fx-reportLists">
            {report.wins?.length > 0 && (
              <div>
                <h4>
                  <TrendingUp size={14} /> İyi gidenler
                </h4>
                <ul>{report.wins.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
            {report.issues?.length > 0 && (
              <div>
                <h4>
                  <AlertTriangle size={14} /> Dikkat
                </h4>
                <ul>{report.issues.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
          </div>

          {report.actions?.length > 0 && (
            <div className="fx-actions">
              <h4>
                <Target size={14} /> Gelecek hafta için 3 aksiyon
              </h4>
              <ol>{report.actions.map((a, i) => <li key={i}>{a}</li>)}</ol>
            </div>
          )}
        </Card>
      )}

      {error && <div className="fx-alert fx-alert--error">{error}</div>}

      <button type="button" className="fx-btn fx-btn--primary fx-btn--block fx-btn--lg" onClick={generate} disabled={busy}>
        {busy ? <Loader2 size={18} className="fx-spin" /> : <Sparkles size={18} />}
        {busy ? 'Haftan analiz ediliyor…' : reportIsFresh ? 'Raporu güncelle' : 'Haftalık AI raporumu oluştur'}
      </button>
      {stats.loggedDays < 3 && (
        <p className="fx-muted fx-small fx-center">
          İpucu: Daha isabetli bir teşhis için haftada en az 3 gün beslenme kaydı gir.
        </p>
      )}
    </div>
  );
}
