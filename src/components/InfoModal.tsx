import React, { useState } from 'react';
import { X, BookOpen, Shield, Scale, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'about' | 'rights' | 'how-it-works';
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, defaultTab = 'about' }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'rights' | 'how-it-works'>(defaultTab);

  React.useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(17, 24, 39, 0.55)',
        backdropFilter: 'blur(10px)',
      }}
      className="ff-fadeup"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '88dvh',
          background: 'rgba(252, 252, 250, 0.97)',
          backdropFilter: 'blur(24px)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.80)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: 10,
              background: 'var(--navy)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(26, 35, 50, 0.20)',
            }}>
              <Shield style={{ width: 16, height: 16, color: '#F9F8F6' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                FlightClaims Guide
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                Your rights, regulations, and how it works
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 34, height: 34,
              borderRadius: 8,
              border: 'none',
              background: 'rgba(148, 163, 184, 0.14)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-2)',
              flexShrink: 0,
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '10px 16px',
          background: 'rgba(238, 243, 240, 0.60)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          flexShrink: 0,
          overflowX: 'auto',
        }} className="no-scrollbar">
          {[
            { id: 'about', label: 'About FlightClaims' },
            { id: 'rights', label: 'Passenger Rights' },
            { id: 'how-it-works', label: 'How It Works' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '6px 13px',
                minHeight: 34,
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === t.id ? 'var(--navy)' : 'transparent',
                color: activeTab === t.id ? '#FFFFFF' : 'var(--text-2)',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Scroll Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="ff-fadeup" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <h3 className="ff-display" style={{ fontSize: 20, color: 'var(--text)', marginBottom: 6 }}>
                  Built for frustrated flyers.
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  Airlines hide their compensation rules inside 50-page PDFs and complex claim portals. Most passengers never claim the ₹5,000–₹10,000 or €250–€600 they are legally owed.
                </p>
              </div>

              <div style={{
                padding: '14px 16px',
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.16)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles style={{ width: 14, height: 14, color: 'var(--amber)' }} /> What FlightClaims does:
                </div>
                <ul style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
                  <li>Calculates exact statutory amounts based on official DGCA CAR (India) and EU261/UK261 guidelines.</li>
                  <li>Drafts a complete, legally sound grievance notice quoting the exact statutory clauses and flight facts.</li>
                  <li>Finds the exact nodal grievance officer email for your airline so you can send it in 1 click.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: PASSENGER RIGHTS */}
          {activeTab === 'rights' && (
            <div className="ff-fadeup" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* DGCA India */}
              <div style={{
                padding: '14px 16px',
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.16)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Scale style={{ width: 14, height: 14, color: 'var(--sky)' }} /> DGCA CAR (India Domestic &amp; Departing)
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div>• <strong>Delays (2h–4h+):</strong> Free meals, beverages, and duty of care at the airport based on flight block time.</div>
                  <div>• <strong>Delays (6h+ or Overnight):</strong> Free hotel stay + airport transfers, or choice of 100% full refund / alternate flight departing within 6 hours.</div>
                  <div>• <strong>Cancellations (&lt;24h notice):</strong> Up to ₹5,000–₹10,000 statutory compensation (capped at Basic Fare + Fuel Charge) unless alternate flight within 2 hours is provided.</div>
                  <div>• <strong>Denied Boarding (Overbooking):</strong> 200% Basic + Fuel (max ₹10,000) for alternate &le; 24h; 400% Basic + Fuel (max ₹20,000) + full ticket refund for alternate &gt; 24h or declined.</div>
                </div>
              </div>

              {/* EU261 & UK261 */}
              <div style={{
                padding: '14px 16px',
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.16)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen style={{ width: 14, height: 14, color: 'var(--success)' }} /> EU261 &amp; UK261 (Europe &amp; UK Routes)
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div>• <strong>Short Routes (&le; 1,500 km):</strong> €250 / £220 fixed statutory cash payout.</div>
                  <div>• <strong>Medium Routes (1,500–3,500 km):</strong> €400 / £350 fixed statutory cash payout.</div>
                  <div>• <strong>Long-Haul Routes (&gt; 3,500 km):</strong> €600 / £520 fixed statutory cash payout for 3+ hour arrival delays or cancellations notified &lt; 14 days in advance.</div>
                  <div>• <strong>Duty of Care:</strong> Free food, refreshments, 2 phone calls/emails, and hotel accommodation for overnight delays.</div>
                </div>
              </div>

              {/* Montreal Convention */}
              <div style={{
                padding: '14px 16px',
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.16)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield style={{ width: 14, height: 14, color: 'var(--amber)' }} /> Montreal Convention 1999 (Article 19)
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>• Covers provable out-of-pocket financial damage up to <strong>5,346 SDR (~$7,100 USD / €6,500)</strong> for international flight delays and baggage losses.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOW IT WORKS */}
          {activeTab === 'how-it-works' && (
            <div className="ff-fadeup" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { step: '1', title: 'Enter your flight details', desc: 'Pick whether you were delayed, cancelled, or denied boarding, and enter your airline & PNR.' },
                { step: '2', title: 'Instant Legal Calculation', desc: 'Our engine applies real aviation distance formulas and regulations to calculate what you are owed.' },
                { step: '3', title: 'One-Click Official Letter', desc: 'Get a ready-to-send grievance letter with the exact airline grievance email address pre-filled.' },
              ].map(s => (
                <div key={s.step} style={{
                  display: 'flex',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.70)',
                  border: '1px solid rgba(148, 163, 184, 0.14)',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--navy)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(148, 163, 184, 0.12)',
          background: 'rgba(238, 243, 240, 0.70)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            type="button"
            onClick={onClose}
            className="ff-btn-primary"
            style={{ fontSize: 12, padding: '7px 16px' }}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
