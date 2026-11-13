import React, { useState, useEffect, useRef } from 'react';
import { TimerReset, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

export default function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef(null);

  // Play audio alert via Web Audio API
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, soundEnabled]);

  const toggleRun = () => {
    if (timeLeft === 0) {
      setTimeLeft(duration);
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handleDurationChange = (e) => {
    const val = Number(e.target.value);
    setDuration(val);
    setTimeLeft(val);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.max(0, Math.min(100, ((duration - timeLeft) / duration) * 100));

  return (
    <div className={`restTimerCard fx-restStudioBar ${isRunning ? 'active' : ''}`}>
      <div className="restTimerHeader">
        <div className="restTimerTitle">
          <TimerReset size={16} className="timerIcon" />
          <span>Dinlenme Sayacı</span>
        </div>

        <div className="restTimerSettings">
          <button
            type="button"
            className="soundToggleBtn"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            aria-label="Ses Ayarı"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <select
            className="restTimerSelect"
            value={duration}
            onChange={handleDurationChange}
            aria-label="Süre seçin"
          >
            <option value={60}>60 sn</option>
            <option value={90}>90 sn</option>
            <option value={120}>120 sn</option>
            <option value={180}>180 sn</option>
          </select>
        </div>
      </div>

      <div className="fx-restStudioMainRow">
        <div className="restTimerDisplay">
          <span className="restTimerDigits">{formattedTime}</span>
        </div>

        <div className="restTimerProgressBar">
          <div
            className="restTimerProgressFill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="restTimerActions">
          <button
            type="button"
            className={`timerBtn primary ${isRunning ? 'pause' : 'play'}`}
            onClick={toggleRun}
            aria-label={isRunning ? 'Durdur' : 'Başlat'}
          >
            {isRunning ? <Pause size={15} /> : <Play size={15} />}
            <span>{isRunning ? 'Durdur' : timeLeft === 0 ? 'Yeniden Başlat' : 'Başlat'}</span>
          </button>

          <button
            type="button"
            className="timerBtn secondary"
            onClick={handleReset}
            aria-label="Sıfırla"
            title="Sıfırla"
          >
            <RotateCcw size={14} />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
