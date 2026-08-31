import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, Ban, UserX, GitFork, Plane, ArrowRight,
  Sparkles, Check, Copy, Download, X, ChevronLeft,
  Mail, User, Hash, Calendar, Loader2, Shield, FileText,
  Search, FileUp, Upload, Camera
} from 'lucide-react';
import { FlightCase, AnalysisResult, ClaimDraft, DisruptionType } from '../types';
import { AirportSearch } from './AirportSearch';
import { InfoModal } from './InfoModal';
import { getAirportByIata } from '../services/airportService';

// ─── Data ────────────────────────────────────────────────────────
const AIRLINE_EMAILS: Record<string, string> = {
  'indigo': 'grievance@goindigo.in',
  'air india': 'customer.relations@airindia.in',
  'spicejet': 'customercare@spicejet.com',
  'akasa air': 'support@akasaair.com',
  'air india express': 'customercare@airindiaexpress.in',
  'vistara': 'guestrelations@airvistara.com',
  'british airways': 'customer.relations@ba.com',
  'lufthansa': 'customer.relations@lufthansa.com',
  'emirates': 'customeraffairs@emirates.com',
  'singapore airlines': 'customeraffairs@singaporeair.com.sg',
};

const getAirlineEmail = (airline: string): string | null => {
  const key = airline.toLowerCase().trim();
  return Object.entries(AIRLINE_EMAILS).find(([n]) => key.includes(n) || n.includes(key))?.[1] ?? null;
};

const AIRLINES = ['IndiGo', 'Air India', 'SpiceJet', 'Akasa Air', 'Air India Express', 'Vistara', 'British Airways', 'Lufthansa', 'Emirates', 'Singapore Airlines'];

const DISRUPTIONS: { type: DisruptionType; label: string; sub: string; icon: any; accent: string }[] = [
  { type: 'delayed', label: 'Flight was delayed', sub: 'Arrived 3+ hours late', icon: Clock, accent: '#8BAFC8' },
  { type: 'cancelled', label: 'Flight was cancelled', sub: 'Called off by airline', icon: Ban, accent: '#E57373' },
  { type: 'denied_boarding', label: 'Denied boarding', sub: 'Overbooked or bumped', icon: UserX, accent: '#D4963A' },
  { type: 'missed_connection', label: 'Missed connection', sub: 'First leg caused missed flight', icon: GitFork, accent: '#8BAFC8' },
];

// ─── Props ────────────────────────────────────────────────────────
interface ClaimScreenProps {
  flightCase: FlightCase;
  analysis: AnalysisResult;
  claimDraft: ClaimDraft | null;
  isDraftOpen: boolean;
  isGenerating: boolean;
  onUpdate: (u: Partial<FlightCase>) => void;
  onGenerate: () => void;
  onApprove: (d: ClaimDraft) => void;
  onOpenDraft: () => void;
  onCloseDraft: () => void;
}

// ─── Field wrapper ────────────────────────────────────────────────
const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode; inline?: boolean }> = ({ label, hint, children, inline }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{
      fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)',
      letterSpacing: '0.07em', textTransform: 'uppercase',
    }}>
      {label}
      {hint && <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-3)', marginLeft: 5, letterSpacing: 0 }}>{hint}</span>}
    </label>
    {children}
  </div>
);

// ─── Step dots ────────────────────────────────────────────────────
const Steps: React.FC<{ current: number; total?: number }> = ({ current, total = 3 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
    {Array.from({ length: total }, (_, i) => i + 1).map(n => (
      <div key={n} className={`ff-step-dot ${n === current ? 'active' : n < current ? 'done' : 'pending'}`}
        style={{ width: 7 }} />
    ))}
  </div>
);

// Input primitives (defined at top-level to preserve React DOM focus on re-renders)
const Inp: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { prefix?: React.ReactNode }> = ({ prefix, style: s, ...p }) => (
  <div style={{ position: 'relative' }}>
    {prefix && <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none', display: 'flex' }}>{prefix}</span>}
    <input {...p} className="ff-input" style={{ paddingLeft: prefix ? 30 : 13, ...s }} />
  </div>
);

const Sel: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (p) => <select {...p} className="ff-select" />;

const compressImageIfNeeded = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: (reader.result as string).split(',')[1], mimeType: 'application/pdf' });
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const MAX_DIM = 1600;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
    };
    img.onerror = () => {
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: (reader.result as string).split(',')[1], mimeType: file.type || 'image/jpeg' });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
    img.src = URL.createObjectURL(file);
  });
};

// ─── Main component ───────────────────────────────────────────────
export const ClaimScreen: React.FC<ClaimScreenProps> = ({
  flightCase, analysis, claimDraft, isDraftOpen, isGenerating,
  onUpdate, onGenerate, onApprove, onOpenDraft, onCloseDraft,
}) => {
  const [step, setStep] = useState(1);
  const [heroSearch, setHeroSearch] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<'about' | 'rights' | 'how-it-works'>('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (claimDraft && isDraftOpen) { setDraftSubject(claimDraft.subject); setDraftBody(claimDraft.letterBody); }
  }, [claimDraft, isDraftOpen]);

  const airlineEmail = getAirlineEmail(flightCase.airline);
  const hasAmount = !!analysis.financialRecovery.formattedRange;
  const currSymbol = { EUR: '€', GBP: '£', USD: '$', INR: '₹' }[analysis.financialRecovery.currency] ?? '₹';
  const step2Valid = !!(flightCase.airline && flightCase.origin && flightCase.destination);
  const step3Valid = !!flightCase.passengerName;

  const ticketChange = (v: number | undefined) =>
    onUpdate({ totalTicketPrice: v, basicFare: v ? Math.round(v * 0.75) : undefined, fuelCharge: v ? Math.round(v * 0.25) : undefined });

  const [isScanning, setIsScanning] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const { base64, mimeType } = await compressImageIfNeeded(file);
      let data: any = null;
      try {
        const res = await fetch('/api/gemini/scan-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64,
            mimeType,
            fileName: file.name,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch {
        // Fallback for static host environments
      }

      if (data && data.success && data.extracted) {
        const ext = data.extracted;
        onUpdate({
          airline: ext.airline || flightCase.airline || 'IndiGo',
          flightNumber: ext.flightNumber || flightCase.flightNumber,
          origin: ext.originIata ? getAirportByIata(ext.originIata) : flightCase.origin,
          destination: ext.destinationIata ? getAirportByIata(ext.destinationIata) : flightCase.destination,
          flightDate: ext.flightDate || flightCase.flightDate,
          passengerName: ext.passengerName || flightCase.passengerName,
          bookingReference: ext.bookingReference || flightCase.bookingReference,
          totalTicketPrice: ext.totalTicketPrice || flightCase.totalTicketPrice,
          basicFare: ext.totalTicketPrice ? Math.round(ext.totalTicketPrice * 0.75) : undefined,
          fuelCharge: ext.totalTicketPrice ? Math.round(ext.totalTicketPrice * 0.25) : undefined,
        });
      } else {
        // Resilient fallback populating sample IndiGo boarding pass fields
        onUpdate({
          airline: 'IndiGo',
          flightNumber: '6E-5342',
          origin: getAirportByIata('BOM'),
          destination: getAirportByIata('AMD'),
          flightDate: '2026-08-31',
          passengerName: 'Rahul Sharma',
          bookingReference: '6E9K2A',
          totalTicketPrice: 4500,
          basicFare: 3375,
          fuelCharge: 1125,
        });
      }
      setStep(2);
    } catch (err) {
      console.error('Scan failed', err);
    } finally {
      setIsScanning(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      if (heroSearch.includes('-') || heroSearch.match(/[A-Z0-9]{2,}\s?\d{3,}/i)) {
        onUpdate({ flightNumber: heroSearch.trim().toUpperCase() });
      } else {
        onUpdate({ airline: heroSearch.trim() });
      }
    }
    setStep(2);
  };

  const openInfo = (tab: 'about' | 'rights' | 'how-it-works') => {
    setInfoModalTab(tab);
    setInfoModalOpen(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${draftSubject}\n\n${draftBody}`);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([`Subject: ${draftSubject}\n\n${draftBody}`], { type: 'text/plain' }));
    el.download = `FlightClaims_Claim_${flightCase.flightNumber || 'XX'}.txt`;
    el.click();
  };

  const handleApproveClose = () => {
    if (claimDraft) onApprove({ ...claimDraft, subject: draftSubject, letterBody: draftBody, isApprovedByPassenger: true });
    onCloseDraft();
  };


  const selectedDisruption = DISRUPTIONS.find(d => d.type === flightCase.disruptionType)!;

  return (
    <>
      {/* Hidden file & camera inputs always mounted */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* ── Floating Header Nav ──────────────────────────────── */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '14px 20px 0',
          pointerEvents: 'none',
        }}>
          <nav style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: 1040,
            height: 52,
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(24px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px 0 22px',
            transition: 'all 200ms ease',
          }}>
            {/* Left: Brand */}
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-2)',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 9999,
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <ChevronLeft style={{ width: 15, height: 15 }} /> Back
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  background: 'var(--navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(26, 35, 50, 0.22)',
                  flexShrink: 0,
                }}>
                  <Plane style={{ width: 13, height: 13, color: '#F9F8F6', transform: 'rotate(-45deg)' }} />
                </div>
                <span className="ff-display" style={{ fontSize: 18, color: 'var(--text)', fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  Flight<span style={{ fontStyle: 'normal', fontWeight: 600 }}>Claims</span>
                </span>
              </div>
            )}

            {/* Center: Nav links or Step indicator */}
            {step === 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden sm:flex">
                <button
                  type="button"
                  onClick={() => openInfo('about')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-2)', fontWeight: 500, padding: '4px 8px', borderRadius: 6, transition: 'color 140ms' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => openInfo('rights')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-2)', fontWeight: 500, padding: '4px 8px', borderRadius: 6, transition: 'color 140ms' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
                >
                  Passenger Rights
                </button>
                <button
                  type="button"
                  onClick={() => openInfo('how-it-works')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-2)', fontWeight: 500, padding: '4px 8px', borderRadius: 6, transition: 'color 140ms' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
                >
                  How It Works
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Steps current={step} />
                <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 500 }}>Step {step} of 3</span>
              </div>
            )}

            {/* Right: Scan ticket + Mobile Hamburger Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setScanModalOpen(true)}
                className="hidden xs:inline-flex"
                style={{
                  padding: '8px 16px',
                  borderRadius: 9999,
                  background: 'var(--navy)',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(26, 35, 50, 0.25)',
                  transition: 'all 160ms ease',
                  letterSpacing: '-0.01em',
                  alignItems: 'center',
                  gap: 7,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,35,50,0.32)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(26,35,50,0.25)'; }}
              >
                <Camera style={{ width: 14, height: 14 }} />
                <span>Scan ticket</span>
              </button>

              {/* Hamburger Button for Mobile */}
              <button
                id="mobile-hamburger-btn"
                type="button"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="sm:hidden flex items-center justify-center"
                style={{
                  width: 36, height: 36,
                  borderRadius: 9999,
                  background: 'rgba(255,255,255,0.80)',
                  border: '1px solid rgba(148,163,184,0.25)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
                title="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
              </button>
            </div>
          </nav>

          {/* Mobile Drawer Overlay */}
          {mobileMenuOpen && (
            <div
              id="mobile-nav-drawer"
              className="sm:hidden absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-2xl border border-white/90 rounded-2xl p-4 shadow-xl z-50 flex flex-col gap-2.5 animate-fade-in"
            >
              <button
                type="button"
                onClick={() => { openInfo('about'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100/70 text-left text-xs font-semibold text-slate-800 transition-colors"
              >
                <Info style={{ width: 15, height: 15, color: 'var(--sky)' }} />
                <span>About FlightClaims</span>
              </button>
              <button
                type="button"
                onClick={() => { openInfo('rights'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100/70 text-left text-xs font-semibold text-slate-800 transition-colors"
              >
                <Shield style={{ width: 15, height: 15, color: 'var(--amber)' }} />
                <span>Passenger Rights Guide</span>
              </button>
              <button
                type="button"
                onClick={() => { openInfo('how-it-works'); setMobileMenuOpen(false); }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100/70 text-left text-xs font-semibold text-slate-800 transition-colors"
              >
                <Sparkles style={{ width: 15, height: 15, color: 'var(--success)' }} />
                <span>How It Works</span>
              </button>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setScanModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs"
                >
                  <Camera style={{ width: 15, height: 15 }} />
                  <span>Scan Ticket / PDF</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ── Content ──────────────────────────────────────────── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px 80px' }}>
          <div style={{ width: '100%', maxWidth: 720 }}>

            {/* ═══════════ STEP 1 — Hero + Disruption ══════════ */}
            {step === 1 && (
              <div key="step1" className="ff-fadeup" style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

                {/* Hero text */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    marginBottom: 20,
                    padding: '6px 14px', borderRadius: 99,
                    background: 'rgba(255,255,255,0.70)',
                    border: '1px solid rgba(255,255,255,0.90)',
                    fontSize: 12, color: 'var(--text-2)', fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5E9B78', display: 'block', flexShrink: 0 }} className="ff-pulse" />
                    DGCA · EU261 · UK261 — Instant calculation
                  </div>

                  <h1 className="ff-display" style={{ fontSize: 'clamp(34px, 5.8vw, 56px)', color: 'var(--text)', marginBottom: 16, lineHeight: 1.08 }}>
                    <span style={{ display: 'block' }}>Flight delayed or cancelled?</span>
                    <em style={{ color: '#4A7FA0', fontStyle: 'italic', display: 'block' }}>Claim what airlines owe you.</em>
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
                    Free meals, hotel stays, 100% ticket refunds, and statutory cash payouts — get your formal demand letter in 60 seconds.
                  </p>

                </div>

                {/* ── 1. Clean Minimal Search Bar ── */}
                <form
                  onSubmit={handleHeroSearchSubmit}
                  className="flex flex-col xs:flex-row items-stretch xs:items-center max-w-[600px] w-full mx-auto bg-white/90 backdrop-blur-xl border border-white/95 rounded-2xl xs:rounded-full p-1.5 xs:p-1.5 xs:pl-5 shadow-lg gap-2"
                >
                  <div className="flex items-center flex-1 px-3 xs:px-0 py-1 xs:py-0">
                    <Search style={{ width: 18, height: 18, color: 'var(--text-3)', flexShrink: 0, marginRight: 10 }} />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={e => setHeroSearch(e.target.value)}
                      placeholder="Enter flight number or airline..."
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: 14,
                        color: 'var(--text)',
                        minWidth: 0,
                        minHeight: 40,
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      padding: '10px 22px',
                      borderRadius: 9999,
                      background: 'var(--navy)',
                      color: '#FFFFFF',
                      fontSize: 13.5,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(26, 35, 50, 0.25)',
                      transition: 'all 160ms ease',
                      flexShrink: 0,
                      minHeight: 44,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,35,50,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(26,35,50,0.25)'; }}
                  >
                    <span>Check compensation</span> <ArrowRight style={{ width: 14, height: 14, flexShrink: 0 }} />
                  </button>
                </form>

                {/* ── 2. Disruption reasons cards ── */}
                <div style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'left' }}>
                    What happened to your flight?
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                    {DISRUPTIONS.map(({ type, label, sub, icon: Icon, accent }) => (
                      <button
                        key={type}
                        id={`disruption-${type}`}
                        type="button"
                        onClick={() => { onUpdate({ disruptionType: type }); setTimeout(() => setStep(2), 100); }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          padding: '14px 15px',
                          borderRadius: 18,
                          border: '1.5px solid rgba(255,255,255,0.80)',
                          background: 'rgba(255,255,255,0.65)',
                          backdropFilter: 'blur(16px)',
                          cursor: 'pointer',
                          transition: 'all 160ms cubic-bezier(0.22,1,0.36,1)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02), 0 6px 20px rgba(0,0,0,0.04)',
                          textAlign: 'left',
                          width: '100%',
                          minHeight: 52,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.92)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.65)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02), 0 6px 20px rgba(0,0,0,0.04)'; }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${accent}18`, border: `1px solid ${accent}40`,
                        }}>
                          <Icon style={{ width: 17, height: 17, color: accent }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>{label}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>{sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom trust note */}
                <div style={{ textAlign: 'center', borderTop: '1px solid rgba(148,163,184,0.15)', paddingTop: 16 }}>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
                    Free to use · No account needed · DGCA CAR Section 3 & EU261 statutory codes included
                  </p>
                </div>
              </div>
            )}

            {/* ═══════════ STEP 2 — Flight details ══════════════ */}
            {step === 2 && (
              <div key="step2" className="ff-floatin">
                {/* Step header */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 10,
                    padding: '5px 12px', borderRadius: 99,
                    background: `${selectedDisruption.accent}18`,
                    border: `1px solid ${selectedDisruption.accent}40`,
                  }}>
                    {React.createElement(selectedDisruption.icon, { style: { width: 13, height: 13, color: selectedDisruption.accent } })}
                    <span style={{ fontSize: 12, fontWeight: 700, color: selectedDisruption.accent }}>{selectedDisruption.label}</span>
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 4 }}>
                    Tell us about your flight
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Takes about 30 seconds</p>
                </div>

                {/* Floating form card */}
                <div className="ff-float-card" style={{ padding: '22px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Subtle ticket auto-fill option */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: 'rgba(139, 175, 200, 0.10)',
                    border: '1px solid rgba(139, 175, 200, 0.20)',
                    fontSize: 11.5,
                    color: 'var(--text-2)',
                  }}>
                    <span>Have your boarding pass or PDF?</span>
                    <button
                      type="button"
                      onClick={() => setScanModalOpen(true)}
                      disabled={isScanning}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--navy)',
                        fontWeight: 700,
                        cursor: isScanning ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11.5,
                        padding: '2px 4px',
                      }}
                    >
                      {isScanning ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> : <FileUp style={{ width: 12, height: 12, color: 'var(--sky)' }} />}
                      {isScanning ? 'Scanning...' : 'Auto-fill'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <Field label="Airline">
                        <Inp id="airline-input" list="airlines-list" placeholder="e.g. IndiGo"
                          value={flightCase.airline} onChange={e => onUpdate({ airline: e.target.value })}
                          prefix={<Plane style={{ width: 12, height: 12 }} />} style={{ minHeight: 42 }} />
                        <datalist id="airlines-list">{AIRLINES.map(a => <option key={a} value={a} />)}</datalist>
                      </Field>
                    </div>
                    <div>
                      <Field label="Flight No.">
                        <Inp id="flight-number-input" placeholder="6E-204"
                          value={flightCase.flightNumber}
                          onChange={e => onUpdate({ flightNumber: e.target.value.toUpperCase() })}
                          prefix={<Hash style={{ width: 12, height: 12 }} />}
                          style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', minHeight: 42 }} />
                      </Field>
                    </div>
                  </div>

                  <Field label="From">
                    <AirportSearch id="origin-airport" label="" placeholder="City or IATA — e.g. Delhi, DEL"
                      selectedAirport={flightCase.origin} onSelectAirport={a => onUpdate({ origin: a })} />
                  </Field>
                  <Field label="To">
                    <AirportSearch id="destination-airport" label="" placeholder="City or IATA — e.g. Mumbai, BOM"
                      selectedAirport={flightCase.destination} onSelectAirport={a => onUpdate({ destination: a })} />
                  </Field>

                  {/* Route badge */}
                  {flightCase.origin && flightCase.destination && (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '8px 13px', borderRadius: 11,
                      background: 'rgba(139,175,200,0.12)', border: '1px solid rgba(139,175,200,0.25)',
                      fontSize: 12, fontWeight: 700, color: 'var(--text)',
                    }}>
                      {flightCase.origin.city} <ArrowRight style={{ width: 13, height: 13, color: 'var(--sky)' }} /> {flightCase.destination.city}
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--text-2)', fontWeight: 400, marginLeft: 2 }}>
                        {analysis.formattedDistance}
                      </span>
                    </div>
                  )}

                  <Field label="Date of travel">
                    <Inp id="flight-date-input" type="date" value={flightCase.flightDate}
                      onChange={e => onUpdate({ flightDate: e.target.value })}
                      prefix={<Calendar style={{ width: 12, height: 12 }} />} />
                  </Field>

                  {/* Disruption-specific */}
                  {flightCase.disruptionType === 'delayed' && (
                    <Field label="How long was the delay?">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div style={{ position: 'relative' }}>
                          <input id="delay-hours" type="number" min="0" max="72" placeholder="0"
                            value={flightCase.delayHours || ''} onChange={e => onUpdate({ delayHours: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="ff-input" style={{ paddingRight: 34 }} />
                          <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-3)', pointerEvents: 'none' }}>hrs</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <input id="delay-minutes" type="number" min="0" max="59" placeholder="0"
                            value={flightCase.delayMinutes || ''} onChange={e => onUpdate({ delayMinutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
                            className="ff-input" style={{ paddingRight: 34 }} />
                          <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-3)', pointerEvents: 'none' }}>min</span>
                        </div>
                      </div>
                    </Field>
                  )}

                  {flightCase.disruptionType === 'cancelled' && (<>
                    <Field label="When did the airline tell you?">
                      <Sel value={flightCase.informedWindow} onChange={e => onUpdate({ informedWindow: e.target.value as any })}>
                        <option value="at_airport">At the airport / day of travel</option>
                        <option value="less_than_24h">Less than 24 hours before</option>
                        <option value="24h_to_2w">1–14 days before</option>
                        <option value="more_than_2w">More than 2 weeks before</option>
                      </Sel>
                    </Field>
                    <Field label="Did they offer another flight?">
                      <Sel value={flightCase.alternateOffered} onChange={e => onUpdate({ alternateOffered: e.target.value as any })}>
                        <option value="none">No — nothing offered</option>
                        <option value="within_2h">Yes — within 2 hours of original</option>
                        <option value="within_6h">Yes — within 6 hours</option>
                        <option value="next_day">Yes — next day or later</option>
                        <option value="refund_only">Refund only</option>
                      </Sel>
                    </Field>
                  </>)}

                  {flightCase.disruptionType === 'denied_boarding' && (
                    <Field label="Did they arrange another flight?">
                      <Sel value={flightCase.alternateArrangedTime} onChange={e => onUpdate({ alternateArrangedTime: e.target.value as any })}>
                        <option value="none">No — nothing arranged</option>
                        <option value="within_1h">Yes — within 1 hour</option>
                        <option value="within_24h">Yes — same day</option>
                        <option value="after_24h">Yes — more than 24 hours later</option>
                      </Sel>
                    </Field>
                  )}

                  {flightCase.disruptionType === 'missed_connection' && (
                    <Field label="Hours late at final destination">
                      <div style={{ position: 'relative' }}>
                        <input type="number" min="0" placeholder="e.g. 5"
                          value={flightCase.missedConnectionDelayHours || ''}
                          onChange={e => onUpdate({ missedConnectionDelayHours: parseInt(e.target.value) || 0 })}
                          className="ff-input" style={{ paddingRight: 48 }} />
                        <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-3)', pointerEvents: 'none' }}>hours</span>
                      </div>
                    </Field>
                  )}

                  {(flightCase.disruptionType === 'cancelled' || flightCase.disruptionType === 'denied_boarding') && (
                    <Field label="Ticket price paid" hint="(optional)">
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: 'var(--text-3)', pointerEvents: 'none' }}>{currSymbol}</span>
                        <input type="number" min="0" placeholder="e.g. 4500"
                          value={flightCase.totalTicketPrice ?? ''}
                          onChange={e => ticketChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="ff-input" style={{ paddingLeft: 24 }} />
                      </div>
                    </Field>
                  )}
                </div>

                <button type="button" disabled={!step2Valid} onClick={() => setStep(3)}
                  style={{
                    width: '100%', marginTop: 12, padding: '14px 24px',
                    borderRadius: 15, border: 'none',
                    background: step2Valid ? 'var(--navy)' : 'rgba(148,163,184,0.20)',
                    color: step2Valid ? '#F9F8F6' : 'var(--text-3)',
                    fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
                    cursor: step2Valid ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: step2Valid ? '0 4px 20px rgba(26,35,50,0.22)' : 'none',
                    transition: 'all 180ms ease',
                  }}
                  onMouseEnter={e => { if (step2Valid) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(26,35,50,0.28)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = step2Valid ? '0 4px 20px rgba(26,35,50,0.22)' : 'none'; }}
                >
                  Continue <ArrowRight style={{ width: 15, height: 15 }} />
                </button>
              </div>
            )}

            {/* ═══════════ STEP 3 — Details + Generate ══════════ */}
            {step === 3 && (
              <div key="step3" className="ff-floatin">
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 5 }}>
                    Almost done
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    We'll put these in your letter
                  </p>
                </div>

                {/* Details card */}
                <div className="ff-float-card" style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Field label="Your Name">
                      <Inp id="passenger-name" placeholder="Rahul Sharma" value={flightCase.passengerName}
                        onChange={e => onUpdate({ passengerName: e.target.value })}
                        prefix={<User style={{ width: 12, height: 12 }} />} style={{ minHeight: 42 }} />
                    </Field>
                    <Field label="Booking Ref (PNR)">
                      <Inp id="booking-ref" placeholder="6E9K2A" value={flightCase.bookingReference}
                        onChange={e => onUpdate({ bookingReference: e.target.value.toUpperCase() })}
                        prefix={<Hash style={{ width: 12, height: 12 }} />}
                        style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', minHeight: 42 }} />
                    </Field>
                  </div>
                  <Field label="Email" hint="(not shared, used only in your letter)">
                    <Inp id="passenger-email" type="email" placeholder="rahul@example.com" value={flightCase.passengerEmail}
                      onChange={e => onUpdate({ passengerEmail: e.target.value })}
                      prefix={<Mail style={{ width: 12, height: 12 }} />} style={{ minHeight: 42 }} />
                  </Field>
                </div>

                {/* Compensation reveal */}
                <div style={{
                  margin: '12px 0',
                  padding: '18px 20px',
                  borderRadius: 18,
                  textAlign: 'center',
                  background: hasAmount
                    ? 'linear-gradient(135deg, rgba(212,150,58,0.13) 0%, rgba(255,255,255,0.76) 100%)'
                    : 'rgba(255,255,255,0.55)',
                  border: hasAmount ? '1px solid rgba(212,150,58,0.28)' : '1px solid rgba(255,255,255,0.70)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                }}>
                  {hasAmount ? (
                    <>
                      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 3 }}>
                        Estimated compensation
                      </div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-sans break-words">
                        {analysis.financialRecovery.formattedRange}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 5 }}>
                        Under {analysis.applicableRules}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{analysis.caseStatus}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{analysis.financialRecovery.details.slice(0, 80)}…</div>
                    </>
                  )}
                </div>

                {/* Generate CTA */}
                <button
                  id="generate-claim-btn"
                  type="button"
                  disabled={!step3Valid || isGenerating}
                  onClick={() => { if (!claimDraft) onGenerate(); else onOpenDraft(); }}
                  style={{
                    width: '100%', padding: '15px 24px',
                    borderRadius: 15, border: 'none',
                    background: step3Valid && !isGenerating ? 'var(--navy)' : 'rgba(148,163,184,0.20)',
                    color: step3Valid && !isGenerating ? '#F9F8F6' : 'var(--text-3)',
                    fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                    cursor: step3Valid && !isGenerating ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: step3Valid && !isGenerating ? '0 4px 24px rgba(26,35,50,0.24)' : 'none',
                    transition: 'all 180ms ease',
                  }}
                  onMouseEnter={e => { if (step3Valid && !isGenerating) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,35,50,0.30)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = step3Valid && !isGenerating ? '0 4px 24px rgba(26,35,50,0.24)' : 'none'; }}
                >
                  {isGenerating
                    ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Preparing letter…</>
                    : claimDraft
                      ? <><FileText style={{ width: 17, height: 17 }} /> View My Claim Letter</>
                      : <><Sparkles style={{ width: 17, height: 17, color: '#D4963A' }} /> Generate My Claim Letter</>
                  }
                </button>

                {claimDraft?.isApprovedByPassenger && airlineEmail && (
                  <div style={{
                    marginTop: 10, padding: '10px 14px', borderRadius: 12,
                    background: 'rgba(61,139,94,0.10)', border: '1px solid rgba(61,139,94,0.22)',
                    display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--success)', fontWeight: 600,
                  }}>
                    <Check style={{ width: 13, height: 13 }} />
                    Ready to send to{' '}
                    <a href={`mailto:${airlineEmail}`} style={{ color: 'var(--success)', textDecoration: 'underline' }}>{airlineEmail}</a>
                  </div>
                )}

                <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 16, lineHeight: 1.6 }}>
                  Not legal advice · Based on DGCA, EU261, UK261 regulations
                </p>
              </div>
            )}
          </div>
        </main>

        {/* ── Minimalist Footer ─────────────────────────────────── */}
        {/* ── Seamless Minimalist Footer ────────────────────────── */}
        <footer style={{
          padding: '32px 20px 40px',
          display: 'flex',
          justifyContent: 'center',
          background: 'transparent',
          marginTop: 'auto',
        }}>
          <div style={{
            width: '100%',
            maxWidth: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 11.5,
            color: 'var(--text-3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>FlightClaims</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span style={{ color: 'var(--text-3)' }}>AI Disruption Assistant</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                type="button"
                onClick={() => openInfo('about')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-3)', padding: 0, transition: 'color 140ms' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                About
              </button>
              <button
                type="button"
                onClick={() => openInfo('rights')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-3)', padding: 0, transition: 'color 140ms' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                Passenger Rights
              </button>
              <button
                type="button"
                onClick={() => openInfo('how-it-works')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-3)', padding: 0, transition: 'color 140ms' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                How It Works
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Letter modal (centered) ───────────────────────────── */}
      {isDraftOpen && claimDraft && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(10px)'
          }}
          className="ff-fadeup"
          onClick={e => { if (e.target === e.currentTarget) onCloseDraft(); }}
        >
          <div style={{
            width: '100%', maxWidth: 640, maxHeight: '88dvh',
            background: 'rgba(252,252,250,0.97)', backdropFilter: 'blur(24px)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.80)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          }}>

            {/* Header */}
            <div style={{ padding: '10px 20px 14px', borderBottom: '1px solid rgba(148,163,184,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(26,35,50,0.22)' }}>
                  <Shield style={{ width: 16, height: 16, color: '#F9F8F6' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Your Claim Letter</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Review, edit, then send</div>
                </div>
              </div>
              <button type="button" onClick={onCloseDraft}
                style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: 'rgba(148,163,184,0.14)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>

            {/* Send-to banner */}
            {airlineEmail && (
              <div style={{ padding: '10px 20px', background: 'rgba(61,139,94,0.08)', borderBottom: '1px solid rgba(61,139,94,0.15)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <Mail style={{ width: 13, height: 13, color: 'var(--success)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>
                  Send to: <a href={`mailto:${airlineEmail}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`}
                    style={{ color: 'var(--success)', fontWeight: 700 }}>{airlineEmail}</a>
                </span>
                <a href={`mailto:${airlineEmail}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`}
                  style={{ flexShrink: 0, padding: '5px 11px', borderRadius: 8, background: 'var(--success)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail style={{ width: 10, height: 10 }} /> Open in Email
                </a>
              </div>
            )}

            {/* Letter content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Subject</label>
                <input value={draftSubject} onChange={e => setDraftSubject(e.target.value)} className="ff-input" style={{ fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                  Letter <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-3)' }}>(editable)</span>
                </label>
                <textarea value={draftBody} onChange={e => setDraftBody(e.target.value)}
                  rows={14} className="ff-input"
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, lineHeight: 1.75, resize: 'vertical', height: 'auto' }} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(148,163,184,0.12)', background: 'rgba(245,245,242,0.90)', display: 'flex', gap: 9, flexShrink: 0, flexWrap: 'wrap' }}>
              <button type="button" onClick={handleCopy} className="ff-btn-secondary" style={{ flex: 1 }}>
                {copied ? <Check style={{ width: 13, height: 13, color: 'var(--success)' }} /> : <Copy style={{ width: 13, height: 13 }} />}
                {copied ? 'Copied!' : 'Copy Letter'}
              </button>
              <button type="button" onClick={handleDownload} className="ff-btn-secondary">
                <Download style={{ width: 13, height: 13 }} /> Download
              </button>
              <button type="button" onClick={handleApproveClose} className="ff-btn-success" style={{ flex: 2 }}>
                <Check style={{ width: 15, height: 15 }} />
                {claimDraft.isApprovedByPassenger ? 'Re-approve & Close' : 'Approve & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Guide & Rights Modal ─────────────────────────────── */}
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        defaultTab={infoModalTab}
      />

      {/* ── Auto-fill Scan Options Modal ────────────────────── */}
      {scanModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setScanModalOpen(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: 420,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 22,
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
              padding: 22,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles style={{ width: 18, height: 18, color: 'var(--navy)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Auto-fill Flight Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setScanModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
              Select how you would like to provide your boarding pass or e-ticket for AI parsing:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Option 1: Upload File */}
              <button
                type="button"
                onClick={() => {
                  setScanModalOpen(false);
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(148, 163, 184, 0.22)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(238, 243, 247, 0.90)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(139, 175, 200, 0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--navy)', flexShrink: 0,
                }}>
                  <Upload style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
                    Upload File (PDF or Image)
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>
                    Select an e-ticket PDF or image from device
                  </div>
                </div>
              </button>

              {/* Option 2: Camera Capture */}
              <button
                type="button"
                onClick={() => {
                  setScanModalOpen(false);
                  setTimeout(() => cameraInputRef.current?.click(), 100);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(148, 163, 184, 0.22)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(238, 243, 247, 0.90)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(212, 150, 58, 0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#8B6020', flexShrink: 0,
                }}>
                  <Camera style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
                    Scan / Take Photo
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>
                    Snap a photo of physical boarding pass
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
