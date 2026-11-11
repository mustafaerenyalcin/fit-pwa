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
  Activity,
  Trophy,
  Play,
  HeartPulse
} from 'lucide-react';
import { signin, signup, signinWithGoogle, resetPassword, continueAsLocalUser } from '../lib/supabase.js';
import { hasUnclaimedLegacyData } from '../lib/store.js';
import { useI18n } from '../lib/i18n.js';

const translateError = (msg = '') => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'E-posta veya şifre hatalı. Bilgilerini kontrol edip tekrar dene.';
  if (m.includes('email not confirmed')) return 'E-postanı henüz onaylamadın. Gelen kutunu kontrol et.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Bu e-posta ile zaten bir hesap var. Üstten "Oturum Aç" sekmesine geçebilirsin.';
  if (m.includes('password should be')) return 'Şifre en az 6 karakter olmalıdır.';
  if (m.includes('rate limit')) return 'Çok fazla deneme yapıldı. Lütfen 1 dakika bekle.';
  if (m.includes('provider is not enabled'))
    return 'Google girişi henüz aktif edilmedi. E-posta veya Hızlı Giriş ile anında devam edebilirsin.';
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
    1: { label: 'Zayıf Şifre', color: '#ff6b6b' },
    2: { label: 'Orta Güçte', color: '#f5c451' },
    3: { label: 'İyi Şifre', color: '#7ee0ff' },
    4: { label: 'Çok Güçlü', color: '#b3f46f' }
  };
  return { score, ...map[score] };
}

export default function AuthScreen() {
  const { lang, setLang, t, languages } = useI18n();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [previewTab, setPreviewTab] = useState('checkin'); // 'checkin' | 'nutrition' | 'muscle'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const hasLegacy = useMemo(() => hasUnclaimedLegacyData(), []);
  const pwStrength = useMemo(() => calcPasswordStrength(password), [password]);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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
    if (!isEmailValid) {
      return setError('Lütfen geçerli bir e-posta adresi gir (Örn: adin@mail.com).');
    }
    if (mode !== 'reset' && password.length < 6) {
      return setError('Güvenliğin için şifren en az 6 karakter olmalıdır.');
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
      {/* Arka Plan Sinematik Işık Efektleri */}
      <div className="fx-authBackdrop" aria-hidden="true">
        <div className="fx-orb fx-orb--green" />
        <div className="fx-orb fx-orb--blue" />
        <div className="fx-orb fx-orb--purple" />
        <div className="fx-gridMesh" />
      </div>

      <div className="fx-authContainer">
        {/* SOL PANEL: İNTERAKTİF CANLI ÜRÜN DENEYİMİ */}
        <div className="fx-authShowcase">
          <div className="fx-brandBadgeRow">
            <div className="fx-logo fx-logo--lg">
              fit<span>.</span>
            </div>
            <span className="fx-proPill">
              <Sparkles size={12} /> {t('auth.badge')}
            </span>
          </div>

          {/* Küresel Dil Seçici Çubuğu (Global 4-Language Selector) */}
          <div className="fx-authLangBar" role="group" aria-label="Language Selector">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`fx-authLangBtn ${lang === l.code ? 'active' : ''}`}
                onClick={() => setLang(l.code)}
              >
                <span>{l.flag}</span> <b>{l.short}</b>
              </button>
            ))}
          </div>

          <h1 className="fx-heroHeadline">
            {t('auth.heroTitle1')}
            <br />
            <em>{t('auth.heroTitle2')}</em> {t('auth.heroTitle3')}
          </h1>

          <p className="fx-heroLead">
            {t('auth.heroSub')}
          </p>

          {/* İnteraktif Canlı Önizleme Seçicisi */}
          <div className="fx-previewSelector">
            <button
              type="button"
              className={previewTab === 'checkin' ? 'active' : ''}
              onClick={() => setPreviewTab('checkin')}
            >
              {t('auth.tabCheckin')}
            </button>
            <button
              type="button"
              className={previewTab === 'nutrition' ? 'active' : ''}
              onClick={() => setPreviewTab('nutrition')}
            >
              {t('auth.tabMeal')}
            </button>
            <button
              type="button"
              className={previewTab === 'muscle' ? 'active' : ''}
              onClick={() => setPreviewTab('muscle')}
            >
              {t('auth.tabMuscle')}
            </button>
          </div>

          {/* Seçili Önizleme Sahnesi */}
          <div className="fx-InteractiveStage" key={previewTab}>
            {previewTab === 'checkin' && (
              <div className="fx-stageCard">
                <div className="fx-stageHeader">
                  <div className="fx-bentoRing">
                    <svg width="68" height="68" viewBox="0 0 68 68">
                      <circle cx="34" cy="34" r="28" stroke="#243142" strokeWidth="6" fill="none" />
                      <circle
                        cx="34"
                        cy="34"
                        r="28"
                        stroke="#b3f46f"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="176"
                        strokeDashoffset="14"
                        transform="rotate(-90 34 34)"
                      />
                    </svg>
                    <span>%92</span>
                  </div>
                  <div className="fx-stageTitle">
                    <span className="fx-bentoTag">
                      <Sparkles size={11} /> BUGÜNÜN AI STRATEJİSİ HAZIR
                    </span>
                    <b>Yüksek Hazırlık · Omuz & Core Hipertrofi</b>
                    <small>8 sa uyku · Ağrı yok · 45 dk Ev Dambıl Programı optimize edildi</small>
                  </div>
                </div>
                <div className="fx-stageMoves">
                  <div>
                    <span>1. Dumbbell Shoulder Press</span>
                    <b>4 × 10 · 12.5 kg</b>
                  </div>
                  <div>
                    <span>2. Lateral Raise (Drop Set)</span>
                    <b>4 × 15 · 7.5 kg</b>
                  </div>
                  <div>
                    <span>3. Weighted Plank & Leg Raise</span>
                    <b>3 × Süperset</b>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'nutrition' && (
              <div className="fx-stageCard">
                <div className="fx-stageHeader">
                  <div className="fx-stageIconBox">
                    <Utensils size={24} />
                  </div>
                  <div className="fx-stageTitle">
                    <span className="fx-bentoTag">SERBEST METİN & FOTOĞRAF TANIMA</span>
                    <b>“1 tabak kuru fasulye, yarım pilav, 200g süzme yoğurt”</b>
                    <small>Saniyeler içinde Türk porsiyonlarına göre makro ayrıştırma</small>
                  </div>
                </div>
                <div className="fx-stageMacros">
                  <div>
                    <b>610</b>
                    <small>Kalori (kcal)</small>
                  </div>
                  <div>
                    <b style={{ color: '#7ee0ff' }}>39 g</b>
                    <small>Protein</small>
                  </div>
                  <div>
                    <b style={{ color: '#f5c451' }}>74 g</b>
                    <small>Karbonhidrat</small>
                  </div>
                  <div>
                    <b style={{ color: '#ff983d' }}>16 g</b>
                    <small>Sağlıklı Yağ</small>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'muscle' && (
              <div className="fx-stageCard">
                <div className="fx-stageHeader">
                  <div className="fx-stageIconBox" style={{ color: '#7ee0ff' }}>
                    <Trophy size={24} />
                  </div>
                  <div className="fx-stageTitle">
                    <span className="fx-bentoTag">PRO VÜCUT KOMPOZİSYONU & RECOVERY</span>
                    <b>Adonis Altın Oranı (1.618) & Kas Toparlanma Haritası</b>
                    <small>Son 72 saatteki setlerine göre hangi kasın %100 hazır olduğunu gör</small>
                  </div>
                </div>
                <div className="fx-stageMacros">
                  <div>
                    <b style={{ color: '#b3f46f' }}>%100</b>
                    <small>Omuz Hazır</small>
                  </div>
                  <div>
                    <b style={{ color: '#b3f46f' }}>%95</b>
                    <small>Karın / Core</small>
                  </div>
                  <div>
                    <b style={{ color: '#7ee0ff' }}>1.61</b>
                    <small>Omuz/Bel Oranı</small>
                  </div>
                  <div>
                    <b style={{ color: '#ff983d' }}>%12.8</b>
                    <small>Tahmini Yağ</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="fx-trustBar">
            <span>
              <ShieldCheck size={15} /> Bulut senkronizasyonlu & çevrimdışı çalışır
            </span>
            <span>
              <Dumbbell size={15} /> iOS, Android ve Masaüstü tam uyum
            </span>
          </div>
        </div>

        {/* SAĞ PANEL: ULTRA-PRO GİRİŞ / KAYIT KARTI */}
        <div className="fx-authFormWrap">
          <div className="fx-authGlassCard">
            {/* Tek Tıkla Anında Giriş Kartı (Önceki veriler varsa veya beklemek istemiyorsa) */}
            <button type="button" className="fx-legacyContinueBanner" onClick={handleInstantLocal}>
              <div className="fx-legacyIcon">
                <Play size={18} fill="currentColor" />
              </div>
              <div className="fx-legacyText">
                <b>{hasLegacy ? t('auth.instantSavedTitle') : t('auth.instantNewTitle')}</b>
                <small>
                  {hasLegacy ? t('auth.instantSavedSub') : t('auth.instantNewSub')}
                </small>
              </div>
            </button>

            {/* Kayan Sekme Seçici (Oturum Aç / Yeni Hesap Oluştur) */}
            {mode !== 'reset' && (
              <div className="fx-authTabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  className={mode === 'signin' ? 'active' : ''}
                  onClick={() => switchMode('signin')}
                >
                  {t('auth.loginTab')}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => switchMode('signup')}
                >
                  {t('auth.signupTab')}
                </button>
              </div>
            )}

            <div className="fx-authCardHeader">
              <h2>
                {mode === 'signin'
                  ? t('auth.welcomeBack')
                  : mode === 'signup'
                    ? t('auth.createAccount')
                    : t('auth.forgotTitle')}
              </h2>
              <p>
                {mode === 'signin'
                  ? t('auth.loginSub')
                  : mode === 'signup'
                    ? t('auth.signupSub')
                    : 'Kayıtlı e-posta adresini yaz, sıfırlama bağlantısını gönderelim.'}
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
                    {fullName.trim().length >= 2 && (
                      <CheckCircle2 size={17} className="fx-validTick" />
                    )}
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
                  {isEmailValid && <CheckCircle2 size={17} className="fx-validTick" />}
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
                  ? '...'
                  : mode === 'signin'
                    ? t('auth.submitLogin')
                    : mode === 'signup'
                      ? t('auth.submitSignup')
                      : t('auth.submitForgot')}
                {!busy && <ArrowRight size={18} />}
              </button>
            </form>

            {mode !== 'reset' ? (
              <>
                <div className="fx-divider">
                  <span>veya tek dokunuşla</span>
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
                    <span>Google ile Devam Et</span>
                  </button>

                  <button type="button" className="fx-socialBtn fx-socialBtn--fast" onClick={handleInstantLocal}>
                    <Zap size={17} className="fx-accentIcon" />
                    <span>Misafir / Hızlı Mod</span>
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
                KVKK & Gizlilik Politikası
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
