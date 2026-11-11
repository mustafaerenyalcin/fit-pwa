import React, { useMemo, useState } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { Card } from './ui.jsx';

/**
 * Hareket adından ve kas etiketinden hangi ana kas grubunun çalıştığını tespit eder.
 */
function detectMuscleGroups(exName = '', muscleTag = '') {
  const s = `${exName} ${muscleTag}`.toLocaleLowerCase('tr-TR');
  const groups = new Set();

  if (/omuz|shoulder|lateral|pike|arnold|rear delt|face pull|y-raise|shrug/.test(s)) groups.add('shoulders');
  if (/göğüs|chest|push-up|push up|floor press|bench press|fly|şınav/.test(s)) groups.add('chest');
  if (/sırt|back|row|pull|barfiks|lat|deadlift|rdl|bel/.test(s)) groups.add('back');
  if (/karın|core|abs|plank|crunch|leg raise|twist|hollow|dead bug/.test(s)) groups.add('core');
  if (/kol|biceps|triceps|curl|extension|dip|kickback|hammer/.test(s)) groups.add('arms');
  if (/bacak|leg|squat|lunge|split|calf|glute|kalça|hamstring|quad|hip thrust|step-up/.test(s)) groups.add('legs');

  return Array.from(groups);
}

const MUSCLE_META = {
  shoulders: { label: 'Omuz', hoursToRecover: 48 },
  chest: { label: 'Göğüs', hoursToRecover: 60 },
  back: { label: 'Sırt & Bel', hoursToRecover: 60 },
  core: { label: 'Karın / Core', hoursToRecover: 36 },
  arms: { label: 'Kol (Biceps/Triceps)', hoursToRecover: 40 },
  legs: { label: 'Bacak & Kalça', hoursToRecover: 72 }
};

/**
 * Son antrenmanlara ve bugünkü check-in ağrı bildirimine göre
 * her kas grubunun toparlanma yüzdesini (0-100) hesaplar ve SVG vücut haritasında gösterir.
 */
export default function MuscleRecoveryMap({ entries = {}, day }) {
  const [selected, setSelected] = useState('shoulders');

  const recovery = useMemo(() => {
    const now = new Date();
    const result = {};

    for (const [id, meta] of Object.entries(MUSCLE_META)) {
      result[id] = { id, label: meta.label, pct: 100, lastTrained: null, setsDone: 0 };
    }

    // Son 4 gündeki antrenmanları tara
    const recentWorkouts = (entries.workout || []).slice(0, 10);
    for (const w of recentWorkouts) {
      const wDate = new Date((w.created || w.day + 'T12:00:00'));
      const hoursAgo = Math.max(1, (now - wDate) / 3_600_000);
      if (hoursAgo > 96) continue;

      const setsObj = w.payload?.sets || {};
      for (const [exName, setData] of Object.entries(setsObj)) {
        const groups = detectMuscleGroups(exName, w.payload?.name || '');
        const setCount = Array.isArray(setData?.list) ? setData.list.length : 3;
        for (const g of groups) {
          const meta = MUSCLE_META[g];
          if (!meta) continue;
          const fatigue = Math.max(0, 1 - hoursAgo / meta.hoursToRecover) * Math.min(1, setCount / 4);
          const nextPct = Math.round(Math.max(20, 100 - fatigue * 80));
          if (nextPct < result[g].pct) {
            result[g].pct = nextPct;
            result[g].lastTrained = w.day;
          }
          result[g].setsDone += setCount;
        }
      }
    }

    // Bugünkü check-in'de ağrı bildirildiyse yorgunluğu güncelle
    const todayCheckin = (entries.checkin || []).find((c) => c.day === day);
    const soreList = todayCheckin?.payload?.sore || [];
    const soreMap = {
      shoulders: 'shoulders',
      chest: 'chest',
      back: 'back',
      lowerback: 'back',
      arms: 'arms',
      legs: 'legs'
    };
    for (const s of soreList) {
      const targetGroup = soreMap[s];
      if (targetGroup && result[targetGroup]) {
        result[targetGroup].pct = Math.min(result[targetGroup].pct, 35);
        result[targetGroup].soreReported = true;
      }
    }

    return result;
  }, [entries.workout, entries.checkin, day]);

  const colorFor = (pct) => {
    if (pct >= 80) return '#b3f46f'; // Hazır (Yeşil)
    if (pct >= 50) return '#f5c451'; // Toparlanıyor (Sarı)
    return '#ff6b6b'; // Dinlenmeli (Kırmızı)
  };

  const statusLabel = (pct) => {
    if (pct >= 80) return 'Antrenmana Hazır';
    if (pct >= 50) return 'Toparlanıyor';
    return 'Dinlenmeli / Yorgun';
  };

  const activeMuscle = recovery[selected] || recovery.shoulders;

  return (
    <Card
      title="Kas Toparlanma Haritası"
      subtitle="Son antrenmanların ve ağrı bildirimlerine göre kaslarının hazırlık durumu"
      action={
        <span className="fx-tag" style={{ color: colorFor(activeMuscle.pct) }}>
          <ShieldCheck size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          {activeMuscle.label}: %{activeMuscle.pct}
        </span>
      }
    >
      <div className="fx-muscleLayout">
        {/* Anatomik SVG Vücut Haritası */}
        <div className="fx-bodySvgWrap">
          <svg viewBox="0 0 200 280" className="fx-bodySvg" aria-label="Kas haritası">
            {/* Baş & Boyun */}
            <circle cx="100" cy="26" r="16" fill="#243142" />
            <rect x="93" y="42" width="14" height="10" rx="4" fill="#243142" />

            {/* Omuzlar (Shoulders) */}
            <g
              className={`fx-musclePart ${selected === 'shoulders' ? 'selected' : ''}`}
              onClick={() => setSelected('shoulders')}
            >
              <ellipse cx="62" cy="64" rx="16" ry="13" fill={colorFor(recovery.shoulders.pct)} />
              <ellipse cx="138" cy="64" rx="16" ry="13" fill={colorFor(recovery.shoulders.pct)} />
            </g>

            {/* Göğüs (Chest) */}
            <g
              className={`fx-musclePart ${selected === 'chest' ? 'selected' : ''}`}
              onClick={() => setSelected('chest')}
            >
              <path d="M74 54 H126 L122 86 H78 Z" rx="8" fill={colorFor(recovery.chest.pct)} />
            </g>

            {/* Sırt / Kanat (Back - yan kanatlar olarak gösterilir) */}
            <g
              className={`fx-musclePart ${selected === 'back' ? 'selected' : ''}`}
              onClick={() => setSelected('back')}
            >
              <path d="M70 84 L78 86 L82 128 L73 118 Z" fill={colorFor(recovery.back.pct)} />
              <path d="M130 84 L122 86 L118 128 L127 118 Z" fill={colorFor(recovery.back.pct)} />
            </g>

            {/* Karın / Core */}
            <g
              className={`fx-musclePart ${selected === 'core' ? 'selected' : ''}`}
              onClick={() => setSelected('core')}
            >
              <rect x="82" y="88" width="36" height="48" rx="8" fill={colorFor(recovery.core.pct)} />
              <line x1="100" y1="90" x2="100" y2="134" stroke="#0b1018" strokeWidth="2" />
              <line x1="84" y1="104" x2="116" y2="104" stroke="#0b1018" strokeWidth="2" />
              <line x1="84" y1="119" x2="116" y2="119" stroke="#0b1018" strokeWidth="2" />
            </g>

            {/* Kollar (Arms) */}
            <g
              className={`fx-musclePart ${selected === 'arms' ? 'selected' : ''}`}
              onClick={() => setSelected('arms')}
            >
              <rect x="46" y="78" width="16" height="58" rx="8" fill={colorFor(recovery.arms.pct)} />
              <rect x="138" y="78" width="16" height="58" rx="8" fill={colorFor(recovery.arms.pct)} />
            </g>

            {/* Bacaklar (Legs) */}
            <g
              className={`fx-musclePart ${selected === 'legs' ? 'selected' : ''}`}
              onClick={() => setSelected('legs')}
            >
              <path d="M76 140 H98 L94 252 H78 Z" fill={colorFor(recovery.legs.pct)} />
              <path d="M102 140 H124 L122 252 H106 Z" fill={colorFor(recovery.legs.pct)} />
            </g>
          </svg>
        </div>

        {/* Kas Grubu Listesi */}
        <div className="fx-muscleList">
          {Object.values(recovery).map((m) => (
            <button
              key={m.id}
              type="button"
              className={`fx-muscleRow ${selected === m.id ? 'active' : ''}`}
              onClick={() => setSelected(m.id)}
            >
              <div className="fx-muscleRowTop">
                <b>{m.label}</b>
                <span style={{ color: colorFor(m.pct) }}>%{m.pct}</span>
              </div>
              <div className="fx-muscleBar">
                <span style={{ width: `${m.pct}%`, background: colorFor(m.pct) }} />
              </div>
              <small className="fx-muted">
                {statusLabel(m.pct)}
                {m.lastTrained ? ` · Son: ${m.lastTrained}` : ''}
                {m.soreReported ? ' · Ağrı bildirildi' : ''}
              </small>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
