import React from 'react';
import { Plane, Calendar, Hash, Building2, MapPin, ArrowRight, User, Mail, ShieldCheck } from 'lucide-react';
import { FlightCase, Airport } from '../types';
import { AirportSearch } from './AirportSearch';
import { DisruptionDetails } from './DisruptionDetails';
import { calculateHaversineDistance, formatDistanceString } from '../utils/distance';

interface FlightFormProps {
  flightCase: FlightCase;
  onChange: (updated: Partial<FlightCase>) => void;
  currencyCode: 'INR' | 'EUR' | 'GBP' | 'USD';
}

export const FlightForm: React.FC<FlightFormProps> = ({
  flightCase,
  onChange,
  currencyCode
}) => {
  const distanceKm = calculateHaversineDistance(flightCase.origin, flightCase.destination);
  const formattedDistance = formatDistanceString(distanceKm);
  const isSameAirport = flightCase.origin && flightCase.destination && flightCase.origin.iata === flightCase.destination.iata;

  const popularAirlines = [
    'IndiGo',
    'Air India',
    'SpiceJet',
    'Akasa Air',
    'Air India Express',
    'British Airways',
    'Lufthansa',
    'Emirates',
    'Singapore Airlines'
  ];

  return (
    <div id="flight-case-form" className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 space-y-6 shadow-xs">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Tell us about your flight
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Provide your flight details to begin.
        </p>
      </div>

      {/* STEP 1: YOUR FLIGHT */}
      <div className="space-y-4">
        {/* Airline & Flight Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="airline-input" className="block text-[11px] font-medium text-slate-600 mb-1">
              Airline
            </label>
            <div className="relative">
              <input
                id="airline-input"
                type="text"
                list="airlines-datalist"
                placeholder="e.g. IndiGo, Air India"
                value={flightCase.airline}
                onChange={(e) => onChange({ airline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
              <datalist id="airlines-datalist">
                {popularAirlines.map(a => <option key={a} value={a} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label htmlFor="flight-number-input" className="block text-[11px] font-medium text-slate-600 mb-1">
              Flight Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-3.5 h-3.5" />
              </div>
              <input
                id="flight-number-input"
                type="text"
                placeholder="e.g. 6E-204"
                value={flightCase.flightNumber}
                onChange={(e) => onChange({ flightNumber: e.target.value.toUpperCase() })}
                className="w-full pl-8 pr-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-mono uppercase focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Origin & Destination Airport Searches */}
        <div className="space-y-3">
          <AirportSearch
            id="origin-airport"
            label="Origin Airport (Departure)"
            placeholder="Search city or IATA (e.g. Delhi, DEL)"
            selectedAirport={flightCase.origin}
            onSelectAirport={(airport) => onChange({ origin: airport })}
          />

          <AirportSearch
            id="destination-airport"
            label="Destination Airport (Arrival)"
            placeholder="Search city or IATA (e.g. Mumbai, BOM)"
            selectedAirport={flightCase.destination}
            onSelectAirport={(airport) => onChange({ destination: airport })}
            error={isSameAirport ? 'Origin and Destination cannot be the same airport.' : undefined}
          />
        </div>

        {/* Route Distance Banner (Auto-calculated via Haversine) */}
        {flightCase.origin && flightCase.destination && !isSameAirport && (
          <div
            id="route-distance-badge"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">
                {flightCase.origin.city} ({flightCase.origin.iata})
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900">
                {flightCase.destination.city} ({flightCase.destination.iata})
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono font-semibold text-slate-900">{formattedDistance}</span>
              <span className="block text-[10px] text-slate-500">Auto-calculated route distance</span>
            </div>
          </div>
        )}

        {/* Flight Date */}
        <div>
          <label htmlFor="flight-date-input" className="block text-[11px] font-medium text-slate-600 mb-1">
            Flight Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <input
              id="flight-date-input"
              type="date"
              value={flightCase.flightDate}
              onChange={(e) => onChange({ flightDate: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* STEP 2: WHAT HAPPENED? */}
      <DisruptionDetails
        flightCase={flightCase}
        onChange={onChange}
        currencyCode={currencyCode}
      />

      {/* PASSENGER DETAILS (For Official Request / Claim Drafting) */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
          Passenger Information (Optional for Drafts)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="passenger-name" className="block text-[11px] font-medium text-slate-600 mb-1">
              Passenger Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <input
                id="passenger-name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={flightCase.passengerName}
                onChange={(e) => onChange({ passengerName: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="booking-reference-pnr" className="block text-[11px] font-medium text-slate-600 mb-1">
              Booking Reference (PNR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <input
                id="booking-reference-pnr"
                type="text"
                placeholder="e.g. 6E9K2A"
                value={flightCase.bookingReference}
                onChange={(e) => onChange({ bookingReference: e.target.value.toUpperCase() })}
                className="w-full pl-8 pr-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-mono uppercase focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="passenger-email" className="block text-[11px] font-medium text-slate-600 mb-1">
            Passenger Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <input
              id="passenger-email"
              type="email"
              placeholder="e.g. rahul.sharma@example.com"
              value={flightCase.passengerEmail}
              onChange={(e) => onChange({ passengerEmail: e.target.value })}
              className="w-full pl-8 pr-3 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
