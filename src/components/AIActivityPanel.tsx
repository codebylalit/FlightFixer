import React, { useState } from 'react';
import { Activity, Terminal, CheckCircle, Clock, AlertCircle, Trash2, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';
import { AIActivityLog } from '../types';

interface AIActivityPanelProps {
  logs: AIActivityLog[];
  onClearLogs: () => void;
}

export const AIActivityPanel: React.FC<AIActivityPanelProps> = ({ logs, onClearLogs }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  const getStatusIcon = (status: AIActivityLog['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'pending_approval':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />;
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'running':
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-700 animate-spin" />;
    }
  };

  const getStatusBadge = (status: AIActivityLog['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'pending_approval':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'failed':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'running':
      default:
        return 'bg-slate-100 border-slate-200 text-slate-700';
    }
  };

  return (
    <div id="ai-activity-log-panel" className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-col h-[480px] sm:h-[520px] shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              WebMCP Activity Stream
            </h3>
            <p className="text-[11px] text-slate-500">
              Live tool executions & state transitions
            </p>
          </div>
        </div>

        {logs.length > 0 && (
          <button
            id="clear-activity-logs-btn"
            type="button"
            onClick={onClearLogs}
            className="p-2 min-h-[34px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Clear activity stream"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 divide-y divide-slate-100 no-scrollbar space-y-2 pt-2">
        {logs.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs font-mono">
            No tool activity logged yet. Modify a flight or run a quick test case to see live execution.
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div key={log.id} className="pt-2 first:pt-0">
                <button
                  type="button"
                  onClick={() => toggleExpand(log.id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start justify-between gap-2 group cursor-pointer"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5">{getStatusIcon(log.status)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {log.toolName && (
                          <span className="font-mono font-semibold text-xs text-slate-900">
                            {log.toolName}()
                          </span>
                        )}
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5">
                        {log.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                    <span className="text-[10px] font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {log.payload ? (
                      isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    ) : null}
                  </div>
                </button>

                {/* Expanded Payload Inspector */}
                {isExpanded && log.payload && (
                  <div className="mt-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto shadow-2xs">
                    <pre className="text-slate-600 leading-tight">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
