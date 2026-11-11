import React from 'react';

export default function ProgressBar({ current = 0, target = 1, color = '#aef16b' }) {
  const safeTarget = target > 0 ? target : 1;
  const pct = Math.max(0, Math.min(100, (current / safeTarget) * 100));
  return (
    <div className="bar">
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
