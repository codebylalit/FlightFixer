import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, ArrowUpRight, Terminal, RefreshCw } from 'lucide-react';
import { FlightCase, AnalysisResult, ClaimDraft } from '../types';
import { webMcpBridge } from '../services/webMcpBridge';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  actionInvoked?: string;
}

interface AICopilotChatProps {
  flightCase: FlightCase;
  analysisResult: AnalysisResult | null;
  claimDraft: ClaimDraft | null;
  onOpenDraftModal: () => void;
}

export const AICopilotChat: React.FC<AICopilotChatProps> = ({
  flightCase,
  analysisResult,
  claimDraft,
  onOpenDraftModal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: "Hello! I'm your FlightFixer AI Copilot. I analyze your flight disruption facts against DGCA CAR (India), EU261, UK261, and international rules. I can also execute WebMCP tools to inspect your case, prepare formal grievance letters, and guide your next steps.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    { label: 'Analyze current case', prompt: 'Please analyze my current flight case and explain my passenger rights.' },
    { label: 'DGCA 4h Delay rules', prompt: 'What are my exact rights under DGCA CAR for a 4-hour delay?' },
    { label: 'Draft claim letter', prompt: 'Please prepare a formal passenger claim request letter for my case.' },
    { label: 'Populate demo form', prompt: 'Fill the demo claim form with my approved case details.' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Check if user is asking to trigger a specific WebMCP action
      const lower = text.toLowerCase();
      let triggeredAction = '';

      if (lower.includes('draft') || lower.includes('prepare') || lower.includes('letter') || lower.includes('grievance')) {
        triggeredAction = 'prepare_passenger_request';
        await webMcpBridge.executeTool('prepare_passenger_request', {
          passenger_name: flightCase.passengerName,
          booking_reference: flightCase.bookingReference
        });
      } else if (lower.includes('populate') || lower.includes('fill demo') || lower.includes('submit form')) {
        triggeredAction = 'approve_and_fill_demo_form';
        await webMcpBridge.executeTool('approve_and_fill_demo_form', {});
      } else if (lower.includes('analyze') || lower.includes('status') || lower.includes('summary')) {
        triggeredAction = 'get_case_summary';
        await webMcpBridge.executeTool('get_case_summary', {});
      }

      // Call server-side Gemini Copilot endpoint
      const response = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          caseSummary: {
            airline: flightCase.airline,
            flightNumber: flightCase.flightNumber,
            origin: flightCase.origin?.iata,
            destination: flightCase.destination?.iata,
            disruptionType: flightCase.disruptionType,
            delayHours: flightCase.delayHours,
            analysisStatus: analysisResult?.caseStatus,
            recovery: analysisResult?.financialRecovery,
            hasDraft: !!claimDraft,
            isDraftApproved: claimDraft?.isApprovedByPassenger
          },
          conversationHistory: messages.map(m => ({ role: m.role, content: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const modelMsg: ChatMessage = {
          id: 'msg_reply_' + Date.now(),
          role: 'model',
          text: data.reply || "I have processed your request.",
          timestamp: new Date().toISOString(),
          actionInvoked: triggeredAction || undefined
        };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        // Local intelligent fallback response if backend offline or key not configured
        let fallbackText = "I have evaluated your case against the applicable aviation rules.";
        if (triggeredAction === 'prepare_passenger_request') {
          fallbackText = "I have executed the WebMCP `prepare_passenger_request` tool. A formal claim draft has been created in your workspace. Please review and approve the draft to continue.";
        } else if (triggeredAction === 'approve_and_fill_demo_form') {
          if (claimDraft?.isApprovedByPassenger) {
            fallbackText = "✓ WebMCP tool `approve_and_fill_demo_form` executed successfully. Your approved details have populated the Demo Claim Form!";
          } else {
            fallbackText = "⚠️ Human Approval Guard: The passenger must review and click 'Approve Draft' in the UI before the demo form can be populated.";
          }
        } else {
          fallbackText = `Based on your ${flightCase.disruptionType} case on ${flightCase.airline || 'your flight'}, your jurisdiction is ${analysisResult?.jurisdictionLabel || 'DGCA Domestic'}. Potential status: ${analysisResult?.caseStatus || 'Further Review Recommended'}.`;
        }

        setMessages(prev => [...prev, {
          id: 'msg_fallback_' + Date.now(),
          role: 'model',
          text: fallbackText,
          timestamp: new Date().toISOString(),
          actionInvoked: triggeredAction || undefined
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: 'msg_err_' + Date.now(),
        role: 'model',
        text: "I am ready to assist you. You can use the quick prompts below or inspect registered WebMCP tools.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-copilot-chat-container" className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 flex flex-col h-[560px] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              AI Copilot & WebMCP Agent
            </h3>
            <p className="text-[11px] text-slate-500">
              Conversational Rights Guidance & Tool Caller
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-xs'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.actionInvoked && (
                <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 font-medium">
                  <Terminal className="w-3 h-3" />
                  <span>WebMCP Action: {msg.actionInvoked}()</span>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-slate-500 text-xs">
            <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>Evaluating case against aviation regulations & executing WebMCP tools...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 border-t border-slate-100">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(qp.prompt)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-1 flex-shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI Copilot about your rights or actions..."
          className="flex-1 px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
