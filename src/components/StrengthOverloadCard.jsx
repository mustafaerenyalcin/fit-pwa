import React, { useMemo, useState } from 'react';
import { TrendingUp, Trophy, Dumbbell, Calculator, Flame, ArrowUpRight } from 'lucide-react';
import { Card } from './ui.jsx';
import { calculateOneRepMax } from '../lib/calculations.js';

/**
 * 1RM (Tek Tekrar Maksimum) & Otomatik Progressive Overload Motoru.
 * Geçmiş antrenman kayıtlarından Epley formülü ile 1RM hesaplar ve
 * bir sonraki antrenman için somut ağırlık/tekrar artışı hedefi verir.
 */
export default function StrengthOverloadCard({ entries }) {
  const [calcKg, setCalcKg] = useState(60);
  const [calcReps, setCalcReps] = useState(8);
  const [showCalc, setShowCalc] = useState(false);

  const liftStats = useMemo(() => {
    const workouts = entries?.workout || [];
    const map = new Map();

    // Kronolojik sırayla (eskiden yeniye) gezerek her hareketin geçmişini çıkar
    const sorted = [...workouts].sort((a, b) => String(a.day).localeCompare(String(b.day)));

    for (const w of sorted) {
      const setsObj = w.payload?.sets;
      if (!setsObj || typeof setsObj !== 'object') continue;

      for (const [exName, data] of Object.entries(setsObj)) {
        const kg = Number(data?.kg) || 0;
        const reps = Number(data?.reps) || 0;
        if (kg <= 0 || reps <= 0) continue;

        const est1RM = calculateOneRepMax(kg, reps);
        const prev = map.get(exName);

        // Progressive Overload hedefi:
        // 10+ tekrar çıktıysa +2.5kg artış öner, 8'in altındaysa aynı ağırlıkta +1-2 tekrar öner
        const nextTarget =
          reps >= 10
            ? `${kg + 2.5} kg × 8–10`
            : `${kg} kg × ${reps + 1}–${reps + 2}`;

        const nextReason =
          reps >= 10
            ? '+2.5 kg yük artışı zamanı'
            : 'Aynı kiloda +1-2 tekrar ustalaşma';

        map.set(exName, {
          name: exName,
          lastKg: kg,
          lastReps: reps,
          lastDay: w.day,
          best1RM: prev ? Math.max(prev.best1RM, est1RM) : est1RM,
          current1RM: est1RM,
          sessions: (prev?.sessions || 0) + 1,
          nextTarget,
          nextReason
        });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.best1RM - a.best1RM)
      .slice(0, 6);
  }, [entries?.workout]);

  const manual1RM = useMemo(
    () => calculateOneRepMax(Number(calcKg) || 0, Number(calcReps) || 0),
    [calcKg, calcReps]
  );

  return (
    <Card
      title="1RM Güç & Progressive Overload Motoru"
      subtitle="Epley biyomekanik formülüyle maksimum güç ve sonraki antrenman ağırlık hedeflerin"
      action={
        <button
          type="button"
          className="fx-btn fx-btn--ghost fx-btn--sm"
          onClick={() => setShowCalc((v) => !v)}
        >
          <Calculator size={14} /> {showCalc ? 'Hesaplayıcıyı Kapat' : '1RM Hesapla'}
        </button>
      }
    >
      {showCalc && (
        <div className="fx-overloadCalcBox">
          <div className="fx-overloadCalcInputs">
            <label className="fx-field">
              <span>Kaldırılan Ağırlık (kg)</span>
              <input
                type="number"
                step="0.5"
                min="1"
                max="400"
                value={calcKg}
                onChange={(e) => setCalcKg(e.target.value)}
              />
            </label>
            <label className="fx-field">
              <span>Tekrar Sayısı (1–20)</span>
              <input
                type="number"
                min="1"
                max="30"
                value={calcReps}
                onChange={(e) => setCalcReps(e.target.value)}
              />
            </label>
          </div>

          <div className="fx-overloadZones">
            <div className="fx-zonePill fx-zonePill--max">
              <small>Tahmini 1RM (Maks.)</small>
              <b>{manual1RM} kg</b>
            </div>
            <div className="fx-zonePill">
              <small>Hipertrofi (%80 · 8 tekrar)</small>
              <b>{Math.round(manual1RM * 0.8)} kg</b>
            </div>
            <div className="fx-zonePill">
              <small>Güç (%88 · 4-5 tekrar)</small>
              <b>{Math.round(manual1RM * 0.88)} kg</b>
            </div>
            <div className="fx-zonePill">
              <small>Dayanıklılık (%70 · 12 tekrar)</small>
              <b>{Math.round(manual1RM * 0.7)} kg</b>
            </div>
          </div>
        </div>
      )}

      {liftStats.length > 0 ? (
        <div className="fx-overloadGrid">
          {liftStats.map((item) => (
            <div key={item.name} className="fx-overloadItem">
              <div className="fx-overloadTop">
                <div>
                  <b>{item.name}</b>
                  <small>
                    Son: {item.lastKg} kg × {item.lastReps} tekrar
                  </small>
                </div>
                <span className="fx-1rmBadge" title="Tahmini 1 Tekrar Maksimum">
                  <Trophy size={12} /> 1RM: {item.best1RM} kg
                </span>
              </div>

              <div className="fx-overloadTargetRow">
                <span className="fx-overloadNextLabel">
                  <TrendingUp size={13} /> Yeni Hedef: <b>{item.nextTarget}</b>
                </span>
                <small className="fx-overloadReason">
                  <ArrowUpRight size={12} /> {item.nextReason}
                </small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="fx-overloadEmpty">
          <Dumbbell size={20} className="fx-accentIcon" />
          <div>
            <b>Henüz ağırlıklı set kaydın yok</b>
            <p className="fx-muted fx-small">
              Canlı antrenmanda setlerini ağırlık (kg) ve tekrar sayısıyla tamamladığında, her hareket için tahmini{' '}
              <b>1RM rekorun</b> ve bir sonraki antrenmanda kaç kilo artırman gerektiği burada otomatik listelenir.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
