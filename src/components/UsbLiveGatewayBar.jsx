import React, { useState } from 'react';
import { 
  Usb, 
  Power, 
  Sparkles, 
  Play,
  Square
} from 'lucide-react';
import { usbGateway } from '../services/usbGateway';

export function UsbLiveGatewayBar({ 
  dataMode, 
  usbStatus, 
  onConnectUsb, 
  onDisconnectUsb,
  onInjectTestPacket,
  onStartPrototypeDemo,
  onStopPrototypeDemo
}) {
  const [testTilt, setTestTilt] = useState(1.45);
  const isSupported = usbGateway.isSupported();

  if (dataMode !== 'usb') return null;

  const isDemoActive = Boolean(usbStatus?.prototypeDemo?.active);
  const demoStage = usbStatus?.prototypeDemo?.stage || 'SAFE';
  const cycleSec = (usbStatus?.prototypeDemo?.cycleSeconds || 0) % 36;
  const stageSec = (usbStatus?.prototypeDemo?.secondsInStage !== undefined) 
    ? usbStatus.prototypeDemo.secondsInStage 
    : (cycleSec % 12);

  let iconBg = usbStatus?.connected ? 'var(--color-safe-bg)' : 'var(--brand-light)';
  let iconColor = usbStatus?.connected ? 'var(--color-safe)' : 'var(--brand-primary)';
  let iconBorder = usbStatus?.connected ? 'var(--color-safe-border)' : 'rgba(2, 132, 199, 0.3)';

  if (isDemoActive) {
    if (demoStage === 'CRITICAL') {
      iconBg = 'var(--color-critical-bg)';
      iconColor = 'var(--color-critical)';
      iconBorder = 'var(--color-critical-border)';
    } else if (demoStage === 'WARNING') {
      iconBg = 'var(--color-warning-bg)';
      iconColor = 'var(--color-warning)';
      iconBorder = 'var(--color-warning-border)';
    } else {
      iconBg = 'var(--color-safe-bg)';
      iconColor = 'var(--color-safe)';
      iconBorder = 'var(--color-safe-border)';
    }
  }

  const lastP = usbStatus?.lastPacket;

  return (
    <div className="usb-live-bar" id="usb-live-gateway-control">
        <div className="usb-info-col">
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${iconBorder}`,
            transition: 'all 0.3s ease',
            flexShrink: 0
          }}>
            <Usb size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.85rem' }}>
                {isDemoActive 
                  ? 'ESP32 Live USB • Hardware Prototype Demonstration' 
                  : (usbStatus?.connected ? 'ESP32 LoRa Gateway Online' : 'ESP32 USB Gateway Mode')}
              </strong>

              {isDemoActive ? (
                usbStatus?.isHardwareStream ? (
                  <span 
                    className="badge badge-safe" 
                    style={{ fontSize: '0.70rem', padding: '0.15rem 0.55rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981' }}
                  >
                    <span className="status-pulse-dot" style={{ width: 6, height: 6, background: '#10b981' }}></span>
                    DIRECT HARDWARE STREAM • {demoStage}
                  </span>
                ) : (
                  <span 
                    className={`badge ${demoStage === 'CRITICAL' ? 'badge-critical' : (demoStage === 'WARNING' ? 'badge-warning' : 'badge-safe')}`} 
                    style={{ fontSize: '0.70rem', padding: '0.15rem 0.55rem', fontWeight: 700 }}
                  >
                    <span className="status-pulse-dot" style={{ width: 6, height: 6 }}></span>
                    AUTO-SYNCED • {demoStage} ({stageSec + 1}s / 12s)
                  </span>
                )
              ) : (
                usbStatus?.connected && (
                  <span className="badge badge-safe" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                    <span className="status-pulse-dot" style={{ width: 6, height: 6 }}></span>
                    115200 BAUD
                  </span>
                )
              )}
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {isDemoActive ? (
                <span>
                  {usbStatus?.isHardwareStream 
                    ? <>Streaming directly from physical board on COM port • Packets: <strong>{usbStatus?.packetCount || 0}</strong></> 
                    : <>Auto-synchronized on connect (Hardware reset pulsed) • Node N01 • Packets: <strong>{usbStatus?.packetCount || 0}</strong></>}
                  {lastP && (
                    <span style={{ marginLeft: '0.5rem', color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      [ TILT: {lastP.tiltX}° | VIB: {lastP.vibrationG}g | CRACK: {lastP.crackWidthMm}mm | STRAIN: {lastP.strainMmM}mm/m ]
                    </span>
                  )}
                </span>
              ) : usbStatus?.connected ? (
                <span>
                  Streaming packets from field mesh • Received: <strong>{usbStatus.packetCount} packets</strong>
                  {lastP && (
                    <span style={{ marginLeft: '0.5rem', color: 'var(--brand-primary)' }}>
                      (Latest: Node {lastP.nodeId}, Tilt: {lastP.tiltX}°, Crack: {lastP.crackWidthMm}mm)
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  {isSupported ? (
                    <span>
                      In the browser popup, select <strong>"USB Serial Port (COM11)"</strong> or <strong>"FT232R / CH340 / CP210x"</strong>. It will not be named "ESP32".
                    </span>
                  ) : (
                    'Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
                  )}
                </span>
              )}
              {usbStatus?.error && (
                <span style={{ display: 'block', color: '#ef4444', marginTop: '0.2rem', fontWeight: 600 }}>
                  ⚠️ {usbStatus.error}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          {usbStatus?.connected || isDemoActive ? (
            <button 
              className="usb-disconnect-btn"
              onClick={onDisconnectUsb}
              id="btn-disconnect-board"
              title="Disconnect ESP32 board and return Live USB to standby"
            >
              <Power size={14} />
              <span>Disconnect Board</span>
            </button>
          ) : (
            <>
              <button 
                className="usb-connect-btn"
                onClick={onConnectUsb}
                disabled={!isSupported}
                style={{ opacity: isSupported ? 1 : 0.6 }}
                id="btn-connect-board"
                title="Connect ESP32 board via Web Serial (115200 Baud) and start synchronized stream"
              >
                <Usb size={16} />
                <span>Connect Board (Select Serial Port)</span>
              </button>

              
              <button 
                className="btn-prototype-demo"
                onClick={onStartPrototypeDemo}
                id="btn-start-prototype-demo"
                title="Run synchronized prototype demo stream without physical USB cable"
              >
                <Play size={13} style={{ fill: 'currentColor' }} />
                <span>Test Without Board</span>
              </button>
            </>
          )}

          
          <button 
            className="btn-simulate-packet"
            onClick={() => {
              const nextTilt = +(0.8 + Math.random() * 1.5).toFixed(2);
              setTestTilt(nextTilt);
              onInjectTestPacket({
                node: 'N01',
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
            <span>Inject Test ({testTilt}°)</span>
          </button>
        </div>
    </div>
  );
}
