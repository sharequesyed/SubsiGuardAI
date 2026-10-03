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
import { Interactive3DRigSimulator } from './components/Interactive3DRigSimulator';

import { soundFx } from './services/soundEffects';
import { offlineStorage } from './services/offlineStorage';
import { usbGateway } from './services/usbGateway';
import { notificationService } from './services/notificationService';
import { estimateTimeToFailure, discriminateVibrationSource } from './utils/geotechMath';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [activeMine, setActiveMine] = useState(MINE_FIELDS[0]);
  const [currentTab, setCurrentTab] = useState('overview');
  const [nodes, setNodes] = useState(generateInitialNodes(MINE_FIELDS[0]));
  const [selectedNode, setSelectedNode] = useState(nodes[4]);
  const [disabledNodeIds, setDisabledNodeIds] = useState([]);
  const [currentScenario, setCurrentScenario] = useState('normal');
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [offlineStats, setOfflineStats] = useState(offlineStorage.getStats());
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState(notificationService.getPermission());

  const [dataMode, setDataMode] = useState('demo');
  const [usbStatus, setUsbStatus] = useState({
    connected: false,
    baudRate: 115200,
    portInfo: {},
    packetCount: 0,
    lastPacket: null,
    error: null,
    prototypeDemo: {
      active: false,
      stage: 'SAFE',
      cycleSeconds: 0
    }
  });

  useEffect(() => {
    const freshNodes = generateInitialNodes(activeMine);
    setNodes(freshNodes);
    setSelectedNode(freshNodes[4]);
    setDisabledNodeIds([]);
  }, [activeMine]);

  const [telemetryStream, setTelemetryStream] = useState({
    tiltX: 0.04,
    tiltY: 0.02,
    tiltRate: 0.02,
    crackWidthMm: 0.65,
    strainMmM: 0.85,
    vibrationG: 0.02,
    vibrationHz: 8
  });

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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

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

  useEffect(() => {
    const unsub = offlineStorage.subscribe((stats) => {
      setOfflineStats(stats);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = notificationService.subscribe((perm) => {
      setNotifPermission(perm);
    });
    return unsub;
  }, []);

  const handleRequestNotificationPermission = async () => {
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      notificationService.notifyTestAlert();
    }
    return perm;
  };

  const handleTestNotification = async () => {
    if (notifPermission === 'granted') {
      notificationService.notifyTestAlert();
    } else {
      await handleRequestNotificationPermission();
    }
  };

  const handleToggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleToggleSiren = () => {
    if (isSirenActive) {
      soundFx.stopSiren();
      setIsSirenActive(false);
    } else {
      soundFx.startSiren();
      setIsSirenActive(true);
      notificationService.notifyCriticalSubsidence({
        mineName: activeMine.name,
        tiltX: telemetryStream.tiltX || 0.85,
        crackMm: telemetryStream.crackWidthMm || 7.4,
        strainMmM: telemetryStream.strainMmM || 5.8,
        sector: activeMine.surfaceAssets[0]
      });
    }
  };

  const handleToggleNodeDisabled = (nodeId) => {
    setDisabledNodeIds(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });
  };

  useEffect(() => {
    usbGateway.setCallbacks({
      onData: processTelemetryPacket,
      onStatusChange: (status) => {
        setUsbStatus(prev => ({ ...prev, ...status }));
      },
      onError: (err) => {
        setUsbStatus(prev => ({ ...prev, error: err.message }));
      }
    });
  }, [activeMine]);

  const processTelemetryPacket = (packet) => {
    setTelemetryStream({
      tiltX: packet.tiltX,
      tiltY: packet.tiltY,
      tiltRate: packet.tiltX > 0.57 ? 0.38 : 0.02,
      crackWidthMm: packet.crackWidthMm,
      strainMmM: packet.strainMmM,
      vibrationG: packet.vibrationG,
      vibrationHz: packet.vibrationHz
    });

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

    setSelectedNode(curr => {
      if (curr && curr.id === packet.nodeId) {
        return {
          ...curr,
          status: packet.status,
          tiltX: packet.tiltX,
          tiltY: packet.tiltY,
          crackWidthMm: packet.crackWidthMm,
          strainMmM: packet.strainMmM,
          vibrationG: packet.vibrationG,
          vibrationHz: packet.vibrationHz
        };
      }
      return curr;
    });

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

    if (packet.status === 'CRITICAL' || packet.tiltX > 0.57) {
      setVelocityHistory([0.25, 0.65, 1.25, 2.45]);
      soundFx.playWarningChirp(1000, 0.2);
      notificationService.notifyCriticalSubsidence({
        mineName: activeMine.name,
        tiltX: packet.tiltX,
        crackMm: packet.crackWidthMm,
        strainMmM: packet.strainMmM,
        sector: activeMine.surfaceAssets[0]
      });
    } else if (packet.status === 'WARNING' || packet.tiltX > 0.25) {
      setVelocityHistory([0.05, 0.12, 0.22, 0.24]);
      notificationService.notifyWarningSubsidence({
        mineName: activeMine.name,
        tiltX: packet.tiltX,
        crackMm: packet.crackWidthMm,
        sector: activeMine.surfaceAssets[0]
      });
    } else {
      setVelocityHistory([0.02, 0.02, 0.03, 0.02]);
    }
  };

  const handleSwitchMode = (mode) => {
    setDataMode(mode);
    if (mode === 'sim3d') {
      usbGateway.stopPrototypeDemo();
      if (usbStatus.connected) usbGateway.disconnect();
    } else if (mode === 'usb') {
      if (!usbStatus.connected && !usbStatus.lastPacket && !usbStatus.prototypeDemo?.active) {
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
      usbGateway.stopPrototypeDemo();
      if (usbStatus.connected) usbGateway.disconnect();
      setTelemetryStream({
        tiltX: 0.04,
        tiltY: 0.02,
        tiltRate: 0.02,
        crackWidthMm: 0.65,
        strainMmM: 0.85,
        vibrationG: 0.02,
        vibrationHz: 8
      });
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

  const handleConnectUsb = async () => {
    const node01 = nodes.find(n => n.id === 'N01');
    if (node01) {
      setSelectedNode(node01);
    }

    try {
      await usbGateway.connect({
        onData: processTelemetryPacket,
        onStatusChange: (status) => {
          setUsbStatus(prev => ({ ...prev, ...status }));
          if (status.connected === false) {
            handleStopPrototypeDemo();
          }
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

  const handleStartPrototypeDemo = () => {
    const node01 = nodes.find(n => n.id === 'N01');
    if (node01) {
      setSelectedNode(node01);
    }

    usbGateway.startPrototypeDemo({
      onData: processTelemetryPacket,
      onStatusChange: (status) => {
        setUsbStatus(prev => ({ ...prev, ...status }));
      },
      onError: (err) => {
        setUsbStatus(prev => ({ ...prev, error: err.message }));
      }
    });
  };

  const handleStopPrototypeDemo = () => {
    usbGateway.stopPrototypeDemo();
    setUsbStatus(prev => ({
      ...prev,
      packetCount: 0,
      lastPacket: null,
      prototypeDemo: { active: false, stage: 'SAFE', cycleSeconds: 0 }
    }));
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
    setVelocityHistory([0.02, 0.02, 0.03, 0.02]);
    setNodes(prev => prev.map(n => n.id === 'N01' ? {
      ...n,
      status: 'SAFE',
      tiltX: 0.04,
      tiltY: 0.02,
      crackWidthMm: 0.65,
      strainMmM: 0.85,
      vibrationG: 0.02
    } : n));
    if (isSirenActive) {
      soundFx.stopSiren();
      setIsSirenActive(false);
    }
  };

  const handleDisconnectUsb = async () => {
    await usbGateway.disconnect();
    handleStopPrototypeDemo();
  };

  const handleInjectTestPacket = (samplePacket) => {
    usbGateway.injectSimulatedPacket(samplePacket);
  };

  const CRITICAL_NODE_IDS = ['N04', 'N05', 'N09', 'N10', 'N11'];
  const WARNING_NODE_IDS = ['N01', 'N02', 'N03', 'N06', 'N07', 'N08', 'N12', 'N21', 'N22', 'N23', 'N24'];

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

  const handleSelectScenario = (scenario) => {
    setCurrentScenario(scenario);

    const nextNodes = getUpdatedNodesForScenario(nodes, scenario);
    setNodes(nextNodes);

    if (scenario === 'critical') {
      soundFx.playWarningChirp(1000, 0.3);
      if (!isSirenActive) {
        handleToggleSiren();
      } else {
        notificationService.notifyCriticalSubsidence({
          mineName: activeMine.name,
          tiltX: 0.85,
          crackMm: 7.4,
          strainMmM: 5.8,
          sector: activeMine.surfaceAssets[0]
        });
      }
      setVelocityHistory([0.15, 0.45, 0.95, 1.85]);
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
      notificationService.notifyWarningSubsidence({
        mineName: activeMine.name,
        tiltX: 0.35,
        crackMm: 2.8,
        sector: activeMine.surfaceAssets[0]
      });
    } else if (scenario === 'reroute') {
      setDisabledNodeIds(prev => prev.includes('N04') ? prev : [...prev, 'N04']);
      if (isSirenActive) handleToggleSiren();
    } else {
      setDisabledNodeIds([]);
      setVelocityHistory([0.02, 0.02, 0.03, 0.02]);
      if (isSirenActive) handleToggleSiren();
      const defaultNode = nextNodes.find(n => n.id === 'N05');
      if (defaultNode) setSelectedNode(defaultNode);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
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
          vibHz = Math.floor(4 + Math.random() * 8);
        } else if (currentScenario === 'dumper') {
          baseTiltX = +(0.03 + (Math.random() * 0.02)).toFixed(2);
          baseTiltY = 0.02;
          crack = 0.65;
          strain = 0.85;
          vibG = +(0.62 + (Math.random() * 0.3)).toFixed(3);
          vibHz = Math.floor(70 + Math.random() * 45);
        } else if (currentScenario === 'creep') {
          baseTiltX = +(0.32 + (Math.random() * 0.04)).toFixed(2);
          baseTiltY = 0.18;
          crack = +(2.8 + (Math.random() * 0.2)).toFixed(2);
          strain = +(2.4 + (Math.random() * 0.2)).toFixed(2);
          vibG = +(0.08 + (Math.random() * 0.04)).toFixed(3);
          vibHz = Math.floor(10 + Math.random() * 6);
        } else {
          baseTiltX = +(0.04 + (Math.random() * 0.02 - 0.01)).toFixed(2);
          baseTiltY = +(0.02 + (Math.random() * 0.02 - 0.01)).toFixed(2);
          crack = +(0.65 + (Math.random() * 0.05)).toFixed(2);
          strain = +(0.85 + (Math.random() * 0.05)).toFixed(2);
          vibG = +(0.02 + (Math.random() * 0.02)).toFixed(3);
          vibHz = Math.floor(6 + Math.random() * 6);
        }

        setNodes(prevNodes => {
          const updated = getUpdatedNodesForScenario(prevNodes, currentScenario);
          setSelectedNode(curr => {
            if (!curr) return null;
            return updated.find(n => n.id === curr.id) || curr;
          });
          return updated;
        });

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

  const isUsbStandby = dataMode === 'usb' && !usbStatus.connected && !usbStatus.lastPacket && !usbStatus.prototypeDemo?.active;

  const ttfData = isUsbStandby
    ? { isAccelerating: false, ttfHours: null, displayStr: 'STANDBY', stage: 'Awaiting Hardware Ingestion', confidence: 0 }
    : estimateTimeToFailure(velocityHistory, telemetryStream.tiltX, telemetryStream.strainMmM);

  let severityIndex = 12;
  if (isUsbStandby) {
    severityIndex = 0;
  } else if (dataMode === 'sim3d' || (dataMode === 'usb' && (usbStatus.connected || usbStatus.lastPacket || usbStatus.prototypeDemo?.active))) {
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
        notifPermission={notifPermission}
        onTestNotification={handleTestNotification}
      />

      
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

      
      <main className="main-content">
        
        {dataMode === 'sim3d' && (
          <Interactive3DRigSimulator 
            onTelemetryUpdate={processTelemetryPacket}
            currentTilt={telemetryStream.tiltX}
            currentCrack={telemetryStream.crackWidthMm}
            currentVib={telemetryStream.vibrationG}
          />
        )}

        
        <UsbLiveGatewayBar 
          dataMode={dataMode}
          usbStatus={usbStatus}
          onConnectUsb={handleConnectUsb}
          onDisconnectUsb={handleDisconnectUsb}
          onInjectTestPacket={handleInjectTestPacket}
          onStartPrototypeDemo={handleStartPrototypeDemo}
          onStopPrototypeDemo={handleStopPrototypeDemo}
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
            onStartPrototypeDemo={handleStartPrototypeDemo}
            onStopPrototypeDemo={handleStopPrototypeDemo}
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
            onStartPrototypeDemo={handleStartPrototypeDemo}
            onStopPrototypeDemo={handleStopPrototypeDemo}
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
            notifPermission={notifPermission}
            onRequestPermission={handleRequestNotificationPermission}
            onTestNotification={handleTestNotification}
          />
        )}
      </main>

      
      <SecretTeamModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
      />

      
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
