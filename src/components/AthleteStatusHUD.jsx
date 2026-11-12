import React, { useState, useMemo } from 'react';
import { Flame, Trophy, Shield, Zap, Sparkles, ChevronRight, Award, Check } from 'lucide-react';
import { calculateGamification } from '../lib/streaks.js';
import UserAvatar from './UserAvatar.jsx';
import { sounds } from '../lib/audio.js';

export default function AthleteStatusHUD({ entries, profile, target }) {
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const g = useMemo(() => calculateGamification(entries, target), [entries, target]);
  const { streak, level, title, currentLevelXp, nextLevelXp, badges, xp } = g;

  const xpPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));
  const unlockedBadges = badges.filter((b) => b.unlocked).length;

  const openBadges = () => {
    sounds.tap();
    setShowBadgeModal(true);
  };

  return (
    <>
      <div className="fx-athleteHudCard" onClick={openBadges} role="button" tabIndex={0}>
        <div className="fx-hudAmbientGlow" />

        <div className="fx-hudMainRow">
          {/* SOL: AVATAR VE SEVİYE ETİKETİ */}
          <div className="fx-hudAvatarPod">
            <div className="fx-hudAvatarWrap">
              <UserAvatar avatarUrl={profile?.avatarUrl} name={profile?.name || 'Sporcu'} size={48} />
              <span className="fx-hudLvlBadge">LVL {level}</span>
            </div>
            <div className="fx-hudUserMeta">
              <div className="fx-hudRankTitle">
                <span className="fx-hudRankEyebrow">RÜTBE // ATLET</span>
                <b>{title.toUpperCase()}</b>
              </div>
              <span className="fx-hudTotalXp">
                <Zap size={11} color="#f5c451" /> {xp.toLocaleString()} TOPLAM XP
              </span>
            </div>
          </div>

          {/* SAĞ: SERİ VE KALKAN GÖSTERGESİ */}
          <div className="fx-hudStreakPod">
            <div className={`fx-hudFlameBox ${streak.current > 0 ? 'active' : ''}`}>
              <Flame size={20} className={streak.current > 0 ? 'pulse' : ''} />
              <div className="fx-hudStreakDigits">
                <b>{streak.current}</b>
                <small>GÜN SERİ</small>
              </div>
            </div>
            {streak.shieldUsed ? (
              <span className="fx-shieldActivePill animate-pulse" title="Dinlenme Kalkanı serini korudu">
                <Shield size={10} fill="currentColor" /> Kalkan Aktif
              </span>
            ) : (
              <span className="fx-shieldStandbyPill" title={`${streak.shieldsRemaining} adet seri kalkanın hazır`}>
                <Shield size={10} /> {streak.shieldsRemaining} Kalkan
              </span>
            )}
          </div>
        </div>

        {/* ALT: XP İLERLEME ÇUBUĞU */}
        <div className="fx-hudXpTrack">
          <div className="fx-hudXpLabels">
            <span>
              Seviye {level} → <b>Seviye {level + 1}</b>
            </span>
            <span>
              <b>{currentLevelXp}</b> / {nextLevelXp} XP (%{xpPercent})
            </span>
          </div>
          <div className="fx-hudProgressBar">
            <div className="fx-hudProgressFill" style={{ width: `${xpPercent}%` }}>
              <span className="fx-hudProgressNeonTip" />
            </div>
          </div>
          <div className="fx-hudBadgesHint">
            <Award size={12} color="#00f0ff" />
            <span>
              {unlockedBadges}/{badges.length} Başarım Rozeti Açıldı · İncelemek için tıkla
            </span>
            <ChevronRight size={13} className="fx-hudArrow" />
          </div>
        </div>
      </div>

      {/* BAŞARIM VE ROZETLER MODALI */}
      {showBadgeModal && (
        <div className="fx-modalBackdrop" onClick={() => setShowBadgeModal(false)}>
          <div
            className="fx-modal fx-badgesModal animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fx-modalHead">
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <Trophy size={20} color="#f5c451" /> Sporcu Başarımları & Rozetler
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
                  Antrenman yaptıkça, ağırlık kaldırdıkça ve seri yaptıkça XP kazan ve seviye atla.
                </p>
              </div>
              <button
                type="button"
                className="fx-modalClose"
                onClick={() => setShowBadgeModal(false)}
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
      )}
    </>
  );
}
