import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Play, 
  Truck, 
  AlertTriangle, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Sliders,
  ShieldAlert,
  Radio,
  TrendingUp,
  Maximize2,
  Usb,
  Power,
  Sparkles
} from 'lucide-react';

export function LiveTelemetrySimulator({ 
  currentScenario, 
  onSelectScenario,
  selectedNode,
  telemetryStream,
  timeSeriesData = [],
  filterDiagnostic,
  dataMode = 'demo',
  usbStatus = { connected: false, lastPacket: null },
  onConnectUsb,
  onInjectTestPacket
}) {
  const tiltCanvasRef = useRef(null);
  const strainCanvasRef = useRef(null);
  const vibrationCanvasRef = useRef(null);

  const [activeTab, setActiveTab] = useState('tilt'); // 'tilt' | 'strain' | 'vibration'

  // Render high-resolution time series chart with Live Timestamps on X-axis
  useEffect(() => {
    const renderChart = (canvas, dataPoints, yKey1, yKey2, label1, label2, unit, thresholdVal, color1, color2) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const padLeft = 55;
      const padRight = 20;
      const padTop = 25;
      const padBottom = 35;
      const chartW = width - padLeft - padRight;
      const chartH = height - padTop - padBottom;

      if (!dataPoints || dataPoints.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Awaiting ESP32 LoRa Serial Telemetry... (Connect USB Gateway or Inject Test Packet above)', width / 2, height / 2);
        return;
      }

      // If only 1 data point, duplicate for plotting line
      const renderPoints = dataPoints.length === 1 
        ? [dataPoints[0], { ...dataPoints[0], timeLabel: 'Now' }] 
        : dataPoints;

      // Determine Y-range
      let minY = 0;
      let maxY = 1;
      renderPoints.forEach(p => {
        if (p[yKey1] !== undefined && p[yKey1] !== null) {
          if (p[yKey1] > maxY) maxY = p[yKey1] * 1.25;
        }
        if (yKey2 && p[yKey2] !== undefined && p[yKey2] !== null) {
          if (p[yKey2] > maxY) maxY = p[yKey2] * 1.25;
        }
      });
      if (thresholdVal && thresholdVal > maxY) maxY = thresholdVal * 1.15;
      maxY = Math.max(maxY, 0.2);

      // 1. Draw Grid Lines & Y-Axis Labels
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.lineWidth = 1;

      const yTicks = 4;
      for (let i = 0; i <= yTicks; i++) {
        const yVal = minY + (maxY - minY) * (i / yTicks);
        const yPos = padTop + chartH - (i / yTicks) * chartH;

        ctx.beginPath();
        ctx.moveTo(padLeft, yPos);
        ctx.lineTo(width - padRight, yPos);
        ctx.stroke();

        ctx.textAlign = 'right';
        ctx.fillText(`${yVal.toFixed(2)} ${unit}`, padLeft - 6, yPos + 3);
      }

      // 2. Draw Statutory DGMS Threshold line if applicable
      if (thresholdVal) {
        const threshY = padTop + chartH - ((thresholdVal - minY) / (maxY - minY)) * chartH;
        if (threshY >= padTop && threshY <= padTop + chartH) {
          ctx.strokeStyle = '#ef4444';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(padLeft, threshY);
          ctx.lineTo(width - padRight, threshY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#ef4444';
          ctx.textAlign = 'right';
          ctx.fillText(`DGMS Limit: ${thresholdVal}${unit}`, width - padRight, threshY - 4);
        }
      }

      // 3. Draw X-Axis Live Clock Timestamps
      const xStep = renderPoints.length > 1 ? chartW / (renderPoints.length - 1) : 0;
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';

      // Label every ~5th point
      renderPoints.forEach((p, idx) => {
        if (idx % 4 === 0 || idx === renderPoints.length - 1) {
          const xPos = padLeft + idx * xStep;
          ctx.fillText(p.timeLabel || '', xPos, height - 12);

          // Subtle tick mark
          ctx.beginPath();
          ctx.moveTo(xPos, padTop + chartH);
          ctx.lineTo(xPos, padTop + chartH + 4);
          ctx.stroke();
        }
      });

      // 4. Plot Line 1
      ctx.strokeStyle = color1;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      renderPoints.forEach((p, idx) => {
        const val = p[yKey1] !== null && p[yKey1] !== undefined ? p[yKey1] : minY;
        const xPos = padLeft + idx * xStep;
        const yPos = padTop + chartH - ((val - minY) / (maxY - minY)) * chartH;
        if (idx === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      });
      ctx.stroke();

      // Glowing marker at latest point
      const lastIdx = renderPoints.length - 1;
      const lastVal1 = renderPoints[lastIdx][yKey1] !== null && renderPoints[lastIdx][yKey1] !== undefined ? renderPoints[lastIdx][yKey1] : minY;
      const lastX = padLeft + lastIdx * xStep;
      const lastY = padTop + chartH - ((lastVal1 - minY) / (maxY - minY)) * chartH;
      ctx.fillStyle = color1;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 5. Plot Line 2 if available
      if (yKey2 && color2) {
        ctx.strokeStyle = color2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        renderPoints.forEach((p, idx) => {
          const val2 = p[yKey2] !== null && p[yKey2] !== undefined ? p[yKey2] : minY;
          const xPos = padLeft + idx * xStep;
          const yPos = padTop + chartH - ((val2 - minY) / (maxY - minY)) * chartH;
          if (idx === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        });
        ctx.stroke();

        const lastVal2 = renderPoints[lastIdx][yKey2] !== null && renderPoints[lastIdx][yKey2] !== undefined ? renderPoints[lastIdx][yKey2] : minY;
        const lastY2 = padTop + chartH - ((lastVal2 - minY) / (maxY - minY)) * chartH;
        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.arc(lastX, lastY2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Render active canvas
    if (activeTab === 'tilt') {
      renderChart(
        tiltCanvasRef.current, 
        timeSeriesData, 
        'tiltX', 
        'tiltY', 
        'Pitch (θx)', 
        'Roll (θy)', 
        '°', 
        0.57, // DGMS Critical Tilt Limit (0.57 deg = 10 mm/m)
        '#0284c7', 
        '#8b5cf6'
      );
    } else if (activeTab === 'strain') {
      renderChart(
        strainCanvasRef.current, 
        timeSeriesData, 
        'strainMmM', 
        'crackWidthMm', 
        'Strain (Δd mm/m)', 
        'Crack (mm)', 
        'mm', 
        5.0, // DGMS Critical Strain Limit (5 mm/m)
        '#f59e0b', 
        '#ef4444'
      );
    } else if (activeTab === 'vibration') {
      renderChart(
        vibrationCanvasRef.current, 
        timeSeriesData, 
        'vibrationG', 
        null, 
        'Peak RMS Acceleration', 
        null, 
        'g', 
        0.50, 
        currentScenario === 'dumper' ? '#f59e0b' : '#10b981', 
        null
      );
    }
  }, [timeSeriesData, activeTab, currentScenario]);

  const latestTime = timeSeriesData[timeSeriesData.length - 1]?.timeLabel || 'Live';
  const isUsbStandby = dataMode === 'usb' && !usbStatus?.connected && !usbStatus?.lastPacket;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Scenario Controls Bar (Demo Mode) OR USB Hardware Status Bar (USB Mode) */}
      {dataMode === 'usb' ? (
        <div className="scenario-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              background: usbStatus?.connected ? 'var(--color-safe-bg)' : 'var(--brand-light)',
              color: usbStatus?.connected ? 'var(--color-safe)' : 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Usb size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                {usbStatus?.connected ? 'ESP32 LoRa Gateway Streaming Active' : 'ESP32 USB Hardware Pipeline • Standby'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {usbStatus?.connected 
                  ? `Receiving live 868MHz LoRa sensor packets at 115200 Baud (${usbStatus?.packetCount || 0} packets ingested).`
                  : 'Synthetic simulation ticker is paused. Plug in ESP32 via USB or click "Inject Test Packet" above to stream live sensor readings.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge ${usbStatus?.connected ? 'badge-safe' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
              <span className="status-pulse-dot" style={{ width: 6, height: 6 }}></span>
              {usbStatus?.connected ? 'HARDWARE ONLINE' : 'AWAITING HARDWARE'}
            </span>
          </div>
        </div>
      ) : (
        <div className="scenario-bar">
          <span className="scenario-label">
            <Sliders size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Simulate Ground Events:
          </span>

          <button 
            className={`scenario-chip ${currentScenario === 'normal' ? 'active' : ''}`}
            onClick={() => onSelectScenario('normal')}
            title="Normal steady extraction over mine panel"
          >
            <CheckCircle2 size={13} />
            <span>A: Normal Extraction</span>
          </button>

          <button 
            className={`scenario-chip ${currentScenario === 'dumper' ? 'active' : ''}`}
            onClick={() => onSelectScenario('dumper')}
            title="Heavy CAT 777 coal dumper passing - test 3-layer false alarm filter"
          >
            <Truck size={13} />
            <span>B: Dumper Truck (Filter Demo)</span>
          </button>

          <button 
            className={`scenario-chip ${currentScenario === 'creep' ? 'active' : ''}`}
            onClick={() => onSelectScenario('creep')}
            title="Secondary creep with tensile micro-crack opening"
          >
            <AlertTriangle size={13} />
            <span>C: Secondary Creep / Fissure</span>
          </button>

          <button 
            className={`scenario-chip ${currentScenario === 'critical' ? 'active danger' : ''}`}
            onClick={() => onSelectScenario('critical')}
            title="Tertiary exponential acceleration - imminent ground collapse warning"
          >
            <Flame size={13} />
            <span>D: Tertiary Failure (Red Alert)</span>
          </button>

          <button 
            className={`scenario-chip ${currentScenario === 'reroute' ? 'active' : ''}`}
            onClick={() => onSelectScenario('reroute')}
            title="Simulate node battery/damage and self-healing mesh packet re-routing"
          >
            <Zap size={13} />
            <span>E: Self-Healing Mesh Test</span>
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards */}
      <div className="grid-4col">
        {/* Metric 1: Ground Tilt */}
        <div className="card stat-card">
          <div className="stat-label">Ground Tilt (Pitch / Roll)</div>
          <div className="stat-val" style={{ color: telemetryStream.tiltX !== null && Math.abs(telemetryStream.tiltX) > 0.5 ? 'var(--color-critical)' : 'var(--text-primary)' }}>
            {telemetryStream.tiltX !== null && telemetryStream.tiltX !== undefined ? (
              <>
                {telemetryStream.tiltX}° <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {telemetryStream.tiltY !== null ? `${telemetryStream.tiltY}°` : '--'}</span>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>--</span>
            )}
          </div>
          <div className="stat-meta">
            <ArrowUpRight size={13} />
            <span>
              {telemetryStream.tiltRate !== null && telemetryStream.tiltRate !== undefined ? (
                <>Rate: <strong>{telemetryStream.tiltRate}°/hr</strong> (Permissible: &lt;0.17°)</>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Permissible Limit: &lt;0.17°</span>
              )}
            </span>
          </div>
        </div>

        {/* Metric 2: Crack Initiation */}
        <div className="card stat-card">
          <div className="stat-label">Tensile Crack Opening</div>
          <div className="stat-val" style={{ color: telemetryStream.crackWidthMm > 5 ? 'var(--color-critical)' : (telemetryStream.crackWidthMm > 1.5 ? 'var(--color-warning)' : 'var(--text-primary)') }}>
            {telemetryStream.crackWidthMm !== null && telemetryStream.crackWidthMm !== undefined ? (
              <>{telemetryStream.crackWidthMm} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>mm</span></>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>--</span>
            )}
          </div>
          <div className="stat-meta">
            <span>Draw-wire / ToF optical sensor</span>
          </div>
        </div>

        {/* Metric 3: Inter-Node Strain */}
        <div className="card stat-card">
          <div className="stat-label">Horizontal Strain (Δd)</div>
          <div className="stat-val" style={{ color: telemetryStream.strainMmM > 3 ? 'var(--color-critical)' : 'var(--text-primary)' }}>
            {telemetryStream.strainMmM !== null && telemetryStream.strainMmM !== undefined ? (
              <>{telemetryStream.strainMmM} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>mm/m</span></>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>--</span>
            )}
          </div>
          <div className="stat-meta">
            <span>DGMS Critical Limit: 5.0 mm/m</span>
          </div>
        </div>

        {/* Metric 4: Peak Vibration & Frequency */}
        <div className="card stat-card">
          <div className="stat-label">Micro-Seismic Vibration</div>
          <div className="stat-val" style={{ color: telemetryStream.vibrationG > 0.3 ? 'var(--color-critical)' : 'var(--text-primary)' }}>
            {telemetryStream.vibrationG !== null && telemetryStream.vibrationG !== undefined ? (
              <>{telemetryStream.vibrationG} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{telemetryStream.vibrationHz !== null ? `g @ ${telemetryStream.vibrationHz}Hz` : 'g'}</span></>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>--</span>
            )}
          </div>
          <div className="stat-meta">
            <span>
              {telemetryStream.vibrationHz !== null && telemetryStream.vibrationHz !== undefined
                ? `Band: ${telemetryStream.vibrationHz < 20 ? '1–15Hz Rock Shear' : '40–120Hz Surface Noise'}`
                : 'Awaiting LoRa sensor stream'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Full-Width Uncompressed Live Time-Series Chart */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <div>
            <h3 className="card-title">
              <Activity size={18} style={{ color: 'var(--brand-primary)' }} />
              {dataMode === 'usb'
                ? (usbStatus?.connected ? 'ESP32 LoRa Gateway Live Serial Telemetry Stream' : 'ESP32 USB Serial Telemetry Stream (Hardware Standby)')
                : 'Synchronized Multi-Channel Live Telemetry Stream (1 Hz Continuous Broadcast)'}
            </h3>
            <div className="card-desc">
              {isUsbStandby ? (
                <span>Hardware Gateway Port: <strong>Disconnected / Standby</strong> • Baud Rate: <strong>115200</strong></span>
              ) : (
                <span>Streaming node: <strong>{selectedNode?.name || 'Node N05'}</strong> • Last packet timestamp: <strong>{latestTime} IST</strong></span>
              )}
            </div>
          </div>

          {/* Chart View Switcher */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button 
              className={`btn-secondary ${activeTab === 'tilt' ? 'active' : ''}`}
              onClick={() => setActiveTab('tilt')}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              Tilt (Pitch/Roll)
            </button>
            <button 
              className={`btn-secondary ${activeTab === 'strain' ? 'active' : ''}`}
              onClick={() => setActiveTab('strain')}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              Strain & Crack
            </button>
            <button 
              className={`btn-secondary ${activeTab === 'vibration' ? 'active' : ''}`}
              onClick={() => setActiveTab('vibration')}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              Micro-Vibration
            </button>
            <span className={`badge ${isUsbStandby ? 'badge-warning' : 'badge-safe'}`} style={{ marginLeft: '0.5rem' }}>
              <span className="status-pulse-dot" style={{ width: '6px', height: '6px' }}></span>
              {isUsbStandby ? 'USB STANDBY' : 'LIVE STREAM'}
            </span>
          </div>
        </div>

        {/* Legend for active chart */}
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', marginBottom: '0.75rem', paddingLeft: '55px' }}>
          {activeTab === 'tilt' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '16px', height: '3px', background: '#0284c7' }}></span>
                <span>Pitch Angle θx (Current: <strong>{telemetryStream.tiltX !== null && telemetryStream.tiltX !== undefined ? `${telemetryStream.tiltX}°` : '--'}</strong>)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '16px', height: '3px', background: '#8b5cf6' }}></span>
                <span>Roll Angle θy (Current: <strong>{telemetryStream.tiltY !== null && telemetryStream.tiltY !== undefined ? `${telemetryStream.tiltY}°` : '--'}</strong>)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '16px', height: '2px', background: '#ef4444', borderTop: '1px dashed' }}></span>
                <span>DGMS Permissible Tilt Threshold (0.57° / 10 mm/m)</span>
              </div>
            </>
          )}
          {activeTab === 'strain' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '16px', height: '3px', background: '#f59e0b' }}></span>
                <span>Horizontal Strain Δd (Current: <strong>{telemetryStream.strainMmM !== null && telemetryStream.strainMmM !== undefined ? `${telemetryStream.strainMmM} mm/m` : '--'}</strong>)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '16px', height: '3px', background: '#ef4444' }}></span>
                <span>Surface Crack Opening (Current: <strong>{telemetryStream.crackWidthMm !== null && telemetryStream.crackWidthMm !== undefined ? `${telemetryStream.crackWidthMm} mm` : '--'}</strong>)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '16px', height: '2px', background: '#ef4444', borderTop: '1px dashed' }}></span>
                <span>DGMS Statutory Limit (5.0 mm/m)</span>
              </div>
            </>
          )}
          {activeTab === 'vibration' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '16px', height: '3px', background: currentScenario === 'dumper' ? '#f59e0b' : '#10b981' }}></span>
                <span>Peak Acceleration (Current: <strong>{telemetryStream.vibrationG !== null && telemetryStream.vibrationG !== undefined ? `${telemetryStream.vibrationG}g @ ${telemetryStream.vibrationHz}Hz` : '--'}</strong>)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '16px', height: '2px', background: '#ef4444', borderTop: '1px dashed' }}></span>
                <span>Roof Fracture Shock Limit (0.50g)</span>
              </div>
            </>
          )}
        </div>

        {/* High-Resolution Dynamic Canvas (Uncompressed 280px height) */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '0.5rem', border: '1px solid var(--border-color)' }}>
          {activeTab === 'tilt' && (
            <canvas ref={tiltCanvasRef} width={1100} height={280} style={{ width: '100%', height: '280px' }} />
          )}
          {activeTab === 'strain' && (
            <canvas ref={strainCanvasRef} width={1100} height={280} style={{ width: '100%', height: '280px' }} />
          )}
          {activeTab === 'vibration' && (
            <canvas ref={vibrationCanvasRef} width={1100} height={280} style={{ width: '100%', height: '280px' }} />
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '55px' }}>
          <span>← Rolling History (Last 30 Time Steps)</span>
          <span>Sampling Rate: 1 Sample/Second (Event-triggered continuous streaming)</span>
          <span>Latest Live Timestamp ({latestTime} IST) →</span>
        </div>
      </div>

      {/* 4. 3-Layer Filter & Diagnostic Inspection Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <ShieldAlert size={16} />
              3-Layer False-Alarm Rejection & Anomaly Classifier
            </h3>
            <div className="card-desc">Suppresses heavy coal dumpers and machinery vibrations from triggering false sirens</div>
          </div>
          <span className={`badge ${filterDiagnostic.isGenuineSubsidence ? 'badge-critical' : 'badge-safe'}`}>
            {filterDiagnostic.isGenuineSubsidence ? 'GENUINE SUBSIDENCE' : 'ALARM SUPPRESSED (VEHICLE / NOISE)'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {/* Layer 1 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-md)', borderLeft: filterDiagnostic.layerFail === 1 ? '4px solid #ef4444' : '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
              <span>1. Frequency Spectral Filter</span>
              <span>{telemetryStream.vibrationHz !== null && telemetryStream.vibrationHz !== undefined ? `${telemetryStream.vibrationHz} Hz` : '--'}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Rejects high-frequency vehicular noise (&gt;30 Hz). Isolates 1–15 Hz brittle rock fracture band.
            </div>
          </div>

          {/* Layer 2 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-md)', borderLeft: filterDiagnostic.layerFail === 2 ? '4px solid #ef4444' : '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
              <span>2. Mesh Spatial Coherence</span>
              <span>{isUsbStandby ? 'Standby' : (currentScenario === 'dumper' ? '1 Node (Local)' : 'Multi-Node (Spherical P-Wave)')}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Verifies arrival wavefront velocity (~3,000 m/s) across neighboring mesh nodes within 30ms.
            </div>
          </div>

          {/* Layer 3 */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-md)', borderLeft: filterDiagnostic.layerFail === 3 ? '4px solid #ef4444' : '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
              <span>3. Kinematic Permanent Tilt Check</span>
              <span>{telemetryStream.tiltX !== null && telemetryStream.tiltX !== undefined ? `Δθ: ${Math.abs(telemetryStream.tiltX)}°` : 'Δθ: --'}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Differentiates elastic vehicle bounce (zero residual shift) from permanent plastic ground yield.
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <strong>Real-Time Diagnostic:</strong> {filterDiagnostic.reason}
        </div>
      </div>
    </div>
  );
}
