import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Layers, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Truck, 
  Flame, 
  Activity, 
  Radio, 
  Cpu, 
  Terminal,
  Network,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Gauge,
  Cable
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';

export function Interactive3DRigSimulator({ 
  onTelemetryUpdate,
  currentTilt,
  currentCrack,
  currentVib
}) {
  const canvasRef = useRef(null);
  const meshCanvasRef = useRef(null);
  const circuitCanvasRef = useRef(null);

  // Active View Tab: 'geology' (Real-World Mine Cross-Section) vs 'hardware' (3D Prototype & Mesh Nodes) vs 'circuit' (Wokwi 3D Circuit Rig)
  const [activeModelTab, setActiveModelTab] = useState('geology');

  // Simulation Parameters
  const [subsidenceDepthM, setSubsidenceDepthM] = useState(0.05); // 0.05m to 2.50m
  const [isPlayingTimeLapse, setIsPlayingTimeLapse] = useState(false);
  const [timeLapseSpeed, setTimeLapseSpeed] = useState(1); // 1x, 2x
  const [timeLapseStage, setTimeLapseStage] = useState('Baseline Stable');
  const [vibrationType, setVibrationType] = useState('none'); // 'none' | 'dumper' | 'seismic'
  const [selectedHardwareComponent, setSelectedHardwareComponent] = useState('mpu'); // 'esp32' | 'lora' | 'mpu' | 'pot' | 'sw420' | 'led' | 'btn'
  const [isDumperButtonPressed, setIsDumperButtonPressed] = useState(false);

  const [serialLogs, setSerialLogs] = useState([
    '[SYSTEM] ESP32 DevKit V1 Initialized @ 240MHz',
    '[MESH] 868MHz LoRa Wireless Mesh Network Synced (36 Nodes)',
    '[I2C] MPU-6050 6-Axis Inclinometer Calibration Complete',
    '[ADC] 10k Potentiometric Extensometer Wiper Calibrated (0-50mm)',
    '[GEOTECH] Active Panel 14 Seam Depth: 180m • Angle of Draw: 21.5°',
    '[STATUS] Automated Geological & Hardware Simulation Online'
  ]);

  // Derive tilt, crack, and strain directly from Knothe inflection math
  const calculatedTilt = +(subsidenceDepthM * 1.45).toFixed(2);
  const calculatedCrack = +(subsidenceDepthM * 7.8).toFixed(1);
  const calculatedStrain = +(subsidenceDepthM * 5.2).toFixed(2);

  const isCritical = calculatedTilt > 0.57 || calculatedStrain > 5.0;
  const isWarning = !isCritical && (calculatedTilt > 0.25 || calculatedStrain > 2.5);
  const status = isCritical ? 'CRITICAL' : (isWarning ? 'WARNING' : 'SAFE');

  // Push telemetry whenever values change
  useEffect(() => {
    let vibG = 0.025;
    let vibHz = 7;
    if (vibrationType === 'dumper') {
      vibG = 0.72;
      vibHz = 85;
    } else if (vibrationType === 'seismic') {
      vibG = 0.54;
      vibHz = 9;
    }

    const packet = {
      nodeId: 'N05',
      tiltX: calculatedTilt,
      tiltY: +(calculatedTilt * 0.35).toFixed(2),
      crackWidthMm: calculatedCrack,
      strainMmM: calculatedStrain,
      vibrationG: vibG,
      vibrationHz: vibHz,
      status,
      timestamp: new Date().toLocaleTimeString('en-GB')
    };

    if (onTelemetryUpdate) {
      onTelemetryUpdate(packet);
    }

    // Determine current creep stage
    if (subsidenceDepthM < 0.3) {
      setTimeLapseStage('Stage 1: Primary Elastic Phase (Safe)');
    } else if (subsidenceDepthM < 0.9) {
      setTimeLapseStage('Stage 2: Secondary Steady Creep (Warning)');
    } else {
      setTimeLapseStage('Stage 3: Tertiary Accelerating Failure (Critical)');
    }

    const logLine = `[NODE_N05] S=${subsidenceDepthM.toFixed(2)}m | Tilt=${calculatedTilt}° | Crack=${calculatedCrack}mm | Strain=${calculatedStrain}mm/m | ${status}`;
    setSerialLogs(prev => [...prev.slice(-6), logLine]);
  }, [subsidenceDepthM, vibrationType, calculatedTilt, calculatedCrack, calculatedStrain, status]);

  // Automated 24-Hour Time-Lapse Subsidence Sequence (Hands-free demonstration)
  useEffect(() => {
    let interval = null;
    if (isPlayingTimeLapse) {
      const step = 0.04 * timeLapseSpeed;
      interval = setInterval(() => {
        setSubsidenceDepthM(prev => {
          if (prev >= 2.25) {
            setIsPlayingTimeLapse(false);
            soundFx.playWarningChirp(1200, 0.4);
            return 2.25;
          }
          const next = +(prev + step).toFixed(2);
          if (prev < 0.4 && next >= 0.4) {
            soundFx.playWarningChirp(800, 0.2); // Alert when crossing warning threshold
          }
          return next;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeLapse, timeLapseSpeed]);

  // ==========================================
  // 1. CANVAS 1: Geological Strata Diorama
  // ==========================================
  useEffect(() => {
    if (activeModelTab !== 'geology') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Sky Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.35);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Vibration Shake
      let shakeX = 0;
      let shakeY = 0;
      if (vibrationType === 'dumper') {
        shakeX = (Math.random() - 0.5) * 2.5;
        shakeY = (Math.random() - 0.5) * 1.5;
      } else if (vibrationType === 'seismic') {
        shakeX = (Math.random() - 0.5) * 6;
        shakeY = (Math.random() - 0.5) * 4;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Geological Geometry
      const groundBaseY = h * 0.34;
      const goafDepthY = h * 0.78;
      const troughCenter = w * 0.58;
      const troughRadius = w * 0.32;
      const maxDropPx = subsidenceDepthM * 28;

      const getSubsidenceAt = (x) => {
        const dist = x - troughCenter;
        const norm = dist / (troughRadius * 0.65);
        return maxDropPx * Math.exp(-0.5 * norm * norm);
      };

      // Strata Layer 1: Barakar Sandstone Overburden
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(0, groundBaseY);
      for (let x = 0; x <= w; x += 10) {
        ctx.lineTo(x, groundBaseY + getSubsidenceAt(x));
      }
      ctx.lineTo(w, h * 0.58);
      ctx.lineTo(0, h * 0.58);
      ctx.closePath();
      ctx.fill();

      // Sandstone Bedding Lines
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1;
      for (let y = groundBaseY + 25; y < h * 0.58; y += 22) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 15) {
          const sag = getSubsidenceAt(x) * ((y - groundBaseY) / (h * 0.58 - groundBaseY));
          if (x === 0) ctx.moveTo(x, y + sag);
          else ctx.lineTo(x, y + sag);
        }
        ctx.stroke();
      }

      // Strata Layer 2: Carbonaceous Shale
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.58);
      for (let x = 0; x <= w; x += 15) {
        ctx.lineTo(x, h * 0.58 + getSubsidenceAt(x) * 0.85);
      }
      ctx.lineTo(w, goafDepthY);
      ctx.lineTo(0, goafDepthY);
      ctx.closePath();
      ctx.fill();

      // Strata Layer 3: Solid Coal Seam (Anthracite Bed)
      const seamH = 22;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, goafDepthY, w, seamH);
      ctx.strokeStyle = '#52525b';
      ctx.strokeRect(0, goafDepthY, w, seamH);

      // Excavated Goaf Void Chamber
      const goafStart = troughCenter - troughRadius * 0.7;
      const goafEnd = troughCenter + troughRadius * 0.7;
      const goafWidth = goafEnd - goafStart;

      // Caved Rubble in Goaf
      ctx.fillStyle = '#18181b';
      ctx.fillRect(goafStart, goafDepthY, goafWidth, seamH);

      // Caved Roof Flexure Arch
      ctx.strokeStyle = isCritical ? '#ef4444' : '#71717a';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(goafStart, goafDepthY);
      ctx.quadraticCurveTo(troughCenter, goafDepthY + Math.min(seamH - 2, maxDropPx * 0.6), goafEnd, goafDepthY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Roof Shear Crack Lines (Angle of Draw = 21.5°)
      if (subsidenceDepthM > 0.4) {
        ctx.strokeStyle = isCritical ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(goafStart, goafDepthY);
        ctx.lineTo(troughCenter - troughRadius * 0.5, groundBaseY + getSubsidenceAt(troughCenter - troughRadius * 0.5));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(goafEnd, goafDepthY);
        ctx.lineTo(troughCenter + troughRadius * 0.5, groundBaseY + getSubsidenceAt(troughCenter + troughRadius * 0.5));
        ctx.stroke();
      }

      // Surface Topsoil Layer
      ctx.fillStyle = isCritical ? '#451a03' : '#14532d';
      ctx.beginPath();
      ctx.moveTo(0, groundBaseY);
      for (let x = 0; x <= w; x += 6) {
        ctx.lineTo(x, groundBaseY + getSubsidenceAt(x));
      }
      ctx.lineTo(w, groundBaseY + 12);
      ctx.lineTo(0, groundBaseY + 12);
      ctx.closePath();
      ctx.fill();

      // NH-19 Highway Asphalt Road Strip
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const y = groundBaseY + getSubsidenceAt(x) - 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let x = w; x >= 0; x -= 6) {
        const y = groundBaseY + getSubsidenceAt(x) + 3;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Road Centerline
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 10) {
        const y = groundBaseY + getSubsidenceAt(x);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Surface Tensile Cracks
      if (subsidenceDepthM > 0.3) {
        const crackX = troughCenter - troughRadius * 0.48;
        const crackW = Math.min(8, calculatedCrack * 0.35);

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        const y = groundBaseY + getSubsidenceAt(crackX);
        ctx.moveTo(crackX - crackW / 2, y - 4);
        ctx.lineTo(crackX + crackW / 2, y - 4);
        ctx.lineTo(crackX + 1, y + 16);
        ctx.lineTo(crackX - 1, y + 16);
        ctx.closePath();
        ctx.fill();

        if (isCritical) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.strokeRect(crackX - crackW - 2, y - 8, crackW * 2 + 4, 26);
        }
      }

      // Settlement Houses (House 1: Upright, House 2: Tilted)
      const h1X = w * 0.12;
      const h1Y = groundBaseY - 2;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(h1X, h1Y - 18, 22, 18);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(h1X - 3, h1Y - 18);
      ctx.lineTo(h1X + 11, h1Y - 28);
      ctx.lineTo(h1X + 25, h1Y - 18);
      ctx.closePath();
      ctx.fill();

      // House 2 (Tilts with Ground Slope)
      const h2X = troughCenter - troughRadius * 0.35;
      const h2Y = groundBaseY + getSubsidenceAt(h2X) - 2;
      const tiltRad = (calculatedTilt * Math.PI) / 180;

      ctx.save();
      ctx.translate(h2X + 11, h2Y);
      ctx.rotate(tiltRad * 3.5);
      ctx.fillStyle = isCritical ? '#fca5a5' : '#f8fafc';
      ctx.fillRect(-11, -18, 22, 18);
      ctx.fillStyle = isCritical ? '#991b1b' : '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-14, -18);
      ctx.lineTo(0, -28);
      ctx.lineTo(14, -18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3D Wireless Surface Mesh Nodes (N01 to N08)
      const nodeXPositions = [
        { id: 'N01', x: w * 0.18 },
        { id: 'N03', x: w * 0.32 },
        { id: 'N05', x: troughCenter - troughRadius * 0.28 },
        { id: 'N06', x: troughCenter },
        { id: 'N08', x: troughCenter + troughRadius * 0.35 }
      ];

      nodeXPositions.forEach((n) => {
        const ny = groundBaseY + getSubsidenceAt(n.x);
        const isN05 = n.id === 'N05';

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(n.x - 1.5, ny - 16, 3, 16);

        ctx.fillStyle = isN05 && isCritical ? '#ef4444' : (isN05 && isWarning ? '#f59e0b' : '#0284c7');
        ctx.fillRect(n.x - 5, ny - 24, 10, 8);

        ctx.fillStyle = isN05 && isCritical ? '#fee2e2' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(n.x, ny - 26, 2.5, 0, Math.PI * 2);
        ctx.fill();

        const waveR = (tick % 30) * 0.6;
        ctx.strokeStyle = isN05 && isCritical ? 'rgba(239, 68, 68, 0.6)' : 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, ny - 26, 4 + waveR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(n.id, n.x - 9, ny - 30);
      });

      // Annotation Card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(10, 10, 210, 68);
      ctx.strokeStyle = isCritical ? 'rgba(239, 68, 68, 0.6)' : 'rgba(2, 132, 199, 0.4)';
      ctx.strokeRect(10, 10, 210, 68);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('SUBSIDENCE TROUGH METRICS', 18, 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`Max Trough Depth: ${subsidenceDepthM.toFixed(2)} m`, 18, 41);
      ctx.fillText(`Inflection Tilt:  ${calculatedTilt.toFixed(2)}° (DGMS: 0.57°)`, 18, 55);
      ctx.fillText(`Tensile Strain:   ${calculatedStrain.toFixed(2)} mm/m`, 18, 69);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('ACTIVE COAL SEAM VOID (GOAF - 180m DEPTH)', troughCenter - 110, goafDepthY + 15);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeModelTab, subsidenceDepthM, vibrationType, calculatedTilt, calculatedCrack, calculatedStrain, isCritical, isWarning]);

  // ==========================================================
  // 2. CANVAS 2: Interactive 3D Hardware Prototype & Mesh Nodes
  // ==========================================================
  useEffect(() => {
    if (activeModelTab !== 'hardware') return;
    const canvas = meshCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let tick = 0;

    const renderHardware = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Dark Tech Grid Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Draw subtle tech circuit grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // SECTION 1: 3D FIELD SENSOR NODE HARDWARE (Left Side)
      const pcbX = 35;
      const pcbY = 45;
      const pcbW = 290;
      const pcbH = 290;

      // Outer IP67 Enclosure
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = isCritical ? '#ef4444' : '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(pcbX, pcbY, pcbW, pcbH);
      ctx.fillRect(pcbX, pcbY, pcbW, pcbH);

      // PCB Title Banner
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('NODE N05: SMART FIELD SENSOR PCB', pcbX + 15, pcbY + 22);

      // 1. ESP32 DevKit V1 Microcontroller (Center-Left)
      const espX = pcbX + 20;
      const espY = pcbY + 40;
      const espW = 90;
      const espH = 150;

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = selectedHardwareComponent === 'esp32' ? '#38bdf8' : '#475569';
      ctx.lineWidth = selectedHardwareComponent === 'esp32' ? 2 : 1;
      ctx.fillRect(espX, espY, espW, espH);
      ctx.strokeRect(espX, espY, espW, espH);

      // ESP-WROOM-32 Metal RF Shield
      ctx.fillStyle = '#334155';
      ctx.fillRect(espX + 10, espY + 15, espW - 20, 55);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('ESP-WROOM-32', espX + 14, espY + 45);

      // ESP32 Blinking TX LED
      const isTx = tick % 15 < 5;
      ctx.fillStyle = isTx ? '#38bdf8' : '#1e3a8a';
      ctx.beginPath();
      ctx.arc(espX + espW - 14, espY + espH - 20, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. SX1276 868MHz LoRa Transceiver Module (Bottom Right)
      const loraX = pcbX + 140;
      const loraY = pcbY + 130;
      const loraW = 125;
      const loraH = 65;

      ctx.fillStyle = '#18273d';
      ctx.strokeStyle = selectedHardwareComponent === 'lora' ? '#38bdf8' : '#0284c7';
      ctx.lineWidth = selectedHardwareComponent === 'lora' ? 2 : 1;
      ctx.fillRect(loraX, loraY, loraW, loraH);
      ctx.strokeRect(loraX, loraY, loraW, loraH);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('SX1276 LoRa 868MHz', loraX + 10, loraY + 22);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.fillText('SPI SCK/MISO/MOSI', loraX + 10, loraY + 40);

      // Spring Spiral Antenna
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(loraX + loraW - 10, loraY + 20);
      for (let i = 0; i < 6; i++) {
        ctx.lineTo(loraX + loraW - 10 + (i % 2 === 0 ? 5 : -5), loraY + 20 + i * 6);
      }
      ctx.stroke();

      // 3. MPU-6050 6-Axis Inclinometer (Top Right)
      const mpuX = pcbX + 140;
      const mpuY = pcbY + 40;
      const mpuW = 125;
      const mpuH = 75;

      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = selectedHardwareComponent === 'mpu' ? '#34d399' : '#059669';
      ctx.lineWidth = selectedHardwareComponent === 'mpu' ? 2 : 1;
      ctx.fillRect(mpuX, mpuY, mpuW, mpuH);
      ctx.strokeRect(mpuX, mpuY, mpuW, mpuH);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('MPU-6050 (I2C 0x68)', mpuX + 10, mpuY + 20);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${calculatedTilt.toFixed(2)}° TILT`, mpuX + 10, mpuY + 42);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '8px monospace';
      ctx.fillText(calculatedTilt > 0.57 ? 'EXCEEDS DGMS LIMIT' : 'WITHIN PERMISSIBLE', mpuX + 10, mpuY + 60);

      // 4. 10kΩ Potentiometric Crack Extensometer (Bottom Panel)
      const potX = pcbX + 20;
      const potY = pcbY + 210;
      const potW = 250;
      const potH = 65;

      ctx.fillStyle = '#312e81';
      ctx.strokeStyle = selectedHardwareComponent === 'pot' ? '#a5b4fc' : '#4338ca';
      ctx.lineWidth = selectedHardwareComponent === 'pot' ? 2 : 1;
      ctx.fillRect(potX, potY, potW, potH);
      ctx.strokeRect(potX, potY, potW, potH);

      ctx.fillStyle = '#c7d2fe';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('10kΩ POTENTIOMETRIC EXTENSOMETER', potX + 10, potY + 20);

      // Slide Potentiometer Rail & Wiper
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(potX + 10, potY + 32, potW - 20, 10);
      const wiperPos = Math.min(potW - 40, (calculatedCrack / 30) * (potW - 40));
      ctx.fillStyle = isCritical ? '#ef4444' : '#6366f1';
      ctx.fillRect(potX + 10 + wiperPos, potY + 28, 16, 18);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(potX + 10 + wiperPos, potY + 28, 16, 18);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`Crack: ${calculatedCrack.toFixed(1)} mm (Strain: ${calculatedStrain.toFixed(2)} mm/m)`, potX + 10, potY + 56);

      // SECTION 2: WIRELESS MESH TOPOLOGY INTERCONNECT (Right Side)
      const meshX = 350;
      const meshY = 45;
      const meshW = 300;
      const meshH = 290;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.fillRect(meshX, meshY, meshW, meshH);
      ctx.strokeRect(meshX, meshY, meshW, meshH);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('SURFACE MESH NETWORK TOPOLOGY', meshX + 15, meshY + 22);

      // Mesh Nodes Layout Coordinates
      const nodesMap = [
        { id: 'N01', x: meshX + 50, y: meshY + 60, status: 'SAFE' },
        { id: 'N02', x: meshX + 140, y: meshY + 55, status: 'SAFE' },
        { id: 'N03', x: meshX + 230, y: meshY + 65, status: 'SAFE' },
        { id: 'N04', x: meshX + 70, y: meshY + 140, status: isCritical ? 'CRITICAL' : 'WARNING' },
        { id: 'N05', x: meshX + 150, y: meshY + 150, status: isCritical ? 'CRITICAL' : (isWarning ? 'WARNING' : 'SAFE') },
        { id: 'N06', x: meshX + 235, y: meshY + 145, status: isCritical ? 'CRITICAL' : 'WARNING' },
        { id: 'GATEWAY', x: meshX + 150, y: meshY + 245, status: 'GATEWAY' }
      ];

      // Draw Mesh Links & Multi-hop Paths
      const links = [
        ['N01', 'N02'], ['N02', 'N03'],
        ['N01', 'N04'], ['N02', 'N05'], ['N03', 'N06'],
        ['N04', 'N05'], ['N05', 'N06'],
        ['N04', 'GATEWAY'], ['N05', 'GATEWAY'], ['N06', 'GATEWAY']
      ];

      links.forEach(([srcId, dstId]) => {
        const src = nodesMap.find(n => n.id === srcId);
        const dst = nodesMap.find(n => n.id === dstId);
        if (src && dst) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(dst.x, dst.y);
          ctx.stroke();

          // Animated packet dot traveling along links
          const linkProgress = (tick % 60) / 60;
          const px = src.x + (dst.x - src.x) * linkProgress;
          const py = src.y + (dst.y - src.y) * linkProgress;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Nodes
      nodesMap.forEach(n => {
        const isGateway = n.id === 'GATEWAY';
        const isTarget = n.id === 'N05';

        // Pulse ring for critical/target
        if (n.status === 'CRITICAL') {
          const pulseR = (tick % 25) * 0.8;
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 12 + pulseR, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = isGateway 
          ? '#10b981' 
          : (n.status === 'CRITICAL' ? '#ef4444' : (n.status === 'WARNING' ? '#f59e0b' : '#0284c7'));
        ctx.beginPath();
        ctx.arc(n.x, n.y, isGateway ? 14 : 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(n.id, n.x - (isGateway ? 16 : 8), n.y + (isGateway ? 24 : 19));
      });

      animationFrameId = requestAnimationFrame(renderHardware);
    };

    renderHardware();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeModelTab, calculatedTilt, calculatedCrack, calculatedStrain, isCritical, isWarning, selectedHardwareComponent]);

  // Render High-Fidelity 3D Wokwi Breadboard Circuit Module
  useEffect(() => {
    if (activeModelTab !== 'circuit') return;
    const canvas = circuitCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let tick = 0;

    const renderCircuit = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Dark Tech Chassis Background with Engineering Grid
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle breadboard dot grid
      ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
      for (let gx = 15; gx < w; gx += 18) {
        for (let gy = 15; gy < h; gy += 18) {
          ctx.beginPath();
          ctx.arc(gx, gy, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Title Banner inside Canvas
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('WOKWI HARDWARE EMULATION RIG • ESP32 + MPU-6050 + EXTENSOMETER + ALERT LED', 20, 20);

      // Component Geometry Matching User Wokwi Diagram
      const espX = 275;
      const espY = 55;
      const espW = 130;
      const espH = 265;

      const mpuX = 490;
      const mpuY = 25;
      const mpuW = 155;
      const mpuH = 125;

      const potX = 490;
      const potY = 195;
      const potW = 155;
      const potH = 135;

      const ledX = 110;
      const ledY = 55;

      const btnX = 65;
      const btnY = 215;
      const btnW = 95;
      const btnH = 95;

      // -------------------------------------------------------------
      // 2. WIRING TRACES (Drawn beneath boards with smooth routing)
      // -------------------------------------------------------------
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const drawWire = (points, color, width = 3, isDashed = false) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (isDashed) ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);
        ctx.beginPath();
        points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      };

      // W1: Blue Wire (I2C SDA) - ESP32 GPIO 21 -> MPU-6050 SDA
      const sdaPoints = [
        [espX + espW - 6, espY + 115],
        [435, espY + 115],
        [435, mpuY + 18],
        [mpuX + 90, mpuY + 18]
      ];
      drawWire(sdaPoints, '#2563eb', 3);

      // W2: Green/Blue Wire (I2C SCL) - ESP32 GPIO 22 -> MPU-6050 SCL
      const sclPoints = [
        [espX + espW - 6, espY + 80],
        [445, espY + 80],
        [445, mpuY + 18],
        [mpuX + 105, mpuY + 18]
      ];
      drawWire(sclPoints, '#0284c7', 3);

      // W3: Orange Wire (Analog Crack Extensometer) - Potentiometer SIG -> ESP32 GPIO 34 (ADC1)
      const sigPoints = [
        [potX + 85, potY + 122],
        [435, potY + 122],
        [435, espY + 285],
        [espX - 25, espY + 285],
        [espX - 25, espY + 105],
        [espX + 6, espY + 105]
      ];
      drawWire(sigPoints, '#f97316', 3.5);

      // W4: Red Wire (3.3V Power Bus) - ESP32 3V3 -> MPU VCC & Potentiometer VCC
      const vccPoints1 = [
        [espX + 6, espY + 245],
        [espX - 15, espY + 245],
        [espX - 15, 12],
        [mpuX + 135, 12],
        [mpuX + 135, mpuY + 18]
      ];
      drawWire(vccPoints1, '#dc2626', 2.5);

      const vccPoints2 = [
        [espX - 15, espY + 245],
        [espX - 15, potY + 122],
        [potX + 135, potY + 122]
      ];
      drawWire(vccPoints2, '#dc2626', 2.5);

      // W5: Black Wire (Ground Bus) - ESP32 GND -> MPU GND, Pot GND, Button GND, LED Cathode
      const gndPoints = [
        [espX + 6, espY + 230],
        [espX - 35, espY + 230],
        [espX - 35, 4],
        [mpuX + 120, 4],
        [mpuX + 120, mpuY + 18]
      ];
      drawWire(gndPoints, '#020617', 4);
      drawWire(gndPoints, '#334155', 2); // Black with visible outline

      const gndPotPoints = [
        [espX - 35, espY + 230],
        [espX - 35, potY + 122],
        [potX + 35, potY + 122]
      ];
      drawWire(gndPotPoints, '#334155', 2);

      const gndBtnPoints = [
        [espX - 35, espY + 230],
        [btnX + 80, espY + 230],
        [btnX + 80, btnY + 75]
      ];
      drawWire(gndBtnPoints, '#334155', 2);

      // W6: Yellow Wire (Heavy Dumper Button) - Button -> ESP32 GPIO 13
      const btnPoints = [
        [btnX + btnW - 8, btnY + 28],
        [espX - 15, btnY + 28],
        [espX - 15, espY + 215],
        [espX + 6, espY + 215]
      ];
      drawWire(btnPoints, '#eab308', 3);

      // W7: Red Wire (Alert LED) - ESP32 GPIO 4 -> 220Ω Resistor -> LED Anode
      const ledPoints = [
        [espX + espW - 6, espY + 185],
        [430, espY + 185],
        [430, 18],
        [ledX + 60, 18],
        [ledX + 60, ledY + 45],
        [ledX + 25, ledY + 45]
      ];
      drawWire(ledPoints, isCritical ? '#ef4444' : '#991b1b', 2.5);

      // Animated electron flow along I2C & Analog wires
      const packetProgress = (tick % 40) / 40;
      ctx.fillStyle = '#38bdf8';
      const pIdx = Math.floor(packetProgress * (sdaPoints.length - 1));
      if (sdaPoints[pIdx] && sdaPoints[pIdx + 1]) {
        const segProgress = (packetProgress * (sdaPoints.length - 1)) - pIdx;
        const ex = sdaPoints[pIdx][0] + (sdaPoints[pIdx + 1][0] - sdaPoints[pIdx][0]) * segProgress;
        const ey = sdaPoints[pIdx][1] + (sdaPoints[pIdx + 1][1] - sdaPoints[pIdx][1]) * segProgress;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 3. COMPONENT: ESP32 DEVKIT V4 (Center)
      // -------------------------------------------------------------
      const isEspSelected = selectedHardwareComponent === 'esp32';
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = isEspSelected ? '#38bdf8' : '#27272a';
      ctx.lineWidth = isEspSelected ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(espX, espY, espW, espH, 6);
      ctx.fill();
      ctx.stroke();

      // Dual Pin Header Strips
      const pinCount = 19;
      const pinStep = (espH - 30) / (pinCount - 1);
      for (let i = 0; i < pinCount; i++) {
        const py = espY + 15 + i * pinStep;
        // Left Pin Header
        ctx.fillStyle = '#eab308'; // Gold pin
        ctx.fillRect(espX + 4, py - 3.5, 7, 7);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(espX + 6, py - 1.5, 3, 3);

        // Right Pin Header
        ctx.fillStyle = '#eab308';
        ctx.fillRect(espX + espW - 11, py - 3.5, 7, 7);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(espX + espW - 9, py - 1.5, 3, 3);
      }

      // Pin Labels (Selection of key pins)
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('3V3', espX + 14, espY + 248);
      ctx.fillText('GND', espX + 14, espY + 233);
      ctx.fillText('D13', espX + 14, espY + 218);
      ctx.fillText('D34', espX + 14, espY + 108);

      ctx.fillText('D22', espX + espW - 27, espY + 83);
      ctx.fillText('D21', espX + espW - 27, espY + 118);
      ctx.fillText('D4', espX + espW - 24, espY + 188);

      // ESP32 Metal RF Shield
      const shieldGrad = ctx.createLinearGradient(espX + 16, espY + 30, espX + espW - 16, espY + 105);
      shieldGrad.addColorStop(0, '#e2e8f0');
      shieldGrad.addColorStop(0.5, '#cbd5e1');
      shieldGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = shieldGrad;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(espX + 16, espY + 32, espW - 32, 72, 4);
      ctx.fill();
      ctx.stroke();

      // Shield Laser Engraving
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ESP32', espX + espW / 2, espY + 65);
      ctx.font = '7px monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('WROOM-32', espX + espW / 2, espY + 77);

      // Wi-Fi radiating icon on shield
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(espX + espW / 2, espY + 92, 4, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(espX + espW / 2, espY + 92, 7, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
      ctx.textAlign = 'left';

      // Wi-Fi Meander Antenna (PCB Gold Trace at top)
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(espX + 22, espY + 20);
      ctx.lineTo(espX + 22, espY + 8);
      ctx.lineTo(espX + 42, espY + 8);
      ctx.lineTo(espX + 42, espY + 20);
      ctx.lineTo(espX + 62, espY + 20);
      ctx.lineTo(espX + 62, espY + 8);
      ctx.lineTo(espX + 82, espY + 8);
      ctx.lineTo(espX + 82, espY + 20);
      ctx.lineTo(espX + espW - 22, espY + 20);
      ctx.stroke();

      // Micro-USB Port at bottom
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(espX + espW / 2 - 18, espY + espH - 14, 36, 16, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(espX + espW / 2 - 12, espY + espH - 4, 24, 5);

      // Push Buttons on ESP32: EN & BOOT
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(espX + 18, espY + espH - 32, 14, 10);
      ctx.fillRect(espX + espW - 32, espY + espH - 32, 14, 10);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(espX + 25, espY + espH - 27, 3, 0, Math.PI * 2);
      ctx.arc(espX + espW - 25, espY + espH - 27, 3, 0, Math.PI * 2);
      ctx.fill();

      // On-board Status LEDs
      // Red Power LED (always on)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(espX + 24, espY + 120, 3, 0, Math.PI * 2);
      ctx.fill();

      // Blue Status LED (GPIO 2, blinks on packet transmit)
      const isBlueLedOn = (tick % 30) < 12 || isCritical;
      ctx.fillStyle = isBlueLedOn ? '#38bdf8' : '#1e3a8a';
      ctx.beginPath();
      ctx.arc(espX + 40, espY + 120, 3, 0, Math.PI * 2);
      ctx.fill();
      if (isBlueLedOn) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(espX + 40, espY + 120, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // CP2102 Bridge Chip
      ctx.fillStyle = '#090d16';
      ctx.fillRect(espX + espW / 2 - 14, espY + 155, 28, 28);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(espX + espW / 2 - 14, espY + 155, 28, 28);

      // -------------------------------------------------------------
      // 4. COMPONENT: MPU-6050 6-AXIS SENSOR (Top-Right)
      // -------------------------------------------------------------
      const isMpuSelected = selectedHardwareComponent === 'mpu';
      const mpuGrad = ctx.createLinearGradient(mpuX, mpuY, mpuX + mpuW, mpuY + mpuH);
      mpuGrad.addColorStop(0, '#1e40af');
      mpuGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = mpuGrad;
      ctx.strokeStyle = isMpuSelected ? '#38bdf8' : '#1d4ed8';
      ctx.lineWidth = isMpuSelected ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(mpuX, mpuY, mpuW, mpuH, 6);
      ctx.fill();
      ctx.stroke();

      // MPU Mounting Holes
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mpuX + 12, mpuY + 12, 4.5, 0, Math.PI * 2);
      ctx.arc(mpuX + mpuW - 12, mpuY + mpuH - 12, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Top Pin Headers: VCC, GND, SCL, SDA, XDA, XCL, AD0, INT
      const mpuPins = ['INT', 'AD0', 'XCL', 'XDA', 'SDA', 'SCL', 'GND', 'VCC'];
      const mpuPinStep = (mpuW - 30) / (mpuPins.length - 1);
      ctx.font = 'bold 7px monospace';
      mpuPins.forEach((pinName, i) => {
        const px = mpuX + 15 + i * mpuPinStep;
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(px, mpuY + 18, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(pinName, px, mpuY + 12);
      });
      ctx.textAlign = 'left';

      // MPU-6050 QFN-24 Chip in center
      ctx.fillStyle = '#020617';
      ctx.fillRect(mpuX + 22, mpuY + 45, 45, 45);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(mpuX + 22, mpuY + 45, 45, 45);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('MPU-6050', mpuX + 24, mpuY + 68);

      // Gold Pin-1 index dot
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(mpuX + 27, mpuY + 50, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Live 3D Artificial Horizon Dial on MPU Module
      const horizonX = mpuX + 105;
      const horizonY = mpuY + 70;
      const horizonR = 24;

      ctx.save();
      ctx.beginPath();
      ctx.arc(horizonX, horizonY, horizonR, 0, Math.PI * 2);
      ctx.clip();

      // Sky & Ground halves tilted by calculatedTilt
      ctx.translate(horizonX, horizonY);
      ctx.rotate((calculatedTilt * Math.PI) / 180);
      ctx.fillStyle = '#0284c7'; // Sky
      ctx.fillRect(-horizonR, -horizonR, horizonR * 2, horizonR);
      ctx.fillStyle = '#854d0e'; // Ground
      ctx.fillRect(-horizonR, 0, horizonR * 2, horizonR);
      // Horizon dividing line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-horizonR, 0);
      ctx.lineTo(horizonR, 0);
      ctx.stroke();
      ctx.restore();

      // Dial Outer Ring
      ctx.strokeStyle = isCritical ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(horizonX, horizonY, horizonR, 0, Math.PI * 2);
      ctx.stroke();

      // Horizon readout text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`Tilt: ${calculatedTilt.toFixed(2)}°`, mpuX + 18, mpuY + 110);
      ctx.font = '7.5px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`(Roll: ${(calculatedTilt * 0.35).toFixed(2)}°)`, mpuX + 88, mpuY + 110);

      // -------------------------------------------------------------
      // 5. COMPONENT: ROTARY POTENTIOMETER / EXTENSOMETER (Bottom-Right)
      // -------------------------------------------------------------
      const isPotSelected = selectedHardwareComponent === 'pot';
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = isPotSelected ? '#38bdf8' : '#1d4ed8';
      ctx.lineWidth = isPotSelected ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(potX, potY, potW, potH, 6);
      ctx.fill();
      ctx.stroke();

      // Potentiometer Mounting Holes
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(potX + 12, potY + 12, 4.5, 0, Math.PI * 2);
      ctx.arc(potX + potW - 12, potY + 12, 4.5, 0, Math.PI * 2);
      ctx.arc(potX + potW - 12, potY + potH - 12, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotary Knob Assembly
      const knobX = potX + potW / 2;
      const knobY = potY + 55;
      const knobR = 32;

      // Outer Metal Bevel
      const knobGrad = ctx.createLinearGradient(knobX - knobR, knobY - knobR, knobX + knobR, knobY + knobR);
      knobGrad.addColorStop(0, '#f1f5f9');
      knobGrad.addColorStop(0.5, '#cbd5e1');
      knobGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = knobGrad;
      ctx.beginPath();
      ctx.arc(knobX, knobY, knobR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner Dial Face
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(knobX, knobY, knobR - 7, 0, Math.PI * 2);
      ctx.fill();

      // Knob Rotation Angle based on calculatedCrack (0 to 30mm mapped to -135° to +135°)
      const knobAngleRad = ((-135 + Math.min(270, (calculatedCrack / 30) * 270)) * Math.PI) / 180;
      ctx.strokeStyle = isCritical ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(knobX, knobY);
      ctx.lineTo(knobX + Math.cos(knobAngleRad) * (knobR - 9), knobY + Math.sin(knobAngleRad) * (knobR - 9));
      ctx.stroke();

      // Center pivot cap
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(knobX, knobY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Bottom Pin Header: GND, SIG, VCC
      const potPins = [
        { name: 'GND', x: potX + 35 },
        { name: 'SIG', x: potX + 85 },
        { name: 'VCC', x: potX + 135 }
      ];
      ctx.font = 'bold 7px monospace';
      potPins.forEach(p => {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(p.x, potY + potH - 14, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x, potY + potH - 4);
      });
      ctx.textAlign = 'left';

      // Potentiometer Readout Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`Crack: ${calculatedCrack.toFixed(1)} mm`, potX + 16, potY + 105);
      ctx.font = '7px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`ADC: ${Math.round((calculatedCrack / 30) * 4095)}`, potX + 96, potY + 105);

      // -------------------------------------------------------------
      // 6. COMPONENT: CRITICAL ALERT LED & 220Ω RESISTOR (Top-Left)
      // -------------------------------------------------------------
      const isLedSelected = selectedHardwareComponent === 'led';
      const isLedBlinking = isCritical && (tick % 24 < 14);

      // Glowing Halo when Alert LED is active
      if (isLedBlinking || isCritical) {
        const haloGrad = ctx.createRadialGradient(ledX, ledY, 4, ledX, ledY, 38);
        haloGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
        haloGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.35)');
        haloGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(ledX, ledY, 38, 0, Math.PI * 2);
        ctx.fill();
      }

      // LED 5mm Red Dome
      const ledGrad = ctx.createRadialGradient(ledX - 3, ledY - 3, 1, ledX, ledY, 13);
      if (isLedBlinking || isCritical) {
        ledGrad.addColorStop(0, '#fecaca');
        ledGrad.addColorStop(0.4, '#ef4444');
        ledGrad.addColorStop(1, '#b91c1c');
      } else {
        ledGrad.addColorStop(0, '#7f1d1d');
        ledGrad.addColorStop(0.6, '#450a0a');
        ledGrad.addColorStop(1, '#1f0404');
      }
      ctx.fillStyle = ledGrad;
      ctx.beginPath();
      ctx.arc(ledX, ledY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 220Ω Resistor
      const resX = ledX - 22;
      const resY = ledY + 40;
      const resW = 44;
      const resH = 14;

      // Resistor Leads
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ledX - 35, resY + resH / 2);
      ctx.lineTo(resX + resW + 15, resY + resH / 2);
      ctx.stroke();

      // Beige Ceramic Body
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(resX, resY, resW, resH, 3);
      ctx.fill();
      ctx.stroke();

      // Color Bands: Red (2), Red (2), Brown (x10), Gold (5%)
      ctx.fillStyle = '#dc2626'; // Red 1
      ctx.fillRect(resX + 8, resY, 3.5, resH);
      ctx.fillRect(resX + 16, resY, 3.5, resH); // Red 2
      ctx.fillStyle = '#78350f'; // Brown 3
      ctx.fillRect(resX + 24, resY, 3.5, resH);
      ctx.fillStyle = '#eab308'; // Gold 4
      ctx.fillRect(resX + 32, resY, 3.5, resH);

      ctx.fillStyle = isCritical ? '#ef4444' : '#94a3b8';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(isCritical ? 'ALERT ON (220Ω)' : 'Alert LED (220Ω)', ledX - 36, resY + resH + 14);

      // -------------------------------------------------------------
      // 7. COMPONENT: HEAVY DUMPER TACTILE PUSH BUTTON (Bottom-Left)
      // -------------------------------------------------------------
      const isBtnSelected = selectedHardwareComponent === 'btn' || selectedHardwareComponent === 'sw420';
      const isDepressed = isDumperButtonPressed || vibrationType === 'dumper';

      // Square Metal Bracket
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = isBtnSelected ? '#38bdf8' : '#64748b';
      ctx.lineWidth = isBtnSelected ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 6);
      ctx.fill();
      ctx.stroke();

      // 4 Corner Metal Solder Tabs
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(btnX - 5, btnY + 12, 6, 8);
      ctx.fillRect(btnX - 5, btnY + btnH - 20, 6, 8);
      ctx.fillRect(btnX + btnW - 1, btnY + 12, 6, 8);
      ctx.fillRect(btnX + btnW - 1, btnY + btnH - 20, 6, 8);

      // Center Tactile Button Cap
      const btnR = isDepressed ? 20 : 23;
      const btnGrad = ctx.createRadialGradient(btnX + btnW / 2 - 4, btnY + btnH / 2 - 4, 3, btnX + btnW / 2, btnY + btnH / 2, btnR);
      if (isDepressed) {
        btnGrad.addColorStop(0, '#b91c1c');
        btnGrad.addColorStop(1, '#7f1d1d');
      } else {
        btnGrad.addColorStop(0, '#f87171');
        btnGrad.addColorStop(0.6, '#ef4444');
        btnGrad.addColorStop(1, '#b91c1c');
      }
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.arc(btnX + btnW / 2, btnY + btnH / 2, btnR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Button Label & Interactive Hint
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Heavy Dumper', btnX + btnW / 2, btnY + btnH + 12);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '7px monospace';
      ctx.fillText('Vibration (GPIO 13)', btnX + btnW / 2, btnY + btnH + 21);
      ctx.textAlign = 'left';

      animationFrameId = requestAnimationFrame(renderCircuit);
    };

    renderCircuit();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeModelTab, calculatedTilt, calculatedCrack, calculatedStrain, isCritical, isWarning, selectedHardwareComponent, isDumperButtonPressed, vibrationType, subsidenceDepthM]);

  // Click Handler for Interactive 3D Circuit Module Canvas
  const handleCircuitCanvasClick = (e) => {
    const canvas = circuitCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // 1. Click on Heavy Dumper Push Button (btnX = 65, btnY = 215, w = 95, h = 95)
    if (clickX >= 55 && clickX <= 170 && clickY >= 200 && clickY <= 325) {
      setIsDumperButtonPressed(true);
      setVibrationType('dumper');
      soundFx.playWarningChirp(600, 0.15);
      setTimeout(() => setIsDumperButtonPressed(false), 350);
      setTimeout(() => setVibrationType('none'), 1800);
      setSelectedHardwareComponent('sw420');
      return;
    }

    // 2. Click on Potentiometer (potX = 490, potY = 195, w = 155, h = 135)
    if (clickX >= 480 && clickX <= 655 && clickY >= 185 && clickY <= 340) {
      setSelectedHardwareComponent('pot');
      const nextDepth = subsidenceDepthM >= 2.0 ? 0.05 : +(subsidenceDepthM + 0.35).toFixed(2);
      setSubsidenceDepthM(nextDepth);
      soundFx.playWarningChirp(800, 0.08);
      return;
    }

    // 3. Click on MPU-6050 (mpuX = 490, mpuY = 25, w = 155, h = 125)
    if (clickX >= 480 && clickX <= 655 && clickY >= 20 && clickY <= 160) {
      setSelectedHardwareComponent('mpu');
      soundFx.playWarningChirp(900, 0.08);
      return;
    }

    // 4. Click on Alert LED (ledX = 110, ledY = 55)
    if (clickX >= 75 && clickX <= 160 && clickY >= 35 && clickY <= 140) {
      setSelectedHardwareComponent('led');
      soundFx.playWarningChirp(1200, 0.1);
      return;
    }

    // 5. Click on ESP32 (espX = 275, espY = 55, w = 130, h = 265)
    if (clickX >= 265 && clickX <= 415 && clickY >= 50 && clickY <= 330) {
      setSelectedHardwareComponent('esp32');
      soundFx.playWarningChirp(1000, 0.08);
      return;
    }
  };

  // Automated Time-Lapse Trigger: 0 to 2.25m
  const handleStartAutoTimeLapse = () => {
    setSubsidenceDepthM(0.05);
    setIsPlayingTimeLapse(true);
  };

  // Reset to Baseline
  const handleReset = () => {
    setSubsidenceDepthM(0.05);
    setIsPlayingTimeLapse(false);
    setVibrationType('none');
  };

  return (
    <div className="card" style={{ marginBottom: '1.25rem', border: isCritical ? '1px solid var(--color-critical-border)' : '1px solid var(--border-color)' }}>
      {/* Header with Sub-Tab Switcher */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h3 className="card-title">
              {activeModelTab === 'geology' ? (
                <Layers size={18} style={{ color: 'var(--brand-primary)' }} />
              ) : activeModelTab === 'hardware' ? (
                <Cpu size={18} style={{ color: '#10b981' }} />
              ) : (
                <Cable size={18} style={{ color: '#38bdf8' }} />
              )}
              {activeModelTab === 'geology' 
                ? 'Real-World Mine Subsidence Geological Simulation' 
                : activeModelTab === 'hardware' 
                ? '3D Smart Sensor Prototype & Wireless Mesh Topology'
                : '3D Interactive ESP32 Sensor Hardware Circuit (Wokwi Architecture)'}
            </h3>
            <span className={`badge ${isCritical ? 'badge-critical' : (isWarning ? 'badge-warning' : 'badge-safe')}`} style={{ fontSize: '0.72rem' }}>
              <span className="status-pulse-dot" style={{ width: 6, height: 6 }}></span>
              STATUS: {status}
            </span>
          </div>
          <div className="card-desc">
            {activeModelTab === 'geology' 
              ? 'Geotechnical cross-section: 180m deep goaf collapse causing surface subsidence bowl along NH-19'
              : activeModelTab === 'hardware' 
              ? 'Interactive hardware component breakdown (ESP32, SX1276 LoRa, MPU-6050, Extensometer) and multi-hop mesh links'
              : 'Interactive breadboard circuit: ESP32 DevKit, MPU-6050 I2C Inclinometer, Crack Potentiometer, Alert LED, and Dumper Vibration push button'}
          </div>
        </div>

        {/* View Switcher Tabs: Geology vs Hardware Prototype vs 3D Circuit Rig */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="mode-switch-group">
            <button 
              className={`mode-btn ${activeModelTab === 'geology' ? 'active' : ''}`}
              onClick={() => setActiveModelTab('geology')}
              title="View Real-World Geological Strata Cross-Section"
            >
              <Layers size={13} />
              <span>Geological Strata</span>
            </button>
            <button 
              className={`mode-btn ${activeModelTab === 'hardware' ? 'active' : ''}`}
              onClick={() => setActiveModelTab('hardware')}
              title="View 3D Sensor Node Hardware & Wireless Mesh Interconnect"
            >
              <Cpu size={13} />
              <span>3D Prototype & Mesh</span>
            </button>
            <button 
              className={`mode-btn ${activeModelTab === 'circuit' ? 'active' : ''}`}
              onClick={() => setActiveModelTab('circuit')}
              title="View Interactive 3D Wokwi Hardware Circuit (ESP32, MPU-6050, Extensometer, Alert LED, Dumper Button)"
            >
              <Cable size={13} />
              <span>3D Circuit Rig</span>
            </button>
          </div>

          {/* Reset Baseline */}
          <button 
            className="btn-secondary"
            onClick={handleReset}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
            title="Reset to safe ground baseline"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* AUTOMATED TIME-LAPSE CONTROL BANNER (Zero-effort automated simulation for jury) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        background: isCritical ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-tertiary)',
        border: isCritical ? '1px solid var(--color-critical-border)' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="btn-secondary"
            onClick={handleStartAutoTimeLapse}
            disabled={isPlayingTimeLapse}
            style={{ 
              background: isPlayingTimeLapse ? 'var(--brand-primary)' : 'var(--bg-card)', 
              color: isPlayingTimeLapse ? '#ffffff' : 'var(--text-primary)',
              fontWeight: 700,
              padding: '0.45rem 0.9rem',
              fontSize: '0.78rem'
            }}
            title="Play automatic 24-hour progressive subsidence sequence without touching sliders"
          >
            {isPlayingTimeLapse ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlayingTimeLapse ? 'Playing Time-Lapse...' : 'Auto-Play 24h Time-Lapse'}</span>
          </button>

          {isPlayingTimeLapse && (
            <button 
              className="btn-secondary"
              onClick={() => setIsPlayingTimeLapse(false)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
            >
              Pause
            </button>
          )}

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isCritical ? 'var(--color-critical)' : 'var(--brand-primary)' }}>
              {timeLapseStage}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Automated mine advance: <strong>{subsidenceDepthM.toFixed(2)}m</strong> depth • <strong>{calculatedTilt.toFixed(2)}°</strong> tilt • <strong>{calculatedCrack.toFixed(1)}mm</strong> crack
            </div>
          </div>
        </div>

        {/* Speed toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Speed:</span>
          <button 
            className={`btn-secondary ${timeLapseSpeed === 1 ? 'active' : ''}`}
            onClick={() => setTimeLapseSpeed(1)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
          >
            1x
          </button>
          <button 
            className={`btn-secondary ${timeLapseSpeed === 2 ? 'active' : ''}`}
            onClick={() => setTimeLapseSpeed(2)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
          >
            2x
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport: 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* LEFT VIEWPORT: Canvas based on active sub-tab */}
        <div style={{
          background: '#090d16',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {activeModelTab === 'geology' ? (
            <canvas 
              ref={canvasRef} 
              width={680} 
              height={360}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          ) : activeModelTab === 'hardware' ? (
            <canvas 
              ref={meshCanvasRef} 
              width={680} 
              height={360}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          ) : (
            <canvas 
              ref={circuitCanvasRef} 
              width={680} 
              height={360}
              onClick={handleCircuitCanvasClick}
              style={{ width: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}
              title="Click on the Push Button to test vibration, or Potentiometer to adjust crack"
            />
          )}

          <div style={{
            position: 'absolute',
            bottom: '0.5rem',
            right: '0.75rem',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            {activeModelTab === 'geology' 
              ? 'Knothe-CIMFR Model • Cross-Section View' 
              : activeModelTab === 'hardware'
              ? '868MHz LoRa Mesh • ESP-NOW Clustering'
              : 'Wokwi ESP32 Architecture • Real-Time Interactive Rig'}
          </div>
        </div>

        {/* RIGHT CONTROLS: Sliders & Event Triggers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {activeModelTab === 'circuit' ? (
            /* Dedicated Circuit Module Controls */
            <>
              {/* Manual Slider: Potentiometer Extensometer */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sliders size={14} style={{ color: 'var(--brand-primary)' }} />
                    <span>Crack Extensometer (Potentiometer)</span>
                  </label>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: calculatedCrack > 5.0 ? 'var(--color-critical)' : 'var(--text-primary)' }}>
                    {calculatedCrack.toFixed(1)} mm
                  </span>
                </div>

                <input 
                  type="range"
                  min="0.02"
                  max="2.50"
                  step="0.05"
                  value={subsidenceDepthM}
                  onChange={(e) => {
                    setIsPlayingTimeLapse(false);
                    setSubsidenceDepthM(parseFloat(e.target.value));
                  }}
                  style={{ width: '100%', cursor: 'pointer', accentColor: calculatedCrack > 5.0 ? '#ef4444' : 'var(--brand-primary)' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <span>0.4 mm (Nominal)</span>
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>2.5 mm (Advisory)</span>
                  <span style={{ color: 'var(--color-critical)', fontWeight: 600 }}>19.5 mm (Failure)</span>
                </div>
              </div>

              {/* Hardware Pin Status Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MPU-6050 I2C (21/22)</div>
                  <div style={{ fontSize: '1.15rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: calculatedTilt > 0.57 ? 'var(--color-critical)' : 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {calculatedTilt.toFixed(2)}°
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    0x68 Fast-mode 400kHz
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alert LED (GPIO 4)</div>
                  <div style={{ fontSize: '1.15rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isCritical ? '#ef4444' : '#10b981', marginTop: '0.15rem' }}>
                    {isCritical ? 'ALERT ON' : 'OFF'}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: isCritical ? '#ef4444' : 'var(--text-muted)' }}>
                    {isCritical ? '220Ω Limiting • 3.3V' : 'Threshold Armed'}
                  </div>
                </div>
              </div>

              {/* Action Trigger Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setIsDumperButtonPressed(true);
                    setVibrationType('dumper');
                    soundFx.playWarningChirp(600, 0.15);
                    setTimeout(() => setIsDumperButtonPressed(false), 350);
                    setTimeout(() => setVibrationType('none'), 1800);
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', fontSize: '0.74rem', fontWeight: 600 }}
                  title="Trigger Heavy Dumper Vibration on GPIO 13"
                >
                  <Truck size={14} style={{ color: 'var(--color-warning)' }} />
                  <span>Press Dumper Btn</span>
                </button>

                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setSubsidenceDepthM(1.95);
                    setVibrationType('seismic');
                    soundFx.playWarningChirp(1200, 0.4);
                    setTimeout(() => setVibrationType('none'), 2200);
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', fontSize: '0.74rem', fontWeight: 600, color: 'var(--color-critical)', borderColor: 'var(--color-critical-border)' }}
                  title="Trigger High Tilt & Tensile Crack Opening"
                >
                  <Flame size={14} />
                  <span>Trip Alert LED</span>
                </button>
              </div>

              {/* Live Wokwi UART Stream */}
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                padding: '0.55rem 0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                lineHeight: '1.4',
                maxHeight: '100px',
                overflowY: 'auto',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                  <Terminal size={11} />
                  <span>WOKWI UART STREAM (115200 BAUD)</span>
                </div>
                <div>{`[I2C] MPU-6050: ax=${(calculatedTilt * 0.015).toFixed(3)}g, ay=0.012g, az=0.998g`}</div>
                <div>{`[ADC] Potentiometer Raw=${Math.round((calculatedCrack / 30) * 4095)} -> Crack=${calculatedCrack.toFixed(1)}mm`}</div>
                <div style={{ color: isCritical ? '#ef4444' : '#10b981' }}>{`[GPIO 4] Alert LED Status: ${isCritical ? 'HIGH (BREACH)' : 'LOW (SAFE)'}`}</div>
                <div>{`[GPIO 13] Heavy Dumper Btn: ${vibrationType === 'dumper' ? 'ACTIVE (75Hz filter pass)' : 'IDLE'}`}</div>
              </div>
            </>
          ) : (
            /* Geological & 3D Prototype Controls */
            <>
              {/* Manual Slider: Subsidence Depth */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Activity size={14} style={{ color: 'var(--brand-primary)' }} />
                    <span>Subsidence Depth (W_max)</span>
                  </label>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: subsidenceDepthM > 0.4 ? 'var(--color-critical)' : 'var(--text-primary)' }}>
                    {subsidenceDepthM.toFixed(2)} m
                  </span>
                </div>

                <input 
                  type="range"
                  min="0.02"
                  max="2.50"
                  step="0.05"
                  value={subsidenceDepthM}
                  onChange={(e) => {
                    setIsPlayingTimeLapse(false);
                    setSubsidenceDepthM(parseFloat(e.target.value));
                  }}
                  style={{ width: '100%', cursor: 'pointer', accentColor: subsidenceDepthM > 0.4 ? '#ef4444' : 'var(--brand-primary)' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <span>0.05m (Safe)</span>
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>0.40m (DGMS 0.57°)</span>
                  <span style={{ color: 'var(--color-critical)', fontWeight: 600 }}>2.50m (Failure)</span>
                </div>
              </div>

              {/* Geological Readings Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inflection Tilt</div>
                  <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: calculatedTilt > 0.57 ? 'var(--color-critical)' : 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {calculatedTilt.toFixed(2)}°
                  </div>
                  <div style={{ fontSize: '0.62rem', color: calculatedTilt > 0.57 ? 'var(--color-critical)' : 'var(--text-muted)' }}>
                    DGMS Limit: 0.57°
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Crack / Strain</div>
                  <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: calculatedStrain > 5.0 ? 'var(--color-critical)' : 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {calculatedCrack.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>mm</span>
                  </div>
                  <div style={{ fontSize: '0.62rem', color: calculatedStrain > 5.0 ? 'var(--color-critical)' : 'var(--text-muted)' }}>
                    Strain: {calculatedStrain.toFixed(2)} mm/m
                  </div>
                </div>
              </div>

              {/* Action Trigger Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setVibrationType('dumper');
                    soundFx.playWarningChirp(600, 0.15);
                    setTimeout(() => setVibrationType('none'), 1800);
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', fontSize: '0.74rem', fontWeight: 600 }}
                  title="Demonstrate 3-layer false alarm rejection of 50-tonne coal dumper"
                >
                  <Truck size={14} style={{ color: 'var(--color-warning)' }} />
                  <span>Pass 50T Dumper</span>
                </button>

                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setSubsidenceDepthM(1.95);
                    setVibrationType('seismic');
                    soundFx.playWarningChirp(1200, 0.4);
                    setTimeout(() => setVibrationType('none'), 2200);
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', fontSize: '0.74rem', fontWeight: 600, color: 'var(--color-critical)', borderColor: 'var(--color-critical-border)' }}
                  title="Simulate sudden underground roof cave-in"
                >
                  <Flame size={14} />
                  <span>Roof Cave-In</span>
                </button>
              </div>

              {/* Telemetry Log Stream */}
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                padding: '0.55rem 0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                lineHeight: '1.4',
                maxHeight: '100px',
                overflowY: 'auto',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                  <Terminal size={11} />
                  <span>MESH TELEMETRY STREAM (115200 BAUD)</span>
                </div>
                {serialLogs.map((line, idx) => (
                  <div key={idx} style={{ color: line.includes('CRITICAL') ? 'var(--color-critical)' : 'inherit', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {line}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
