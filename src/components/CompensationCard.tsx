import React from 'react';
import { IndianRupee, Euro, PoundSterling, DollarSign, HelpCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { FinancialRecovery } from '../types';

interface CompensationCardProps {
  financialRecovery: FinancialRecovery;
  jurisdictionLabel: string;
  hasEnoughData: boolean;
}

export const CompensationCard: React.FC<CompensationCardProps> = ({
  financialRecovery, jurisdictionLabel, hasEnoughData
}) => {
  const CurrencyIcon = {
    EUR: Euro, GBP: PoundSterling, USD: DollarSign, INR: IndianRupee
  }[financialRecovery.currency] ?? IndianRupee;

  const hasAmount = !!financialRecovery.formattedRange;

  const STATUS = {
    'Potential Compensation': { pill: 'ff-pill-success', icon: CheckCircle2 },
    'Estimated Maximum':      { pill: 'ff-pill-success', icon: CheckCircle2 },
    'Refund & Care Eligible': { pill: 'ff-pill-info',    icon: ShieldCheck },
    'Not Yet Confirmed':      { pill: 'ff-pill-warn',    icon: AlertTriangle },
    'No Estimate Available':  { pill: 'ff-pill-neutral', icon: HelpCircle },
  };
  const s = STATUS[financialRecovery.status] ?? STATUS['No Estimate Available'];
  const SIcon = s.icon;

  return (
    <div id="financial-recovery-card" style={{
      padding: '14px 16px', borderRadius: 16,
      background: hasAmount
        ? 'linear-gradient(135deg, rgba(230,184,106,0.10) 0%, rgba(249,247,242,0.85) 100%)'
        : 'rgba(238,243,247,0.60)',
      border: hasAmount ? '1px solid rgba(230,184,106,0.28)' : '1px solid rgba(148,163,184,0.18)',
      position: 'relative',
    }}>
      {/* Amber glow behind compensation number */}
      {hasAmount && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 60,
          borderRadius: 16,
          background: 'radial-gradient(ellipse at 30% 0%, rgba(230,184,106,0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="ff-label">Possible Recovery</span>
        <span className={`ff-pill ${s.pill}`}>
          <SIcon style={{ width: 10, height: 10 }} />
          {financialRecovery.status}
        </span>
      </div>

      {hasAmount ? (
        <div style={{ marginBottom: 8 }}>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans break-words">
            {financialRecovery.formattedRange}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>Estimated statutory relief</div>
        </div>
      ) : (
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          {financialRecovery.status === 'Not Yet Confirmed' ? 'Pending More Info' : 'Duty of Care Available'}
        </div>
      )}

      <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>
        {financialRecovery.details}
      </p>

      <div style={{
        paddingTop: 8, borderTop: '1px solid rgba(148,163,184,0.15)',
        fontSize: 11, color: 'var(--text-3)',
      }}>
        Framework: <strong style={{ color: 'var(--text-2)' }}>{jurisdictionLabel}</strong>
      </div>
    </div>
  );
};
