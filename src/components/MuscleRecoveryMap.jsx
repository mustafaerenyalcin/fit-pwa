import React, { useMemo, useState } from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { sounds } from '../lib/audio.js';

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

export default function MuscleRecoveryMap({ entries = {}, day }) {
  const [selected, setSelected] = useState('shoulders');

  const recovery = useMemo(() => {
    const now = new Date();
    const result = {};

    for (const [id, meta] of Object.entries(MUSCLE_META)) {
      result[id] = { id, label: meta.label, pct: 100, lastTrained: null, setsDone: 0 };
    }

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
    if (pct >= 80) return '#c8ff00'; // Hazır (Volt)
    if (pct >= 50) return '#f5c451'; // Toparlanıyor (Sarı)
    return '#ff4d1c'; // Dinlenmeli (Solar Corsa)
  };

  const statusLabel = (pct) => {
    if (pct >= 80) return 'Antrenmana Hazır';
    if (pct >= 50) return 'Toparlanıyor';
    return 'Dinlenmeli';
  };

  const activeMuscle = recovery[selected] || recovery.shoulders;

  const handleSelect = (id) => {
    sounds.tap();
    setSelected(id);
  };

  return (
    <div className="fx-card fx-muscleRecoveryCard">
      <div className="fx-muscleHeadRow">
        <div>
          <span className="fx-zenModuleEyebrow">TOPARLANMA RADARI</span>
          <h3 className="fx-muscleTitle">Kas Toparlanma Haritası</h3>
        </div>
        <span className="fx-muscleActiveTag" style={{ color: colorFor(activeMuscle.pct), borderColor: `${colorFor(activeMuscle.pct)}40` }}>
          <ShieldCheck size={12} />
          {activeMuscle.label}: %{activeMuscle.pct} ({statusLabel(activeMuscle.pct)})
        </span>
      </div>

      <div className="fx-muscleLayout">
        {/* Anatomik Tam Vücut SVG Haritası */}
        <div className="fx-bodySvgWrap">
          <svg viewBox="0 0 160 270" className="fx-bodySvg" aria-label="Kas haritası">
            {/* Baş & Boyun */}
            <circle cx="80" cy="18" r="13" fill="#1e2330" />
            <rect x="76" y="30" width="8" height="9" rx="3" fill="#1e2330" />

            {/* Omuzlar (Shoulders) */}
            <g
              className={`fx-musclePart ${selected === 'shoulders' ? 'selected' : ''}`}
              onClick={() => handleSelect('shoulders')}
            >
              <ellipse cx="50" cy="46" rx="12" ry="9" fill={colorFor(recovery.shoulders.pct)} />
              <ellipse cx="110" cy="46" rx="12" ry="9" fill={colorFor(recovery.shoulders.pct)} />
            </g>

            {/* Göğüs (Chest) */}
            <g
              className={`fx-musclePart ${selected === 'chest' ? 'selected' : ''}`}
              onClick={() => handleSelect('chest')}
            >
              <path d="M58 40 H102 L98 64 H62 Z" rx="6" fill={colorFor(recovery.chest.pct)} />
            </g>

            {/* Sırt / Kanat (Back) */}
            <g
              className={`fx-musclePart ${selected === 'back' ? 'selected' : ''}`}
              onClick={() => handleSelect('back')}
            >
              <path d="M54 62 L62 64 L66 100 L58 92 Z" fill={colorFor(recovery.back.pct)} />
              <path d="M106 62 L98 64 L94 100 L102 92 Z" fill={colorFor(recovery.back.pct)} />
            </g>

            {/* Karın / Core */}
            <g
              className={`fx-musclePart ${selected === 'core' ? 'selected' : ''}`}
              onClick={() => handleSelect('core')}
            >
              <rect x="66" y="66" width="28" height="38" rx="4" fill={colorFor(recovery.core.pct)} />
              <line x1="80" y1="67" x2="80" y2="103" stroke="#090a0f" strokeWidth="1.5" />
              <line x1="68" y1="79" x2="92" y2="79" stroke="#090a0f" strokeWidth="1.5" />
              <line x1="68" y1="91" x2="92" y2="91" stroke="#090a0f" strokeWidth="1.5" />
            </g>

            {/* Kollar (Arms) */}
            <g
              className={`fx-musclePart ${selected === 'arms' ? 'selected' : ''}`}
              onClick={() => handleSelect('arms')}
            >
              <rect x="36" y="52" width="11" height="42" rx="5" fill={colorFor(recovery.arms.pct)} />
              <rect x="113" y="52" width="11" height="42" rx="5" fill={colorFor(recovery.arms.pct)} />
              {/* Ön kollar */}
              <rect x="34" y="96" width="10" height="38" rx="4" fill={colorFor(recovery.arms.pct)} />
              <rect x="116" y="96" width="10" height="38" rx="4" fill={colorFor(recovery.arms.pct)} />
            </g>

            {/* Bacaklar (Legs: Üst Bacak + Diz + Kalf + Ayaklar) */}
            <g
              className={`fx-musclePart ${selected === 'legs' ? 'selected' : ''}`}
              onClick={() => handleSelect('legs')}
            >
              {/* Sol Üst Bacak */}
              <path d="M62 108 H77 L75 165 H64 Z" fill={colorFor(recovery.legs.pct)} />
              {/* Sağ Üst Bacak */}
              <path d="M83 108 H98 L96 165 H85 Z" fill={colorFor(recovery.legs.pct)} />
              {/* Dizler */}
              <circle cx="69" cy="172" r="5" fill="#1e2330" />
              <circle cx="91" cy="172" r="5" fill="#1e2330" />
              {/* Kalf (Alt Bacak) */}
              <path d="M64 179 H74 L72 232 H66 Z" fill={colorFor(recovery.legs.pct)} />
              <path d="M86 179 H96 L94 232 H88 Z" fill={colorFor(recovery.legs.pct)} />
              {/* Ayaklar */}
              <path d="M62 233 H74 L76 244 H59 Z" rx="2" fill="#1e2330" />
              <path d="M86 233 H98 L101 244 H84 Z" rx="2" fill="#1e2330" />
            </g>
          </svg>
        </div>

        {/* 6 Kas Grubu Listesi */}
        <div className="fx-muscleListGrid">
          {Object.values(recovery).map((m) => {
            const active = selected === m.id;
            const c = colorFor(m.pct);
            return (
              <button
                key={m.id}
                type="button"
                className={`fx-muscleTile ${active ? 'active' : ''}`}
                onClick={() => handleSelect(m.id)}
              >
                <div className="fx-muscleTileHead">
                  <b>{m.label}</b>
                  <strong style={{ color: c }}>%{m.pct}</strong>
                </div>
                <div className="fx-muscleMiniTrack">
                  <span style={{ width: `${m.pct}%`, backgroundColor: c }} />
                </div>
                <small className="fx-muscleTileStatus">{statusLabel(m.pct)}</small>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
