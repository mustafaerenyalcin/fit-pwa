import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Dumbbell,
  Utensils,
  LineChart,
  Bot,
  ChevronLeft,
  ChevronRight,
  WifiOff,
  Settings,
  Globe,
  Sparkles,
  Activity
} from 'lucide-react';
import { today } from '../lib/calculations.js';
import { getTheme, setTheme } from '../lib/notifications.js';
import { useI18n } from '../lib/i18n.js';

export const TABS = [
  ['today', 'nav.today', Activity],
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

  return (
    <div className="fx-spatialShell">
      {/* Sinematik Uzamsal (Spatial) Aurora & Telemetri Arka Planı */}
      <div className="fx-spatialAmbient" aria-hidden="true">
        <div className="fx-auroraOrb fx-auroraOrb--volt" />
        <div className="fx-auroraOrb fx-auroraOrb--cyan" />
        <div className="fx-auroraOrb fx-auroraOrb--violet" />
        <div className="fx-spatialDotMesh" />
      </div>

      {/* Yüzen Komuta Kapsülü (Floating Spatial Command Bar) */}
      <header className="fx-spatialHeaderWrap">
        <div className="fx-spatialHeader">
          <div className="fx-spatialBrandGroup">
            <button type="button" className="fx-spatialLogoBtn" onClick={() => setTab('today')}>
              <span className="fx-logo">
                fit<span>.</span>
              </span>
              <span className="fx-osBadge">
                <span className="fx-osPulse" /> AI OS
              </span>
            </button>
          </div>

          {/* Masaüstü Yüzen Kapsül Navigasyon (Klasik Yan Menü Yerine Uzamsal Dock) */}
          <nav className="fx-spatialTopNav" aria-label="Primary">
            {TABS.map(([id, key, Icon]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`fx-spatialNavPill ${active ? 'active' : ''}`}
                  onClick={() => setTab(id)}
                >
                  <Icon size={16} strokeWidth={active ? 2.4 : 1.9} />
                  <span>{t(key)}</span>
                  {active && <i className="fx-navGlowBar" />}
                </button>
              );
            })}
          </nav>

          {/* Sağ Telemetri & Kontrol Kapsülleri */}
          <div className="fx-spatialControls">
            {!online && (
              <span className="fx-offline" title={t('header.offline')}>
                <WifiOff size={14} />
              </span>
            )}

            {showDate && (
              <div className="fx-dateNav fx-dateNav--spatial">
                <button type="button" onClick={() => setDay(shiftDay(day, -1))} aria-label={t('header.prevDay')}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className="fx-dateLabel" onClick={() => setDay(today())} disabled={isToday}>
                  {formatDay(day)}
                </button>
                <button
                  type="button"
                  onClick={() => setDay(shiftDay(day, 1))}
                  disabled={isToday}
                  aria-label={t('header.nextDay')}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <button
              type="button"
              className="fx-langPill"
              onClick={cycleLang}
              title={t('settings.langTitle')}
              aria-label="Language"
            >
              <Globe size={13} />
              <span>
                {currentLangMeta.flag} {currentLangMeta.short}
              </span>
            </button>

            <button
              type="button"
              className="fx-iconBtn fx-spatialOrbBtn"
              onClick={toggleTheme}
              title={theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}
              aria-label="Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              type="button"
              className={`fx-spatialUserPod ${tab === 'settings' ? 'active' : ''}`}
              onClick={() => setTab('settings')}
              aria-label={t('nav.settings')}
            >
              <span className="fx-avatar">{userName.charAt(0).toUpperCase()}</span>
              <span className="fx-spatialUserName">{userName}</span>
              <Settings size={14} className="fx-mutedIcon" />
            </button>
          </div>
        </div>
      </header>

      {/* Geniş Uzamsal İçerik Sahnesi */}
      <main className="fx-spatialStage" key={tab}>
        {children}
      </main>

      {/* Mobil / Tablet Yüzen Cam Dock (Floating Glass Island Dock) */}
      <div className="fx-floatingDockWrap">
        <nav className="fx-floatingDock" aria-label="Mobile Dock">
          {TABS.map(([id, key, Icon]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                className={`fx-dockItem ${active ? 'active' : ''}`}
                onClick={() => setTab(id)}
                aria-current={active ? 'page' : undefined}
              >
                <div className="fx-dockIconBox">
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.9} />
                </div>
                <span>{t(key)}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
