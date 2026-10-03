import React from 'react';

export function SubsidenceRiskGauge({ score = 12 }) {
  const clampedScore = Math.min(100, Math.max(0, score));

  const needleAngle = -180 + (clampedScore / 100) * 180;

  let scoreColor = '#10b981';
  let riskLabel = 'LOW RISK';
  if (clampedScore > 70) {
    scoreColor = '#ef4444';
    riskLabel = 'CRITICAL FAILURE';
  } else if (clampedScore > 40) {
    scoreColor = '#f59e0b';
    riskLabel = 'SECONDARY CREEP';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.5rem 0' }}>
      <svg viewBox="0 0 220 130" style={{ width: '100%', maxWidth: '240px', overflow: 'visible' }}>
        <defs>
          
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#84cc16" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        
        
        <path
          d="M 35 100 A 75 75 0 0 1 185 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        
        <g 
          transform={`translate(110, 100) rotate(${needleAngle})`}
          style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          
          <line
            x1="0"
            y1="0"
            x2="66"
            y2="0"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          
          <circle cx="0" cy="0" r="7" fill="#0f172a" />
          <circle cx="0" cy="0" r="3" fill="#ffffff" />
        </g>
      </svg>

      
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
