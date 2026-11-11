import React from 'react';

/**
 * Fit UI kiti: tüm yeni ekranlarda kullanılan küçük, tutarlı yapı taşları.
 */

/** iOS tarzı bölümlü seçici */
export function Segmented({ value, onChange, options, className = '' }) {
  return (
    <div className={`fx-segmented ${className}`} role="tablist">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          className={value === id ? 'active' : ''}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Seçilebilir kart/çip */
export function Choice({ active, onClick, icon, title, desc, compact = false }) {
  return (
    <button
      type="button"
      className={`fx-choice ${active ? 'active' : ''} ${compact ? 'compact' : ''}`}
      onClick={onClick}
      aria-pressed={!!active}
    >
      {icon && <span className="fx-choiceIcon">{icon}</span>}
      <span className="fx-choiceText">
        <b>{title}</b>
        {desc && <small>{desc}</small>}
      </span>
    </button>
  );
}

/** Başlıklı kart */
export function Card({ title, subtitle, action, children, className = '', tone }) {
  return (
    <section className={`fx-card ${tone ? `fx-card--${tone}` : ''} ${className}`}>
      {(title || action) && (
        <header className="fx-cardHead">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Dairesel ilerleme göstergesi */
export function Ring({ value = 0, max = 100, size = 64, stroke = 7, color = 'var(--fx-accent)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <div className="fx-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--fx-track)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - pct * c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="fx-ringLabel">{children}</div>
    </div>
  );
}

/** Yükleniyor iskeleti */
export function Skeleton({ lines = 3 }) {
  return (
    <div className="fx-skeleton" aria-busy="true" aria-label="Yükleniyor">
      {Array.from({ length: lines }).map((_, i) => (
        <span key={i} style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  );
}

/** Basit metin biçimlendirme: **kalın**, # başlık, - madde */
export function RichText({ text = '' }) {
  const lines = String(text).split('\n');
  return (
    <div className="fx-rich">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="fx-richGap" />;
        const html = t
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        if (/^#{1,4}\s/.test(t)) {
          return <h4 key={i} dangerouslySetInnerHTML={{ __html: html.replace(/^#{1,4}\s/, '') }} />;
        }
        if (/^[-*•]\s/.test(t)) {
          return <p key={i} className="fx-richLi" dangerouslySetInnerHTML={{ __html: html.replace(/^[-*•]\s/, '') }} />;
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}
