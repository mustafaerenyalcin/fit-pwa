import React, { useState, useMemo } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Activity,
  Database,
  Check,
  Globe,
  Smartphone
} from 'lucide-react';
import { signin, signup, signinWithGoogle, resetPassword, continueAsLocalUser } from '../lib/supabase.js';
import { hasUnclaimedLegacyData } from '../lib/store.js';
import { useI18n } from '../lib/i18n.js';

const translateError = (msg = '') => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login'))
    return 'Girdiğiniz e-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
  if (m.includes('email not confirmed'))
    return 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Bu e-posta adresiyle kayıtlı bir hesap zaten mevcut. "Oturum Aç" sekmesinden giriş yapabilirsiniz.';
  if (m.includes('password should be'))
    return 'Şifreniz güvenlik standartları gereği en az 6 karakter olmalıdır.';
  if (m.includes('rate limit'))
    return 'Çok fazla deneme yapıldı. Güvenliğiniz için lütfen 1 dakika bekleyin.';
  if (m.includes('provider is not enabled'))
    return 'Kurumsal Google SSO şu anda bakımda. E-posta ile kayıt olabilir veya yerel modda devam edebilirsiniz.';
  if (m.includes('fetch'))
    return 'Sunucu bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin.';
  return msg || 'İşlem sırasında beklenmeyen bir hata oluştu.';
};

const CORP_COPY = {
  tr: {
    brandSub: 'SAĞLIK VE PERFORMANS TEKNOLOJİLERİ',
    sslBadge: '256-Bit TLS Şifreli Altyapı · KVKK & GDPR Uyumlu',
    heroTitle: 'Veriye Dayalı Kişisel Antrenman ve Beslenme Yönetimi',
    heroLead:
      'Biyomekanik yük takibi, adaptif makro kalibrasyonu ve yapay zeka destekli günlük hazırlık analizini tek bir güvenli bulut platformunda birleştirin.',
    pillar1Title: 'Adaptif AI Antrenman Mimarisi',
    pillar1Desc: 'Uyku, toparlanma ve ekipman envanterinize göre günlük otomatik hacim/yoğunluk optimizasyonu.',
    pillar2Title: 'Klinik Düzeyde Beslenme & Makro Analitiği',
    pillar2Desc: 'Metin, ses ve fotoğraf üzerinden porsiyon ayrıştırma, TDEE kalibrasyonu ve aralıklı oruç takibi.',
    pillar3Title: 'İzole Bulut & Kurumsal Veri Güvenliği',
    pillar3Desc: 'Her kullanıcıya özel şifreli veri alanı (RLS), cihazlar arası anlık senkronizasyon ve tam veri taşınabilirliği.',
    tabSignin: 'Oturum Aç',
    tabSignup: 'Üyelik Oluştur',
    signinTitle: 'Hesabınıza Giriş Yapın',
    signinSub: 'Kayıtlı e-posta adresiniz ve şifrenizle platforma erişin.',
    signupTitle: 'Yeni Üyelik Oluşturun',
    signupSub: 'Kişisel sağlık ve performans profilinizi oluşturmak için bilgilerinizi girin.',
    resetTitle: 'Şifre Sıfırlama Talebi',
    resetSub: 'Kayıtlı e-posta adresinizi girin; şifre yenileme bağlantısını iletelim.',
    firstName: 'Ad',
    lastName: 'Soyad',
    firstNamePh: 'Örn: Mustafa Eren',
    lastNamePh: 'Örn: Yalçın',
    emailLabel: 'E-posta Adresi',
    emailPh: 'ad.soyad@sirket.com',
    passwordLabel: 'Şifre',
    passwordConfirmLabel: 'Şifre Tekrar',
    passwordPh: '••••••••',
    forgotBtn: 'Şifremi Unuttum',
    ruleLength: 'En az 6 karakter uzunluğunda',
    ruleAlphaNum: 'Harf ve rakam/sembol içerir (Önerilen)',
    ruleMatch: 'Şifre tekrarı ile eşleşiyor',
    termsPrefix: 'Kişisel verilerimin işlenmesine ilişkin ',
    termsPrivacy: 'KVKK Aydınlatma Metni',
    termsMid: '’ni ve ',
    termsService: 'Kullanıcı Sözleşmesi',
    termsSuffix: '’ni okudum, kabul ediyorum.',
    termsError: 'Üyelik oluşturmak için lütfen Kullanıcı Sözleşmesi ve KVKK metnini onaylayın.',
    pwMismatchError: 'Girdiğiniz şifreler birbiriyle eşleşmiyor.',
    nameError: 'Lütfen adınızı ve soyadınızı eksiksiz girin.',
    emailError: 'Lütfen geçerli bir e-posta adresi girin.',
    pwShortError: 'Şifreniz en az 6 karakter olmalıdır.',
    submitSignin: 'Güvenli Oturum Aç',
    submitSignup: 'Üyeliği Tamamla ve Başla',
    submitReset: 'Sıfırlama Bağlantısı Gönder',
    orDivider: 'ALTERNATİF ERİŞİM YÖNTEMLERİ',
    googleBtn: 'Google Hesabı ile Devam Et',
    localBtnSaved: 'Cihazdaki Kayıtlı Profil ile Giriş',
    localBtnNew: 'Çevrimdışı / Yerel Hesapla Devam Et',
    backToSignin: '← Oturum açma ekranına dön'
  },
  en: {
    brandSub: 'HEALTH & PERFORMANCE TECHNOLOGIES',
    sslBadge: '256-Bit TLS Encrypted · GDPR & ISO Compliant',
    heroTitle: 'Data-Driven Personal Training & Nutrition Management',
    heroLead:
      'Unify biomechanical load tracking, adaptive macro calibration, and AI-powered daily readiness analytics in one enterprise-grade cloud platform.',
    pillar1Title: 'Adaptive AI Training Architecture',
    pillar1Desc: 'Automated daily volume and intensity optimization based on sleep, recovery, and equipment inventory.',
    pillar2Title: 'Clinical-Grade Nutrition & Macro Analytics',
    pillar2Desc: 'Portion parsing via text, voice, and vision, adaptive TDEE calibration, and intermittent fasting tracking.',
    pillar3Title: 'Isolated Cloud & Enterprise Data Security',
    pillar3Desc: 'Dedicated encrypted user data isolation (RLS), real-time cross-device sync, and full data portability.',
    tabSignin: 'Sign In',
    tabSignup: 'Create Account',
    signinTitle: 'Sign In to Your Account',
    signinSub: 'Access the platform with your registered email and password.',
    signupTitle: 'Create a New Account',
    signupSub: 'Enter your details below to initialize your personal performance profile.',
    resetTitle: 'Password Reset Request',
    resetSub: 'Enter your registered email address to receive a password reset link.',
    firstName: 'First Name',
    lastName: 'Last Name',
    firstNamePh: 'e.g. John',
    lastNamePh: 'e.g. Doe',
    emailLabel: 'Email Address',
    emailPh: 'name@company.com',
    passwordLabel: 'Password',
    passwordConfirmLabel: 'Confirm Password',
    passwordPh: '••••••••',
    forgotBtn: 'Forgot Password?',
    ruleLength: 'At least 6 characters long',
    ruleAlphaNum: 'Contains letters & numbers (Recommended)',
    ruleMatch: 'Passwords match',
    termsPrefix: 'I have read and agree to the ',
    termsPrivacy: 'Privacy Policy (GDPR)',
    termsMid: ' and ',
    termsService: 'Terms of Service',
    termsSuffix: '.',
    termsError: 'Please accept the Terms of Service and Privacy Policy to create an account.',
    pwMismatchError: 'The passwords you entered do not match.',
    nameError: 'Please enter your first and last name.',
    emailError: 'Please enter a valid email address.',
    pwShortError: 'Your password must be at least 6 characters long.',
    submitSignin: 'Sign In Securely',
    submitSignup: 'Complete Registration',
    submitReset: 'Send Reset Link',
    orDivider: 'ALTERNATIVE ACCESS METHODS',
    googleBtn: 'Continue with Google SSO',
    localBtnSaved: 'Continue with Saved Local Profile',
    localBtnNew: 'Continue in Offline / Local Mode',
    backToSignin: '← Back to Sign In'
  }
};

export default function AuthScreen() {
  const { lang, setLang, languages } = useI18n();
  const c = CORP_COPY[lang] || CORP_COPY.en;

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const hasLegacy = useMemo(() => hasUnclaimedLegacyData(), []);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPwLenOk = password.length >= 6;
  const isPwAlphaNum = /[A-Za-z]/.test(password) && /[0-9!@#$%^&*._-]/.test(password);
  const isPwMatch = password.length > 0 && password === passwordConfirm;

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setInfo('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (mode === 'signup' && firstName.trim().length < 2) {
      return setError(c.nameError);
    }
    if (!isEmailValid) {
      return setError(c.emailError);
    }
    if (mode !== 'reset' && !isPwLenOk) {
      return setError(c.pwShortError);
    }
    if (mode === 'signup' && password !== passwordConfirm) {
      return setError(c.pwMismatchError);
    }
    if (mode === 'signup' && !acceptedTerms) {
      return setError(c.termsError);
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        await signin(email.trim(), password);
      } else if (mode === 'signup') {
        const res = await signup(email.trim(), password, fullName);
        if (res?.message && !res?.loggedIn) setInfo(res.message);
      } else {
        await resetPassword(email.trim());
        setInfo('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
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
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    continueAsLocalUser(fullName || 'Sporcu');
  };

  return (
    <div className="fx-corpAuth">
      {/* Üst Kurumsal Bar */}
      <header className="fx-corpTopbar">
        <div className="fx-corpBrand">
          <div className="fx-logo">
            fit<span>.</span>
          </div>
          <span className="fx-corpDivider" />
          <span className="fx-corpBrandSub">{c.brandSub}</span>
        </div>

        <div className="fx-corpTopRight">
          <span className="fx-corpSslBadge">
            <ShieldCheck size={14} /> {c.sslBadge}
          </span>
          <div className="fx-authLangBar" role="group" aria-label="Language">
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
        </div>
      </header>

      <div className="fx-corpMainGrid">
        {/* SOL PANEL: KURUMSAL PLATFORM MİMARİSİ */}
        <section className="fx-corpInfoCol">
          <div className="fx-corpInfoInner">
            <span className="fx-corpVersionTag">FIT ENTERPRISE PLATFORM · v4.0</span>
            <h1 className="fx-corpHeadline">{c.heroTitle}</h1>
            <p className="fx-corpLead">{c.heroLead}</p>

            <div className="fx-corpPillars">
              <div className="fx-corpPillarItem">
                <div className="fx-corpPillarIcon">
                  <Activity size={20} />
                </div>
                <div>
                  <h3>{c.pillar1Title}</h3>
                  <p>{c.pillar1Desc}</p>
                </div>
              </div>

              <div className="fx-corpPillarItem">
                <div className="fx-corpPillarIcon">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3>{c.pillar2Title}</h3>
                  <p>{c.pillar2Desc}</p>
                </div>
              </div>

              <div className="fx-corpPillarItem">
                <div className="fx-corpPillarIcon">
                  <Database size={20} />
                </div>
                <div>
                  <h3>{c.pillar3Title}</h3>
                  <p>{c.pillar3Desc}</p>
                </div>
              </div>
            </div>

            <div className="fx-corpMetricsFooter">
              <div>
                <strong>ISO / RLS</strong>
                <span>Veri İzolasyonu</span>
              </div>
              <div>
                <strong>iOS & Android</strong>
                <span>Native PWA / Capacitor</span>
              </div>
              <div>
                <strong>4 Dil</strong>
                <span>TR · EN · DE · ES</span>
              </div>
            </div>
          </div>
        </section>

        {/* SAĞ PANEL: KURUMSAL GİRİŞ & KAYIT FORMU */}
        <section className="fx-corpFormCol">
          <div className="fx-corpCard">
            {mode !== 'reset' && (
              <div className="fx-corpTabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  className={mode === 'signin' ? 'active' : ''}
                  onClick={() => switchMode('signin')}
                >
                  {c.tabSignin}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => switchMode('signup')}
                >
                  {c.tabSignup}
                </button>
              </div>
            )}

            <div className="fx-corpCardHead">
              <h2>
                {mode === 'signin'
                  ? c.signinTitle
                  : mode === 'signup'
                    ? c.signupTitle
                    : c.resetTitle}
              </h2>
              <p>
                {mode === 'signin'
                  ? c.signinSub
                  : mode === 'signup'
                    ? c.signupSub
                    : c.resetSub}
              </p>
            </div>

            <form onSubmit={submit} className="fx-corpForm" noValidate>
              {mode === 'signup' && (
                <div className="fx-corpNameGrid">
                  <label className="fx-corpField">
                    <span>{c.firstName} *</span>
                    <div className="fx-corpInputBox">
                      <User size={16} />
                      <input
                        type="text"
                        autoComplete="given-name"
                        placeholder={c.firstNamePh}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </label>
                  <label className="fx-corpField">
                    <span>{c.lastName}</span>
                    <div className="fx-corpInputBox">
                      <input
                        type="text"
                        autoComplete="family-name"
                        placeholder={c.lastNamePh}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </label>
                </div>
              )}

              <label className="fx-corpField">
                <span>{c.emailLabel} *</span>
                <div className="fx-corpInputBox">
                  <Mail size={16} />
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder={c.emailPh}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {isEmailValid && <CheckCircle2 size={16} className="fx-validTick" />}
                </div>
              </label>

              {mode !== 'reset' && (
                <label className="fx-corpField">
                  <div className="fx-corpLabelRow">
                    <span>{c.passwordLabel} *</span>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        className="fx-corpForgotLink"
                        onClick={() => switchMode('reset')}
                      >
                        {c.forgotBtn}
                      </button>
                    )}
                  </div>
                  <div className="fx-corpInputBox">
                    <Lock size={16} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      placeholder={c.passwordPh}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="fx-pwToggle"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label="Toggle password"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
              )}

              {mode === 'signup' && (
                <>
                  <label className="fx-corpField">
                    <span>{c.passwordConfirmLabel} *</span>
                    <div className="fx-corpInputBox">
                      <Lock size={16} />
                      <input
                        type={showPw ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder={c.passwordPh}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                      />
                      {isPwMatch && <CheckCircle2 size={16} className="fx-validTick" />}
                    </div>
                  </label>

                  {/* Kurumsal Şifre Güvenlik Politikası Kontrol Listesi */}
                  <div className="fx-corpPolicyChecklist">
                    <div className={isPwLenOk ? 'ok' : ''}>
                      <Check size={13} /> <span>{c.ruleLength}</span>
                    </div>
                    <div className={isPwAlphaNum ? 'ok' : ''}>
                      <Check size={13} /> <span>{c.ruleAlphaNum}</span>
                    </div>
                    <div className={isPwMatch ? 'ok' : ''}>
                      <Check size={13} /> <span>{c.ruleMatch}</span>
                    </div>
                  </div>

                  {/* Resmi KVKK / GDPR ve Kullanıcı Sözleşmesi Onay Kutusu */}
                  <label className="fx-corpConsentRow">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <span>
                      {c.termsPrefix}
                      <a href="/gizlilik.html" target="_blank" rel="noreferrer">
                        {c.termsPrivacy}
                      </a>
                      {c.termsMid}
                      <a href="/kosullar.html" target="_blank" rel="noreferrer">
                        {c.termsService}
                      </a>
                      {c.termsSuffix}
                    </span>
                  </label>
                </>
              )}

              {error && <div className="fx-alert fx-alert--error">{error}</div>}
              {info && <div className="fx-alert fx-alert--ok">{info}</div>}

              <button
                type="submit"
                className="fx-corpSubmitBtn"
                disabled={busy}
              >
                <span>
                  {busy
                    ? '...'
                    : mode === 'signin'
                      ? c.submitSignin
                      : mode === 'signup'
                        ? c.submitSignup
                        : c.submitReset}
                </span>
                {!busy && <ArrowRight size={17} />}
              </button>
            </form>

            {mode !== 'reset' ? (
              <>
                <div className="fx-corpDividerText">
                  <span>{c.orDivider}</span>
                </div>

                <div className="fx-corpAltActions">
                  <button type="button" className="fx-corpSecondaryBtn" onClick={handleGoogle}>
                    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
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
                    <span>{c.googleBtn}</span>
                  </button>

                  <button type="button" className="fx-corpSecondaryBtn" onClick={handleInstantLocal}>
                    <Smartphone size={16} />
                    <span>{hasLegacy ? c.localBtnSaved : c.localBtnNew}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="fx-authSwitch" style={{ marginTop: 14 }}>
                <button type="button" onClick={() => switchMode('signin')}>
                  {c.backToSignin}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
