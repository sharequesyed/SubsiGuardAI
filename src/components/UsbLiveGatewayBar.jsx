import React, { useState } from 'react';
import { 
  Usb, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Power, 
  Sparkles, 
  Activity,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { usbGateway } from '../services/usbGateway';

export function UsbLiveGatewayBar({ 
  dataMode, 
  usbStatus, 
  onConnectUsb, 
  onDisconnectUsb,
  onInjectTestPacket 
}) {
  const [testTilt, setTestTilt] = useState(1.45);
  const isSupported = usbGateway.isSupported();

  if (dataMode !== 'usb') return null;

  return (
    <div className="usb-live-bar" id="usb-live-gateway-control">
      <div className="usb-info-col">
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: usbStatus.connected ? 'var(--color-safe-bg)' : 'var(--brand-light)',
          color: usbStatus.connected ? 'var(--color-safe)' : 'var(--brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${usbStatus.connected ? 'var(--color-safe-border)' : 'rgba(2, 132, 199, 0.3)'}`
        }}>
          <Usb size={20} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <strong style={{ fontSize: '0.85rem' }}>
              {usbStatus.connected ? 'ESP32 LoRa Gateway Online' : 'ESP32 USB Gateway Mode'}
            </strong>
            {usbStatus.connected && (
              <span className="badge badge-safe" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                <span className="status-pulse-dot" style={{ width: 6, height: 6 }}></span>
                115200 BAUD
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            {usbStatus.connected ? (
              <span>
                Streaming packets from field mesh • Received: <strong>{usbStatus.packetCount} packets</strong>
                {usbStatus.lastPacket && (
                  <span style={{ marginLeft: '0.5rem', color: 'var(--brand-primary)' }}>
                    (Latest: Node {usbStatus.lastPacket.nodeId}, Tilt: {usbStatus.lastPacket.tiltX}°, Crack: {usbStatus.lastPacket.crackWidthMm}mm)
                  </span>
                )}
              </span>
            ) : (
              <span>
                {isSupported 
                  ? 'Connect your ESP32 Gateway via USB to ingest live 868MHz LoRa packets in real-time.' 
                  : 'Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        {usbStatus.connected ? (
          <button 
            className="usb-disconnect-btn"
            onClick={onDisconnectUsb}
            title="Disconnect serial port"
          >
            <Power size={14} />
            <span>Disconnect</span>
          </button>
        ) : (
          <button 
            className="usb-connect-btn"
            onClick={onConnectUsb}
            disabled={!isSupported}
            style={{ opacity: isSupported ? 1 : 0.6 }}
            title="Select COM port for ESP32 Gateway"
          >
            <Usb size={15} />
            <span>Connect ESP32 (115200 Baud)</span>
          </button>
        )}

        {/* Test Packet Injection Button */}
        <button 
          className="btn-simulate-packet"
          onClick={() => {
            const nextTilt = +(0.8 + Math.random() * 1.5).toFixed(2);
            setTestTilt(nextTilt);
            onInjectTestPacket({
              node: 'N05',
              tilt: nextTilt,
              vib: +(0.04 + Math.random() * 0.08).toFixed(3),
              crack: +(3.5 + Math.random() * 3.0).toFixed(2),
              strain: +(4.0 + Math.random() * 2.0).toFixed(2),
              status: nextTilt > 0.57 ? 'CRITICAL' : 'SAFE'
            });
          }}
          title="Inject sample packet over the USB pipeline to test live gauge & alarm reaction without hardware"
        >
          <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
          <span>Inject Test Packet ({testTilt}°)</span>
        </button>
      </div>
    </div>
  );
}
