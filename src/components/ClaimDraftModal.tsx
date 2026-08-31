import React, { useState } from 'react';
import { X, Check, Copy, Download, ShieldCheck, AlertCircle, Edit3, Sparkles } from 'lucide-react';
import { ClaimDraft } from '../types';

interface ClaimDraftModalProps {
  draft: ClaimDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveDraft: (updatedDraft: ClaimDraft) => void;
}

export const ClaimDraftModal: React.FC<ClaimDraftModalProps> = ({
  draft,
  isOpen,
  onClose,
  onApproveDraft
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
    element.download = `FlightFixer_Claim_${draft.flightNumber}_${draft.bookingReference}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveAndApprove = () => {
    const updated: ClaimDraft = {
      ...draft,
      subject,
      letterBody,
      isApprovedByPassenger: true
    };
    onApproveDraft(updated);
    onClose();
  };

  return (
    <div id="claim-draft-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Official Passenger Notice Draft
              </h2>
              <p className="text-xs text-slate-500">
                Review, edit, and approve before submission
              </p>
            </div>
          </div>
          <button
            id="close-draft-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Human-in-the-loop reminder */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-700">
            <Sparkles className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Human Passenger Verification:</strong> AI has structured this notice based on applicable aviation regulations and your case facts. Please verify your details and click <strong>Approve Draft</strong> below.
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label htmlFor="draft-subject-input" className="block text-[11px] font-medium text-slate-600 uppercase tracking-wider mb-1">
              Email / Notice Subject
            </label>
            <input
              id="draft-subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
            />
          </div>

          {/* Letter Body Textarea */}
          <div>
            <label htmlFor="draft-body-textarea" className="block text-[11px] font-medium text-slate-600 uppercase tracking-wider mb-1">
              Letter Content (Editable)
            </label>
            <textarea
              id="draft-body-textarea"
              rows={12}
              value={letterBody}
              onChange={(e) => setLetterBody(e.target.value)}
              className="w-full p-3 bg-slate-50/60 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              id="copy-draft-btn"
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Letter'}
            </button>
            <button
              id="download-draft-btn"
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download .TXT
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="cancel-draft-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="approve-draft-btn"
              type="button"
              onClick={handleSaveAndApprove}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {draft.isApprovedByPassenger ? 'Save & Re-Approve' : 'Approve Draft (Human Guard)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
