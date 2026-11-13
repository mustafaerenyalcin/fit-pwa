import React, { useState, useMemo } from 'react';
import { Flame, Trophy, Shield, Zap, Sparkles, Award, ShieldCheck, Search } from 'lucide-react';
import { calculateGamification } from '../lib/streaks.js';
import UserAvatar from './UserAvatar.jsx';
import AiEnergyPill from './AiEnergyPill.jsx';
import BadgesModal from './BadgesModal.jsx';
import StreakVaultModal from './StreakVaultModal.jsx';
import AthletePassportModal from './AthletePassportModal.jsx';
import { sounds } from '../lib/audio.js';
import { celebration } from '../lib/celebration.js';
import { useI18n } from '../lib/i18n.js';

export default function AthleteHeaderBar({
  entries = {},
  profile = {},
  target = {},
  greeting = 'Merhaba',
  onOpenSubscription
}) {
  const { t, locale } = useI18n();
  const [showBadges, setShowBadges] = useState(false);
  const [showStreakVault, setShowStreakVault] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const g = useMemo(() => calculateGamification(entries, target), [entries, target]);
  const { streak, level, title, currentLevelXp, nextLevelXp, badges, xp } = g;

  const xpPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));
  const unlockedBadges = badges.filter((b) => b.unlocked).length;

  // Baş harfi büyük yap (örn. "iyi geceler" -> "İyi geceler")
  const capGreeting = greeting ? greeting.charAt(0).toLocaleUpperCase(locale || 'tr-TR') + greeting.slice(1) : 'Merhaba';

  const handleOpenBadges = (e = null) => {
    sounds.xpGain();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      celebration.sparks({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        color: '#f5c451',
        count: 20
      });
    }
    setShowBadges(true);
  };

  const handleOpenStreakVault = (e = null) => {
    sounds.tap();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      celebration.sparks({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        color: '#ff6600',
        count: 22
      });
    }
    setShowStreakVault(true);
  };

  return (
    <>
      <header className="fx-zenAthleteHeader">
        {/* SOL: AVATAR + SPORCU ADI + RÜTBE & XP */}
        <div className="fx-zenProfilePod" onClick={handleOpenBadges} role="button" tabIndex={0}>
          <div className="fx-zenAvatarWrap">
            <UserAvatar avatarUrl={profile?.avatarUrl} name={profile?.name || 'Sporcu'} size={44} />
            <span className="fx-zenLvlBadge">L{level}</span>
          </div>
          <div className="fx-zenUserMeta">
            <div className="fx-zenNameRow">
              <span className="fx-zenGreeting">{capGreeting},</span>
              <strong className="fx-zenName">{profile?.name || 'Sporcu'}</strong>
            </div>
            <div className="fx-zenRankPill">
              <span className="fx-zenRankTag">{title}</span>
              <span className="fx-zenDotSep">·</span>
              <span className="fx-zenXpDigits">
                <b>{currentLevelXp}</b>/{nextLevelXp} XP (%{xpPercent})
              </span>
            </div>
          </div>
        </div>

        {/* SAĞ: SERİ + AI ENERJİ + ROZETLER */}
        <div className="fx-zenHeaderActions">
          {/* SERİ FLAME PİLL (KASAYI AÇAR) */}
          <button
            type="button"
            className={`fx-zenStreakPill ${streak.current > 0 ? 'active' : ''} ${!streak.loggedToday && streak.current > 0 ? 'at-risk' : ''}`}
            onClick={handleOpenStreakVault}
            title={`${streak.current} ${t('header.dayShort')}`}
          >
            <Flame size={15} className={streak.current > 0 ? 'pulse' : ''} />
            <b>{streak.current}</b>
            <small>{t('header.dayShort')}</small>
            {streak.shieldUsed && (
              <Shield size={11} color="#00f0ff" title="Shield Active" />
            )}
          </button>

          {/* AI HAKKI / ENERJİ DÜĞMESİ */}
          <AiEnergyPill onOpenSubscription={onOpenSubscription} />

          {/* BAŞARIM ROZETLERİ DÜĞMESİ */}
          <button
            type="button"
            className="fx-zenBadgeBtn"
            onClick={handleOpenBadges}
            title={`${unlockedBadges}/${badges.length}`}
          >
            <Trophy size={13} color="#d97706" />
            <span>{unlockedBadges}</span>
          </button>

          {/* HIZLI SPOTLIGHT ARAMA (Ctrl+K) */}
          <button
            type="button"
            className="fx-zenBadgeBtn fx-zenCmdBtn"
            onClick={() => window.dispatchEvent(new CustomEvent('fit-open-spotlight'))}
            title="Spotlight (Ctrl+K)"
            aria-label="Spotlight Search"
          >
            <Search size={13} />
            <kbd>⌘K</kbd>
          </button>

          {/* DİJİTAL SPORCU PASAPORTU DÜĞMESİ */}
          <button
            type="button"
            className="fx-zenPassportBtn"
            onClick={() => {
              sounds.tap();
              setShowPassport(true);
            }}
            title={t('header.passport')}
          >
            <ShieldCheck size={14} />
            <span>{t('header.passport')}</span>
          </button>
        </div>
      </header>

      {/* SERİ & KALKAN KASASI MODALI */}
      {showStreakVault && (
        <StreakVaultModal
          streak={streak}
          onClose={() => setShowStreakVault(false)}
        />
      )}

      {/* ROZETLER MODALI */}
      {showBadges && (
        <BadgesModal
          badges={badges}
          xp={xp}
          level={level}
          onClose={() => setShowBadges(false)}
        />
      )}

      {/* DİJİTAL SPORCU PASAPORTU MODALI */}
      {showPassport && (
        <AthletePassportModal
          profile={profile}
          streak={streak}
          readiness={g.readiness}
          entries={entries}
          onClose={() => setShowPassport(false)}
        />
      )}
    </>
  );
}
