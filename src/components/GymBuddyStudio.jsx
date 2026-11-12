import React, { useState, useEffect } from 'react';
import {
  Users,
  Flame,
  Zap,
  Share2,
  Copy,
  Check,
  UserPlus,
  Dumbbell,
  Clock,
  Sparkles,
  Award,
  Send,
  Trash2,
  Crown,
  Shield,
  MessageSquare,
  TrendingUp,
  Activity,
  Coffee,
  Gift,
  AlertCircle
} from 'lucide-react';
import { sounds } from '../lib/audio.js';
import { getMaxGymBuddies, getAiMembership } from '../lib/aiQuota.js';
import SubscriptionModal from './SubscriptionModal.jsx';

const SQUAD_STORAGE_KEY = 'fit-gym-squad-v2';
const OLD_STORAGE_KEY = 'fit-gym-buddy-v1';
const WAGER_STORAGE_KEY = 'fit-squad-wager-stake-v1';

const WAGER_STAKES = {
  coffee: {
    id: 'coffee',
    title: 'Bütün Takıma Filtre Kahve',
    icon: '☕',
    badge: 'EN POPÜLER İDDİA',
    desc: 'Haftalık 4 antrenman hedefini tutturamayan, pazar akşamı tüm squad ekibine filtre kahve ısmarlar.',
    penaltyNote: 'Kahveleri hazırla kanka!'
  },
  protein: {
    id: 'protein',
    title: '1 Kutu Protein Bar Stoğu',
    icon: '🍫',
    badge: 'ŞAMPİYON ÖDÜLÜ',
    desc: 'Haftalık XP ve antrenman liderlik tablosunu 1. bitiren şampiyona tüm takım protein bar hediye eder.',
    penaltyNote: 'Bar borcun var kanka!'
  },
  pushups: {
    id: 'pushups',
    title: 'Salonda 100 Şınav Cezası',
    icon: '🏋️',
    badge: 'DİSİPLİN CEZASI',
    desc: 'Hedefe ulaşamayan üye sonraki ortak bacak/göğüs antrenmanında 100 şınav cezasını çeker.',
    penaltyNote: '100 şınav seni bekliyor!'
  },
  cheat: {
    id: 'cheat',
    title: 'Hafta Sonu Cheat Meal Ismarlama',
    icon: '🍕',
    badge: 'BÜYÜK HESAP',
    desc: 'Haftayı sonuncu sırada kapatan, pazar akşamı ekibe burger / pizza ziyafeti çeker.',
    penaltyNote: 'Menüyü hazırla kanka!'
  }
};

const NUDGE_MESSAGES = [
  'Hadi şampiyon, ağırlıklar salonda bizi bekliyor! 🚀',
  'Bugün antrenman günü, mazeret yok! 🔥',
  'Sen basarsan ben de basarım, salonda görüşürüz! 💪',
  'Harika bir form yakaladık, squad serisini bozmayalım! ⚡',
  '1 saat sonra antrenmandayım, hazır ol! ⏱️'
];

export default function GymBuddyStudio({ profile = {}, onStartWorkout }) {
  const [buddies, setBuddies] = useState(() => {
    try {
      const raw = localStorage.getItem(SQUAD_STORAGE_KEY);
      if (raw) return JSON.parse(raw);

      // Migrate from single buddy if exists
      const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldRaw) {
        const parsed = JSON.parse(oldRaw);
        if (parsed) return [parsed];
      }
    } catch {}

    // Default sample buddy for rich instant demo
    return [
      {
        id: 'buddy_sample_1',
        name: 'Ahmet Yılmaz',
        goal: 'Hipertrofi & Güç Artışı',
        frequency: 5,
        completedThisWeek: 4,
        streak: 12,
        status: 'training_now', // 'training_now' | 'completed' | 'rest' | 'waiting'
        lastWorkoutName: 'Push A · Göğüs & Omuz (52 dk)',
        lastWorkoutTime: 'Şu an salonda aktif',
        xp: 1180,
        joinedAt: '12 Eki 2026'
      }
    ];
  });

  const [copiedCode, setCopiedCode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [nudgeSent, setNudgeSent] = useState('');

  // Add buddy form
  const [formName, setFormName] = useState('');
  const [formGoal, setFormGoal] = useState('Hipertrofi & Kas Kütlesi');
  const [formFrequency, setFormFrequency] = useState(4);
  const [formStatus, setFormStatus] = useState('waiting');

  // Squad Wagers & Stakes State
  const [wagerStakeKey, setWagerStakeKey] = useState(() => {
    try {
      return localStorage.getItem(WAGER_STORAGE_KEY) || 'coffee';
    } catch {
      return 'coffee';
    }
  });

  const handleSelectWager = (key) => {
    sounds.tap();
    setWagerStakeKey(key);
    try {
      localStorage.setItem(WAGER_STORAGE_KEY, key);
    } catch {}
  };

  const maxBuddiesAllowed = getMaxGymBuddies();
  const membership = getAiMembership();
  const isFamilySquad = membership.plan === 'family' || membership.plan === 'squad';

  const myInviteCode = 'FIT-' + (profile?.name ? profile.name.slice(0, 3).toUpperCase() : 'PRO') + '9K2';
  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/#tools` : 'https://fitpwa.app';

  const handleWagerBanter = async (buddyName) => {
    sounds.tap();
    const stake = WAGER_STAKES[wagerStakeKey] || WAGER_STAKES.coffee;
    const text = `Kanka Gym Squad'daki "${stake.title}" iddiamızda durumun kritik! ${stake.penaltyNote} ☕🔥 Güncel skora bak: ${inviteUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FIT. Squad İddia Durumu',
          text,
          url: inviteUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2400);
      } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  useEffect(() => {
    try {
      localStorage.setItem(SQUAD_STORAGE_KEY, JSON.stringify(buddies));
    } catch {}
  }, [buddies]);

  const copyCode = () => {
    sounds.tap();
    navigator.clipboard?.writeText(myInviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2400);
  };

  const handleShareWhatsApp = async () => {
    sounds.tap();
    const text = `Kanka FIT. uygulamasını aç, bizim Gym Buddy Squad'a katıl, ortak antrenman serisi yapalım! Katılım kodum: ${myInviteCode} 👉 ${inviteUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FIT. Gym Squad Daveti',
          text,
          url: inviteUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2400);
      } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleOpenAddModal = () => {
    sounds.tap();
    if (buddies.length >= maxBuddiesAllowed) {
      // Exceeded limit (e.g. Free user trying to add 2nd buddy, or Pro trying to add 3rd)
      setShowSubModal(true);
    } else {
      setShowAddModal(true);
    }
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
      completedThisWeek: 1,
      streak: 1,
      status: formStatus,
      lastWorkoutName: 'Giriş Seansı',
      lastWorkoutTime: 'Bugün katıldı',
      xp: 250,
      joinedAt: new Date().toLocaleDateString('tr-TR')
    };

    setBuddies((prev) => [...prev, newBuddy]);
    setShowAddModal(false);
    setFormName('');
  };

  const sendNudge = (buddyId, buddyName, msg) => {
    sounds.success();
    const selectedMsg = msg || NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)];
    setNudgeSent(`${buddyName} sporcusuna gaz verildi: "${selectedMsg}"`);

    setBuddies((prev) =>
      prev.map((b) => (b.id === buddyId ? { ...b, streak: b.streak + 1 } : b))
    );

    setTimeout(() => setNudgeSent(''), 4500);
  };

  const removeBuddy = (id) => {
    if (confirm('Bu arkadaşını squad ekibinden çıkarmak istediğine emin misin?')) {
      sounds.tap();
      setBuddies((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Squad Total Stats
  const squadStreak = Math.max(7, ...buddies.map((b) => b.streak || 0));
  const totalSquadWorkouts = buddies.reduce((acc, b) => acc + (b.completedThisWeek || 0), 3);

  return (
    <div className="fx-stack fx-gymBuddyStudio animate-fade-in">
      {/* 1. ÜST HERO SQUAD KOKPİTİ */}
      <div className="fx-card fx-squadHeroCard">
        <div className="fx-squadHeroMain">
          <div className="fx-squadTagGroup">
            <span className="fx-squadBadge">
              <Users size={13} color="#00f0ff" /> SQUAD PROTOKOLÜ // 4 KİŞİLİK ORTAK EKİP
            </span>
            <span className={`fx-squadTierTag ${isFamilySquad ? 'pro' : ''}`}>
              {isFamilySquad ? '👑 AİLE & SQUAD PLANI' : `ÜCRETSİZ SLOT: ${buddies.length}/${maxBuddiesAllowed}`}
            </span>
          </div>

          <h2 className="fx-squadHeroTitle">
            Gym Buddy <span>Squad &amp; Takım</span>
          </h2>
          <p className="fx-squadHeroSub">
            Tek başına salona gidenlerin vazgeçme oranı %60 iken, 2-4 kişilik Gym Buddy Squad ile çalışanlarda devamlılık <b>%88'e çıkar</b>.
            Canlı durumunu paylaş, ortak seri yap ve takımını zirveye taşı!
          </p>

          {/* SQUAD SLOTLARI GÖSTERGESİ (4 KİŞİLİK MİMARİ) */}
          <div className="fx-squadSlotsTrack">
            {/* Slot 1: Kaptan (Kullanıcı) */}
            <div className="fx-squadSlotCell active captain">
              <div className="fx-squadSlotAvatar">{profile?.name?.charAt(0) || 'K'}</div>
              <div className="fx-squadSlotMeta">
                <b>{profile?.name || 'Sen'} (Kaptan)</b>
                <small>Aktif</small>
              </div>
            </div>

            {/* Slot 2, 3, 4: Buddies or Empty */}
            {[0, 1, 2].map((slotIdx) => {
              const buddy = buddies[slotIdx];
              const isLocked = !buddy && slotIdx + 1 >= maxBuddiesAllowed;

              if (buddy) {
                return (
                  <div key={buddy.id} className="fx-squadSlotCell active">
                    <div className="fx-squadSlotAvatar">{buddy.name.charAt(0)}</div>
                    <div className="fx-squadSlotMeta">
                      <b>{buddy.name}</b>
                      <small>🔥 {buddy.streak}g seri</small>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={slotIdx}
                  type="button"
                  className={`fx-squadSlotCell empty ${isLocked ? 'locked' : ''}`}
                  onClick={handleOpenAddModal}
                >
                  <div className="fx-squadSlotAddIcon">
                    {isLocked ? <Crown size={14} color="#f5c451" /> : <UserPlus size={14} />}
                  </div>
                  <div className="fx-squadSlotMeta">
                    <b>{isLocked ? 'Slot Kilitli' : '+ Arkadaş Ekle'}</b>
                    <small>{isLocked ? 'Squad Planı' : 'Ücretsiz Slot'}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SAĞ TELEMETRİ KUTUCUĞU & DAVET KODU */}
        <div className="fx-squadQuickConnect">
          <div className="fx-squadTelemetryMini">
            <div className="fx-squadStatPod">
              <Flame size={18} color="#ff4d1c" />
              <div>
                <b>{squadStreak} GÜN</b>
                <small>ORTAK SERİ</small>
              </div>
            </div>
            <div className="fx-squadStatPod">
              <Activity size={18} color="#c8ff00" />
              <div>
                <b>{totalSquadWorkouts} SEANS</b>
                <small>BU HAFTA TOPLAM</small>
              </div>
            </div>
          </div>

          <div className="fx-squadInviteBox">
            <span className="fx-squadInviteLabel">SQUAD DAVET LİNKİ &amp; KODU:</span>
            <div className="fx-squadCodeRow">
              <code className="fx-squadCode">{myInviteCode}</code>
              <button type="button" className="fx-btn fx-btn--sm fx-copyBtn" onClick={copyCode}>
                {copiedCode ? <Check size={13} color="#00f0ff" /> : <Copy size={13} />}
                <span>{copiedCode ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
            <button
              type="button"
              className="fx-btn fx-btn--ghost fx-btn--sm fx-whatsappBtn"
              onClick={handleShareWhatsApp}
            >
              <Share2 size={13} color="#25D366" />
              <span>WhatsApp'tan Arkadaşını Davet Et</span>
            </button>
          </div>
        </div>
      </div>

      {/* GAZ VERME / BİLDİRİM BANNER'I */}
      {nudgeSent && (
        <div className="fx-nudgeBanner animate-fade-in">
          <Zap size={18} color="#ff4d1c" />
          <span>{nudgeSent}</span>
        </div>
      )}

      {/* 2. SQUAD ÜYELERİ KARTLARI */}
      <div className="fx-squadRosterSection">
        <div className="fx-squadRosterHead">
          <div>
            <h3 className="fx-squadSectionTitle">Aktif Takım Üyeleri ({buddies.length + 1}/4)</h3>
            <p className="fx-squadSectionSub">Arkadaşlarının canlı durumunu gör, motivasyon gönder ve seriyi koru.</p>
          </div>
          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--sm"
            onClick={handleOpenAddModal}
          >
            <UserPlus size={14} /> Yeni Partner Ekle
          </button>
        </div>

        <div className="fx-squadCardsGrid">
          {buddies.map((b) => {
            const isLive = b.status === 'training_now';
            const isDone = b.status === 'completed';

            return (
              <div key={b.id} className="fx-card fx-squadBuddyCard">
                <div className="fx-buddyTop">
                  <div className="fx-buddyIdentity">
                    <div className="fx-buddyAvatar">
                      {b.name.charAt(0)}
                      <span className={`fx-liveBeacon ${isLive ? 'pulse-green' : isDone ? 'done-green' : ''}`} />
                    </div>
                    <div>
                      <h4 className="fx-buddyName">{b.name}</h4>
                      <span className="fx-buddyGoal">{b.goal}</span>
                    </div>
                  </div>

                  <div className="fx-buddyFlameBadge">
                    <Flame size={15} color="#ff4d1c" />
                    <b>{b.streak} Gün</b>
                  </div>
                </div>

                {/* CANLI DURUM PİLİ */}
                <div className="fx-buddyStatusRow">
                  <span className="fx-statusEyebrow">CANLI DURUM:</span>
                  {isLive ? (
                    <span className="fx-liveStatusPill live">
                      <Dumbbell size={13} className="animate-spin" /> Şu an Salonda Basıyor!
                    </span>
                  ) : isDone ? (
                    <span className="fx-liveStatusPill done">
                      <Check size={13} /> Seans Tamamlandı ({b.lastWorkoutName})
                    </span>
                  ) : (
                    <span className="fx-liveStatusPill idle">
                      <Clock size={13} /> Henüz Başlamadı · Dürt ve Salona Çağır!
                    </span>
                  )}
                </div>

                {/* HAFTALIK İLERLEME */}
                <div className="fx-buddyProgressRow">
                  <div className="fx-progressLabels">
                    <span>Haftalık Hedef: {b.completedThisWeek || 3}/{b.frequency || 4} Seans</span>
                    <b>%{Math.min(100, Math.round(((b.completedThisWeek || 3) / (b.frequency || 4)) * 100))}</b>
                  </div>
                  <div className="fx-buddyTrack">
                    <span style={{ width: `${Math.min(100, ((b.completedThisWeek || 3) / (b.frequency || 4)) * 100)}%` }} />
                  </div>
                </div>

                {/* HIZLI DÜRT / GAZ VER BUTONLARI */}
                <div className="fx-nudgeActionPod">
                  <span className="fx-nudgePodTitle">
                    <Zap size={13} color="#f5c451" /> HIZLI DÜRT / MOTİVASYON:
                  </span>
                  <div className="fx-nudgeChips">
                    <button
                      type="button"
                      className="fx-nudgeChip"
                      onClick={() => sendNudge(b.id, b.name, 'Hadi basıyoruz, salonda bekliyorum! 🔥')}
                    >
                      🔥 Salondayım, gel!
                    </button>
                    <button
                      type="button"
                      className="fx-nudgeChip"
                      onClick={() => sendNudge(b.id, b.name, 'Seriyi bozma şampiyon, bugün basma günü! ⚡')}
                    >
                      ⚡ Seriyi bozma!
                    </button>
                    <button
                      type="button"
                      className="fx-nudgeChip"
                      onClick={() => sendNudge(b.id, b.name, 'Bugün PR bekliyorum senden! 🚀')}
                    >
                      🚀 Bugün PR günü!
                    </button>
                  </div>
                </div>

                <div className="fx-buddyCardFoot">
                  {onStartWorkout && (
                    <button
                      type="button"
                      className="fx-btn fx-solarBtn fx-btn--sm"
                      onClick={onStartWorkout}
                    >
                      <Dumbbell size={14} /> Birlikte Antrenman Başlat
                    </button>
                  )}
                  <button
                    type="button"
                    className="fx-iconBtn fx-removeBuddyBtn"
                    onClick={() => removeBuddy(b.id)}
                    title="Squad'dan Çıkar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. HAFTALIK SQUAD İDDİASI & CEZA ODASI (WAGER ARENA) */}
      <div className="fx-card fx-squadWagerCard">
        <div className="fx-wagerHead">
          <div>
            <div className="fx-wagerTagRow">
              <span className="fx-wagerTag">🔥 HAFTALIK REKABET &amp; İDDİA</span>
              <span className="fx-wagerGoalTag">HEDEF: 4 SEANS / HAFTA</span>
            </div>
            <h3 className="fx-wagerTitle">
              {WAGER_STAKES[wagerStakeKey]?.icon} {WAGER_STAKES[wagerStakeKey]?.title}
            </h3>
            <p className="fx-wagerSub">
              {WAGER_STAKES[wagerStakeKey]?.desc}
            </p>
          </div>
        </div>

        {/* İDDİA ÇEŞİDİ SEÇİCİ KAPSÜLLERİ */}
        <div className="fx-wagerSelectorGrid">
          {Object.values(WAGER_STAKES).map((stake) => (
            <button
              key={stake.id}
              type="button"
              className={`fx-wagerStakeBtn ${wagerStakeKey === stake.id ? 'active' : ''}`}
              onClick={() => handleSelectWager(stake.id)}
            >
              <span className="fx-stakeIcon">{stake.icon}</span>
              <div className="fx-stakeMeta">
                <b>{stake.title}</b>
                <small>{stake.badge}</small>
              </div>
            </button>
          ))}
        </div>

        {/* TAKIMIN İDDİA DURUMU (KİM GÜVENDE, KİM CEZA TEHLİKESİNDE?) */}
        <div className="fx-wagerTrackSection">
          <span className="fx-wagerTrackLabel">TAKIMIN GÜNCEL İDDİA DURUMU:</span>
          <div className="fx-wagerMembersGrid">
            {/* KAPTAN (SEN) */}
            <div className="fx-wagerMemberCell safe">
              <div className="fx-wagerMemberIdentity">
                <span className="fx-wagerAvatar">👑</span>
                <div>
                  <strong>{profile?.name || 'Sen (Kaptan)'}</strong>
                  <small>4 / 4 Seans Tamamlandı</small>
                </div>
              </div>
              <span className="fx-wagerStatusBadge safe">
                <Check size={12} /> GÜVENDE
              </span>
            </div>

            {/* DİĞER SQUAD ÜYELERİ */}
            {buddies.map((b) => {
              const completed = b.completedThisWeek || 1;
              const isSafe = completed >= 4;
              return (
                <div
                  key={b.id}
                  className={`fx-wagerMemberCell ${isSafe ? 'safe' : 'danger'}`}
                >
                  <div className="fx-wagerMemberIdentity">
                    <span className="fx-wagerAvatar">{b.name.charAt(0)}</span>
                    <div>
                      <strong>{b.name}</strong>
                      <small>{completed} / 4 Seans Tamamlandı</small>
                    </div>
                  </div>
                  <div className="fx-wagerActionGroup">
                    {isSafe ? (
                      <span className="fx-wagerStatusBadge safe">
                        <Check size={12} /> KAZANDI
                      </span>
                    ) : (
                      <>
                        <span className="fx-wagerStatusBadge danger">
                          <AlertCircle size={12} /> CEZA TEHLİKESİNDE
                        </span>
                        <button
                          type="button"
                          className="fx-btn fx-btn--xs fx-wagerBanterBtn"
                          onClick={() => handleWagerBanter(b.name)}
                          title="Arkadaşa cezasını WhatsApp'tan hatırlat"
                        >
                          <Coffee size={12} /> Dürt
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. SQUAD XP LİDERLİK TABLOSU & HAFTALIK AKIŞ */}
      <div className="fx-squadBottomGrid">
        {/* SOL: HAFTALIK SQUAD LİDERLİK PANOSU */}
        <div className="fx-card fx-squadLeaderboard">
          <div className="fx-cardHead">
            <div>
              <span className="fx-zenModuleEyebrow">HAFTALIK REKABET</span>
              <h3 style={{ margin: '2px 0 0', fontSize: 16 }}>Squad XP Liderlik Tablosu</h3>
            </div>
            <Award size={18} color="#f5c451" />
          </div>

          <div className="fx-leaderboardList">
            <div className="fx-leaderRow rank-1">
              <span className="fx-rankNum">1</span>
              <div className="fx-leaderMeta">
                <b>{profile?.name || 'Sen (Kaptan)'}</b>
                <small>4 Seans Tamamlandı</small>
              </div>
              <strong className="fx-leaderXp">1,420 XP</strong>
            </div>

            {buddies.map((b, idx) => (
              <div key={b.id} className={`fx-leaderRow rank-${idx + 2}`}>
                <span className="fx-rankNum">{idx + 2}</span>
                <div className="fx-leaderMeta">
                  <b>{b.name}</b>
                  <small>{b.completedThisWeek || 3} Seans Tamamlandı</small>
                </div>
                <strong className="fx-leaderXp">{b.xp || 950} XP</strong>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ: AİLE & SQUAD YÜKSELTME TEŞVİKİ */}
        {!isFamilySquad && (
          <div className="fx-card fx-squadUpgradePromo">
            <div className="fx-promoHead">
              <Crown size={22} color="#f5c451" />
              <div>
                <span className="fx-promoTag">EKİP AVANTAJI</span>
                <h4 style={{ margin: '2px 0 0', fontSize: 16, color: '#fff' }}>
                  4 Kişilik Aile &amp; Gym Squad Planı
                </h4>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--fx-muted)', margin: '10px 0 14px', lineHeight: 1.45 }}>
              Arkadaşlarınla masrafı bölüş! Aylık ₺299'a 4 kişi birden sınırsız AI Koç, biyomekanik tarama ve canlı Squad telemetrisine sahip olun (Kişi başı sadece ~₺75/ay).
            </p>
            <button
              type="button"
              className="fx-btn fx-solarBtn fx-btn--block"
              onClick={() => setShowSubModal(true)}
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #ff4d1c 100%)',
                color: '#090a0f',
                fontWeight: 900
              }}
            >
              <Users size={16} /> Squad Planını İncele (₺299/ay)
            </button>
          </div>
        )}
      </div>

      {/* ARKADAŞ EKLEME MODALI */}
      {showAddModal && (
        <div className="fx-modalBackdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="fx-modal fx-addBuddyModal animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fx-modalHead">
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserPlus size={18} color="#00f0ff" /> Squad'a Arkadaş Ekle
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fx-muted)' }}>
                  Arkadaşının adını ve hedefini girerek ortak telemetriye bağla.
                </p>
              </div>
              <button
                type="button"
                className="fx-modalClose"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBuddy} className="fx-formStack">
              <div className="fx-field">
                <label>Arkadaşının Adı &amp; Soyadı</label>
                <input
                  type="text"
                  placeholder="Örn: Burak Kaya"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="fx-field">
                <label>Antrenman Hedefi</label>
                <select value={formGoal} onChange={(e) => setFormGoal(e.target.value)}>
                  <option value="Hipertrofi & Kas Kütlesi">Hipertrofi &amp; Kas Kütlesi</option>
                  <option value="Kuvvet & Powerlifting">Kuvvet &amp; Powerlifting</option>
                  <option value="Yağ Yakımı & Definasyon">Yağ Yakımı &amp; Definasyon</option>
                  <option value="Kondisyon & Dayanıklılık">Kondisyon &amp; Dayanıklılık</option>
                </select>
              </div>

              <div className="fx-field">
                <label>Haftalık Hedef Seans Sayısı</label>
                <select value={formFrequency} onChange={(e) => setFormFrequency(e.target.value)}>
                  <option value="3">Haftada 3 Gün</option>
                  <option value="4">Haftada 4 Gün</option>
                  <option value="5">Haftada 5 Gün</option>
                  <option value="6">Haftada 6 Gün</option>
                </select>
              </div>

              <div className="fx-field">
                <label>Başlangıç Canlı Durumu</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                  <option value="training_now">🏋️ Şu an salonda aktif</option>
                  <option value="completed">✅ Bugün tamamladı</option>
                  <option value="waiting">⏰ Beklemede / Dinlenmede</option>
                </select>
              </div>

              <button
                type="submit"
                className="fx-btn fx-solarBtn fx-btn--block"
                style={{ marginTop: 12 }}
              >
                <Check size={16} /> Takıma Ekle &amp; Senkronize Et
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ABONELİK MODALI (AİLE & SQUAD PLANINI AÇAR) */}
      {showSubModal && (
        <SubscriptionModal
          initialPlan="family"
          onClose={() => setShowSubModal(false)}
        />
      )}
    </div>
  );
}
