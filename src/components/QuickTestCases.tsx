import React from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { FlightCase } from '../types';
import { getAirportByIata } from '../services/airportService';

interface QuickTestCasesProps {
  onApplyCase: (flightCase: FlightCase, caseTitle: string) => void;
}

export const QuickTestCases: React.FC<QuickTestCasesProps> = ({ onApplyCase }) => {
  const testCases = [
    {
      id: 'test-case-1',
      title: 'BOM → AMD (4h Delay)',
      desc: 'DGCA 4-Hour Delay • Duty of Care & Refreshments',
      badge: 'DGCA Domestic',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      data: (): FlightCase => ({
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
      })
    },
    {
      id: 'test-case-2',
      title: 'DEL → BLR (Cancellation <24h)',
      desc: 'DGCA Short Notice • Full Fare Breakdown • Up to ₹10,000',
      badge: 'DGCA Eligible',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      data: (): FlightCase => ({
        airline: 'Air India',
        flightNumber: 'AI-803',
        origin: getAirportByIata('DEL'),
        destination: getAirportByIata('BLR'),
        flightDate: new Date().toISOString().split('T')[0],
        disruptionType: 'cancelled',
        delayHours: 0,
        delayMinutes: 0,
        airlineReason: 'Technical glitch on aircraft',
        informedWindow: 'less_than_24h',
        alternateOffered: 'next_day',
        basicFare: 7400,
        fuelCharge: 1800,
        scheduledBlockTimeHours: 2.75,
        alternateArrangedTime: 'none',
        passengerDeclinedAlternate: false,
        missedConnectionDelayHours: 0,
        singleTicketBooking: true,
        passengerName: 'Priya Patel',
        passengerEmail: 'priya.patel@example.com',
        passengerPhone: '+91 91234 56789',
        bookingReference: 'AI479X'
      })
    },
    {
      id: 'test-case-3',
      title: 'DEL → GOI (Missing Fare Info)',
      desc: 'Cancellation without fare breakdown • Status: Not Yet Confirmed',
      badge: 'Info Needed',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      data: (): FlightCase => ({
        airline: 'SpiceJet',
        flightNumber: 'SG-184',
        origin: getAirportByIata('DEL'),
        destination: getAirportByIata('GOI'),
        flightDate: new Date().toISOString().split('T')[0],
        disruptionType: 'cancelled',
        delayHours: 0,
        delayMinutes: 0,
        airlineReason: 'Commercial / operational consolidation',
        informedWindow: 'less_than_24h',
        alternateOffered: 'none',
        basicFare: undefined, // Intentionally undefined to demonstrate missing information
        fuelCharge: undefined,
        scheduledBlockTimeHours: undefined,
        alternateArrangedTime: 'none',
        passengerDeclinedAlternate: false,
        missedConnectionDelayHours: 0,
        singleTicketBooking: true,
        passengerName: 'Aarav Mehta',
        passengerEmail: 'aarav.mehta@example.com',
        passengerPhone: '+91 99887 76655',
        bookingReference: 'SG821M'
      })
    },
    {
      id: 'test-case-4',
      title: 'LHR → CDG (EU261 €250 / £220)',
      desc: 'Short Haul European Delay 3h+ • Statutory Compensation',
      badge: 'UK/EU 261',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      data: (): FlightCase => ({
        airline: 'British Airways',
        flightNumber: 'BA-308',
        origin: getAirportByIata('LHR'),
        destination: getAirportByIata('CDG'),
        flightDate: new Date().toISOString().split('T')[0],
        disruptionType: 'delayed',
        delayHours: 3,
        delayMinutes: 45,
        airlineReason: 'Crew scheduling shortage',
        informedWindow: 'at_airport',
        alternateOffered: 'none',
        basicFare: 120,
        fuelCharge: 40,
        scheduledBlockTimeHours: 1.3,
        alternateArrangedTime: 'none',
        passengerDeclinedAlternate: false,
        missedConnectionDelayHours: 0,
        singleTicketBooking: true,
        passengerName: 'James Wilson',
        passengerEmail: 'james.wilson@example.com',
        passengerPhone: '+44 7700 900077',
        bookingReference: 'BA719Q'
      })
    },
    {
      id: 'test-case-5',
      title: 'BLR → HYD (Denied Boarding)',
      desc: 'Involuntary Overbooking • 400% Basic + Fuel Up to ₹20k',
      badge: 'Overbooking',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      data: (): FlightCase => ({
        airline: 'IndiGo',
        flightNumber: '6E-419',
        origin: getAirportByIata('BLR'),
        destination: getAirportByIata('HYD'),
        flightDate: new Date().toISOString().split('T')[0],
        disruptionType: 'denied_boarding',
        delayHours: 0,
        delayMinutes: 0,
        airlineReason: 'Aircraft overbooking and capacity restriction',
        informedWindow: 'at_airport',
        alternateOffered: 'none',
        basicFare: 4500,
        fuelCharge: 950,
        scheduledBlockTimeHours: 1.1,
        alternateArrangedTime: 'after_24h',
        passengerDeclinedAlternate: true,
        missedConnectionDelayHours: 0,
        singleTicketBooking: true,
        passengerName: 'Ananya Roy',
        passengerEmail: 'ananya.roy@example.com',
        passengerPhone: '+91 98450 12345',
        bookingReference: '6E499X'
      })
    }
  ];

  return (
    <div id="quick-test-scenarios" className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-4 mb-6 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Quick test cases
        </span>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Select a disruption scenario to test calculations & WebMCP
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap">
        {testCases.map((tc) => (
          <button
            key={tc.id}
            id={tc.id}
            type="button"
            onClick={() => onApplyCase(tc.data(), tc.title)}
            className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <span className="text-slate-900 font-semibold">{tc.title}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 text-[11px]">{tc.badge}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
