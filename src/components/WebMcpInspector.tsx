import React, { useState } from 'react';
import { X, Terminal, Play, CheckCircle2, Code2, Cpu, Sparkles, AlertTriangle } from 'lucide-react';
import { WEBMCP_TOOLS_DEFINITIONS, webMcpBridge } from '../services/webMcpBridge';

interface WebMcpInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  webMcpMode: 'native' | 'bridge';
}

export const WebMcpInspector: React.FC<WebMcpInspectorProps> = ({
  isOpen,
  onClose,
  webMcpMode
}) => {
  if (!isOpen) return null;

  const [selectedTool, setSelectedTool] = useState(WEBMCP_TOOLS_DEFINITIONS[0].name);
  const [customJsonInput, setCustomJsonInput] = useState<string>('{\n  "disruption_type": "delayed",\n  "delay_hours": 5,\n  "delay_minutes": 30,\n  "airline": "IndiGo",\n  "airline_reason": "Aircraft maintenance issue"\n}');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeToolDef = WEBMCP_TOOLS_DEFINITIONS.find(t => t.name === selectedTool) || WEBMCP_TOOLS_DEFINITIONS[0];

  const handleToolChange = (toolName: string) => {
    setSelectedTool(toolName);
    setErrorMsg(null);
    setExecutionResult(null);

    // Set sensible default payloads for each tool
    if (toolName === 'analyze_flight_case') {
      setCustomJsonInput(JSON.stringify({
        airline: "IndiGo",
        flight_number: "6E-204",
        origin_iata: "BOM",
        destination_iata: "AMD",
        disruption_type: "delayed",
        delay_hours: 4,
        delay_minutes: 30,
        airline_reason: "ATC slot delay"
      }, null, 2));
    } else if (toolName === 'get_case_summary') {
      setCustomJsonInput('{}');
    } else if (toolName === 'prepare_passenger_request') {
      setCustomJsonInput(JSON.stringify({
        passenger_name: "Rahul Sharma",
        passenger_email: "rahul.sharma@example.com",
        booking_reference: "6E9K2A",
        custom_notes: "Missed family function due to extended delay"
      }, null, 2));
    } else if (toolName === 'approve_and_fill_demo_form') {
      setCustomJsonInput(JSON.stringify({
        override_confirmation: false
      }, null, 2));
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setErrorMsg(null);
    try {
      let parsedArgs = {};
      if (customJsonInput.trim()) {
        parsedArgs = JSON.parse(customJsonInput);
      }
      const res = await webMcpBridge.executeTool(selectedTool, parsedArgs);
      setExecutionResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid JSON payload or tool execution error.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div id="webmcp-inspector-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-800">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                  WebMCP Protocol Hub & Tool Inspector
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                  {webMcpMode === 'native' ? 'W3C navigator.modelContext' : 'Active In-Page Dispatcher'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inspect registered WebMCP tool schemas & execute live agent actions
              </p>
            </div>
          </div>
          <button
            id="close-webmcp-inspector-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs & Playground */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Tool Selector Pills */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wider mb-2">
              Registered WebMCP Tools
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {WEBMCP_TOOLS_DEFINITIONS.map(def => (
                <button
                  key={def.name}
                  id={`select-tool-${def.name}`}
                  type="button"
                  onClick={() => handleToolChange(def.name)}
                  className={`p-2.5 min-h-[38px] rounded-lg border text-left transition-colors font-mono text-xs truncate cursor-pointer ${
                    selectedTool === def.name
                      ? 'bg-slate-900 border-slate-900 text-white font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {def.name}()
                </button>
              ))}
            </div>
          </div>

          {/* Active Tool Schema & Description */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-xs text-slate-900">
                {activeToolDef.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">WebMCP Draft Spec</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeToolDef.description}
            </p>
          </div>

          {/* JSON Argument Playground */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-wider">
                Tool Input Parameters (JSON Schema)
              </label>
              <button
                id="execute-tool-now-btn"
                type="button"
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-3 py-1.5 min-h-[38px] rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current shrink-0" />
                <span>{isExecuting ? 'Invoking...' : 'Execute Tool on App'}</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={customJsonInput}
              onChange={(e) => setCustomJsonInput(e.target.value)}
              className="w-full p-3 bg-slate-50/60 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors leading-relaxed"
            />
            {errorMsg && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </div>

          {/* Execution Result Output */}
          {executionResult && (
            <div className="space-y-1.5">
              <span className="block text-[11px] font-medium text-slate-600 uppercase tracking-wider">
                Live Execution Result (Returned to Model / Caller)
              </span>
              <div className="p-3.5 rounded-lg bg-slate-900 font-mono text-xs text-emerald-400 max-h-56 overflow-x-auto overflow-y-auto no-scrollbar">
                <pre className="text-emerald-300 leading-tight">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-slate-500 text-xs flex-wrap gap-2">
          <span>
            Exposed at <code className="text-slate-800 font-mono font-medium">window.__WEBMCP__.invokeTool()</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 min-h-[38px] rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
