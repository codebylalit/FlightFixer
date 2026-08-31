import React from 'react';
import { Info, Plane } from 'lucide-react';

interface HeaderProps {
  onOpenInfoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInfoModal }) => {
  return (
    <header
      id="flightfixer-header"
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(238,243,247,0.75)',
        backdropFilter: 'blur(20px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
        borderBottom: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 1px 20px rgba(23,32,51,0.06)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">

        {/* Left — Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div style={{
            width: 32, height: 32,
            background: 'var(--navy)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(30,41,59,0.22)',
          }}>
            <Plane style={{ width: 15, height: 15, color: '#F9F7F2', transform: 'rotate(-45deg)' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              FlightClaims
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.03em' }}>
              AI Disruption Copilot
            </div>
          </div>
        </div>

        {/* Right — Status + Info */}
        <div className="flex items-center gap-2.5">
          {/* Live badge */}
          <div className="hidden sm:flex items-center gap-1.5 ff-pill ff-pill-success">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'block', flexShrink: 0 }} />
            AI Active
          </div>

          {/* Demo mode badge */}
          <div className="hidden sm:flex ff-pill ff-pill-warn">
            Demo Mode
          </div>

          {/* Info */}
          <button
            id="header-info-btn"
            type="button"
            onClick={onOpenInfoModal}
            title="Passenger Rights Guide"
            style={{
              width: 34, height: 34,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(148,163,184,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 160ms, box-shadow 160ms',
              color: 'var(--text-2)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.95)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.65)')}
          >
            <Info style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>
    </header>
  );
};
