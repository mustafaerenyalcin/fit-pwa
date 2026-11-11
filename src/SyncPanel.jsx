import React, { useState, useEffect } from 'react';
import { fitAuth } from './webBridge.js';
import { Cloud, CheckCircle2, AlertCircle, RefreshCw, LogOut, KeyRound } from 'lucide-react';

export default function SyncPanel({ onReload }) {
  const [state, setState] = useState({ configured: !!fitAuth.cloud, email: null });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const initialCreds = fitAuth.getCredentials ? fitAuth.getCredentials() : { url: '', key: '' };
  const [inputUrl, setInputUrl] = useState(initialCreds.url || '');
  const [inputKey, setInputKey] = useState(initialCreds.key || '');

  useEffect(() => {
    let active = true;
    const update = async () => {
      const s = await fitAuth.status();
      if (active) setState(s);
    };
    update();
    window.addEventListener('fit-sync-change', update);
    return () => {
      active = false;
      window.removeEventListener('fit-sync-change', update);
    };
  }, []);

  async function action(kind) {
    setBusy(true);
    setMsg('');
    try {
      if (kind === 'sync') {
        await fitAuth.sync();
        if (onReload) onReload();
        setMsg('Cihazlar arası senkronizasyon tamamlandı.');
      } else if (kind === 'signout') {
        await fitAuth.signout();
        setMsg('Çıkış yapıldı. Yerel kayıtların bu cihazda korunuyor.');
      } else {
        if (!email.includes('@') || password.length < 6) {
          throw new Error('Geçerli bir e-posta ve en az 6 karakterli parola girin.');
        }
        const result = await fitAuth[kind](email, password);
        setMsg(result || 'İşlem başarıyla tamamlandı.');
        if (kind === 'signin' && onReload) {
          onReload();
        }
      }
    } catch (e) {
      setMsg('Hata: ' + (e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="intro">
        <h2>Cihazlar Arası Eşitleme</h2>
        <p>
          Fit kayıtların öncelikle bu cihazda saklanır. Giriş yaptığında Supabase üzerinden iPhone ve
          Windows arasında anlık ve güvenle senkronize edilir.
        </p>
      </div>

      <section className="panel">
        <div className="panelHeading">
          <div>
            <h3>{state.email ? `Bağlandı: ${state.email}` : 'Fit Bulut Hesabı'}</h3>
            <p>
              {state.configured
                ? state.email
                  ? 'Bulut eşitleme aktif'
                  : 'Bulut altyapısı hazır · Giriş yapın'
                : 'Bulut bağlantısı henüz yapılandırılmadı · Tamamen yerel modda çalışıyor'}
            </p>
          </div>
          {state.email ? (
            <span className="badge success">
              <CheckCircle2 size={15} /> Aktif
            </span>
          ) : (
            <span className="badge warning">
              <KeyRound size={15} /> Yerel
            </span>
          )}
        </div>

        {!state.configured ? (
          <div>
            <div className="callout warning">
              <AlertCircle size={18} />
              <div>
                <p>
                  Telefon ve bilgisayarın canlı senkronize olması için Supabase bulut veritabanı bağlantısı gerekir.
                  Aşağıdaki butona tıklayarak ücretsiz Supabase bilgilerinizi girebilirsiniz.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="secondary"
                onClick={() => setShowConfig(!showConfig)}
              >
                <KeyRound size={15} /> {showConfig ? 'Yapılandırmayı Kapat' : 'Supabase Bağlantı Bilgilerini Gir'}
              </button>
            </div>

            {showConfig && (
              <div className="panel" style={{ marginTop: 14, background: '#0e1520', border: '1px solid #1e2c3c' }}>
                <h4>Supabase Proje Bilgileri</h4>
                <p className="muted smallHelp">
                  supabase.com adresinde ücretsiz açtığınız projenin <b>Project Settings → API</b> bölümündeki <b>Project URL</b> ve <b>anon public key</b> değerlerini yapıştırın.
                </p>
                <div className="formGrid" style={{ marginTop: 10 }}>
                  <label>
                    Project URL
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                    />
                  </label>
                  <label>
                    Anon / Public Key
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                    />
                  </label>
                </div>
                <div className="measureInput" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      if (!inputUrl.trim() || !inputKey.trim()) {
                        setMsg('Hata: URL ve Anon Key alanlarını doldurun.');
                        return;
                      }
                      fitAuth.configure(inputUrl, inputKey);
                      setShowConfig(false);
                      setMsg('Supabase bağlantısı kaydedildi! Şimdi aşağıdan hesap oluşturup giriş yapabilirsiniz.');
                    }}
                  >
                    Bağlantıyı Kaydet
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : state.email ? (
          <div>
            <div className="measureInput">
              <button
                type="button"
                className="primary"
                disabled={busy}
                onClick={() => action('sync')}
              >
                <RefreshCw size={15} className={busy ? 'spin' : ''} />
                {busy ? 'Eşitleniyor…' : 'Şimdi Eşitle'}
              </button>
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => action('signout')}
              >
                <LogOut size={15} /> Çıkış Yap
              </button>
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="textLink smallHelp"
                style={{ background: 'transparent', border: 'none', color: '#7a8c9e', cursor: 'pointer', padding: 0 }}
                onClick={() => {
                  if (confirm('Supabase bağlantı anahtarlarını bu cihazdan silmek istiyor musunuz?')) {
                    fitAuth.configure('', '');
                    setMsg('Supabase bağlantısı temizlendi.');
                  }
                }}
              >
                Bağlantı Bilgilerini Değiştir / Temizle
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="formGrid">
              <label>
                E-posta
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@fit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Parola
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
            <div className="measureInput" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="primary"
                disabled={busy}
                onClick={() => action('signin')}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => action('signup')}
              >
                Hesap Oluştur
              </button>
            </div>
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="textLink smallHelp"
                style={{ background: 'transparent', border: 'none', color: '#7a8c9e', cursor: 'pointer', padding: 0 }}
                onClick={() => setShowConfig(!showConfig)}
              >
                Supabase URL & Key Düzenle
              </button>
              {showConfig && (
                <div className="panel" style={{ marginTop: 10, background: '#0e1520', border: '1px solid #1e2c3c' }}>
                  <div className="formGrid">
                    <label>
                      Project URL
                      <input
                        type="url"
                        placeholder="https://xyz.supabase.co"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                      />
                    </label>
                    <label>
                      Anon Key
                      <input
                        type="password"
                        placeholder="eyJ..."
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="primary"
                    style={{ marginTop: 10 }}
                    onClick={() => {
                      fitAuth.configure(inputUrl, inputKey);
                      setShowConfig(false);
                      setMsg('Bilgiler güncellendi.');
                    }}
                  >
                    Güncelle
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {msg && (
          <p className="smallHelp" role="status" style={{ color: msg.startsWith('Hata') ? '#ff8585' : '#b3f46f' }}>
            {msg}
          </p>
        )}
      </section>

      <section className="panel">
        <h3>Veri Güvenliği ve Gizlilik</h3>
        <p className="muted">
          Fit, ticari bir SaaS değildir ve reklam/izleme içermez. Verileriniz yalnızca kendi
          hesabınızın kimliğiyle (Row Level Security) korunur. İnternet kesilse bile kayıtlarınız
          cihazınızda güvenle tutulur, bağlantı geldiğinde otomatik birleştirilir.
        </p>
      </section>
    </>
  );
}