import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  X, 
  Key, 
  ShieldAlert, 
  CheckCircle2, 
  Award,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import { PitchDocsHub } from './PitchDocsHub';

export function SecretTeamModal({ isOpen, onClose }) {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const validCodes = ['MINENOVA6', '26025', 'SIH26025', 'COALINDIA'];

  const handleUnlock = (e) => {
    e.preventDefault();
    const cleaned = passcode.trim().toUpperCase();
    if (validCodes.includes(cleaned)) {
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Access Denied: Invalid Security Passcode.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasscode('');
    setErrorMsg('');
  };

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="modal-card"
        style={{
          maxWidth: isUnlocked ? '1100px' : '440px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Modal Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
          title="Close Modal"
        >
          <X size={20} />
        </button>

        {!isUnlocked ? (
          /* Locked State - Lowkey Passcode Prompt */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--brand-gradient)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                }}
              >
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                MineNova6 Console
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Enter verification key to access internal team materials.
              </p>
            </div>

            <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  SECURITY KEY
                </label>
                <input 
                  type="password"
                  autoFocus
                  placeholder="Enter security access key..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {errorMsg && (
                <div style={{ fontSize: '0.75rem', color: '#ef4444', background: 'var(--color-critical-bg)', padding: '0.5rem', borderRadius: '4px' }}>
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
              >
                <span>Verify & Proceed</span>
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked State - Full Internal Dossier */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-safe">
                  <Unlock size={13} />
                  CLEARANCE GRANTED: MINENOVA6
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Internal SIH 2026 Evaluation Dossier (PS 26025)
                </span>
              </div>
              <button 
                className="btn-secondary" 
                onClick={handleLock}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                <Lock size={13} />
                <span>Lock Dossier</span>
              </button>
            </div>

            {/* Embedded Pitch & Defense Hub */}
            <PitchDocsHub />
          </div>
        )}
      </div>
    </div>
  );
}
