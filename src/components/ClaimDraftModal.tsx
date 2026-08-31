import React, { useState } from 'react';
import { X, Check, Copy, Download, ShieldCheck, Edit3, Sparkles } from 'lucide-react';
import { ClaimDraft } from '../types';

interface ClaimDraftModalProps {
  draft: ClaimDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveDraft: (updatedDraft: ClaimDraft) => void;
}

export const ClaimDraftModal: React.FC<ClaimDraftModalProps> = ({
  draft, isOpen, onClose, onApproveDraft
}) => {
  if (!isOpen || !draft) return null;

  const [subject, setSubject] = useState(draft.subject);
  const [letterBody, setLetterBody] = useState(draft.letterBody);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${letterBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([`Subject: ${subject}\n\n${letterBody}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `FlightClaims_Claim_${draft.flightNumber}_${draft.bookingReference}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveAndApprove = () => {
    const updated: ClaimDraft = { ...draft, subject, letterBody, isApprovedByPassenger: true };
    onApproveDraft(updated);
    onClose();
  };

  return (
    <div
      id="claim-draft-modal"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        background: 'rgba(23,32,51,0.45)', backdropFilter: 'blur(8px)',
      }}
      className="ff-fadeup"
    >
      <div style={{
        background: 'rgba(249,247,242,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.70)',
        borderRadius: 24,
        width: '100%', maxWidth: 680,
        maxHeight: '90dvh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(23,32,51,0.22)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid rgba(148,163,184,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          background: 'rgba(238,243,247,0.70)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'var(--navy)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(30,41,59,0.22)',
            }}>
              <ShieldCheck style={{ width: 18, height: 18, color: '#F9F7F2' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                Your Claim Draft
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Review, edit, and approve before submitting</p>
            </div>
          </div>
          <button
            id="close-draft-modal-btn"
            type="button"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: 'rgba(148,163,184,0.14)', border: '1px solid rgba(148,163,184,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-2)', transition: 'background 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(148,163,184,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(148,163,184,0.14)'}
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Human-in-the-loop notice */}
          <div style={{
            padding: '12px 14px', borderRadius: 14,
            background: 'rgba(201,221,234,0.22)',
            border: '1px solid rgba(157,189,212,0.30)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <Sparkles style={{ width: 15, height: 15, color: 'var(--sky)', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>
              <strong style={{ fontWeight: 700 }}>Human review required.</strong>{' '}
              This letter was structured by AI based on your case facts and applicable aviation regulations.
              Please verify all details are accurate before approving.
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="draft-subject-input" className="ff-label-field">
              Email / Notice Subject
            </label>
            <input
              id="draft-subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="ff-input"
              style={{ fontWeight: 600 }}
            />
          </div>

          {/* Letter body */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Edit3 style={{ width: 12, height: 12, color: 'var(--text-2)' }} />
              <label htmlFor="draft-body-textarea" className="ff-label-field" style={{ margin: 0 }}>
                Letter Content (Editable)
              </label>
            </div>
            <textarea
              id="draft-body-textarea"
              rows={14}
              value={letterBody}
              onChange={(e) => setLetterBody(e.target.value)}
              className="ff-input"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11.5, lineHeight: 1.7,
                resize: 'vertical', height: 'auto',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid rgba(148,163,184,0.15)',
          background: 'rgba(238,243,247,0.70)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button id="copy-draft-btn" type="button" onClick={handleCopy} className="ff-btn-secondary">
              {copied ? <Check style={{ width: 13, height: 13, color: 'var(--success)' }} /> : <Copy style={{ width: 13, height: 13 }} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button id="download-draft-btn" type="button" onClick={handleDownload} className="ff-btn-secondary">
              <Download style={{ width: 13, height: 13 }} />
              Download
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button id="cancel-draft-btn" type="button" onClick={onClose} className="ff-btn-secondary">
              Cancel
            </button>
            <button id="approve-draft-btn" type="button" onClick={handleSaveAndApprove} className="ff-btn-success">
              <Check style={{ width: 15, height: 15 }} />
              {draft.isApprovedByPassenger ? 'Re-Approve Draft' : 'Approve Draft'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
