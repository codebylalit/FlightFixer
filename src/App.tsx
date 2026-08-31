import React, { useState, useEffect, useCallback } from 'react';
import { 
  FlightCase, 
  AnalysisResult, 
  ClaimDraft, 
  DemoClaimFormState, 
  AIActivityLog 
} from './types';
import { getAirportByIata } from './services/airportService';
import { analyzeFlightDisruption } from './services/analysisService';
import { webMcpBridge, WEBMCP_TOOLS_DEFINITIONS } from './services/webMcpBridge';

import { Header } from './components/Header';
import { QuickTestCases } from './components/QuickTestCases';
import { FlightForm } from './components/FlightForm';
import { AnalysisResults } from './components/AnalysisResults';
import { AICopilotChat } from './components/AICopilotChat';
import { AIActivityPanel } from './components/AIActivityPanel';
import { DemoClaimForm } from './components/DemoClaimForm';
import { ClaimDraftModal } from './components/ClaimDraftModal';
import { WebMcpInspector } from './components/WebMcpInspector';
import { InfoModal } from './components/InfoModal';

import { Bot, Terminal, FileCheck, Shield, Sparkles } from 'lucide-react';

export function App() {
  // -------------------------------------------------------------
  // 1. Core Reactive Application State
  // -------------------------------------------------------------
  const [flightCase, setFlightCase] = useState<FlightCase>(() => ({
    airline: 'IndiGo',
    flightNumber: '6E-5342',
    origin: getAirportByIata('BOM'),
    destination: getAirportByIata('AMD'),
    flightDate: new Date().toISOString().split('T')[0],
    disruptionType: 'delayed',
    delayHours: 4,
    delayMinutes: 15,
    airlineReason: 'Late arrival of incoming aircraft due to ATC congestion',
    informedWindow: 'at_airport',
    alternateOffered: 'none',
    basicFare: 3200,
    fuelCharge: 800,
    scheduledBlockTimeHours: 1.2,
    alternateArrangedTime: 'none',
    passengerDeclinedAlternate: false,
    missedConnectionDelayHours: 0,
    singleTicketBooking: true,
    passengerName: 'Rahul Sharma',
    passengerEmail: 'rahul.sharma@example.com',
    passengerPhone: '+91 98765 43210',
    bookingReference: '6E9K2A'
  }));

  const [claimDraft, setClaimDraft] = useState<ClaimDraft | null>(null);

  const [demoClaimForm, setDemoClaimForm] = useState<DemoClaimFormState>({
    passengerName: '',
    passengerEmail: '',
    bookingReference: '',
    flightNumber: '',
    airline: '',
    route: '',
    disruption: '',
    requestType: '',
    claimAmount: '',
    message: '',
    isPopulated: false,
    submittedSimulated: false
  });

  const [activityLogs, setActivityLogs] = useState<AIActivityLog[]>([]);

  // Modals & UI View State
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isWebMcpInspectorOpen, setIsWebMcpInspectorOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [rightColumnTab, setRightColumnTab] = useState<'copilot' | 'activity' | 'demoForm'>('copilot');

  // Real-time analysis output
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(() => 
    analyzeFlightDisruption(flightCase)
  );

  // Helper to add activity logs
  const addActivityLog = useCallback((log: Omit<AIActivityLog, 'id' | 'timestamp'>) => {
    const newLog: AIActivityLog = {
      ...log,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // -------------------------------------------------------------
  // 2. Synchronize Analysis when Flight Case changes
  // -------------------------------------------------------------
  useEffect(() => {
    const newAnalysis = analyzeFlightDisruption(flightCase);
    setAnalysisResult(newAnalysis);
  }, [flightCase]);

  // -------------------------------------------------------------
  // 3. Register WebMCP Bridge with Live React Context
  // -------------------------------------------------------------
  useEffect(() => {
    webMcpBridge.setContext({
      flightCase,
      analysisResult,
      claimDraft,
      demoClaimForm,
      setFlightCase,
      setClaimDraft,
      setDemoClaimForm,
      addActivityLog
    });
  }, [flightCase, analysisResult, claimDraft, demoClaimForm, addActivityLog]);

  // Initial welcome activity log
  useEffect(() => {
    const status = webMcpBridge.getWebMCPStatus();
    addActivityLog({
      type: 'state_change',
      status: 'completed',
      description: `FlightFixer WebMCP Engine initialized. Mode: ${status.mode === 'native' ? 'W3C navigator.modelContext' : 'In-Page Agent Dispatcher'}. 4 tools registered.`
    });
  }, [addActivityLog]);

  // Handle Flight Case Field Updates
  const handleUpdateFlightCase = (updated: Partial<FlightCase>) => {
    setFlightCase(prev => ({ ...prev, ...updated }));
  };

  // Quick Test Case Application
  const handleApplyTestCase = (testCase: FlightCase, caseTitle: string) => {
    setFlightCase(testCase);
    setClaimDraft(null);
    setDemoClaimForm(prev => ({ ...prev, isPopulated: false, submittedSimulated: false }));
    addActivityLog({
      type: 'state_change',
      status: 'completed',
      description: `Loaded scenario: "${caseTitle}" for ${testCase.airline} ${testCase.flightNumber}`
    });
  };

  // Trigger WebMCP Draft Generation
  const handlePrepareDraft = async () => {
    await webMcpBridge.executeTool('prepare_passenger_request', {
      passenger_name: flightCase.passengerName,
      booking_reference: flightCase.bookingReference
    });
    setIsDraftModalOpen(true);
  };

  // Human Passenger Approval
  const handleApproveDraft = (updatedDraft: ClaimDraft) => {
    setClaimDraft(updatedDraft);
    addActivityLog({
      type: 'state_change',
      status: 'completed',
      description: `✓ HUMAN PASSENGER APPROVED: Claim draft verified for PNR ${updatedDraft.bookingReference}`
    });
  };

  // Fill Demo Form via WebMCP
  const handleFillDemoForm = async () => {
    const res = await webMcpBridge.executeTool('approve_and_fill_demo_form', {});
    if (res.success) {
      setRightColumnTab('demoForm');
    }
  };

  const webMcpStatus = webMcpBridge.getWebMCPStatus();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white relative overflow-x-hidden">
      {/* 1. Header Navigation */}
      <Header
        webMcpMode={webMcpStatus.mode}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        onOpenWebMcpInspector={() => setIsWebMcpInspectorOpen(true)}
      />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10">
        {/* Quick Test Scenarios */}
        <QuickTestCases onApplyCase={handleApplyTestCase} />

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Flight Input Form (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            <FlightForm
              flightCase={flightCase}
              onChange={handleUpdateFlightCase}
              currencyCode={analysisResult.financialRecovery.currency}
            />
          </div>

          {/* Column 2: Analysis & Regulatory Guidance (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            <AnalysisResults
              analysis={analysisResult}
              claimDraft={claimDraft}
              demoClaimForm={demoClaimForm}
              onPrepareDraft={handlePrepareDraft}
              onOpenDraftModal={() => setIsDraftModalOpen(true)}
              onFillDemoForm={handleFillDemoForm}
            />
          </div>

          {/* Column 3: AI Copilot / Activity Stream / Demo Claim Form (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Tab Navigation for Column 3 */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl">
              <button
                id="tab-copilot-btn"
                type="button"
                onClick={() => setRightColumnTab('copilot')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  rightColumnTab === 'copilot'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Copilot</span>
              </button>

              <button
                id="tab-activity-btn"
                type="button"
                onClick={() => setRightColumnTab('activity')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  rightColumnTab === 'activity'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Activity ({activityLogs.length})</span>
              </button>

              <button
                id="tab-demo-form-btn"
                type="button"
                onClick={() => setRightColumnTab('demoForm')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  rightColumnTab === 'demoForm'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Demo Claim</span>
              </button>
            </div>

            {/* Tab Content Display */}
            {rightColumnTab === 'copilot' && (
              <AICopilotChat
                flightCase={flightCase}
                analysisResult={analysisResult}
                claimDraft={claimDraft}
                onOpenDraftModal={() => setIsDraftModalOpen(true)}
              />
            )}

            {rightColumnTab === 'activity' && (
              <AIActivityPanel
                logs={activityLogs}
                onClearLogs={() => setActivityLogs([])}
              />
            )}

            {rightColumnTab === 'demoForm' && (
              <DemoClaimForm
                formData={demoClaimForm}
                onUpdateForm={(updated) => setDemoClaimForm(prev => ({ ...prev, ...updated }))}
                onSubmitSimulated={() => setDemoClaimForm(prev => ({ ...prev, submittedSimulated: true }))}
              />
            )}
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-semibold tracking-tight">FLIGHT<span className="text-slate-500">FIXER</span></span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-xs">AI Flight Disruption & WebMCP Engine</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setIsInfoModalOpen(true)}
              className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Passenger Rights Guide
            </button>
            <div className="h-3 w-px bg-slate-200" />
            <button
              type="button"
              onClick={() => setIsWebMcpInspectorOpen(true)}
              className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              WebMCP Protocol Inspector
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      <ClaimDraftModal
        draft={claimDraft}
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        onApproveDraft={handleApproveDraft}
      />

      <WebMcpInspector
        isOpen={isWebMcpInspectorOpen}
        onClose={() => setIsWebMcpInspectorOpen(false)}
        webMcpMode={webMcpStatus.mode}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
export default App;
