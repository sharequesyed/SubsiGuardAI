
class UsbGatewayService {
  constructor() {
    this.port = null;
    this.reader = null;
    this.readableStreamClosed = null;
    this.isConnected = false;
    this.packetCount = 0;
    this.callbacks = {
      onData: null,
      onStatusChange: null,
      onError: null
    };
    this.prototypeDemo = {
      active: false,
      stage: 'SAFE',
      cycleSeconds: 0
    };
    this.demoInterval = null;
    this.startTime = null;

    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      navigator.serial.addEventListener('disconnect', (event) => {
        if (this.port && event.target === this.port) {
          console.log('ESP32 USB board physically disconnected');
          this.disconnect();
        }
      });
    }
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  async connect(callbacks = {}) {
    this.callbacks = { ...this.callbacks, ...callbacks };

    if (!this.isSupported()) {
      const err = new Error('Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      if (this.callbacks.onError) this.callbacks.onError(err);
      throw err;
    }

    try {
      this.port = await navigator.serial.requestPort();

      await this.port.open({ 
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      this.isConnected = true;
      this.packetCount = 0;
      this.hasReceivedHardwareData = false;

      try {
        await this.port.setSignals({ requestToSend: true, dataTerminalReady: false });
        await new Promise(r => setTimeout(r, 100));
        await this.port.setSignals({ requestToSend: false, dataTerminalReady: false });
      } catch (sigErr) {
      }

      this.startReading();

      this.startPrototypeDemo({}, 'SAFE', 2000);

      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({
          connected: true,
          baudRate: 115200,
          portInfo: this.port.getInfo ? this.port.getInfo() : {},
          packetCount: 0,
          isHardwareStream: false,
          prototypeDemo: { ...this.prototypeDemo }
        });
      }

      return true;
    } catch (err) {
      this.isConnected = false;
      this.stopPrototypeDemo();
      if (this.callbacks.onError) this.callbacks.onError(err);
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({
          connected: false,
          error: err.message,
          prototypeDemo: { ...this.prototypeDemo }
        });
      }
      throw err;
    }
  }

  async startReading() {
    const textDecoder = new TextDecoderStream();
    this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();

    let buffer = '';

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length > 0) {
            this.handleIncomingLine(trimmed);
          }
        }
      }
    } catch (err) {
      if (this.callbacks.onError) this.callbacks.onError(err);
    } finally {
      if (this.reader) {
        try { this.reader.releaseLock(); } catch (_) {}
      }
      if (this.isConnected) {
        this.disconnect();
      }
    }
  }

  handleIncomingLine(rawLine) {
    let parsed = null;

    if (rawLine.startsWith('{') && rawLine.endsWith('}')) {
      try {
        parsed = JSON.parse(rawLine);
      } catch (e) {
      }
    }

    if (!parsed && rawLine.includes(':')) {
      const parts = rawLine.split(',');
      const kv = {};
      parts.forEach(part => {
        const [k, v] = part.split(':').map(s => s.trim());
        if (k && v !== undefined) kv[k.toUpperCase()] = v;
      });

      if (kv.NODE || kv.TILT) {
        parsed = {
          node: kv.NODE || 'N05',
          tilt: parseFloat(kv.TILT || '0'),
          vib: parseFloat(kv.VIB || '0'),
          crack: parseFloat(kv.CRACK || '0'),
          strain: parseFloat(kv.STRAIN || '0'),
          status: kv.STATUS || (parseFloat(kv.TILT || 0) > 0.57 ? 'CRITICAL' : 'SAFE')
        };
      }
    }

    if (!parsed && rawLine.includes(',')) {
      const tokens = rawLine.split(',').map(s => s.trim());
      if (tokens.length >= 2) {
        parsed = {
          node: tokens[0].startsWith('N') ? tokens[0] : 'N05',
          tilt: parseFloat(tokens[1]) || 0,
          vib: parseFloat(tokens[2]) || 0,
          crack: parseFloat(tokens[3]) || 0,
          strain: parseFloat(tokens[4]) || 0,
          status: (parseFloat(tokens[1]) > 0.57) ? 'CRITICAL' : 'SAFE'
        };
      }
    }

    if (parsed && parsed.msg === 'SUBSIGUARD_BOOT') {
      console.log('Board boot notification received. Auto-syncing to SAFE.');
      this.syncStage('SAFE');
      return;
    }

    if (parsed) {
      this.packetCount++;

      if (!this.isHardwareDataStreaming && (parsed.tilt !== undefined || parsed.tiltX !== undefined)) {
        this.isHardwareDataStreaming = true;
        if (this.demoInterval) {
          clearInterval(this.demoInterval);
          this.demoInterval = null;
        }
      }

      const stage = parsed.status || (parseFloat(parsed.tilt || 0) > 0.57 ? 'CRITICAL' : (parseFloat(parsed.tilt || 0) > 0.25 ? 'WARNING' : 'SAFE'));
      this.prototypeDemo.active = true;
      this.prototypeDemo.stage = stage;
      this.prototypeDemo.isHardwareStream = Boolean(this.isHardwareDataStreaming);

      const packet = {
        nodeId: parsed.node || parsed.nodeId || 'N01',
        tiltX: +(parseFloat(parsed.tilt || parsed.tiltX || 0).toFixed(2)),
        tiltY: +(parseFloat(parsed.tiltY || (parsed.tilt ? parsed.tilt * 0.15 : 0.02)).toFixed(2)),
        vibrationG: +(parseFloat(parsed.vib || parsed.vibrationG || 0.02).toFixed(3)),
        vibrationHz: parseInt(parsed.vibHz || parsed.vibrationHz || 8, 10),
        crackWidthMm: +(parseFloat(parsed.crack || parsed.crackWidthMm || 0.65).toFixed(2)),
        strainMmM: +(parseFloat(parsed.strain || parsed.strainMmM || 0.85).toFixed(2)),
        status: stage,
        raw: rawLine,
        timestamp: new Date().toLocaleTimeString('en-GB')
      };

      if (this.callbacks.onData) {
        this.callbacks.onData(packet);
      }

      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({
          connected: this.isConnected,
          packetCount: this.packetCount,
          lastPacket: packet,
          isHardwareStream: Boolean(this.isHardwareDataStreaming),
          prototypeDemo: { ...this.prototypeDemo }
        });
      }
    }
  }

  injectSimulatedPacket(data) {
    const raw = typeof data === 'string' ? data : JSON.stringify(data);
    this.handleIncomingLine(raw);
  }

  setCallbacks(callbacks = {}) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  startPrototypeDemo(callbacks = {}, initialStage = 'SAFE', bootDelayMs = 0) {
    if (callbacks && Object.keys(callbacks).length > 0) {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }

    this.stopPrototypeDemo();

    const now = Date.now();
    let offsetMs = 0;
    if (initialStage === 'WARNING') offsetMs = 12000;
    else if (initialStage === 'CRITICAL') offsetMs = 24000;

    this.bootDelayMs = bootDelayMs;
    this.bootStartTime = now;
    this.startTime = now + bootDelayMs - offsetMs;

    this.prototypeDemo = {
      active: true,
      stage: bootDelayMs > 0 ? 'BOOTING' : initialStage,
      cycleSeconds: Math.floor(offsetMs / 1000),
      secondsInStage: 0
    };

    this.tickPrototypeDemo();

    this.demoInterval = setInterval(() => {
      this.tickPrototypeDemo();
    }, 500);
  }

  syncStage(stageName) {
    if (!this.prototypeDemo.active) {
      this.startPrototypeDemo({}, stageName);
      return;
    }

    const now = Date.now();
    let offsetMs = 0;
    if (stageName === 'WARNING') offsetMs = 12000;
    else if (stageName === 'CRITICAL') offsetMs = 24000;

    this.bootDelayMs = 0;
    this.startTime = now - offsetMs;
    this.prototypeDemo.stage = stageName;
    this.prototypeDemo.cycleSeconds = Math.floor(offsetMs / 1000);
    this.prototypeDemo.secondsInStage = 0;

    this.tickPrototypeDemo();
  }

  adjustPhase(secondsDelta) {
    if (!this.prototypeDemo.active) return;
    this.startTime += (secondsDelta * 1000);
    this.tickPrototypeDemo();
  }

  tickPrototypeDemo() {
    if (!this.prototypeDemo.active) return;

    const now = Date.now();

    if (this.bootDelayMs > 0 && now < this.startTime) {
      this.prototypeDemo.stage = 'BOOTING';
      this.prototypeDemo.cycleSeconds = 0;
      this.prototypeDemo.secondsInStage = 0;
      const payload = {
        node: 'N01',
        nodeId: 'N01',
        tilt: 0.18,
        tiltX: 0.18,
        tiltY: 0.02,
        vib: 0.022,
        vibrationG: 0.022,
        vibHz: 7,
        vibrationHz: 7,
        crack: 0.32,
        crackWidthMm: 0.32,
        strain: 0.44,
        strainMmM: 0.44,
        status: 'SAFE'
      };
      this.injectSimulatedPacket(payload);
      return;
    }

    const elapsedMs = ((now - this.startTime) % 36000 + 36000) % 36000;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    this.prototypeDemo.cycleSeconds = elapsedSec;

    let stage = 'SAFE';
    let baseTilt = 0.18;
    let baseVib = 0.022;
    let baseCrack = 0.32;
    let baseStrain = 0.44;
    let noiseAmp = { tilt: 0.035, vib: 0.004, crack: 0.025, strain: 0.035 };
    let vibHz = 7;

    if (elapsedSec < 12) {
      stage = 'SAFE';
      baseTilt = 0.18;
      baseVib = 0.022;
      baseCrack = 0.32;
      baseStrain = 0.44;
      noiseAmp = { tilt: 0.035, vib: 0.004, crack: 0.025, strain: 0.035 };
      vibHz = 7;
      this.prototypeDemo.secondsInStage = elapsedSec;
    } else if (elapsedSec < 24) {
      stage = 'WARNING';
      baseTilt = 0.44;
      baseVib = 0.082;
      baseCrack = 1.48;
      baseStrain = 1.72;
      noiseAmp = { tilt: 0.055, vib: 0.010, crack: 0.09, strain: 0.11 };
      vibHz = 12;
      this.prototypeDemo.secondsInStage = elapsedSec - 12;
    } else {
      stage = 'CRITICAL';
      baseTilt = 0.86;
      baseVib = 0.168;
      baseCrack = 3.65;
      baseStrain = 3.12;
      noiseAmp = { tilt: 0.075, vib: 0.016, crack: 0.16, strain: 0.18 };
      vibHz = 8;
      this.prototypeDemo.secondsInStage = elapsedSec - 24;
    }

    this.prototypeDemo.stage = stage;

    const smoothNoise = (amp) => Math.sin(elapsedMs / 700.0) * amp;

    const finalTilt = +(Math.max(0.01, baseTilt + smoothNoise(noiseAmp.tilt)).toFixed(2));
    const finalVib = +(Math.max(0.001, baseVib + smoothNoise(noiseAmp.vib)).toFixed(3));
    const finalCrack = +(Math.max(0.01, baseCrack + smoothNoise(noiseAmp.crack)).toFixed(2));
    const finalStrain = +(Math.max(0.01, baseStrain + smoothNoise(noiseAmp.strain)).toFixed(2));

    const payload = {
      node: 'N01',
      nodeId: 'N01',
      tilt: finalTilt,
      tiltX: finalTilt,
      tiltY: +(finalTilt * 0.15).toFixed(2),
      vib: finalVib,
      vibrationG: finalVib,
      vibHz: vibHz,
      vibrationHz: vibHz,
      crack: finalCrack,
      crackWidthMm: finalCrack,
      strain: finalStrain,
      strainMmM: finalStrain,
      status: stage
    };

    this.injectSimulatedPacket(payload);
  }

  stopPrototypeDemo() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
    this.prototypeDemo = {
      active: false,
      stage: 'SAFE',
      cycleSeconds: 0,
      secondsInStage: 0
    };
  }

  async disconnect() {
    this.stopPrototypeDemo();
    try {
      if (this.reader) {
        await this.reader.cancel().catch(() => {});
      }
      if (this.readableStreamClosed) {
        await this.readableStreamClosed.catch(() => {});
      }
      if (this.port) {
        await this.port.close().catch(() => {});
      }
    } catch (err) {
      console.warn('Error closing serial port:', err);
    } finally {
      this.port = null;
      this.reader = null;
      this.readableStreamClosed = null;
      this.isConnected = false;
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({
          connected: false,
          packetCount: this.packetCount,
          lastPacket: null,
          prototypeDemo: { ...this.prototypeDemo }
        });
      }
    }
  }
}

export const usbGateway = new UsbGatewayService();
