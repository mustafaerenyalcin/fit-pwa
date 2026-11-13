import React, { useState } from 'react';
import { Crown, Check, Shield, Zap } from 'lucide-react';
import { upgradeToPro, cancelPro, getAiMembership, getAiQuota } from '../lib/aiQuota.js';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';
import LegalModal from './LegalModal.jsx';

export default function SubscriptionModal({ onClose, onSuccess }) {
  const { t } = useI18n();
  const [membership, setMembership] = useState(getAiMembership);
  const [quota, setQuota] = useState(getAiQuota);
  const [legalType, setLegalType] = useState(null);

  const handleEnableBeta = () => {
    sounds.success();
    upgradeToPro('beta');
    setMembership(getAiMembership());
    setQuota(getAiQuota());
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleRevertStandard = () => {
    sounds.tap();
    cancelPro();
    setMembership(getAiMembership());
    setQuota(getAiQuota());
    onClose();
  };

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div
        className="fx-modal fx-subscriptionModal animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="fx-modalClose" onClick={onClose}>
          ✕
        </button>

        <div className="fx-subModalHead">
          <div className="fx-subCrownBadge">
            <Crown size={20} color="#f59e0b" />
            <span>ATELIER OPEN BETA</span>
          </div>
          <h2 className="fx-subTitle">{t('subModal.betaTitle')}</h2>
          <p className="fx-subDesc">{t('subModal.betaDesc')}</p>
        </div>

        <div className="fx-subFeatureList">
          <div className="fx-subFeatureItem">
            <div className="fx-subCheckIcon">
              <Zap size={14} color="#ff4d1c" />
            </div>
            <div>
              <b>
                {membership.isPro
                  ? 'Açık Beta Test Modu Aktif'
                  : `Bugünkü Kalan AI Hakkı: ${quota.remaining} / ${quota.max}`}
              </b>
              <p>
                {membership.isPro
                  ? 'Yerel istemci kotası Açık Beta kapsamında kaldırıldı; bulut AI çağrıları sunucu günlük limitine tabidir.'
                  : 'Barkod tarama, plaka hesabı, kronometre, 4 kişilik yerel squad ve antrenman takibi her zaman sınırsızdır.'}
              </p>
            </div>
          </div>

          <div className="fx-subFeatureItem">
            <div className="fx-subCheckIcon">
              <Check size={14} color="#10b981" />
            </div>
            <div>
              <b>{t('subModal.guaranteeTitle')}</b>
              <p>{t('subModal.guaranteeText')}</p>
            </div>
          </div>
        </div>

        <div className="fx-subGuaranteeBox">
          <Shield size={16} color="#06b6d4" />
          <span>
            Gerçek ödeme veya kart bilgisi istenmez. İleri aşamada yalnızca gerçek mağaza / ödeme altyapısı eklendiğinde abonelik açılacaktır.
          </span>
        </div>

        <div className="fx-subActionsRow">
          {!membership.isPro ? (
            <button
              type="button"
              className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
              onClick={handleEnableBeta}
            >
              <Crown size={18} /> {t('subModal.betaEnable')}
            </button>
          ) : (
            <button
              type="button"
              className="fx-btn fx-btn--ghost fx-btn--block"
              onClick={handleRevertStandard}
            >
              {t('subModal.betaDisable')}
            </button>
          )}

          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid var(--fx-border)',
              display: 'flex',
              justifyContent: 'center',
              gap: 14,
              fontSize: 11,
              color: 'var(--fx-muted)'
            }}
          >
            <button
              type="button"
              onClick={() => setLegalType('terms')}
              style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
            >
              {t('subModal.eula')}
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalType('privacy')}
              style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
            >
              {t('subModal.privacy')}
            </button>
          </div>
        </div>

        {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
      </div>
    </div>
  );
}
