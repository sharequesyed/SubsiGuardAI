import React from 'react';

/**
 * Semicircular Subsidence Risk Speedometer Gauge
 * Built to exactly match the requested design:
 * Semicircular gradient arc (Green -> Orange -> Red),
 * Center needle pointing to the value,
 * Large bold score (e.g. 100 / 100),
 * Bottom label "SUBSIDENCE RISK".
 */
export function SubsidenceRiskGauge({ score = 12 }) {
  // Score clamped between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score));

  // Needle angle: from -180 deg (0) to 0 deg (100) or from 180 to 0
  // Standard SVG semi-circle: 180 deg span.
  // Angle = -180 + (clampedScore / 100) * 180
  const needleAngle = -180 + (clampedScore / 100) * 180;

  // Determine score color
  let scoreColor = '#10b981'; // Green
  let riskLabel = 'LOW RISK';
  if (clampedScore > 70) {
    scoreColor = '#ef4444'; // Red
    riskLabel = 'CRITICAL FAILURE';
  } else if (clampedScore > 40) {
    scoreColor = '#f59e0b'; // Orange
    riskLabel = 'SECONDARY CREEP';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.5rem 0' }}>
      <svg viewBox="0 0 220 130" style={{ width: '100%', maxWidth: '240px', overflow: 'visible' }}>
        <defs>
          {/* Smooth Semicircular Gradient from Green -> Orange -> Red */}
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#84cc16" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Semi-circular Track Arc: radius = 75, center = (110, 100) */}
        {/* Arc from (35, 100) to (185, 100) */}
        <path
          d="M 35 100 A 75 75 0 0 1 185 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Needle Pivot Center at (110, 100) */}
        <g 
          transform={`translate(110, 100) rotate(${needleAngle})`}
          style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {/* Needle Line */}
          <line
            x1="0"
            y1="0"
            x2="66"
            y2="0"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Center Pivot Circle */}
          <circle cx="0" cy="0" r="7" fill="#0f172a" />
          <circle cx="0" cy="0" r="3" fill="#ffffff" />
        </g>
      </svg>

      {/* Score Text display */}
      <div style={{ textAlign: 'center', marginTop: '-15px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '2px' }}>
          <span 
            style={{ 
              fontSize: '2rem', 
              fontWeight: 900, 
              fontFamily: 'var(--font-heading)',
              color: scoreColor,
              lineHeight: 1
            }}
          >
            {clampedScore}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            /100
          </span>
        </div>

        {/* Bottom Label */}
        <div 
          style={{ 
            fontSize: '0.82rem', 
            fontWeight: 800, 
            letterSpacing: '0.08em', 
            color: 'var(--text-primary)',
            marginTop: '4px',
            textTransform: 'uppercase'
          }}
        >
          SUBSIDENCE RISK
        </div>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: scoreColor, marginTop: '2px' }}>
          {riskLabel}
        </div>
      </div>
    </div>
  );
}
