import React from 'react';
import { Scan, Sparkles, Clock, Bot, ChevronRight } from 'lucide-react';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';

export default function AthleteToolsLaunchpad({ onOpenBarcode, onNavigate }) {
  const { t } = useI18n();
  const tools = [
    {
      id: 'barcode',
      icon: Scan,
      title: t('launchpad.barcodeTitle'),
      sub: t('launchpad.barcodeSub'),
      badge: t('launchpad.barcodeBadge'),
      color: '#00f0ff',
      image: '/images/nutrition-bg.jpg',
      action: () => onOpenBarcode()
    },
    {
      id: 'formcheck',
      icon: Sparkles,
      title: t('launchpad.formTitle'),
      sub: t('launchpad.formSub'),
      badge: t('launchpad.formBadge'),
      color: '#c8ff00',
      image: '/images/tools/form_check.jpg',
      action: () => onNavigate('tools', 'form_check')
    },
    {
      id: 'fasting',
      icon: Clock,
      title: t('launchpad.fastingTitle'),
      sub: t('launchpad.fastingSub'),
      badge: t('launchpad.fastingBadge'),
      color: '#ff4d1c',
      image: '/images/tools/fasting-v2.jpg',
      action: () => onNavigate('tools', 'fasting')
    },
    {
      id: 'coach',
      icon: Bot,
      title: t('launchpad.coachTitle'),
      sub: t('launchpad.coachSub'),
      badge: t('launchpad.coachBadge'),
      color: '#a855f7',
      image: '/images/tools/buddy.jpg',
      action: () => onNavigate('coach')
    }
  ];

  return (
    <section className="fx-zenToolsSection">
      <div className="fx-zenToolsHeader">
        <span className="fx-zenToolsEyebrow">{t('launchpad.eyebrow')}</span>
        <button
          type="button"
          className="fx-zenLinkMini"
          onClick={() => {
            sounds.tap();
            onNavigate('tools');
          }}
        >
          {t('launchpad.allTools')} <ChevronRight size={13} />
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
