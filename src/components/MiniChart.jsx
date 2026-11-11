import React, { useState } from 'react';

export default function MiniChart({
  rows = [],
  title,
  unit = '',
  color = '#b4f477'
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Take the last 12 points and parse numeric values
  const validData = (rows || [])
    .filter((r) => r && r.value !== undefined && r.value !== null && !isNaN(Number(r.value)))
    .slice(-12)
    .map((r) => ({
      day: r.day || '',
      value: Number(r.value)
    }));

  if (validData.length < 2) {
    return (
      <div className="miniChartCard">
        {title && <div className="miniChartTitle">{title}</div>}
        <div className="miniChartEmpty">
          <p>Grafik için en az iki farklı ölçüm kaydet.</p>
        </div>
      </div>
    );
  }

  const svgWidth = 600;
  const svgHeight = 190;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const values = validData.map((d) => d.value);
  let minVal = Math.min(...values);
  let maxVal = Math.max(...values);

  // If all values are identical, add slight margin
  if (minVal === maxVal) {
    minVal -= 1;
    maxVal += 1;
  }

  const valRange = maxVal - minVal;

  const points = validData.map((d, index) => {
    const x = paddingLeft + (index / (validData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minVal) / valRange) * chartHeight;
    return { ...d, x, y };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const startDate = validData[0]?.day;
  const endDate = validData[validData.length - 1]?.day;

  return (
    <div className="miniChartCard">
      <div className="miniChartHeader">
        {title && <span className="miniChartTitle">{title}</span>}
        <span className="miniChartRange">
          {minVal.toFixed(1)} {unit} → {maxVal.toFixed(1)} {unit}
        </span>
      </div>

      <div className="miniChartSvgWrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="miniChartSvg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon
            points={`
              ${points[0].x},${paddingTop + chartHeight}
              ${polylinePoints}
              ${points[points.length - 1].x},${paddingTop + chartHeight}
            `}
            fill="url(#chartGradient)"
          />

          {/* Sparkline stroke */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* Data points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint?.x === pt.x && hoveredPoint?.y === pt.y;
            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#ffffff' : color}
                  stroke="#121316"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'r 0.2s, fill 0.2s' }}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* Start and end date labels */}
          {startDate && (
            <text
              x={paddingLeft}
              y={svgHeight - 12}
              textAnchor="start"
              fill="#8e95a5"
              fontSize="12"
              fontFamily="inherit"
            >
              {startDate}
            </text>
          )}

          {endDate && (
            <text
              x={svgWidth - paddingRight}
              y={svgHeight - 12}
              textAnchor="end"
              fill="#8e95a5"
              fontSize="12"
              fontFamily="inherit"
            >
              {endDate}
            </text>
          )}

          {/* Tooltip on SVG */}
          {hoveredPoint && (
            <g
              transform={`translate(${Math.min(svgWidth - 90, Math.max(90, hoveredPoint.x))}, ${
                hoveredPoint.y - 25 < 20 ? hoveredPoint.y + 25 : hoveredPoint.y - 15
              })`}
            >
              <rect
                x="-55"
                y="-18"
                width="110"
                height="24"
                rx="6"
                fill="#1e2129"
                stroke="#323846"
                strokeWidth="1"
              />
              <text
                x="0"
                y="-3"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="600"
              >
                {hoveredPoint.day}: {hoveredPoint.value} {unit}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
