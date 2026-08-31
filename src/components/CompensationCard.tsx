import React from 'react';
import { IndianRupee, Euro, PoundSterling, DollarSign, HelpCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { FinancialRecovery } from '../types';

interface CompensationCardProps {
  financialRecovery: FinancialRecovery;
  jurisdictionLabel: string;
  hasEnoughData: boolean;
}

export const CompensationCard: React.FC<CompensationCardProps> = ({
  financialRecovery,
  jurisdictionLabel,
  hasEnoughData
}) => {
  const getCurrencyIcon = () => {
    switch (financialRecovery.currency) {
      case 'EUR': return <Euro className="w-5 h-5 text-emerald-400" />;
      case 'GBP': return <PoundSterling className="w-5 h-5 text-indigo-400" />;
      case 'USD': return <DollarSign className="w-5 h-5 text-blue-400" />;
      case 'INR':
      default:
        return <IndianRupee className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (financialRecovery.status) {
      case 'Potential Compensation':
      case 'Estimated Maximum':
        return {
          label: financialRecovery.status,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: CheckCircle2
        };
      case 'Refund & Care Eligible':
        return {
          label: 'Refund & Care Eligible',
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: ShieldCheck
        };
      case 'Not Yet Confirmed':
        return {
          label: 'Pending Info',
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: AlertTriangle
        };
      case 'No Estimate Available':
      default:
        return {
          label: 'Duty of Care Relief',
          bg: 'bg-slate-100 border-slate-200 text-slate-700',
          icon: HelpCircle
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div id="financial-recovery-card" className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
          Possible Financial Recovery
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${statusBadge.bg}`}>
          <StatusIcon className="w-3 h-3" />
          {statusBadge.label}
        </span>
      </div>

      {financialRecovery.formattedRange ? (
        <div className="flex items-baseline gap-2 pt-0.5">
          <div className="flex items-center text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
            {financialRecovery.formattedRange}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            (Estimated Statutory Relief)
          </span>
        </div>
      ) : (
        <div className="pt-0.5">
          <div className="text-base font-semibold text-slate-900">
            {financialRecovery.status === 'Not Yet Confirmed' ? 'Calculation Pending Info' : 'Duty of Care / Relief'}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600 leading-relaxed">
        {financialRecovery.details}
      </p>

      <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
        Applicable Framework: <strong className="text-slate-700 font-semibold">{jurisdictionLabel}</strong>
      </div>
    </div>
  );
};
