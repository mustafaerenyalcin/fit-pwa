import React, { useState } from 'react';
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  Shield,
  X,
  ArrowRight,
  Flame,
  Award,
  Lock,
  Users
} from 'lucide-react';
import { upgradeToPro, cancelPro, getAiMembership } from '../lib/aiQuota.js';
import { sounds } from '../lib/audio.js';
import LegalModal from './LegalModal.jsx';

export default function SubscriptionModal({ initialPlan = 'yearly', onClose, onSuccess }) {
  const currentMembership = getAiMembership();
  const [billingCycle, setBillingCycle] = useState(initialPlan); // 'yearly' | 'monthly' | 'family'
  const [processing, setProcessing] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [legalType, setLegalType] = useState(null);
  const [restoreNotice, setRestoreNotice] = useState('');

  const handleRestorePurchases = () => {
    sounds.tap();
    setRestoreNotice('Satın alımlar sorgulanıyor…');
    setTimeout(() => {
      const mem = getAiMembership();
      if (mem.isPro) {
        setRestoreNotice('✓ Aktif Atelier Black aboneliğiniz başarıyla geri yüklendi.');
      } else {
        setRestoreNotice('Bu hesaba bağlı aktif bir mağaza aboneliği bulunamadı.');
      }
      setTimeout(() => setRestoreNotice(''), 4000);
    }, 800);
  };

  const handleSubscribe = () => {
    sounds.success();
    setProcessing(true);

    setTimeout(() => {
      upgradeToPro(billingCycle);
      setProcessing(false);
      setCelebrate(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1400);
    }, 800);
  };

  const handleCancelTest = () => {
    sounds.tap();
    cancelPro();
    onClose();
  };

  const features = [
    {
      title: '4 Kişiye Kadar Gym Buddy Squad & Aile Erişimi',
      desc: 'Arkadaşlarınla ortak ekip kur; birbirinizin canlı antrenmanlarını, serilerini ve ağırlıklarını anlık takip edin.'
    },
    {
      title: 'Sınırsız Gemini Vision Tabak & Öğün Analizi',
      desc: 'Fotoğrafını çek, makroları ve porsiyonları tek saniyede çıkarsın. Günlük 3 kotası kalkar.'
    },
    {
      title: 'Sınırsız AI Kamera Biyomekanik & Eklem Taraması',
      desc: 'Squat, Deadlift ve Bench Press formunu yapay zeka ile tara; sakatlık riskini sıfırla.'
    },
    {
      title: 'Kişisel AI Spor Hekimi & Antrenör Danışmanı',
      desc: 'Kas ağrıların, toparlanma durumun ve antrenman takılmaların için 7/24 kişisel analiz.'
    },
    {
      title: 'Otomatik Haftalık Yüklenme & Deload Optimizasyonu',
      desc: 'Ağırlık artışlarını santral sinir sistemi yorgunluğuna göre otomatik ayarlar.'
    },
    {
      title: 'Haftalık 3x Seri Kalkanı (Streak Shield)',
      desc: 'Yoğun günlerde veya hastalıkta antrenman serin asla sıfırlanmaz.'
    }
  ];

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div
        className="fx-modal fx-subscriptionModal animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="fx-modalClose" onClick={onClose}>
          ✕
        </button>

        {celebrate ? (
          <div className="fx-subSuccessScreen animate-scale-in">
            <Crown size={54} color="#f5c451" className="animate-bounce" />
            <h2 style={{ color: '#fff', margin: '14px 0 6px' }}>
              {billingCycle === 'family' ? 'GYM BUDDY SQUAD DEVREDE!' : 'ATELIER BLACK\'E HOŞ GELDİN'}
            </h2>
            <p style={{ color: 'var(--fx-muted)', fontSize: 14 }}>
              {billingCycle === 'family'
                ? '4 kişilik Squad slotun açıldı. Arkadaşlarını davet et, ortak seriyi başlat!'
                : 'Tüm AI ve Vision sınırları kaldırıldı. Antrenman ve beslenmende elit seviyedesin!'}
            </p>
          </div>
        ) : (
          <>
            {/* ÜST LÜKS HERO BANNER */}
            <div className="fx-subModalHead">
              <div className="fx-subCrownBadge">
                <Crown size={20} color="#f5c451" />
                <span>ATELIER BLACK &amp; SQUAD PASS</span>
              </div>
              <h2 className="fx-subTitle">Zirve Performans &amp; Ekip Gücü</h2>
              <p className="fx-subDesc">
                İster tek başına sınırları kaldır, ister arkadaşlarınla 4 kişilik Gym Buddy Squad kurup kişi başı ₺75'e ortak antrenman yap.
              </p>
            </div>

            {/* 3 PLAN SEÇİCİSİ (YILLIK / AYLIK / AİLE & SQUAD) */}
            <div className="fx-subBillingSelector fx-subBillingSelector--trio">
              {/* 1. YILLIK BİREYSEL */}
              <button
                type="button"
                className={`fx-subBillingTab ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setBillingCycle('yearly');
                }}
              >
                <div className="fx-subTabBadge">%40 TASARRUF</div>
                <b>Yıllık Pro</b>
                <div className="fx-subPriceRow">
                  <span>₺</span>
                  <strong>119</strong>
                  <small>/ ay</small>
                </div>
                <small className="fx-subBilledInfo">Yıllık 1.428 ₺ (7 gün ücretsiz)</small>
              </button>

              {/* 2. AYLIK BİREYSEL */}
              <button
                type="button"
                className={`fx-subBillingTab ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setBillingCycle('monthly');
                }}
              >
                <b>Aylık Pro</b>
                <div className="fx-subPriceRow">
                  <span>₺</span>
                  <strong>199</strong>
                  <small>/ ay</small>
                </div>
                <small className="fx-subBilledInfo">Esnek, dilediğin an iptal et</small>
              </button>

              {/* 3. AİLE & GYM BUDDY SQUAD (MAX 4 KİŞİ) */}
              <button
                type="button"
                className={`fx-subBillingTab fx-subBillingTab--squad ${billingCycle === 'family' ? 'active' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setBillingCycle('family');
                }}
              >
                <div className="fx-subTabBadge fx-subTabBadge--squad">4 KİŞİ SQUAD</div>
                <b>Aile &amp; Squad</b>
                <div className="fx-subPriceRow">
                  <span>₺</span>
                  <strong>299</strong>
                  <small>/ ay</small>
                </div>
                <small className="fx-subBilledInfo">4 Kişi · Kişi başı ~75 ₺</small>
              </button>
            </div>

            {/* ÖZELLİK LİSTESİ */}
            <div className="fx-subFeatureList">
              <span className="fx-subLabel">
                {billingCycle === 'family' ? 'SQUAD & AİLE PLANI AYRICALIKLARI:' : 'ATELIER BLACK AYRICALIKLARI:'}
              </span>
              {features.map((f, idx) => (
                <div key={idx} className="fx-subFeatureItem">
                  <div className="fx-subCheckIcon">
                    <Check size={14} color="#f5c451" />
                  </div>
                  <div>
                    <b>{f.title}</b>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* SIFIR TUZAK GÜVENCESİ */}
            <div className="fx-subGuaranteeBox">
              <Shield size={16} color="#00f0ff" />
              <span>
                <b>Sıfır Tuzak Güvencesi:</b> 1 Gym Buddy ekleme, barkod tarama ve antrenman sayacı her zaman %100 ücretsiz kalır.
              </span>
            </div>

            {/* EYLEM BUTONU */}
            <div className="fx-subActionsRow">
              <button
                type="button"
                className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
                onClick={handleSubscribe}
                disabled={processing}
                style={{
                  background: billingCycle === 'family'
                    ? 'linear-gradient(135deg, #00f0ff 0%, #ff4d1c 100%)'
                    : 'linear-gradient(135deg, #f5c451 0%, #ff4d1c 100%)',
                  color: '#090a0f',
                  fontWeight: 900
                }}
              >
                {billingCycle === 'family' ? <Users size={18} /> : <Crown size={18} />}
                {processing
                  ? 'Aktivasyon Yapılıyor…'
                  : billingCycle === 'family'
                  ? '👑 Aile & Squad Planını Başlat (₺299/ay · 4 Kişi)'
                  : billingCycle === 'yearly'
                  ? '7 Gün Ücretsiz Dene & Başlat (₺119/ay)'
                  : 'Atelier Black Bireysel’e Geç (₺199/ay)'}
              </button>

              {restoreNotice && (
                <div style={{ marginTop: 10, fontSize: 12, color: restoreNotice.startsWith('✓') ? '#c8ff00' : 'var(--fx-muted)', textAlign: 'center' }}>
                  {restoreNotice}
                </div>
              )}

              {/* APP STORE & GOOGLE PLAY YASAL VE GERİ YÜKLEME ÇUBUĞU */}
              <div style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <button
                  type="button"
                  onClick={handleRestorePurchases}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--fx-muted)',
                    fontSize: 12,
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Satın Alımları Geri Yükle (Restore Purchases)
                </button>

                <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--fx-muted)' }}>
                  <button
                    type="button"
                    onClick={() => setLegalType('terms')}
                    style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Kullanım Koşulları (EULA)
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setLegalType('privacy')}
                    style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Gizlilik Politikası
                  </button>
                </div>

                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255, 255, 255, 0.35)', lineHeight: 1.4, maxWidth: 360 }}>
                  Abonelik, geçerli dönemin bitiminden en az 24 saat önce iptal edilmediği sürece otomatik yenilenir. Apple Kimliği veya Google Play hesap ayarlarınızdan dilediğiniz an yönetebilirsiniz.
                </p>
              </div>
            </div>
          </>
        )}

        {legalType && (
          <LegalModal type={legalType} onClose={() => setLegalType(null)} />
        )}
      </div>
    </div>
  );
}
