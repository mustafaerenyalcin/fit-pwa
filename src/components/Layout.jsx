import React from 'react';
import {
  Activity,
  LayoutDashboard,
  Dumbbell,
  Utensils,
  ChartNoAxesCombined,
  Settings2,
  HeartPulse,
  CalendarDays,
  Bot,
  KeyRound,
  ArrowRight,
  Wifi,
  WifiOff
} from 'lucide-react';

const menus = [
  ['dashboard', 'Genel Bakış', LayoutDashboard],
  ['calendar', 'Haftalık Plan', CalendarDays],
  ['training', 'Antrenman', Dumbbell],
  ['nutrition', 'Beslenme', Utensils],
  ['progress', 'Gelişim', ChartNoAxesCombined],
  ['habits', 'Sağlıklı Yaşam', HeartPulse],
  ['profile', 'Profil ve Hedefler', Settings2],
  ['coach', 'Fit AI Koç', Bot],
  ['sync', 'Senkronizasyon', KeyRound]
];

export default function Layout({
  tab,
  setTab,
  day,
  setDay,
  profile,
  online = true,
  installed = false,
  children
}) {
  const userName = profile?.name || profile?.username || 'Sporcu';

  return (
    <div className="appLayout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebarHeader">
          <div className="brandLogo">
            fit<span className="brandDot">.</span>
          </div>
          <div className={`statusIndicator ${online ? 'online' : 'offline'}`} title={online ? 'Çevrimiçi' : 'Çevrimdışı'}>
            {online ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{online ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
          </div>
        </div>

        <nav className="sidebarNav">
          {menus.map(([id, label, Icon]) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                className={`navItem ${isActive ? 'active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={18} className="navIcon" />
                <span className="navLabel">{label}</span>
                {isActive && <span className="navActivePip" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebarFooter">
          <div className="userBadge">
            <div className="userAvatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="userMeta">
              <span className="userName">{userName}</span>
              <span className="userRole">{profile?.level || 'Standart Plan'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="mainWrapper">
        {/* Top Header */}
        <header className="appHeader">
          <div className="mobileBrand">
            <span className="brandLogo">
              fit<span className="brandDot">.</span>
            </span>
          </div>

          <div className="headerControls">
            {setDay && (
              <div className="datePickerWrapper">
                <CalendarDays size={16} className="dateIcon" />
                <input
                  type="date"
                  className="dateInput"
                  value={day || ''}
                  onChange={(e) => setDay(e.target.value)}
                  aria-label="Tarih seçin"
                />
              </div>
            )}

            <div className={`mobileStatus ${online ? 'online' : 'offline'}`}>
              {online ? <Wifi size={16} /> : <WifiOff size={16} />}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="contentArea">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobileBottomNav">
        <div className="mobileNavScroll">
          {menus.map(([id, label, Icon]) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                className={`mobileNavItem ${isActive ? 'active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={20} className="mobileNavIcon" />
                <span className="mobileNavLabel">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
