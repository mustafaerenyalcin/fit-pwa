import React from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function LegalModal({ type = 'privacy', onClose }) {
  const isPrivacy = type === 'privacy';

  const handleClose = () => {
    sounds.tap();
    onClose();
  };

  return (
    <div className="fx-modalBackdrop animate-fade-in" onClick={handleClose}>
      <div
        className="fx-modal fx-legalModal animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="fx-modalHead" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isPrivacy ? <Shield size={20} color="#c8ff00" /> : <FileText size={20} color="#00f0ff" />}
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                {isPrivacy ? 'Gizlilik Politikası (KVKK)' : 'Kullanım Koşulları'}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--fx-muted)' }}>
                FIT. ATELIER // Yasal Güvence Metni · Kasım 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            className="fx-closeBtn"
            onClick={handleClose}
            aria-label="Kapat"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          className="fx-modalBody"
          style={{
            overflowY: 'auto',
            padding: '16px 20px',
            fontSize: 14,
            lineHeight: 1.65,
            color: '#cbd5e1'
          }}
        >
          {isPrivacy ? (
            <>
              <h4 style={{ color: '#fff', fontSize: 15, marginTop: 4, marginBottom: 8 }}>
                1. Toplanan Veriler ve Amacı
              </h4>
              <p>Fit uygulamasını kullandığınızda aşağıdaki veriler yalnızca size özel atletik hizmet sunmak amacıyla işlenir:</p>
              <ul style={{ paddingLeft: 20, margin: '8px 0 16px', color: '#94a3b8' }}>
                <li><strong>Hesap Bilgileri:</strong> E-posta adresiniz (güvenli kimlik doğrulama ve senkronizasyon).</li>
                <li><strong>Fiziksel Profil &amp; Hedefler:</strong> Boy, kilo, yaş, cinsiyet, ekipman ve antrenman tercihleri.</li>
                <li><strong>Kayıtlar:</strong> Antrenman setleri, ağırlıklar, öğün kayıtları, hidrasyon ve uyku verileri.</li>
                <li><strong>Fotoğraflar:</strong> İlerleme fotoğrafları cihazınızda yerel olarak saklanır. AI makro analizi için yüklenen yemek fotoğrafları anlık tahmin için işlenir, sunucuda kalıcı depolanmaz.</li>
              </ul>

              <h4 style={{ color: '#fff', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                2. Veri Güvenliği ve Altyapı
              </h4>
              <p>Verileriniz kesinlikle üçüncü taraf reklam ağlarına satılmaz. Yalnızca şu güvenli altyapılar kullanılır:</p>
              <ul style={{ paddingLeft: 20, margin: '8px 0 16px', color: '#94a3b8' }}>
                <li><strong>Supabase:</strong> Şifreli PostgreSQL bulut veritabanı (Row Level Security ile her kullanıcı yalnızca kendi verisine erişebilir).</li>
                <li><strong>AI Sağlayıcıları (DeepSeek / Gemini):</strong> Kişisel seans uyarlaması ve makro koçluğu yanıtları güvenli sunucu fonksiyonu üzerinden şifreli iletilir.</li>
              </ul>

              <h4 style={{ color: '#fff', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                3. Veri Silme ve Yedekleme Hakkı
              </h4>
              <p>
                <strong>Ayarlar → Hesap ve Veriler</strong> bölümünden tüm verilerinizi anında JSON olarak dışa aktarabilir veya <strong>"Hesabımı ve verilerimi sil"</strong> butonuyla buluttaki tüm kayıtlarınızı tek tıkla kalıcı olarak silebilirsiniz.
              </p>

              <h4 style={{ color: '#fff', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                4. Sağlık ve Tıbbi Tavsiye Reddi
              </h4>
              <p style={{ color: '#94a3b8' }}>
                Fit bir tıbbi cihaz veya teşhis aracı değildir. Herhangi bir egzersiz ya da beslenme programına başlamadan önce hekiminize danışınız.
              </p>
            </>
          ) : (
            <>
              <h4 style={{ color: '#fff', fontSize: 15, marginTop: 4, marginBottom: 8 }}>
                1. Hizmetin Kapsamı
              </h4>
              <p>
                Fit; kişisel antrenman takibi, beslenme kaydı, biyomekanik form analizleri ve yapay zeka destekli egzersiz önerileri sunan profesyonel bir performans platformudur.
              </p>

              <h4 style={{ color: '#fff', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                2. Tıbbi Sorumluluk Reddi (Önemli)
              </h4>
              <p style={{ color: '#94a3b8' }}>
                Uygulamadaki tüm antrenman planları, kalori/makro hesapları ve AI Performans Koçu yanıtları yalnızca bilgilendirme ve sporcu motivasyonu amaçlıdır. Tıbbi teşhis veya tedavi yerine geçmez. Antrenman sırasında baş dönmesi, eklem batması veya aşırı zorlanma hissederseniz seansı durdurup bir sağlık uzmanına başvurunuz.
              </p>

              <h4 style={{ color: '#fff', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                3. Hesap Güvenliği ve Adil Kullanım Kotası
              </h4>
              <ul style={{ paddingLeft: 20, margin: '8px 0 16px', color: '#94a3b8' }}>
                <li>Hesabınızın güvenliğinden ve oturum bilgilerinden siz sorumlusunuz.</li>
                <li>AI servislerinin kesintisiz çalışması ve kötüye kullanımın önlenmesi için adil kullanım kotaları ve abonelik kademeleri uygulanır.</li>
              </ul>

              <h4 style={{ color: '#fff', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                4. Hesap İptali ve Fesih
              </h4>
              <p>
                Kullanıcı dilediği an uygulama içindeki <strong>Ayarlar → Hesabımı ve Verilerimi Sil</strong> seçeneğiyle üyeliğini ve tüm kayıtlarını tek taraflı sonlandırabilir.
              </p>
            </>
          )}
        </div>

        <div
          className="fx-modalFoot"
          style={{
            flexShrink: 0,
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10
          }}
        >
          <button
            type="button"
            className="fx-btn fx-btn--primary"
            onClick={handleClose}
            style={{ minWidth: 120, padding: '10px 18px', borderRadius: 12, fontWeight: 700 }}
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
