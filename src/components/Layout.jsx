import React, { useState } from 'react';
import { Sun, Moon, Dumbbell, Utensils, LineChart, Bot, ChevronLeft, ChevronRight, WifiOff, Settings } from 'lucide-react';
import { today } from '../lib/calculations.js';
import { getTheme, setTheme } from '../lib/notifications.js';

export const TABS = [
  ['today', 'Bugün', Sun],
  ['training', 'Antrenman', Dumbbell],
  ['nutrition', 'Beslenme', Utensils],
  ['progress', 'Gelişim', LineChart],
  ['coach', 'Koç', Bot]
];

const TITLES = {
  today: 'Bugün',
  training: 'Antrenman',
  nutrition: 'Beslenme',
  progress: 'Gelişim',
  coach: 'AI Koç',
  settings: 'Ayarlar'
};

const shiftDay = (iso, delta) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDay = (iso) => {
  const t = today();
  if (iso === t) return 'Bugün';
  if (iso === shiftDay(t, -1)) return 'Dün';
  return new Date(iso + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });
};

export default function Layout({ tab, setTab, day, setDay, profile, online = true, children }) {
  const userName = profile?.name || 'Sporcu';
  const showDate = ['today', 'training', 'nutrition'].includes(tab);
  const isToday = day === today();
  const [theme, setThemeState] = useState(getTheme);

  const toggleTheme = () => {
    const next = setTheme(theme === 'dark' ? 'light' : 'dark');
    setThemeState(next);
  };

  return (
    <div className="fx-app">
      {/* Masaüstü yan menü */}
      <aside className="fx-sidebar">
        <div className="fx-logo">
          fit<span>.</span>
        </div>
        <nav>
          {TABS.map(([id, label, Icon]) => (
            <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button type="button" className={`fx-sideUser ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          <span className="fx-avatar">{userName.charAt(0).toUpperCase()}</span>
          <span className="fx-sideUserMeta">
            <b>{userName}</b>
            <small>Profil ve ayarlar</small>
          </span>
          <Settings size={16} />
        </button>
      </aside>

      <div className="fx-main">
        <header className="fx-header">
          <h1>{TITLES[tab] || ''}</h1>
          <div className="fx-headerRight">
            {!online && (
              <span className="fx-offline" title="Çevrimdışı: veriler cihazda saklanıyor">
                <WifiOff size={14} /> Çevrimdışı
              </span>
            )}
            {showDate && (
              <div className="fx-dateNav">
                <button type="button" onClick={() => setDay(shiftDay(day, -1))} aria-label="Önceki gün">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" className="fx-dateLabel" onClick={() => setDay(today())} disabled={isToday}>
                  {formatDay(day)}
                </button>
                <button type="button" onClick={() => setDay(shiftDay(day, 1))} disabled={isToday} aria-label="Sonraki gün">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
            <button
              type="button"
              className="fx-iconBtn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              aria-label="Tema değiştir"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button type="button" className="fx-avatarBtn" onClick={() => setTab('settings')} aria-label="Profil ve ayarlar">
              <span className="fx-avatar">{userName.charAt(0).toUpperCase()}</span>
            </button>
          </div>
        </header>

        <main className="fx-content" key={tab}>
          {children}
        </main>
      </div>

      {/* Mobil alt sekme çubuğu */}
      <nav className="fx-tabbar" aria-label="Ana menü">
        {TABS.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={tab === id ? 2.4 : 1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
