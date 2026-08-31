import React from 'react';
import { Clock, Ban, UserX, GitFork, HelpCircle } from 'lucide-react';
import { FlightCase, DisruptionType } from '../types';

interface DisruptionDetailsProps {
  flightCase: FlightCase;
  onChange: (updatedFields: Partial<FlightCase>) => void;
  currencyCode: 'INR' | 'EUR' | 'GBP' | 'USD';
}

const TicketPriceField: React.FC<{
  id: string;
  currencyCode: string;
  value: number | undefined;
  onChange: (val: number | undefined) => void;
}> = ({ id, currencyCode, value, onChange }) => {
  const symbol = currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : currencyCode === 'USD' ? '$' : '₹';
  return (
    <div>
      <label htmlFor={id} className="ff-label-field">How much did you pay for this ticket?</label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          fontSize: 13, fontWeight: 600, color: 'var(--text-2)', pointerEvents: 'none',
        }}>{symbol}</span>
        <input
          id={id} type="number" min="0" step="1" placeholder="e.g. 4500"
          value={value !== undefined ? value : ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="ff-input"
          style={{ paddingLeft: 26 }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11, color: 'var(--text-3)' }}>
        <HelpCircle style={{ width: 11, height: 11, flexShrink: 0 }} />
        Check your booking confirmation — total amount including all charges
      </div>
    </div>
  );
};

export const DisruptionDetails: React.FC<DisruptionDetailsProps> = ({
  flightCase, onChange, currencyCode = 'INR'
}) => {
  const disruptionTypes: { type: DisruptionType; label: string; icon: any; desc: string }[] = [
    { type: 'delayed',          label: 'Flight Delayed',    icon: Clock,   desc: 'Late departure or arrival' },
    { type: 'cancelled',        label: 'Flight Cancelled',  icon: Ban,     desc: 'Flight called off' },
    { type: 'denied_boarding',  label: 'Denied Boarding',   icon: UserX,   desc: 'Bumped due to overbooking' },
    { type: 'missed_connection',label: 'Missed Connection', icon: GitFork, desc: 'Missed a connecting flight' },
  ];

  const handleTicketPriceChange = (total: number | undefined) => {
    if (total !== undefined) {
      onChange({ totalTicketPrice: total, basicFare: Math.round(total * 0.75), fuelCharge: Math.round(total * 0.25) });
    } else {
      onChange({ totalTicketPrice: undefined, basicFare: undefined, fuelCharge: undefined });
    }
  };

  const sectionStyle: React.CSSProperties = {
    padding: '14px 15px',
    borderRadius: 16,
    background: 'rgba(238,243,247,0.65)',
    border: '1px solid rgba(148,163,184,0.16)',
    display: 'flex', flexDirection: 'column', gap: 12,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 12, fontWeight: 700, color: 'var(--text)',
  };

  const iconWrapStyle = (active: boolean): React.CSSProperties => ({
    width: 24, height: 24, borderRadius: 7, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: active ? 'rgba(255,255,255,0.20)' : 'rgba(201,221,234,0.30)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: active ? '#F9F7F2' : 'var(--text-2)',
  });

  return (
    <div id="disruption-details-section" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Type selector */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          What happened?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {disruptionTypes.map(({ type, label, icon: Icon, desc }) => {
            const isActive = flightCase.disruptionType === type;
            return (
              <button
                key={type}
                id={`disruption-type-${type}`}
                type="button"
                onClick={() => onChange({ disruptionType: type })}
                title={desc}
                className={`ff-disruption-btn ${isActive ? 'active' : ''}`}
              >
                <div style={iconWrapStyle(isActive)}>
                  <Icon style={{ width: 12, height: 12 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Delayed ─────────────────────────────── */}
      {flightCase.disruptionType === 'delayed' && (
        <div id="delay-fields" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(157,189,212,0.25)', border: '1px solid rgba(157,189,212,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: 12, height: 12, color: 'var(--sky)' }} />
            </div>
            Delay Details
          </div>

          <div>
            <label className="ff-label-field">How long was the delay?</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <input id="delay-hours" type="number" min="0" max="72" value={flightCase.delayHours}
                  onChange={(e) => onChange({ delayHours: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="ff-input" style={{ paddingRight: 36 }} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-3)', pointerEvents: 'none' }}>hrs</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input id="delay-minutes" type="number" min="0" max="59" value={flightCase.delayMinutes}
                  onChange={(e) => onChange({ delayMinutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
                  className="ff-input" style={{ paddingRight: 36 }} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-3)', pointerEvents: 'none' }}>min</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="airline-delay-reason" className="ff-label-field">
              Airline reason given? <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input id="airline-delay-reason" type="text" placeholder="e.g. Operational reasons, Technical issue, Weather"
              value={flightCase.airlineReason} onChange={(e) => onChange({ airlineReason: e.target.value })}
              className="ff-input" />
          </div>
        </div>
      )}

      {/* ── Cancelled ─────────────────────────── */}
      {flightCase.disruptionType === 'cancelled' && (
        <div id="cancellation-fields" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(229,115,115,0.12)', border: '1px solid rgba(229,115,115,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ban style={{ width: 12, height: 12, color: '#c0392b' }} />
            </div>
            Cancellation Details
          </div>

          <div>
            <label htmlFor="cancellation-notice" className="ff-label-field">When did the airline tell you?</label>
            <select id="cancellation-notice" value={flightCase.informedWindow}
              onChange={(e) => onChange({ informedWindow: e.target.value as FlightCase['informedWindow'] })}
              className="ff-select">
              <option value="at_airport">At the airport / on the day of travel</option>
              <option value="less_than_24h">Less than 24 hours before departure</option>
              <option value="24h_to_2w">1 to 14 days before departure</option>
              <option value="more_than_2w">More than 2 weeks before departure</option>
            </select>
          </div>

          <div>
            <label htmlFor="alternate-offered" className="ff-label-field">Did they offer another flight?</label>
            <select id="alternate-offered" value={flightCase.alternateOffered}
              onChange={(e) => onChange({ alternateOffered: e.target.value as FlightCase['alternateOffered'] })}
              className="ff-select">
              <option value="none">No — nothing was offered</option>
              <option value="within_2h">Yes — within 2 hours of original time</option>
              <option value="within_6h">Yes — within 6 hours of original time</option>
              <option value="next_day">Yes — departing the next day or later</option>
              <option value="refund_only">Only a refund was offered</option>
            </select>
          </div>

          <TicketPriceField id="cancellation-ticket-price" currencyCode={currencyCode}
            value={flightCase.totalTicketPrice} onChange={handleTicketPriceChange} />
        </div>
      )}

      {/* ── Denied Boarding ───────────────────── */}
      {flightCase.disruptionType === 'denied_boarding' && (
        <div id="denied-boarding-fields" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(230,184,106,0.18)', border: '1px solid rgba(230,184,106,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX style={{ width: 12, height: 12, color: '#9a6e1a' }} />
            </div>
            Denied Boarding Details
          </div>

          <div>
            <label htmlFor="alternate-arranged-time" className="ff-label-field">Did they put you on another flight?</label>
            <select id="alternate-arranged-time" value={flightCase.alternateArrangedTime}
              onChange={(e) => onChange({ alternateArrangedTime: e.target.value as FlightCase['alternateArrangedTime'] })}
              className="ff-select">
              <option value="none">No — no alternative arranged</option>
              <option value="within_1h">Yes — within 1 hour of original time</option>
              <option value="within_24h">Yes — within the same day</option>
              <option value="after_24h">Yes — more than 24 hours later</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
            <input id="declined-alternate-toggle" type="checkbox" checked={flightCase.passengerDeclinedAlternate}
              onChange={(e) => onChange({ passengerDeclinedAlternate: e.target.checked })}
              className="ff-checkbox" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
              I chose not to take the alternative flight and requested a full refund
            </span>
          </label>

          <TicketPriceField id="db-ticket-price" currencyCode={currencyCode}
            value={flightCase.totalTicketPrice} onChange={handleTicketPriceChange} />
        </div>
      )}

      {/* ── Missed Connection ─────────────────── */}
      {flightCase.disruptionType === 'missed_connection' && (
        <div id="missed-connection-fields" style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(157,189,212,0.20)', border: '1px solid rgba(157,189,212,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitFork style={{ width: 12, height: 12, color: 'var(--sky)' }} />
            </div>
            Missed Connection
          </div>

          <div>
            <label htmlFor="connection-delay-hours" className="ff-label-field">
              How many hours late did you arrive at your final destination?
            </label>
            <div style={{ position: 'relative' }}>
              <input id="connection-delay-hours" type="number" min="0" placeholder="e.g. 5"
                value={flightCase.missedConnectionDelayHours}
                onChange={(e) => onChange({ missedConnectionDelayHours: parseInt(e.target.value) || 0 })}
                className="ff-input" style={{ paddingRight: 50 }} />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-3)', pointerEvents: 'none' }}>hours</span>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
            <input id="single-ticket-toggle" type="checkbox" checked={flightCase.singleTicketBooking}
              onChange={(e) => onChange({ singleTicketBooking: e.target.checked })}
              className="ff-checkbox" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
              Both flights were on the same booking / one ticket (same booking reference)
            </span>
          </label>
        </div>
      )}
    </div>
  );
};
