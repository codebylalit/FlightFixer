import { FlightCase, AnalysisResult, FinancialRecovery } from '../types';
import { calculateHaversineDistance, formatDistanceString } from '../utils/distance';
import { detectJurisdiction } from '../utils/jurisdiction';
import { formatCurrency, formatCurrencyRange } from '../utils/currency';

/**
 * Analyzes a flight case against applicable aviation regulations (DGCA CAR / EU261 / UK261 / Montreal Convention).
 * Produces structured, objective, transparent guidance without making false legal claims or fake guarantees.
 */
export function analyzeFlightDisruption(flightCase: FlightCase): AnalysisResult {
  const {
    airline,
    flightNumber,
    origin,
    destination,
    disruptionType,
    delayHours,
    delayMinutes,
    airlineReason,
    informedWindow,
    alternateOffered,
    scheduledBlockTimeHours,
    basicFare,
    fuelCharge,
    alternateArrangedTime,
    passengerDeclinedAlternate,
    missedConnectionDelayHours,
    singleTicketBooking
  } = flightCase;

  const distanceKm = calculateHaversineDistance(origin, destination);
  const formattedDistance = formatDistanceString(distanceKm);
  const jurisdictionInfo = detectJurisdiction(origin, destination, airline);

  const whatWeFound: string[] = [];
  const passengerGuidance: string[] = [];
  const missingInformation: string[] = [];
  const recommendedNextSteps: string[] = [];

  let caseStatus: AnalysisResult['caseStatus'] = 'Further Review Recommended';
  let caseStatusColor: AnalysisResult['caseStatusColor'] = 'blue';
  let financialRecovery: FinancialRecovery = {
    status: 'Not Yet Confirmed',
    currency: 'INR',
    details: 'More details are required to evaluate statutory recovery options.'
  };
  let whyThisResult = '';
  let applicableRules = jurisdictionInfo.ruleReference;
  let hasEnoughDataForEstimate = false;

  // Basic identification facts
  const routeDesc = origin && destination ? `${origin.city} (${origin.iata}) → ${destination.city} (${destination.iata})` : 'Route details entered';
  whatWeFound.push(`Route: ${routeDesc} • ${formattedDistance}`);
  whatWeFound.push(`Jurisdiction detected: ${jurisdictionInfo.label} (${jurisdictionInfo.badge})`);

  // -------------------------------------------------------------
  // 1. DOMESTIC INDIA JURISDICTION (DGCA CAR)
  // -------------------------------------------------------------
  if (jurisdictionInfo.jurisdiction === 'domestic_india') {
    financialRecovery.currency = 'INR';

    if (disruptionType === 'delayed') {
      const totalDelayHours = delayHours + (delayMinutes / 60);
      whatWeFound.push(`Reported departure delay: ${delayHours}h ${delayMinutes}m`);
      if (airlineReason) {
        whatWeFound.push(`Airline stated reason: "${airlineReason}"`);
      }

      // DGCA CAR Sec 3, Series M, Part IV Delay Care Matrix
      if (totalDelayHours >= 6) {
        caseStatus = 'Action Recommended';
        caseStatusColor = 'amber';
        passengerGuidance.push('Option 1: You are entitled to an alternate flight departing within 6 hours of original schedule, OR a 100% full refund if you choose not to travel.');
        passengerGuidance.push('Option 2: Free meals, refreshments, and beverages must be provided during your waiting period.');
        passengerGuidance.push('If the delay extends overnight (>24h or between 20:00 - 06:00), free hotel accommodation and ground airport transfers must be provided by the airline.');
        
        financialRecovery = {
          status: 'Refund & Care Eligible',
          currency: 'INR',
          details: 'Full ticket refund available if travel is no longer required. Under DGCA guidelines, cash compensation is not mandated for mere flight delay per se unless cancelled.'
        };
        whyThisResult = 'Under DGCA rules, delays exceeding 6 hours trigger full refund rights or prompt alternate rebooking, alongside mandatory meals and hotel care.';
        hasEnoughDataForEstimate = true;
      } else if (totalDelayHours >= 2) {
        caseStatus = 'Assistance Available';
        caseStatusColor = 'blue';
        passengerGuidance.push('Mandatory Passenger Facility: The airline is required to provide free meals and refreshments proportionate to the waiting time.');
        passengerGuidance.push('Water, snacks, and access to communications should be requested directly at the airline airport counter.');

        financialRecovery = {
          status: 'Refund & Care Eligible',
          currency: 'INR',
          details: 'Immediate duty-of-care benefits (free meals and drinks). No statutory cash payout under DGCA CAR for delays under 6 hours.'
        };
        whyThisResult = 'DGCA rules require operating airlines to provide complimentary refreshments for delays between 2 to 5 hours depending on flight block time.';
        hasEnoughDataForEstimate = true;
      } else {
        caseStatus = 'Further Review Recommended';
        caseStatusColor = 'slate';
        passengerGuidance.push('Minor delay reported. Under 2 hours, airlines are not legally required to provide refreshments, but keep monitoring boarding gates for updates.');
        financialRecovery = {
          status: 'No Estimate Available',
          currency: 'INR',
          details: 'Delays under 2 hours do not meet the minimum threshold for statutory care or recovery.'
        };
        whyThisResult = 'The reported delay is below the 2-hour statutory threshold under DGCA passenger charter.';
        hasEnoughDataForEstimate = true;
      }

      recommendedNextSteps.push('Request immediate complimentary refreshments at the airline customer service counter.');
      recommendedNextSteps.push('Retain your original boarding passes, baggage tags, and timestamped gate announcement photos.');
      recommendedNextSteps.push('Request a written Flight Disruption Certificate from airport staff stating the delay reason.');
    }

    else if (disruptionType === 'cancelled') {
      whatWeFound.push(`Cancellation notification window: ${formatInformedWindow(informedWindow)}`);
      whatWeFound.push(`Alternate flight arrangement: ${formatAlternateOffered(alternateOffered)}`);

      if (informedWindow === 'more_than_2w') {
        caseStatus = 'Further Review Recommended';
        caseStatusColor = 'slate';
        passengerGuidance.push('Informed more than 2 weeks prior: You are entitled to a full refund or an alternate flight at your convenience.');
        financialRecovery = {
          status: 'Refund & Care Eligible',
          currency: 'INR',
          details: 'Full refund or rescheduled flight. No additional cash compensation applies when notified >2 weeks in advance.'
        };
        whyThisResult = 'Under DGCA CAR, airlines giving >14 days advance cancellation notice are exempt from statutory cash compensation.';
        hasEnoughDataForEstimate = true;
      } else if (informedWindow === '24h_to_2w') {
        if (alternateOffered === 'within_2h') {
          caseStatus = 'Further Review Recommended';
          caseStatusColor = 'blue';
          passengerGuidance.push('The airline offered an alternate flight within 2 hours of the original schedule. You can accept the rebooking or opt for a full refund.');
          financialRecovery = {
            status: 'Refund & Care Eligible',
            currency: 'INR',
            details: 'Full refund or alternate flight. No compensation is payable if an alternate was arranged within 2 hours.'
          };
          whyThisResult = 'Airlines providing 24h–14d notice are exempt from cash compensation if an alternate flight within 2 hours of original schedule was provided.';
          hasEnoughDataForEstimate = true;
        } else {
          caseStatus = 'Compensation Likely Eligible';
          caseStatusColor = 'emerald';
          passengerGuidance.push('The airline did not offer an alternate flight within 2 hours of scheduled departure. You are eligible for compensation + full ticket refund.');
          
          // Check financial details
          const fareBasis = (basicFare !== undefined && fuelCharge !== undefined) ? (basicFare + fuelCharge) : undefined;
          const blockTime = scheduledBlockTimeHours ?? (distanceKm ? estimateBlockTimeFromDistance(distanceKm) : undefined);

          if (blockTime === undefined) {
            missingInformation.push('Scheduled flight block time (flight duration) to calculate statutory bracket.');
          }
          if (fareBasis === undefined) {
            missingInformation.push('Basic Fare and Airline Fuel Charge (YQ/YR) from your booking invoice.');
          }

          if (blockTime !== undefined && fareBasis !== undefined) {
            let cap = 10000;
            if (blockTime <= 1.0) cap = 5000;
            else if (blockTime <= 2.0) cap = 7500;
            else cap = 10000;

            const estimatedAmt = Math.min(cap, fareBasis);
            financialRecovery = {
              status: 'Potential Compensation',
              amountMin: estimatedAmt,
              amountMax: estimatedAmt,
              currency: 'INR',
              formattedRange: formatCurrency(estimatedAmt, 'INR'),
              details: `DGCA statutory compensation: Min(₹${cap.toLocaleString()}, Basic Fare ₹${basicFare} + Fuel Charge ₹${fuelCharge} = ₹${fareBasis.toLocaleString()}).`
            };
            whyThisResult = `Based on a block time of ${blockTime}h and booked Basic Fare + Fuel Charge of ₹${fareBasis.toLocaleString()}.`;
            hasEnoughDataForEstimate = true;
          } else {
            financialRecovery = {
              status: 'Not Yet Confirmed',
              currency: 'INR',
              details: 'Compensation brackets range between ₹5,000 to ₹10,000 (capped at Basic Fare + Fuel Charge). Provide fare breakdown to calculate exact amount.'
            };
            whyThisResult = 'Cancellations with short notice qualify for compensation under DGCA rules, but block time or fare breakdown is missing.';
          }
        }
      } else {
        // Informed < 24 hours or at airport
        caseStatus = 'Compensation Likely Eligible';
        caseStatusColor = 'emerald';
        passengerGuidance.push('Short notice cancellation (<24h / at airport): Airline must provide alternate rebooking + free meals/hotel during wait, OR full refund.');
        passengerGuidance.push('Statutory DGCA compensation is mandated unless cancellation was caused by extraordinary force majeure circumstances (e.g., severe weather, ATC shutdown).');

        const fareBasis = (basicFare !== undefined && fuelCharge !== undefined) ? (basicFare + fuelCharge) : undefined;
        const blockTime = scheduledBlockTimeHours ?? (distanceKm ? estimateBlockTimeFromDistance(distanceKm) : undefined);

        if (blockTime === undefined) {
          missingInformation.push('Scheduled flight block time (flight duration) to calculate statutory bracket.');
        }
        if (fareBasis === undefined) {
          missingInformation.push('Basic Fare and Airline Fuel Charge (excluding government UDF/PSF taxes).');
        }

        if (blockTime !== undefined && fareBasis !== undefined) {
          let cap = 10000;
          if (blockTime <= 1.0) cap = 5000;
          else if (blockTime <= 2.0) cap = 7500;
          else cap = 10000;

          const estimatedAmt = Math.min(cap, fareBasis);
          financialRecovery = {
            status: 'Potential Compensation',
            amountMin: estimatedAmt,
            amountMax: estimatedAmt,
            currency: 'INR',
            formattedRange: formatCurrency(estimatedAmt, 'INR'),
            details: `DGCA compensation bracket: ₹${cap.toLocaleString()} (or booked Basic Fare + Fuel Charge ₹${fareBasis.toLocaleString()}, whichever is less).`
          };
          whyThisResult = `Calculated using DGCA CAR Part IV matrix for ${blockTime}h block time and ₹${fareBasis.toLocaleString()} Basic + Fuel charge.`;
          hasEnoughDataForEstimate = true;
        } else {
          financialRecovery = {
            status: 'Not Yet Confirmed',
            currency: 'INR',
            details: 'Estimated range: ₹5,000 to ₹10,000 (capped at Basic Fare + Fuel Charge). Provide your fare breakdown to get the exact figure.'
          };
          whyThisResult = 'Under 24-hour cancellation qualifies for DGCA compensation, pending exact fare and block time validation.';
        }
      }

      recommendedNextSteps.push('Ask the airline representative for a formal written Notice of Cancellation stating the official operational reason.');
      recommendedNextSteps.push('Do not accept a travel voucher if you prefer a direct monetary bank refund or rebooking.');
      recommendedNextSteps.push('Save receipts for any unexpected taxi, meal, or accommodation expenses incurred due to the disruption.');
      recommendedNextSteps.push('Prepare a formal passenger rights claim to the airline nodal grievance officer.');
    }

    else if (disruptionType === 'denied_boarding') {
      whatWeFound.push(`Denied Boarding status: Overbooking / Capacity constraint`);
      whatWeFound.push(`Alternate flight arrangement: ${formatAlternateArrangedTime(alternateArrangedTime)}`);

      const fareBasis = (basicFare !== undefined && fuelCharge !== undefined) ? (basicFare + fuelCharge) : undefined;
      if (fareBasis === undefined) {
        missingInformation.push('Booked Basic Fare and Fuel Charge to compute percentage multipliers.');
      }

      if (alternateArrangedTime === 'within_1h') {
        caseStatus = 'Assistance Available';
        caseStatusColor = 'blue';
        passengerGuidance.push('Alternate flight was arranged within 1 hour of scheduled departure. No additional financial compensation is mandated under DGCA rules.');
        financialRecovery = {
          status: 'Refund & Care Eligible',
          currency: 'INR',
          details: 'No cash compensation since alternate travel departed within 1 hour of original ticket time.'
        };
        whyThisResult = 'DGCA CAR rules exempt compensation if replacement flight departs within 60 minutes.';
        hasEnoughDataForEstimate = true;
      } else if (alternateArrangedTime === 'within_24h' && !passengerDeclinedAlternate) {
        caseStatus = 'Compensation Likely Eligible';
        caseStatusColor = 'emerald';
        passengerGuidance.push('Alternate flight provided within 24 hours: Entitled to 200% of booked Basic Fare + Fuel Charge (max ₹10,000) + ticket value.');

        if (fareBasis !== undefined) {
          const estimatedAmt = Math.min(10000, fareBasis * 2);
          financialRecovery = {
            status: 'Potential Compensation',
            amountMin: estimatedAmt,
            amountMax: estimatedAmt,
            currency: 'INR',
            formattedRange: formatCurrency(estimatedAmt, 'INR'),
            details: `200% of Basic Fare + Fuel Charge (₹${(fareBasis * 2).toLocaleString()}), capped at statutory max ₹10,000.`
          };
          whyThisResult = 'DGCA CAR Part IV Section 3 for denied boarding with alternate flight arranged within 24 hours.';
          hasEnoughDataForEstimate = true;
        } else {
          financialRecovery = {
            status: 'Not Yet Confirmed',
            currency: 'INR',
            details: '200% of Basic Fare + Fuel Charge up to ₹10,000. Provide fare breakdown to calculate exact amount.'
          };
        }
      } else {
        // Beyond 24 hours or declined alternate
        caseStatus = 'Compensation Likely Eligible';
        caseStatusColor = 'emerald';
        passengerGuidance.push('Entitled to 400% of booked Basic Fare + Fuel Charge (max ₹20,000) + full refund of ticket value.');

        if (fareBasis !== undefined) {
          const estimatedAmt = Math.min(20000, fareBasis * 4);
          financialRecovery = {
            status: 'Potential Compensation',
            amountMin: estimatedAmt,
            amountMax: estimatedAmt,
            currency: 'INR',
            formattedRange: formatCurrency(estimatedAmt, 'INR'),
            details: `400% of Basic Fare + Fuel Charge (₹${(fareBasis * 4).toLocaleString()}), capped at statutory max ₹20,000 + ticket refund.`
          };
          whyThisResult = 'DGCA CAR Part IV Section 3 for denied boarding where alternate exceeds 24h or was declined.';
          hasEnoughDataForEstimate = true;
        } else {
          financialRecovery = {
            status: 'Not Yet Confirmed',
            currency: 'INR',
            details: '400% of Basic Fare + Fuel Charge up to ₹20,000 + full refund. Provide fare breakdown for exact figure.'
          };
        }
      }

      recommendedNextSteps.push('Obtain written confirmation from the gate supervisor confirming involuntary denied boarding.');
      recommendedNextSteps.push('Do not surrender your original boarding pass or booking confirmation.');
      recommendedNextSteps.push('Demand immediate cash or bank transfer compensation before leaving the airport premises if feasible.');
    }

    else if (disruptionType === 'missed_connection') {
      whatWeFound.push(`Missed connection on route • Final delay: ${missedConnectionDelayHours}h`);
      whatWeFound.push(`Single ticket booking: ${singleTicketBooking ? 'Yes (Protected Connection)' : 'No (Separate Tickets)'}`);

      if (!singleTicketBooking) {
        caseStatus = 'Further Review Recommended';
        caseStatusColor = 'amber';
        passengerGuidance.push('Self-transfers on separate tickets are generally not legally protected by connecting carrier liability.');
        passengerGuidance.push('Check your travel insurance policy or ask the first carrier for goodwill assistance.');
        financialRecovery = {
          status: 'No Estimate Available',
          currency: 'INR',
          details: 'Airlines are generally not liable for missed onward flights booked on separate reservations.'
        };
        whyThisResult = 'Separate PNR tickets do not create a legal obligation for missed connecting flights.';
        hasEnoughDataForEstimate = true;
      } else {
        caseStatus = 'Action Recommended';
        caseStatusColor = 'emerald';
        passengerGuidance.push('Single Ticket: The operating carrier is responsible for rebooking you to your final destination on the next available flight without extra charge.');
        passengerGuidance.push('Meals, drinks, and hotel accommodation (if connection delay is overnight) must be provided.');
        
        financialRecovery = {
          status: 'Refund & Care Eligible',
          currency: 'INR',
          details: 'Free rebooking to destination + duty of care (hotel & meals). If cancelled/delayed, DGCA cancellation rules apply to the disrupted sector.'
        };
        whyThisResult = 'Under DGCA regulations, through-ticket connecting passengers are protected for onward rebooking and care.';
        hasEnoughDataForEstimate = true;
      }

      recommendedNextSteps.push('Report immediately to the airline transfer desk at your transit airport.');
      recommendedNextSteps.push('Ask for replacement boarding passes for the next available onward flight.');
      recommendedNextSteps.push('Request meal and hotel vouchers if transit time exceeds 4 hours.');
    }
  }

  // -------------------------------------------------------------
  // 2. EU 261 / UK 261 JURISDICTION
  // -------------------------------------------------------------
  else if (jurisdictionInfo.jurisdiction === 'eu261' || jurisdictionInfo.jurisdiction === 'uk261') {
    const isUK = jurisdictionInfo.jurisdiction === 'uk261';
    const currency = isUK ? 'GBP' : 'EUR';
    financialRecovery.currency = currency;

    const km = distanceKm || 1200;

    let tierAmt = isUK ? 220 : 250;
    if (km > 3500) {
      tierAmt = isUK ? 520 : 600;
    } else if (km > 1500) {
      tierAmt = isUK ? 350 : 400;
    }

    if (disruptionType === 'delayed') {
      const totalDelay = delayHours + (delayMinutes / 60);
      whatWeFound.push(`Arrival delay: ${delayHours}h ${delayMinutes}m • Route distance: ${formattedDistance}`);

      if (totalDelay >= 3) {
        caseStatus = 'Compensation Likely Eligible';
        caseStatusColor = 'emerald';
        passengerGuidance.push(`Statutory ${isUK ? 'UK261' : 'EU261'} compensation applies for delays of 3 hours or more at final destination.`);
        passengerGuidance.push(`Duty of care: Airline must provide free meals, refreshments, and 2 free phone calls or emails.`);
        if (totalDelay >= 5) {
          passengerGuidance.push('Delay >5 hours: You have the right to abandon your journey and receive a 100% full ticket refund.');
        }

        financialRecovery = {
          status: 'Potential Compensation',
          amountMin: tierAmt,
          amountMax: tierAmt,
          currency: currency,
          formattedRange: formatCurrency(tierAmt, currency),
          details: `Fixed statutory ${isUK ? 'UK' : 'EU'} compensation based on flight distance (${km.toLocaleString()} km). Payable unless airline proves extraordinary circumstances.`
        };
        whyThisResult = `Under Regulation ${isUK ? 'UK261' : 'EC 261/2004'}, delays >= 3 hours on a ${km}km route entitle passengers to ${formatCurrency(tierAmt, currency)}.`;
        hasEnoughDataForEstimate = true;
      } else {
        caseStatus = 'Assistance Available';
        caseStatusColor = 'blue';
        passengerGuidance.push('Delay is under 3 hours. Fixed cash compensation does not apply, but duty of care (refreshments) applies if delay exceeds 2 hours.');
        financialRecovery = {
          status: 'Refund & Care Eligible',
          currency: currency,
          details: 'Duty of care (meals & drinks). Cash compensation requires 3+ hours arrival delay.'
        };
        whyThisResult = 'Arrival delay is under the 3-hour statutory threshold.';
        hasEnoughDataForEstimate = true;
      }
    } else if (disruptionType === 'cancelled' || disruptionType === 'denied_boarding') {
      caseStatus = 'Compensation Likely Eligible';
      caseStatusColor = 'emerald';
      passengerGuidance.push(`Statutory compensation between ${formatCurrency(tierAmt, currency)} per passenger is mandated unless notified >14 days in advance.`);
      passengerGuidance.push('Full ticket refund or immediate rerouting to final destination at earliest convenience.');
      passengerGuidance.push('Complimentary hotel accommodation and transport if rerouted flight departs the next day.');

      financialRecovery = {
        status: 'Potential Compensation',
        amountMin: tierAmt,
        amountMax: tierAmt,
        currency: currency,
        formattedRange: formatCurrency(tierAmt, currency),
        details: `Statutory compensation of ${formatCurrency(tierAmt, currency)} based on route distance of ${km.toLocaleString()} km.`
      };
      whyThisResult = `Regulation ${isUK ? 'UK261' : 'EC 261/2004'} fixed statutory compensation for cancellation/denied boarding without sufficient advance notice.`;
      hasEnoughDataForEstimate = true;
    } else {
      caseStatus = 'Action Recommended';
      caseStatusColor = 'blue';
      passengerGuidance.push('Through-ticket missed connection is protected under CJEU case law (Folkerts ruling). If you arrive at final destination 3+ hours late, compensation applies.');
      financialRecovery = {
        status: 'Potential Compensation',
        amountMin: tierAmt,
        amountMax: tierAmt,
        currency: currency,
        formattedRange: formatCurrency(tierAmt, currency),
        details: `Eligible for ${formatCurrency(tierAmt, currency)} if total delay at final destination exceeds 3 hours on a through-ticket.`
      };
      hasEnoughDataForEstimate = true;
    }

    recommendedNextSteps.push('Request the airline ground staff to issue a written confirmation of the delay or cancellation reason.');
    recommendedNextSteps.push('Keep all boarding cards, e-tickets, and receipts for food/hotel.');
    recommendedNextSteps.push(`Submit a formal claim under ${isUK ? 'UK Regulation 261' : 'EU Regulation 261/2004'} to the airline.`);
  }

  // -------------------------------------------------------------
  // 3. INTERNATIONAL / GENERAL JURISDICTION (Montreal Convention)
  // -------------------------------------------------------------
  else {
    financialRecovery.currency = 'USD';
    caseStatus = 'Further Review Recommended';
    caseStatusColor = 'blue';

    whatWeFound.push(`International Route: Governed by the Montreal Convention 1999 & airline tariff contract.`);

    if (disruptionType === 'delayed' || disruptionType === 'cancelled') {
      passengerGuidance.push('Under the Montreal Convention (Article 19), airlines are liable for proven financial damages caused by flight delay up to 5,346 SDR (Special Drawing Rights ~ $7,000 USD), unless all reasonable measures were taken.');
      passengerGuidance.push('Airlines are generally obligated to offer rebooking to destination or full refund of unused flight segments.');
      passengerGuidance.push('Duty of care: Most international carriers provide meal vouchers and hotel rooms for significant delays.');

      financialRecovery = {
        status: 'Not Yet Confirmed',
        currency: 'USD',
        details: 'Montreal Convention covers actual provable out-of-pocket expenses resulting from delay. Fixed statutory tariffs depend on operating carrier and departure country.'
      };
      whyThisResult = 'International flight outside DGCA/EU261 jurisdiction is governed by the Montreal Convention 1999 (liability for provable damages).';
    } else {
      passengerGuidance.push('Operating airline conditions of carriage apply. Request immediate rebooking and expense reimbursement.');
      financialRecovery = {
        status: 'Not Yet Confirmed',
        currency: 'USD',
        details: 'Reimbursement of reasonable incurred expenses (hotel, meals, essential purchases).'
      };
      whyThisResult = 'Montreal Convention and airline contract of carriage apply.';
    }

    recommendedNextSteps.push('Retain itemized receipts for all incurred accommodation, transportation, and meal expenses.');
    recommendedNextSteps.push('Submit an expense reimbursement claim to the airline customer relations department citing Montreal Convention Art. 19.');
  }

  // Add default universal recommendation if list is short
  if (recommendedNextSteps.length < 3) {
    recommendedNextSteps.push('Keep copies of all communication and flight booking references.');
  }

  // Basic check for required missing info
  if (!flightNumber || !airline) {
    missingInformation.push('Airline name and Flight number are needed to generate an official claim letter.');
  }

  const legalDisclaimer = 'Based on the information provided. Final eligibility depends on applicable rules, extraordinary circumstance exceptions, and the specific facts of the disruption. FlightClaims provides informational guidance and does not provide formal legal advice.';

  return {
    caseStatus,
    caseStatusColor,
    jurisdiction: jurisdictionInfo.jurisdiction,
    jurisdictionLabel: jurisdictionInfo.label,
    jurisdictionBadge: jurisdictionInfo.badge,
    distanceKm,
    formattedDistance,
    whatWeFound,
    passengerGuidance,
    missingInformation,
    financialRecovery,
    whyThisResult,
    recommendedNextSteps,
    applicableRules,
    hasEnoughDataForEstimate,
    legalDisclaimer
  };
}

function formatInformedWindow(window: FlightCase['informedWindow']): string {
  switch (window) {
    case 'more_than_2w': return 'More than 2 weeks prior';
    case '24h_to_2w': return 'Between 24 hours and 2 weeks prior';
    case 'less_than_24h': return 'Less than 24 hours prior';
    case 'at_airport': return 'At the airport / Day of departure';
    default: return 'Not specified';
  }
}

function formatAlternateOffered(alt: FlightCase['alternateOffered']): string {
  switch (alt) {
    case 'within_2h': return 'Within 2 hours of original schedule';
    case 'within_6h': return 'Within 6 hours of original schedule';
    case 'next_day': return 'Next day flight';
    case 'refund_only': return 'Refund offered only';
    case 'none': return 'No alternate flight offered';
    default: return 'Not specified';
  }
}

function formatAlternateArrangedTime(time: FlightCase['alternateArrangedTime']): string {
  switch (time) {
    case 'within_1h': return 'Within 1 hour of scheduled departure';
    case 'within_24h': return 'Within 24 hours of scheduled departure';
    case 'after_24h': return 'Beyond 24 hours / Not arranged';
    case 'none': return 'No alternate arranged';
    default: return 'Not specified';
  }
}

function estimateBlockTimeFromDistance(distanceKm: number): number {
  // Approximate average commercial flight speed ~ 700 km/h + 30 min taxi/climb/descent
  const flightHours = distanceKm / 700;
  const total = Math.round((flightHours + 0.5) * 10) / 10;
  return Math.max(0.8, total);
}
