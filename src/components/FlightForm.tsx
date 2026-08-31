import React from 'react';
import { Calendar, Hash, ArrowRight, User, Mail, ShieldCheck } from 'lucide-react';
import { FlightCase, Airport } from '../types';
import { AirportSearch } from './AirportSearch';
import { DisruptionDetails } from './DisruptionDetails';
import { calculateHaversineDistance, formatDistanceString } from '../utils/distance';

interface FlightFormProps {
  flightCase: FlightCase;
  onChange: (updated: Partial<FlightCase>) => void;
  currencyCode: 'INR' | 'EUR' | 'GBP' | 'USD';
}

export const FlightForm: React.FC<FlightFormProps> = ({ flightCase, onChange, currencyCode }) => {
  const distanceKm = calculateHaversineDistance(flightCase.origin, flightCase.destination);
  const formattedDistance = formatDistanceString(distanceKm);
  const isSameAirport = flightCase.origin && flightCase.destination &&
    flightCase.origin.iata === flightCase.destination.iata;

  const popularAirlines = [
    'IndiGo', 'Air India', 'SpiceJet', 'Akasa Air', 'Air India Express',
    'British Airways', 'Lufthansa', 'Emirates', 'Singapore Airlines'
  ];

  return (
    <div id="flight-case-form" className="ff-card" style={{ padding: '22px 22px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 3 }}>
          Your Flight
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
          Enter your details — we'll look up the rest.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Airline + Flight Number */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="ff-label-field">Airline</label>
            <input
              id="airline-input"
              type="text"
              list="airlines-datalist"
              placeholder="e.g. IndiGo"
              value={flightCase.airline}
              onChange={(e) => onChange({ airline: e.target.value })}
              className="ff-input"
            />
            <datalist id="airlines-datalist">
              {popularAirlines.map(a => <option key={a} value={a} />)}
            </datalist>
          </div>
          <div>
            <label className="ff-label-field">Flight Number</label>
            <div style={{ position: 'relative' }}>
              <Hash style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text-3)', pointerEvents: 'none' }} />
              <input
                id="flight-number-input"
                type="text"
                placeholder="6E-204"
                value={flightCase.flightNumber}
                onChange={(e) => onChange({ flightNumber: e.target.value.toUpperCase() })}
                className="ff-input"
                style={{ paddingLeft: 30, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}
              />
            </div>
          </div>
        </div>

        {/* Origin → Destination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AirportSearch
            id="origin-airport"
            label="Departure Airport"
            placeholder="Search city or IATA (e.g. Delhi, DEL)"
            selectedAirport={flightCase.origin}
            onSelectAirport={(airport) => onChange({ origin: airport })}
          />
          <AirportSearch
            id="destination-airport"
            label="Arrival Airport"
            placeholder="Search city or IATA (e.g. Mumbai, BOM)"
            selectedAirport={flightCase.destination}
            onSelectAirport={(airport) => onChange({ destination: airport })}
            error={isSameAirport ? 'Origin and destination cannot be the same.' : undefined}
          />
        </div>

        {/* Route distance pill */}
        {flightCase.origin && flightCase.destination && !isSameAirport && (
          <div
            id="route-distance-badge"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(201,221,234,0.22)',
              border: '1px solid rgba(157,189,212,0.28)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
              <span>{flightCase.origin.city} ({flightCase.origin.iata})</span>
              <ArrowRight style={{ width: 13, height: 13, color: 'var(--sky)', flexShrink: 0 }} />
              <span>{flightCase.destination.city} ({flightCase.destination.iata})</span>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>
              {formattedDistance}
            </span>
          </div>
        )}

        {/* Date */}
        <div>
          <label htmlFor="flight-date-input" className="ff-label-field">Flight Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input
              id="flight-date-input"
              type="date"
              value={flightCase.flightDate}
              onChange={(e) => onChange({ flightDate: e.target.value })}
              className="ff-input"
              style={{ paddingLeft: 30 }}
            />
          </div>
        </div>

        {/* Disruption */}
        <DisruptionDetails flightCase={flightCase} onChange={onChange} currencyCode={currencyCode} />

        {/* Passenger details divider */}
        <div style={{ paddingTop: 4, borderTop: '1px solid rgba(148,163,184,0.15)' }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Your Details
            </span>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>For your personalised claim letter</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label htmlFor="passenger-name" className="ff-label-field">Your Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text-3)', pointerEvents: 'none' }} />
                  <input id="passenger-name" type="text" placeholder="e.g. Rahul Sharma" value={flightCase.passengerName}
                    onChange={(e) => onChange({ passengerName: e.target.value })} className="ff-input" style={{ paddingLeft: 30 }} />
                </div>
              </div>
              <div>
                <label htmlFor="booking-reference-pnr" className="ff-label-field">Booking Reference</label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text-3)', pointerEvents: 'none' }} />
                  <input id="booking-reference-pnr" type="text" placeholder="e.g. 6E9K2A" value={flightCase.bookingReference}
                    onChange={(e) => onChange({ bookingReference: e.target.value.toUpperCase() })} className="ff-input"
                    style={{ paddingLeft: 30, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }} />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="passenger-email" className="ff-label-field">Your Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text-3)', pointerEvents: 'none' }} />
                <input id="passenger-email" type="email" placeholder="e.g. rahul@gmail.com" value={flightCase.passengerEmail}
                  onChange={(e) => onChange({ passengerEmail: e.target.value })} className="ff-input" style={{ paddingLeft: 30 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
