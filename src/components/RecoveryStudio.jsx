import React, { useState, useEffect } from 'react';
import { Wind, Activity, Play, Square, RotateCcw } from 'lucide-react';
import { Card } from './ui.jsx';
import { sounds } from '../lib/audio.js';

const MOBILITY_STEPS = [
  { title: 'Omuz Daireleri (Öne & Arkaya)', sec: 30, tip: 'Kollar yanda, omuz eklemini kontrollü geniş dairelerle ısıt.' },
  { title: 'Scapular Push-up (Kürek Kemiği Aktivasyonu)', sec: 35, tip: 'Şınav pozisyonunda dirsekleri bükmeden kürek kemiklerini yaklaştırıp uzaklaştır.' },
  { title: 'Thoracic Rotation (Üst Sırt Rotasyonu)', sec: 40, tip: 'Emekleme pozisyonunda bir elini ensene koy, dirseğini tavana doğru aç.' },
  { title: 'Band / Havlu Dislocates & Y-Raise', sec: 35, tip: 'Rotator cuff kaslarını ağırlık altına girmeden önce kanlandır.' },
  { title: 'Deep Squat Hold & Kalça Açıcı', sec: 40, tip: 'Derin çömelme pozisyonunda dirseklerinle dizlerini hafifçe dışa it, göğsü dik tut.' }
];

export default function RecoveryStudio() {
  const [mode, setMode] = useState('mobility'); // 'mobility' | 'breath'
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MOBILITY_STEPS[0].sec);

  // 4-7-8 Nefes durumu
  const [breathTick, setBreathTick] = useState(0);

  useEffect(() => {
    if (!running || mode !== 'mobility') return;
    const t = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          sounds.beep?.();
          if (stepIdx < MOBILITY_STEPS.length - 1) {
            const nextIdx = stepIdx + 1;
            setStepIdx(nextIdx);
            return MOBILITY_STEPS[nextIdx].sec;
          } else {
            setRunning(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, mode, stepIdx]);

  useEffect(() => {
    if (!running || mode !== 'breath') return;
    const t = setInterval(() => {
      setBreathTick((p) => (p + 1) % 19);
    }, 1000);
    return () => clearInterval(t);
  }, [running, mode]);

  const currentMobility = MOBILITY_STEPS[stepIdx] || MOBILITY_STEPS[0];

  // 4 sn Nefes Al (0..3), 7 sn Tut (4..10), 8 sn Ver (11..18)
  let breathPhase = 'Hazır';
  let breathSub = 'Başlat düğmesine dokun ve halkayı takip et';
  let breathScale = 1;
  if (running && mode === 'breath') {
    if (breathTick < 4) {
      breathPhase = `Burundan Nefes Al (${4 - breathTick})`;
      breathSub = 'Diyaframını doldur…';
      breathScale = 1.28;
    } else if (breathTick < 11) {
      breathPhase = `Nefesini Tut (${11 - breathTick})`;
      breathSub = 'Oksijen kaslarına dağılıyor…';
      breathScale = 1.28;
    } else {
      breathPhase = `Ağızdan Yavaşça Ver (${19 - breathTick})`;
      breathSub = 'Nabzın ve kortizol seviyen düşüyor…';
      breathScale = 0.88;
    }
  }

  return (
    <Card
      title="Mobilite & Toparlanma Stüdyosu"
      subtitle="Antrenman öncesi 3 dk eklem ısınması veya antrenman sonrası sinir sistemi sıfırlama"
      action={
        <div className="fx-btnRow">
          <button
            type="button"
            className={`fx-chip ${mode === 'mobility' ? 'active' : ''}`}
            onClick={() => {
              setRunning(false);
              setMode('mobility');
              setStepIdx(0);
              setSecondsLeft(MOBILITY_STEPS[0].sec);
            }}
          >
            <Activity size={14} /> 3 Dk Isınma
          </button>
          <button
            type="button"
            className={`fx-chip ${mode === 'breath' ? 'active' : ''}`}
            onClick={() => {
              setRunning(false);
              setMode('breath');
              setBreathTick(0);
            }}
          >
            <Wind size={14} /> 4-7-8 Nefes
          </button>
        </div>
      }
    >
      {mode === 'mobility' ? (
        <div className="fx-studioBox">
          <div className="fx-studioTimer">
            <b>{secondsLeft}s</b>
            <small>
              Adım {stepIdx + 1}/{MOBILITY_STEPS.length}
            </small>
          </div>
          <div className="fx-studioInfo">
            <h4>{currentMobility.title}</h4>
            <p className="fx-muted fx-small">{currentMobility.tip}</p>
            <div className="fx-btnRow" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="fx-btn fx-btn--primary fx-btn--sm"
                onClick={() => setRunning((r) => !r)}
              >
                {running ? <Square size={14} /> : <Play size={14} fill="currentColor" />}
                {running ? 'Duraklat' : 'Isınmayı Başlat'}
              </button>
              <button
                type="button"
                className="fx-btn fx-btn--ghost fx-btn--sm"
                onClick={() => {
                  setRunning(false);
                  setStepIdx(0);
                  setSecondsLeft(MOBILITY_STEPS[0].sec);
                }}
              >
                <RotateCcw size={14} /> Sıfırla
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="fx-breathBox">
          <div
            className="fx-breathOrb"
            style={{
              transform: `scale(${breathScale})`
            }}
          >
            <b>{breathPhase}</b>
          </div>
          <p className="fx-muted fx-small" style={{ margin: '14px 0 10px' }}>
            {breathSub}
          </p>
          <button
            type="button"
            className="fx-btn fx-btn--primary fx-btn--sm"
            onClick={() => {
              setBreathTick(0);
              setRunning((r) => !r);
            }}
          >
            {running ? <Square size={14} /> : <Play size={14} fill="currentColor" />}
            {running ? 'Seansı Bitir' : 'Nefes Seansını Başlat'}
          </button>
        </div>
      )}
    </Card>
  );
}
