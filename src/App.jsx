import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Activity, 
  BrainCircuit, 
  Cpu, 
  Bell, 
  Lock,
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';

import { MINE_FIELDS, generateInitialNodes } from './data/mineData';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { GISMeshMap } from './components/GISMeshMap';
import { LiveTelemetrySimulator } from './components/LiveTelemetrySimulator';
import { AIPredictiveCenter } from './components/AIPredictiveCenter';
import { HardwareStudio } from './components/HardwareStudio';
import { AlertDispatcher } from './components/AlertDispatcher';
import { SecretTeamModal } from './components/SecretTeamModal';
import { UsbLiveGatewayBar } from './components/UsbLiveGatewayBar';
import { WokwiLiveBar } from './components/WokwiLiveBar';
import { WokwiDocsModal } from './components/WokwiDocsModal';
import { Interactive3DRigSimulator } from './components/Interactive3DRigSimulator';

import { soundFx } from './services/soundEffects';
import { offlineStorage } from './services/offlineStorage';
import { usbGateway } from './services/usbGateway';
import { mqttGateway } from './services/mqttGateway';
import { estimateTimeToFailure, discriminateVibrationSource } from './utils/geotechMath';

export default function App() {
  // Theme state: Default Light Theme with Dark mode switch
  const [currentTheme, setCurrentTheme] = useState('light');
  const [activeMine, setActiveMine] = useState(MINE_FIELDS[0]);
  const [currentTab, setCurrentTab] = useState('overview');
  const [nodes, setNodes] = useState(generateInitialNodes(MINE_FIELDS[0]));
  const [selectedNode, setSelectedNode] = useState(nodes[4]); // Default Node N05
  const [disabledNodeIds, setDisabledNodeIds] = useState([]);
  const [currentScenario, setCurrentScenario] = useState('normal');
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [offlineStats, setOfflineStats] = useState(offlineStorage.getStats());
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isWokwiDocsOpen, setIsWokwiDocsOpen] = useState(false);

  // Operational Mode: 'demo' (built-in scenario simulator) vs 'sim3d' (interactive 3D hardware rig) vs 'usb' (live ESP32 Gateway via Web Serial)
  const [dataMode, setDataMode] = useState('demo');
  const [usbStatus, setUsbStatus] = useState({
    connected: false,
    baudRate: 115200,
    portInfo: {},
    packetCount: 0,
    lastPacket: null,
    error: null
  });

  const [mqttStatus, setMqttStatus] = useState({
    connected: false,
    brokerUrl: 'broker.hivemq.com',
    topic: 'subsiguard/minenova6/telemetry',
    packetCount: 0,
    lastPacket: null,
    error: null
  });

  // When active mine changes, regenerate nodes around that mine's center
  useEffect(() => {
    const freshNodes = generateInitialNodes(activeMine);
    setNodes(freshNodes);
    setSelectedNode(freshNodes[4]);
    setDisabledNodeIds([]);
  }, [activeMine]);

  // Live telemetry stream state
  const [telemetryStream, setTelemetryStream] = useState({
    tiltX: 0.04,
    tiltY: 0.02,
    tiltRate: 0.02,
    crackWidthMm: 0.65,
    strainMmM: 0.85,
    vibrationG: 0.02,
    vibrationHz: 8
  });

  // Rolling time-series history with exact Live Clock Timestamps
  const [timeSeriesData, setTimeSeriesData] = useState(() => {
    const arr = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 1000);
      arr.push({
        timeLabel: d.toLocaleTimeString('en-GB'),
        tiltX: +(0.04 + (Math.sin(i) * 0.005)).toFixed(2),
        tiltY: 0.02,
        strainMmM: +(0.85 + (Math.cos(i) * 0.05)).toFixed(2),
        crackWidthMm: 0.65,
        vibrationG: +(0.02 + Math.random() * 0.01).toFixed(3)
      });
    }
    return arr;
  });

  const [velocityHistory, setVelocityHistory] = useState([0.02, 0.03, 0.02, 0.04]);

  // Sync theme with document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Listen to keyboard shortcut (Ctrl+M or Alt+S) to open secret team dossier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setIsTeamModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to offline storage state
  useEffect(() => {
    const unsub = offlineStorage.subscribe((stats) => {
      setOfflineStats(stats);
    });
    return unsub;
  }, []);

  // Toggle Theme
  const handleToggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Toggle Siren
  const handleToggleSiren = () => {
    if (isSirenActive) {
      soundFx.stopSiren();
      setIsSirenActive(false);
    } else {
      soundFx.startSiren();
      setIsSirenActive(true);
    }
  };

  // Toggle Node Failure / Disabled (Self-Healing Mesh test)
  const handleToggleNodeDisabled = (nodeId) => {
    setDisabledNodeIds(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });
  };

  // Unified telemetry packet processor for both Live USB and Wokwi MQTT Cloud
  const processTelemetryPacket = (packet) => {
    // 1. Update telemetryStream state
    setTelemetryStream({
      tiltX: packet.tiltX,
      tiltY: packet.tiltY,
      tiltRate: packet.tiltX > 0.57 ? 0.38 : 0.02,
      crackWidthMm: packet.crackWidthMm,
      strainMmM: packet.strainMmM,
      vibrationG: packet.vibrationG,
      vibrationHz: packet.vibrationHz
    });

    // 2. Update matching node in nodes list
    setNodes(prev => prev.map(n => {
      if (n.id === packet.nodeId) {
        return {
          ...n,
          status: packet.status,
          tiltX: packet.tiltX,
          tiltY: packet.tiltY,
          crackWidthMm: packet.crackWidthMm,
          strainMmM: packet.strainMmM,
          vibrationG: packet.vibrationG,
          vibrationHz: packet.vibrationHz
        };
      }
      return n;
    }));

    // 3. Append to rolling chart
    setTimeSeriesData(prevHistory => {
      const next = [...prevHistory.slice(-29)];
      next.push({
        timeLabel: packet.timestamp,
        tiltX: packet.tiltX,
        tiltY: packet.tiltY,
        strainMmM: packet.strainMmM,
        crackWidthMm: packet.crackWidthMm,
        vibrationG: packet.vibrationG
      });
      return next;
    });

    // 4. Trigger audio alarm if critical limit breached (>0.57° or status CRITICAL)
    if (packet.status === 'CRITICAL' || packet.tiltX > 0.57) {
      setVelocityHistory([0.25, 0.65, 1.25, 2.45]);
      soundFx.playWarningChirp(1000, 0.2);
    }
  };

  // Switch between Demo Scenario Mode, 3D Hardware Rig Sim, and Live USB Gateway Mode
  const handleSwitchMode = (mode) => {
    setDataMode(mode);
    if (mode === 'sim3d') {
      if (usbStatus.connected) usbGateway.disconnect();
      mqttGateway.disconnect();
    } else if (mode === 'wokwi') {
      if (usbStatus.connected) usbGateway.disconnect();
      mqttGateway.connect({
        onData: processTelemetryPacket,
        onStatusChange: (status) => setMqttStatus(prev => ({ ...prev, ...status })),
        onError: (err) => setMqttStatus(prev => ({ ...prev, error: err.message }))
      });
    } else if (mode === 'usb') {
      mqttGateway.disconnect();
      // If USB is not connected and no packets received yet, clear synthetic data to Standby
      if (!usbStatus.connected && !usbStatus.lastPacket) {
        setTelemetryStream({
          tiltX: null,
          tiltY: null,
          tiltRate: null,
          crackWidthMm: null,
          strainMmM: null,
          vibrationG: null,
          vibrationHz: null
        });
        setTimeSeriesData([]);
      }
    } else {
      // demo
      if (usbStatus.connected) usbGateway.disconnect();
      mqttGateway.disconnect();
      // Restore baseline demo telemetry
      setTelemetryStream({
        tiltX: 0.04,
        tiltY: 0.02,
        tiltRate: 0.02,
        crackWidthMm: 0.65,
        strainMmM: 0.85,
        vibrationG: 0.02,
        vibrationHz: 8
      });
      // Restore rolling time series data
      const arr = [];
      const now = new Date();
      for (let i = 24; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 1000);
        arr.push({
          timeLabel: d.toLocaleTimeString('en-GB'),
          tiltX: +(0.04 + (Math.sin(i) * 0.005)).toFixed(2),
          tiltY: 0.02,
          strainMmM: +(0.85 + (Math.cos(i) * 0.05)).toFixed(2),
          crackWidthMm: 0.65,
          vibrationG: +(0.02 + Math.random() * 0.01).toFixed(3)
        });
      }
      setTimeSeriesData(arr);
    }
  };

  // Connect to ESP32 Gateway via Web Serial
  const handleConnectUsb = async () => {
    try {
      await usbGateway.connect({
        onData: processTelemetryPacket,
        onStatusChange: (status) => {
          setUsbStatus(prev => ({ ...prev, ...status }));
        },
        onError: (err) => {
          console.error('USB Gateway Error:', err);
          setUsbStatus(prev => ({ ...prev, error: err.message }));
        }
      });
    } catch (err) {
      console.warn('USB connection aborted or failed:', err);
    }
  };

  const handleDisconnectUsb = async () => {
    await usbGateway.disconnect();
  };

  const handleInjectTestPacket = (samplePacket) => {
    usbGateway.injectSimulatedPacket(samplePacket);
  };

  const handleInjectWokwiPacket = (samplePacket) => {
    mqttGateway.publish(samplePacket);
  };

  const CRITICAL_NODE_IDS = ['N04', 'N05', 'N09', 'N10', 'N11'];
  const WARNING_NODE_IDS = ['N01', 'N02', 'N03', 'N06', 'N07', 'N08', 'N12', 'N21', 'N22', 'N23', 'N24'];

  // Helper to get updated node status and telemetry for any scenario
  const getUpdatedNodesForScenario = (currentNodes, scenario) => {
    return currentNodes.map(node => {
      let status = 'SAFE';
      let tiltX = +(0.03 + (Math.random() * 0.02 - 0.01)).toFixed(2);
      let tiltY = +(0.02 + (Math.random() * 0.01)).toFixed(2);
      let crack = +(0.45 + Math.random() * 0.1).toFixed(2);
      let strain = +(0.80 + Math.random() * 0.1).toFixed(2);
      let vibG = +(0.02 + Math.random() * 0.01).toFixed(3);
      let vibHz = Math.floor(6 + Math.random() * 4);

      if (scenario === 'critical') {
        if (CRITICAL_NODE_IDS.includes(node.id)) {
          status = 'CRITICAL';
          tiltX = +(0.85 + (Math.random() * 0.1)).toFixed(2);
          tiltY = +(0.52 + (Math.random() * 0.08)).toFixed(2);
          crack = +(7.4 + (Math.random() * 0.5)).toFixed(2);
          strain = +(5.8 + (Math.random() * 0.4)).toFixed(2);
          vibG = +(0.45 + (Math.random() * 0.25)).toFixed(3);
          vibHz = Math.floor(4 + Math.random() * 6);
        } else if (WARNING_NODE_IDS.includes(node.id)) {
          status = 'WARNING';
          tiltX = +(0.36 + (Math.random() * 0.06)).toFixed(2);
          tiltY = +(0.22 + (Math.random() * 0.04)).toFixed(2);
          crack = +(2.8 + (Math.random() * 0.3)).toFixed(2);
          strain = +(2.6 + (Math.random() * 0.3)).toFixed(2);
          vibG = +(0.12 + (Math.random() * 0.04)).toFixed(3);
          vibHz = Math.floor(8 + Math.random() * 6);
        }
      } else if (scenario === 'creep') {
        if (CRITICAL_NODE_IDS.includes(node.id)) {
          status = 'WARNING';
          tiltX = +(0.34 + (Math.random() * 0.05)).toFixed(2);
          tiltY = 0.18;
          crack = +(2.8 + (Math.random() * 0.2)).toFixed(2);
          strain = +(2.4 + (Math.random() * 0.2)).toFixed(2);
          vibG = +(0.08 + (Math.random() * 0.03)).toFixed(3);
          vibHz = Math.floor(9 + Math.random() * 5);
        }
      } else if (scenario === 'dumper') {
        if (node.id === 'N02' || node.id === 'N03') {
          // Highway dumper passing over bridge nodes: high vib, zero permanent tilt
          vibG = +(0.65 + Math.random() * 0.25).toFixed(3);
          vibHz = Math.floor(75 + Math.random() * 40);
        }
      }

      return {
        ...node,
        status,
        tiltX,
        tiltY,
        crackWidthMm: crack,
        strainMmM: strain,
        vibrationG: vibG,
        vibrationHz: vibHz
      };
    });
  };

  // Handle Scenario Change
  const handleSelectScenario = (scenario) => {
    setCurrentScenario(scenario);

    // Update all nodes immediately
    const nextNodes = getUpdatedNodesForScenario(nodes, scenario);
    setNodes(nextNodes);

    if (scenario === 'critical') {
      soundFx.playWarningChirp(1000, 0.3);
      if (!isSirenActive) {
        handleToggleSiren();
      }
      setVelocityHistory([0.15, 0.45, 0.95, 1.85]);
      // Auto-focus on Critical Node N05 (Trough center)
      const criticalNode = nextNodes.find(n => n.id === 'N05');
      if (criticalNode) setSelectedNode(criticalNode);
    } else if (scenario === 'dumper') {
      setVelocityHistory([0.03, 0.02, 0.03, 0.02]);
      if (isSirenActive) handleToggleSiren();
      const dumperNode = nextNodes.find(n => n.id === 'N02');
      if (dumperNode) setSelectedNode(dumperNode);
    } else if (scenario === 'creep') {
      setVelocityHistory([0.05, 0.12, 0.22, 0.24]);
      if (isSirenActive) handleToggleSiren();
      const creepNode = nextNodes.find(n => n.id === 'N05');
      if (creepNode) setSelectedNode(creepNode);
    } else if (scenario === 'reroute') {
      setDisabledNodeIds(prev => prev.includes('N04') ? prev : [...prev, 'N04']);
      if (isSirenActive) handleToggleSiren();
    } else {
      // Normal
      setDisabledNodeIds([]);
      setVelocityHistory([0.02, 0.02, 0.03, 0.02]);
      if (isSirenActive) handleToggleSiren();
      const defaultNode = nextNodes.find(n => n.id === 'N05');
      if (defaultNode) setSelectedNode(defaultNode);
    }
  };

  // Real-time telemetry tick generator (1 Hz) with Live Clock
  useEffect(() => {
    const interval = setInterval(() => {
      // The synthetic simulation ticker MUST ONLY run in 'demo' scenario mode!
      // In 'sim3d' mode, the 3D rig drives data.
      // In 'usb' mode, physical ESP32 serial or injected test packet drives data.
      // In 'wokwi' mode, MQTT stream drives data.
      if (dataMode !== 'demo') {
        return;
      }

      const nowStr = new Date().toLocaleTimeString('en-GB');

      setTelemetryStream(prev => {
        let baseTiltX = prev.tiltX;
        let baseTiltY = prev.tiltY;
        let crack = prev.crackWidthMm;
        let strain = prev.strainMmM;
        let vibG = 0.02;
        let vibHz = 7;

        if (currentScenario === 'critical') {
          baseTiltX = +(0.85 + (Math.random() * 0.1)).toFixed(2);
          baseTiltY = +(0.52 + (Math.random() * 0.08)).toFixed(2);
          crack = +(7.4 + (Math.random() * 0.4)).toFixed(2);
          strain = +(5.8 + (Math.random() * 0.3)).toFixed(2);
          vibG = +(0.45 + (Math.random() * 0.25)).toFixed(3);
          vibHz = Math.floor(4 + Math.random() * 8); // 1–15 Hz rock fracture
        } else if (currentScenario === 'dumper') {
          baseTiltX = +(0.03 + (Math.random() * 0.02)).toFixed(2);
          baseTiltY = 0.02;
          crack = 0.65;
          strain = 0.85;
          vibG = +(0.62 + (Math.random() * 0.3)).toFixed(3);
          vibHz = Math.floor(70 + Math.random() * 45); // 70–115 Hz dumper
        } else if (currentScenario === 'creep') {
          baseTiltX = +(0.32 + (Math.random() * 0.04)).toFixed(2);
          baseTiltY = 0.18;
          crack = +(2.8 + (Math.random() * 0.2)).toFixed(2);
          strain = +(2.4 + (Math.random() * 0.2)).toFixed(2);
          vibG = +(0.08 + (Math.random() * 0.04)).toFixed(3);
          vibHz = Math.floor(10 + Math.random() * 6);
        } else {
          // Normal
          baseTiltX = +(0.04 + (Math.random() * 0.02 - 0.01)).toFixed(2);
          baseTiltY = +(0.02 + (Math.random() * 0.02 - 0.01)).toFixed(2);
          crack = +(0.65 + (Math.random() * 0.05)).toFixed(2);
          strain = +(0.85 + (Math.random() * 0.05)).toFixed(2);
          vibG = +(0.02 + (Math.random() * 0.02)).toFixed(3);
          vibHz = Math.floor(6 + Math.random() * 6);
        }

        // Keep all 36 nodes live and synchronized with active scenario
        setNodes(prevNodes => {
          const updated = getUpdatedNodesForScenario(prevNodes, currentScenario);
          setSelectedNode(curr => {
            if (!curr) return updated[4];
            return updated.find(n => n.id === curr.id) || curr;
          });
          return updated;
        });

        // Push to rolling time series data buffer
        setTimeSeriesData(history => {
          const next = [...history.slice(-29)];
          next.push({
            timeLabel: nowStr,
            tiltX: baseTiltX,
            tiltY: baseTiltY,
            strainMmM: strain,
            crackWidthMm: crack,
            vibrationG: vibG
          });
          return next;
        });

        // Buffer packet to offline cache
        offlineStorage.bufferPacket({
          nodeId: selectedNode?.id || 'N05',
          time: nowStr,
          tiltX: baseTiltX,
          crackWidthMm: crack,
          strainMmM: strain,
          vibrationG: vibG,
          vibrationHz: vibHz,
          scenario: currentScenario
        });

        return {
          tiltX: baseTiltX,
          tiltY: baseTiltY,
          tiltRate: currentScenario === 'critical' ? 0.42 : (currentScenario === 'creep' ? 0.08 : 0.01),
          crackWidthMm: crack,
          strainMmM: strain,
          vibrationG: vibG,
          vibrationHz: vibHz
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScenario, selectedNode]);

  // Determine if we are in USB mode waiting for hardware connection/packets
  const isUsbStandby = dataMode === 'usb' && !usbStatus.connected && !usbStatus.lastPacket;

  // Compute Time-to-Failure & Severity dynamically from live physical deformation
  const ttfData = isUsbStandby
    ? { isAccelerating: false, ttfHours: null, displayStr: 'STANDBY', stage: 'Awaiting Hardware Ingestion', confidence: 0 }
    : estimateTimeToFailure(velocityHistory, telemetryStream.tiltX, telemetryStream.strainMmM);

  let severityIndex = 12; // Normal
  if (isUsbStandby) {
    severityIndex = 0;
  } else if (dataMode === 'sim3d' || (dataMode === 'usb' && (usbStatus.connected || usbStatus.lastPacket)) || (dataMode === 'wokwi' && mqttStatus.connected)) {
    // Dynamic physical severity based on live sensor readings from 3D model or hardware
    if (telemetryStream.tiltX > 0.57 || telemetryStream.strainMmM > 5.0) {
      severityIndex = Math.min(99, Math.round(55 + (telemetryStream.tiltX || 0) * 30));
    } else if (telemetryStream.tiltX > 0.25) {
      severityIndex = Math.round(30 + (telemetryStream.tiltX || 0) * 45);
    } else {
      severityIndex = 14;
    }
  } else {
    if (currentScenario === 'critical') severityIndex = 94;
    else if (currentScenario === 'creep') severityIndex = 58;
    else if (currentScenario === 'dumper') severityIndex = 18;
  }

  // 3-layer false alarm filter diagnostic
  const filterDiagnostic = isUsbStandby
    ? {
        isGenuineSubsidence: false,
        isRealSubsidence: false,
        isFalseAlarm: false,
        layerFail: 0,
        reason: 'USB Hardware Pipeline Standby. Connect ESP32 Gateway or click "Inject Test Packet" to stream live sensor readings.'
      }
    : discriminateVibrationSource({
        peakFreqHz: telemetryStream.vibrationHz || 0,
        rmsG: telemetryStream.vibrationG || 0,
        permanentTiltDelta: telemetryStream.tiltX || 0,
        multiNodeCoincidence: currentScenario !== 'dumper'
      });

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        currentTheme={currentTheme}
        onToggleTheme={handleToggleTheme}
        activeMine={activeMine}
        onSelectMine={setActiveMine}
        mineFields={MINE_FIELDS}
        isSirenActive={isSirenActive}
        onToggleSiren={handleToggleSiren}
        offlineStats={offlineStats}
        onSyncOffline={() => offlineStorage.flushOfflineBuffer()}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        dataMode={dataMode}
        onSwitchMode={handleSwitchMode}
      />

      {/* Main Operational Tab Navigation */}
      <nav className="main-nav-tabs" aria-label="Main Navigation Tabs">
        <button 
          className={`tab-btn ${currentTab === 'overview' ? 'active' : ''}`}
          onClick={() => setCurrentTab('overview')}
        >
          <LayoutDashboard size={16} />
          <span>Command Center (Overview)</span>
        </button>

        <button 
          className={`tab-btn ${currentTab === 'map' ? 'active' : ''}`}
          onClick={() => setCurrentTab('map')}
        >
          <Layers size={16} />
          <span>GIS Surface Mesh Map</span>
        </button>

        <button 
          className={`tab-btn ${currentTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setCurrentTab('telemetry')}
        >
          <Activity size={16} />
          <span>Live Telemetry & Simulator</span>
        </button>

        <button 
          className={`tab-btn ${currentTab === 'ai' ? 'active' : ''}`}
          onClick={() => setCurrentTab('ai')}
        >
          <BrainCircuit size={16} />
          <span>AI Predictive Intelligence</span>
        </button>

        <button 
          className={`tab-btn ${currentTab === 'hardware' ? 'active' : ''}`}
          onClick={() => setCurrentTab('hardware')}
        >
          <Cpu size={16} />
          <span>Hardware Studio & BOM</span>
        </button>

        <button 
          className={`tab-btn ${currentTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setCurrentTab('alerts')}
        >
          <Bell size={16} />
          <span>Early Warning & Incidents</span>
        </button>
      </nav>

      {/* Dynamic Tab Content Area */}
      <main className="main-content">
        {/* Interactive 3D Tabletop Rig & Hardware Simulator (visible when 3D Rig Sim is active) */}
        {dataMode === 'sim3d' && (
          <Interactive3DRigSimulator 
            onTelemetryUpdate={processTelemetryPacket}
            currentTilt={telemetryStream.tiltX}
            currentCrack={telemetryStream.crackWidthMm}
            currentVib={telemetryStream.vibrationG}
          />
        )}

        {/* Live USB Gateway status bar (visible when Live USB mode is active) */}
        <UsbLiveGatewayBar 
          dataMode={dataMode}
          usbStatus={usbStatus}
          onConnectUsb={handleConnectUsb}
          onDisconnectUsb={handleDisconnectUsb}
          onInjectTestPacket={handleInjectTestPacket}
        />

        {currentTab === 'overview' && (
          <OverviewDashboard 
            activeMine={activeMine}
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            disabledNodeIds={disabledNodeIds}
            onToggleNodeDisabled={handleToggleNodeDisabled}
            currentScenario={currentScenario}
            onSelectScenario={handleSelectScenario}
            telemetryStream={telemetryStream}
            timeSeriesData={timeSeriesData}
            filterDiagnostic={filterDiagnostic}
            ttfData={ttfData}
            severityIndex={severityIndex}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            dataMode={dataMode}
            usbStatus={usbStatus}
            onConnectUsb={handleConnectUsb}
            onInjectTestPacket={handleInjectTestPacket}
          />
        )}

        {currentTab === 'map' && (
          <GISMeshMap 
            nodes={nodes}
            activeMine={activeMine}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onToggleNodeDisabled={handleToggleNodeDisabled}
            disabledNodeIds={disabledNodeIds}
          />
        )}

        {currentTab === 'telemetry' && (
          <LiveTelemetrySimulator 
            currentScenario={currentScenario}
            onSelectScenario={handleSelectScenario}
            selectedNode={selectedNode}
            telemetryStream={telemetryStream}
            timeSeriesData={timeSeriesData}
            filterDiagnostic={filterDiagnostic}
            dataMode={dataMode}
            usbStatus={usbStatus}
            onConnectUsb={handleConnectUsb}
            onInjectTestPacket={handleInjectTestPacket}
          />
        )}

        {currentTab === 'ai' && (
          <AIPredictiveCenter 
            activeMine={activeMine}
            currentScenario={currentScenario}
            ttfData={ttfData}
            severityIndex={severityIndex}
            telemetryStream={telemetryStream}
          />
        )}

        {currentTab === 'hardware' && (
          <HardwareStudio />
        )}

        {currentTab === 'alerts' && (
          <AlertDispatcher 
            activeMine={activeMine}
            currentScenario={currentScenario}
            severityIndex={severityIndex}
            isSirenActive={isSirenActive}
            onToggleSiren={handleToggleSiren}
            telemetryStream={telemetryStream}
          />
        )}
      </main>

      {/* Secret Team Modal (Passcode Protected for Team MineNova6) */}
      <SecretTeamModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
      />

      {/* Wokwi Documentation & Firmware Modal */}
      <WokwiDocsModal 
        isOpen={isWokwiDocsOpen}
        onClose={() => setIsWokwiDocsOpen(false)}
      />

      {/* Official Footer with Discrete Team Access Link */}
      <footer className="app-footer">
        <div>
          <strong>SubsiGuard</strong> • AI-Enabled Wireless Surface Mesh Mine Subsidence Early Warning System
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span>Ministry of Coal / Coal India Limited</span>
          <span>•</span>
          <span 
            onClick={() => setIsTeamModalOpen(true)}
            style={{ 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              fontSize: '0.78rem'
            }}
          >
            Team MineNova6
          </span>
        </div>
      </footer>
    </div>
  );
}
