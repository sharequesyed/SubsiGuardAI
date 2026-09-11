import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Radio, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  ExternalLink,
  Activity,
  Box,
  Usb
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';

export function Navbar({ 
  currentTheme, 
  onToggleTheme, 
  activeMine, 
  onSelectMine, 
  mineFields,
  isSirenActive,
  onToggleSiren,
  offlineStats,
  onSyncOffline,
  onOpenTeamModal,
  dataMode = 'demo',
  onSwitchMode
}) {
  return (
    <header className="top-navbar">
      {/* Brand & Team MineNova6 */}
      <div className="nav-brand-group">
        <div className="nav-logo-badge">
          <Layers size={24} strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-title">
            SubsiGuard
            <button 
              className="brand-team-tag"
              onClick={onOpenTeamModal}
              style={{ cursor: 'pointer', background: 'transparent' }}
            >
              Team MineNova6
            </button>
          </div>
          <div className="brand-subtitle">
            Smart Mine Subsidence Monitoring & Early Warning Platform • SIH 2026 PS 26025
          </div>
        </div>
      </div>

      {/* Coalfield Selector & Live Status Controls */}
      <div className="nav-actions-group">
        {/* Mode Switcher: Demo Mode vs 3D Hardware Rig vs USB Gateway */}
        <div className="mode-switch-group">
          <button 
            className={`mode-btn ${dataMode === 'demo' ? 'active' : ''}`}
            onClick={() => onSwitchMode && onSwitchMode('demo')}
            title="Switch to Demo Scenario Mode"
            id="mode-btn-demo"
          >
            <Activity size={13} />
            <span>Demo</span>
          </button>
          <button 
            className={`mode-btn ${dataMode === 'sim3d' ? 'active sim3d' : ''}`}
            onClick={() => onSwitchMode && onSwitchMode('sim3d')}
            title="Switch to Interactive 3D Hardware Tabletop Rig Simulator"
            id="mode-btn-sim3d"
          >
            <Box size={13} />
            <span>3D Rig Sim</span>
          </button>
          <button 
            className={`mode-btn ${dataMode === 'usb' ? 'active usb' : ''}`}
            onClick={() => onSwitchMode && onSwitchMode('usb')}
            title="Switch to Live ESP32 USB Gateway Mode"
            id="mode-btn-usb"
          >
            <Usb size={13} />
            <span>Live USB</span>
          </button>
        </div>
        {/* Active Coalfield Selector */}
        <div className="mine-select-wrapper">
          <Layers size={14} />
          <select 
            value={activeMine.id} 
            onChange={(e) => {
              const selected = mineFields.find(m => m.id === e.target.value);
              if (selected) onSelectMine(selected);
            }}
            aria-label="Select Coalfield Mine Panel"
          >
            {mineFields.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Live Mesh Status Badge */}
        <div className="status-badge online" title="Localized LoRa & ESP-NOW Mesh Network Active">
          <span className="status-pulse-dot"></span>
          <Radio size={14} />
          <span>MESH: 36 NODES (868MHz)</span>
        </div>

        {/* Offline Cache & Sync status */}
        <div 
          className={`status-badge ${offlineStats.isOnline ? 'online' : 'badge-warning'}`}
          style={{ cursor: offlineStats.bufferedCount > 0 ? 'pointer' : 'default' }}
          onClick={offlineStats.bufferedCount > 0 ? onSyncOffline : undefined}
          title={offlineStats.bufferedCount > 0 ? 'Click to sync buffered packets with CIL cloud' : 'Cloud uplink active'}
        >
          {offlineStats.isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>
            {offlineStats.bufferedCount > 0 
              ? `BUFFER: ${offlineStats.bufferedCount} (SYNC)` 
              : (offlineStats.isOnline ? 'CLOUD SYNCED' : 'OFFLINE MODE')}
          </span>
        </div>

        {/* Emergency Evacuation Siren Test Button */}
        <button 
          className={`btn-siren ${isSirenActive ? 'active' : ''}`}
          onClick={onToggleSiren}
          title="Trigger or silence physical on-site emergency audio siren"
          id="emergency-siren-btn"
        >
          {isSirenActive ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{isSirenActive ? 'SILENCE SIREN' : 'TEST SIREN'}</span>
        </button>

        {/* Theme Switcher Toggle (Default Light -> Dark Mode) */}
        <button 
          className="btn-icon" 
          onClick={onToggleTheme} 
          title={`Switch to ${currentTheme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle Theme"
          id="theme-toggle-btn"
        >
          {currentTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
