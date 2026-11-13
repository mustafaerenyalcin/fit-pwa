import React from 'react';

function detectAnimationType(name = '') {
  const n = (name || '').toLowerCase();
  if (/(jumping jack|burpee|high knee|cardio)/i.test(n)) return 'jacks';
  if (/(mountain climber|spiderman|plank|hollow)/i.test(n)) return 'plank';
  if (/(crunch|mekik|v-up|bicycle|russian twist|heel touch|leg raise|flutter|karın|abs)/i.test(n)) return 'crunch';
  if (/(glute bridge|hip thrust|superman|köprü|cobra)/i.test(n)) return 'bridge';
  if (/(dip)/i.test(n)) return 'dips';
  if (/(lunge|split squat)/i.test(n)) return 'lunge';
  if (/(squat|wall sit|calf|bacak|leg)/i.test(n)) return 'squat';
  if (/(push-up|push up|şınav|sinav|pseudo planche|archer|hindu|dive bomber)/i.test(n)) return 'pushup';
  if (/(row|curl|pull|barfiks|kürek|angel|y-t-w|biceps)/i.test(n)) return 'pull';
  if (/(press|raise|omuz|shoulder|göğüs|chest|bench)/i.test(n)) return 'press';
  return 'pushup';
}

export default function ExerciseVisual({ name = '', size = 'compact', muscle = '', tip = '' }) {
  const animType = detectAnimationType(name);
  const isStage = size === 'stage';

  return (
    <div
      className={`exerciseVisual fx-animStage fx-animStage--${size}`}
      title={name}
    >
      <div className="fx-animStageBadgeRow">
        <span className="fx-animLiveDot" />
        <span>LIVE FORM</span>
        {muscle && <span className="fx-animMuscleTag">{muscle}</span>}
      </div>

      <svg
        viewBox="0 0 180 120"
        className={`exerciseVisualSvg fx-animSvg fx-anim-${animType}`}
        width="100%"
        height={isStage ? 175 : 88}
        aria-label={`${name} animated demonstration`}
      >
        {/* Floor / Mat */}
        <line x1="16" y1="104" x2="164" y2="104" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />

        {animType === 'pushup' && (
          <g className="fx-fig-pushup">
            {/* Hands on floor */}
            <circle cx="52" cy="100" r="3.5" fill="#ff3b30" />
            <g className="fx-pushup-body">
              <circle cx="42" cy="64" r="9" fill="#007aff" />
              <line x1="48" y1="71" x2="128" y2="96" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" className="fx-bodyStroke" />
              {/* Highlighted Chest/Triceps */}
              <line x1="50" y1="72" x2="74" y2="80" stroke="#ff3b30" strokeWidth="8" strokeLinecap="round" />
              {/* Arm */}
              <polyline points="54,74 44,88 52,100" fill="none" stroke="#007aff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {/* Feet */}
            <polyline points="128,96 138,101" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" className="fx-bodyStroke" />
          </g>
        )}

        {animType === 'squat' && (
          <g className="fx-fig-squat">
            <g className="fx-squat-torso">
              <circle cx="84" cy="24" r="9" fill="#007aff" />
              <line x1="84" y1="33" x2="78" y2="64" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" className="fx-bodyStroke" />
              <polyline points="82,40 104,45 118,43" fill="none" stroke="#007aff" strokeWidth="5.5" strokeLinecap="round" />
            </g>
            {/* Highlighted Quads/Glutes */}
            <polyline points="78,64 102,74 88,101" fill="none" stroke="#ff3b30" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="fx-squat-legs" />
          </g>
        )}

        {animType === 'lunge' && (
          <g className="fx-fig-lunge">
            <circle cx="88" cy="24" r="9" fill="#007aff" />
            <line x1="88" y1="33" x2="88" y2="64" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" className="fx-bodyStroke" />
            <polyline points="88,64 114,72 114,101" fill="none" stroke="#ff3b30" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="88,64 62,84 52,101" fill="none" stroke="#007aff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {animType === 'crunch' && (
          <g className="fx-fig-crunch">
            {/* Mat */}
            <rect x="28" y="98" width="124" height="5" rx="2.5" fill="#007aff" fillOpacity="0.22" />
            {/* Bent Legs */}
            <polyline points="92,94 118,68 134,96" fill="none" stroke="#0f172a" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" className="fx-bodyStroke" />
            {/* Curling Torso + Abs Highlight */}
            <g className="fx-crunch-torso">
              <line x1="92" y1="94" x2="54" y2="76" stroke="#ff3b30" strokeWidth="7.5" strokeLinecap="round" />
              <circle cx="44" cy="68" r="9" fill="#007aff" />
              <polyline points="56,77 48,60" fill="none" stroke="#007aff" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {animType === 'plank' && (
          <g className="fx-fig-plank">
            <circle cx="40" cy="62" r="8.5" fill="#007aff" />
            <line x1="48" y1="68" x2="132" y2="86" stroke="#ff3b30" strokeWidth="7.5" strokeLinecap="round" />
            <polyline points="52,70 50,96 40,98" fill="none" stroke="#007aff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="132" y1="86" x2="142" y2="99" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" className="fx-bodyStroke" />
            {/* Animated knee drive */}
            <polyline points="116,84 94,88 104,99" fill="none" stroke="#007aff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" className="fx-plank-knee" />
          </g>
        )}

        {animType === 'jacks' && (
          <g className="fx-fig-jacks">
            <circle cx="90" cy="24" r="9" fill="#007aff" />
            <line x1="90" y1="33" x2="90" y2="66" stroke="#ff3b30" strokeWidth="7" strokeLinecap="round" />
            <g className="fx-jacks-arms">
              <polyline points="62,24 76,40 90,42 104,40 118,24" fill="none" stroke="#007aff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g className="fx-jacks-legs">
              <polyline points="72,101 84,78 90,66 96,78 108,101" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="fx-bodyStroke" />
            </g>
          </g>
        )}

        {animType === 'dips' && (
          <g className="fx-fig-dips">
            {/* Chair/Bench */}
            <rect x="30" y="68" width="26" height="34" rx="4" fill="#64748b" fillOpacity="0.35" />
            <g className="fx-dips-body">
              <circle cx="68" cy="36" r="8.5" fill="#007aff" />
              <line x1="68" y1="45" x2="68" y2="74" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" className="fx-bodyStroke" />
              <polyline points="68,50 52,60 52,68" fill="none" stroke="#ff3b30" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="68,74 108,82 120,101" fill="none" stroke="#007aff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        )}

        {animType === 'bridge' && (
          <g className="fx-fig-bridge">
            <circle cx="42" cy="88" r="8.5" fill="#007aff" />
            <g className="fx-bridge-hips">
              <polyline points="50,92 92,66 122,96" fill="none" stroke="#ff3b30" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <line x1="122" y1="96" x2="132" y2="100" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" className="fx-bodyStroke" />
          </g>
        )}

        {(animType === 'press' || animType === 'pull') && (
          <g className="fx-fig-press">
            <circle cx="90" cy="26" r="9" fill="#007aff" />
            <line x1="90" y1="35" x2="90" y2="68" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" className="fx-bodyStroke" />
            <g className="fx-press-arms">
              <polyline points="60,28 74,44 90,46 106,44 120,28" fill="none" stroke="#ff3b30" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="48" y1="26" x2="132" y2="26" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
            </g>
            <polyline points="76,101 86,78 90,68 94,78 104,101" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="fx-bodyStroke" />
          </g>
        )}
      </svg>

      {isStage && tip && (
        <p className="fx-animStageTip">💡 {tip}</p>
      )}
    </div>
  );
}
