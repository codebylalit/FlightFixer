import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Terminal } from 'lucide-react';
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
  flightCase, analysisResult, claimDraft, onOpenDraftModal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: "Hello! I'm your FlightClaims AI Copilot. I analyze your flight disruption facts against DGCA CAR (India), EU261, UK261, and international rules. I can also prepare formal grievance letters and guide your next steps.",
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
    { label: 'Analyze my case', prompt: 'Please analyze my current flight case and explain my passenger rights.' },
    { label: 'DGCA 4h rules', prompt: 'What are my exact rights under DGCA CAR for a 4-hour delay?' },
    { label: 'Draft claim letter', prompt: 'Please prepare a formal passenger claim request letter for my case.' },
    { label: 'Fill claim form', prompt: 'Fill the demo claim form with my approved case details.' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(), role: 'user', text, timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
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

      const response = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          caseSummary: {
            airline: flightCase.airline, flightNumber: flightCase.flightNumber,
            origin: flightCase.origin?.iata, destination: flightCase.destination?.iata,
            disruptionType: flightCase.disruptionType, delayHours: flightCase.delayHours,
            analysisStatus: analysisResult?.caseStatus, recovery: analysisResult?.financialRecovery,
            hasDraft: !!claimDraft, isDraftApproved: claimDraft?.isApprovedByPassenger
          },
          conversationHistory: messages.map(m => ({ role: m.role, content: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: 'msg_reply_' + Date.now(), role: 'model',
          text: data.reply || "I have processed your request.",
          timestamp: new Date().toISOString(),
          actionInvoked: triggeredAction || undefined
        }]);
      } else {
        let fallbackText = "I have evaluated your case against the applicable aviation rules.";
        if (triggeredAction === 'prepare_passenger_request') {
          fallbackText = "I've executed the claim preparation tool. A formal draft has been created — please review and approve it to continue.";
        } else if (triggeredAction === 'approve_and_fill_demo_form') {
          fallbackText = claimDraft?.isApprovedByPassenger
            ? "✓ Your approved details have populated the claim form!"
            : "⚠ Please approve the draft first before the form can be populated.";
        } else {
          fallbackText = `Based on your ${flightCase.disruptionType} case on ${flightCase.airline}, jurisdiction: ${analysisResult?.jurisdictionLabel ?? 'DGCA Domestic'}. Status: ${analysisResult?.caseStatus ?? 'Further Review Recommended'}.`;
        }
        setMessages(prev => [...prev, {
          id: 'msg_fallback_' + Date.now(), role: 'model',
          text: fallbackText, timestamp: new Date().toISOString(),
          actionInvoked: triggeredAction || undefined
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: 'msg_err_' + Date.now(), role: 'model',
        text: "I'm ready to assist. Use the quick prompts below or ask me anything.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="ai-copilot-chat-container"
      className="ff-card h-[480px] sm:h-[520px] p-4 sm:p-[18px] flex flex-col"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid rgba(148,163,184,0.15)', flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'var(--navy)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(30,41,59,0.20)',
          flexShrink: 0,
        }}>
          <Bot style={{ width: 15, height: 15, color: '#F9F7F2' }} />
        </div>
        <div className="min-w-0">
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }} className="truncate">AI Copilot</div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }} className="truncate">Ask anything about your passenger rights</div>
        </div>
        <div className="ff-pulse" style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 0 2px rgba(94,155,120,0.25)', flexShrink: 0 }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 2px', display: 'flex', flexDirection: 'column', gap: 10 }} className="no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'model' && (
              <div style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 2,
                background: 'rgba(201,221,234,0.30)', border: '1px solid rgba(157,189,212,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot style={{ width: 12, height: 12, color: 'var(--navy)' }} />
              </div>
            )}
            <div className="max-w-[88%] sm:max-w-[82%]" style={{
              padding: '9px 12px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              fontSize: 12, lineHeight: 1.6,
              background: msg.role === 'user' ? 'var(--navy)' : 'rgba(255,255,255,0.82)',
              color: msg.role === 'user' ? '#F9F7F2' : 'var(--text)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(148,163,184,0.18)',
              boxShadow: msg.role === 'user' ? '0 2px 10px rgba(30,41,59,0.18)' : '0 1px 6px rgba(23,32,51,0.05)',
            }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              {msg.actionInvoked && (
                <div style={{
                  marginTop: 8, paddingTop: 7, borderTop: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap',
                }}>
                  <span className="ff-tool-badge" style={{ background: msg.role === 'user' ? 'rgba(255,255,255,0.15)' : undefined }}>
                    <Terminal style={{ width: 10, height: 10 }} />
                    {msg.actionInvoked}()
                  </span>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 2,
                background: 'rgba(30,41,59,0.12)', border: '1px solid rgba(30,41,59,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User style={{ width: 12, height: 12, color: 'var(--text-2)' }} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7, flexShrink: 0,
              background: 'rgba(201,221,234,0.30)', border: '1px solid rgba(157,189,212,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Loader2 style={{ width: 12, height: 12, color: 'var(--navy)', animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{
              padding: '8px 12px', borderRadius: '14px 14px 14px 4px',
              background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(148,163,184,0.18)',
              fontSize: 12, color: 'var(--text-2)',
            }}>
              Analyzing case against aviation regulations…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '10px 0 8px', flexShrink: 0, borderTop: '1px solid rgba(148,163,184,0.12)' }} className="no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(qp.prompt)}
            style={{
              flexShrink: 0,
              padding: '6px 12px',
              minHeight: 32,
              borderRadius: 99,
              background: 'rgba(201,221,234,0.25)',
              border: '1px solid rgba(157,189,212,0.30)',
              fontSize: 11,
              color: 'var(--text-2)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 150ms, color 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(157,189,212,0.35)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,221,234,0.25)'; e.currentTarget.style.color = 'var(--text-2)'; }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about your rights or actions…"
          className="ff-input"
          style={{ flex: 1, fontSize: 12, minHeight: 42 }}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          style={{
            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
            background: inputText.trim() && !isLoading ? 'var(--navy)' : 'rgba(148,163,184,0.20)',
            border: 'none', cursor: inputText.trim() && !isLoading ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 160ms, transform 130ms',
            boxShadow: inputText.trim() ? '0 2px 8px rgba(30,41,59,0.18)' : 'none',
          }}
        >
          <Send style={{ width: 14, height: 14, color: inputText.trim() && !isLoading ? '#F9F7F2' : 'var(--text-3)' }} />
        </button>
      </form>
    </div>
  );
};
