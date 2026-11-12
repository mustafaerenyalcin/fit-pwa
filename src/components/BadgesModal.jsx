import React from 'react';
import { Trophy, Check, Zap } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function BadgesModal({ badges = [], xp = 0, level = 1, onClose }) {
  const unlockedBadges = badges.filter((b) => b.unlocked).length;

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div
        className="fx-modal fx-badgesModal animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fx-modalHead">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Trophy size={20} color="#f5c451" /> Sporcu Başarımları &amp; Rozetler
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
              Seviye {level} Atlet · {xp.toLocaleString()} Toplam XP · {unlockedBadges}/{badges.length} Rozet Açıldı
            </p>
          </div>
          <button
            type="button"
            className="fx-modalClose"
            onClick={() => {
              sounds.tap();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        <div className="fx-badgesGrid">
          {badges.map((b) => (
            <div key={b.id} className={`fx-badgeCard ${b.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="fx-badgeCardIconBox">
                <span>{b.icon}</span>
                {b.unlocked && (
                  <span className="fx-badgeUnlockedCheck">
                    <Check size={10} color="#000" />
                  </span>
                )}
              </div>
              <div>
                <b>{b.name}</b>
                <p>{b.desc}</p>
                <span className="fx-badgeStatusTag">
                  {b.unlocked ? 'KAZANILDI (+150 XP)' : 'KİLİTLİ'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
