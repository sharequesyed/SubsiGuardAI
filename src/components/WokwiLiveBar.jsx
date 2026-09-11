import React, { useState } from 'react';
import { 
  Cloud, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Activity, 
  Sliders, 
  Copy, 
  Check,
  Sparkles
} from 'lucide-react';
import { mqttGateway } from '../services/mqttGateway';

export function WokwiLiveBar({ 
  dataMode, 
  mqttStatus, 
  onInjectTestPacket,
  onOpenWokwiDocs
}) {
  const [copied, setCopied] = useState(false);
  const [testTilt, setTestTilt] = useState(1.45);

  if (dataMode !== 'wokwi') return null;

  const topicName = 'subsiguard/minenova6/telemetry';

  const copyTopic = () => {
    navigator.clipboard.writeText(topicName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="usb-live-bar" id="wokwi-cloud-control" style={{
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(2, 132, 199, 0.12) 100%)',
      borderColor: 'rgba(99, 102, 241, 0.3)'
    }}>
      <div className="usb-info-col">
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: mqttStatus.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
          color: mqttStatus.connected ? 'var(--color-safe)' : 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${mqttStatus.connected ? 'var(--color-safe-border)' : 'rgba(99, 102, 241, 0.3)'}`
        }}>
          <Cloud size={20} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <strong style={{ fontSize: '0.85rem' }}>
              Wokwi IoT Cloud Bridge
            </strong>
            <span className={`badge ${mqttStatus.connected ? 'badge-safe' : 'badge-warning'}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
              <span className="status-pulse-dot" style={{ width: 6, height: 6 }}></span>
              {mqttStatus.connected ? 'MQTT WEBSOCKET CONNECTED' : 'CONNECTING TO HIVEMQ...'}
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            <span>
              Broker: <code>broker.hivemq.com</code> • Topic: <code style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{topicName}</code>
            </span>
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
              (Received: <strong>{mqttStatus.packetCount} packets</strong>)
            </span>
            {mqttStatus.lastPacket && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                • Node {mqttStatus.lastPacket.nodeId}: Tilt {mqttStatus.lastPacket.tiltX}°, Crack {mqttStatus.lastPacket.crackWidthMm}mm
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        {/* Copy Topic Button */}
        <button 
          className="btn-simulate-packet"
          onClick={copyTopic}
          title="Copy MQTT topic string"
        >
          {copied ? <Check size={13} style={{ display: 'inline', marginRight: 4, color: 'var(--color-safe)' }} /> : <Copy size={13} style={{ display: 'inline', marginRight: 4 }} />}
          <span>{copied ? 'Copied' : 'Copy Topic'}</span>
        </button>

        {/* View Wokwi Code & Circuit Guide */}
        <button 
          className="btn-simulate-packet"
          onClick={onOpenWokwiDocs}
          title="View and copy Wokwi sketch.ino and diagram.json"
        >
          <Cpu size={13} style={{ display: 'inline', marginRight: 4 }} />
          <span>Wokwi Code & Guide</span>
        </button>

        {/* Open Wokwi in new tab */}
        <a 
          href="https://wokwi.com/projects/new/esp32" 
          target="_blank" 
          rel="noopener noreferrer"
          className="usb-connect-btn"
          style={{ textDecoration: 'none', background: '#6366f1' }}
          title="Open Wokwi ESP32 simulator in new tab"
        >
          <ExternalLink size={14} />
          <span>Open Wokwi Simulator</span>
        </a>

        {/* Test Packet Injection Button */}
        <button 
          className="btn-simulate-packet"
          onClick={() => {
            const nextTilt = +(0.85 + Math.random() * 1.6).toFixed(2);
            setTestTilt(nextTilt);
            onInjectTestPacket({
              node: 'N05',
              tilt: nextTilt,
              vib: +(0.03 + Math.random() * 0.07).toFixed(3),
              crack: +(3.2 + Math.random() * 3.5).toFixed(2),
              strain: +(4.1 + Math.random() * 2.2).toFixed(2),
              status: nextTilt > 0.57 ? 'CRITICAL' : 'SAFE'
            });
          }}
          title="Inject sample packet to verify IoT cloud subscriber reaction"
        >
          <Activity size={13} style={{ display: 'inline', marginRight: 4 }} />
          <span>Simulate Wokwi Packet ({testTilt}°)</span>
        </button>
      </div>
    </div>
  );
}
