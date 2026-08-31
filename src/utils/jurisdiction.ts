import { Airport, Jurisdiction } from '../types';

const EU_COUNTRY_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
  'SE', 'IS', 'NO', 'CH'
]);

export interface JurisdictionInfo {
  jurisdiction: Jurisdiction;
  label: string;
  badge: string;
  regulatoryBody: string;
  ruleReference: string;
  summary: string;
}

export function detectJurisdiction(
  origin: Airport | null,
  destination: Airport | null,
  airline: string = ''
): JurisdictionInfo {
  if (!origin || !destination) {
    return {
      jurisdiction: 'general',
      label: 'General Passenger Guidance',
      badge: 'Global Aviation Standards',
      regulatoryBody: 'ICAO / Montreal Convention',
      ruleReference: 'Montreal Convention & Airline Contract of Carriage',
      summary: 'General international aviation standards and airline terms of carriage apply.'
    };
  }

  const origCountry = origin.countryCode.toUpperCase();
  const destCountry = destination.countryCode.toUpperCase();
  const lowerAirline = airline.toLowerCase();

  // 1. Domestic India
  if (origCountry === 'IN' && destCountry === 'IN') {
    return {
      jurisdiction: 'domestic_india',
      label: 'India Domestic Passenger Rights',
      badge: 'DGCA India CAR Mandate',
      regulatoryBody: 'Directorate General of Civil Aviation (DGCA)',
      ruleReference: 'Civil Aviation Requirements (CAR) Sec 3, Series M, Part IV',
      summary: 'Governed by DGCA India regulations covering facilities, refunds, meals, and statutory compensation for delays, cancellations, and denied boarding.'
    };
  }

  // 2. UK 261 (Departing UK or arriving UK on UK carrier)
  const isUKCarrier = lowerAirline.includes('british airways') || lowerAirline.includes('virgin') || lowerAirline.includes('easyjet uk');
  if (origCountry === 'GB' || (destCountry === 'GB' && isUKCarrier)) {
    return {
      jurisdiction: 'uk261',
      label: 'UK Passenger Rights',
      badge: 'UK Regulation (EC) No 261/2004',
      regulatoryBody: 'UK Civil Aviation Authority (CAA)',
      ruleReference: 'Air Passenger Rights and Air Travel Organisers’ Licensing (Amendment) (EU Exit) Regulations',
      summary: 'Covers departures from UK airports or arrivals on UK carriers with statutory compensation between £220 to £520 depending on route distance.'
    };
  }

  // 3. EU 261 (Departing EU/EEA or arriving in EU on EU carrier)
  const isOrigEU = EU_COUNTRY_CODES.has(origCountry);
  const isDestEU = EU_COUNTRY_CODES.has(destCountry);
  const isEUCarrier = lowerAirline.includes('lufthansa') || lowerAirline.includes('air france') || lowerAirline.includes('klm') || lowerAirline.includes('ryanair') || lowerAirline.includes('iberia') || lowerAirline.includes('swiss') || lowerAirline.includes('tap') || lowerAirline.includes('sas');

  if (isOrigEU || (isDestEU && isEUCarrier)) {
    return {
      jurisdiction: 'eu261',
      label: 'EU Passenger Rights',
      badge: 'EU Regulation (EC) 261/2004',
      regulatoryBody: 'European Commission & National Enforcement Bodies',
      ruleReference: 'Regulation (EC) No 261/2004 of the European Parliament and of the Council',
      summary: 'Mandates duty of care (meals, hotels) and statutory compensation between €250 to €600 for cancellations and delays >3 hours.'
    };
  }

  // 4. International India
  if (origCountry === 'IN' || destCountry === 'IN') {
    return {
      jurisdiction: 'international_india',
      label: 'International Flight (India Connected)',
      badge: 'DGCA + Montreal Convention',
      regulatoryBody: 'DGCA India & Departure Country Aviation Authority',
      ruleReference: 'Montreal Convention 1999 & Carrier Tariff Rules',
      summary: 'International routes departing or arriving in India are governed by the Montreal Convention, departure state passenger charters, and airline terms.'
    };
  }

  // 5. General International
  return {
    jurisdiction: 'general',
    label: 'General Passenger Guidance',
    badge: 'Montreal Convention & Airline Tariffs',
    regulatoryBody: 'International Civil Aviation Organization (ICAO)',
    ruleReference: 'Montreal Convention 1999',
    summary: 'Governed by the operating carrier’s conditions of carriage and international air transport conventions.'
  };
}
