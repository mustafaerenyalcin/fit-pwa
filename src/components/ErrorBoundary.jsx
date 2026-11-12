import React from 'react';
import { getLang } from '../lib/i18n.js';

const COPY = {
  tr: {
    eyebrow: 'SİSTEM KORUMA MODU',
    title: 'Beklenmedik Bir Arayüz Hatası Oluştu',
    sub: 'Verilerin güvende. Geçici bir render hatası yakalandı; uygulamayı yeniden deneyebilir veya önbelleği temizleyerek başlatabilirsin.',
    retry: 'Tekrar Dene',
    reload: 'Sayfayı Yenile',
    details: 'Teknik Detay'
  },
  en: {
    eyebrow: 'SYSTEM RECOVERY MODE',
    title: 'An Unexpected Interface Error Occurred',
    sub: 'Your data is safe. A temporary render error was caught; you can retry or reload the application.',
    retry: 'Try Again',
    reload: 'Reload App',
    details: 'Technical Details'
  },
  de: {
    eyebrow: 'SYSTEM-WIEDERHERSTELLUNG',
    title: 'Ein unerwarteter Fehler ist aufgetreten',
    sub: 'Deine Daten sind sicher. Ein temporärer Render-Fehler wurde abgefangen; du kannst es erneut versuchen oder die App neu laden.',
    retry: 'Erneut versuchen',
    reload: 'App neu laden',
    details: 'Technische Details'
  },
  es: {
    eyebrow: 'MODO DE RECUPERACIÓN',
    title: 'Ocurrió un error inesperado en la interfaz',
    sub: 'Tus datos están seguros. Se detectó un error temporal de renderizado; puedes reintentar o recargar la aplicación.',
    retry: 'Reintentar',
    reload: 'Recargar App',
    details: 'Detalles técnicos'
  }
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    if (typeof console !== 'undefined' && console.error) {
      console.error('[FIT. ATELIER ErrorBoundary]', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    let lang = 'tr';
    try {
      lang = getLang() || 'tr';
    } catch {}
    const copy = COPY[lang] || COPY.tr;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          background: '#090a0f',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div
          style={{
            maxWidth: 460,
            width: '100%',
            background: 'linear-gradient(160deg, #131622 0%, #0b0d14 100%)',
            border: '1px solid rgba(255, 77, 28, 0.35)',
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)'
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: '#ff4d1c',
              marginBottom: 10
            }}
          >
            {copy.eyebrow}
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 }}>
            {copy.title}
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 22px', lineHeight: 1.55 }}>
            {copy.sub}
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                flex: 1,
                minWidth: 130,
                padding: '12px 16px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #ff4d1c 0%, #ff7a00 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              {copy.retry}
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                flex: 1,
                minWidth: 130,
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.05)',
                color: '#f8fafc',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              {copy.reload}
            </button>
          </div>

          {this.state.error && (
            <details style={{ marginTop: 18, fontSize: 12, color: '#94a3b8' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{copy.details}</summary>
              <pre
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderRadius: 10,
                  background: '#05060a',
                  color: '#fca5a5',
                  overflowX: 'auto',
                  fontSize: 11,
                  lineHeight: 1.4
                }}
              >
                {String(this.state.error?.message || this.state.error)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
