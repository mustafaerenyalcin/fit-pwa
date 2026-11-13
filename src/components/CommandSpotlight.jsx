import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Home,
  Dumbbell,
  Utensils,
  Wrench,
  TrendingUp,
  Bot,
  Settings,
  Droplets,
  Play,
  Scan,
  Crown,
  X,
  ArrowRight
} from 'lucide-react';
import { useI18n } from '../lib/i18n.js';
import { sounds } from '../lib/audio.js';

export default function CommandSpotlight({
  onNavigate,
  onQuickWater,
  onStartWorkout,
  onOpenBarcode,
  onOpenSubscription
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sounds.tap();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    const onCustomOpen = () => {
      sounds.tap();
      setOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('fit-open-spotlight', onCustomOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('fit-open-spotlight', onCustomOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const items = useMemo(() => {
    const navItems = [
      { id: 'nav-today', cat: t('cmd.catNav'), label: `01 ${t('nav.today')}`, icon: Home, run: () => onNavigate('today') },
      { id: 'nav-training', cat: t('cmd.catNav'), label: `02 ${t('nav.training')}`, icon: Dumbbell, run: () => onNavigate('training') },
      { id: 'nav-nutrition', cat: t('cmd.catNav'), label: `03 ${t('nav.nutrition')}`, icon: Utensils, run: () => onNavigate('nutrition') },
      { id: 'nav-tools', cat: t('cmd.catNav'), label: `04 ${t('nav.tools')}`, icon: Wrench, run: () => onNavigate('tools') },
      { id: 'nav-progress', cat: t('cmd.catNav'), label: `05 ${t('nav.progress')}`, icon: TrendingUp, run: () => onNavigate('progress') },
      { id: 'nav-coach', cat: t('cmd.catNav'), label: `06 ${t('nav.coach')}`, icon: Bot, run: () => onNavigate('coach') },
      { id: 'nav-settings', cat: t('cmd.catNav'), label: t('nav.settings'), icon: Settings, run: () => onNavigate('settings') }
    ];

    const toolIds = [
      ['fasting', '⏳', 'tools.t_fasting_title'],
      ['buddy', '👥', 'tools.t_buddy_title'],
      ['1rm', '⚡', 'tools.t_1rm_title'],
      ['tabata', '⏱️', 'tools.t_tabata_title'],
      ['hydration', '💧', 'tools.t_hydration_title'],
      ['adonis', '🏛️', 'tools.t_adonis_title'],
      ['metabolic', '🔥', 'tools.t_metabolic_title'],
      ['recovery', '🧬', 'tools.t_recovery_title'],
      ['body', '📐', 'tools.t_body_title'],
      ['form_check', '🦾', 'tools.t_form_title'],
      ['genetic', '🧬', 'tools.t_genetic_title']
    ];

    const toolItems = toolIds.map(([id, emoji, key]) => ({
      id: `tool-${id}`,
      cat: t('cmd.catTools'),
      label: `${emoji} ${t(key)}`,
      icon: Wrench,
      run: () => onNavigate('tools', id)
    }));

    const actionItems = [
      { id: 'act-water', cat: t('cmd.catActions'), label: t('cmd.actWater'), icon: Droplets, run: () => onQuickWater?.(250) },
      { id: 'act-workout', cat: t('cmd.catActions'), label: t('cmd.actWorkout'), icon: Play, run: () => onStartWorkout?.() },
      { id: 'act-barcode', cat: t('cmd.catActions'), label: t('cmd.actBarcode'), icon: Scan, run: () => onOpenBarcode?.() },
      { id: 'act-pro', cat: t('cmd.catActions'), label: t('cmd.actPro'), icon: Crown, run: () => onOpenSubscription?.() }
    ];

    return [...actionItems, ...navItems, ...toolItems];
  }, [t, onNavigate, onQuickWater, onStartWorkout, onOpenBarcode, onOpenSubscription]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 11);
    return items.filter(
      (it) => it.label.toLowerCase().includes(q) || it.cat.toLowerCase().includes(q)
    );
  }, [items, query]);

  const executeItem = (item) => {
    if (!item) return;
    sounds.tap();
    setOpen(false);
    item.run();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter' && filtered[activeIdx]) {
      e.preventDefault();
      executeItem(filtered[activeIdx]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fx-modalBackdrop"
      onClick={() => setOpen(false)}
      style={{ zIndex: 10050, alignItems: 'flex-start', paddingTop: '10vh' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Spotlight"
        className="animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%',
          maxWidth: 540,
          background: 'linear-gradient(165deg, #151926 0%, #0b0d14 100%)',
          border: '1px solid rgba(0, 240, 255, 0.28)',
          borderRadius: 20,
          boxShadow: '0 28px 80px rgba(0, 0, 0, 0.78)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <Search size={18} color="#00f0ff" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={t('cmd.placeholder')}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: 15,
              fontWeight: 500
            }}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: 8,
              color: '#94a3b8',
              padding: 6,
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              {t('cmd.noResults')}
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === activeIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => executeItem(item)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                    color: isSelected ? '#fff' : '#cbd5e1',
                    transition: 'background 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={15} color={isSelected ? '#00f0ff' : '#64748b'} />
                    <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500 }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>
                      {item.cat}
                    </span>
                    {isSelected && <ArrowRight size={13} color="#00f0ff" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div
          style={{
            padding: '8px 14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#64748b'
          }}
        >
          <span>FIT. ATELIER SPOTLIGHT</span>
          <span>{t('cmd.hint')}</span>
        </div>
      </div>
    </div>
  );
}
