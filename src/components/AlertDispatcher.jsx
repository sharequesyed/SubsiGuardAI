import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Smartphone, 
  AlertTriangle, 
  ShieldAlert, 
  Download, 
  Volume2, 
  Radio, 
  CheckCircle2, 
  FileText, 
  Building2,
  Monitor,
  BellRing,
  ExternalLink,
  Layers
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

export function AlertDispatcher({ 
  activeMine, 
  currentScenario, 
  severityIndex, 
  isSirenActive, 
  onToggleSiren, 
  telemetryStream,
  notifPermission = 'default',
  onRequestPermission,
  onTestNotification
}) {
  const [selectedLang, setSelectedLang] = useState('hindi');
  const [showExportModal, setShowExportModal] = useState(false);
  const [justSentToast, setJustSentToast] = useState(false);

  // Multilingual SMS contents
  const smsTemplates = {
    hindi: `[खान सुरक्षा निदेशालय / CIL] सतर्कता चेतावनी: ${activeMine.name} क्षेत्र में भूमि धंसाव (Subsidence) के पूर्व संकेत मिले हैं। दरार विस्तार दर: ${telemetryStream.crackWidthMm}mm। कृपया चिह्नित क्षेत्र (${activeMine.surfaceAssets[0]}) से तुरंत सुरक्षित दूरी बनाएं।`,
    english: `[DGMS / Coal India Emergency] ALERT: Active ground subsidence acceleration detected over ${activeMine.name}. Surface Tilt: ${telemetryStream.tiltX}°, Crack Opening: ${telemetryStream.crackWidthMm}mm. Maintain 200m safety perimeter from ${activeMine.surfaceAssets[0]}.`,
    bengali: `[খনি নিরাপত্তা আধিকারিক / CIL] জরুরী সতর্কতা: ${activeMine.name} এলাকায় জমি ধসের প্রাথমিক লক্ষণ ধরা পড়েছে। ফাটল বিস্তার: ${telemetryStream.crackWidthMm}mm। অনুগ্রহ করে চিহ্নিত এলাকা (${activeMine.surfaceAssets[0]}) থেকে অবিলম্বে নিরাপদ দূরত্ব বজায় রাখুন।`
  };

  const isCritical = severityIndex > 70;
  const isWarning = severityIndex > 40 && !isCritical;

  const handlePrintReport = () => {
    window.print();
  };

  const handleTriggerTestNotif = async () => {
    if (onTestNotification) {
      onTestNotification();
    } else {
      notificationService.notifyTestAlert();
    }
    setJustSentToast(true);
    setTimeout(() => setJustSentToast(false), 3000);
  };

  const handleTriggerCriticalNotif = () => {
    notificationService.notifyCriticalSubsidence({
      mineName: activeMine.name,
      tiltX: telemetryStream.tiltX || 0.85,
      crackMm: telemetryStream.crackWidthMm || 7.4,
      strainMmM: telemetryStream.strainMmM || 5.8,
      sector: activeMine.surfaceAssets[0]
    });
    setJustSentToast(true);
    setTimeout(() => setJustSentToast(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="innovation-banner">
        <div className="innovation-banner-text">
          <h4>
            <Bell size={18} />
            Automated Multi-Channel Early Warning & Escalation Dispatcher
          </h4>
          <p>
            Delivers critical alerts through <strong>Windows/PC Desktop Notifications</strong>, <strong>Physical On-Site Sirens</strong>, <strong>Highway Variable Message Signs</strong>, and <strong>Multilingual Geofenced SMS</strong>.
          </p>
        </div>
        <button 
          className={`btn-siren ${isSirenActive ? 'active' : ''}`}
          onClick={onToggleSiren}
        >
          <Volume2 size={16} />
          <span>{isSirenActive ? 'SILENCE AUDIO SIREN' : 'TRIGGER AUDIO SIREN'}</span>
        </button>
      </div>

      {/* NEW: Native Web Desktop & OS Action Center Push Notification Hub */}
      <div className="card" style={{ borderLeft: isCritical ? '4px solid #ef4444' : (isWarning ? '4px solid #f59e0b' : '4px solid var(--brand-primary)') }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Monitor size={17} style={{ color: 'var(--brand-primary)' }} />
              Native Desktop Web Push Notifications (Windows Action Center & macOS Banners)
            </h3>
            <div className="card-desc">
              Pushes OS-level pop-up alert banners directly to pithead workstations even when the browser is minimized
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge ${notifPermission === 'granted' ? 'badge-safe' : (notifPermission === 'denied' ? 'badge-critical' : 'badge-warning')}`}>
              <span className="status-pulse-dot" style={{ width: 6, height: 6 }}></span>
              {notifPermission === 'granted' ? 'OS NOTIFICATIONS ACTIVE' : (notifPermission === 'denied' ? 'BLOCKED IN BROWSER' : 'REQUIRES PERMISSION')}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
          {/* Windows Action Center Desktop Notification Banner Mockup */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            padding: '1rem',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Windows Notification Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.72rem', color: '#a1a1aa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{ width: 16, height: 16, borderRadius: '4px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px' }}>
                  <Layers size={10} />
                </div>
                <strong style={{ color: '#e4e4e7' }}>SubsiGuard Alert System</strong>
              </div>
              <span>Just now</span>
            </div>

            {/* Notification Title & Body */}
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isCritical ? '#f87171' : (isWarning ? '#fbbf24' : '#38bdf8'), marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BellRing size={14} />
              <span>
                {isCritical 
                  ? 'CRITICAL SUBSIDENCE EVACUATION ALERT' 
                  : (isWarning ? 'SECONDARY CREEP ADVISORY' : 'NORMAL MONITORING ACTIVE')}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#d4d4d8', lineHeight: '1.4', marginBottom: '0.75rem' }}>
              {isCritical ? (
                <>CRITICAL BREACH over <strong>{activeMine.name}</strong>: Surface Tilt <strong>{telemetryStream.tiltX || 0.85}°</strong> | Crack <strong>{telemetryStream.crackWidthMm || 7.4}mm</strong>. Immediate evacuation advised!</>
              ) : isWarning ? (
                <>Deformation Warning at <strong>{activeMine.name}</strong> ({activeMine.surfaceAssets[0]}): Surface Tilt <strong>{telemetryStream.tiltX || 0.35}°</strong> | Crack <strong>{telemetryStream.crackWidthMm || 2.8}mm</strong>.</>
              ) : (
                <>All 36 localized LoRa surface mesh nodes reporting normal steady state across {activeMine.name}. Permissible baseline.</>
              )}
            </div>

            {/* Windows Banner Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{
                background: isCritical ? '#ef4444' : '#27272a',
                color: '#ffffff',
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {isCritical ? 'Acknowledge & Evacuate' : 'View Strata Inclinometer'}
              </div>
              <div style={{
                background: '#27272a',
                color: '#a1a1aa',
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.72rem'
              }}>
                Dismiss
              </div>
            </div>
          </div>

          {/* Notification Controls & Browser Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <strong>Browser Push Protocol:</strong> When Ground Subsidence breaches DGMS statutory thresholds (Tilt &gt;0.57° or Crack &gt;5mm), SubsiGuard pushes native OS-level notifications to your Windows Action Center taskbar tray, even when this browser tab is backgrounded.
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {notifPermission !== 'granted' ? (
                <button 
                  className="btn-primary"
                  onClick={onRequestPermission || handleTriggerTestNotif}
                  id="enable-browser-notif-btn"
                >
                  <Bell size={14} />
                  <span>Enable Desktop Push Notifications</span>
                </button>
              ) : (
                <button 
                  className="btn-primary"
                  onClick={handleTriggerTestNotif}
                  id="test-browser-notif-btn"
                >
                  <BellRing size={14} />
                  <span>Send Test Windows Desktop Notification</span>
                </button>
              )}

              <button 
                className="btn-secondary"
                onClick={handleTriggerCriticalNotif}
                style={{ borderColor: 'var(--color-critical-border)', color: 'var(--color-critical)' }}
                title="Simulate immediate critical evacuation desktop popup"
              >
                <AlertTriangle size={14} />
                <span>Simulate Critical Desktop Popup</span>
              </button>
            </div>

            {justSentToast && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--color-safe)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <CheckCircle2 size={14} />
                <span>Notification dispatched to Windows Action Center! Look at bottom-right of your screen.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: SMS Simulator & Highway Smart LED VMS */}
      <div className="grid-2col">
        {/* Multilingual SMS Smartphone Mockup */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Smartphone size={16} />
                Public Geofenced SMS & Telecom Broadcast
              </h3>
              <div className="card-desc">Zero-internet broadcast to keypad phones in regional languages</div>
            </div>
            {/* Language Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button 
                className={`btn-secondary ${selectedLang === 'hindi' ? 'active' : ''}`}
                onClick={() => setSelectedLang('hindi')}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                हिन्दी
              </button>
              <button 
                className={`btn-secondary ${selectedLang === 'english' ? 'active' : ''}`}
                onClick={() => setSelectedLang('english')}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                English
              </button>
              <button 
                className={`btn-secondary ${selectedLang === 'bengali' ? 'active' : ''}`}
                onClick={() => setSelectedLang('bengali')}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* Smartphone Screen Mockup */}
          <div 
            style={{
              background: 'var(--bg-tertiary)',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              maxWidth: '380px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              <span>CIL-ALERT-CELL</span>
              <span>LIVE BROADCAST</span>
            </div>

            <div 
              style={{
                background: isCritical ? 'var(--color-critical-bg)' : (isWarning ? 'var(--color-warning-bg)' : 'var(--bg-card)'),
                border: isCritical ? '1px solid var(--color-critical-border)' : (isWarning ? '1px solid var(--color-warning-border)' : '1px solid var(--border-color)'),
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                fontSize: '0.82rem',
                lineHeight: '1.4',
                color: 'var(--text-primary)'
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: isCritical ? '#ef4444' : (isWarning ? '#d97706' : 'var(--brand-primary)') }}>
                {isCritical ? '🚨 CRITICAL SUBSIDENCE EVACUATION' : (isWarning ? '⚠️ SUBSIDENCE SAFETY ADVISORY' : '🟢 GROUND STABILITY NORMAL')}
              </div>
              <div>{smsTemplates[selectedLang]}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                Delivered via CDAC / CIL SMS Gateway
              </div>
            </div>
          </div>
        </div>

        {/* Highway Smart LED VMS Board Display Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Radio size={16} />
                Highway Smart Variable Message Sign (VMS)
              </h3>
              <div className="card-desc">Automated highway LED traffic control at {activeMine.surfaceAssets[0]}</div>
            </div>
            <span className={`badge ${isCritical ? 'badge-critical' : (isWarning ? 'badge-warning' : 'badge-safe')}`}>
              {isCritical ? 'HIGHWAY CLOSED' : (isWarning ? 'SPEED LIMIT 20 KM/H' : 'NORMAL TRAFFIC')}
            </span>
          </div>

          {/* LED Highway Board Simulation */}
          <div 
            style={{
              background: '#090d16',
              border: '4px solid #334155',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '180px',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div 
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textAlign: 'center',
                color: isCritical ? '#ef4444' : (isWarning ? '#fbbf24' : '#34d399'),
                textShadow: isCritical ? '0 0 10px rgba(239, 68, 68, 0.8)' : (isWarning ? '0 0 10px rgba(251, 191, 36, 0.8)' : '0 0 10px rgba(52, 211, 153, 0.8)')
              }}
            >
              {isCritical && (
                <>
                  <div>⛔ DANGER: SUBSIDENCE RISK ⛔</div>
                  <div style={{ fontSize: '0.95rem', marginTop: '0.4rem', color: '#f87171' }}>
                    NH-19 CLOSED • DIVERT TO BYPASS
                  </div>
                </>
              )}
              {isWarning && (
                <>
                  <div>⚠️ CAUTION: GROUND SHIFT DETECTED ⚠️</div>
                  <div style={{ fontSize: '0.95rem', marginTop: '0.4rem', color: '#fde68a' }}>
                    SPEED LIMIT 20 KM/H • HEAVY VEHICLES DIVERT
                  </div>
                </>
              )}
              {!isCritical && !isWarning && (
                <>
                  <div>✓ NH-19 CORRIDOR STABLE ✓</div>
                  <div style={{ fontSize: '0.95rem', marginTop: '0.4rem', color: '#6ee7b7' }}>
                    NO GROUND MOVEMENT DETECTED • SAFE TRANSIT
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Integrated with National Highway Authority of India (NHAI) VMS API
            </span>
            <button 
              className="btn-secondary"
              onClick={handlePrintReport}
              style={{ fontSize: '0.75rem' }}
            >
              <Download size={13} />
              <span>Export DGMS Form IV Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* DGMS Statutory Escalation Matrix */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Building2 size={16} />
              DGMS Statutory Escalation Protocol (Coal Mines Regulations 2017)
            </h3>
            <div className="card-desc">Tiered operational hierarchy for incident reporting and evacuation</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.8rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10b981' }}>
            <strong style={{ color: '#10b981', display: 'block', marginBottom: '0.3rem' }}>Level 1: Advisory (Tilt &lt; 3 mm/m)</strong>
            <span>Continuous mesh monitoring. Automated daily shift telemetry logs sent to Mine Surveyor and Under-Manager.</span>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #f59e0b' }}>
            <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '0.3rem' }}>Level 2: Alert (Tilt 3–7 mm/m, Strain &gt; 1.5 mm/m)</strong>
            <span>Automated SMS/Email to Mine Safety Officer and Colliery Agent. Cautionary traffic restrictions implemented on surface roads.</span>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #ef4444' }}>
            <strong style={{ color: '#ef4444', display: 'block', marginBottom: '0.3rem' }}>Level 3: Critical (Tertiary Creep Acceleration)</strong>
            <span>Autonomous activation of field sirens and highway closures. Instant statutory broadcast to General Manager, DGMS Inspector, and District Magistrate.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
