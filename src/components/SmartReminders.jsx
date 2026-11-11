import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, Droplets, Flame, ShieldAlert } from 'lucide-react';
import { Card } from './ui.jsx';

const REMINDERS_KEY = 'fit-smart-reminders-v1';

export default function SmartReminders({ totals, target, setMessage }) {
  const [permission, setPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(REMINDERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      water: true,
      protein: true,
      streak: true,
      eveningHour: '20:00'
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  const requestPerm = async () => {
    if (typeof Notification === 'undefined') {
      setMessage?.('Bu tarayıcı masaüstü/mobil bildirimleri desteklemiyor.');
      return;
    }
    const res = await Notification.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      sendTestNotification();
    } else {
      setMessage?.('Bildirim izni verilmedi. Tarayıcı adres çubuğundan izin verebilirsin.');
    }
  };

  const sendTestNotification = () => {
    const remPro = Math.max(0, (target?.protein || 140) - (totals?.protein || 0));
    const bodyText =
      remPro > 0
        ? `Günlük hedefine ${remPro}g protein kaldı. 1 ölçek whey veya süzme yoğurtla hedefi tamamla! 💪`
        : 'Harika gidiyorsun! Günlük protein hedefin tamamlandı, serin (Streak) güvende. 🔥';

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('Fit AI Koç · Akıllı Hatırlatıcı', {
          body: bodyText,
          icon: '/icons/icon-192.svg'
        });
      } catch {}
    }
    setMessage?.(`Bildirim tetiklendi: "${bodyText}"`);
  };

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card
      title="Akıllı Hatırlatıcı & Bildirim Merkezi"
      subtitle="Serini (Streak), su tüketimini ve akşam protein hedefini kaçırmaman için disiplin kalkanı"
      action={
        permission === 'granted' ? (
          <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={sendTestNotification}>
            <BellRing size={14} /> Test Bildirimi Gönder
          </button>
        ) : (
          <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" onClick={requestPerm}>
            <Bell size={14} /> Bildirimleri Aç
          </button>
        )
      }
    >
      <div className="fx-reminderGrid">
        <button
          type="button"
          className={`fx-reminderItem ${prefs.water ? 'active' : ''}`}
          onClick={() => togglePref('water')}
        >
          <Droplets size={18} className="fx-accentIcon" />
          <div className="fx-reminderText">
            <b>Hidrasyon & Su Hatırlatıcısı</b>
            <small>Gün içinde su hedefin geride kaldığında uyarır</small>
          </div>
          <span className="fx-reminderToggle">{prefs.water ? <Check size={14} /> : 'Kapalı'}</span>
        </button>

        <button
          type="button"
          className={`fx-reminderItem ${prefs.protein ? 'active' : ''}`}
          onClick={() => togglePref('protein')}
        >
          <Flame size={18} className="fx-accentIcon" />
          <div className="fx-reminderText">
            <b>Akşam Protein Kalkanı (20:00)</b>
            <small>Eksik protein miktarını ve 1-tık öğün önerisini bildirir</small>
          </div>
          <span className="fx-reminderToggle">{prefs.protein ? <Check size={14} /> : 'Kapalı'}</span>
        </button>

        <button
          type="button"
          className={`fx-reminderItem ${prefs.streak ? 'active' : ''}`}
          onClick={() => togglePref('streak')}
        >
          <ShieldAlert size={18} className="fx-accentIcon" />
          <div className="fx-reminderText">
            <b>Seri (Streak) Koruma Uyarısı (21:30)</b>
            <small>Gün bitmeden serinin sıfırlanmaması için son çağrı</small>
          </div>
          <span className="fx-reminderToggle">{prefs.streak ? <Check size={14} /> : 'Kapalı'}</span>
        </button>
      </div>
    </Card>
  );
}
