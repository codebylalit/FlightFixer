import React from 'react';
import { FlightCase } from '../types';
import { getAirportByIata } from '../services/airportService';
import { Zap } from 'lucide-react';

interface QuickTestCasesProps {
  onApplyCase: (flightCase: FlightCase, caseTitle: string) => void;
}

export const QuickTestCases: React.FC<QuickTestCasesProps> = ({ onApplyCase }) => {
  const testCases = [
    {
      id: 'test-case-1',
      title: 'BOM → AMD',
      sub: '4h Delay',
      badge: 'DGCA',
      badgeColor: 'ff-pill-info',
      data: (): FlightCase => ({
        airline: 'IndiGo', flightNumber: '6E-5342',
        origin: getAirportByIata('BOM'), destination: getAirportByIata('AMD'),
        flightDate: new Date().toISOString().split('T')[0],
        disruptionType: 'delayed', delayHours: 4, delayMinutes: 15,
        airlineReason: 'Late arrival of incoming aircraft due to ATC congestion',
        informedWindow: 'at_airport', alternateOffered: 'none',
        totalTicketPrice: 4000, basicFare: 3200, fuelCharge: 800,
        scheduledBlockTimeHours: 1.2, alternateArrangedTime: 'none',
        passengerDeclinedAlternate: false, missedConnectionDelayHours: 0,
        singleTicketBooking: true, passengerName: 'Rahul Sharma',
        passengerEmail: 'rahul.sharma@example.com', passengerPhone: '+91 98765 43210',
        bookingReference: '6E9K2A'
      })
    },
    {
      id: 'test-case-2',
      title: 'DEL → BLR',
      sub: 'Cancelled <24h',
      badge: 'Eligible',
      badgeColor: 'ff-pill-success',
      data: (): FlightCase => ({
        airline: 'Air India', flightNumber: 'AI-803',
        origin: getAirportByIata('DEL'), destination: getAirportByIata('BLR'),
        flightDate: new Date().toISOString().split('T')[0],
        disruptionType: 'cancelled', delayHours: 0, delayMinutes: 0,
        airlineReason: 'Technical glitch on aircraft',
        informedWindow: 'less_than_24h', alternateOffered: 'next_day',
        totalTicketPrice: 9200, basicFare: 7400, fuelCharge: 1800,
        scheduledBlockTimeHours: 2.75, alternateArrangedTime: 'none',
        passengerDeclinedAlternate: false, missedConnectionDelayHours: 0,
        singleTicketBooking: true, passengerName: 'Priya Patel',
        passengerEmail: 'priya.patel@example.com', passengerPhone: '+91 91234 56789',
        bookingReference: 'AI479X'
      })
    },
    {
      id: 'test-case-3',
      title: 'DEL → GOI',
      sub: 'Missing Fare',
      badge: 'Info Needed',
      badgeColor: 'ff-pill-warn',
      data: (): FlightCase => ({
        airline: 'SpiceJet', flightNumber: 'SG-184',
        origin: getAirportByIata('DEL'), destination: getAirportByIata('GOI'),
        flightDate: new Date().toISOString().split('T')[0],
        disruptionType: 'cancelled', delayHours: 0, delayMinutes: 0,
        airlineReason: 'Commercial / operational consolidation',
        informedWindow: 'less_than_24h', alternateOffered: 'none',
        totalTicketPrice: undefined, basicFare: undefined, fuelCharge: undefined,
        scheduledBlockTimeHours: undefined, alternateArrangedTime: 'none',
        passengerDeclinedAlternate: false, missedConnectionDelayHours: 0,
        singleTicketBooking: true, passengerName: 'Aarav Mehta',
        passengerEmail: 'aarav.mehta@example.com', passengerPhone: '+91 99887 76655',
        bookingReference: 'SG821M'
      })
    },
    {
      id: 'test-case-4',
      title: 'LHR → CDG',
      sub: 'EU261 €250',
      badge: 'UK/EU',
      badgeColor: 'ff-pill-info',
      data: (): FlightCase => ({
        airline: 'British Airways', flightNumber: 'BA-308',
        origin: getAirportByIata('LHR'), destination: getAirportByIata('CDG'),
        flightDate: new Date().toISOString().split('T')[0],
        disruptionType: 'delayed', delayHours: 3, delayMinutes: 45,
        airlineReason: 'Crew scheduling shortage',
        informedWindow: 'at_airport', alternateOffered: 'none',
        totalTicketPrice: 160, basicFare: 120, fuelCharge: 40,
        scheduledBlockTimeHours: 1.3, alternateArrangedTime: 'none',
        passengerDeclinedAlternate: false, missedConnectionDelayHours: 0,
        singleTicketBooking: true, passengerName: 'James Wilson',
        passengerEmail: 'james.wilson@example.com', passengerPhone: '+44 7700 900077',
        bookingReference: 'BA719Q'
      })
    },
    {
      id: 'test-case-5',
      title: 'BLR → HYD',
      sub: 'Denied Boarding',
      badge: 'Overbook',
      badgeColor: 'ff-pill-neutral',
      data: (): FlightCase => ({
        airline: 'IndiGo', flightNumber: '6E-419',
        origin: getAirportByIata('BLR'), destination: getAirportByIata('HYD'),
        flightDate: new Date().toISOString().split('T')[0],
        disruptionType: 'denied_boarding', delayHours: 0, delayMinutes: 0,
        airlineReason: 'Aircraft overbooking and capacity restriction',
        informedWindow: 'at_airport', alternateOffered: 'none',
        totalTicketPrice: 5450, basicFare: 4500, fuelCharge: 950,
        scheduledBlockTimeHours: 1.1, alternateArrangedTime: 'after_24h',
        passengerDeclinedAlternate: true, missedConnectionDelayHours: 0,
        singleTicketBooking: true, passengerName: 'Ananya Roy',
        passengerEmail: 'ananya.roy@example.com', passengerPhone: '+91 98450 12345',
        bookingReference: '6E499X'
      })
    },
  ];

  return (
    <div id="quick-test-scenarios" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap style={{ width: 13, height: 13, color: 'var(--amber)', flexShrink: 0 }} />
          <span className="ff-label">Quick Scenarios</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }} className="hidden sm:inline">Select to instantly test calculations</span>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
        {testCases.map((tc) => (
          <button
            key={tc.id}
            id={tc.id}
            type="button"
            onClick={() => onApplyCase(tc.data(), `${tc.title} ${tc.sub}`)}
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 3,
              padding: '10px 14px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.80)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'background 160ms, box-shadow 160ms, transform 140ms',
              boxShadow: '0 1px 8px rgba(23,32,51,0.05)',
              minWidth: 110,
              minHeight: 44,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(23,32,51,0.10)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.75)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 8px rgba(23,32,51,0.05)';
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{tc.title}</span>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{tc.sub}</span>
            <span className={`ff-pill ${tc.badgeColor}`} style={{ marginTop: 2, padding: '2px 7px', fontSize: 10 }}>{tc.badge}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
