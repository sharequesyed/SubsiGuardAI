/**
 * SubsiGuard MQTT IoT Gateway Service
 * Connects directly to Wokwi ESP32 simulation over secure WebSockets
 * Broker: wss://broker.hivemq.com:8884/mqtt
 * Topic: subsiguard/minenova6/telemetry
 * Team MineNova6 - SIH 2026 PS 26025
 */

import mqtt from 'mqtt';

const DEFAULT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
const DEFAULT_TOPIC = 'subsiguard/minenova6/telemetry';

class MqttGatewayService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.packetCount = 0;
    this.brokerUrl = DEFAULT_BROKER;
    this.topic = DEFAULT_TOPIC;
    this.callbacks = {
      onData: null,
      onStatusChange: null,
      onError: null
    };
  }

  connect(callbacks = {}) {
    this.callbacks = { ...this.callbacks, ...callbacks };

    if (this.client && this.isConnected) {
      return;
    }

    try {
      const clientId = `subsiguard_${Math.random().toString(16).substring(2, 10)}`;
      
      this.client = mqtt.connect(this.brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 3000,
        keepalive: 60
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        if (this.client) {
          this.client.subscribe(this.topic, (err) => {
            if (err) {
              if (this.callbacks.onError) this.callbacks.onError(err);
            }
          });
        }

        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange({
            connected: true,
            brokerUrl: this.brokerUrl,
            topic: this.topic,
            packetCount: this.packetCount,
            error: null
          });
        }
      });

      this.client.on('message', (topic, message) => {
        const rawLine = message.toString();
        this.handleIncomingMessage(rawLine);
      });

      this.client.on('error', (err) => {
        if (this.callbacks.onError) this.callbacks.onError(err);
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange({
            connected: false,
            error: err.message
          });
        }
      });

      this.client.on('close', () => {
        this.isConnected = false;
        if (this.callbacks.onStatusChange) {
          this.callbacks.onStatusChange({
            connected: false,
            packetCount: this.packetCount
          });
        }
      });

    } catch (err) {
      if (this.callbacks.onError) this.callbacks.onError(err);
    }
  }

  handleIncomingMessage(rawLine) {
    let parsed = null;
    try {
      parsed = JSON.parse(rawLine);
    } catch (e) {
      // If plain comma-separated: N05,1.45,0.04,3.20
      if (rawLine.includes(',')) {
        const parts = rawLine.split(',').map(s => s.trim());
        parsed = {
          node: parts[0] || 'N05',
          tilt: parseFloat(parts[1]) || 0,
          vib: parseFloat(parts[2]) || 0,
          crack: parseFloat(parts[3]) || 0,
          strain: parseFloat(parts[4]) || 0
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

  // Publish a packet directly from the dashboard (two-way or test)
  publish(payload) {
    if (this.client && this.isConnected) {
      const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
      this.client.publish(this.topic, msg);
    } else {
      // Simulate locally if broker not reached
      this.handleIncomingMessage(typeof payload === 'string' ? payload : JSON.stringify(payload));
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end(true);
      this.client = null;
    }
    this.isConnected = false;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange({
        connected: false,
        packetCount: this.packetCount
      });
    }
  }
}

export const mqttGateway = new MqttGatewayService();
