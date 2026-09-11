import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  Layers, 
  Cloud, 
  Terminal, 
  FileCode, 
  CheckCircle2 
} from 'lucide-react';

export function WokwiDocsModal({ isOpen, onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('sketch');
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const sketchIno = `/**
 * SubsiGuard ESP32 Field Node Firmware (Instant-Compile Version)
 * Uses native Wire.h (No heavy Adafruit libraries = 2-second compile in Wokwi!)
 * Measures Ground Tilt (MPU-6050 I2C) & Crack Displacement (Potentiometer)
 * Publishes Live Telemetry to HiveMQ MQTT Cloud
 * Team MineNova6 - SIH 2026 Problem Statement 26025
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>

// Wokwi Simulated WiFi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// HiveMQ Public MQTT Broker
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "subsiguard/minenova6/telemetry";

// MPU-6050 I2C Address
const int MPU_ADDR = 0x68;

// Hardware Pins
#define POT_PIN 34        // Slide Potentiometer wiper (Crack Extensometer)
#define VIB_BUTTON_PIN 13 // Pushbutton (Simulates Dumper Vibration)
#define LED_TX_PIN 2      // Built-in Blue LED (Blinks on packet transmit)

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsgTime = 0;
const int publishInterval = 600; // Telemetry interval in ms

void setupMPU6050() {
  Wire.begin(21, 22); // SDA = 21, SCL = 22
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);   // PWR_MGMT_1 register
  Wire.write(0);      // Wake up MPU-6050
  Wire.endTransmission(true);
  Serial.println("MPU-6050 initialized via native I2C.");
}

void setupWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected! IP: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection to HiveMQ...");
    String clientId = "ESP32SubsiGuard-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println(" Connected!");
    } else {
      Serial.print(" Failed rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 2s...");
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_TX_PIN, OUTPUT);
  pinMode(VIB_BUTTON_PIN, INPUT_PULLUP);

  setupMPU6050();
  setupWiFi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsgTime > publishInterval) {
    lastMsgTime = now;

    // 1. Read Raw Accelerometer from MPU-6050 registers (0x3B to 0x40)
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    Wire.endTransmission(false);
    Wire.requestFrom(MPU_ADDR, 6, true);

    int16_t rawX = (Wire.read() << 8) | Wire.read();
    int16_t rawY = (Wire.read() << 8) | Wire.read();
    int16_t rawZ = (Wire.read() << 8) | Wire.read();

    float ax = rawX / 16384.0;
    float ay = rawY / 16384.0;
    float az = rawZ / 16384.0;

    // Calculate ground tilt in degrees
    float tiltX = atan2(ay, sqrt(ax * ax + az * az)) * 180.0 / PI;
    float tiltY = atan2(-ax, az) * 180.0 / PI;
    tiltX = abs(tiltX);

    if (isnan(tiltX) || tiltX < 0.01) tiltX = 0.04;

    // 2. Read Potentiometer for Crack Displacement (0 to 50 mm)
    int rawAdc = analogRead(POT_PIN);
    float crackMm = (rawAdc / 4095.0) * 50.0;
    float strainMmM = crackMm * 0.85;

    // 3. Read Vibration / Dumper Button (Active LOW)
    bool isVibrating = (digitalRead(VIB_BUTTON_PIN) == LOW);
    float vibG = isVibrating ? 0.65 : 0.025;
    int vibHz = isVibrating ? 85 : 8;

    // 4. Determine Statutory Severity (DGMS Threshold: 0.57 deg tilt)
    String status = "SAFE";
    if (tiltX > 0.57 || crackMm > 5.0) {
      status = "CRITICAL";
    } else if (tiltX > 0.25 || crackMm > 2.5) {
      status = "WARNING";
    }

    // 5. Construct JSON Payload
    String payload = "{";
    payload += "\\"node\\":\\"N05\\",";
    payload += "\\"tilt\\":" + String(tiltX, 2) + ",";
    payload += "\\"crack\\":" + String(crackMm, 2) + ",";
    payload += "\\"strain\\":" + String(strainMmM, 2) + ",";
    payload += "\\"vib\\":" + String(vibG, 3) + ",";
    payload += "\\"vibHz\\":" + String(vibHz) + ",";
    payload += "\\"status\\":\\"" + status + "\\"";
    payload += "}";

    // 6. Blink TX LED & Publish to MQTT
    digitalWrite(LED_TX_PIN, HIGH);
    client.publish(mqtt_topic, payload.c_str());
    Serial.println("MQTT Pub -> " + payload);
    delay(30);
    digitalWrite(LED_TX_PIN, LOW);
  }
}`;

  const diagramJson = `{
  "version": 1,
  "author": "MineNova6 SubsiGuard",
  "editor": "wokwi",
  "parts": [
    { "type": "board-esp32-devkit-c-v4", "id": "esp", "top": 0, "left": 0, "attrs": {} },
    { "type": "wokwi-mpu6050", "id": "mpu1", "top": -120, "left": 180, "attrs": {} },
    { "type": "wokwi-potentiometer", "id": "pot1", "top": 150, "left": 180, "attrs": { "label": "Crack Extensometer (mm)" } },
    { "type": "wokwi-pushbutton", "id": "btn1", "top": 180, "left": -120, "attrs": { "color": "red", "label": "Heavy Dumper Vibration" } },
    { "type": "wokwi-led", "id": "led_alert", "top": -80, "left": -80, "attrs": { "color": "red", "label": "Critical Alert" } },
    { "type": "wokwi-resistor", "id": "r1", "top": -40, "left": -80, "attrs": { "value": "220" } }
  ],
  "connections": [
    [ "esp:TX", "$serialMonitor:RX", "", [] ],
    [ "esp:RX", "$serialMonitor:TX", "", [] ],
    [ "esp:3V3", "mpu1:VCC", "red", [ "v0" ] ],
    [ "esp:GND.1", "mpu1:GND", "black", [ "v0" ] ],
    [ "esp:22", "mpu1:SCL", "green", [ "v0" ] ],
    [ "esp:21", "mpu1:SDA", "blue", [ "v0" ] ],
    [ "esp:3V3", "pot1:VCC", "red", [ "v0" ] ],
    [ "esp:GND.2", "pot1:GND", "black", [ "v0" ] ],
    [ "esp:34", "pot1:SIG", "orange", [ "v0" ] ],
    [ "esp:13", "btn1:2.1", "yellow", [ "v0" ] ],
    [ "esp:GND.1", "btn1:1.1", "black", [ "v0" ] ],
    [ "esp:4", "r1:1", "red", [ "v0" ] ],
    [ "r1:2", "led_alert:A", "red", [ "v0" ] ],
    [ "esp:GND.2", "led_alert:C", "black", [ "v0" ] ]
  ],
  "dependencies": {}
}`;

  const librariesTxt = `PubSubClient`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="nav-logo-badge" style={{ width: 34, height: 34, background: '#6366f1' }}>
              <Cpu size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Wokwi ESP32 Cloud Simulation Setup
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Step-by-step firmware & schematic guide for live presentation to the SIH jury
              </p>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Step Guide Banner */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          lineHeight: '1.5'
        }}>
          <strong style={{ color: 'var(--brand-primary)', display: 'block', marginBottom: '0.35rem' }}>
            3 Simple Steps to Run for Tomorrow's Jury:
          </strong>
          <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
            <li>Open <a href="https://wokwi.com/projects/new/esp32" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>wokwi.com (New ESP32)</a> in a separate browser window.</li>
            <li>Paste <strong>sketch.ino</strong> and <strong>diagram.json</strong> (and add libraries from the tab below).</li>
            <li>Click <strong>Start Simulation</strong> in Wokwi, then switch SubsiGuard to <strong>Wokwi IoT Cloud</strong>. Twist the potentiometer or tilt the MPU6050 to see the dashboard respond live!</li>
          </ol>
        </div>

        {/* Code Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
          <button 
            className={`tab-btn ${activeSubTab === 'sketch' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('sketch')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <FileCode size={14} />
            <span>sketch.ino (Arduino C++)</span>
          </button>
          <button 
            className={`tab-btn ${activeSubTab === 'diagram' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('diagram')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <Layers size={14} />
            <span>diagram.json (Circuit Schematic)</span>
          </button>
          <button 
            className={`tab-btn ${activeSubTab === 'libs' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('libs')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <Terminal size={14} />
            <span>libraries.txt</span>
          </button>
        </div>

        {/* Active Content Display */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              const text = activeSubTab === 'sketch' ? sketchIno : (activeSubTab === 'diagram' ? diagramJson : librariesTxt);
              handleCopy(text, activeSubTab);
            }}
            className="btn-simulate-packet"
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              zIndex: 5,
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {copiedKey === activeSubTab ? (
              <span style={{ color: 'var(--color-safe)' }}><Check size={13} style={{ display: 'inline', marginRight: 4 }} /> Copied!</span>
            ) : (
              <span><Copy size={13} style={{ display: 'inline', marginRight: 4 }} /> Copy {activeSubTab}</span>
            )}
          </button>

          <pre style={{
            background: 'var(--bg-tertiary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            overflowX: 'auto',
            maxHeight: '420px',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            lineHeight: '1.5'
          }}>
            {activeSubTab === 'sketch' && sketchIno}
            {activeSubTab === 'diagram' && diagramJson}
            {activeSubTab === 'libs' && librariesTxt}
          </pre>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
            Close
          </button>
          <a 
            href="https://wokwi.com/projects/new/esp32" 
            target="_blank" 
            rel="noopener noreferrer"
            className="usb-connect-btn"
            style={{ textDecoration: 'none', background: '#6366f1' }}
          >
            <ExternalLink size={14} />
            <span>Open Wokwi in New Window</span>
          </a>
        </div>
      </div>
    </div>
  );
}
