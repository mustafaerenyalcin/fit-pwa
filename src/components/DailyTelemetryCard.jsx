import React from 'react';
import {
  Droplets,
  Flame,
  Utensils,
  Plus,
  Scan,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Ring } from './ui.jsx';
import { sounds } from '../lib/audio.js';
import { celebration } from '../lib/celebration.js';
import { useI18n } from '../lib/i18n.js';

export default function DailyTelemetryCard({
  totals = { calories: 0, protein: 0 },
  targetCalories = 2200,
  targetProtein = 140,
  water = 0,
  targetWater = 2500,
  onQuickWaterAdd,
  onQuickMealAdd,
  onOpenBarcode,
  onNavigate
}) {
  const { t } = useI18n();
  const remCalories = Math.max(0, targetCalories - totals.calories);
  const remProtein = Math.max(0, targetProtein - totals.protein);
  const remWater = Math.max(0, (targetWater - water) / 1000);

  const calPct = Math.min(100, Math.round((totals.calories / targetCalories) * 100) || 0);
  const proPct = Math.min(100, Math.round((totals.protein / targetProtein) * 100) || 0);
  const waterPct = Math.min(100, Math.round((water / targetWater) * 100) || 0);

  const handleAddWater = (amount, event = null) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top;
    }
    celebration.waterSplash({ x, y });
    celebration.floatingBadge({
      text: `+${amount} ml`,
      x,
      y: y - 20,
      icon: '💧',
      color: '#00f0ff'
    });
    if (onQuickWaterAdd) onQuickWaterAdd(amount);
  };

  const handleAddWhey = (event = null) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top;
    }
    celebration.sparks({ x, y, color: '#00f0ff' });
    celebration.floatingBadge({
      text: '+26g Whey Protein',
      x,
      y: y - 20,
      icon: '⚡',
      color: '#00f0ff'
    });
    sounds.xpGain();
    if (onQuickMealAdd) {
      onQuickMealAdd({
        name: '1 Scoop Whey Protein Shake',
        calories: 130,
        protein: 26,
        carbs: 3,
        fat: 2
      });
    }
  };

  return (
    <section className="fx-zenGoalsCard">
      {/* BAŞLIK & BESLENME SAYFASI KÖPRÜSÜ */}
      <div className="fx-zenGoalsTopRow">
        <div className="fx-zenGoalsBadge">
          <Utensils size={13} color="#00f0ff" />
          <span>{t('telemetry.badge')}</span>
        </div>
        <button
          type="button"
          className="fx-zenLinkMini"
          onClick={() => {
            sounds.tap();
            onNavigate('nutrition');
          }}
        >
          {t('telemetry.journalLink')} <ChevronRight size={13} />
        </button>
      </div>

      {/* 3 DAİRESEL GÖSTERGE (APPLE HEALTH / WHOOP STANDARDI) */}
      <div className="fx-zenRingsGrid">
        {/* 1. KALORİ */}
        <button
          type="button"
          className="fx-zenRingPod"
          onClick={() => {
            sounds.tap();
            onNavigate('nutrition');
          }}
        >
          <Ring value={totals.calories} max={targetCalories} size={74} stroke={7} color="#ff4d1c">
            <span className="fx-ringPct">{calPct}%</span>
          </Ring>
          <div className="fx-zenRingMeta">
            <small className="fx-zenRingCat">{t('telemetry.energy')}</small>
            <div className="fx-zenRingValuesRow">
              <strong className="fx-monoBig" style={{ color: '#ff4d1c' }}>
                {totals.calories}
              </strong>
              <span className="fx-zenTargetSpan">/ {targetCalories} kcal</span>
            </div>
            <span className="fx-zenRemTag">{t('telemetry.remaining')}: {remCalories} kcal</span>
          </div>
        </button>

        {/* 2. PROTEİN */}
        <button
          type="button"
          className="fx-zenRingPod"
          onClick={() => {
            sounds.tap();
            onNavigate('nutrition');
          }}
        >
          <Ring value={totals.protein} max={targetProtein} size={74} stroke={7} color="#00f0ff">
            <span className="fx-ringPct">{proPct}%</span>
          </Ring>
          <div className="fx-zenRingMeta">
            <small className="fx-zenRingCat">{t('telemetry.protein')}</small>
            <div className="fx-zenRingValuesRow">
              <strong className="fx-monoBig" style={{ color: '#00f0ff' }}>
                {totals.protein}g
              </strong>
              <span className="fx-zenTargetSpan">/ {targetProtein}g</span>
            </div>
            <span className="fx-zenRemTag">{t('telemetry.remaining')}: {remProtein}g</span>
          </div>
        </button>

        {/* 3. SU / HİDRASYON */}
        <button
          type="button"
          className="fx-zenRingPod"
          onClick={(e) => handleAddWater(250, e)}
        >
          <Ring value={water} max={targetWater} size={74} stroke={7} color="#38bdf8">
            <span className="fx-ringPct">{waterPct}%</span>
          </Ring>
          <div className="fx-zenRingMeta">
            <small className="fx-zenRingCat">{t('telemetry.hydration')}</small>
            <div className="fx-zenRingValuesRow">
              <strong className="fx-monoBig" style={{ color: '#38bdf8' }}>
                {(water / 1000).toFixed(water % 1000 ? 2 : 1)}L
              </strong>
              <span className="fx-zenTargetSpan">/ {(targetWater / 1000).toFixed(1)}L</span>
            </div>
            <span className="fx-zenRemTag">
              {remWater > 0 ? `${t('telemetry.remaining')}: ${remWater.toFixed(1)}L` : t('telemetry.goalReached')}
            </span>
          </div>
        </button>
      </div>

      {/* TEK DOKUNUŞ HIZLI YAKIT ÇUBUĞU */}
      <div className="fx-zenFuelActionStrip">
        <button
          type="button"
          className="fx-zenFuelPill fx-zenFuelPill--water"
          onClick={(e) => handleAddWater(250, e)}
        >
          <Droplets size={13} /> {t('telemetry.water250')}
        </button>
        <button
          type="button"
          className="fx-zenFuelPill fx-zenFuelPill--water"
          onClick={(e) => handleAddWater(500, e)}
        >
          <Droplets size={13} /> {t('telemetry.water500')}
        </button>
        <button
          type="button"
          className="fx-zenFuelPill fx-zenFuelPill--whey"
          onClick={(e) => handleAddWhey(e)}
        >
          <Zap size={13} /> {t('telemetry.whey26')}
        </button>
        <button
          type="button"
          className="fx-zenFuelPill fx-zenFuelPill--barcode"
          onClick={() => {
            sounds.tap();
            onOpenBarcode();
          }}
        >
          <Scan size={13} /> {t('telemetry.scanBarcode')}
        </button>
        <button
          type="button"
          className="fx-zenFuelPill fx-zenFuelPill--meal"
          onClick={() => {
            sounds.tap();
            onNavigate('nutrition');
          }}
        >
          <Plus size={13} /> {t('telemetry.logMeal')}
        </button>
      </div>
    </section>
  );
}
