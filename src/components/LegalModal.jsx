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
            {isPrivacy ? <Shield size={20} color="#ff6b35" /> : <FileText size={20} color="#06b6d4" />}
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--fx-text)' }}>
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
              background: 'var(--fx-surface-2, rgba(148, 163, 184, 0.16))',
              border: '1px solid var(--fx-border)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--fx-text)'
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
            color: 'var(--fx-text)'
          }}
        >
          {isPrivacy ? (
            <>
              <h4 style={{ color: 'var(--fx-text)', fontSize: 15, marginTop: 4, marginBottom: 8 }}>
                1. Toplanan Veriler ve Amacı
              </h4>
              <p>Fit uygulamasını kullandığınızda aşağıdaki veriler yalnızca size özel atletik hizmet sunmak amacıyla işlenir:</p>
              <ul style={{ paddingLeft: 20, margin: '8px 0 16px', color: 'var(--fx-muted)' }}>
                <li><strong>Hesap Bilgileri:</strong> E-posta, Google ile Giriş veya Apple ile Giriş kimlik belirteçleriniz (güvenli kimlik doğrulama, cihazlar arası senkronizasyon ve çoklu hesaplı 4 kişilik Aile Planı koltuk yönetimi).</li>
                <li><strong>Fiziksel Profil &amp; Hedefler:</strong> Boy, kilo, yaş, cinsiyet, ekipman ve antrenman tercihleri.</li>
                <li><strong>Kayıtlar:</strong> Antrenman setleri, ağırlıklar, öğün/barkod kayıtları, hidrasyon ve uyku verileri.</li>
                <li><strong>Fotoğraflar:</strong> İlerleme fotoğrafları (Before/After) cihazınızda yerel olarak saklanır. AI makro analizi için yüklenen yemek fotoğrafları anlık tahmin için işlenir, sunucuda kalıcı depolanmaz.</li>
              </ul>

              <h4 style={{ color: 'var(--fx-text)', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                2. Veri Güvenliği ve Altyapı
              </h4>
              <p>Verileriniz kesinlikle üçüncü taraf reklam ağlarına satılmaz veya izleme amaçlı paylaşılmaz:</p>
              <ul style={{ paddingLeft: 20, margin: '8px 0 16px', color: 'var(--fx-muted)' }}>
                <li><strong>Supabase:</strong> Şifreli PostgreSQL bulut veritabanı (Row Level Security ile her kullanıcı yalnızca kendi verisine ve bağlı olduğu Aile grubuna erişebilir).</li>
                <li><strong>AI Sağlayıcıları (DeepSeek / Gemini):</strong> Kişisel seans uyarlaması ve makro koçluğu yanıtları güvenli sunucu fonksiyonu üzerinden iletilir.</li>
                <li><strong>OpenFoodFacts:</strong> Ürün barkod sorguları yalnızca okunan EAN barkod numarası ile yapılır.</li>
              </ul>

              <h4 style={{ color: 'var(--fx-text)', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                3. Veri Silme ve Yedekleme Hakkı
              </h4>
              <p>
                <strong>Ayarlar → Hesap ve Veriler</strong> bölümünden tüm verilerinizi anında JSON olarak dışa aktarabilir veya <strong>"Hesabımı ve verilerimi sil"</strong> seçeneğiyle hem cihazdaki yerel verilerinizi hem bulut hesabınızı tek adımda kalıcı olarak silebilirsiniz.
              </p>

              <h4 style={{ color: 'var(--fx-text)', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                4. Sağlık ve Tıbbi Tavsiye Reddi
              </h4>
              <p style={{ color: 'var(--fx-muted)' }}>
                Fit bir tıbbi cihaz veya teşhis aracı değildir. Herhangi bir egzersiz ya da beslenme programına başlamadan önce hekiminize danışınız.
              </p>
            </>
          ) : (
            <>
              <h4 style={{ color: 'var(--fx-text)', fontSize: 15, marginTop: 4, marginBottom: 8 }}>
                1. Hizmetin Kapsamı
              </h4>
              <p>
                Fit; kişisel antrenman takibi, beslenme kaydı, biyomekanik kontrol listeleri ve yapay zeka destekli egzersiz önerileri sunan bir performans platformudur.
              </p>

              <h4 style={{ color: 'var(--fx-text)', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                2. Tıbbi Sorumluluk Reddi (Önemli)
              </h4>
              <p style={{ color: 'var(--fx-muted)' }}>
                Uygulamadaki tüm antrenman planları, kalori/makro/DOTS/Wilks hesapları ve AI Performans Koçu yanıtları yalnızca bilgilendirme ve sporcu motivasyonu amaçlıdır. Tıbbi teşhis veya tedavi yerine geçmez. Antrenman sırasında baş dönmesi, eklem batması veya aşırı zorlanma hissederseniz seansı durdurup bir sağlık uzmanına başvurunuz.
              </p>

              <h4 style={{ color: 'var(--fx-text)', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
                3. Hesap Güvenliği ve Aile Planı Adil Kullanımı
              </h4>
              <ul style={{ paddingLeft: 20, margin: '8px 0 16px', color: 'var(--fx-muted)' }}>
                <li>Hesabınızın güvenliğinden siz sorumlusunuz. Aile Planında her üye şifre paylaşmadan kendi hesabı ile davet kodu üzerinden katılır (en fazla 4 hesap).</li>
                <li>AI servislerinin kesintisiz çalışması için adil kullanım kotaları uygulanır.</li>
              </ul>

              <h4 style={{ color: 'var(--fx-text)', fontSize: 15, marginTop: 16, marginBottom: 8 }}>
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
            borderTop: '1px solid var(--fx-border)',
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
