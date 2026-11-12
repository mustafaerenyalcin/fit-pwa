import React, { useState } from 'react';
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  Shield,
  X,
  ArrowRight,
  Flame,
  Award,
  Lock,
  Users
} from 'lucide-react';
import { upgradeToPro, cancelPro, getAiMembership } from '../lib/aiQuota.js';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';
import LegalModal from './LegalModal.jsx';

export default function SubscriptionModal({ initialPlan = 'yearly', onClose, onSuccess }) {
  const { t } = useI18n();
  const currentMembership = getAiMembership();
  const [billingCycle, setBillingCycle] = useState(initialPlan); // 'yearly' | 'monthly' | 'family'
  const [processing, setProcessing] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [legalType, setLegalType] = useState(null);
  const [restoreNotice, setRestoreNotice] = useState('');

  const handleRestorePurchases = () => {
    sounds.tap();
    setRestoreNotice(t('subModal.restoreChecking'));
    setTimeout(() => {
      const mem = getAiMembership();
      if (mem.isPro) {
        setRestoreNotice(t('subModal.restoreFound'));
      } else {
        setRestoreNotice(t('subModal.restoreNone'));
      }
      setTimeout(() => setRestoreNotice(''), 4000);
    }, 800);
  };

  const handleSubscribe = () => {
    sounds.success();
    setProcessing(true);

    setTimeout(() => {
      upgradeToPro(billingCycle);
      setProcessing(false);
      setCelebrate(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1400);
    }, 800);
  };

  const handleCancelTest = () => {
    sounds.tap();
    cancelPro();
    onClose();
  };

  const features = [
    { title: t('subModal.f1t'), desc: t('subModal.f1d') },
    { title: t('subModal.f2t'), desc: t('subModal.f2d') },
    { title: t('subModal.f3t'), desc: t('subModal.f3d') },
    { title: t('subModal.f4t'), desc: t('subModal.f4d') },
    { title: t('subModal.f5t'), desc: t('subModal.f5d') },
    { title: t('subModal.f6t'), desc: t('subModal.f6d') }
  ];

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div
        className="fx-modal fx-subscriptionModal animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="fx-modalClose" onClick={onClose}>
          ✕
        </button>

        {celebrate ? (
          <div className="fx-subSuccessScreen animate-scale-in">
            <Crown size={54} color="#f5c451" className="animate-bounce" />
            <h2 style={{ color: '#fff', margin: '14px 0 6px' }}>
              {billingCycle === 'family' ? 'GYM BUDDY SQUAD DEVREDE!' : 'ATELIER BLACK\'E HOŞ GELDİN'}
            </h2>
            <p style={{ color: 'var(--fx-muted)', fontSize: 14 }}>
              {billingCycle === 'family'
                ? '4 kişilik Squad slotun açıldı. Arkadaşlarını davet et, ortak seriyi başlat!'
                : 'Tüm AI ve Vision sınırları kaldırıldı. Antrenman ve beslenmende elit seviyedesin!'}
            </p>
          </div>
        ) : (
          <>
            {/* ÜST LÜKS HERO BANNER */}
            <div className="fx-subModalHead">
              <div className="fx-subCrownBadge">
                <Crown size={20} color="#f5c451" />
                <span>ATELIER BLACK &amp; SQUAD PASS</span>
              </div>
              <h2 className="fx-subTitle">{t('subModal.title')}</h2>
              <p className="fx-subDesc">
                {t('subModal.desc')}
              </p>
            </div>

            {/* 3 PLAN SEÇİCİSİ (YILLIK / AYLIK / AİLE & SQUAD) */}
            <div className="fx-subBillingSelector fx-subBillingSelector--trio">
              {/* 1. YILLIK BİREYSEL */}
              <button
                type="button"
                className={`fx-subBillingTab ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setBillingCycle('yearly');
                }}
              >
                <div className="fx-subTabBadge">{t('subModal.save40')}</div>
                <b>{t('subModal.yearly')}</b>
                <div className="fx-subPriceRow">
                  <span>₺</span>
                  <strong>119</strong>
                  <small>{t('subModal.perMonth')}</small>
                </div>
                <small className="fx-subBilledInfo">{t('subModal.yearlyInfo')}</small>
              </button>

              {/* 2. AYLIK BİREYSEL */}
              <button
                type="button"
                className={`fx-subBillingTab ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setBillingCycle('monthly');
                }}
              >
                <b>{t('subModal.monthly')}</b>
                <div className="fx-subPriceRow">
                  <span>₺</span>
                  <strong>199</strong>
                  <small>{t('subModal.perMonth')}</small>
                </div>
                <small className="fx-subBilledInfo">{t('subModal.monthlyInfo')}</small>
              </button>

              {/* 3. AİLE & GYM BUDDY SQUAD (MAX 4 KİŞİ) */}
              <button
                type="button"
                className={`fx-subBillingTab fx-subBillingTab--squad ${billingCycle === 'family' ? 'active' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setBillingCycle('family');
                }}
              >
                <div className="fx-subTabBadge fx-subTabBadge--squad">{t('subModal.squadBadge')}</div>
                <b>{t('subModal.squad')}</b>
                <div className="fx-subPriceRow">
                  <span>₺</span>
                  <strong>299</strong>
                  <small>{t('subModal.perMonth')}</small>
                </div>
                <small className="fx-subBilledInfo">{t('subModal.squadInfo')}</small>
              </button>
            </div>

            {/* ÖZELLİK LİSTESİ */}
            <div className="fx-subFeatureList">
              <span className="fx-subLabel">
                {billingCycle === 'family' ? t('subModal.perksSquad') : t('subModal.perksPro')}
              </span>
              {features.map((f, idx) => (
                <div key={idx} className="fx-subFeatureItem">
                  <div className="fx-subCheckIcon">
                    <Check size={14} color="#f5c451" />
                  </div>
                  <div>
                    <b>{f.title}</b>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* SIFIR TUZAK GÜVENCESİ */}
            <div className="fx-subGuaranteeBox">
              <Shield size={16} color="#00f0ff" />
              <span>
                <b>{t('subModal.guaranteeTitle')}</b> {t('subModal.guaranteeText')}
              </span>
            </div>

            {/* EYLEM BUTONU */}
            <div className="fx-subActionsRow">
              <button
                type="button"
                className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
                onClick={handleSubscribe}
                disabled={processing}
                style={{
                  background: billingCycle === 'family'
                    ? 'linear-gradient(135deg, #00f0ff 0%, #ff4d1c 100%)'
                    : 'linear-gradient(135deg, #f5c451 0%, #ff4d1c 100%)',
                  color: '#090a0f',
                  fontWeight: 900
                }}
              >
                {billingCycle === 'family' ? <Users size={18} /> : <Crown size={18} />}
                {processing
                  ? t('subModal.processing')
                  : billingCycle === 'family'
                  ? t('subModal.ctaSquad')
                  : billingCycle === 'yearly'
                  ? t('subModal.ctaYearly')
                  : t('subModal.ctaMonthly')}
              </button>

              {restoreNotice && (
                <div style={{ marginTop: 10, fontSize: 12, color: restoreNotice.startsWith('✓') ? '#c8ff00' : 'var(--fx-muted)', textAlign: 'center' }}>
                  {restoreNotice}
                </div>
              )}

              {/* APP STORE & GOOGLE PLAY YASAL VE GERİ YÜKLEME ÇUBUĞU */}
              <div style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <button
                  type="button"
                  onClick={handleRestorePurchases}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--fx-muted)',
                    fontSize: 12,
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  {t('subModal.restore')}
                </button>

                <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--fx-muted)' }}>
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

                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255, 255, 255, 0.35)', lineHeight: 1.4, maxWidth: 360 }}>
                  {t('subModal.autoRenew')}
                </p>
              </div>
            </div>
          </>
        )}

        {legalType && (
          <LegalModal type={legalType} onClose={() => setLegalType(null)} />
        )}
      </div>
    </div>
  );
}
