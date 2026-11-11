import React, { useState } from 'react';
import {
  HeartPulse,
  Moon,
  Droplets,
  Footprints,
  Plus,
  Trash2,
  BatteryCharging,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import Metric from '../components/Metric.jsx';
import Panel from '../components/Panel.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function HabitsView({
  day,
  profile,
  entries,
  target,
  onAddHabit,
  onRemoveHabit,
  onQuickWaterAdd
}) {
  const [sleep, setSleep] = useState('');
  const [water, setWater] = useState('');
  const [steps, setSteps] = useState('');
  const [energyLevel, setEnergyLevel] = useState('4'); // 1-5 scale
  const [notes, setNotes] = useState('');

  const todayHabitEntry = entries.habit.find((e) => e.day === day);
  const currentWater = Number(todayHabitEntry?.payload?.water || 0);
  const currentSleep = Number(todayHabitEntry?.payload?.sleep || 0);
  const currentSteps = Number(todayHabitEntry?.payload?.steps || 0);

  const handleSubmit = () => {
    onAddHabit({
      sleep: sleep ? Number(sleep) : currentSleep,
      water: water ? Number(water) : currentWater,
      steps: steps ? Number(steps) : currentSteps,
      energyLevel: Number(energyLevel),
      notes: notes.trim()
    });
    setSleep('');
    setWater('');
    setSteps('');
    setNotes('');
  };

  // Smart Recovery Suggestion based on recent days
  const getRecoveryAdvice = () => {
    const recentWorkouts = entries.workout.filter((w) => {
      const diff = (new Date(day).getTime() - new Date(w.day).getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 3;
    });

    if (recentWorkouts.length >= 3) {
      return {
        level: 'warning',
        text: 'Son 3 gündür kesintisiz antrenman yaptın. Kas liflerinin onarılması ve sinir sisteminin toparlanması için bugün veya yarın hafif yürüyüş ile aktif dinlenme önerilir.'
      };
    }

    if (currentSleep > 0 && currentSleep < 6.5) {
      return {
        level: 'warning',
        text: 'Uyku süren 6.5 saatin altında görünüyor. Büyüme hormonu ve kas toparlanması derin uykuda gerçekleşir; bu akşam erken yatmaya çalış.'
      };
    }

    return {
      level: 'good',
      text: 'Toparlanma durumun dengeli. Yeterli hidrasyon ve kaliteli uyku ile performansını koruyabilirsin.'
    };
  };

  const recoveryAdvice = getRecoveryAdvice();

  return (
    <div className="habitsView">
      <div className="intro">
        <h2>Sağlıklı Yaşam & Toparlanma</h2>
        <p>
          Kas gelişimi spor salonunda veya evde değil, dinlenirken ve uyurken gerçekleşir. Su, uyku,
          günlük hareket ve enerji seviyenin takibi sakatlıkları önler ve gelişimi hızlandırır.
        </p>
      </div>

      {/* Target Metrics */}
      <div className="metrics three">
        <Metric
          label="UYKU PLANI"
          value={`${currentSleep || 0} / 8 saat`}
          extra="7–9 saat yetişkin altın aralığı"
          icon={Moon}
        />
        <Metric
          label="GÜNLÜK SU"
          value={`${currentWater} / ${target.water} ml`}
          extra={currentWater >= target.water ? 'Su hedefi tamamlandı!' : `${target.water - currentWater} ml kaldı`}
          icon={Droplets}
        />
        <Metric
          label="ADIM PLANI"
          value={`${currentSteps.toLocaleString('tr-TR')} / ${target.steps.toLocaleString('tr-TR')}`}
          extra="Aktif metabolizma ve toparlanma"
          icon={Footprints}
        />
      </div>

      {/* Recovery Alert Card */}
      <div className={`recoveryBanner ${recoveryAdvice.level}`}>
        <Sparkles size={20} />
        <div>
          <b>Fit Toparlanma Tavsiyesi:</b>
          <p>{recoveryAdvice.text}</p>
        </div>
      </div>

      <div className="twoCols">
        {/* Daily Entry Panel */}
        <Panel title="Bugünkü Yaşam Kaydı" sub={day}>
          {/* Quick Water Adder */}
          <div className="quickWaterSection">
            <span className="sectionSubTitle">Hızlı Su Ekle:</span>
            <div className="quickWaterBtns">
              {[250, 500, 750].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="quickWaterPill"
                  onClick={() => onQuickWaterAdd(amt)}
                >
                  +{amt} ml
                </button>
              ))}
            </div>
          </div>

          <div className="formGrid" style={{ marginTop: 16 }}>
            <label>
              Toplam Uyku (Saat)
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder={currentSleep || '7.5'}
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
              />
            </label>

            <label>
              Toplam Su (ml)
              <input
                type="number"
                min="0"
                max="15000"
                step="100"
                placeholder={currentWater || '2500'}
                value={water}
                onChange={(e) => setWater(e.target.value)}
              />
            </label>

            <label>
              Günlük Adım Sayısı
              <input
                type="number"
                min="0"
                max="100000"
                placeholder={currentSteps || '8000'}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
              />
            </label>

            <label>
              Enerji & Dinçlik Seviyesi (1–5)
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
              >
                <option value="1">1 - Çok Yorgun / Bitkin</option>
                <option value="2">2 - Düşük Enerji</option>
                <option value="3">3 - Normal / Dengeli</option>
                <option value="4">4 - Enerjik / Zinde</option>
                <option value="5">5 - Harika / Maksimum Güç</option>
              </select>
            </label>

            <label className="wide">
              Günün Notu / Ruh Hali
              <input
                placeholder="Örn: Erken uyudum, sabah dinç uyandım."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>

          <div className="profileAction">
            <button type="button" className="primary" onClick={handleSubmit}>
              <Plus size={16} /> Günü Kaydet
            </button>
          </div>
        </Panel>

        {/* Routine Tips */}
        <Panel title="Bilimsel Rutin Prensipleri">
          <div className="priority">
            <div className="number">01</div>
            <div>
              <b>Sirkadiyen Ritim & Uyku</b>
              <span>Hafta sonu dahil benzer saatlerde yatıp uyanmak büyüme hormonunu dengeler.</span>
            </div>
          </div>
          <div className="priority">
            <div className="number">02</div>
            <div>
              <b>Hücresel Hidrasyon</b>
              <span>Kreatin kullanırken günde en az 2.5–3.5 litre su kas dolgunluğunu korur.</span>
            </div>
          </div>
          <div className="priority">
            <div className="number">03</div>
            <div>
              <b>NEAT (Spontane Hareket)</b>
              <span>Günde 8.000 adım metabolizmayı canlı tutarak karın bölgesinde yağlanmayı engeller.</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Habits Log History */}
      <Panel title="Geçmiş Günlük Alışkanlık Kayıtları">
        <div className="history">
          {entries.habit.length ? (
            entries.habit.slice(0, 30).map((h) => (
              <div className="historyRow" key={h.id}>
                <div>
                  <b>{h.day}</b>
                  <small>
                    {h.payload?.sleep ? `${h.payload.sleep} saat uyku · ` : ''}
                    {h.payload?.water ? `${h.payload.water} ml su · ` : ''}
                    {h.payload?.steps ? `${h.payload.steps} adım · ` : ''}
                    {h.payload?.energyLevel ? `Enerji: ${h.payload.energyLevel}/5` : ''}
                    {h.payload?.notes ? ` · "${h.payload.notes}"` : ''}
                  </small>
                </div>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onRemoveHabit(h.id)}
                  title="Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <EmptyState
              icon={HeartPulse}
              title="Henüz günlük kayıt yok"
              description="Yukarıdaki formu kullanarak ilk uyku ve su kaydını ekle."
            />
          )}
        </div>
      </Panel>
    </div>
  );
}
