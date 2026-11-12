import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Clock,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';
import { sounds } from '../lib/audio.js';

const PRESETS = [
  { id: 'tabata', name: 'Tabata Standart', work: 20, rest: 10, rounds: 8, total: '4 dk' },
  { id: 'hiit30', name: 'HIIT 30/30 Patlama', work: 30, rest: 30, rounds: 10, total: '10 dk' },
  { id: 'emom', name: 'EMOM 50/10', work: 50, rest: 10, rounds: 10, total: '10 dk' },
  { id: 'boxing', name: 'Boks Raundu', work: 180, rest: 60, rounds: 3, total: '12 dk' }
];

export default function TabataIntervalTimer() {
  const [preset, setPreset] = useState('tabata');
  const [workTime, setWorkTime] = useState(20);
  const [restTime, setRestTime] = useState(10);
  const [totalRounds, setTotalRounds] = useState(8);
  const [prepTime] = useState(5);

  const [phase, setPhase] = useState('idle'); // 'idle' | 'prep' | 'work' | 'rest' | 'finished'
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const timerRef = useRef(null);

  // Play audio beep on countdown
  const playBeep = (freq = 880, dur = 0.12) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  };

  const selectPreset = (p) => {
    sounds.tap();
    setPreset(p.id);
    setWorkTime(p.work);
    setRestTime(p.rest);
    setTotalRounds(p.rounds);
    resetTimer(p.work);
  };

  const startTimer = () => {
    sounds.tap();
    if (phase === 'idle') {
      setPhase('prep');
      setTimeLeft(prepTime);
      playBeep(600, 0.2);
    } else {
      // Resume
      setPhase(phase === 'paused' ? 'work' : phase);
    }
  };

  const pauseTimer = () => {
    sounds.tap();
    setPhase('paused');
  };

  const resetTimer = (newWork = workTime) => {
    sounds.tap();
    clearInterval(timerRef.current);
    setPhase('idle');
    setRound(1);
    setTimeLeft(newWork);
  };

  const skipPhase = () => {
    sounds.tap();
    if (phase === 'prep') {
      setPhase('work');
      setTimeLeft(workTime);
    } else if (phase === 'work') {
      if (round >= totalRounds) {
        setPhase('finished');
        sounds.success();
      } else {
        setPhase('rest');
        setTimeLeft(restTime);
        playBeep(520, 0.25);
      }
    } else if (phase === 'rest') {
      setRound((r) => r + 1);
      setPhase('work');
      setTimeLeft(workTime);
      playBeep(1040, 0.3);
    }
  };

  // Main countdown engine
  useEffect(() => {
    if (phase === 'idle' || phase === 'paused' || phase === 'finished') {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 4 && prev > 1) {
          playBeep(750, 0.1);
        } else if (prev === 1) {
          playBeep(1200, 0.35);
        }

        if (prev <= 1) {
          // Transition phases
          if (phase === 'prep') {
            setPhase('work');
            return workTime;
          }
          if (phase === 'work') {
            if (round >= totalRounds) {
              setPhase('finished');
              sounds.success();
              return 0;
            }
            setPhase('rest');
            return restTime;
          }
          if (phase === 'rest') {
            setRound((r) => r + 1);
            setPhase('work');
            return workTime;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, round, totalRounds, workTime, restTime]);

  const maxForPhase =
    phase === 'prep' ? prepTime : phase === 'work' ? workTime : phase === 'rest' ? restTime : 1;
  const progressPct = phase === 'idle' ? 0 : Math.round((timeLeft / maxForPhase) * 100);

  const phaseColors = {
    idle: '#94a3b8',
    prep: '#00f0ff',
    work: '#ff4d1c',
    rest: '#c8ff00',
    paused: '#f5c451',
    finished: '#a855f7'
  };

  const phaseLabels = {
    idle: 'HAZIR MISIN?',
    prep: 'HAZIRLANIN!',
    work: 'ÇALIŞ! (WORK)',
    rest: 'DİNLEN (REST)',
    paused: 'DURAKLATILDI',
    finished: 'SEANS TAMAMLANDI! 🔥'
  };

  const activeColor = phaseColors[phase] || '#ff4d1c';

  return (
    <div className={`fx-stack fx-tabataStudio ${fullscreen ? 'fullscreen-mode' : ''}`}>
      {/* BAŞLIK & KONTROLLER */}
      <div className="fx-tabataHead">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Zap size={20} color="#ff4d1c" /> HIIT &amp; Tabata İnterval Sayacı
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
            Önceden tanımlı veya özel set/dinlenme süreleriyle yüksek yoğunluklu kondisyon seansları.
          </p>
        </div>

        <div className="fx-tabataHeadTools">
          <button
            type="button"
            className="fx-iconBtn"
            onClick={() => setSoundEnabled((v) => !v)}
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            type="button"
            className="fx-iconBtn"
            onClick={() => setFullscreen((v) => !v)}
            title={fullscreen ? 'Küçült' : 'Tam Ekran'}
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* HAZIR PROTOKOL KARTLARI */}
      {phase === 'idle' && (
        <div className="fx-tabataPresetsRow">
          {PRESETS.map((p) => {
            const isSelected = preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`fx-tabataPresetBtn ${isSelected ? 'active' : ''}`}
                onClick={() => selectPreset(p)}
              >
                <b>{p.name}</b>
                <span>
                  {p.work}s Çalış · {p.rest}s Dinlen
                </span>
                <small>{p.rounds} Tur ({p.total})</small>
              </button>
            );
          })}
        </div>
      )}

      {/* DEV DİJİTAL SAYAÇ EKRANI */}
      <div
        className="fx-tabataDisplayCard"
        style={{
          borderColor: activeColor,
          boxShadow: `0 16px 48px ${activeColor}22`
        }}
      >
        <div className="fx-tabataPhasePill" style={{ background: `${activeColor}22`, color: activeColor }}>
          {phase === 'work' && <Flame size={14} className="animate-pulse" />}
          <span>{phaseLabels[phase]}</span>
        </div>

        <div className="fx-tabataBigDigits" style={{ color: activeColor }}>
          {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
          {String(timeLeft % 60).padStart(2, '0')}
        </div>

        <div className="fx-tabataRoundProgress">
          <span>TUR {round} / {totalRounds}</span>
          <div className="fx-tabataRoundDots">
            {Array.from({ length: totalRounds }).map((_, idx) => (
              <span
                key={idx}
                className={`fx-roundDot ${idx + 1 < round ? 'done' : idx + 1 === round ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="fx-tabataProgressBar">
          <span style={{ width: `${progressPct}%`, background: activeColor }} />
        </div>
      </div>

      {/* ALT KONTROL BUTONLARI */}
      <div className="fx-tabataControlsRow">
        {phase === 'idle' || phase === 'paused' ? (
          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--lg"
            onClick={startTimer}
            style={{ flex: 1.5 }}
          >
            <Play size={18} fill="currentColor" /> Başlat
          </button>
        ) : phase === 'finished' ? (
          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--lg"
            onClick={() => resetTimer()}
            style={{ flex: 1.5 }}
          >
            <RotateCcw size={18} /> Yeniden Başla
          </button>
        ) : (
          <button
            type="button"
            className="fx-btn fx-btn--secondary fx-btn--lg"
            onClick={pauseTimer}
            style={{ flex: 1.5 }}
          >
            <Pause size={18} /> Duraklat
          </button>
        )}

        {phase !== 'idle' && phase !== 'finished' && (
          <button
            type="button"
            className="fx-btn fx-btn--ghost fx-btn--lg"
            onClick={skipPhase}
            title="Sıradaki Faza Geç"
          >
            <SkipForward size={18} /> Geç
          </button>
        )}

        <button
          type="button"
          className="fx-btn fx-btn--ghost fx-btn--lg"
          onClick={() => resetTimer()}
          title="Sıfırla"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* KLİNİK SPOR BİLİMİ & EPOC MASTER REHBERİ */}
      <div className="fx-card fx-scienceGuideBox">
        <div className="fx-scienceHead">
          <Sparkles size={16} color="#c8ff00" />
          <b>BİLİMSEL TABATA PROTOKOLÜ &amp; EPOC ETKİSİ (TOKYO 1996)</b>
        </div>
        <div className="fx-scienceGrid">
          <div className="fx-scienceCol">
            <h4>🔬 Neden 4 Dakika 60 Dakikalık Koşudan Üstündür?</h4>
            <p>
              Tokyo Ulusal Fitness ve Spor Enstitüsü'nde Dr. Izumi Tabata tarafından elit sürat patencileri üzerinde yapılan deneyde, 
              <b> %170 VO2max</b> ile uygulanan 20s sprint / 10s dinlenme protokolü; 1 saatlik geleneksel orta tempo kardiyoya göre 
              <b> anaerobik kapasiteyi %28 artırmış</b> ve mitokondri yoğunluğunu ikiye katlamıştır.
            </p>
          </div>
          <div className="fx-scienceCol">
            <h4>🔥 EPOC (Afterburn) Etkisi Nedir?</h4>
            <p>
              Tabata seansında laktat eşiği aşıldığında vücut "Oksijen Borcu"na (EPOC) girer. Kalp ve akciğerler antrenman bittikten sonraki 
              <b> 24 ila 36 saat boyunca</b> bazal metabolizmayı yüksek tutarak dinlenir halde ek kalori ve yağ yakımını sürdürür.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
