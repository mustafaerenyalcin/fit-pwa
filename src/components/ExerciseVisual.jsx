import React, { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { resolveExerciseMedia } from '../lib/exerciseMedia.js';

const PING_PONG_SEQUENCE = [1, 2, 3, 2];

export default function ExerciseVisual({ name = '', size = 'compact', muscle = '', tip = '' }) {
  const media = resolveExerciseMedia(name);
  const [seqIndex, setSeqIndex] = useState(0);
  const [manualFrame, setManualFrame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    setSeqIndex(0);
    setManualFrame(null);
    setIsPlaying(true);
  }, [name]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = window.setInterval(() => {
      setSeqIndex((prev) => (prev + 1) % PING_PONG_SEQUENCE.length);
    }, size === 'stage' ? 850 : 1000);
    return () => window.clearInterval(id);
  }, [isPlaying, size]);

  const activeFrame = isPlaying ? PING_PONG_SEQUENCE[seqIndex] : (manualFrame ?? 1);
  const isCompact = size === 'compact';

  const selectFrame = (targetFrame) => {
    setIsPlaying(false);
    setManualFrame(targetFrame);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => {
      if (prev) {
        setManualFrame(activeFrame);
        return false;
      }
      setManualFrame(null);
      return true;
    });
  };

  const primaryMuscleLabel = muscle || media.primaryMuscleTr || 'Tüm Vücut';

  return (
    <div className={`fx-animStage fx-animStage--${size}`}>
      <div className="fx-animStageBadgeRow">
        <span className={`fx-animLiveDot ${isPlaying ? '' : 'paused'}`} aria-hidden="true" />
        <span>{isPlaying ? '3-FAZ VEKTÖR REHBERİ' : `FAZ ${activeFrame} / 3`}</span>
        <div className="fx-animMetaTags">
          {media.equipmentTr && (
            <span className="fx-animEquipTag">{media.equipmentTr}</span>
          )}
          <span className="fx-animMuscleTag">{primaryMuscleLabel}</span>
        </div>
      </div>

      <div className={`fx-photoPlayer ${isCompact ? 'is-compact' : 'is-stage'}`}>
        <div className="fx-studioFloor" aria-hidden="true" />

        <img
          src={media.frame1}
          alt={`${media.label || name} - Başlangıç pozisyonu`}
          className={`fx-photoFrame ${activeFrame === 1 ? 'visible' : ''}`}
          loading="eager"
          decoding="async"
        />
        <img
          src={media.frame2}
          alt={`${media.label || name} - Orta hareket fazı`}
          className={`fx-photoFrame ${activeFrame === 2 ? 'visible' : ''}`}
          loading="eager"
          decoding="async"
        />
        <img
          src={media.frame3}
          alt={`${media.label || name} - Zirve sıkıştırma`}
          className={`fx-photoFrame ${activeFrame === 3 ? 'visible' : ''}`}
          loading="eager"
          decoding="async"
        />

        <div className="fx-photoControlsRow">
          <div className="fx-frameSwitchGroup" role="group" aria-label="Hareket fazı seçimi">
            <button
              type="button"
              className={`fx-frameBtn ${activeFrame === 1 ? 'active' : ''}`}
              onClick={() => selectFrame(1)}
            >
              {isCompact ? '1' : '1. Başlangıç'}
            </button>
            <button
              type="button"
              className={`fx-frameBtn ${activeFrame === 2 ? 'active' : ''}`}
              onClick={() => selectFrame(2)}
            >
              {isCompact ? '2' : '2. Orta'}
            </button>
            <button
              type="button"
              className={`fx-frameBtn ${activeFrame === 3 ? 'active' : ''}`}
              onClick={() => selectFrame(3)}
            >
              {isCompact ? '3' : '3. Zirve'}
            </button>
          </div>

          <button
            type="button"
            className="fx-playPauseBtn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Animasyonu duraklat' : 'Animasyonu oynat'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Duraklat' : 'Oynat'}</span>
          </button>
        </div>
      </div>

      <div className="fx-animPoseSub">
        <strong>{media.label || name}</strong>
        {media.secondaryMusclesTr ? (
          <span className="fx-animSecondaryLabel"> · Destek: {media.secondaryMusclesTr}</span>
        ) : null}
      </div>

      <div className={`fx-animStepGuide ${isCompact ? 'is-compact-guide' : ''}`}>
        <button
          type="button"
          className={`fx-animStepPill ${activeFrame === 1 ? 'active-step' : ''}`}
          onClick={() => selectFrame(1)}
        >
          <strong>1. Başlangıç</strong>
          <span>{media.step1}</span>
        </button>
        <button
          type="button"
          className={`fx-animStepPill ${activeFrame === 2 ? 'active-step' : ''}`}
          onClick={() => selectFrame(2)}
        >
          <strong>2. Orta Faz</strong>
          <span>{media.step2}</span>
        </button>
        <button
          type="button"
          className={`fx-animStepPill ${activeFrame === 3 ? 'active-step' : ''}`}
          onClick={() => selectFrame(3)}
        >
          <strong>3. Zirve / Sıkma</strong>
          <span>{media.step3}</span>
        </button>
      </div>

      {tip && (
        <p className="fx-animStageTip">{tip}</p>
      )}
    </div>
  );
}
