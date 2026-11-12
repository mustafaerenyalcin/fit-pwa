import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  Calculator,
  Zap,
  Droplets,
  Award,
  Flame,
  HeartPulse,
  Scale,
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import FastingTimer from '../components/FastingTimer.jsx';
import GymBuddyStudio from '../components/GymBuddyStudio.jsx';
import OneRepMaxCalc from '../components/OneRepMaxCalc.jsx';
import TabataIntervalTimer from '../components/TabataIntervalTimer.jsx';
import HydrationSmartLab from '../components/HydrationSmartLab.jsx';
import AdonisRatioCalc from '../components/AdonisRatioCalc.jsx';
import MetabolicEngineCalc from '../components/MetabolicEngineCalc.jsx';
import RecoveryStudio from '../components/RecoveryStudio.jsx';
import StrengthOverloadCard from '../components/StrengthOverloadCard.jsx';
import BodyCompositionPro from '../components/BodyCompositionPro.jsx';
import BeforeAfterSlider from '../components/BeforeAfterSlider.jsx';
import AiFormCheckStudio from '../components/AiFormCheckStudio.jsx';
import GeneticPotentialCalc from '../components/GeneticPotentialCalc.jsx';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';

const TOOLS_CONFIG = [
  {
    id: 'fasting',
    title: 'Aralıklı Oruç & Otofaji',
    subtitle: '16:8, 18:6 protokolleri ve anlık metabolik yağ yakım evreleri',
    symbol: '⏳',
    category: 'nutrition',
    badge: '16:8 Fazı',
    color: '#00f0ff',
    image: '/images/tools/fasting-v2.jpg',
    bg: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 240, 255, 0.02))'
  },
  {
    id: 'buddy',
    title: 'Gym Buddy Partner',
    subtitle: 'Ortak seri, canlı durum, dürtme ve motivasyon telemetrisi',
    symbol: '👥',
    category: 'training',
    badge: 'Ortak Seri',
    color: '#ff4d1c',
    image: '/images/tools/buddy.jpg',
    bg: 'linear-gradient(135deg, rgba(255, 77, 28, 0.18), rgba(255, 77, 28, 0.02))'
  },
  {
    id: '1rm',
    title: '1RM & Barbell Plaka',
    subtitle: 'Tahmini tek tekrar maksimumu ve bara takılacak renkli plakalar',
    symbol: '⚡',
    category: 'training',
    badge: 'Olimpik Bar',
    color: '#f5c451',
    image: '/images/tools/1rm.jpg',
    bg: 'linear-gradient(135deg, rgba(245, 196, 81, 0.16), rgba(245, 196, 81, 0.02))'
  },
  {
    id: 'tabata',
    title: 'HIIT & Tabata Sayacı',
    subtitle: 'Sesli geri sayımlı yüksek yoğunluklu interval kondisyon sayacı',
    symbol: '⏱️',
    category: 'training',
    badge: '8 Tur · 4 Dk',
    color: '#c8ff00',
    image: '/images/tools/tabata.jpg',
    bg: 'linear-gradient(135deg, rgba(200, 255, 0, 0.16), rgba(200, 255, 0, 0.02))'
  },
  {
    id: 'hydration',
    title: 'Akıllı Hidrasyon & Su',
    subtitle: 'Kilo ve terleme faktörüne göre su hedefi ve elektrolit dengesi',
    symbol: '💧',
    category: 'nutrition',
    badge: 'Canlı Dalga',
    color: '#00b4d8',
    image: '/images/tools/hydration.jpg',
    bg: 'linear-gradient(135deg, rgba(0, 180, 216, 0.16), rgba(0, 180, 216, 0.02))'
  },
  {
    id: 'adonis',
    title: 'Adonis 1.618 Altın Oran',
    subtitle: 'Omuz ve bel çevresiyle Antik Yunan heykeli V-Taper form skoru',
    symbol: '🏛️',
    category: 'biometrics',
    badge: 'Altın Oran',
    color: '#eab308',
    image: '/images/tools/adonis-v2.jpg',
    bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.16), rgba(234, 179, 8, 0.02))'
  },
  {
    id: 'metabolic',
    title: 'Metabolik Motor & TDEE',
    subtitle: 'Mifflin-St Jeor standardıyla BMR, TDEE ve hedef makro hesaplayıcı',
    symbol: '🔥',
    category: 'nutrition',
    badge: 'BMR & TDEE',
    color: '#ff4d1c',
    image: '/images/tools/metabolic-v2.jpg',
    bg: 'linear-gradient(135deg, rgba(255, 77, 28, 0.16), rgba(255, 77, 28, 0.02))'
  },
  {
    id: 'recovery',
    title: 'İyileşme & HRV Stüdyosu',
    subtitle: 'Toparlanma puanı, kas yorgunluğu ve progresif yüklenme takibi',
    symbol: '🧬',
    category: 'biometrics',
    badge: 'HRV Telemetri',
    color: '#a855f7',
    image: '/images/tools/recovery.jpg',
    bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.16), rgba(168, 85, 247, 0.02))'
  },
  {
    id: 'body',
    title: 'Vücut Formu & Değişim',
    subtitle: 'Vücut kompozisyonu, yağ oranı ve Before/After fotoğraf kaydırıcı',
    symbol: '📐',
    category: 'biometrics',
    badge: 'Before / After',
    color: '#94a3b8',
    image: '/images/tools/body.jpg',
    bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.16), rgba(148, 163, 184, 0.02))'
  },
  {
    id: 'form_check',
    title: 'AI Form & Biyomekanik',
    subtitle: 'Kamera ve yapay zeka ile Squat, Deadlift eklem açısı ve sakatlık analizi',
    symbol: '🦾',
    category: 'training',
    badge: 'AI Biyomekanik',
    color: '#00f0ff',
    image: '/images/tools/form_check.jpg',
    bg: 'linear-gradient(135deg, rgba(0, 240, 255, 0.16), rgba(0, 240, 255, 0.02))'
  },
  {
    id: 'genetic',
    title: 'Genetik Potansiyel & Doğal Tavan',
    subtitle: 'Casey Butt kemik formülüyle doğal steroidsiz maksimum kas kütlesi ve kol sınırı',
    symbol: '🧬',
    category: 'biometrics',
    badge: 'Casey Butt Sınırı',
    color: '#00f0ff',
    image: '/images/tools/genetic.jpg',
    bg: 'linear-gradient(135deg, rgba(0, 240, 255, 0.16), rgba(0, 240, 255, 0.02))'
  }
];

export default function ToolsView({
  profile,
  entries,
  target,
  initialToolId = null,
  onClearInitialTool,
  onStartWorkout
}) {
  const { t } = useI18n();
  const [selectedToolId, setSelectedToolId] = useState(initialToolId);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (initialToolId) {
      setSelectedToolId(initialToolId);
      if (onClearInitialTool) onClearInitialTool();
    }
  }, [initialToolId]);

  const localizedTools = TOOLS_CONFIG.map((tool) => {
    const key = tool.id === 'form_check' ? 'form' : tool.id;
    return {
      ...tool,
      title: t(`tools.t_${key}_title`),
      subtitle: t(`tools.t_${key}_sub`)
    };
  });

  const filteredTools = localizedTools.filter((tool) => {
    if (categoryFilter === 'all') return true;
    return tool.category === categoryFilter;
  });

  const activeTool = localizedTools.find((tool) => tool.id === selectedToolId);

  const openTool = (id) => {
    sounds.tap();
    setSelectedToolId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeTool = () => {
    sounds.tap();
    setSelectedToolId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fx-stack fx-toolsStudioRoot">
      {/* 1. EKRAN: EĞER BİR ARAÇ SEÇİLİ DEĞİLSE TÜM KARE BENTO IZGARASINI GÖSTER (LAUNCHPAD) */}
      {!selectedToolId ? (
        <div className="fx-stack animate-fade-in">
          {/* ÜST EDİTORYAL BAŞLIK */}
          <section className="fx-cockpitHeroBar fx-atelierHeroBar">
            <div className="fx-cockpitGreetCol">
              <div className="fx-atelierEyebrow">
                <span>[LABORATORY // 04]</span> · {t('tools.eyebrow')}
              </div>
              <h2 className="fx-cockpitGreeting fx-atelierDisplay">
                {t('tools.title1')} <span>{t('tools.title2')}</span>
              </h2>
              <p className="fx-cockpitSub">
                {t('tools.sub')}
              </p>
            </div>
          </section>

          {/* KATEGORİ FİLTRE BUTONLARI */}
          <div className="fx-categoryFilterRow">
            <button
              type="button"
              className={`fx-categoryPill ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                sounds.tap();
                setCategoryFilter('all');
              }}
            >
              <span>{t('tools.filterAll')} ({TOOLS_CONFIG.length})</span>
            </button>
            <button
              type="button"
              className={`fx-categoryPill ${categoryFilter === 'training' ? 'active' : ''}`}
              onClick={() => {
                sounds.tap();
                setCategoryFilter('training');
              }}
            >
              <span>⚡ {t('tools.filterTraining')}</span>
            </button>
            <button
              type="button"
              className={`fx-categoryPill ${categoryFilter === 'nutrition' ? 'active' : ''}`}
              onClick={() => {
                sounds.tap();
                setCategoryFilter('nutrition');
              }}
            >
              <span>⏳ {t('tools.filterNutrition')}</span>
            </button>
            <button
              type="button"
              className={`fx-categoryPill ${categoryFilter === 'biometrics' ? 'active' : ''}`}
              onClick={() => {
                sounds.tap();
                setCategoryFilter('biometrics');
              }}
            >
              <span>🏛️ {t('tools.filterBiometrics')}</span>
            </button>
          </div>

          {/* KARE BENTO IZGARA (SQUARE BENTO TILES GRID) */}
          <div className="fx-toolsBentoGrid">
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className="fx-squareToolCard"
                onClick={() => openTool(tool.id)}
                style={{
                  '--card-accent': tool.color,
                  '--card-bg': tool.bg,
                  '--card-image': `url('${tool.image}')`
                }}
              >
                <div className="fx-squareToolTop">
                  <div className="fx-squareToolSymbolBox">
                    <span className="fx-toolSymbol">{tool.symbol}</span>
                  </div>
                  <span className="fx-toolMicroBadge">{tool.badge}</span>
                </div>

                <div className="fx-squareToolBody">
                  <h3 className="fx-squareToolTitle">{tool.title}</h3>
                  <p className="fx-squareToolSub">{tool.subtitle}</p>
                </div>

                <div className="fx-squareToolBottom">
                  <span className="fx-openToolLink">
                    {t('tools.openTool')} <ChevronRight size={13} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* 2. EKRAN: BİR ARAÇ SEÇİLDİĞİNDE - ÜSTTE VE ALTTA MENÜ ÇUBUĞUYLA AKICI GEÇİŞ SAHNESİ */
        <div className="fx-stack fx-activeToolStage animate-slide-up">
          {/* ÜST GEÇİŞ & KONTROL ÇUBUĞU (STICKY TOOLS NAV BAR) */}
          <div className="fx-toolsNavBar">
            <button
              type="button"
              className="fx-toolsBackBtn"
              onClick={closeTool}
              title={t('tools.allToolsBtn')}
            >
              <ArrowLeft size={16} />
              <span>{t('tools.allToolsBtn')}</span>
            </button>

            {/* DİĞER ARAÇLARA TEK TIKLA ATLAMAYI SAĞLAYAN YATAY KARE KISAYOL DOKU */}
            <div className="fx-toolsMiniDock" aria-label={t('tools.allToolsBtn')}>
              {localizedTools.map((tool) => {
                const isActive = tool.id === selectedToolId;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    className={`fx-miniToolSquare ${isActive ? 'active' : ''}`}
                    onClick={() => openTool(tool.id)}
                    title={tool.title}
                    style={{ '--mini-accent': tool.color }}
                  >
                    <span className="fx-miniSymbol">{tool.symbol}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AKTİF ARACIN İÇERİĞİ */}
          <div className="fx-toolInnerContainer animate-fade-in" key={selectedToolId}>
            {selectedToolId === 'fasting' && <FastingTimer />}
            {selectedToolId === 'buddy' && (
              <GymBuddyStudio profile={profile} onStartWorkout={onStartWorkout} />
            )}
            {selectedToolId === '1rm' && <OneRepMaxCalc />}
            {selectedToolId === 'tabata' && <TabataIntervalTimer />}
            {selectedToolId === 'hydration' && (
              <HydrationSmartLab profile={profile} entries={entries} target={target} />
            )}
            {selectedToolId === 'adonis' && <AdonisRatioCalc profile={profile} />}
            {selectedToolId === 'metabolic' && <MetabolicEngineCalc profile={profile} />}
            {selectedToolId === 'recovery' && (
              <div className="fx-stack">
                <RecoveryStudio />
                <StrengthOverloadCard entries={entries} />
              </div>
            )}
            {selectedToolId === 'body' && (
              <div className="fx-stack">
                <BodyCompositionPro profile={profile} entries={entries} />
                <BeforeAfterSlider profile={profile} entries={entries} />
              </div>
            )}
            {selectedToolId === 'form_check' && <AiFormCheckStudio />}
            {selectedToolId === 'genetic' && <GeneticPotentialCalc profile={profile} />}
          </div>

          {/* ALT GEÇİŞ DOKU (MOBİLDE BAŞPARMAKLA ANINDA DİĞER ARACA GEÇİŞ İÇİN) */}
          <div className="fx-toolsBottomDock">
            <button type="button" className="fx-bottomDockBack" onClick={closeTool}>
              <ArrowLeft size={15} /> Launchpad
            </button>
            <div className="fx-bottomDockIcons">
              {TOOLS_CONFIG.map((t) => {
                const isActive = t.id === selectedToolId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`fx-bottomDockTile ${isActive ? 'active' : ''}`}
                    onClick={() => openTool(t.id)}
                    title={t.title}
                  >
                    <span>{t.symbol}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
