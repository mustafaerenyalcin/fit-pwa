import React, { useState } from 'react';
import { Sun, Moon, Dumbbell, Utensils, LineChart, Bot, ChevronLeft, ChevronRight, WifiOff, Settings, Globe } from 'lucide-react';
import { today } from '../lib/calculations.js';
import { getTheme, setTheme } from '../lib/notifications.js';
import { useI18n } from '../lib/i18n.js';

export const TABS = [
  ['today', 'nav.today', Sun],
  ['training', 'nav.training', Dumbbell],
  ['nutrition', 'nav.nutrition', Utensils],
  ['progress', 'nav.progress', LineChart],
  ['coach', 'nav.coach', Bot]
];

const shiftDay = (iso, delta) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Layout({ tab, setTab, day, setDay, profile, online = true, children }) {
  const { lang, setLang, t, locale, languages } = useI18n();
  const userName = profile?.name || t('today.champ');
  const showDate = ['today', 'training', 'nutrition'].includes(tab);
  const isToday = day === today();
  const [theme, setThemeState] = useState(getTheme);

  const toggleTheme = () => {
    const next = setTheme(theme === 'dark' ? 'light' : 'dark');
    setThemeState(next);
  };

  const formatDay = (iso) => {
    const tDay = today();
    if (iso === tDay) return t('header.today');
    return new Date(iso + 'T12:00:00').toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      weekday: 'short'
    });
  };

  const cycleLang = () => {
    const idx = languages.findIndex((l) => l.code === lang);
    const next = languages[(idx + 1) % languages.length];
    setLang(next.code);
  };

  const currentLangMeta = languages.find((l) => l.code === lang) || languages[0];

  const TITLES = {
    today: t('nav.today'),
    training: t('nav.training'),
    nutrition: t('nav.nutrition'),
    progress: t('nav.progress'),
    coach: t('nav.coach'),
    settings: t('nav.settings')
  };

  return (
    <div className="fx-app">
      {/* Masaüstü yan menü */}
      <aside className="fx-sidebar">
        <div className="fx-logo">
          fit<span>.</span>
        </div>
        <nav>
          {TABS.map(([id, key, Icon]) => (
            <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              <Icon size={19} />
              <span>{t(key)}</span>
            </button>
          ))}
        </nav>
        <button type="button" className={`fx-sideUser ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          <span className="fx-avatar">{userName.charAt(0).toUpperCase()}</span>
          <span className="fx-sideUserMeta">
            <b>{userName}</b>
            <small>{t('nav.settings')}</small>
          </span>
          <Settings size={16} />
        </button>
      </aside>

      <div className="fx-main">
        <header className="fx-header">
          <h1>{TITLES[tab] || ''}</h1>
          <div className="fx-headerRight">
            {!online && (
              <span className="fx-offline" title={t('header.offline')}>
                <WifiOff size={14} />
              </span>
            )}
            {showDate && (
              <div className="fx-dateNav">
                <button type="button" onClick={() => setDay(shiftDay(day, -1))} aria-label={t('header.prevDay')}>
                  <ChevronLeft size={18} />
                </button>
                <button type="button" className="fx-dateLabel" onClick={() => setDay(today())} disabled={isToday}>
                  {formatDay(day)}
                </button>
                <button type="button" onClick={() => setDay(shiftDay(day, 1))} disabled={isToday} aria-label={t('header.nextDay')}>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Global 1-Click Language Switcher Pill */}
            <button
              type="button"
              className="fx-langPill"
              onClick={cycleLang}
              title={t('settings.langTitle')}
              aria-label="Language"
            >
              <Globe size={14} />
              <span>{currentLangMeta.flag} {currentLangMeta.short}</span>
            </button>

            <button
              type="button"
              className="fx-iconBtn"
              onClick={toggleTheme}
              title={theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}
              aria-label="Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button type="button" className="fx-avatarBtn" onClick={() => setTab('settings')} aria-label={t('nav.settings')}>
              <span className="fx-avatar">{userName.charAt(0).toUpperCase()}</span>
            </button>
          </div>
        </header>

        <main className="fx-content" key={tab}>
          {children}
        </main>
      </div>

      {/* Mobil alt sekme çubuğu */}
      <nav className="fx-tabbar" aria-label="Main Navigation">
        {TABS.map(([id, key, Icon]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={tab === id ? 2.4 : 1.8} />
            <span>{t(key)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
