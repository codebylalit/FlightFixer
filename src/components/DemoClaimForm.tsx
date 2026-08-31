import React, { useState } from 'react';
import { Send, ShieldAlert, CheckCircle2, AlertCircle, Sparkles, Building2, User, Mail, Hash, MapPin, DollarSign, FileCheck } from 'lucide-react';
import { DemoClaimFormState } from '../types';

interface DemoClaimFormProps {
  formData: DemoClaimFormState;
  onUpdateForm: (updated: Partial<DemoClaimFormState>) => void;
  onSubmitSimulated: () => void;
}

export const DemoClaimForm: React.FC<DemoClaimFormProps> = ({
  formData,
  onUpdateForm,
  onSubmitSimulated
}) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSimulated();
    setShowSuccessModal(true);
  };

  return (
    <div id="demo-claim-form-container" className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Prominent Demo Transparency Banner */}
      <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
        <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>Demo Claim Form (Demonstration Mode)</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          <strong>Demo Only:</strong> FlightFixer does not submit claims to airlines or regulatory bodies. This interface demonstrates how approved data from WebMCP tools flows securely into claim workflows with human oversight.
        </p>
      </div>

      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Airline Grievance Submission Mockup
          </h3>
        </div>
        {formData.isPopulated && (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
            ✓ Auto-Populated via WebMCP
          </span>
        )}
      </div>

      {!formData.isPopulated ? (
        <div id="demo-form-unpopulated-state" className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
          <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
          <div className="text-xs font-semibold text-slate-700">
            Demo Form Not Yet Populated
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            1. Input your flight disruption facts.<br />
            2. Generate a Passenger Notice draft via WebMCP.<br />
            3. <strong>Approve the draft</strong> (Human-in-the-Loop Guard).<br />
            4. Click "Populate Demo Form" to populate this form.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Passenger Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Passenger Name
              </label>
              <input
                type="text"
                value={formData.passengerName}
                onChange={(e) => onUpdateForm({ passengerName: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.passengerEmail}
                onChange={(e) => onUpdateForm({ passengerEmail: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Booking Ref & Airline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                PNR / Booking Ref
              </label>
              <input
                type="text"
                value={formData.bookingReference}
                onChange={(e) => onUpdateForm({ bookingReference: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs sm:text-sm uppercase focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Airline
              </label>
              <input
                type="text"
                value={formData.airline}
                onChange={(e) => onUpdateForm({ airline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Flight Number
              </label>
              <input
                type="text"
                value={formData.flightNumber}
                onChange={(e) => onUpdateForm({ flightNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs sm:text-sm uppercase focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Route & Disruption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Route
              </label>
              <input
                type="text"
                value={formData.route}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Claimed Relief / Recovery
              </label>
              <input
                type="text"
                value={formData.claimAmount}
                onChange={(e) => onUpdateForm({ claimAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-emerald-800 font-semibold text-xs sm:text-sm focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Full Draft Message */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Approved Letter Body (Attached to Claim)
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => onUpdateForm({ message: e.target.value })}
              className="w-full p-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <button
              id="simulate-claim-submit-btn"
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Simulate Claim Submission (Demo Test)
            </button>
          </div>
        </form>
      )}

      {/* Simulated Submission Success Modal */}
      {showSuccessModal && (
        <div id="simulated-submit-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">
                  Simulated Claim Processed
                </h4>
                <span className="text-xs text-emerald-700 font-mono font-medium">
                  DEMO REF: FIX-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p>
                <strong>Passenger:</strong> {formData.passengerName}
              </p>
              <p>
                <strong>Flight:</strong> {formData.airline} {formData.flightNumber} (PNR: {formData.bookingReference})
              </p>
              <p>
                <strong>Claimed Amount:</strong> <span className="text-emerald-800 font-bold">{formData.claimAmount}</span>
              </p>
              <p className="text-slate-500 text-[11px] pt-2 border-t border-slate-200">
                This was a simulation test. In a production flow, the passenger would submit their approved request directly to the airline nodal grievance email or AirSewa portal.
              </p>
            </div>

            <button
              id="close-success-modal-btn"
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Close Simulation Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
