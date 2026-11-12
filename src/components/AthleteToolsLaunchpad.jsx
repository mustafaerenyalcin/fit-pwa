import React from 'react';
import { Scan, Sparkles, Clock, Bot, ChevronRight } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function AthleteToolsLaunchpad({ onOpenBarcode, onNavigate }) {
  const tools = [
    {
      id: 'barcode',
      icon: Scan,
      title: 'Barkod Tara',
      sub: 'Kamerayla anında besin ve makro ekle',
      badge: 'Sıfır Paywall',
      color: '#00f0ff',
      image: '/images/nutrition-bg.jpg',
      action: () => onOpenBarcode()
    },
    {
      id: 'formcheck',
      icon: Sparkles,
      title: 'AI Form Check',
      sub: 'Squat & Deadlift biyomekanik açı analizi',
      badge: 'Biyomekanik',
      color: '#c8ff00',
      image: '/images/tools/form_check.jpg',
      action: () => onNavigate('tools', 'form_check')
    },
    {
      id: 'fasting',
      icon: Clock,
      title: 'Aralıklı Oruç',
      sub: '16:8 Protokolü ve metabolik yağ yakım fazı',
      badge: 'Metabolik Faz',
      color: '#ff4d1c',
      image: '/images/tools/fasting.jpg',
      action: () => onNavigate('tools', 'fasting')
    },
    {
      id: 'coach',
      icon: Bot,
      title: 'AI Performans Koçu',
      sub: 'Biyometrik analiz ve kişisel seans uyarlaması',
      badge: 'Yapay Zeka',
      color: '#a855f7',
      image: '/images/tools/buddy.jpg',
      action: () => onNavigate('coach')
    }
  ];

  return (
    <section className="fx-zenToolsSection">
      <div className="fx-zenToolsHeader">
        <span className="fx-zenToolsEyebrow">HIZLI SPORCU ARAÇLARI &amp; LABORATUVAR</span>
        <button
          type="button"
          className="fx-zenLinkMini"
          onClick={() => {
            sounds.tap();
            onNavigate('tools');
          }}
        >
          Tüm Araçlar (10) <ChevronRight size={13} />
        </button>
      </div>

      <div className="fx-zenToolsGrid">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              className="fx-zenToolTile"
              onClick={() => {
                sounds.tap();
                t.action();
              }}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(14, 18, 28, 0.78) 0%, rgba(9, 11, 17, 0.94) 80%, rgba(7, 9, 14, 0.98) 100%), url('${t.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderColor: `${t.color}35`
              }}
            >
              <div className="fx-zenToolTop">
                <div
                  className="fx-zenToolIconBox"
                  style={{ color: t.color, backgroundColor: `${t.color}1e` }}
                >
                  <Icon size={18} />
                </div>
                <span className="fx-zenToolBadge" style={{ color: t.color, borderColor: `${t.color}40`, backgroundColor: `${t.color}14` }}>
                  {t.badge}
                </span>
              </div>
              <div className="fx-zenToolMeta">
                <strong className="fx-zenToolTitle">{t.title}</strong>
                <p className="fx-zenToolSub">{t.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
