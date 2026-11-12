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
  Lock
} from 'lucide-react';
import { upgradeToPro, cancelPro, getAiMembership } from '../lib/aiQuota.js';
import { sounds } from '../lib/audio.js';

export default function SubscriptionModal({ onClose, onSuccess }) {
  const currentMembership = getAiMembership();
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [processing, setProcessing] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

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
    },
    {
      title: 'Özel VIP Story Kartı & Altın Tema',
      desc: 'Sosyal medyada paylaşabileceğin altın varaklı ve titanyum heykelsi rozetler.'
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
            <h2 style={{ color: '#fff', margin: '14px 0 6px' }}>ATELIER BLACK'E HOŞ GELDİN</h2>
            <p style={{ color: 'var(--fx-muted)', fontSize: 14 }}>
              Tüm AI ve Vision sınırları kaldırıldı. Antrenman ve beslenmende elit seviyedesin!
            </p>
          </div>
        ) : (
          <>
            {/* ÜST LÜKS HERO BANNER */}
            <div className="fx-subModalHead">
              <div className="fx-subCrownBadge">
                <Crown size={20} color="#f5c451" />
                <span>ATELIER BLACK PASS</span>
              </div>
              <h2 className="fx-subTitle">Zirve Performans İçin Sınırsız Güç</h2>
              <p className="fx-subDesc">
                Fotoğraf ile besin tanıma, AI kamera eklem analizi ve spor hekimliği zekasını sınırsız kullan.
              </p>
            </div>

            {/* AYLIK / YILLIK GEÇİŞ SEÇİCİSİ */}
            <div className="fx-subBillingSelector">
              <button
                type="button"
                className={`fx-subBillingTab ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setBillingCycle('yearly');
                }}
              >
                <div className="fx-subTabBadge">%40 TASARRUF</div>
                <b>Yıllık Plan</b>
                <div className="fx-subPriceRow">
                  <span>₺</span>
                  <strong>79</strong>
                  <small>/ ay</small>
                </div>
                <small className="fx-subBilledInfo">Yıllık 948 ₺ faturalandırılır (7 gün ücretsiz)</small>
              </button>

              <button
                type="button"
                className={`fx-subBillingTab ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => {
                  sounds.tap();
                  setBillingCycle('monthly');
                }}
              >
                <b>Aylık Plan</b>
                <div className="fx-subPriceRow">
                  <span>₺</span>
                  <strong>129</strong>
                  <small>/ ay</small>
                </div>
                <small className="fx-subBilledInfo">Esnek, dilediğin an tek dokunuşla iptal et</small>
              </button>
            </div>

            {/* ÖZELLİK LİSTESİ */}
            <div className="fx-subFeatureList">
              <span className="fx-subLabel">ATELIER BLACK AYRICALIKLARI:</span>
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
                <b>Sıfır Tuzak Güvencesi:</b> Barkod tarayıcı, egzersiz kütüphanesi ve antrenman sayacı her zaman %100 ücretsiz kalır.
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
                  background: 'linear-gradient(135deg, #f5c451 0%, #ff4d1c 100%)',
                  color: '#090a0f',
                  fontWeight: 900
                }}
              >
                <Crown size={18} />
                {processing
                  ? 'Aktivasyon Yapılıyor…'
                  : billingCycle === 'yearly'
                  ? '7 Gün Ücretsiz Dene & Başlat'
                  : 'Atelier Black’e Geç (₺129/ay)'}
              </button>

              {currentMembership.isPro && (
                <button
                  type="button"
                  className="fx-btn fx-btn--ghost fx-btn--sm"
                  onClick={handleCancelTest}
                  style={{ marginTop: 6 }}
                >
                  (Test Modu) Aboneliği Ücretsiz Plana Döndür
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
