import React, { useState, useMemo } from 'react';
import { 
  BrainCircuit, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Settings2, 
  ShieldAlert, 
  CheckCircle, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { calculateKnotheProfile } from '../utils/geotechMath';

export function AIPredictiveCenter({ 
  activeMine, 
  currentScenario, 
  ttfData, 
  severityIndex,
  telemetryStream 
}) {
  // Interactive Strata sliders
  const [depthH, setDepthH] = useState(activeMine.depthH);
  const [thicknessM, setThicknessM] = useState(activeMine.thicknessM);
  const [angleOfDraw, setAngleOfDraw] = useState(activeMine.angleOfDraw);
  const [subsidenceFactor, setSubsidenceFactor] = useState(0.72);

  // Compute theoretical Knothe profile points across -150m to +150m
  const profilePoints = useMemo(() => {
    const points = [];
    for (let x = -150; x <= 150; x += 10) {
      const res = calculateKnotheProfile(x, depthH, thicknessM, angleOfDraw, subsidenceFactor);
      points.push({ x, ...res });
    }
    return points;
  }, [depthH, thicknessM, angleOfDraw, subsidenceFactor]);

  const maxSubsidence = Math.round(subsidenceFactor * thicknessM * 1000);
  const betaRad = ((90 - angleOfDraw) * Math.PI) / 180;
  const radiusR = Math.round(depthH / Math.tan(betaRad));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner: Physics-Informed ML + Knothe Theory */}
      <div className="innovation-banner">
        <div className="innovation-banner-text">
          <h4>
            <BrainCircuit size={18} />
            Physics-Informed Neural Network (PINN) + Knothe Geotechnical Engine
          </h4>
          <p>
            Combines CIMFR-calibrated <strong>Knothe Subsidence Influence Function</strong> with real-time <strong>Saito Creep Acceleration ($d^2\theta/dt^2$)</strong> for high-precision Time-To-Failure (TTF) forecasting.
          </p>
        </div>
        <span className="badge badge-safe">MODEL CONFIDENCE: {ttfData.confidence}%</span>
      </div>

      {/* AI Metrics Grid */}
      <div className="grid-3col">
        {/* Card 1: Time-To-Failure (TTF) */}
        <div className="card" style={{ borderTop: ttfData.isAccelerating ? '4px solid #ef4444' : '4px solid var(--brand-primary)' }}>
          <div className="card-header">
            <div>
              <div className="stat-label">Predicted Time-To-Failure (TTF)</div>
              <h3 className="stat-val" style={{ color: ttfData.isAccelerating ? '#ef4444' : 'var(--text-primary)' }}>
                {ttfData.displayStr || (ttfData.ttfHours ? `${ttfData.ttfHours} Hours` : 'STABLE (No Failure)')}
              </h3>
            </div>
            <Clock size={24} style={{ color: ttfData.isAccelerating ? '#ef4444' : 'var(--brand-primary)' }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Strata Creep State:</strong> {ttfData.stage}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Calculated using the Fukuzono Inverse Velocity method ($1/v \rightarrow 0$) from live tilt velocity.
          </div>
        </div>

        {/* Card 2: Subsidence Severity Index */}
        <div className="card" style={{ borderTop: severityIndex > 70 ? '4px solid #ef4444' : (severityIndex > 40 ? '4px solid #f59e0b' : '4px solid #10b981') }}>
          <div className="card-header">
            <div>
              <div className="stat-label">Subsidence Risk Index (SRI)</div>
              <h3 className="stat-val" style={{ color: severityIndex > 70 ? '#ef4444' : (severityIndex > 40 ? '#f59e0b' : '#10b981') }}>
                {severityIndex} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
              </h3>
            </div>
            <ShieldAlert size={24} style={{ color: severityIndex > 70 ? '#ef4444' : '#10b981' }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>DGMS Hazard Category:</strong> {severityIndex > 70 ? 'RED (Imminent Breach)' : (severityIndex > 40 ? 'ORANGE (Active Watch)' : 'GREEN (Permissible Limits)')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Cross-checks tilt (&gt;10 mm/m) and strain (&gt;5.0 mm/m) against DGMS circular regulations.
          </div>
        </div>

        {/* Card 3: Knothe Trough Parameters */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="stat-label">Calculated Knothe Trough</div>
              <h3 className="stat-val">
                {maxSubsidence} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>mm (S_max)</span>
              </h3>
            </div>
            <TrendingUp size={24} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Radius of Influence (R):</strong> {radiusR} meters
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Surface subsidence trough span derived from Barakar sandstone angle of draw ({angleOfDraw}°).
          </div>
        </div>
      </div>

      {/* Main Knothe Profile vs Live Sensor Cross-Section Chart */}
      <div className="grid-2col">
        {/* Profile Chart Canvas */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={16} />
                Knothe Theoretical Subsidence Trough vs Live Mesh Data
              </h3>
              <div className="card-desc">Cross-section profile above the underground longwall extraction panel</div>
            </div>
            <span className="badge badge-safe">
              LIVE MODEL: {new Date().toLocaleTimeString('en-GB')} IST
            </span>
          </div>

          <div style={{ position: 'relative', height: '280px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1.25rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%' }}>
              {/* Axes and Grid */}
              <line x1="50" y1="30" x2="380" y2="30" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3, 3" />
              <text x="50" y="24" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">Original Surface Datum (0 mm)</text>
              <line x1="50" y1="105" x2="380" y2="105" stroke="rgba(100, 116, 139, 0.15)" strokeWidth="1" />
              <text x="15" y="108" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">-{(maxSubsidence / 2).toFixed(0)}mm</text>
              <line x1="50" y1="180" x2="380" y2="180" stroke="rgba(100, 116, 139, 0.15)" strokeWidth="1" />
              <text x="10" y="184" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">-{maxSubsidence}mm</text>

              {/* Vertical Center Axis */}
              <line x1="215" y1="30" x2="215" y2="190" stroke="rgba(2, 132, 199, 0.2)" strokeWidth="1" strokeDasharray="4, 4" />
              <text x="215" y="202" fill="var(--brand-primary)" fontSize="8.5" textAnchor="middle" fontFamily="var(--font-mono)">0m (Center)</text>

              {/* Knothe Theoretical S(x) Curve */}
              <path 
                d={profilePoints.map((p, i) => {
                  const svgX = 50 + ((p.x + 150) / 300) * 330;
                  const svgY = 30 + (p.subsidence / maxSubsidence) * 150;
                  return `${i === 0 ? 'M' : 'L'} ${svgX} ${svgY}`;
                }).join(' ')}
                fill="none"
                stroke="var(--brand-primary)"
                strokeWidth="2.5"
              />

              {/* Observed Live Node Point */}
              {(() => {
                const liveSubMm = Math.min(maxSubsidence, Math.round(Math.abs((telemetryStream.tiltX ?? 0) * 2200)));
                const liveY = 30 + (liveSubMm / maxSubsidence) * 150;
                return (
                  <g>
                    <circle cx="215" cy={liveY} r="5.5" fill="#ef4444" stroke="#ffffff" strokeWidth="2">
                      <animate attributeName="r" values="4.5;7.5;4.5" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <rect x="230" y={Math.max(40, liveY - 18)} width="145" height="28" rx="4" fill="var(--bg-card)" stroke="#ef4444" strokeWidth="1" />
                    <text x="238" y={Math.max(40, liveY - 18) + 12} fill="#ef4444" fontSize="8.5" fontWeight="700">
                      Node N05 Live: {telemetryStream.tiltX !== null && telemetryStream.tiltX !== undefined ? `${liveSubMm} mm` : 'Standby'}
                    </text>
                    <text x="238" y={Math.max(40, liveY - 18) + 23} fill="var(--text-muted)" fontSize="7.5">
                      Tilt: {telemetryStream.tiltX !== null && telemetryStream.tiltX !== undefined ? `${telemetryStream.tiltX}° (Pitch)` : 'Standby'}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '50px', paddingRight: '20px' }}>
            <span>-150m (Stable Bedrock)</span>
            <span>-75m (Inflexion)</span>
            <span>0m (Trough Center)</span>
            <span>+75m</span>
            <span>+150m (Boundary)</span>
          </div>
        </div>

        {/* Interactive Strata Setting Sliders */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Settings2 size={16} />
                Mine Geological Strata Calibration Parameters
              </h3>
              <div className="card-desc">Fine-tune geotechnical parameters for any Indian coal seam</div>
            </div>
            <button 
              className="btn-secondary" 
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
              onClick={() => {
                setDepthH(activeMine.depthH);
                setThicknessM(activeMine.thicknessM);
                setAngleOfDraw(activeMine.angleOfDraw);
                setSubsidenceFactor(0.72);
              }}
            >
              Reset Defaults
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8rem' }}>
            {/* Slider 1: Depth H */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Seam Depth below Surface (H):</span>
                <strong>{depthH} meters</strong>
              </div>
              <input 
                type="range" 
                min="80" 
                max="350" 
                step="5" 
                value={depthH} 
                onChange={(e) => setDepthH(+e.target.value)}
                style={{ width: '100%', cursor: 'pointer' }} 
              />
            </div>

            {/* Slider 2: Thickness M */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Extracted Coal Seam Thickness (M):</span>
                <strong>{thicknessM} meters</strong>
              </div>
              <input 
                type="range" 
                min="2.0" 
                max="8.5" 
                step="0.1" 
                value={thicknessM} 
                onChange={(e) => setThicknessM(+e.target.value)}
                style={{ width: '100%', cursor: 'pointer' }} 
              />
            </div>

            {/* Slider 3: Angle of Draw */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Angle of Draw (&gamma; - Barakar Sandstone):</span>
                <strong>{angleOfDraw}° (Indian Average: 18°-25°)</strong>
              </div>
              <input 
                type="range" 
                min="15" 
                max="32" 
                step="1" 
                value={angleOfDraw} 
                onChange={(e) => setAngleOfDraw(+e.target.value)}
                style={{ width: '100%', cursor: 'pointer' }} 
              />
            </div>

            {/* Slider 4: Subsidence Factor a */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Subsidence Factor (a):</span>
                <strong>{subsidenceFactor} (Caving Method)</strong>
              </div>
              <input 
                type="range" 
                min="0.50" 
                max="0.85" 
                step="0.01" 
                value={subsidenceFactor} 
                onChange={(e) => setSubsidenceFactor(+e.target.value)}
                style={{ width: '100%', cursor: 'pointer' }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
