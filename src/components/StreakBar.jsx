import React, { useMemo, useState } from 'react';
import { Flame, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateGamification } from '../lib/streaks.js';

export default function StreakBar({ entries, target }) {
  const [open, setOpen] = useState(false);
  const g = useMemo(() => calculateGamification(entries, target), [entries, target]);
  const { streak, level, title, currentLevelXp, nextLevelXp, badges } = g;
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <section className="fx-card fx-streakCard">
      <div className="fx-streakTop" onClick={() => setOpen((v) => !v)} role="button" tabIndex={0}>
        <div className="fx-streakLeft">
          <div className={`fx-flameBadge ${streak.current > 0 ? 'lit' : ''}`}>
            <Flame size={20} fill={streak.current > 0 ? 'currentColor' : 'none'} />
            <b>{streak.current}</b>
          </div>
          <div>
            <div className="fx-streakTitleRow">
              <b>{streak.current > 0 ? `${streak.current} Günlük Seri!` : 'Seriyi Başlat'}</b>
              <span className="fx-levelPill">Sv. {level} · {title}</span>
            </div>
            <small className="fx-muted">
              {streak.loggedToday
                ? 'Bugünkü kaydın tamam · Serin güvende!'
                : 'Bugün check-in, su, öğün veya antrenman kaydederek serini koru'}
            </small>
          </div>
        </div>

        <div className="fx-streakRight">
          <div className="fx-weekDots" aria-label="Son 7 gün">
            {streak.last7.map((d) => (
              <span
                key={d.day}
                className={`fx-dayDot ${d.active ? 'on' : ''} ${d.isToday ? 'today' : ''}`}
                title={d.day}
              >
                {d.label}
              </span>
            ))}
          </div>
          {open ? <ChevronUp size={18} className="fx-mutedIcon" /> : <ChevronDown size={18} className="fx-mutedIcon" />}
        </div>
      </div>

      {open && (
        <div className="fx-streakDrawer">
          <div className="fx-xpBarWrap">
            <div className="fx-rowBetween fx-small">
              <span>
                <Trophy size={14} style={{ verticalAlign: '-2px', marginRight: 4, color: 'var(--fx-accent)' }} />
                Seviye {level}: <b>{title}</b>
              </span>
              <span className="fx-muted">
                {currentLevelXp} / {nextLevelXp} XP (En iyi seri: {streak.best} gün)
              </span>
            </div>
            <div className="fx-waterBar" style={{ margin: '8px 0 0' }}>
              <span style={{ width: `${Math.round((currentLevelXp / nextLevelXp) * 100)}%`, background: 'var(--fx-accent)' }} />
            </div>
          </div>

          <div className="fx-badgeGrid">
            {badges.map((b) => (
              <div key={b.id} className={`fx-badgeItem ${b.unlocked ? 'unlocked' : 'locked'}`}>
                <span className="fx-badgeIcon">{b.icon}</span>
                <div>
                  <b>{b.name}</b>
                  <small>{b.desc}</small>
                </div>
              </div>
            ))}
          </div>
          <small className="fx-muted fx-center" style={{ display: 'block', marginTop: 8 }}>
            Açılan rozetler: {unlockedCount} / {badges.length}
          </small>
        </div>
      )}
    </section>
  );
}
