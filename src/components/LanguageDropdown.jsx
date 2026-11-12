import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n } from '../lib/i18n.js';
import { sounds } from '../lib/audio.js';

export default function LanguageDropdown() {
  const { lang, setLang, t, languages } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectLanguage = (code) => {
    sounds.tap();
    setLang(code);
    setOpen(false);
  };

  return (
    <div className="fx-langDropdownWrap" ref={containerRef}>
      <button
        type="button"
        className={`fx-langPill fx-langPill--interactive ${open ? 'active' : ''}`}
        onClick={() => {
          sounds.tap();
          setOpen((v) => !v);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t('settings.langTitle') || 'Dil Seçimi'}
      >
        <Globe size={13} />
        <span className="fx-langCode">{currentLang.short}</span>
        <ChevronDown size={11} className={`fx-langChevron ${open ? 'rotate' : ''}`} />
      </button>

      {open && (
        <div className="fx-langMenu" role="listbox">
          <div className="fx-langMenuHead">
            <span>DİL / LANGUAGE</span>
          </div>
          <div className="fx-langMenuList">
            {languages.map((item) => {
              const active = item.code === lang;
              return (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`fx-langMenuItem ${active ? 'active' : ''}`}
                  onClick={() => selectLanguage(item.code)}
                >
                  <span className="fx-langBadgeTag">{item.short}</span>
                  <div className="fx-langMenuText">
                    <span className="fx-langMenuName">{item.name}</span>
                    <small className="fx-langMenuSub">{item.speechLang}</small>
                  </div>
                  {active && <Check size={14} className="fx-langCheck" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
