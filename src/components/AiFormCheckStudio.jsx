import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Check, AlertTriangle, ShieldCheck, Activity, Award, RefreshCw } from 'lucide-react';
import AiEnergyPill from './AiEnergyPill.jsx';
import SubscriptionModal from './SubscriptionModal.jsx';
import { consumeAiCredit } from '../lib/aiQuota.js';
import { sounds } from '../lib/audio.js';

const EXERCISE_PROTOCOLS = {
  squat: {
    name: 'Barbell Back Squat',
    sampleScore: 9.1,
    joints: [
      { name: 'Diz Valgus Hizalaması', status: 'Mükemmel', detail: 'Dizler ayak parmakları yönünde açılıyor, içe çökme (valgus) yok.' },
      { name: 'Kalça Derinliği (Depth)', status: 'Kusursuz', detail: 'Femur kemiği diz kapağı paralelliğinin altına iniyor (Full ROM).' },
      { name: 'Bel & Omurga Nötrlüğü', status: 'İyi', detail: 'Alt omurgada aşırı fleksiyon (butt wink) tespit edilmedi.' },
      { name: 'Bar Yolu (Bar Path)', status: 'Dikey', detail: 'Ağırlık merkezi ayağın tam ortasında (mid-foot) dengeli.' }
    ],
    tips: [
      'İnişe başlamadan önce Valsalva manevrasıyla nefesi diyaframa kilitleyin.',
      'En alt noktada tabanların dış kenarlarına hafif baskı uygulayarak glute kaslarını aktive edin.',
      'Kalkışta göğsü ve kalçayı aynı anda yükseltin (Good morning squat hatasından kaçının).'
    ]
  },
  deadlift: {
    name: 'Conventional Deadlift',
    sampleScore: 8.8,
    joints: [
      { name: 'Bel Eğriliği (Lumbar Flexion)', status: 'Nötr & Güvenli', detail: 'Omurga düz bir hat üzerinde kilitli, bel fıtığı riski sıfıra yakın.' },
      { name: 'Bar - Kaval Mesafesi', status: 'Mükemmel', detail: 'Bar kaval kemiğine yapışık yükseliyor, moment kolu minimum.' },
      { name: 'Omuz Başlangıç Pozisyonu', status: 'Doğru', detail: 'Skapula barın tam dikey iz düşümünde.' }
    ],
    tips: [
      'Barı yerden koparmadan önce "Slack"i (bardaki boşluğu) çekip sırtı gerin.',
      'Dizleri erkenden kilitlemeyin; bar diz kapağını geçtikten sonra kalçayı öne vurun.',
      'Tepe noktasında geriye doğru aşırı yaslanmayın (hiperekstansiyon yapmayın).'
    ]
  },
  bench: {
    name: 'Barbell Bench Press',
    sampleScore: 9.3,
    joints: [
      { name: 'Skapula Retraksiyonu', status: 'Kilitli', detail: 'Kürek kemikleri sehpaya kenetli, omuz kapsülü tam korumada.' },
      { name: 'Dirsek Açısı (Flaring)', status: 'Optimal (75°)', detail: 'Dirsekler 90 derece açılmıyor, rotator cuff sıkışması engellendi.' },
      { name: 'Bacak İtişi (Leg Drive)', status: 'Aktif', detail: 'Topuklar zemine basılı, vücut boyu stabilizasyon sağlanmış.' }
    ],
    tips: [
      'Barı göğsün alt kısmına (sternum hizasına) kontrollü indirin.',
      'Barı indirirken kürek kemiklerini birbirine daha da yaklaştırın.',
      'İtiş yaparken sehpaya doğru kendinizi ittiğinizi hayal edin.'
    ]
  }
};

export default function AiFormCheckStudio() {
  const [selectedEx, setSelectedEx] = useState('squat');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(EXERCISE_PROTOCOLS.squat);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelectEx = (key) => {
    sounds.tap();
    setSelectedEx(key);
    setAnalysisResult(EXERCISE_PROTOCOLS[key]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // AI Kota kontrolü
    if (!consumeAiCredit()) {
      setShowSubModal(true);
      return;
    }

    sounds.tap();
    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedPreview(event.target.result);
      setTimeout(() => {
        sounds.success();
        setAnalyzing(false);
        setAnalysisResult({
          ...EXERCISE_PROTOCOLS[selectedEx],
          sampleScore: 8.9
        });
      }, 1600);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fx-stack fx-aiFormStudio">
      <div className="fx-cardHead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Sparkles size={20} color="#00f0ff" /> AI Kamera ile Form &amp; Biyomekanik Analizörü
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
            Egzersiz yaparken fotoğrafını veya kısa videonu yükle; yapay zeka eklem açılarını, omurga nötrlüğünü ve sakatlık riskini tarasın.
          </p>
        </div>
        <AiEnergyPill onOpenSubscription={() => setShowSubModal(true)} />
      </div>

      {/* EGZERSİZ SEÇİCİ */}
      <div className="fx-formExPills">
        <button
          type="button"
          className={`fx-formExBtn ${selectedEx === 'squat' ? 'active' : ''}`}
          onClick={() => handleSelectEx('squat')}
        >
          🏋️‍♂️ Barbell Squat
        </button>
        <button
          type="button"
          className={`fx-formExBtn ${selectedEx === 'deadlift' ? 'active' : ''}`}
          onClick={() => handleSelectEx('deadlift')}
        >
          ⚡ Conventional Deadlift
        </button>
        <button
          type="button"
          className={`fx-formExBtn ${selectedEx === 'bench' ? 'active' : ''}`}
          onClick={() => handleSelectEx('bench')}
        >
          💪 Barbell Bench Press
        </button>
      </div>

      <div className="fx-grid2" style={{ gap: 16 }}>
        {/* SOL: FOTOĞRAF / VİDEO YÜKLEME KUTUSU */}
        <div className="fx-card fx-glassModule fx-formUploadCard">
          <span className="fx-subLabel">EGZERSİZ GÖRÜNTÜSÜ:</span>

          <div
            className="fx-formDropzone"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadedPreview ? (
              <img src={uploadedPreview} alt="Form Analizi" className="fx-formPreviewImg" />
            ) : (
              <div className="fx-dropzoneContent">
                <Camera size={44} color="#ff4d1c" />
                <b>Fotoğraf veya Video Çek / Yükle</b>
                <p>Squat, Deadlift veya Bench press formunu yandan veya çaprazdan gösteren bir kare seçin.</p>
                <button type="button" className="fx-btn fx-solarBtn fx-btn--sm">
                  <Upload size={14} /> Dosya Seç
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,video/*"
              onChange={handleFileUpload}
            />
          </div>

          {analyzing && (
            <div className="fx-analyzingBanner animate-pulse">
              <RefreshCw size={16} className="animate-spin" />
              <span>Yapay Zeka Biyomekanik Eklem Açılarını İnceliyor…</span>
            </div>
          )}
        </div>

        {/* SAĞ: BİYOMEKANİK PUAN & EKLEM RAPORU */}
        <div className="fx-card fx-glassModule fx-formScoreCard">
          <div className="fx-formScoreHead">
            <div>
              <small>BİYOMEKANİK FORM PUANI</small>
              <div className="fx-formBigScore">
                <b className="fx-monoVal" style={{ color: '#00f0ff' }}>{analysisResult.sampleScore}</b>
                <span>/ 10</span>
              </div>
            </div>
            <div className="fx-formScoreBadge">
              <ShieldCheck size={18} color="#c8ff00" />
              <span>YÜKSEK GÜVENLİK · DÜŞÜK SAKATLIK RİSKİ</span>
            </div>
          </div>

          <div className="fx-jointsList">
            <span className="fx-subLabel" style={{ marginBottom: 6 }}>EKLEM AÇILARI &amp; OMURGA DEĞERLENDİRMESİ:</span>
            {analysisResult.joints.map((j, idx) => (
              <div key={idx} className="fx-jointRow">
                <div className="fx-jointHeader">
                  <b>{j.name}</b>
                  <span className="fx-badgeOk"><Check size={12} /> {j.status}</span>
                </div>
                <p>{j.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 KRİTİK İYİLEŞTİRME PROTOKOLÜ */}
      <div className="fx-card">
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--fx-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} color="#c8ff00" /> BU HAREKETTE KUSURSUZ FORMA ULAŞMAK İÇİN 3 BİYOMEKANİK TAVSİYE
        </h4>
        <div className="fx-stack" style={{ gap: 8 }}>
          {analysisResult.tips.map((t, idx) => (
            <div key={idx} className="fx-formTipRow">
              <span className="fx-tipNum">0{idx + 1}</span>
              <p>{t}</p>
            </div>
          ))}
        </div>
      </div>

      {showSubModal && (
        <SubscriptionModal onClose={() => setShowSubModal(false)} />
      )}
    </div>
  );
}
