import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  Clock, 
  Send,
  AlertTriangle,
  Info
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

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  claimDraft,
  demoClaimForm,
  onPrepareDraft,
  onOpenDraftModal,
  onFillDemoForm
}) => {
  const getStatusColorClasses = () => {
    switch (analysis.caseStatusColor) {
      case 'emerald':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'amber':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'rose':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'slate':
        return 'bg-slate-100 border-slate-200 text-slate-700';
      case 'blue':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div id="case-analysis-panel" className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Header & Status */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Disruption Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear summary of applicable aviation rights.
          </p>
        </div>

        {/* Case Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColorClasses()}`}>
            {analysis.caseStatus}
          </span>
        </div>
      </div>

      {/* Jurisdiction Banner */}
      <div id="jurisdiction-banner" className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-semibold text-slate-900">
            {analysis.jurisdictionLabel} <span className="text-[11px] text-slate-600 font-mono font-normal">({analysis.jurisdictionBadge})</span>
          </div>
          <div className="text-slate-600 text-xs mt-0.5">
            Framework: {analysis.applicableRules}
          </div>
        </div>
      </div>

      {/* 1. WHAT WE FOUND */}
      <div id="what-we-found-section" className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
          Findings & Verification
        </h3>
        <ul className="space-y-1.5">
          {analysis.whatWeFound.map((item, idx) => (
            <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-900 font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. FINANCIAL RECOVERY */}
      <CompensationCard
        financialRecovery={analysis.financialRecovery}
        jurisdictionLabel={analysis.jurisdictionLabel}
        hasEnoughData={analysis.hasEnoughDataForEstimate}
      />

      {/* 3. MISSING INFORMATION (If any) */}
      {analysis.missingInformation.length > 0 && (
        <div id="missing-info-card" className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-900 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            Information Still Needed for Exact Calculation
          </div>
          <ul className="space-y-1">
            {analysis.missingInformation.map((info, idx) => (
              <li key={idx} className="text-xs text-amber-800 flex items-start gap-2">
                <span className="text-amber-600 font-bold">→</span>
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. PASSENGER GUIDANCE */}
      <div id="passenger-guidance-section" className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-700" />
          Passenger Rights & Mandatory Care
        </h3>
        <div className="space-y-2">
          {analysis.passengerGuidance.map((guidance, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
              {guidance}
            </div>
          ))}
        </div>
      </div>

      {/* 5. WHY THIS RESULT? */}
      {analysis.whyThisResult && (
        <div id="why-this-result-section" className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs space-y-1">
          <span className="font-semibold text-slate-900 uppercase tracking-wider text-[10px] block">
            Why This Result?
          </span>
          <p className="text-slate-600 leading-relaxed">
            {analysis.whyThisResult}
          </p>
        </div>
      )}

      {/* 6. RECOMMENDED NEXT STEPS */}
      <div id="recommended-next-steps-section" className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-700" />
          Step-by-Step Resolution Roadmap
        </h3>
        <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-700">
          {analysis.recommendedNextSteps.map((step, idx) => (
            <li key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <span className="text-slate-800">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 7. DRAFT GENERATION & ACTIONS */}
      <div id="claim-draft-action-box" className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold text-slate-900">
              Airline Passenger Request Draft
            </h4>
            <p className="text-[11px] text-slate-500">
              Prepare a formal grievance letter tailored to your rights
            </p>
          </div>
          {claimDraft && (
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
              claimDraft.isApprovedByPassenger 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {claimDraft.isApprovedByPassenger ? '✓ Approved' : 'Pending Review'}
            </span>
          )}
        </div>

        {claimDraft ? (
          <div className="space-y-2.5">
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 line-clamp-3">
              <span className="font-semibold text-slate-900 block mb-1">Subject: {claimDraft.subject}</span>
              {claimDraft.letterBody}
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                id="review-edit-draft-btn"
                type="button"
                onClick={onOpenDraftModal}
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                {claimDraft.isApprovedByPassenger ? 'View Approved Draft' : 'Review & Approve Draft'}
              </button>

              <button
                id="fill-demo-form-btn"
                type="button"
                onClick={onFillDemoForm}
                disabled={!claimDraft.isApprovedByPassenger}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  claimDraft.isApprovedByPassenger
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
                title={!claimDraft.isApprovedByPassenger ? 'Requires human passenger approval first' : 'Populate demo claim form'}
              >
                <Send className="w-3.5 h-3.5" />
                Populate Demo Form
              </button>
            </div>
          </div>
        ) : (
          <button
            id="prepare-draft-btn"
            type="button"
            onClick={onPrepareDraft}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Generate Airline Request (WebMCP Tool)
          </button>
        )}
      </div>

      {/* Transparency / Legal Disclaimer */}
      <p className="text-[11px] text-slate-500 text-center leading-relaxed">
        {analysis.legalDisclaimer}
      </p>
    </div>
  );
};
