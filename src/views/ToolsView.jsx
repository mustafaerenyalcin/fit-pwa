import React, { useState } from 'react';
import {
  Clock,
  Users,
  Calculator,
  HeartPulse,
  Scale,
  Sparkles,
  Layers,
  Flame,
  Activity
} from 'lucide-react';
import FastingTimer from '../components/FastingTimer.jsx';
import GymBuddyStudio from '../components/GymBuddyStudio.jsx';
import OneRepMaxCalc from '../components/OneRepMaxCalc.jsx';
import RecoveryStudio from '../components/RecoveryStudio.jsx';
import StrengthOverloadCard from '../components/StrengthOverloadCard.jsx';
import BodyCompositionPro from '../components/BodyCompositionPro.jsx';
import BeforeAfterSlider from '../components/BeforeAfterSlider.jsx';
import { Segmented } from '../components/ui.jsx';
import { useI18n } from '../lib/i18n.js';
import { sounds } from '../lib/audio.js';

export default function ToolsView({ profile, entries, target, onStartWorkout }) {
  const { t } = useI18n();
  const [activeTool, setActiveTool] = useState('fasting');

  const toolsList = [
    { id: 'fasting', label: 'Aralıklı Oruç', icon: Clock },
    { id: 'buddy', label: 'Gym Buddy', icon: Users },
    { id: '1rm', label: '1RM & Plaka', icon: Calculator },
    { id: 'recovery', label: 'İyileşme & HRV', icon: HeartPulse },
    { id: 'body', label: 'Vücut & Form', icon: Scale }
  ];

  return (
    <div className="fx-stack fx-toolsStudio">
      {/* ÜST EDİTORYAL BAŞLIK */}
      <section className="fx-cockpitHeroBar fx-atelierHeroBar">
        <div className="fx-cockpitGreetCol">
          <div className="fx-atelierEyebrow">
            <span>[LABORATORY // 04]</span> · ÖZEL BİYOMETRİK VE PERFORMANS ARAÇLARI
          </div>
          <h2 className="fx-cockpitGreeting fx-atelierDisplay">
            Araçlar <span>&amp; Stüdyo Laboratuvarı</span>
          </h2>
          <p className="fx-cockpitSub">
            Aralıklı oruç zamanlayıcısı, Gym Buddy partner yönetimi, 1RM hesaplayıcı ve toparlanma telemetrileri tek merkezde.
          </p>
        </div>
      </section>

      {/* ARAÇ SEÇİCİ SEKMELER */}
      <div className="fx-toolPillsBar">
        {toolsList.map((tool) => {
          const Icon = tool.icon;
          const active = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              className={`fx-toolPillBtn ${active ? 'active' : ''}`}
              onClick={() => {
                sounds.tap();
                setActiveTool(tool.id);
              }}
            >
              <Icon size={16} />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* AKTİF ARAÇ İÇERİĞİ */}
      <div className="fx-toolContentArea">
        {activeTool === 'fasting' && (
          <div className="fx-stack animate-fade-in">
            <FastingTimer />
          </div>
        )}

        {activeTool === 'buddy' && (
          <div className="fx-stack animate-fade-in">
            <GymBuddyStudio profile={profile} onStartWorkout={onStartWorkout} />
          </div>
        )}

        {activeTool === '1rm' && (
          <div className="fx-stack animate-fade-in">
            <OneRepMaxCalc />
          </div>
        )}

        {activeTool === 'recovery' && (
          <div className="fx-stack animate-fade-in">
            <RecoveryStudio />
            <StrengthOverloadCard entries={entries} />
          </div>
        )}

        {activeTool === 'body' && (
          <div className="fx-stack animate-fade-in">
            <BodyCompositionPro profile={profile} entries={entries} />
            <BeforeAfterSlider profile={profile} entries={entries} />
          </div>
        )}
      </div>
    </div>
  );
}
