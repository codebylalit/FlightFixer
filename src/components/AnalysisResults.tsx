import React from 'react';
import {
  FileText, CheckCircle2, AlertCircle, HelpCircle,
  ShieldAlert, Sparkles, Check, Clock, Send, AlertTriangle, Info
} from 'lucide-react';
import { AnalysisResult, ClaimDraft, DemoClaimFormState } from '../types';
import { CompensationCard } from './CompensationCard';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  claimDraft: ClaimDraft | null;
  demoClaimForm: DemoClaimFormState;
  onPrepareDraft: () => void;
  onOpenDraftModal: () => void;
  onFillDemoForm: () => void;
}

const STATUS_CONFIG: Record<string, { pill: string; dot: string }> = {
  emerald: { pill: 'ff-pill-success', dot: '#5E9B78' },
  amber:   { pill: 'ff-pill-warn',    dot: '#CFA04B' },
  rose:    { pill: 'ff-pill-neutral', dot: '#E57373' },
  blue:    { pill: 'ff-pill-info',    dot: '#9DBDD4' },
  indigo:  { pill: 'ff-pill-info',    dot: '#9DBDD4' },
  slate:   { pill: 'ff-pill-neutral', dot: '#9CA3AF' },
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis, claimDraft, demoClaimForm,
  onPrepareDraft, onOpenDraftModal, onFillDemoForm
}) => {
  const cfg = STATUS_CONFIG[analysis.caseStatusColor] ?? STATUS_CONFIG['slate'];

  return (
    <div id="case-analysis-panel" className="ff-card-white" style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, paddingBottom: 16, borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 3 }}>
            Disruption Analysis
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Your rights under applicable aviation law</p>
        </div>
        <span className={`ff-pill ${cfg.pill}`} style={{ flexShrink: 0, marginTop: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'block', flexShrink: 0 }} />
          {analysis.caseStatus}
        </span>
      </div>

      {/* Jurisdiction */}
      <div id="jurisdiction-banner" style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '11px 14px', borderRadius: 13,
        background: 'rgba(201,221,234,0.20)',
        border: '1px solid rgba(157,189,212,0.28)',
      }}>
        <ShieldAlert style={{ width: 15, height: 15, color: 'var(--sky)', flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            {analysis.jurisdictionLabel}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-2)', fontWeight: 400, marginLeft: 6 }}>
              ({analysis.jurisdictionBadge})
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Framework: {analysis.applicableRules}</div>
        </div>
      </div>

      {/* Findings */}
      <div id="what-we-found-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <CheckCircle2 style={{ width: 13, height: 13, color: 'var(--text-2)' }} />
          <span className="ff-label">Findings & Verification</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {analysis.whatWeFound.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              fontSize: 12, color: 'var(--text)', lineHeight: 1.5,
              padding: '7px 12px', borderRadius: 10,
              background: 'rgba(238,243,247,0.60)',
              border: '1px solid rgba(148,163,184,0.12)',
            }}>
              <span style={{ color: 'var(--sky)', flexShrink: 0, marginTop: 1 }}>·</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Compensation */}
      <CompensationCard
        financialRecovery={analysis.financialRecovery}
        jurisdictionLabel={analysis.jurisdictionLabel}
        hasEnoughData={analysis.hasEnoughDataForEstimate}
      />

      {/* Missing info */}
      {analysis.missingInformation.length > 0 && (
        <div id="missing-info-card" style={{
          padding: '12px 14px', borderRadius: 13,
          background: 'rgba(207,160,75,0.08)',
          border: '1px solid rgba(207,160,75,0.22)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: '#9a6e1a', marginBottom: 7 }}>
            <AlertTriangle style={{ width: 13, height: 13 }} />
            More info needed
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {analysis.missingInformation.map((info, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: '#7a5214' }}>
                <span style={{ flexShrink: 0 }}>→</span> {info}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Passenger guidance */}
      <div id="passenger-guidance-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Info style={{ width: 13, height: 13, color: 'var(--text-2)' }} />
          <span className="ff-label">Your Rights & Entitlements</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {analysis.passengerGuidance.map((g, idx) => (
            <div key={idx} style={{
              padding: '9px 12px', borderRadius: 10, fontSize: 12,
              color: 'var(--text)', lineHeight: 1.6,
              background: 'rgba(255,255,255,0.70)',
              border: '1px solid rgba(148,163,184,0.14)',
            }}>
              {g}
            </div>
          ))}
        </div>
      </div>

      {/* Why this result */}
      {analysis.whyThisResult && (
        <div id="why-this-result-section" style={{
          padding: '10px 14px', borderRadius: 12,
          background: 'rgba(238,243,247,0.70)',
          border: '1px solid rgba(148,163,184,0.14)',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            Why this result?
          </span>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{analysis.whyThisResult}</p>
        </div>
      )}

      {/* Next Steps */}
      <div id="recommended-next-steps-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Clock style={{ width: 13, height: 13, color: 'var(--text-2)' }} />
          <span className="ff-label">Recommended Steps</span>
        </div>
        <ol style={{ display: 'flex', flexDirection: 'column', gap: 5, listStyle: 'none', margin: 0, padding: 0, counterReset: 'steps' }}>
          {analysis.recommendedNextSteps.map((step, idx) => (
            <li key={idx} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '8px 12px', borderRadius: 10, fontSize: 12,
              color: 'var(--text)', lineHeight: 1.5,
              background: 'rgba(255,255,255,0.70)',
              border: '1px solid rgba(148,163,184,0.14)',
            }}>
              <span style={{
                flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                background: 'var(--navy)', color: '#F9F7F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, marginTop: 1,
              }}>
                {idx + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Claim Draft CTA */}
      <div id="claim-draft-action-box" style={{
        padding: '16px', borderRadius: 16,
        background: 'rgba(238,243,247,0.80)',
        border: '1px solid rgba(157,189,212,0.22)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Claim Letter</h4>
            <p style={{ fontSize: 11, color: 'var(--text-2)' }}>Formal grievance tailored to your rights</p>
          </div>
          {claimDraft && (
            <span className={`ff-pill ${claimDraft.isApprovedByPassenger ? 'ff-pill-success' : 'ff-pill-warn'}`}>
              {claimDraft.isApprovedByPassenger ? '✓ Approved' : 'Pending Review'}
            </span>
          )}
        </div>

        {claimDraft ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.80)',
              border: '1px solid rgba(148,163,184,0.18)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11, color: 'var(--text)',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              lineHeight: 1.6,
            } as React.CSSProperties}>
              <strong style={{ display: 'block', marginBottom: 2 }}>Subject: {claimDraft.subject}</strong>
              {claimDraft.letterBody}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button id="review-edit-draft-btn" type="button" onClick={onOpenDraftModal}
                className="ff-btn-primary" style={{ flex: 1, fontSize: 12, padding: '9px 14px' }}>
                <FileText style={{ width: 14, height: 14 }} />
                {claimDraft.isApprovedByPassenger ? 'View Approved' : 'Review & Approve'}
              </button>
              <button id="fill-demo-form-btn" type="button" onClick={onFillDemoForm}
                disabled={!claimDraft.isApprovedByPassenger}
                className={claimDraft.isApprovedByPassenger ? 'ff-btn-success' : ''}
                style={claimDraft.isApprovedByPassenger ? { fontSize: 12, padding: '9px 14px' } : {
                  fontSize: 12, padding: '9px 14px', background: 'rgba(148,163,184,0.20)',
                  color: 'var(--text-3)', border: 'none', borderRadius: 12, cursor: 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <Send style={{ width: 13, height: 13 }} />
                Submit
              </button>
            </div>
          </div>
        ) : (
          <button id="prepare-draft-btn" type="button" onClick={onPrepareDraft}
            className="ff-btn-primary" style={{ width: '100%', fontSize: 13 }}>
            <Sparkles style={{ width: 15, height: 15, color: 'var(--amber)' }} />
            Generate Claim Letter
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 10.5, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
        {analysis.legalDisclaimer}
      </p>
    </div>
  );
};
