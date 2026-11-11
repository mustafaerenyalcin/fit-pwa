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
  Activity
} from 'lucide-react';
import { today } from '../lib/calculations.js';
import { getTheme, setTheme } from '../lib/notifications.js';
import { useI18n } from '../lib/i18n.js';

export const TABS = [
  ['today', 'nav.today', Activity, '01'],
  ['training', 'nav.training', Dumbbell, '02'],
  ['nutrition', 'nav.nutrition', Utensils, '03'],
  ['progress', 'nav.progress', LineChart, '04'],
  ['coach', 'nav.coach', Bot, '05']
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
    <div className="fx-spatialShell fx-atelierShell">
      {/* Sıfır Izgara / Sıfır Klişe: Sadece Organik Analog Film Dokusu ve Sıcak Işık Hüzmesi */}
      <div className="fx-atelierBackdrop" aria-hidden="true">
        <div className="fx-atelierBeam" />
        <span className="fx-atelierWatermark">ATHLETE</span>
      </div>

      {/* Mimari Üst Komuta Barı (Editorial Titanium Header) */}
      <header className="fx-spatialHeaderWrap">
        <div className="fx-spatialHeader fx-atelierHeader">
          <div className="fx-spatialBrandGroup">
            <button type="button" className="fx-spatialLogoBtn" onClick={() => setTab('today')}>
              <span className="fx-logo fx-atelierLogo">
                FIT<span>.</span>
              </span>
              <span className="fx-atelierStamp">ATELIER // 26</span>
            </button>
          </div>

          {/* Masaüstü Numaralı Editoryal Sekmeler */}
          <nav className="fx-spatialTopNav fx-atelierNav" aria-label="Primary">
            {TABS.map(([id, key, , num]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`fx-spatialNavPill fx-atelierNavBtn ${active ? 'active' : ''}`}
                  onClick={() => setTab(id)}
                >
                  <small className="fx-navIndex">{num}</small>
                  <span>{t(key)}</span>
                </button>
              );
            })}
          </nav>

          {/* Sağ Kontroller */}
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

      {/* Geniş Editoryal İçerik Sahnesi */}
      <main className="fx-spatialStage" key={tab}>
        {children}
      </main>

      {/* Mobil / Tablet Yüzen Titanyum Dock */}
      <div className="fx-floatingDockWrap">
        <nav className="fx-floatingDock" aria-label="Mobile Dock">
          {TABS.map(([id, key, Icon, num]) => {
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
                  <Icon size={19} strokeWidth={active ? 2.5 : 1.9} />
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
