import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Check, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import AiEnergyPill from './AiEnergyPill.jsx';
import SubscriptionModal from './SubscriptionModal.jsx';
import { consumeAiCredit, getAiQuota } from '../lib/aiQuota.js';
import { callAI } from '../lib/api.js';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';

const EXERCISE_PROTOCOLS = {
  squat: {
    name: 'Barbell Back Squat',
    joints: [
      { name: 'Diz Hizalaması (Valgus Kontrolü)', status: 'Kontrol Et', detail: 'Dizler ayak parmakları hizasında açılmalı; içe çökme olmamalıdır.' },
      { name: 'Kalça Derinliği (Full ROM)', status: 'Standart', detail: 'Kalça kıvrımı diz kapağı paralelliğine veya hemen altına inmelidir.' },
      { name: 'Bel & Omurga Nötrlüğü', status: 'Güvenli', detail: 'Alt noktada bel yuvarlanmasını (butt wink) önlemek için core kilitli kalmalıdır.' },
      { name: 'Bar Yolu (Bar Path)', status: 'Dikey', detail: 'Bar ağırlık merkezi orta ayak çizgisinden dikey inip çıkmalıdır.' }
    ],
    tips: [
      'İniş öncesi diyafram nefesi alıp karın duvarını dışa doğru kilitleyin (Bracing).',
      'Ayak tabanını 3 noktada (başparmak kökü, serçe kökü, topuk) zemine vidalayın.',
      'Kalkışta göğüs ve kalça aynı hızda yükselmeli; kalça önce fırlamamalıdır.'
    ]
  },
  deadlift: {
    name: 'Conventional Deadlift',
    joints: [
      { name: 'Bel Nötrlüğü (Lumbar Neutral)', status: 'Kritik', detail: 'Çekiş öncesi lat kaslarını sıkıp sırtı düz hat üzerinde sabitleyin.' },
      { name: 'Bar – Kaval Mesafesi', status: 'Yakın', detail: 'Bar kaval kemiğine çok yakın (~2–3 cm) dikey hat üzerinde yükselmelidir.' },
      { name: 'Omuz Başlangıç Pozisyonu', status: 'Hizalı', detail: 'Kürek kemikleri (skapula) barın tam dikey iz düşümünde konumlanmalıdır.' }
    ],
    tips: [
      'Barı yerden koparmadan önce bardaki boşluğu ("slack") alın ve bacakla yeri itin.',
      'Bar diz kapağını geçtiği anda kalçayı kontrollü biçimde öne kilitleyin.',
      'Tepe noktasında beli geriye fazla bükerek hiperekstansiyon yapmayın.'
    ]
  },
  bench: {
    name: 'Barbell Bench Press',
    joints: [
      { name: 'Skapula Retraksiyonu', status: 'Kilitli', detail: 'Kürek kemikleri geri ve aşağı çekilerek sehpaya sabitlenmelidir.' },
      { name: 'Dirsek Açısı (~45°–75°)', status: 'Güvenli', detail: 'Dirsekleri 90° yana açmak yerine gövdeyle 45°–75° açıda tutun.' },
      { name: 'Bacak İtişi (Leg Drive)', status: 'Aktif', detail: 'Ayaklar yere tam basılı olmalı, gövde stabilizasyonu alt vücuttan desteklenmelidir.' }
    ],
    tips: [
      'Barı köprücük kemiğine değil göğsün alt–orta hattına (sternum) indirin.',
      'İndirişte kontrolü koruyun; göğüste sektirme yapmayın.',
      'İtiş boyunca bilekleri düz tutun ve kürek kemiklerini bozmayın.'
    ]
  },
  ohp: {
    name: 'Standing Overhead Press',
    joints: [
      { name: 'Core & Kalça Kilidi', status: 'Gergin', detail: 'Kalça ve karın sıkılarak belde aşırı kavislilik önlenmelidir.' },
      { name: 'Önkol Dikeyliği', status: 'Dikey', detail: 'İtiş başlangıcında önkollar yere dik ve bar üst göğüste olmalıdır.' },
      { name: 'Baş Geçişi (Lockout)', status: 'Hizalı', detail: 'Bar alnı geçince kafa öne girer ve tepe noktada kulakların üstünde biter.' }
    ],
    tips: [
      'Dirsekleri barın hafif önüne yerleştirip tricep ve ön omuzu hizalayın.',
      'Bel ağrısı oluşuyorsa dizleri kilitlemeden kalçayı aktif tutun.',
      'Ağırlığı baş hizasında düz dikey hatta itin.'
    ]
  },
  row: {
    name: 'Bent-Over Row',
    joints: [
      { name: 'Kalça Menteşesi (Hip Hinge)', status: 'Stabil', detail: 'Gövde 30°–45° açıda kilitli kalmalı, tekrarlarda savrulmamalıdır.' },
      { name: 'Kürek Kemiği Çekişi', status: 'Aktif', detail: 'Çekişi ellerle değil dirsekleri kalçaya doğru çekerek başlatın.' }
    ],
    tips: [
      'Barı veya dambılları göğüse değil göbek/alt kaburga hattına çekin.',
      'Ağır kilolarda momentum kullanıp beli dikleştirmekten kaçının.'
    ]
  },
  bulgarian: {
    name: 'Bulgarian Split Squat',
    joints: [
      { name: 'Ön Diz Takibi', status: 'Doğru', detail: 'Ön diz ayak ucunu hafif geçebilir ancak içe çökmeden hizalı kalmalıdır.' },
      { name: 'Gövde Eğimi', status: 'Dengeli', detail: 'Kalça odağı için gövde hafif öne, kuadriseps odağı için daha dik tutulabilir.' }
    ],
    tips: [
      'Arka ayağa yüklenmeyin; kuvvetin %85+ kısmı ön bacaktan gelmelidir.',
      'Adım mesafesi çok dar olursa diz sıkışır, çok geniş olursa kalça bükülmesi bozulur.'
    ]
  }
};

/**
 * Seçilen resim veya videodan max 768px boyutunda net JPEG data URL karesi çıkarır.
 */
async function extractCompressedFrame(file) {
  const MAX_DIM = 768;

  if (file.type.startsWith('video/')) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const target = Math.min(1.0, Math.max(0.1, (video.duration || 2) * 0.25));
        video.currentTime = target;
      };
      video.onseeked = () => {
        try {
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 480;
          const scale = Math.min(1, MAX_DIM / Math.max(w, h));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round(h * scale);
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Video karesi okunamadı.'));
      };
      video.src = url;
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Görsel okunamadı.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}

export default function AiFormCheckStudio() {
  const { t } = useI18n();
  const [selectedEx, setSelectedEx] = useState('squat');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const fileInputRef = useRef(null);

  const protocol = EXERCISE_PROTOCOLS[selectedEx];

  const handleSelectEx = (key) => {
    sounds.tap();
    setSelectedEx(key);
    setAiReport(null);
    setErrorMsg('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const quota = getAiQuota();
    if (!quota.isPro && quota.remaining <= 0) {
      setShowSubModal(true);
      return;
    }

    sounds.tap();
    setAnalyzing(true);
    setErrorMsg('');
    setAiReport(null);

    try {
      const frameDataUrl = await extractCompressedFrame(file);
      setUploadedPreview(frameDataUrl);

      const res = await callAI('form_check', {
        exerciseName: protocol.name,
        image: frameDataUrl
      });

      const data = res?.data;
      if (!data) throw new Error('Vision AI yanıtı çözümlenemedi.');

      consumeAiCredit();
      sounds.success();
      setAiReport(data);
    } catch (err) {
      setErrorMsg(err?.message || t('formCheck.offlineWarn'));
    } finally {
      setAnalyzing(false);
      if (e.target) e.target.value = '';
    }
  };

  const activeJoints = aiReport?.joints?.length ? aiReport.joints : protocol.joints;
  const activeTips = aiReport?.tips?.length ? aiReport.tips : protocol.tips;

  return (
    <div className="fx-stack fx-aiFormStudio">
      <div className="fx-cardHead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Sparkles size={20} color="#06b6d4" /> {t('formCheck.title')}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
            {t('formCheck.sub')}
          </p>
        </div>
        <AiEnergyPill onOpenSubscription={() => setShowSubModal(true)} />
      </div>

      {/* EGZERSİZ SEÇİCİ */}
      <div className="fx-formExPills">
        {Object.entries(EXERCISE_PROTOCOLS).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={`fx-formExBtn ${selectedEx === key ? 'active' : ''}`}
            onClick={() => handleSelectEx(key)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="fx-grid2" style={{ gap: 16 }}>
        {/* SOL: FOTOĞRAF / VİDEO YÜKLEME */}
        <div className="fx-card fx-glassModule fx-formUploadCard">
          <span className="fx-subLabel">EGZERSİZ GÖRÜNTÜSÜ / VİDEO KARESİ:</span>

          <div
            className="fx-formDropzone"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadedPreview ? (
              <img src={uploadedPreview} alt="Form Analizi" className="fx-formPreviewImg" />
            ) : (
              <div className="fx-dropzoneContent">
                <Camera size={44} color="#ff4d1c" />
                <b>Fotoğraf veya Video Seç</b>
                <p>Squat, Deadlift, Press veya Row hareketini yandan/çaprazdan çeken bir kare yükle; videodan kare otomatik alınır.</p>
                <button type="button" className="fx-btn fx-solarBtn fx-btn--sm">
                  <Upload size={14} /> Görsel / Video Seç
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
              <span>Gemini Vision biyomekanik eklem hizalamasını inceliyor…</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                marginTop: 10,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--fx-text)',
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8
              }}
            >
              <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* SAĞ: GERÇEK VISION ANALİZİ veya DÜRÜST ÇEVRİMDIŞI KONTROL LİSTESİ */}
        <div className="fx-card fx-glassModule fx-formScoreCard">
          <div className="fx-formScoreHead">
            <div>
              <small>{aiReport ? 'GEMINI VISION PUANI' : t('formCheck.checklistMode')}</small>
              <div className="fx-formBigScore">
                {aiReport?.valid && aiReport?.score != null ? (
                  <>
                    <b className="fx-monoVal" style={{ color: '#06b6d4' }}>{aiReport.score}</b>
                    <span>/ 10</span>
                  </>
                ) : (
                  <b className="fx-monoVal" style={{ color: 'var(--fx-muted)', fontSize: 18 }}>
                    {aiReport && aiReport.valid === false ? 'Geçersiz Kare' : 'Hazır'}
                  </b>
                )}
              </div>
            </div>
            <div className="fx-formScoreBadge">
              <ShieldCheck size={18} color={aiReport?.valid ? '#10b981' : '#ff4d1c'} />
              <span>{aiReport?.riskLabel || 'TEKNİK REHBERİ'}</span>
            </div>
          </div>

          {aiReport?.note && (
            <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--fx-text)' }}>
              {aiReport.note}
            </p>
          )}

          <div className="fx-jointsList">
            <span className="fx-subLabel" style={{ marginBottom: 6 }}>EKLEM &amp; POSTÜR KONTROLÜ:</span>
            {activeJoints.map((j, idx) => (
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

      {/* BİYOMEKANİK İPUÇLARI */}
      <div className="fx-card">
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--fx-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} color="#ff4d1c" /> {protocol.name} — TEKNİK İYİLEŞTİRME ADIMLARI
        </h4>
        <div className="fx-stack" style={{ gap: 8 }}>
          {activeTips.map((tip, idx) => (
            <div key={idx} className="fx-formTipRow">
              <span className="fx-tipNum">0{idx + 1}</span>
              <p>{tip}</p>
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
