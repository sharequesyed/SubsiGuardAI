/**
 * SubsiGuard Web Serial Gateway Service
 * Connects directly to ESP32 LoRa Gateway via USB Serial (115200 baud)
 * Works in Google Chrome / Microsoft Edge on HTTPS (or localhost)
 * Team MineNova6 - SIH 2026 PS 26025
 */

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
      // 1. Request user to select the ESP32 COM port
      this.port = await navigator.serial.requestPort();

      // 2. Open serial connection at standard ESP32 115200 baud
      await this.port.open({ 
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      this.isConnected = true;
      this.packetCount = 0;

      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({
          connected: true,
          baudRate: 115200,
          portInfo: this.port.getInfo ? this.port.getInfo() : {},
          packetCount: 0
        });
      }

      // 3. Start reading incoming stream
      this.startReading();
      return true;
    } catch (err) {
      this.isConnected = false;
      if (this.callbacks.onError) this.callbacks.onError(err);
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({
          connected: false,
          error: err.message
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
        // Keep the last partial line in buffer
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
      this.reader.releaseLock();
    }
  }

  handleIncomingLine(rawLine) {
    let parsed = null;

    // 1. Try parsing JSON format:
    // {"node":"N01","tilt":1.24,"vib":0.05,"crack":3.4,"strain":2.1,"status":"CRITICAL"}
    if (rawLine.startsWith('{') && rawLine.endsWith('}')) {
      try {
        parsed = JSON.parse(rawLine);
      } catch (e) {
        // Fall back to text parsing
      }
    }

    // 2. Try parsing Key-Value format:
    // NODE:N01,TILT:1.24,VIB:0.05,CRACK:3.40
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

    // 3. Try parsing CSV format:
    // N01,1.24,0.05,3.40
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

    if (parsed) {
      this.packetCount++;
      const packet = {
        nodeId: parsed.node || parsed.nodeId || 'N05',
        tiltX: +(parseFloat(parsed.tilt || parsed.tiltX || 0).toFixed(2)),
        tiltY: +(parseFloat(parsed.tiltY || (parsed.tilt ? parsed.tilt * 0.4 : 0.02)).toFixed(2)),
        vibrationG: +(parseFloat(parsed.vib || parsed.vibrationG || 0.02).toFixed(3)),
        vibrationHz: parseInt(parsed.vibHz || parsed.vibrationHz || 8, 10),
        crackWidthMm: +(parseFloat(parsed.crack || parsed.crackWidthMm || 0.65).toFixed(2)),
        strainMmM: +(parseFloat(parsed.strain || parsed.strainMmM || 0.85).toFixed(2)),
        status: parsed.status || (parseFloat(parsed.tilt || 0) > 0.57 ? 'CRITICAL' : 'SAFE'),
        raw: rawLine,
        timestamp: new Date().toLocaleTimeString('en-GB')
      };

      if (this.callbacks.onData) {
        this.callbacks.onData(packet);
      }

      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({
          connected: true,
          packetCount: this.packetCount,
          lastPacket: packet
        });
      }
    }
  }

  // Inject a simulated packet to test the USB pipeline without physical board
  injectSimulatedPacket(data) {
    const raw = typeof data === 'string' ? data : JSON.stringify(data);
    this.handleIncomingLine(raw);
  }

  async disconnect() {
    try {
      if (this.reader) {
        await this.reader.cancel();
      }
      if (this.readableStreamClosed) {
        await this.readableStreamClosed.catch(() => {});
      }
      if (this.port) {
        await this.port.close();
      }
    } catch (err) {
      console.warn('Error closing serial port:', err);
    } finally {
      this.port = null;
      this.reader = null;
      this.isConnected = false;
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({
          connected: false,
          packetCount: this.packetCount
        });
      }
    }
  }
}

export const usbGateway = new UsbGatewayService();
