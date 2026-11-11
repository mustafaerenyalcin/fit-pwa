import React, { useEffect, useState } from 'react';
import { Cloud, RefreshCw, Download, Upload, LogOut, Trash2, Smartphone, Shield, FileText } from 'lucide-react';
import ProfileView from './ProfileView.jsx';
import { Segmented, Card } from '../components/ui.jsx';
import { getAuthState, getSyncState, sync, signout, deleteAccount } from '../lib/supabase.js';
import { exportBackup, importBackup } from '../lib/store.js';

const APP_VERSION = '1.0.0';

export default function SettingsView({ profile, onSaveProfile, installed, setMessage }) {
  const [section, setSection] = useState('profile');
  const [, force] = useState(0);
  const { user } = getAuthState();
  const syncState = getSyncState();

  useEffect(() => {
    const h = () => force((x) => x + 1);
    window.addEventListener('fit-sync-change', h);
    return () => window.removeEventListener('fit-sync-change', h);
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
      <Segmented
        value={section}
        onChange={setSection}
        options={[
          ['profile', 'Profil ve hedefler'],
          ['account', 'Hesap ve veriler']
        ]}
      />

      {section === 'profile' && <ProfileView profile={profile} onSaveProfile={onSaveProfile} />}

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
              <a href="/gizlilik.html" target="_blank" rel="noreferrer">
                <Shield size={16} /> Gizlilik Politikası
              </a>
              <a href="/kosullar.html" target="_blank" rel="noreferrer">
                <FileText size={16} /> Kullanım Koşulları
              </a>
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
    </div>
  );
}
