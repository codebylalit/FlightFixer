import React, { useState } from 'react';
import { Send, ShieldAlert, CheckCircle2, Sparkles, FileCheck } from 'lucide-react';
import { DemoClaimFormState } from '../types';

interface DemoClaimFormProps {
  formData: DemoClaimFormState;
  onUpdateForm: (updated: Partial<DemoClaimFormState>) => void;
  onSubmitSimulated: () => void;
}

export const DemoClaimForm: React.FC<DemoClaimFormProps> = ({
  formData, onUpdateForm, onSubmitSimulated
}) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSimulated();
    setShowSuccessModal(true);
  };

  return (
    <div id="demo-claim-form-container" className="ff-card" style={{ padding: '20px 20px 22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(94,155,120,0.12)', border: '1px solid rgba(94,155,120,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck style={{ width: 15, height: 15, color: 'var(--success)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Claim Submission</h3>
            <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>Airline Grievance Mockup</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="ff-pill ff-pill-warn">Demo Only</span>
          {formData.isPopulated && <span className="ff-pill ff-pill-success">✓ AI Filled</span>}
        </div>
      </div>

      {/* Demo transparency notice */}
      <div style={{
        padding: '10px 12px', borderRadius: 12, marginBottom: 16,
        background: 'rgba(230,184,106,0.08)',
        border: '1px solid rgba(230,184,106,0.22)',
        display: 'flex', gap: 9, alignItems: 'flex-start',
      }}>
        <ShieldAlert style={{ width: 14, height: 14, color: '#9a6e1a', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: '#7a5214', lineHeight: 1.55 }}>
          <strong>Demo only:</strong> This form shows how AI-approved claim data flows into a grievance workflow. No real submissions are made.
        </p>
      </div>

      {!formData.isPopulated ? (
        <div id="demo-form-unpopulated-state" style={{
          padding: '28px 20px', textAlign: 'center', borderRadius: 16,
          background: 'rgba(238,243,247,0.60)',
          border: '1px dashed rgba(157,189,212,0.40)',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, margin: '0 auto 12px',
            background: 'rgba(201,221,234,0.28)',
            border: '1px solid rgba(157,189,212,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles style={{ width: 20, height: 20, color: 'var(--sky)' }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Waiting for approval
          </div>
          <ol style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'left', display: 'inline-block', lineHeight: 1.8, listStylePosition: 'inside' }}>
            <li>Enter your flight disruption details</li>
            <li>Generate your claim letter</li>
            <li><strong>Approve the draft</strong> (human review)</li>
            <li>Click "Submit Claim" on the left panel</li>
          </ol>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="ff-label-field">Passenger Name</label>
              <input type="text" value={formData.passengerName}
                onChange={(e) => onUpdateForm({ passengerName: e.target.value })}
                required className="ff-input" />
            </div>
            <div>
              <label className="ff-label-field">Contact Email</label>
              <input type="email" value={formData.passengerEmail}
                onChange={(e) => onUpdateForm({ passengerEmail: e.target.value })}
                required className="ff-input" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label className="ff-label-field">PNR / Booking Ref</label>
              <input type="text" value={formData.bookingReference}
                onChange={(e) => onUpdateForm({ bookingReference: e.target.value })}
                required className="ff-input"
                style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }} />
            </div>
            <div>
              <label className="ff-label-field">Airline</label>
              <input type="text" value={formData.airline}
                onChange={(e) => onUpdateForm({ airline: e.target.value })}
                className="ff-input" />
            </div>
            <div>
              <label className="ff-label-field">Flight No.</label>
              <input type="text" value={formData.flightNumber}
                onChange={(e) => onUpdateForm({ flightNumber: e.target.value })}
                className="ff-input"
                style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="ff-label-field">Route</label>
              <input type="text" value={formData.route} readOnly className="ff-input"
                style={{ background: 'rgba(238,243,247,0.70)', color: 'var(--text-2)' }} />
            </div>
            <div>
              <label className="ff-label-field">Claimed Amount</label>
              <input type="text" value={formData.claimAmount}
                onChange={(e) => onUpdateForm({ claimAmount: e.target.value })}
                className="ff-input" style={{ color: 'var(--success)', fontWeight: 700 }} />
            </div>
          </div>

          <div>
            <label className="ff-label-field">Approved Letter Body</label>
            <textarea rows={5} value={formData.message}
              onChange={(e) => onUpdateForm({ message: e.target.value })}
              className="ff-input"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, lineHeight: 1.6, resize: 'vertical', height: 'auto' }} />
          </div>

          <button id="simulate-claim-submit-btn" type="submit" className="ff-btn-success" style={{ width: '100%' }}>
            <Send style={{ width: 14, height: 14 }} />
            Simulate Claim Submission
          </button>
        </form>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div id="simulated-submit-modal" style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          background: 'rgba(23,32,51,0.45)', backdropFilter: 'blur(6px)',
        }} className="ff-fadeup">
          <div style={{
            background: 'rgba(249,247,242,0.96)', borderRadius: 22, width: '100%', maxWidth: 420,
            padding: 24, boxShadow: '0 20px 60px rgba(23,32,51,0.20)',
            border: '1px solid rgba(255,255,255,0.70)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(94,155,120,0.12)', border: '1px solid rgba(94,155,120,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 style={{ width: 22, height: 22, color: 'var(--success)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Simulated Claim Processed</h4>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--success)' }}>
                  DEMO REF: FIX-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(238,243,247,0.80)', border: '1px solid rgba(148,163,184,0.18)', fontSize: 12, color: 'var(--text)', lineHeight: 1.7, marginBottom: 16 }}>
              <p><strong>Passenger:</strong> {formData.passengerName}</p>
              <p><strong>Flight:</strong> {formData.airline} {formData.flightNumber} (PNR: {formData.bookingReference})</p>
              <p><strong>Claimed:</strong> <span style={{ color: 'var(--success)', fontWeight: 700 }}>{formData.claimAmount}</span></p>
              <p style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(148,163,184,0.18)', fontSize: 11, color: 'var(--text-3)' }}>
                Demo simulation only. In production, you'd submit this directly to the airline nodal grievance email or AirSewa portal.
              </p>
            </div>

            <button id="close-success-modal-btn" type="button" onClick={() => setShowSuccessModal(false)}
              className="ff-btn-primary" style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
