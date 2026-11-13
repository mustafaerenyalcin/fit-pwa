import React, { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { resolveExerciseMedia } from '../lib/exerciseMedia.js';

export default function ExerciseVisual({ name = '', size = 'compact', muscle = '', tip = '' }) {
  const media = resolveExerciseMedia(name);
  const isStage = size === 'stage';
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    setFrame(0);
    setPlaying(true);
  }, [name]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, 1250);
    return () => clearInterval(id);
  }, [playing, name]);

  return (
    <div
      className={`exerciseVisual fx-animStage fx-animStage--${size}`}
      title={name}
    >
      <div className="fx-animStageBadgeRow">
        <span className={`fx-animLiveDot ${playing ? 'playing' : 'paused'}`} />
        <span>{playing ? 'CANLI GÖSTERİM' : 'DURAKLATILDI'}</span>
        <span className="fx-animPoseSub">{media.label}</span>
        {muscle && <span className="fx-animMuscleTag">{muscle}</span>}
      </div>

      {/* Real 2-Frame Photo Sequence Player (Zero Stick Figures) */}
      <div className={`fx-photoPlayer ${isStage ? 'is-stage' : 'is-compact'}`}>
        <img
          src={media.frame0}
          alt={`${name} başlangıç pozisyonu`}
          className="fx-photoFrame is-base visible"
          loading="eager"
          decoding="sync"
        />
        <img
          src={media.frame1}
          alt={`${name} bitiş pozisyonu`}
          className={`fx-photoFrame is-overlay ${frame === 1 ? 'visible' : ''}`}
          loading="eager"
          decoding="sync"
        />

        {/* Overlay Phase Pill & Controls */}
        <div className="fx-photoControlsRow">
          <div className="fx-frameSwitchGroup">
            <button
              type="button"
              className={`fx-frameBtn ${frame === 0 ? 'active' : ''}`}
              onClick={() => {
                setPlaying(false);
                setFrame(0);
              }}
            >
              1. Başlangıç
            </button>
            <button
              type="button"
              className={`fx-frameBtn ${frame === 1 ? 'active' : ''}`}
              onClick={() => {
                setPlaying(false);
                setFrame(1);
              }}
            >
              2. Bitiş
            </button>
          </div>

          <button
            type="button"
            className="fx-playPauseBtn"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Duraklat' : 'Oynat'}
          >
            {playing ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
            <span>{playing ? 'Duraklat' : 'Oynat'}</span>
          </button>
        </div>
      </div>

      {isStage && (
        <div className="fx-animStepGuide">
          <div className={`fx-animStepPill ${frame === 0 ? 'active-step' : ''}`}>
            <strong>1. Başlangıç Pozisyonu</strong>
            <span>{media.step1}</span>
          </div>
          <div className={`fx-animStepPill ${frame === 1 ? 'active-step' : ''}`}>
            <strong>2. Hareket / Tepe Noktası</strong>
            <span>{media.step2}</span>
          </div>
        </div>
      )}

      {isStage && tip && (
        <p className="fx-animStageTip">💡 {tip}</p>
      )}
    </div>
  );
}
