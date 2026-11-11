import React from 'react';

export default function Metric({ label, value, extra, icon: Icon }) {
  return (
    <div className="metric">
      {Icon && (
        <div className="metricIcon">
          <Icon size={19} />
        </div>
      )}
      <div className="metricLabel">{label}</div>
      <strong>{value}</strong>
      {extra && <span>{extra}</span>}
    </div>
  );
}
