import React, { useState, useEffect } from 'react';
import {
  Users,
  Flame,
  Zap,
  Share2,
  Copy,
  Check,
  UserPlus,
  Heart,
  Dumbbell,
  Clock,
  Sparkles,
  Award,
  Send,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { Card } from './ui.jsx';
import { sounds } from '../lib/audio.js';

const STORAGE_KEY = 'fit-gym-buddy-v1';

const NUDGE_MESSAGES = [
  'Hadi şampiyon, ağırlıklar salonda bizi bekliyor! 🚀',
  'Bugün antrenman günü, mazeret yok! 🔥',
  'Sen basarsan ben de basarım, salonda görüşürüz! 💪',
  'Harika bir form yakaladık, seriyi bozmayalım! ⚡',
  '1 saat sonra antrenmandayım, hazır ol! ⏱️'
];

export default function GymBuddyStudio({ profile, onStartWorkout }) {
  const [buddy, setBuddy] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    // If profile already had buddy info
    if (profile?.gymBuddy) return profile.gymBuddy;
    return null;
  });

  const [copiedCode, setCopiedCode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [nudgeSent, setNudgeSent] = useState('');
  const [customMsg, setCustomMsg] = useState('');

  // Form states for adding buddy
  const [formName, setFormName] = useState('');
  const [formGoal, setFormGoal] = useState('Kas Kütlesi & Hipertrofi');
  const [formFrequency, setFormFrequency] = useState(4);
  const [formStatus, setFormStatus] = useState('waiting');

  const myInviteCode = 'FIT-' + (profile?.name ? profile.name.slice(0, 3).toUpperCase() : 'PRO') + '9K2';

  useEffect(() => {
    try {
      if (buddy) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buddy));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, [buddy]);

  const copyCode = () => {
    sounds.tap();
    navigator.clipboard?.writeText(myInviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2400);
  };

  const handleCreateBuddy = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    sounds.success();
    const newBuddy = {
      id: 'buddy_' + Date.now(),
      name: formName.trim(),
      goal: formGoal,
      frequency: Number(formFrequency) || 4,
      streak: 7,
      status: formStatus,
      lastWorkoutName: 'İtiş & Omuz (62 dk)',
      lastWorkoutTime: 'Dün 18:30',
      nudgesReceived: 0,
      joinedAt: new Date().toLocaleDateString('tr-TR')
    };
    setBuddy(newBuddy);
    setShowAddModal(false);
    setFormName('');
  };

  const sendNudge = (msg) => {
    sounds.success();
    const selectedMsg = msg || NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)];
    setNudgeSent(selectedMsg);
    setBuddy((prev) => (prev ? { ...prev, streak: prev.streak + 1 } : prev));
    setTimeout(() => setNudgeSent(''), 4000);
  };

  const removeBuddy = () => {
    if (confirm('Gym Buddy bağlantısını kaldırmak istediğine emin misin?')) {
      sounds.tap();
      setBuddy(null);
    }
  };

  return (
    <div className="fx-stack fx-gymBuddyStudio">
      {/* BAŞLIK & VİZYON KARTI */}
      <div className="fx-buddyHeroCard">
        <div className="fx-buddyHeroInfo">
          <div className="fx-atelierEyebrow">
            <span>[COMMUNITY PROTOCOL]</span> · SORUMLULUK & MOTİVASYON
          </div>
          <h2 className="fx-buddyHeroTitle">
            Gym Buddy <span>Antrenman Partneri</span>
          </h2>
          <p className="fx-buddyHeroSub">
            Tek başına antrenman yapanların devamlılığı %40 civarındayken, ortak antrenman partneri
            olan sporcularda bu oran <b>%88'e çıkar</b>. Birbirinize gaz verin, seriyi koruyun.
          </p>
        </div>

        <div className="fx-buddyInvitePod">
          <span className="fx-inviteLabel">SENİN DAVET KODUN:</span>
          <div className="fx-inviteBox">
            <code className="fx-inviteCode">{myInviteCode}</code>
            <button type="button" className="fx-copyBtn" onClick={copyCode}>
              {copiedCode ? <Check size={14} color="#00f0ff" /> : <Copy size={14} />}
              <span>{copiedCode ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>
        </div>
      </div>

      {nudgeSent && (
        <div className="fx-nudgeBanner animate-fade-in">
          <Zap size={18} className="fx-iconGlow" />
          <div className="fx-nudgeBannerText">
            <b>{buddy?.name || 'Partnerine'} Gaz Verildi!</b>
            <span>"{nudgeSent}"</span>
          </div>
        </div>
      )}

      {/* PARTNER VAR MI / YOK MU? */}
      {buddy ? (
        <div className="fx-buddyActiveGrid">
          {/* PARTNER KARTI */}
          <div className="fx-card fx-buddyCard">
            <div className="fx-buddyCardHead">
              <div className="fx-buddyIdentity">
                <div className="fx-buddyAvatar">
                  {buddy.name.charAt(0).toUpperCase()}
                  <span className={`fx-buddyLiveDot ${buddy.status === 'completed' ? 'active' : ''}`} />
                </div>
                <div>
                  <h3 className="fx-buddyName">{buddy.name}</h3>
                  <span className="fx-buddyGoal">{buddy.goal}</span>
                </div>
              </div>

              <div className="fx-buddyStreakBadge">
                <Flame size={18} color="#ff4d1c" />
                <div>
                  <b className="fx-monoVal">{buddy.streak} GÜN</b>
                  <small>ORTAK SERİ</small>
                </div>
              </div>
            </div>

            <div className="fx-buddyStatusBox">
              <div className="fx-buddyStatusRow">
                <span className="fx-statusLabel">BUGÜNKÜ DURUMU:</span>
                {buddy.status === 'completed' ? (
                  <span className="fx-badgeOk">
                    <Check size={13} /> Antrenmanı Tamamladı ({buddy.lastWorkoutName})
                  </span>
                ) : (
                  <span className="fx-badgeWarn">
                    <Clock size={13} /> Henüz Başlamadı · Salona Çağır!
                  </span>
                )}
              </div>
              <div className="fx-buddyStatusRow">
                <span className="fx-statusLabel">HAFTALIK HEDEF:</span>
                <span className="fx-statusVal">Haftada {buddy.frequency || 4} Seans</span>
              </div>
            </div>

            {/* GAZ VERME / DÜRT BUTONLARI */}
            <div className="fx-nudgeSection">
              <span className="fx-subLabel">
                <Zap size={14} color="#ff4d1c" /> <b>PARTNERİNE GAZ VER / DÜRT:</b>
              </span>
              <div className="fx-nudgePills">
                {NUDGE_MESSAGES.slice(0, 3).map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="fx-nudgePillBtn"
                    onClick={() => sendNudge(m)}
                  >
                    <span>{m}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="fx-buddyCardFooter">
              {onStartWorkout && (
                <button
                  type="button"
                  className="fx-btn fx-solarBtn fx-btn--block"
                  onClick={onStartWorkout}
                >
                  <Dumbbell size={16} /> Birlikte Antrenman Başlat
                </button>
              )}
              <button
                type="button"
                className="fx-btn fx-btn--ghost fx-btn--sm"
                onClick={removeBuddy}
                style={{ color: '#ff6b6b' }}
              >
                <Trash2 size={14} /> Partneri Kaldır
              </button>
            </div>
          </div>

          {/* SAĞ TARAF: ORTAK SORUMLULUK & REKABET İSTATİSTİKLERİ */}
          <div className="fx-card fx-buddyInsights">
            <div className="fx-cardHead">
              <div>
                <h3>
                  <Award size={18} color="#00f0ff" /> Sorumluluk & Rekabet Matrisi
                </h3>
                <p>Sen ve {buddy.name} arasındaki antrenman uyumu</p>
              </div>
            </div>

            <div className="fx-buddyStatsMatrix">
              <div className="fx-matrixBox">
                <small>ORTAK DEVAMLILIK</small>
                <b style={{ color: '#00f0ff' }}>%94</b>
                <span>Son 30 Gün</span>
              </div>
              <div className="fx-matrixBox">
                <small>TOPLAM ORTAK SEANS</small>
                <b style={{ color: '#ff4d1c' }}>28</b>
                <span>Birlikte tamamlandı</span>
              </div>
              <div className="fx-matrixBox">
                <small>KARŞILIKLI DÜRTME</small>
                <b style={{ color: '#a855f7' }}>18</b>
                <span>Motivasyon ateşlendi</span>
              </div>
            </div>

            <div className="fx-buddyQuote">
              <Sparkles size={16} color="#c8ff00" />
              <span>
                "Tek başına hızlı gidebilirsin ama bir partnerle <b>çok daha uzağa</b> gidersin."
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* PARTNER BAĞLI DEĞİLSE */
        <div className="fx-card fx-emptyBuddyCard">
          <div className="fx-emptyBuddyVisual">
            <Users size={48} strokeWidth={1.5} color="#ff4d1c" />
          </div>
          <h3>Henüz Bir Gym Buddy Eklenmedi</h3>
          <p>
            Birlikte antrenman yaptığın spor arkadaşını ekleyerek birbirinizin antrenmanlarını
            canlı takip edebilir, dürtmelerle motivasyonu zirvede tutabilirsiniz.
          </p>

          <div className="fx-emptyBuddyActions">
            <button
              type="button"
              className="fx-btn fx-solarBtn"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus size={16} /> Partnerini Ekle
            </button>
            <button
              type="button"
              className="fx-btn fx-btn--ghost"
              onClick={() => {
                // Quick sample buddy for instant gratification
                sounds.success();
                setBuddy({
                  id: 'sample_buddy',
                  name: 'Baran (Örnek Partner)',
                  goal: 'Hipertrofi & Adonis Form',
                  frequency: 5,
                  streak: 12,
                  status: 'waiting',
                  lastWorkoutName: 'Göğüs & Triceps (65 dk)',
                  lastWorkoutTime: 'Dün 19:15',
                  nudgesReceived: 2
                });
              }}
            >
              <Sparkles size={15} /> Örnek Partner Profili Yükle
            </button>
          </div>
        </div>
      )}

      {/* PARTNER EKLEME MODALI */}
      {showAddModal && (
        <div className="fx-modalBackdrop" onClick={() => setShowAddModal(false)}>
          <div className="fx-modal fx-buddyModal" onClick={(e) => e.stopPropagation()}>
            <div className="fx-modalHead">
              <h3>
                <UserPlus size={20} color="#ff4d1c" /> Yeni Gym Buddy Bağla
              </h3>
              <button
                type="button"
                className="fx-modalClose"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBuddy} className="fx-stack" style={{ gap: 14 }}>
              <label className="fx-field">
                <span>PARTNERİNİN ADI / LAKABI *</span>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mert, Baran, Selin"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                />
              </label>

              <label className="fx-field">
                <span>ANA FİTNESS HEDEFİ</span>
                <select value={formGoal} onChange={(e) => setFormGoal(e.target.value)}>
                  <option value="Kas Kütlesi & Hipertrofi">Kas Kütlesi & Hipertrofi (Bulk)</option>
                  <option value="Yağ Yakımı & Definasyon">Yağ Yakımı & Definasyon (Cut)</option>
                  <option value="Adonis 1.618 & Recomp">Adonis 1.618 & Rekompozisyon</option>
                  <option value="Maksimum Güç & Powerlifting">Maksimum Güç & Powerlifting</option>
                </select>
              </label>

              <label className="fx-field">
                <span>HAFTALIK ANTRENMAN SIKLIĞI</span>
                <select
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(Number(e.target.value))}
                >
                  <option value={3}>Haftada 3 Gün</option>
                  <option value={4}>Haftada 4 Gün</option>
                  <option value={5}>Haftada 5 Gün</option>
                  <option value={6}>Haftada 6 Gün</option>
                </select>
              </label>

              <div className="fx-modalActions">
                <button
                  type="button"
                  className="fx-btn fx-btn--ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="fx-btn fx-solarBtn">
                  <Check size={16} /> Partneri Bağla & Başla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
