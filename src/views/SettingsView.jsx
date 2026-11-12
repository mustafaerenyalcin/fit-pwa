import React, { useEffect, useState } from 'react';
import { Cloud, RefreshCw, Download, Upload, LogOut, Trash2, Smartphone, Shield, FileText, Sun, Moon, Bell, Globe, Crown, Zap } from 'lucide-react';
import ProfileView from './ProfileView.jsx';
import AvatarPicker from '../components/AvatarPicker.jsx';
import SubscriptionModal from '../components/SubscriptionModal.jsx';
import LegalModal from '../components/LegalModal.jsx';
import { Segmented, Card } from '../components/ui.jsx';
import { getAuthState, getSyncState, sync, signout, deleteAccount } from '../lib/supabase.js';
import { exportBackup, importBackup } from '../lib/store.js';
import { getTheme, setTheme, getReminderConfig, toggleMorningReminder } from '../lib/notifications.js';
import { getAiMembership, getAiQuota } from '../lib/aiQuota.js';
import { useI18n } from '../lib/i18n.js';

const APP_VERSION = '4.0.0 Global';

export default function SettingsView({ profile, onSaveProfile, installed, setMessage, onRetakeOnboarding }) {
  const { lang, setLang, t, languages } = useI18n();
  const [section, setSection] = useState('profile');
  const [, force] = useState(0);
  const [themeMode, setThemeMode] = useState(getTheme);
  const [reminder, setReminder] = useState(getReminderConfig);
  const [membership, setMembership] = useState(getAiMembership);
  const [quota, setQuota] = useState(getAiQuota);
  const [showSubModal, setShowSubModal] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null); // 'privacy' | 'terms' | null
  const { user } = getAuthState();
  const syncState = getSyncState();

  useEffect(() => {
    const h = () => force((x) => x + 1);
    const handleQuota = () => {
      setMembership(getAiMembership());
      setQuota(getAiQuota());
    };
    window.addEventListener('fit-sync-change', h);
    window.addEventListener('fit-ai-quota-changed', handleQuota);
    return () => {
      window.removeEventListener('fit-sync-change', h);
      window.removeEventListener('fit-ai-quota-changed', handleQuota);
    };
  }, []);

  const doSync = async () => {
    try {
      await sync();
      setMessage('Senkronizasyon tamamlandı.');
    } catch (e) {
      setMessage('Senkronizasyon başarısız: ' + e.message);
    }
  };

  const doDelete = async () => {
    const ok = prompt(
      'Hesabın ve buluttaki TÜM verilerin kalıcı olarak silinecek. Bu işlem geri alınamaz.\n\nOnaylamak için SİL yaz:'
    );
    if (ok?.trim().toLocaleUpperCase('tr-TR') !== 'SİL') return;
    try {
      await deleteAccount();
    } catch (e) {
      setMessage(e.message);
    }
  };

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <div className="fx-stack">
      {/* ATELIER BLACK ÜYELİK VE ABONELİK KARTI */}
      <div className="fx-membershipCard">
        <div className="fx-membershipStatusCol">
          <div className="fx-membershipBadgeRow">
            <span className={`fx-membershipBadge ${membership.isPro ? 'pro' : 'free'}`}>
              {membership.isPro ? '👑 ATELIER BLACK (PRO)' : 'CORE ATHLETE (FREE)'}
            </span>
            {!membership.isPro && (
              <span style={{ fontSize: 11, color: 'var(--fx-muted)' }}>
                ⚡ {t('header.aiEnergy')}: {quota.remaining}/{quota.max}
              </span>
            )}
          </div>
          <h4>{membership.isPro ? t('settings.proTitle') : t('settings.freeTitle')}</h4>
          <p>
            {membership.isPro
              ? t('settings.proSub')
              : t('settings.freeSub')}
          </p>
        </div>

        <button
          type="button"
          className={`fx-btn ${membership.isPro ? 'fx-btn--ghost' : 'fx-solarBtn'} fx-btn--sm`}
          style={{ whiteSpace: 'nowrap', fontWeight: 800 }}
          onClick={() => setShowSubModal(true)}
        >
          {membership.isPro ? t('settings.manageSub') : t('settings.upgradeBtn')}
        </button>
      </div>

      <Card title={t('settings.langTitle')} subtitle={t('settings.langSub')}>
        <div className="fx-langGrid">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`fx-langCardBtn ${lang === l.code ? 'active' : ''}`}
              onClick={() => {
                setLang(l.code);
                setMessage?.(`${l.flag} ${l.name}`);
              }}
            >
              <span className="fx-langFlag">{l.flag}</span>
              <div>
                <b>{l.name}</b>
                <small>{l.speechLang}</small>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {onRetakeOnboarding && (
        <div className="fx-recalibrateBanner">
          <div>
            <h4>{t('settings.recalibrateTitle')}</h4>
            <p>{t('settings.recalibrateSub')}</p>
          </div>
          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--sm"
            onClick={onRetakeOnboarding}
            style={{ whiteSpace: 'nowrap' }}
          >
            {t('settings.recalibrateBtn')}
          </button>
        </div>
      )}

      <Segmented
        value={section}
        onChange={setSection}
        options={[
          ['profile', t('settings.tabProfile')],
          ['account', t('settings.tabAccount')]
        ]}
      />

      {section === 'profile' && (
        <div className="fx-stack">
          <AvatarPicker
            avatarUrl={profile?.avatarUrl}
            userName={profile?.name || 'Sporcu'}
            onSelectAvatar={(url) => {
              onSaveProfile({ avatarUrl: url });
              setMessage?.(url ? 'Profil resmi güncellendi.' : 'Profil resmi kaldırıldı.');
            }}
          />
          <ProfileView profile={profile} onSaveProfile={onSaveProfile} />
        </div>
      )}

      {section === 'account' && (
        <>
          <Card title="Hesap" subtitle={user?.email}>
            <div className="fx-rowBetween">
              <div className="fx-syncInfo">
                <Cloud size={18} className="fx-accentIcon" />
                <div>
                  <b>{syncState.inProgress ? 'Senkronize ediliyor…' : syncState.error ? 'Senkronizasyon hatası' : 'Bulutla senkronize'}</b>
                  <small>
                    {syncState.error
                      ? syncState.error
                      : syncState.lastSyncAt
                        ? `Son: ${new Date(syncState.lastSyncAt).toLocaleString('tr-TR')}`
                        : 'Verilerin tüm cihazlarında aynı'}
                  </small>
                </div>
              </div>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={doSync} disabled={syncState.inProgress}>
                <RefreshCw size={15} className={syncState.inProgress ? 'fx-spin' : ''} /> Şimdi
              </button>
            </div>
          </Card>

          {!installed && (
            <Card title="Telefonuna uygulama olarak ekle" subtitle="Tam ekran, daha hızlı, ana ekrandan tek dokunuş">
              <div className="fx-install">
                <Smartphone size={20} />
                <p>
                  {isIOS ? (
                    <>
                      Safari'de alttaki <b>Paylaş</b> simgesine dokun → <b>Ana Ekrana Ekle</b>.
                    </>
                  ) : (
                    <>
                      Tarayıcı menüsünden (⋮) <b>Uygulamayı yükle</b> veya <b>Ana ekrana ekle</b>'ye dokun.
                    </>
                  )}
                </p>
              </div>
            </Card>
          )}

          <Card title="Görünüm ve Bildirimler" subtitle="Tema tercihi ve günlük sabah check-in hatırlatıcısı">
            <div className="fx-stack" style={{ gap: 12 }}>
              <div className="fx-rowBetween">
                <div className="fx-syncInfo">
                  {themeMode === 'light' ? <Sun size={18} className="fx-accentIcon" /> : <Moon size={18} className="fx-accentIcon" />}
                  <div>
                    <b>Uygulama Teması</b>
                    <small>{themeMode === 'light' ? 'Açık tema aktif' : 'Koyu tema aktif (OLED dostu)'}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="fx-btn fx-btn--ghost fx-btn--sm"
                  onClick={() => {
                    const next = setTheme(themeMode === 'dark' ? 'light' : 'dark');
                    setThemeMode(next);
                  }}
                >
                  {themeMode === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
                </button>
              </div>

              <div className="fx-rowBetween" style={{ borderTop: '1px solid var(--fx-border)', paddingTop: 12 }}>
                <div className="fx-syncInfo">
                  <Bell size={18} className="fx-accentIcon" />
                  <div>
                    <b>Sabah Check-in & Su Hatırlatıcısı</b>
                    <small>{reminder.enabled ? `Her gün ${reminder.time} bildirim açık` : 'Günlük bildirimler kapalı'}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className={`fx-btn fx-btn--sm ${reminder.enabled ? 'fx-btn--primary' : 'fx-btn--ghost'}`}
                  onClick={async () => {
                    try {
                      const next = await toggleMorningReminder(!reminder.enabled, reminder.time);
                      setReminder(next);
                      setMessage(next.enabled ? 'Günlük bildirimler açıldı.' : 'Bildirimler kapatıldı.');
                    } catch (e) {
                      setMessage(e.message);
                    }
                  }}
                >
                  {reminder.enabled ? 'Açık' : 'Aç'}
                </button>
              </div>
            </div>
          </Card>

          <Card title="Verilerim" subtitle="Verilerin sana aittir; istediğin zaman indirebilirsin.">
            <div className="fx-btnRow">
              <button
                type="button"
                className="fx-btn fx-btn--ghost"
                onClick={() => {
                  exportBackup();
                  setMessage('Yedek dosyası indirildi.');
                }}
              >
                <Download size={16} /> Yedeği indir
              </button>
              <label className="fx-btn fx-btn--ghost">
                <Upload size={16} /> Yedeği geri yükle
                <input
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      if (!confirm('Yedekteki veriler mevcut verilerinin yerine geçecek. Devam edilsin mi?')) return;
                      importBackup(await file.text());
                      setMessage('Yedek geri yüklendi.');
                    } catch (err) {
                      setMessage('Yedek yüklenemedi: ' + err.message);
                    } finally {
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>
          </Card>

          <Card>
            <div className="fx-listLinks">
              <button
                type="button"
                onClick={() => setLegalModalType('privacy')}
                style={{ textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Shield size={16} /> Gizlilik Politikası (KVKK)
              </button>
              <button
                type="button"
                onClick={() => setLegalModalType('terms')}
                style={{ textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <FileText size={16} /> Kullanım Koşulları
              </button>
              <button type="button" onClick={() => signout()}>
                <LogOut size={16} /> Çıkış yap
              </button>
              <button type="button" className="danger" onClick={doDelete}>
                <Trash2 size={16} /> Hesabımı ve verilerimi sil
              </button>
            </div>
          </Card>

          <p className="fx-muted fx-small fx-center">Fit v{APP_VERSION} · Fit tıbbi tavsiye vermez.</p>
        </>
      )}

      {showSubModal && (
        <SubscriptionModal onClose={() => setShowSubModal(false)} />
      )}

      {legalModalType && (
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </div>
  );
}
