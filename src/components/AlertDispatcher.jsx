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
  Building2
} from 'lucide-react';

export function AlertDispatcher({ 
  activeMine, 
  currentScenario, 
  severityIndex,
  isSirenActive,
  onToggleSiren,
  telemetryStream 
}) {
  const [selectedLang, setSelectedLang] = useState('hindi');
  const [showExportModal, setShowExportModal] = useState(false);

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
            Delivers critical alerts through <strong>Physical On-Site Audio Sirens</strong>, <strong>Highway Smart LED Signs</strong>, and <strong>Multilingual Geofenced Telecom SMS</strong> without requiring smartphones.
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
