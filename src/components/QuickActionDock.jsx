import React, { useState, useEffect } from 'react';
import {
  Zap,
  Droplets,
  Dumbbell,
  Sparkles,
  Utensils,
  X,
  Plus
} from 'lucide-react';
import { sounds } from '../lib/audio.js';
import { celebration } from '../lib/celebration.js';

export default function QuickActionDock({
  onQuickWaterAdd,
  onStartWorkout,
  onOpenCheckin,
  onOpenBarcode,
  todayPlan
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleOpen = () => {
    sounds.pop();
    setIsOpen((prev) => !prev);
  };

  const handleWater = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    celebration.waterSplash({ x, y });
    celebration.floatingBadge({
      text: '+250 ml Su',
      x,
      y: y - 20,
      icon: '💧',
      color: '#00f0ff'
    });

    if (onQuickWaterAdd) onQuickWaterAdd(250);
    setIsOpen(false);
  };

  const handleWorkout = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    celebration.sparks({
      x: rect.left + rect.width / 2,
      y: rect.top,
      color: '#c8ff00'
    });
    sounds.bellDing();
    if (onStartWorkout) onStartWorkout(todayPlan);
    setIsOpen(false);
  };

  const handleCheckin = () => {
    sounds.tap();
    if (onOpenCheckin) onOpenCheckin();
    setIsOpen(false);
  };

  const handleMeal = () => {
    sounds.tap();
    if (onOpenBarcode) onOpenBarcode();
    setIsOpen(false);
  };

  return (
    <>
      {/* Hafif Karartma Arka Planı (Dokunulduğunda Kapanır) */}
      {isOpen && (
        <div
          className="fx-quickActionBackdrop"
          onClick={() => {
            sounds.pop();
            setIsOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* Yüzen Hızlı Aksiyon Kapsülü */}
      <div className={`fx-quickActionContainer ${isOpen ? 'open' : ''}`}>
        {/* Açılır Menü Öğeleri (Staggered Spring Animasyonlu) */}
        {isOpen && (
          <div className="fx-quickSpeedDial" role="menu">
            {/* 1. Su Ekle */}
            <button
              type="button"
              className="fx-quickDialItem fx-quickDialItem--water"
              onClick={handleWater}
              role="menuitem"
            >
              <div className="fx-quickDialIcon">
                <Droplets size={18} />
              </div>
              <div className="fx-quickDialText">
                <strong>+250 ml Su Ekle</strong>
                <small>Tek Tıkla Hidrasyon</small>
              </div>
            </button>

            {/* 2. Antrenman Başlat */}
            <button
              type="button"
              className="fx-quickDialItem fx-quickDialItem--workout"
              onClick={handleWorkout}
              role="menuitem"
            >
              <div className="fx-quickDialIcon">
                <Dumbbell size={18} />
              </div>
              <div className="fx-quickDialText">
                <strong>{todayPlan?.name ? `Başlat: ${todayPlan.name}` : 'Antrenmana Başla'}</strong>
                <small>Canlı Seans &amp; Tempo Metronomu</small>
              </div>
            </button>

            {/* 3. 20 Sn Check-in */}
            <button
              type="button"
              className="fx-quickDialItem fx-quickDialItem--checkin"
              onClick={handleCheckin}
              role="menuitem"
            >
              <div className="fx-quickDialIcon">
                <Sparkles size={18} />
              </div>
              <div className="fx-quickDialText">
                <strong>20 Sn Sabah Check-in</strong>
                <small>Biyometrik Hazırbulunuşluk</small>
              </div>
            </button>

            {/* 4. Hızlı Öğün / Barkod */}
            <button
              type="button"
              className="fx-quickDialItem fx-quickDialItem--meal"
              onClick={handleMeal}
              role="menuitem"
            >
              <div className="fx-quickDialIcon">
                <Utensils size={18} />
              </div>
              <div className="fx-quickDialText">
                <strong>Hızlı Öğün / Barkod Tara</strong>
                <small>Fotoğrafla veya Barkodla Kaydet</small>
              </div>
            </button>
          </div>
        )}

        {/* Ana Yüzen Tetikleyici FAB Butonu */}
        <button
          type="button"
          className={`fx-quickMainFab ${isOpen ? 'active' : ''}`}
          onClick={toggleOpen}
          aria-label={isOpen ? 'Hızlı Eylemleri Kapat' : 'Hızlı Eylem Çekmecesini Aç'}
          aria-expanded={isOpen}
          title="Hızlı Eylem & Kayıt"
        >
          <div className="fx-fabGlowHalo" />
          <div className="fx-fabIconWrap">
            {isOpen ? <X size={22} /> : <Zap size={22} />}
          </div>
          <span className="fx-fabLabel">HIZLI EYLEM</span>
        </button>
      </div>
    </>
  );
}
