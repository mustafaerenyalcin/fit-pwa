import React from 'react';

function getCategory(name = '') {
  const n = (name || '').toLowerCase();
  if (/(squat|bacak|deadlift|lunge|calf|quad|hamstring|leg|hip|glute|basen|baldır)/i.test(n)) {
    return 'lower';
  }
  if (/(plank|core|karın|karin|abs|mekik|crunch|twist|hollow|köprü|bridge)/i.test(n)) {
    return 'core';
  }
  if (/(pull|çekiş|cekis|barfiks|row|kürek|kurek|lat|biceps|curl|chin)/i.test(n)) {
    return 'pull';
  }
  if (/(push|itiş|itis|bench|göğüs|gogus|chest|omuz|shoulder|triceps|şınav|sinav|dip|press)/i.test(n)) {
    return 'push';
  }
  return 'push';
}

export default function ExerciseVisual({ name = '' }) {
  const category = getCategory(name);

  return (
    <div className="exerciseVisual" title={`${name} (${category})`}>
      <svg
        viewBox="0 0 100 100"
        className="exerciseVisualSvg"
        width="100%"
        height="100%"
      >
        {category === 'push' && (
          // Overhead push / arms up stick figure
          <g stroke="#b3f46f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Head */}
            <circle cx="50" cy="22" r="7" fill="#b3f46f" stroke="none" />
            {/* Spine */}
            <line x1="50" y1="29" x2="50" y2="58" />
            {/* Arms overhead/push */}
            <polyline points="28,24 38,36 50,38 62,36 72,24" />
            {/* Barbell / weight line */}
            <line x1="20" y1="20" x2="80" y2="20" stroke="#8e95a5" strokeWidth="2.5" />
            <circle cx="20" cy="20" r="3" fill="#8e95a5" stroke="none" />
            <circle cx="80" cy="20" r="3" fill="#8e95a5" stroke="none" />
            {/* Legs */}
            <polyline points="34,84 46,65 50,58 54,65 66,84" />
          </g>
        )}

        {category === 'pull' && (
          // Pulling / rowing stick figure
          <g stroke="#b3f46f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Overhead bar */}
            <line x1="20" y1="16" x2="80" y2="16" stroke="#8e95a5" strokeWidth="2.5" />
            {/* Head */}
            <circle cx="50" cy="30" r="7" fill="#b3f46f" stroke="none" />
            {/* Torso */}
            <line x1="50" y1="37" x2="50" y2="62" />
            {/* Arms gripping bar */}
            <polyline points="28,18 36,32 50,42 64,32 72,18" />
            {/* Legs */}
            <polyline points="40,84 46,68 50,62 54,68 60,84" />
          </g>
        )}

        {category === 'lower' && (
          // Squat position
          <g stroke="#b3f46f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Head */}
            <circle cx="44" cy="24" r="7" fill="#b3f46f" stroke="none" />
            {/* Torso leaned slightly */}
            <line x1="44" y1="31" x2="38" y2="54" />
            {/* Arms forward for balance */}
            <polyline points="38,38 52,42 66,42" />
            {/* Thigh (horizontal-ish) */}
            <polyline points="38,54 58,56 48,82" />
            {/* Ground line */}
            <line x1="30" y1="84" x2="70" y2="84" stroke="#4a5264" strokeWidth="2" />
          </g>
        )}

        {category === 'core' && (
          // Plank position
          <g stroke="#b3f46f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Head */}
            <circle cx="26" cy="42" r="7" fill="#b3f46f" stroke="none" />
            {/* Straight body line */}
            <line x1="32" y1="46" x2="76" y2="58" />
            {/* Forearm supporting plank */}
            <polyline points="38,48 40,68 32,68" />
            {/* Feet touching ground */}
            <polyline points="76,58 78,68 82,68" />
            {/* Floor mat */}
            <line x1="20" y1="70" x2="88" y2="70" stroke="#4a5264" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}
