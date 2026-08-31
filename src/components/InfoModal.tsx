import React from 'react';
import { X, BookOpen, ShieldAlert, Scale, Cpu, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="info-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-800">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Aviation Rights & WebMCP Guide
              </h2>
              <p className="text-xs text-slate-500">
                DGCA CAR (India), EU261, UK261, and WebMCP standards
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* Section 1: DGCA India Passenger Charter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BookOpen className="w-4 h-4 text-slate-700" />
              <span>1. Directorate General of Civil Aviation (DGCA) India – CAR Section 3, Series M, Part IV</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Delays */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-semibold text-slate-900 uppercase text-[11px]">
                  Flight Delays
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  • <strong>Delay 2h+</strong> (block time ≤ 2.5h): Free meals &amp; refreshments.<br />
                  • <strong>Delay 3h+</strong> (block time 2.5–5h): Free meals &amp; refreshments.<br />
                  • <strong>Delay 4h+</strong> (block time &gt; 5h): Free meals &amp; refreshments.<br />
                  • <strong>Delay 6h+</strong>: Alternate flight within 6h OR 100% refund.<br />
                  • <strong>Overnight delay</strong>: Free hotel + airport transfers.
                </p>
              </div>

              {/* Cancellations */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-semibold text-slate-900 uppercase text-[11px]">
                  Cancellations (Under 24h Notice)
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  • <strong>Block time ≤ 1 hr:</strong> ₹5,000 or Basic Fare + Fuel Charge.<br />
                  • <strong>Block time 1–2 hrs:</strong> ₹7,500 or Basic Fare + Fuel Charge.<br />
                  • <strong>Block time &gt; 2 hrs:</strong> ₹10,000 or Basic Fare + Fuel Charge.<br />
                  • <em>(Whichever is lower in all tiers)</em> + Full Refund.
                </p>
              </div>

              {/* Denied Boarding */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-semibold text-slate-900 uppercase text-[11px]">
                  Denied Boarding (Overbooking)
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  • <strong>Within 1 hr:</strong> No compensation.<br />
                  • <strong>Within 24 hrs:</strong> 200% Basic Fare + Fuel Charge (max ₹10,000) + ticket.<br />
                  • <strong>&gt; 24 hrs / Declined:</strong> 400% Basic Fare + Fuel Charge (max ₹20,000) + refund.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: EU261 & UK261 Regulation Matrix */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Scale className="w-4 h-4 text-slate-700" />
              <span>2. European Union (EC 261/2004) & UK261 Statutory Compensation</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 font-semibold uppercase text-[10px] tracking-wider">Flight Distance</th>
                    <th className="pb-2 font-semibold uppercase text-[10px] tracking-wider">EU261 Payout</th>
                    <th className="pb-2 font-semibold uppercase text-[10px] tracking-wider">UK261 Payout</th>
                    <th className="pb-2 font-semibold uppercase text-[10px] tracking-wider">Delay Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  <tr>
                    <td className="py-2 font-medium text-slate-800">Up to 1,500 km</td>
                    <td className="py-2 text-emerald-700 font-semibold">€250</td>
                    <td className="py-2 text-slate-900 font-semibold">£220</td>
                    <td className="py-2 text-slate-600">3+ hours arrival delay</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-slate-800">1,500 km to 3,500 km</td>
                    <td className="py-2 text-emerald-700 font-semibold">€400</td>
                    <td className="py-2 text-slate-900 font-semibold">£350</td>
                    <td className="py-2 text-slate-600">3+ hours arrival delay</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-slate-800">Over 3,500 km</td>
                    <td className="py-2 text-emerald-700 font-semibold">€600</td>
                    <td className="py-2 text-slate-900 font-semibold">£520</td>
                    <td className="py-2 text-slate-600">4+ hours arrival delay</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: WebMCP Protocol Architecture */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Cpu className="w-4 h-4 text-slate-700" />
              <span>3. WebMCP (Web Model Context Protocol) & AI Governance</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <p>
                FlightFixer implements the W3C WebMCP draft specification. It exposes structured tools through <code className="text-slate-900 font-mono font-medium">navigator.modelContext.registerTool()</code> (in Chrome 146+ environments) and the in-window WebMCP dispatcher <code className="text-slate-900 font-mono font-medium">window.__WEBMCP__</code>.
              </p>
              <p>
                <strong>Human-in-the-Loop Guard:</strong> The <code className="text-amber-800 font-mono font-medium">approve_and_fill_demo_form</code> tool is strictly guarded by passenger authorization. An AI agent cannot populate or submit grievance forms without explicit human review and approval of the drafted notice.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>FlightFixer Informational Aviation Rights System</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
