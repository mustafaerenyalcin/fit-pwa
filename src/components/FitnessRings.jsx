import React from 'react';
import { Dumbbell, Utensils, Droplets } from 'lucide-react';

/**
 * Apple Fitness Style Concentric Progress Rings
 * Ring 1 (Outer): Workouts this week (Weekly 5-day goal)
 * Ring 2 (Middle): Daily Protein target
 * Ring 3 (Inner): Daily Water target
 */
export default function FitnessRings({
  workoutDone = 0,
  workoutTarget = 5,
  proteinCurrent = 0,
  proteinTarget = 140,
  waterCurrent = 0,
  waterTarget = 2500
}) {
  const size = 160;
  const center = size / 2;

  // Ring configurations: radius and stroke width
  const rings = [
    {
      id: 'workout',
      label: 'Antrenman',
      color: '#ff4d1c',
      bgColor: 'rgba(255, 77, 28, 0.16)',
      radius: 66,
      stroke: 12,
      current: workoutDone,
      target: workoutTarget,
      unit: 'gün'
    },
    {
      id: 'protein',
      label: 'Protein',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.16)',
      radius: 51,
      stroke: 12,
      current: proteinCurrent,
      target: proteinTarget,
      unit: 'g'
    },
    {
      id: 'water',
      label: 'Su',
      color: '#58a6ff',
      bgColor: '#16283b',
      radius: 36,
      stroke: 12,
      current: waterCurrent,
      target: waterTarget,
      unit: 'ml'
    }
  ];

  return (
    <div className="fitnessRingsCard">
      <div className="ringsSvgWrapper">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {rings.map((ring) => {
            const circumference = 2 * Math.PI * ring.radius;
            const pct = Math.min(1, Math.max(0, ring.target > 0 ? ring.current / ring.target : 0));
            const strokeDashoffset = circumference - pct * circumference;

            return (
              <g key={ring.id}>
                {/* Background Ring */}
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  fill="none"
                  stroke={ring.bgColor}
                  strokeWidth={ring.stroke}
                />
                {/* Progress Ring with Round Caps */}
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={ring.stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="ringsLegend">
        <div className="ringLegendItem">
          <span className="ringDot" style={{ background: '#ff4d1c' }} />
          <div className="legendText">
            <small>Antrenman (Haftalık)</small>
            <b>{workoutDone} / {workoutTarget} gün</b>
          </div>
        </div>

        <div className="ringLegendItem">
          <span className="ringDot" style={{ background: '#10b981' }} />
          <div className="legendText">
            <small>Protein (Bugün)</small>
            <b>{proteinCurrent} / {proteinTarget} g</b>
          </div>
        </div>

        <div className="ringLegendItem">
          <span className="ringDot" style={{ background: '#58a6ff' }} />
          <div className="legendText">
            <small>Su (Bugün)</small>
            <b>{waterCurrent} / {waterTarget} ml</b>
          </div>
        </div>
      </div>
    </div>
  );
}
