import React, { useState, useEffect, useRef } from 'react';
import { Search, Plane, MapPin, X, Loader2 } from 'lucide-react';
import { Airport } from '../types';
import { searchAirports } from '../services/airportService';

interface AirportSearchProps {
  id: string;
  label: string;
  placeholder?: string;
  selectedAirport: Airport | null;
  onSelectAirport: (airport: Airport | null) => void;
  error?: string;
}

export const AirportSearch: React.FC<AirportSearchProps> = ({
  id,
  label,
  placeholder = 'Type city (e.g. Mumbai, Delhi) or IATA (BOM, DEL)',
  selectedAirport,
  onSelectAirport,
  error,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const found = await searchAirports(query);
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport: Airport) => {
    onSelectAirport(airport);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectAirport(null);
    setQuery('');
  };

  return (
    <div id={`${id}-container`} className="relative w-full" ref={containerRef}>
      <label htmlFor={id} className="ff-label-field">
        {label}
      </label>

      {selectedAirport ? (
        <div
          id={`${id}-selected-card`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 12px', borderRadius: 11,
            background: 'rgba(201,221,234,0.22)',
            border: '1px solid rgba(157,189,212,0.30)',
            boxShadow: '0 1px 4px rgba(23,32,51,0.04)',
            minHeight: 44,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: 9,
              background: 'var(--navy)', color: '#F9F7F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
            }}>
              {selectedAirport.iata}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedAirport.city} ({selectedAirport.iata})
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedAirport.name} · {selectedAirport.country}
              </div>
            </div>
          </div>
          <button
            id={`${id}-clear-btn`}
            type="button"
            onClick={handleClear}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 7, border: 'none',
              background: 'rgba(148,163,184,0.14)', color: 'var(--text-2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 140ms',
            }}
            title="Clear selected airport"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }}>
            <Search style={{ width: 13, height: 13 }} />
          </div>
          <input
            id={id}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="ff-input"
            style={{
              paddingLeft: 30, paddingRight: 30, minHeight: 42,
              borderColor: error ? '#ef9a9a' : undefined,
              boxShadow: error ? '0 0 0 3px rgba(239,154,154,0.18)' : undefined,
            }}
          />
          {isLoading && (
            <div style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Loader2 style={{ width: 13, height: 13, color: 'var(--text-2)', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}

      {/* Dropdown Results */}
      {isOpen && !selectedAirport && (
        <div
          id={`${id}-dropdown`}
          style={{
            position: 'absolute', zIndex: 50, top: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'rgba(249,247,242,0.97)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.70)',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(23,32,51,0.12)',
            maxHeight: 240, overflowY: 'auto',
          }}
        >
          {results.length > 0 ? (
            results.map((airport) => (
              <button
                key={airport.iata + airport.name}
                id={`${id}-option-${airport.iata}`}
                type="button"
                onClick={() => handleSelect(airport)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px', minHeight: 44,
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(148,163,184,0.10)',
                  transition: 'background 130ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,221,234,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ minWidth: 0, paddingRight: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--text)' }}>{airport.city}</span>
                    <span style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 5,
                      background: 'rgba(30,41,59,0.08)', color: 'var(--text-2)',
                      fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                    }}>{airport.iata}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{airport.name}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{airport.country}</div>
              </button>
            ))
          ) : query.trim().length > 0 && !isLoading ? (
            <div style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, color: 'var(--text-2)' }}>
              No airports found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div style={{ padding: '10px 14px', fontSize: 11.5, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <MapPin style={{ width: 12, height: 12, color: 'var(--text-3)' }} />
              Search by city name (e.g. &ldquo;Mumbai&rdquo;) or IATA code (&ldquo;BOM&rdquo;)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
