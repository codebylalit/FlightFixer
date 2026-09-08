import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { FlightCase, AnalysisResult, ClaimDraft } from './types';
import { getAirportByIata } from './services/airportService';
import { analyzeFlightDisruption } from './services/analysisService';
import { webMcpBridge } from './services/webMcpBridge';
import { ClaimScreen } from './components/ClaimScreen';

const DEFAULT_CASE: FlightCase = {
  airline: '',
  flightNumber: '',
  origin: null,
  destination: null,
  flightDate: new Date().toISOString().split('T')[0],
  disruptionType: 'delayed',
  delayHours: 0,
  delayMinutes: 0,
  airlineReason: '',
  informedWindow: 'at_airport',
  alternateOffered: 'none',
  totalTicketPrice: undefined,
  basicFare: undefined,
  fuelCharge: undefined,
  scheduledBlockTimeHours: undefined,
  alternateArrangedTime: 'none',
  passengerDeclinedAlternate: false,
  missedConnectionDelayHours: 0,
  singleTicketBooking: true,
  passengerName: '',
  passengerEmail: '',
  passengerPhone: '',
  bookingReference: '',
};

export function App() {
  const [flightCase, setFlightCase] = useState<FlightCase>(DEFAULT_CASE);
  const [analysis, setAnalysis] = useState<AnalysisResult>(() => analyzeFlightDisruption(DEFAULT_CASE));
  const [claimDraft, setClaimDraft] = useState<ClaimDraft | null>(null);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setAnalysis(analyzeFlightDisruption(flightCase));
  }, [flightCase]);

  useEffect(() => {
    webMcpBridge.setContext({
      flightCase,
      analysisResult: analysis,
      claimDraft,
      demoClaimForm: { passengerName: '', passengerEmail: '', bookingReference: '', flightNumber: '', airline: '', route: '', disruption: '', requestType: '', claimAmount: '', message: '', isPopulated: false, submittedSimulated: false },
      setFlightCase,
      setClaimDraft,
      setDemoClaimForm: () => {},
      addActivityLog: () => {},
    });
  }, [flightCase, analysis, claimDraft]);

  const handleUpdate = useCallback((updated: Partial<FlightCase>) => {
    if (updated.totalTicketPrice !== undefined && !('basicFare' in updated)) {
      const t = updated.totalTicketPrice;
      updated = { ...updated, basicFare: t ? Math.round(t * 0.75) : undefined, fuelCharge: t ? Math.round(t * 0.25) : undefined };
    }
    setFlightCase(prev => ({ ...prev, ...updated }));
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await webMcpBridge.executeTool('prepare_passenger_request', {
        passenger_name: flightCase.passengerName,
        booking_reference: flightCase.bookingReference,
      });
    } finally {
      setIsGenerating(false);
      setIsDraftOpen(true);
    }
  };

  const handleApprove = (updated: ClaimDraft) => {
    setClaimDraft(updated);
  };

  return (
    <>
      <ClaimScreen
        flightCase={flightCase}
        analysis={analysis}
        claimDraft={claimDraft}
        isDraftOpen={isDraftOpen}
        isGenerating={isGenerating}
        onUpdate={handleUpdate}
        onGenerate={handleGenerate}
        onApprove={handleApprove}
        onOpenDraft={() => setIsDraftOpen(true)}
        onCloseDraft={() => setIsDraftOpen(false)}
      />
      <Analytics />
    </>
  );
}

export default App;
