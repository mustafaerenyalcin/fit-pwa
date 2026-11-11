import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, Dumbbell, Utensils, LineChart, Eye, EyeOff } from 'lucide-react';
import { signin, signup, signinWithGoogle, resetPassword } from '../lib/supabase.js';

const GOOGLE_ENABLED = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';

const translateError = (msg = '') => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'E-posta veya şifre hatalı.';
  if (m.includes('email not confirmed')) return 'E-postanı henüz onaylamadın. Gelen kutunu kontrol et.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Bu e-posta ile zaten bir hesap var. Giriş yap.';
  if (m.includes('password should be')) return 'Şifre en az 6 karakter olmalı.';
  if (m.includes('rate limit')) return 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.';
  if (m.includes('fetch')) return 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.';
  return msg || 'Bir hata oluştu.';
};

export default function AuthScreen() {
  const [mode, setMode] = useState('signup'); // signup | signin | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.includes('@')) return setError('Geçerli bir e-posta adresi gir.');
    if (mode !== 'reset' && password.length < 6) return setError('Şifre en az 6 karakter olmalı.');

    setBusy(true);
    try {
      if (mode === 'signin') {
        await signin(email.trim(), password);
      } else if (mode === 'signup') {
        const msg = await signup(email.trim(), password);
        setInfo(msg);
      } else {
        await resetPassword(email.trim());
        setInfo('Şifre sıfırlama bağlantısı e-postana gönderildi.');
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError('');
    try {
      await signinWithGoogle();
    } catch (err) {
      setError(translateError(err.message));
    }
  };

  return (
    <div className="fx-auth">
      <div className="fx-authHero">
        <div className="fx-logo">
          fit<span>.</span>
        </div>
        <h1>
          Her sabah seni dinleyen
          <br />
          <em>Türkçe AI koçun.</em>
        </h1>
        <ul className="fx-authFeatures">
          <li>
            <Sparkles size={18} />
            <span>
              <b>Moduna göre günlük plan</b>
              <small>Uykunu, enerjini ve ağrılarını sorar; antrenmanı o güne göre kurar.</small>
            </span>
          </li>
          <li>
            <Utensils size={18} />
            <span>
              <b>Türk mutfağını bilen beslenme takibi</b>
              <small>"1 tabak kuru fasulye, yarım pilav" yaz ya da fotoğrafını çek.</small>
            </span>
          </li>
          <li>
            <Dumbbell size={18} />
            <span>
              <b>Evdeki ekipmanına göre program</b>
              <small>Spor salonu şart değil. Sahip olduğun dambıllara göre hazırlanır.</small>
            </span>
          </li>
          <li>
            <LineChart size={18} />
            <span>
              <b>Haftalık "neden ilerlemiyorum?" raporu</b>
              <small>Verilerini analiz eder, sorunu bulur, 3 somut aksiyon verir.</small>
            </span>
          </li>
        </ul>
      </div>

      <form className="fx-authCard" onSubmit={submit}>
        <h2>{mode === 'signup' ? 'Ücretsiz hesap oluştur' : mode === 'signin' ? 'Tekrar hoş geldin' : 'Şifreni sıfırla'}</h2>
        <p className="fx-muted">
          {mode === 'signup'
            ? 'Verilerin tüm cihazlarında senkronize kalır.'
            : mode === 'signin'
              ? 'Kaldığın yerden devam et.'
              : 'E-postana bir sıfırlama bağlantısı göndereceğiz.'}
        </p>

        {GOOGLE_ENABLED && mode !== 'reset' && (
          <>
            <button type="button" className="fx-btn fx-btn--ghost fx-btn--block" onClick={google}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              Google ile devam et
            </button>
            <div className="fx-divider">
              <span>veya</span>
            </div>
          </>
        )}

        <label className="fx-field">
          <span>E-posta</span>
          <div className="fx-inputIcon">
            <Mail size={16} />
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </label>

        {mode !== 'reset' && (
          <label className="fx-field">
            <span>Şifre</span>
            <div className="fx-inputIcon">
              <Lock size={16} />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="fx-iconBtn"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
        )}

        {error && <div className="fx-alert fx-alert--error">{error}</div>}
        {info && <div className="fx-alert fx-alert--ok">{info}</div>}

        <button type="submit" className="fx-btn fx-btn--primary fx-btn--block fx-btn--lg" disabled={busy}>
          {busy ? 'Bekle…' : mode === 'signup' ? 'Hesap oluştur' : mode === 'signin' ? 'Giriş yap' : 'Bağlantı gönder'}
          {!busy && <ArrowRight size={18} />}
        </button>

        <div className="fx-authSwitch">
          {mode === 'signup' && (
            <button type="button" onClick={() => setMode('signin')}>
              Zaten hesabın var mı? <b>Giriş yap</b>
            </button>
          )}
          {mode === 'signin' && (
            <>
              <button type="button" onClick={() => setMode('signup')}>
                Hesabın yok mu? <b>Ücretsiz oluştur</b>
              </button>
              <button type="button" onClick={() => setMode('reset')}>
                Şifremi unuttum
              </button>
            </>
          )}
          {mode === 'reset' && (
            <button type="button" onClick={() => setMode('signin')}>
              ← Girişe dön
            </button>
          )}
        </div>

        <p className="fx-legal">
          Devam ederek <a href="/gizlilik.html" target="_blank" rel="noreferrer">Gizlilik Politikası</a> ve{' '}
          <a href="/kosullar.html" target="_blank" rel="noreferrer">Kullanım Koşulları</a>'nı kabul etmiş olursun.
          Fit tıbbi tavsiye vermez.
        </p>
      </form>
    </div>
  );
}
