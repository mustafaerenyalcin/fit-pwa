import React, { useState, useMemo } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Dumbbell,
  Utensils,
  Flame,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { signin, signup, signinWithGoogle, resetPassword, continueAsLocalUser } from '../lib/supabase.js';
import { hasUnclaimedLegacyData } from '../lib/store.js';

const translateError = (msg = '') => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'E-posta veya şifre hatalı. Tekrar kontrol et.';
  if (m.includes('email not confirmed')) return 'E-postanı henüz onaylamadın. Gelen kutunu kontrol et.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Bu e-posta ile zaten bir hesap var. "Giriş Yap" sekmesine geçebilirsin.';
  if (m.includes('password should be')) return 'Şifre en az 6 karakter olmalıdır.';
  if (m.includes('rate limit')) return 'Çok fazla deneme yapıldı. Lütfen 1 dakika bekle.';
  if (m.includes('provider is not enabled'))
    return 'Sosyal giriş henüz Supabase panelinden aktif edilmedi. E-posta veya Hızlı Giriş ile devam edebilirsin.';
  if (m.includes('fetch')) return 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.';
  return msg || 'İşlem sırasında bir hata oluştu.';
};

function calcPasswordStrength(pw = '') {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 9) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9!@#$%^&*._-]/.test(pw)) score++;
  score = Math.max(1, Math.min(4, score));

  const map = {
    1: { label: 'Zayıf', color: '#ff6b6b' },
    2: { label: 'Orta', color: '#f5c451' },
    3: { label: 'İyi', color: '#7ee0ff' },
    4: { label: 'Güçlü', color: '#b3f46f' }
  };
  return { score, ...map[score] };
}

export default function AuthScreen() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const hasLegacy = useMemo(() => hasUnclaimedLegacyData(), []);
  const pwStrength = useMemo(() => calcPasswordStrength(password), [password]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setInfo('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (mode === 'signup' && !fullName.trim()) {
      return setError('Lütfen adını veya hitap edilmesini istediğin ismi gir.');
    }
    if (!email.includes('@') || !email.includes('.')) {
      return setError('Geçerli bir e-posta adresi gir.');
    }
    if (mode !== 'reset' && password.length < 6) {
      return setError('Şifre en az 6 karakter olmalıdır.');
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        await signin(email.trim(), password);
      } else if (mode === 'signup') {
        const res = await signup(email.trim(), password, fullName.trim());
        if (res?.message && !res?.loggedIn) setInfo(res.message);
      } else {
        await resetPassword(email.trim());
        setInfo('Şifre sıfırlama bağlantısı e-postana gönderildi. Gelen kutunu kontrol et.');
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signinWithGoogle();
    } catch (err) {
      setError(translateError(err.message));
    }
  };

  const handleInstantLocal = () => {
    continueAsLocalUser(fullName.trim() || 'Eren');
  };

  return (
    <div className="fx-authPro">
      {/* Arka Plan Aurora Işık Efektleri */}
      <div className="fx-authBackdrop" aria-hidden="true">
        <div className="fx-orb fx-orb--green" />
        <div className="fx-orb fx-orb--blue" />
        <div className="fx-gridMesh" />
      </div>

      <div className="fx-authContainer">
        {/* SOL PANEL: CANLI ÜRÜN VİTRİNİ (BENTO SHOWCASE) */}
        <div className="fx-authShowcase">
          <div className="fx-brandBadgeRow">
            <div className="fx-logo fx-logo--lg">
              fit<span>.</span>
            </div>
            <span className="fx-proPill">
              <Sparkles size={12} /> ELITE AI ENGINE v2.0
            </span>
          </div>

          <h1 className="fx-heroHeadline">
            Vücudunu tanıyan,
            <br />
            her sabah planını kuran
            <br />
            <em>kişisel AI koçun.</em>
          </h1>

          <p className="fx-heroLead">
            Sabit programları unut. Uyku sürene, enerjine, evdeki dambıl ağırlıklarına ve Türk
            mutfağına göre her gün kendini yeniden kalibre eden akıllı antrenman ve beslenme sistemi.
          </p>

          {/* Canlı Bento Önizleme Kartları */}
          <div className="fx-bentoPreview">
            {/* Kart 1: Canlı Hazırlık & Check-in */}
            <div className="fx-bentoCard fx-bentoCard--wide">
              <div className="fx-bentoRing">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" stroke="#243142" strokeWidth="6" fill="none" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#b3f46f"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="163"
                    strokeDashoffset="16"
                    transform="rotate(-90 32 32)"
                  />
                </svg>
                <span>%92</span>
              </div>
              <div className="fx-bentoMeta">
                <span className="fx-bentoTag">
                  <Activity size={12} /> GÜNLÜK AI CHECK-IN
                </span>
                <b>Hazırlık Skoru Yüksek · Omuz & Core Vurgusu</b>
                <small>8 saat uyku · Kaslar %95 dinlendi · 45 dk dambıl hipertrofi planı hazır</small>
              </div>
            </div>

            {/* Kart 2: Türk Mutfağı AI Analizi */}
            <div className="fx-bentoCard">
              <div className="fx-bentoCardTop">
                <Utensils size={16} className="fx-accentIcon" />
                <span>AI Öğün Tanıma</span>
              </div>
              <strong>540 kcal · 48g P</strong>
              <small>“150g ızgara köfte, 1 kase mercimek, ayran”</small>
            </div>

            {/* Kart 3: Adonis & Kas Haritası */}
            <div className="fx-bentoCard">
              <div className="fx-bentoCardTop">
                <Flame size={16} style={{ color: '#ff983d' }} />
                <span>Seri & Adonis Oranı</span>
              </div>
              <strong>🔥 14 Gün · 1.61</strong>
              <small>Omuz/Bel altın oran simetri takibi</small>
            </div>
          </div>

          <div className="fx-trustBar">
            <span>
              <ShieldCheck size={15} /> Uçtan uca şifreli bulut senkronizasyonu
            </span>
            <span>
              <Dumbbell size={15} /> Ev & Salon ekipmanına tam uyum
            </span>
          </div>
        </div>

        {/* SAĞ PANEL: ULTRA-PRO GİRİŞ / KAYIT KARTI */}
        <div className="fx-authFormWrap">
          <div className="fx-authGlassCard">
            {/* Kayıtlı Yerel Veri Varsa Tek Tıkla Devam Banner'ı */}
            {hasLegacy && (
              <button type="button" className="fx-legacyContinueBanner" onClick={handleInstantLocal}>
                <div className="fx-legacyIcon">
                  <Zap size={18} />
                </div>
                <div className="fx-legacyText">
                  <b>Mevcut verilerin bu cihazda hazır!</b>
                  <small>Beklemeden kaldığın yerden anında devam etmek için dokun →</small>
                </div>
              </button>
            )}

            {/* Kayan Sekme Seçici (Giriş Yap / Ücretsiz Kayıt Ol) */}
            {mode !== 'reset' && (
              <div className="fx-authTabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  className={mode === 'signin' ? 'active' : ''}
                  onClick={() => switchMode('signin')}
                >
                  Oturum Aç
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => switchMode('signup')}
                >
                  Yeni Hesap Oluştur
                </button>
              </div>
            )}

            <div className="fx-authCardHeader">
              <h2>
                {mode === 'signin'
                  ? 'Hesabına Giriş Yap'
                  : mode === 'signup'
                    ? 'Profesyonel Koçuna Başla'
                    : 'Şifre Sıfırlama'}
              </h2>
              <p>
                {mode === 'signin'
                  ? 'Antrenmanların, ölçümlerin ve AI analizlerin tüm cihazlarında senkronize.'
                  : mode === 'signup'
                    ? '30 saniyede ücretsiz hesabını aç, kişisel programını hemen oluşturalım.'
                    : 'Kayıtlı e-posta adresini gir, sıfırlama bağlantısını hemen gönderelim.'}
              </p>
            </div>

            <form onSubmit={submit} className="fx-authForm" noValidate>
              {mode === 'signup' && (
                <label className="fx-proField">
                  <span>ADIN VEYA KULLANICI ADIN</span>
                  <div className="fx-proInputWrap">
                    <User size={17} />
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Örn: Eren"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </label>
              )}

              <label className="fx-proField">
                <span>E-POSTA ADRESİ</span>
                <div className="fx-proInputWrap">
                  <Mail size={17} />
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="ornek@eposta.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>

              {mode !== 'reset' && (
                <div className="fx-proField">
                  <div className="fx-fieldLabelRow">
                    <span>ŞİFRE</span>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        className="fx-forgotLink"
                        onClick={() => switchMode('reset')}
                      >
                        Şifremi unuttum?
                      </button>
                    )}
                  </div>
                  <div className="fx-proInputWrap">
                    <Lock size={17} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      placeholder={mode === 'signup' ? 'En az 6 karakter belirle' : '••••••••'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="fx-pwToggle"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Kayıt Modunda Canlı Şifre Gücü Çubuğu */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="fx-pwStrength">
                      <div className="fx-pwBars">
                        {[1, 2, 3, 4].map((lvl) => (
                          <span
                            key={lvl}
                            style={{
                              background:
                                pwStrength.score >= lvl ? pwStrength.color : 'var(--fx-track)'
                            }}
                          />
                        ))}
                      </div>
                      <small style={{ color: pwStrength.color }}>{pwStrength.label}</small>
                    </div>
                  )}
                </div>
              )}

              {error && <div className="fx-alert fx-alert--error">{error}</div>}
              {info && <div className="fx-alert fx-alert--ok">{info}</div>}

              <button
                type="submit"
                className="fx-btn fx-btn--primary fx-btn--block fx-btn--lg fx-authSubmitBtn"
                disabled={busy}
              >
                {busy
                  ? 'İşleniyor…'
                  : mode === 'signin'
                    ? 'Oturum Aç'
                    : mode === 'signup'
                      ? 'Hesabımı Oluştur ve Başla'
                      : 'Sıfırlama Bağlantısı Gönder'}
                {!busy && <ArrowRight size={18} />}
              </button>
            </form>

            {mode !== 'reset' ? (
              <>
                <div className="fx-divider">
                  <span>veya hızlı devam et</span>
                </div>

                <div className="fx-socialGrid">
                  <button type="button" className="fx-socialBtn" onClick={handleGoogle}>
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                      <path
                        fill="#FFC107"
                        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
                      />
                    </svg>
                    <span>Google ile Giriş</span>
                  </button>

                  <button type="button" className="fx-socialBtn fx-socialBtn--fast" onClick={handleInstantLocal}>
                    <Zap size={17} className="fx-accentIcon" />
                    <span>Hızlı Başlangıç</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="fx-authSwitch">
                <button type="button" onClick={() => switchMode('signin')}>
                  ← Giriş ekranına geri dön
                </button>
              </div>
            )}

            <p className="fx-legal">
              Devam ederek{' '}
              <a href="/gizlilik.html" target="_blank" rel="noreferrer">
                Gizlilik Politikası
              </a>{' '}
              ve{' '}
              <a href="/kosullar.html" target="_blank" rel="noreferrer">
                Kullanım Koşulları
              </a>
              ’nı kabul etmiş olursun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
