import React from 'react';
import { Plane, Terminal, Info, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  webMcpMode: 'native' | 'bridge';
  onOpenInfoModal: () => void;
  onOpenWebMcpInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  webMcpMode,
  onOpenInfoModal,
  onOpenWebMcpInspector,
}) => {
  return (
    <header id="flightfixer-header" className="h-16 border-b border-slate-200/80 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left: FlightFixer Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-xs">
            <Plane className="w-4 h-4 text-white rotate-[-45deg]" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 leading-tight">
              FlightFixer
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Flight Disruption Assistant
            </p>
          </div>
        </div>

        {/* Right: Status badge & Minimal Utility buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Status Badge: AI + Passenger Rights */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200/80 text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            <span>AI + Passenger Rights</span>
          </div>

          {/* WebMCP Tool Inspector Pill */}
          <button
            id="webmcp-status-pill"
            type="button"
            onClick={onOpenWebMcpInspector}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            title="Inspect registered WebMCP tools"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-[11px]">WebMCP</span>
          </button>

          {/* Rights Guide trigger */}
          <button
            id="header-info-btn"
            type="button"
            onClick={onOpenInfoModal}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="Aviation Regulations & Guidance"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

