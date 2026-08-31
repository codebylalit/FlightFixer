import { FlightCase, AnalysisResult, ClaimDraft, DemoClaimFormState, AIActivityLog, WebMCPToolDefinition } from '../types';
import { getAirportByIata } from './airportService';
import { analyzeFlightDisruption } from './analysisService';

export interface WebMCPContextState {
  flightCase: FlightCase;
  analysisResult: AnalysisResult | null;
  claimDraft: ClaimDraft | null;
  demoClaimForm: DemoClaimFormState;
  setFlightCase: (updater: FlightCase | ((prev: FlightCase) => FlightCase)) => void;
  setClaimDraft: (updater: ClaimDraft | null | ((prev: ClaimDraft | null) => ClaimDraft | null)) => void;
  setDemoClaimForm: (updater: DemoClaimFormState | ((prev: DemoClaimFormState) => DemoClaimFormState)) => void;
  addActivityLog: (log: Omit<AIActivityLog, 'id' | 'timestamp'>) => void;
}

export const WEBMCP_TOOLS_DEFINITIONS: WebMCPToolDefinition[] = [
  {
    name: 'analyze_flight_case',
    description: 'Update the live flight disruption case, recalculate route distance, and run statutory aviation rights analysis.',
    parameters: {
      type: 'object',
      properties: {
        airline: { type: 'string', description: 'Airline operating the flight (e.g. IndiGo, Air India, Lufthansa)' },
        flight_number: { type: 'string', description: 'Flight number (e.g. 6E-204, AI-101, LH-756)' },
        origin_iata: { type: 'string', description: '3-letter IATA code for departure airport (e.g. BOM, DEL, BLR, LHR)' },
        destination_iata: { type: 'string', description: '3-letter IATA code for arrival airport (e.g. AMD, BLR, CDG, JFK)' },
        flight_date: { type: 'string', description: 'Date of travel in YYYY-MM-DD format' },
        disruption_type: { 
          type: 'string', 
          enum: ['delayed', 'cancelled', 'denied_boarding', 'missed_connection'],
          description: 'Category of flight disruption'
        },
        delay_hours: { type: 'number', description: 'Duration of delay in hours' },
        delay_minutes: { type: 'number', description: 'Duration of delay in minutes' },
        airline_reason: { type: 'string', description: 'Airline stated reason (e.g. Technical snag, Weather, Crew issue)' },
        informed_window: { 
          type: 'string', 
          enum: ['less_than_24h', '24h_to_2w', 'more_than_2w', 'at_airport'],
          description: 'When the passenger was informed of the cancellation'
        },
        alternate_offered: { 
          type: 'string', 
          enum: ['none', 'within_2h', 'within_6h', 'next_day', 'refund_only'],
          description: 'Replacement flight timing offered by airline'
        },
        basic_fare: { type: 'number', description: 'Booked Basic Fare from ticket receipt' },
        fuel_charge: { type: 'number', description: 'Booked Airline Fuel Charge (YQ/YR)' },
        scheduled_block_time_hours: { type: 'number', description: 'Scheduled flight duration in hours' },
        passenger_name: { type: 'string', description: 'Passenger full name' },
        booking_reference: { type: 'string', description: 'PNR / Booking confirmation reference' }
      },
      required: ['disruption_type']
    }
  },
  {
    name: 'get_case_summary',
    description: 'Retrieve the real-time state, route calculation, jurisdiction analysis, and claim approval status from the live application.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'prepare_passenger_request',
    description: 'Draft a formal airline claim / compensation notice tailored to the live case and aviation regulations.',
    parameters: {
      type: 'object',
      properties: {
        passenger_name: { type: 'string', description: 'Passenger full name' },
        passenger_email: { type: 'string', description: 'Passenger email address' },
        passenger_phone: { type: 'string', description: 'Passenger phone number' },
        booking_reference: { type: 'string', description: 'Airline PNR booking reference' },
        custom_notes: { type: 'string', description: 'Additional specific passenger statements or out-of-pocket expenses' }
      }
    }
  },
  {
    name: 'approve_and_fill_demo_form',
    description: 'Populate the airline demo claim submission form with approved case data. STRICT REQUIREMENT: Fails if the human passenger has not clicked Approve Draft.',
    parameters: {
      type: 'object',
      properties: {
        override_confirmation: { type: 'boolean', description: 'Set to true only if passenger gave explicit confirmation' }
      }
    }
  }
];

class WebMCPBridgeManager {
  private ctx: WebMCPContextState | null = null;
  private isRegisteredInBrowser = false;

  public setContext(ctx: WebMCPContextState) {
    this.ctx = ctx;
    this.registerGlobalBrowserBridge();
  }

  /**
   * Registers WebMCP tools with navigator.modelContext if available in browser,
   * and exposes the standard window.__WEBMCP__ interface for live agent execution.
   */
  private registerGlobalBrowserBridge() {
    if (typeof window === 'undefined') return;

    // Feature detect native navigator.modelContext (Chrome 146+ WebMCP standard) safely
    try {
      const nav = window.navigator as any;
      if (nav && typeof nav === 'object' && 'modelContext' in nav) {
        const mc = nav.modelContext;
        if (mc && typeof mc.registerTool === 'function') {
          WEBMCP_TOOLS_DEFINITIONS.forEach(def => {
            mc.registerTool({
              name: def.name,
              description: def.description,
              inputSchema: def.parameters,
              execute: async (args: any) => this.executeTool(def.name, args)
            });
          });
          this.isRegisteredInBrowser = true;
        }
      }
    } catch (err) {
      // Gracefully handled: If native navigator.modelContext is disallowed by iframe permissions policy,
      // the application operates seamlessly via the in-window WebMCP dispatcher.
      this.isRegisteredInBrowser = false;
    }

    // Standard WebMCP Window Dispatcher for AI agents, tests, and copilot
    try {
      (window as any).__WEBMCP__ = {
        version: '1.0.0-draft',
        registeredTools: WEBMCP_TOOLS_DEFINITIONS.map(t => t.name),
        getToolDefinitions: () => WEBMCP_TOOLS_DEFINITIONS,
        invokeTool: (toolName: string, args: any = {}) => this.executeTool(toolName, args),
        getLiveState: () => this.executeTool('get_case_summary', {})
      };
    } catch {
      // Ignored if window assignment is restricted
    }
  }

  public getWebMCPStatus() {
    let hasNative = false;
    if (typeof window !== 'undefined' && window.navigator) {
      try {
        const nav = window.navigator as any;
        if (nav && typeof nav === 'object' && 'modelContext' in nav) {
          const mc = nav.modelContext;
          hasNative = !!(mc && typeof mc.registerTool === 'function');
        }
      } catch {
        // Permissions policy prevents accessing navigator.modelContext in iframe
        hasNative = false;
      }
    }
    return {
      isAvailable: true,
      hasNativeModelContext: hasNative,
      mode: hasNative ? ('native' as const) : ('bridge' as const),
      registeredTools: WEBMCP_TOOLS_DEFINITIONS.map(t => t.name)
    };
  }

  /**
   * Executes a WebMCP tool against the REAL application state.
   */
  public async executeTool(toolName: string, rawArgs: any = {}): Promise<any> {
    if (!this.ctx) {
      return {
        success: false,
        error: 'CONTEXT_NOT_MOUNTED',
        message: 'FlightFixer application context is initializing.'
      };
    }

    const { 
      flightCase, 
      analysisResult, 
      claimDraft, 
      demoClaimForm,
      setFlightCase, 
      setClaimDraft, 
      setDemoClaimForm, 
      addActivityLog 
    } = this.ctx;

    // 1. TOOL: analyze_flight_case
    if (toolName === 'analyze_flight_case') {
      addActivityLog({
        type: 'tool_call',
        toolName: 'analyze_flight_case',
        status: 'running',
        description: `Executing WebMCP tool analyze_flight_case() with structured input`,
        payload: rawArgs
      });

      // Normalize snake_case or camelCase arguments
      const airline = rawArgs.airline || rawArgs.operating_airline || flightCase.airline || 'IndiGo';
      const flightNumber = rawArgs.flight_number || rawArgs.flightNumber || flightCase.flightNumber || '6E-204';
      const originIata = (rawArgs.origin_iata || rawArgs.origin || (flightCase.origin ? flightCase.origin.iata : 'BOM')).toUpperCase();
      const destIata = (rawArgs.destination_iata || rawArgs.destination || (flightCase.destination ? flightCase.destination.iata : 'AMD')).toUpperCase();
      const flightDate = rawArgs.flight_date || rawArgs.date || flightCase.flightDate;
      const disruptionType = rawArgs.disruption_type || rawArgs.disruptionType || flightCase.disruptionType || 'delayed';
      
      const delayHours = rawArgs.delay_hours !== undefined ? Number(rawArgs.delay_hours) : (rawArgs.delayHours !== undefined ? Number(rawArgs.delayHours) : flightCase.delayHours);
      const delayMinutes = rawArgs.delay_minutes !== undefined ? Number(rawArgs.delay_minutes) : (rawArgs.delayMinutes !== undefined ? Number(rawArgs.delayMinutes) : flightCase.delayMinutes);
      const airlineReason = rawArgs.airline_reason || rawArgs.airlineReason || flightCase.airlineReason;
      
      const informedWindow = rawArgs.informed_window || rawArgs.informedWindow || flightCase.informedWindow;
      const alternateOffered = rawArgs.alternate_offered || rawArgs.alternateOffered || flightCase.alternateOffered;
      const basicFare = rawArgs.basic_fare !== undefined ? Number(rawArgs.basic_fare) : flightCase.basicFare;
      const fuelCharge = rawArgs.fuel_charge !== undefined ? Number(rawArgs.fuel_charge) : flightCase.fuelCharge;
      const scheduledBlockTimeHours = rawArgs.scheduled_block_time_hours !== undefined ? Number(rawArgs.scheduled_block_time_hours) : flightCase.scheduledBlockTimeHours;

      const passengerName = rawArgs.passenger_name || rawArgs.passengerName || flightCase.passengerName;
      const bookingReference = rawArgs.booking_reference || rawArgs.bookingReference || flightCase.bookingReference;

      const originAirport = getAirportByIata(originIata) || flightCase.origin;
      const destAirport = getAirportByIata(destIata) || flightCase.destination;

      const updatedCase: FlightCase = {
        ...flightCase,
        airline,
        flightNumber,
        origin: originAirport,
        destination: destAirport,
        flightDate,
        disruptionType,
        delayHours,
        delayMinutes,
        airlineReason,
        informedWindow,
        alternateOffered,
        basicFare,
        fuelCharge,
        scheduledBlockTimeHours,
        passengerName,
        bookingReference
      };

      // Mutate REAL React state
      setFlightCase(updatedCase);

      // Run REAL analysis
      const newAnalysis = analyzeFlightDisruption(updatedCase);

      addActivityLog({
        type: 'tool_result',
        toolName: 'analyze_flight_case',
        status: 'completed',
        description: `Case updated: ${updatedCase.airline} ${updatedCase.flightNumber} (${originIata} → ${destIata}). Status: ${newAnalysis.caseStatus}`,
        payload: {
          caseStatus: newAnalysis.caseStatus,
          jurisdiction: newAnalysis.jurisdictionLabel,
          distance: newAnalysis.formattedDistance,
          financialRecovery: newAnalysis.financialRecovery
        }
      });

      return {
        success: true,
        caseSummary: {
          airline: updatedCase.airline,
          flightNumber: updatedCase.flightNumber,
          route: `${originAirport?.city || originIata} → ${destAirport?.city || destIata}`,
          distance: newAnalysis.formattedDistance,
          disruption: updatedCase.disruptionType,
          jurisdiction: newAnalysis.jurisdictionLabel,
          caseStatus: newAnalysis.caseStatus,
          financialRecovery: newAnalysis.financialRecovery,
          whatWeFound: newAnalysis.whatWeFound,
          recommendedNextSteps: newAnalysis.recommendedNextSteps
        }
      };
    }

    // 2. TOOL: get_case_summary
    if (toolName === 'get_case_summary') {
      addActivityLog({
        type: 'tool_call',
        toolName: 'get_case_summary',
        status: 'running',
        description: 'Executing WebMCP tool get_case_summary() to read real application state'
      });

      const currentAnalysis = analysisResult || analyzeFlightDisruption(flightCase);
      const originStr = flightCase.origin ? `${flightCase.origin.city} (${flightCase.origin.iata})` : 'Not Selected';
      const destStr = flightCase.destination ? `${flightCase.destination.city} (${flightCase.destination.iata})` : 'Not Selected';

      const summary = {
        airline: flightCase.airline,
        flightNumber: flightCase.flightNumber,
        origin: originStr,
        destination: destStr,
        date: flightCase.flightDate,
        disruptionType: flightCase.disruptionType,
        delayHours: flightCase.delayHours,
        delayMinutes: flightCase.delayMinutes,
        airlineReason: flightCase.airlineReason || 'Not stated',
        cancellationInformedWindow: flightCase.informedWindow,
        distance: currentAnalysis.formattedDistance,
        jurisdiction: currentAnalysis.jurisdictionLabel,
        caseStatus: currentAnalysis.caseStatus,
        financialRecovery: currentAnalysis.financialRecovery,
        missingInformation: currentAnalysis.missingInformation,
        hasClaimDraft: !!claimDraft,
        isDraftApprovedByPassenger: claimDraft ? claimDraft.isApprovedByPassenger : false,
        demoFormPopulated: demoClaimForm.isPopulated
      };

      addActivityLog({
        type: 'tool_result',
        toolName: 'get_case_summary',
        status: 'completed',
        description: `Returned real-time case state (${flightCase.airline} ${flightCase.flightNumber})`,
        payload: summary
      });

      return {
        success: true,
        summary
      };
    }

    // 3. TOOL: prepare_passenger_request
    if (toolName === 'prepare_passenger_request') {
      addActivityLog({
        type: 'tool_call',
        toolName: 'prepare_passenger_request',
        status: 'running',
        description: 'Executing WebMCP tool prepare_passenger_request() to create formal airline notice',
        payload: rawArgs
      });

      const passengerName = rawArgs.passenger_name || rawArgs.passengerName || flightCase.passengerName || 'Passenger';
      const passengerEmail = rawArgs.passenger_email || rawArgs.passengerEmail || flightCase.passengerEmail || 'passenger@example.com';
      const passengerPhone = rawArgs.passenger_phone || rawArgs.passengerPhone || flightCase.passengerPhone || '+91 98765 43210';
      const pnr = rawArgs.booking_reference || rawArgs.bookingReference || flightCase.bookingReference || 'XYZ987';
      const customNotes = rawArgs.custom_notes || '';

      const currentAnalysis = analysisResult || analyzeFlightDisruption(flightCase);
      const originDesc = flightCase.origin ? `${flightCase.origin.city} (${flightCase.origin.iata})` : 'Origin';
      const destDesc = flightCase.destination ? `${flightCase.destination.city} (${flightCase.destination.iata})` : 'Destination';

      let disruptionSummary = '';
      if (flightCase.disruptionType === 'delayed') {
        disruptionSummary = `suffered a delay of ${flightCase.delayHours} hours and ${flightCase.delayMinutes} minutes (Stated reason: ${flightCase.airlineReason || 'Operational delay'})`;
      } else if (flightCase.disruptionType === 'cancelled') {
        disruptionSummary = `was cancelled on short notice (${formatInformedWindowStr(flightCase.informedWindow)})`;
      } else if (flightCase.disruptionType === 'denied_boarding') {
        disruptionSummary = `resulted in involuntary denied boarding due to airline overbooking`;
      } else {
        disruptionSummary = `resulted in a missed connection with total arrival delay of ${flightCase.missedConnectionDelayHours} hours`;
      }

      let legalBasis = '';
      let reliefSought = '';
      if (currentAnalysis.jurisdiction === 'domestic_india') {
        legalBasis = 'Directorate General of Civil Aviation (DGCA) Civil Aviation Requirements (CAR), Section 3, Series M, Part IV';
        if (currentAnalysis.financialRecovery.status === 'Potential Compensation' && currentAnalysis.financialRecovery.formattedRange) {
          reliefSought = `1. Statutory DGCA compensation of ${currentAnalysis.financialRecovery.formattedRange} as mandated under CAR Part IV.\n2. Reimbursement for any incurred out-of-pocket refreshments and necessary expenses.`;
        } else {
          reliefSought = `1. Full ticket refund / reimbursement for unused sectors as mandated under DGCA CAR regulations.\n2. Provision of complimentary duty-of-care expenses incurred during the disruption.`;
        }
      } else if (currentAnalysis.jurisdiction === 'eu261' || currentAnalysis.jurisdiction === 'uk261') {
        legalBasis = currentAnalysis.jurisdiction === 'uk261' ? 'UK Regulation (EC) No 261/2004 (Air Passenger Rights)' : 'European Parliament and Council Regulation (EC) No 261/2004';
        reliefSought = `1. Statutory fixed compensation of ${currentAnalysis.financialRecovery.formattedRange || '€250 - €600'} based on route distance of ${currentAnalysis.formattedDistance}.\n2. Full reimbursement of incurred duty-of-care expenses (meals, accommodation, transport).`;
      } else {
        legalBasis = 'Montreal Convention 1999 (Article 19) and Airline Contract of Carriage';
        reliefSought = `1. Full refund of ticket cost for the disrupted segment.\n2. Direct reimbursement for provable damages, accommodation, and meal expenses incurred.`;
      }

      const letterSubject = `Passenger Disruption Claim & Assistance Notice - ${flightCase.flightNumber} - PNR: ${pnr} - ${passengerName}`;
      const letterBody = `To,\nCustomer Relations & Grievance Redressal Department\n${flightCase.airline}\n\nDate: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}\n\nSubject: Formal Notice Regarding Flight Disruption: ${flightCase.flightNumber} (PNR: ${pnr})\n\nDear Customer Relations Team,\n\nI am writing to formally log a grievance and request statutory settlement regarding flight ${flightCase.flightNumber} scheduled from ${originDesc} to ${destDesc} on ${flightCase.flightDate || 'the scheduled date'}.\n\nFlight Details:\n• Passenger Name: ${passengerName}\n• Booking Reference (PNR): ${pnr}\n• Flight: ${flightCase.airline} ${flightCase.flightNumber}\n• Route: ${originDesc} to ${destDesc} (${currentAnalysis.formattedDistance})\n• Scheduled Date: ${flightCase.flightDate}\n\nDisruption Overview:\nThe aforementioned flight ${disruptionSummary}.\n\nApplicable Regulatory Framework:\nThis notice is submitted pursuant to the ${legalBasis}.\n\nRequested Redressal & Settlement:\n${reliefSought}\n${customNotes ? `\nAdditional Details:\n${customNotes}\n` : ''}\nI have preserved copies of my original boarding pass, booking itinerary, and relevant expense receipts. Please provide written confirmation of this case and your intended resolution within the statutory response timeframe.\n\nThank you for your prompt assistance.\n\nSincerely,\n${passengerName}\nEmail: ${passengerEmail}\nPhone: ${passengerPhone}`;

      const newDraft: ClaimDraft = {
        id: 'draft_' + Date.now(),
        passengerName,
        passengerEmail,
        passengerPhone,
        bookingReference: pnr,
        airline: flightCase.airline,
        flightNumber: flightCase.flightNumber,
        route: `${originDesc} → ${destDesc}`,
        requestType: currentAnalysis.caseStatus === 'Compensation Likely Eligible' ? 'Statutory Compensation & Refund' : 'Assistance & Duty of Care Redressal',
        subject: letterSubject,
        letterBody,
        createdAt: new Date().toISOString(),
        isApprovedByPassenger: false
      };

      // Mutate REAL React State
      setClaimDraft(newDraft);

      addActivityLog({
        type: 'tool_result',
        toolName: 'prepare_passenger_request',
        status: 'pending_approval',
        description: `Draft prepared for ${passengerName}. Awaiting mandatory human passenger review & approval.`,
        payload: {
          draftId: newDraft.id,
          subject: newDraft.subject,
          isApproved: false
        }
      });

      return {
        success: true,
        draftId: newDraft.id,
        subject: newDraft.subject,
        letterPreview: letterBody.slice(0, 200) + '...',
        requiresHumanApproval: true,
        isApprovedByPassenger: false,
        message: 'Claim draft successfully prepared and displayed in the UI. The passenger must review and click "Approve Draft" before form population.'
      };
    }

    // 4. TOOL: approve_and_fill_demo_form
    if (toolName === 'approve_and_fill_demo_form') {
      addActivityLog({
        type: 'tool_call',
        toolName: 'approve_and_fill_demo_form',
        status: 'running',
        description: 'Executing WebMCP tool approve_and_fill_demo_form() with human-in-the-loop guard'
      });

      if (!claimDraft || !claimDraft.isApprovedByPassenger) {
        addActivityLog({
          type: 'tool_result',
          toolName: 'approve_and_fill_demo_form',
          status: 'failed',
          description: 'BLOCKED BY HUMAN GUARD: Draft has not been approved by the passenger.',
          payload: { isApproved: false }
        });

        return {
          success: false,
          error: 'HUMAN_APPROVAL_REQUIRED',
          message: 'The passenger must review and approve the draft before continuing. Please click the "Approve Draft" button in the application UI first.'
        };
      }

      // Human has approved! Populate the real demo form
      const currentAnalysis = analysisResult || analyzeFlightDisruption(flightCase);
      const originCity = flightCase.origin ? flightCase.origin.city : 'Origin';
      const destCity = flightCase.destination ? flightCase.destination.city : 'Destination';

      const populatedForm: DemoClaimFormState = {
        passengerName: claimDraft.passengerName,
        passengerEmail: claimDraft.passengerEmail,
        bookingReference: claimDraft.bookingReference,
        flightNumber: claimDraft.flightNumber,
        airline: claimDraft.airline,
        route: `${originCity} (${flightCase.origin?.iata || '---'}) → ${destCity} (${flightCase.destination?.iata || '---'})`,
        disruption: `${flightCase.disruptionType.toUpperCase()} - ${currentAnalysis.caseStatus}`,
        requestType: claimDraft.requestType,
        claimAmount: currentAnalysis.financialRecovery.formattedRange || 'Full statutory reimbursement & care',
        message: claimDraft.letterBody,
        isPopulated: true,
        submittedSimulated: false
      };

      setDemoClaimForm(populatedForm);

      addActivityLog({
        type: 'tool_result',
        toolName: 'approve_and_fill_demo_form',
        status: 'completed',
        description: `✓ HUMAN APPROVED: Demo claim form populated for ${claimDraft.passengerName} (${claimDraft.flightNumber})`,
        payload: {
          passenger: populatedForm.passengerName,
          pnr: populatedForm.bookingReference,
          claimAmount: populatedForm.claimAmount
        }
      });

      return {
        success: true,
        message: 'Demo Claim Form successfully populated with passenger-approved details.',
        populatedData: {
          passengerName: populatedForm.passengerName,
          bookingReference: populatedForm.bookingReference,
          airline: populatedForm.airline,
          flightNumber: populatedForm.flightNumber,
          route: populatedForm.route,
          claimAmount: populatedForm.claimAmount
        }
      };
    }

    return {
      success: false,
      error: 'UNKNOWN_TOOL',
      message: `Tool "${toolName}" is not registered in FlightFixer WebMCP context.`
    };
  }
}

function formatInformedWindowStr(window: FlightCase['informedWindow']): string {
  switch (window) {
    case 'more_than_2w': return 'informed >14 days prior';
    case '24h_to_2w': return 'informed between 24h to 14 days prior';
    case 'less_than_24h': return 'informed less than 24 hours prior';
    case 'at_airport': return 'informed on day of departure at the airport';
    default: return 'unspecified notice';
  }
}

export const webMcpBridge = new WebMCPBridgeManager();
