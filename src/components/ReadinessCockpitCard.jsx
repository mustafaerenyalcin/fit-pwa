import React from 'react';
import { Activity, Zap, Moon, Utensils, Droplets, Shield, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { calculateReadiness } from '../lib/readinessEngine.js';
import { Ring } from './ui.jsx';

export default function ReadinessCockpitCard({ entries, profile, target, doneToday = [] }) {
  const readiness = calculateReadiness(entries, profile, target);
  const workoutDone = doneToday.length > 0;

  return (
    <div className="fx-card fx-glassModule fx-readinessCockpitCard">
      <div className="fx-readinessTopRow">
        <div className="fx-readinessBadge">
          <Activity size={14} color={readiness.color} />
          <span>GÜNLÜK ATLETİK HAZIRLIK TELEMETRİSİ (WHOOP & ATHLYTIC STANDARD)</span>
        </div>
        <span className="fx-readinessTierPill" style={{ borderColor: readiness.color, color: readiness.color }}>
          {readiness.tierLabel}
        </span>
      </div>

      <div className="fx-readinessMainGrid">
        {/* SOL: BÜYÜK HAZIRLIK HALKASI */}
        <div className="fx-readinessRingPod">
          <Ring value={readiness.score} max={100} size={84} stroke={7} color={readiness.color}>
            <b className="fx-monoBig" style={{ color: readiness.color, fontSize: 24 }}>
              %{readiness.score}
            </b>
          </Ring>
          <div className="fx-readinessRingMeta">
            <small>HAZIRLIK SKORU</small>
            <span>{readiness.tier === 'PEAK' ? 'Zirve Kapasite' : readiness.tier === 'OPTIMAL' ? 'Optimum Yük' : 'Hafif Seans'}</span>
          </div>
        </div>

        {/* ORTA: DETAYLI FAKTÖR TELEMETRİLERİ */}
        <div className="fx-readinessFactorsGrid">
          <div className="fx-factorPill">
            <Moon size={14} color="#00f0ff" />
            <div>
              <small>UYKU</small>
              <b>{readiness.factors.sleep.val}</b>
            </div>
          </div>

          <div className="fx-factorPill">
            <Utensils size={14} color="#ff4d1c" />
            <div>
              <small>PROTEİN</small>
              <b>{readiness.factors.nutrition.val}</b>
            </div>
          </div>

          <div className="fx-factorPill">
            <Shield size={14} color="#c8ff00" />
            <div>
              <small>DİNLENME</small>
              <b>{readiness.factors.fatigue.val}</b>
            </div>
          </div>

          <div className="fx-factorPill">
            <Droplets size={14} color="#00b4d8" />
            <div>
              <small>SU</small>
              <b>{readiness.factors.hydration.val}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="fx-readinessAdviceRow">
        <Sparkles size={15} color={readiness.color} style={{ minWidth: 15 }} />
        <p>{readiness.advice}</p>
      </div>

      {/* METABOLİK ANTRENMAN KÖPRÜSÜ (HEVY + MACROFACTOR BİRLEŞİMİ) */}
      {workoutDone && (
        <div className="fx-metabolicBridgeBanner">
          <div className="fx-bridgeHead">
            <Flame size={16} color="#ff4d1c" />
            <b>Metabolik Senkronizasyon Devrede</b>
            <span className="fx-bridgeTag">POST-WORKOUT BOOST</span>
          </div>
          <p>
            Bugün <b>{doneToday[0]?.payload?.name || 'Antrenman'}</b> seansını tamamladın! Tükenen kas glikojen depolarını
            doldurmak ve protein sentezini maksimize etmek için bugünkü beslenme hedefine{' '}
            <span style={{ color: '#00f0ff', fontWeight: 700 }}>+35g Karbonhidrat</span> ve{' '}
            <span style={{ color: '#ff4d1c', fontWeight: 700 }}>+15g Protein</span> eklendi.
          </p>
        </div>
      )}
    </div>
  );
}
