import React from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Activity, 
  Radio, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Truck, 
  Zap, 
  Bell, 
  ArrowUpRight,
  ChevronRight,
  MapPin,
  ExternalLink,
  Usb
} from 'lucide-react';
import { SubsidenceRiskGauge } from './SubsidenceRiskGauge';
import { GISMeshMap } from './GISMeshMap';
import { LiveTelemetrySimulator } from './LiveTelemetrySimulator';

export function OverviewDashboard({ 
  activeMine,
  nodes,
  selectedNode,
  onSelectNode,
  disabledNodeIds,
  onToggleNodeDisabled,
  currentScenario,
  onSelectScenario,
  telemetryStream,
  timeSeriesData,
  filterDiagnostic,
  ttfData,
  severityIndex,
  onNavigateTab,
  dataMode = 'demo',
  usbStatus = { connected: false, lastPacket: null },
  onConnectUsb,
  onInjectTestPacket
}) {
  const isUsbStandby = dataMode === 'usb' && !usbStatus?.connected && !usbStatus?.lastPacket;

  // Recent incidents feed based on current scenario
  const getIncidentFeed = () => {
    const timeNow = new Date().toLocaleTimeString('en-GB');

    if (isUsbStandby) {
      return [
        {
          id: 1,
          time: timeNow,
          level: 'INFO',
          title: 'ESP32 LoRa Gateway Standby',
          desc: 'Real-time simulation ticker paused. Awaiting physical ESP32 connection or serial test packet injection at 115200 baud.',
          location: 'Pithead USB Serial Gateway (COM Port)'
        },
        {
          id: 2,
          time: 'Standby',
          level: 'SAFE',
          title: 'Surface Mesh Topology Initialized',
          desc: '36 geo-referenced nodes mapped across panel perimeter and critical infrastructure.',
          location: activeMine.name
        }
      ];
    }

    if (currentScenario === 'critical') {
      return [
        {
          id: 1,
          time: timeNow,
          level: 'CRITICAL',
          title: 'TERTIARY EXPONENTIAL CREEP ACCELERATION',
          desc: `Tilt surging across Nodes N04, N05, N10 (>0.85°). Tensile crack expanded to ${telemetryStream.crackWidthMm}mm. Evacuation advised.`,
          location: 'NH-19 Highway Corridor / Tensile Zone'
        },
        {
          id: 2,
          time: '1 min ago',
          level: 'CRITICAL',
          title: 'Automated Sirens & Highway LED Closures Active',
          desc: 'On-site 110dB audio siren triggered. NH-19 VMS displays diverted to bypass.',
          location: 'All Surface Sectors'
        },
        {
          id: 3,
          time: '3 mins ago',
          level: 'WARNING',
          title: 'DGMS Statutory Strain Threshold Exceeded',
          desc: 'Horizontal strain Δd exceeded 5.0 mm/m limit.',
          location: 'Panel 14 Centerline'
        }
      ];
    } else if (currentScenario === 'creep') {
      return [
        {
          id: 1,
          time: timeNow,
          level: 'WARNING',
          title: 'Secondary Steady-State Creep Detected',
          desc: `Tilt drift at ${telemetryStream.tiltRate}°/hr. Surface hairline crack opening at ${telemetryStream.crackWidthMm}mm.`,
          location: 'Kusunda Village Approach (Node N06)'
        },
        {
          id: 2,
          time: '4 mins ago',
          level: 'ADVISORY',
          title: 'Automated SMS Alert Sent to Mine Safety Officer',
          desc: 'Level 2 operational alert dispatched to Under-Manager and Surveyor.',
          location: 'Pithead Control Room'
        }
      ];
    } else if (currentScenario === 'dumper') {
      return [
        {
          id: 1,
          time: timeNow,
          level: 'INFO',
          title: 'High-Frequency Vibration Filtered (Vehicle)',
          desc: `Surface truck vibration (${telemetryStream.vibrationG}g @ ${telemetryStream.vibrationHz}Hz) suppressed by 3-layer false alarm filter. Zero permanent tilt.`,
          location: 'NH-19 Highway Culvert'
        },
        {
          id: 2,
          time: '5 mins ago',
          level: 'SAFE',
          title: 'Mine Strata Normal Steady State',
          desc: '36 mesh nodes reporting nominal baseline values.',
          location: 'Active Panel 14'
        }
      ];
    } else {
      return [
        {
          id: 1,
          time: timeNow,
          level: 'SAFE',
          title: 'Normal Extraction • Strata Baseline Stable',
          desc: 'Surface ground movement within permissible DGMS elastic limits (<0.17° tilt).',
          location: activeMine.name
        },
        {
          id: 2,
          time: '10 mins ago',
          level: 'SAFE',
          title: 'Continuous LoRa & ESP-NOW Mesh Heartbeat Verified',
          desc: 'All 36 nodes synchronized with central pithead gateway. 0 packet loss.',
          location: 'Central Gateway 868MHz'
        }
      ];
    }
  };

  const incidents = getIncidentFeed();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Top Executive KPI Grid */}
      <div className="grid-4col">
        {/* KPI 1: Subsidence Risk Gauge (Matches requested image!) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <SubsidenceRiskGauge score={severityIndex} />
        </div>

        {/* KPI 2: Time-To-Failure (TTF) Prediction */}
        <div className="card stat-card" style={{ borderTop: ttfData.isAccelerating ? '4px solid #ef4444' : '4px solid var(--brand-primary)' }}>
          <div className="card-header" style={{ marginBottom: '0.4rem' }}>
            <div className="stat-label">Predicted Time-To-Failure (TTF)</div>
            <Clock size={18} style={{ color: ttfData.isAccelerating ? '#ef4444' : 'var(--brand-primary)' }} />
          </div>
          <div className="stat-val" style={{ color: ttfData.isAccelerating ? '#ef4444' : 'var(--text-primary)', fontSize: '1.75rem' }}>
            {ttfData.displayStr || (ttfData.ttfHours ? `${ttfData.ttfHours}h` : 'STABLE')}
          </div>
          <div className="stat-meta" style={{ marginTop: '0.4rem' }}>
            <span><strong>Model:</strong> {ttfData.stage}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Saito & Fukuzono inverse velocity model ({ttfData.confidence}% confidence)
          </div>
        </div>

        {/* KPI 3: Real-Time Strata Telemetry */}
        <div className="card stat-card">
          <div className="card-header" style={{ marginBottom: '0.4rem' }}>
            <div className="stat-label">Maximum Ground Deformation</div>
            <Activity size={18} style={{ color: '#0284c7' }} />
          </div>
          <div className="stat-val">
            {telemetryStream.tiltX !== null && telemetryStream.tiltX !== undefined ? (
              <>{telemetryStream.tiltX}° <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tilt</span></>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>--</span>
            )}
          </div>
          <div className="stat-meta" style={{ marginTop: '0.4rem' }}>
            {telemetryStream.crackWidthMm !== null && telemetryStream.crackWidthMm !== undefined ? (
              <span>Crack: <strong>{telemetryStream.crackWidthMm} mm</strong> | Strain: <strong>{telemetryStream.strainMmM} mm/m</strong></span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Awaiting LoRa sensor stream</span>
            )}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            DGMS Limits: &lt;0.57° Tilt, &lt;5.0 mm/m Tensile Strain
          </div>
        </div>

        {/* KPI 4: Surface Mesh Network Health */}
        <div className="card stat-card">
          <div className="card-header" style={{ marginBottom: '0.4rem' }}>
            <div className="stat-label">Surface Mesh Network</div>
            <Radio size={18} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-val" style={{ color: '#10b981' }}>
            {36 - disabledNodeIds.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 36 Online</span>
          </div>
          <div className="stat-meta" style={{ marginTop: '0.4rem' }}>
            <span>LoRa 868MHz + ESP-NOW • Latency: <strong>142ms</strong></span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Self-healing mesh routing • Central Pithead Gateway active
          </div>
        </div>
      </div>

      {/* 2. Simulator Quick Event Trigger Bar or USB Hardware Status Bar */}
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
            Quick Simulation Presets:
          </span>

          <button 
            className={`scenario-chip ${currentScenario === 'normal' ? 'active' : ''}`}
            onClick={() => onSelectScenario('normal')}
          >
            <CheckCircle2 size={13} />
            <span>Normal Baseline</span>
          </button>

          <button 
            className={`scenario-chip ${currentScenario === 'dumper' ? 'active' : ''}`}
            onClick={() => onSelectScenario('dumper')}
          >
            <Truck size={13} />
            <span>Heavy Dumper (Filter Test)</span>
          </button>

          <button 
            className={`scenario-chip ${currentScenario === 'creep' ? 'active' : ''}`}
            onClick={() => onSelectScenario('creep')}
          >
            <AlertTriangle size={13} />
            <span>Secondary Creep</span>
          </button>

          <button 
            className={`scenario-chip ${currentScenario === 'critical' ? 'active danger' : ''}`}
            onClick={() => onSelectScenario('critical')}
          >
            <Flame size={13} />
            <span>Tertiary Collapse (Red Alert)</span>
          </button>

          <button 
            className={`scenario-chip ${currentScenario === 'reroute' ? 'active' : ''}`}
            onClick={() => onSelectScenario('reroute')}
          >
            <Zap size={13} />
            <span>Mesh Self-Healing</span>
          </button>
        </div>
      )}

      {/* 3. Main Operational 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem' }}>
        {/* Left Column: Interactive GIS Map & Live Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Integrated Interactive GIS Map */}
          <GISMeshMap 
            nodes={nodes}
            activeMine={activeMine}
            selectedNode={selectedNode}
            onSelectNode={onSelectNode}
            onToggleNodeDisabled={onToggleNodeDisabled}
            disabledNodeIds={disabledNodeIds}
          />

          {/* Integrated Live Telemetry Graph */}
          <LiveTelemetrySimulator 
            currentScenario={currentScenario}
            onSelectScenario={onSelectScenario}
            selectedNode={selectedNode}
            telemetryStream={telemetryStream}
            timeSeriesData={timeSeriesData}
            filterDiagnostic={filterDiagnostic}
            dataMode={dataMode}
            usbStatus={usbStatus}
            onConnectUsb={onConnectUsb}
            onInjectTestPacket={onInjectTestPacket}
          />
        </div>

        {/* Right Column: Live Incidents & Early Warning Alert Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Live Early Warning Feed Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Bell size={16} />
                  Live Early Warning & Incident Feed
                </h3>
                <div className="card-desc">Real-time alerts broadcasted to mine operators & local authorities</div>
              </div>
              <span className={`badge ${currentScenario === 'critical' ? 'badge-critical' : (currentScenario === 'creep' ? 'badge-warning' : 'badge-safe')}`}>
                {currentScenario === 'critical' ? 'ACTIVE EMERGENCY' : (currentScenario === 'creep' ? 'MONITORING' : 'NORMAL')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {incidents.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    borderLeft: item.level === 'CRITICAL' ? '4px solid #ef4444' : (item.level === 'WARNING' ? '4px solid #f59e0b' : '4px solid #10b981')
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.level === 'CRITICAL' ? '#ef4444' : (item.level === 'WARNING' ? '#d97706' : '#10b981') }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.time}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {item.desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    <MapPin size={11} />
                    <span>{item.location}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn-secondary" 
              onClick={() => onNavigateTab('alerts')}
              style={{ width: '100%', marginTop: '1rem', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              <span>Open Full Early Warning Console & SMS Dispatcher</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Active Seam & Strata Parameters Quick Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Layers size={16} />
                  Active Seam & Strata Physics
                </h3>
                <div className="card-desc">Geotechnical profile above {activeMine.name}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>SEAM DEPTH (H)</span>
                <strong>{activeMine.depthH} meters</strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>EXTRACTION THICKNESS</span>
                <strong>{activeMine.thicknessM} meters</strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>ANGLE OF DRAW (γ)</span>
                <strong>{activeMine.angleOfDraw}° (Sandstone)</strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>CALCULATED S_MAX</span>
                <strong>{Math.round(0.72 * activeMine.thicknessM * 1000)} mm</strong>
              </div>
            </div>

            <button 
              className="btn-secondary" 
              onClick={() => onNavigateTab('ai')}
              style={{ width: '100%', marginTop: '0.85rem', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              <span>Fine-tune Strata & Knothe Curves</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
