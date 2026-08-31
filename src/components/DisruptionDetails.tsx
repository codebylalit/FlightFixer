import React from 'react';
import { Clock, Ban, UserX, GitFork, AlertCircle, Info } from 'lucide-react';
import { FlightCase, DisruptionType } from '../types';

interface DisruptionDetailsProps {
  flightCase: FlightCase;
  onChange: (updatedFields: Partial<FlightCase>) => void;
  currencyCode: 'INR' | 'EUR' | 'GBP' | 'USD';
}

export const DisruptionDetails: React.FC<DisruptionDetailsProps> = ({
  flightCase,
  onChange,
  currencyCode = 'INR'
}) => {
  const currencySymbol = currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : currencyCode === 'USD' ? '$' : '₹';

  const disruptionTypes: { type: DisruptionType; label: string; icon: any; desc: string }[] = [
    { type: 'delayed', label: 'Flight Delayed', icon: Clock, desc: 'Delayed departure or late arrival at destination' },
    { type: 'cancelled', label: 'Flight Cancelled', icon: Ban, desc: 'Flight called off before or on day of travel' },
    { type: 'denied_boarding', label: 'Denied Boarding', icon: UserX, desc: 'Overbooking / involuntary bumped from flight' },
    { type: 'missed_connection', label: 'Missed Connection', icon: GitFork, desc: 'First flight delay caused missed onward flight' },
  ];

  return (
    <div id="disruption-details-section" className="space-y-4">
      {/* Disruption Type Selector */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Step 2: What Happened?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {disruptionTypes.map(({ type, label, icon: Icon }) => {
            const isSelected = flightCase.disruptionType === type;
            return (
              <button
                key={type}
                id={`disruption-type-${type}`}
                type="button"
                onClick={() => onChange({ disruptionType: type })}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className={`p-1.5 rounded-md ${isSelected ? 'bg-white/15 text-white' : 'bg-white border border-slate-200/80 text-slate-600'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC FORM FIELDS */}
      
      {/* 1. DELAY FIELDS */}
      {flightCase.disruptionType === 'delayed' && (
        <div id="delay-fields" className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-700" />
              Delay Information
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="delay-hours" className="block text-[11px] font-medium text-slate-600 mb-1">
                Delay Hours
              </label>
              <input
                id="delay-hours"
                type="number"
                min="0"
                max="72"
                value={flightCase.delayHours}
                onChange={(e) => onChange({ delayHours: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="delay-minutes" className="block text-[11px] font-medium text-slate-600 mb-1">
                Delay Minutes
              </label>
              <input
                id="delay-minutes"
                type="number"
                min="0"
                max="59"
                value={flightCase.delayMinutes}
                onChange={(e) => onChange({ delayMinutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="airline-delay-reason" className="block text-[11px] font-medium text-slate-600 mb-1">
              Airline Explanation (if given)
            </label>
            <input
              id="airline-delay-reason"
              type="text"
              placeholder="e.g. Operational reasons, Technical snag, Weather, Crew shortage"
              value={flightCase.airlineReason}
              onChange={(e) => onChange({ airlineReason: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
            />
          </div>
        </div>
      )}

      {/* 2. CANCELLATION FIELDS */}
      {flightCase.disruptionType === 'cancelled' && (
        <div id="cancellation-fields" className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-600" />
              Cancellation Details
            </span>
          </div>

          <div>
            <label htmlFor="cancellation-notice" className="block text-[11px] font-medium text-slate-600 mb-1">
              When were you informed of the cancellation?
            </label>
            <select
              id="cancellation-notice"
              value={flightCase.informedWindow}
              onChange={(e) => onChange({ informedWindow: e.target.value as FlightCase['informedWindow'] })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors cursor-pointer"
            >
              <option value="at_airport">At the airport / Day of departure</option>
              <option value="less_than_24h">Less than 24 hours prior</option>
              <option value="24h_to_2w">Between 24 hours and 2 weeks prior</option>
              <option value="more_than_2w">More than 2 weeks prior</option>
            </select>
          </div>

          <div>
            <label htmlFor="alternate-offered" className="block text-[11px] font-medium text-slate-600 mb-1">
              Was an alternative flight offered by the airline?
            </label>
            <select
              id="alternate-offered"
              value={flightCase.alternateOffered}
              onChange={(e) => onChange({ alternateOffered: e.target.value as FlightCase['alternateOffered'] })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors cursor-pointer"
            >
              <option value="none">No alternative flight offered</option>
              <option value="within_2h">Yes, departing within 2 hours of scheduled time</option>
              <option value="within_6h">Yes, departing within 6 hours of scheduled time</option>
              <option value="next_day">Yes, departing the next day</option>
              <option value="refund_only">Only refund offered</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div>
              <label htmlFor="block-time" className="block text-[11px] font-medium text-slate-600 mb-1">
                Block Time (hrs)
              </label>
              <input
                id="block-time"
                type="number"
                step="0.1"
                min="0.5"
                placeholder="e.g. 1.5"
                value={flightCase.scheduledBlockTimeHours !== undefined ? flightCase.scheduledBlockTimeHours : ''}
                onChange={(e) => onChange({ scheduledBlockTimeHours: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="basic-fare" className="block text-[11px] font-medium text-slate-600 mb-1">
                Basic Fare ({currencySymbol})
              </label>
              <input
                id="basic-fare"
                type="number"
                min="0"
                placeholder="e.g. 4500"
                value={flightCase.basicFare !== undefined ? flightCase.basicFare : ''}
                onChange={(e) => onChange({ basicFare: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="fuel-charge" className="block text-[11px] font-medium text-slate-600 mb-1">
                Fuel Charge (YQ/YR)
              </label>
              <input
                id="fuel-charge"
                type="number"
                min="0"
                placeholder="e.g. 800"
                value={flightCase.fuelCharge !== undefined ? flightCase.fuelCharge : ''}
                onChange={(e) => onChange({ fuelCharge: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Important Regulatory Callout */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-900 text-xs">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note on Fare:</strong> Under DGCA CAR rules, compensation is calculated against <strong>Booked Basic Fare + Airline Fuel Charge</strong>, which excludes government taxes (such as UDF/PSF).
            </span>
          </div>
        </div>
      )}

      {/* 3. DENIED BOARDING FIELDS */}
      {flightCase.disruptionType === 'denied_boarding' && (
        <div id="denied-boarding-fields" className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-amber-600" />
              Denied Boarding Details
            </span>
          </div>

          <div>
            <label htmlFor="alternate-arranged-time" className="block text-[11px] font-medium text-slate-600 mb-1">
              Alternative Flight Timing Arranged by Airline
            </label>
            <select
              id="alternate-arranged-time"
              value={flightCase.alternateArrangedTime}
              onChange={(e) => onChange({ alternateArrangedTime: e.target.value as FlightCase['alternateArrangedTime'] })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors cursor-pointer"
            >
              <option value="none">No alternative flight arranged</option>
              <option value="within_1h">Departed within 1 hour of scheduled time (No compensation)</option>
              <option value="within_24h">Departed within 24 hours of scheduled time (200% up to ₹10k)</option>
              <option value="after_24h">Departed after 24 hours / Not accepted (400% up to ₹20k)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="declined-alternate-toggle"
              type="checkbox"
              checked={flightCase.passengerDeclinedAlternate}
              onChange={(e) => onChange({ passengerDeclinedAlternate: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer"
            />
            <label htmlFor="declined-alternate-toggle" className="text-xs text-slate-700 cursor-pointer">
              Passenger chose not to opt for alternate flight (demanded full refund)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="db-basic-fare" className="block text-[11px] font-medium text-slate-600 mb-1">
                Basic Fare ({currencySymbol})
              </label>
              <input
                id="db-basic-fare"
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={flightCase.basicFare !== undefined ? flightCase.basicFare : ''}
                onChange={(e) => onChange({ basicFare: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="db-fuel-charge" className="block text-[11px] font-medium text-slate-600 mb-1">
                Fuel Charge (YQ/YR)
              </label>
              <input
                id="db-fuel-charge"
                type="number"
                min="0"
                placeholder="e.g. 950"
                value={flightCase.fuelCharge !== undefined ? flightCase.fuelCharge : ''}
                onChange={(e) => onChange({ fuelCharge: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. MISSED CONNECTION FIELDS */}
      {flightCase.disruptionType === 'missed_connection' && (
        <div id="missed-connection-fields" className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-slate-700" />
              Missed Connection Details
            </span>
          </div>

          <div>
            <label htmlFor="connection-delay-hours" className="block text-[11px] font-medium text-slate-600 mb-1">
              Final Delay at Destination (Hours)
            </label>
            <input
              id="connection-delay-hours"
              type="number"
              min="0"
              placeholder="e.g. 5"
              value={flightCase.missedConnectionDelayHours}
              onChange={(e) => onChange({ missedConnectionDelayHours: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="single-ticket-toggle"
              type="checkbox"
              checked={flightCase.singleTicketBooking}
              onChange={(e) => onChange({ singleTicketBooking: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer"
            />
            <label htmlFor="single-ticket-toggle" className="text-xs text-slate-700 cursor-pointer">
              Single Booking / Through Ticket (Same PNR with connected baggage)
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
