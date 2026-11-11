import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  Clock,
  Target,
  Shield,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  HeartPulse
} from 'lucide-react';
import { askCoach } from '../lib/aiCoach.js';

export default function DailyCheckin({
  day,
  profile,
  entries,
  todayWorkout,
  onStartWorkout
}) {
  const storageKey = `fit_checkin_${day}`;

  // Load existing checkin for today if any
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (_e) {
      return null;
    }
  });

  const [energy, setEnergy] = useState(data?.energy || 'normal');
  const [time, setTime] = useState(data?.time || 'full');
  const [focus, setFocus] = useState(data?.focus || 'program');
  const [analysis, setAnalysis] = useState(data?.analysis || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(!data?.analysis);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fit_checkin_${day}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);
        setEnergy(parsed.energy || 'normal');
        setTime(parsed.time || 'full');
        setFocus(parsed.focus || 'program');
        setAnalysis(parsed.analysis || '');
        setIsExpanded(false);
      } else {
        setData(null);
        setAnalysis('');
        setIsExpanded(true);
      }
    } catch (_e) {}
  }, [day]);

  const energyOptions = [
    { id: 'high', label: 'Zindeyim & Yüksek', icon: '🔥', desc: 'Ağırlıkları zorlamaya hazırım' },
    { id: 'normal', label: 'Normal / Dengeli', icon: '💪', desc: 'Rutin tempomda gidebilirim' },
    { id: 'low', label: 'Yorgun / Az Uyudum', icon: '🥱', desc: 'Daha kontrollü olmalıyım' },
    { id: 'sore', label: 'Kas Hamlığı / Ağrı', icon: '🩹', desc: 'Belli bölgelerimde ağrı var' }
  ];

  const timeOptions = [
    { id: 'full', label: 'Tam Süre (45-60 dk)', desc: 'Tüm hareketler ve setler' },
    { id: 'quick', label: 'Hızlı Seans (25-30 dk)', desc: 'Süpersetler & kısa dinlenme' },
    { id: 'recovery', label: 'Karın & Esneme (15 dk)', desc: 'Hafif toparlanma seansı' },
    { id: 'rest', label: 'Tam Dinlenme (Off)', desc: 'Sadece beslenme & uyku' }
  ];

  const focusOptions = [
    { id: 'program', label: '🎯 Programı Birebir Uygula', desc: 'Günün planını eksiksiz yap' },
    { id: 'shoulders', label: '🛡️ Omuz Odaklı (Lateral Vurgu)', desc: 'Yan & arka omuzda drop set' },
    { id: 'abs', label: '🍫 Karın / Core Ekstra', desc: 'Antrenman sonuna 3 tur karın' },
    { id: 'form', label: '⚖️ Form & Kontrollü Tempo', desc: 'Ağırlık yerine 3 sn negatif iniş' }
  ];

  const handleAnalyze = async () => {
    setBusy(true);
    setError('');

    const energyText = energyOptions.find((e) => e.id === energy)?.label || energy;
    const timeText = timeOptions.find((t) => t.id === time)?.label || time;
    const focusText = focusOptions.find((f) => f.id === focus)?.label || focus;

    const workoutName = todayWorkout ? todayWorkout.name : 'Dinlenme Günü';
    const recentWorkouts = (entries.workout || []).slice(0, 3).map((w) => w.payload?.name).join(', ') || 'Yok';

    const prompt = `Bugün uygulamayı açtım ve günlük durumumu bildirdim:
- Enerji & Mod Durumum: ${energyText}
- Bugün Ayırabileceğim Süre: ${timeText}
- Bugünün Özel Odak Tercihi: ${focusText}
- Bugünkü Planlanmış Program: ${workoutName}
- Son Günlerdeki Antrenmanlar: ${recentWorkouts}

Bana bugünkü antrenmanım ve günüm için 3-4 maddelik, motive edici, çok net ve uygulanabilir bir "Günün Stratejisi" oluştur.
Eğer yorgunsam veya vaktim kısıtlıysa programı nasıl optimize edeceğimi söyle. Omuz ve karın hedeflerimi unutma.`;

    try {
      const summary = `Profil: ${profile.height || 180}cm, ${profile.weight || 77}kg. Evde dambıl.`;
      const reply = await askCoach(profile, summary, prompt);

      setAnalysis(reply);
      setIsExpanded(false);

      const checkinPayload = { energy, time, focus, analysis: reply, day };
      localStorage.setItem(storageKey, JSON.stringify(checkinPayload));
      setData(checkinPayload);
    } catch (err) {
      setError(err.message || 'Yapay zeka analizi alınamadı.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setData(null);
    setAnalysis('');
    setIsExpanded(true);
  };

  return (
    <div className="dailyCheckinCard">
      <div className="dailyCheckinHeader" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="checkinHeaderLeft">
          <div className="checkinPulseIcon">
            <Sparkles size={18} />
          </div>
          <div>
            <h3>Günün Durum Analizi & Akıllı Mod</h3>
            <p className="mutedText">
              {analysis
                ? 'Bugünkü stratejin hazır · Tıklayarak detayları veya tercihleri değiştir'
                : 'Bugünkü enerji ve vaktine göre antrenmanını yapay zekaya optimize ettir'}
            </p>
          </div>
        </div>

        <div className="checkinHeaderRight">
          {analysis && !isExpanded && (
            <span className="checkinBadge ready">
              <CheckCircle2 size={13} /> Analiz Hazır
            </span>
          )}
          <button type="button" className="iconBtn">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="checkinBody">
          {/* Question 1: Energy */}
          <div className="checkinSection">
            <label className="checkinLabel">
              <span className="stepNum">1</span> Bugün Enerji & Modun Nasıl?
            </label>
            <div className="optionGrid">
              {energyOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`optionChip ${energy === opt.id ? 'active' : ''}`}
                  onClick={() => setEnergy(opt.id)}
                >
                  <span className="chipIcon">{opt.icon}</span>
                  <div className="chipText">
                    <b>{opt.label}</b>
                    <small>{opt.desc}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Time */}
          <div className="checkinSection">
            <label className="checkinLabel">
              <span className="stepNum">2</span> Bugün Ne Kadar Vaktin Var?
            </label>
            <div className="optionGrid cols2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`optionChip ${time === opt.id ? 'active' : ''}`}
                  onClick={() => setTime(opt.id)}
                >
                  <div className="chipText">
                    <b>{opt.label}</b>
                    <small>{opt.desc}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Focus */}
          <div className="checkinSection">
            <label className="checkinLabel">
              <span className="stepNum">3</span> Bugün Özel Bir Vurgu İstiyor Musun?
            </label>
            <div className="optionGrid cols2">
              {focusOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`optionChip ${focus === opt.id ? 'active' : ''}`}
                  onClick={() => setFocus(opt.id)}
                >
                  <div className="chipText">
                    <b>{opt.label}</b>
                    <small>{opt.desc}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="callout warning">{error}</div>}

          <div className="checkinActions">
            <button
              type="button"
              className="primary checkinSubmitBtn"
              disabled={busy}
              onClick={handleAnalyze}
            >
              <Sparkles size={16} />
              {busy ? 'Yapay Zeka Analiz Ediyor…' : 'Moduma Göre Günümü Analiz Et & Planla'}
            </button>
          </div>
        </div>
      )}

      {/* Render AI Result if available */}
      {analysis && (
        <div className="checkinResultBox">
          <div className="resultHeader">
            <div className="resultTag">
              <Zap size={14} /> BUGÜNÜN AI STRATEJİSİ
            </div>
            <button
              type="button"
              className="textLink small"
              onClick={handleReset}
            >
              <RotateCcw size={12} /> Tercihleri Sıfırla
            </button>
          </div>

          <div className="resultContent">
            {analysis.split('\n').map((line, idx) => {
              if (!line.trim()) return <div key={idx} className="lineBreak" />;
              return (
                <p key={idx} className="resultLine">
                  {line}
                </p>
              );
            })}
          </div>

          {todayWorkout && (
            <div className="resultFooterAction">
              <button
                type="button"
                className="primary startWithAdviceBtn"
                onClick={() => onStartWorkout(todayWorkout)}
              >
                <Play size={16} fill="currentColor" /> Bu Stratejiyle Antrenmana Başla
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
