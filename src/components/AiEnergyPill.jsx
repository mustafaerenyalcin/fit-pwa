import React, { useState, useEffect } from 'react';
import { Zap, Crown, Sparkles } from 'lucide-react';
import { getAiQuota } from '../lib/aiQuota.js';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';

export default function AiEnergyPill({ onOpenSubscription, onOpenModal, showLabel = true, className = '' }) {
  const { t } = useI18n();
  const [quota, setQuota] = useState(getAiQuota);

  useEffect(() => {
    const handleUpdate = () => setQuota(getAiQuota());
    window.addEventListener('fit-ai-quota-changed', handleUpdate);
    return () => window.removeEventListener('fit-ai-quota-changed', handleUpdate);
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    sounds.tap();
    const fn = onOpenSubscription || onOpenModal;
    if (fn) {
      fn();
    }
  };

  if (quota.isPro) {
    return (
      <button
        type="button"
        className={`fx-energyPill fx-energyPill--pro ${className}`}
        onClick={handleClick}
        title="Atelier Black: Unlimited AI & Vision Access"
      >
        <Crown size={13} color="#f5c451" />
        <span className="fx-energyPillText">ATELIER BLACK</span>
      </button>
    );
  }

  const isLow = quota.remaining <= 1;
  const isDepleted = quota.remaining === 0;

  return (
    <button
      type="button"
      className={`fx-energyPill ${isDepleted ? 'depleted' : isLow ? 'low' : ''} ${className}`}
      onClick={handleClick}
      title={t('header.aiEnergy')}
    >
      <Zap size={13} className={isLow ? 'animate-pulse' : ''} />
      <span className="fx-energyPillText">
        {showLabel && <span className="fx-energyPillPrefix">{t('header.aiEnergy')}: </span>}
        <b>{quota.remaining}</b>/{quota.max}
      </span>
      {isDepleted && <span className="fx-energyPillUpgradeTag">PRO</span>}
    </button>
  );
}
