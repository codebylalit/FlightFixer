export interface Airport {
  iata: string;
  icao?: string;
  name: string;
  city: string;
  country: string;
  countryCode: string; // 'IN', 'GB', 'DE', 'FR', 'US', 'AE', 'SG', etc.
  lat: number;
  lon: number;
  timezone?: string;
}

export type DisruptionType = 'delayed' | 'cancelled' | 'denied_boarding' | 'missed_connection';

export type InformedWindow = 'less_than_24h' | '24h_to_2w' | 'more_than_2w' | 'at_airport';
export type AlternateOffered = 'none' | 'within_2h' | 'within_6h' | 'next_day' | 'refund_only';
export type AlternateArrangedTime = 'none' | 'within_1h' | 'within_24h' | 'after_24h';

export interface FlightCase {
  airline: string;
  flightNumber: string;
  origin: Airport | null;
  destination: Airport | null;
  flightDate: string;
  disruptionType: DisruptionType;
  
  // Delay fields
  delayHours: number;
  delayMinutes: number;
  airlineReason: string;
  
  // Cancellation fields
  informedWindow: InformedWindow;
  alternateOffered: AlternateOffered;
  scheduledBlockTimeHours?: number;
  basicFare?: number;
  fuelCharge?: number;
  
  // Denied Boarding fields
  alternateArrangedTime: AlternateArrangedTime;
  passengerDeclinedAlternate: boolean;
  
  // Missed Connection fields
  missedConnectionDelayHours: number;
  singleTicketBooking: boolean;
  
  // Passenger contact details for drafting
  passengerName: string;
  passengerEmail: string;
  passengerPhone?: string;
  bookingReference: string;
}

export type Jurisdiction = 'domestic_india' | 'international_india' | 'eu261' | 'uk261' | 'general';

export type CaseStatus = 
  | 'Action Recommended'
  | 'Further Review Recommended'
  | 'Compensation Likely Eligible'
  | 'Information Needed'
  | 'Immediate Assistance Due'
  | 'Assistance Available';

export type FinancialRecoveryStatus = 
  | 'Potential Compensation'
  | 'Estimated Maximum'
  | 'Not Yet Confirmed'
  | 'No Estimate Available'
  | 'Refund & Care Eligible';

export interface FinancialRecovery {
  status: FinancialRecoveryStatus;
  amountMin?: number;
  amountMax?: number;
  currency: 'INR' | 'EUR' | 'GBP' | 'USD';
  formattedRange?: string;
  details: string;
}

export interface AnalysisResult {
  caseStatus: CaseStatus;
  caseStatusColor: 'emerald' | 'amber' | 'blue' | 'indigo' | 'rose' | 'slate';
  jurisdiction: Jurisdiction;
  jurisdictionLabel: string;
  jurisdictionBadge: string;
  distanceKm: number | null;
  formattedDistance: string;
  whatWeFound: string[];
  passengerGuidance: string[];
  missingInformation: string[];
  financialRecovery: FinancialRecovery;
  whyThisResult: string;
  recommendedNextSteps: string[];
  applicableRules: string;
  hasEnoughDataForEstimate: boolean;
  legalDisclaimer: string;
}

export interface ClaimDraft {
  id: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  bookingReference: string;
  airline: string;
  flightNumber: string;
  route: string;
  requestType: string;
  subject: string;
  letterBody: string;
  createdAt: string;
  isApprovedByPassenger: boolean;
  approvedAt?: string;
}

export interface DemoClaimFormState {
  passengerName: string;
  passengerEmail: string;
  bookingReference: string;
  flightNumber: string;
  airline: string;
  route: string;
  disruption: string;
  requestType: string;
  claimAmount: string;
  message: string;
  isPopulated: boolean;
  submittedSimulated: boolean;
}

export interface AIActivityLog {
  id: string;
  timestamp: string;
  type: 'event' | 'tool_call' | 'tool_result' | 'approval' | 'system' | 'agent_thought';
  toolName?: string;
  status: 'running' | 'completed' | 'failed' | 'pending_approval';
  description: string;
  payload?: any;
}

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}
