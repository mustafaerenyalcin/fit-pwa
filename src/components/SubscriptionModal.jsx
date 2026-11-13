import React, { useState, useEffect } from 'react';
import { Crown, Check, Shield, Zap, Users, Copy, Link2, LogOut } from 'lucide-react';
import { upgradeToPro, cancelPro, getAiMembership, getAiQuota } from '../lib/aiQuota.js';
import { getAuthState } from '../lib/supabase.js';
import {
  FAMILY_MAX_SEATS,
  getFamilyStatus,
  activateFamilyPlan,
  joinFamilyByCode,
  leaveOrRemoveFamilyMember,
  buildFamilyInviteUrl,
  getPendingFamilyInvite
} from '../lib/familyPlan.js';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';
import LegalModal from './LegalModal.jsx';

export default function SubscriptionModal({ initialPlan = 'beta', onClose, onSuccess }) {
  const { t } = useI18n();
  const [selectedMode, setSelectedMode] = useState(initialPlan === 'family' ? 'family' : 'beta');
  const [membership, setMembership] = useState(getAiMembership);
  const [quota, setQuota] = useState(getAiQuota);
  const [legalType, setLegalType] = useState(null);

  const authUser = getAuthState()?.user;
  const [familyState, setFamilyState] = useState({ source: 'local', group: null, migrationNeeded: false });
  const [inviteCodeInput, setInviteCodeInput] = useState(() => getPendingFamilyInvite());
  const [familyMsg, setFamilyMsg] = useState('');
  const [familyErr, setFamilyErr] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [familyBusy, setFamilyBusy] = useState(false);

  const refreshState = async () => {
    setMembership(getAiMembership());
    setQuota(getAiQuota());
    if (authUser?.id) {
      const res = await getFamilyStatus(authUser);
      setFamilyState(res);
    }
  };

  useEffect(() => {
    refreshState();
  }, [authUser?.id]);

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

  const handleStartFamily = async () => {
    setFamilyErr('');
    setFamilyMsg('');
    setFamilyBusy(true);
    try {
      const res = await activateFamilyPlan(authUser, '');
      sounds.success();
      setFamilyState(res);
      setMembership(getAiMembership());
      setQuota(getAiQuota());
      setFamilyMsg('4 Kişilik Aile Planı oluşturuldu! Davet linkini veya kodunu arkadaşlarına gönderebilirsin.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setFamilyErr(err?.message || 'Aile planı başlatılamadı.');
    } finally {
      setFamilyBusy(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    setFamilyErr('');
    setFamilyMsg('');
    setFamilyBusy(true);
    try {
      const res = await joinFamilyByCode(authUser, inviteCodeInput, '');
      sounds.success();
      setFamilyState(res);
      setMembership(getAiMembership());
      setQuota(getAiQuota());
      setInviteCodeInput('');
      setFamilyMsg('Harika! Kendi hesabınla Aile Planına bağlandın ve Pro erişimin aktif edildi.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setFamilyErr(err?.message || 'Davet kodu doğrulanamadı.');
    } finally {
      setFamilyBusy(false);
    }
  };

  const handleLeaveOrCloseFamily = async () => {
    setFamilyErr('');
    setFamilyBusy(true);
    try {
      const res = await leaveOrRemoveFamilyMember(authUser, authUser?.id);
      sounds.tap();
      setFamilyState(res || { source: 'local', group: null, migrationNeeded: false });
      setMembership(getAiMembership());
      setQuota(getAiQuota());
    } catch (err) {
      setFamilyErr(err?.message || 'İşlem başarısız.');
    } finally {
      setFamilyBusy(false);
    }
  };

  const copyFamilyInvite = (withLink = true) => {
    const code = familyState.group?.inviteCode;
    if (!code) return;
    const text = withLink ? buildFamilyInviteUrl(code) : code;
    navigator.clipboard?.writeText(text).catch(() => {});
    sounds.tap();
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2200);
  };

  const activeGroup = familyState.group;
  const seatCount = activeGroup?.members?.length || 0;

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

        {/* Plan Seçim Sekmeleri: Bireysel vs 4 Kişilik Aile Planı */}
        <div
          role="tablist"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            padding: 4,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--fx-border)',
            marginBottom: 14
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedMode === 'beta'}
            className={`fx-btn fx-btn--sm ${selectedMode === 'beta' ? 'fx-solarBtn' : 'fx-btn--ghost'}`}
            onClick={() => setSelectedMode('beta')}
          >
            <Zap size={14} /> Bireysel Pro
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedMode === 'family'}
            className={`fx-btn fx-btn--sm ${selectedMode === 'family' ? 'fx-solarBtn' : 'fx-btn--ghost'}`}
            onClick={() => setSelectedMode('family')}
          >
            <Users size={14} /> Aile Planı (4 Kişi)
          </button>
        </div>

        {selectedMode === 'beta' ? (
          <>
            <div className="fx-subFeatureList">
              <div className="fx-subFeatureItem">
                <div className="fx-subCheckIcon">
                  <Zap size={14} color="#ff4d1c" />
                </div>
                <div>
                  <b>
                    {membership.isPro
                      ? membership.plan === 'family'
                        ? `Aile Planı Aktif (${membership.familyCode || '4 Kişilik'})`
                        : 'Açık Beta Test Modu Aktif'
                      : `Bugünkü Kalan AI Hakkı: ${quota.remaining} / ${quota.max}`}
                  </b>
                  <p>
                    {membership.isPro
                      ? 'Yerel istemci kotası kaldırıldı; bulut AI çağrıları sunucu günlük limitine tabidir.'
                      : 'Barkod tarama, plaka hesabı, kronometre, 4 kişilik squad ve antrenman takibi her zaman sınırsızdır.'}
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
            </div>
          </>
        ) : (
          <div className="fx-stack" style={{ gap: 12 }}>
            <div className="fx-subFeatureItem" style={{ padding: 12, borderRadius: 12, background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
              <div className="fx-subCheckIcon">
                <Users size={15} color="#06b6d4" />
              </div>
              <div>
                <b>Her Üye Kendi Hesabıyla Katılır (4 Koltuk)</b>
                <p style={{ margin: '3px 0 0', fontSize: 12 }}>
                  Aynı şifreyi paylaşmak yok: 1 kişi Aile Planını açar, 3 arkadaşı Google / Apple veya e-posta hesabıyla giriş yapıp davet linkiyle kendi hesabına Pro açar.
                </p>
              </div>
            </div>

            {familyMsg && (
              <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', fontSize: 12 }}>
                {familyMsg}
              </div>
            )}
            {familyErr && (
              <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171', fontSize: 12 }}>
                {familyErr}
              </div>
            )}

            {activeGroup ? (
              <div style={{ padding: 14, borderRadius: 14, border: '1px solid var(--fx-border)', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: 13 }}>Aile Davet Kodu</strong>
                  <span className="fx-squadTierTag pro">
                    {seatCount} / {activeGroup.maxSeats || FAMILY_MAX_SEATS} Koltuk Dolu
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <code style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.28)', fontSize: 14, fontWeight: 800, letterSpacing: '0.06em' }}>
                    {activeGroup.inviteCode}
                  </code>
                  <button type="button" className="fx-btn fx-btn--sm fx-btn--ghost" onClick={() => copyFamilyInvite(false)}>
                    {copiedInvite ? <Check size={13} color="#10b981" /> : <Copy size={13} />} Kod
                  </button>
                  <button type="button" className="fx-btn fx-btn--sm fx-solarBtn" onClick={() => copyFamilyInvite(true)}>
                    <Link2 size={13} /> Link Kopyala
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(activeGroup.members || []).map((m) => (
                    <div key={m.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                      <span>
                        {m.role === 'owner' ? '👑' : '🤝'} <b>{m.name}</b> {m.userId === authUser?.id ? '(Sen)' : ''}
                      </span>
                      <span className="fx-muted">{m.role === 'owner' ? 'Plan Sahibi' : 'Üye Hesabı'}</span>
                    </div>
                  ))}
                </div>

                <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={handleLeaveOrCloseFamily} disabled={familyBusy}>
                  <LogOut size={13} /> {activeGroup.ownerId === authUser?.id ? 'Aile Planını Kapat' : 'Aile Grubundan Ayrıl'}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
                  onClick={handleStartFamily}
                  disabled={familyBusy}
                >
                  <Crown size={18} /> {familyBusy ? 'Hazırlanıyor…' : '4 Kişilik Aile Planı Oluştur & Davet Kodu Al'}
                </button>

                <div className="fx-corpDividerText" style={{ margin: '4px 0' }}>
                  <span>VEYA ARKADAŞ DAVETİYLE KATIL</span>
                </div>

                <form onSubmit={handleJoinByCode} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Örn: FIT-FAM-7K9P"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    style={{ flex: 1, textTransform: 'uppercase' }}
                    aria-label="Aile Davet Kodu"
                  />
                  <button type="submit" className="fx-btn fx-btn--primary" disabled={familyBusy || !inviteCodeInput.trim()}>
                    Katıl &amp; Pro Aç
                  </button>
                </form>
              </>
            )}
          </div>
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

        {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
      </div>
    </div>
  );
}
