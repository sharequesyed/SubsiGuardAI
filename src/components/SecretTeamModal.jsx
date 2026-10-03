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

  const validCodes = ['MINENOVA6', '150683', '26025', 'SIH26025', 'COALINDIA'];

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

            
            <div style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Team Name</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.15rem' }}>DIEMS_MineNova6</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Team ID</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#8b5cf6', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>150683</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Team Leader</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>Syed Shareque Yaseen</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>College</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Deogiri Institute of Engg. & Mgmt. Studies</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>Team Members</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { name: 'Syed Shareque Yaseen', role: 'Team Leader' },
                    { name: 'Monika Suri', role: 'Team Member' },
                    { name: 'Atharva Thete', role: 'Team Member' },
                    { name: 'Aditya Ubale', role: 'Team Member' },
                    { name: 'Syed Farhan Hashmi', role: 'Team Member' },
                    { name: 'Mohammad Affan Sabir', role: 'Team Member' }
                  ].map((m, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'var(--bg-tertiary)', 
                      padding: '0.4rem 0.65rem', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        color: m.role === 'Team Leader' ? 'var(--brand-primary)' : 'var(--text-muted)',
                        fontWeight: m.role === 'Team Leader' ? 700 : 500 
                      }}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            
            <PitchDocsHub />
          </div>
        )}
      </div>
    </div>
  );
}
