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
      <label htmlFor={id} className="block text-[11px] font-medium text-slate-600 mb-1">
        {label}
      </label>

      {selectedAirport ? (
        <div
          id={`${id}-selected-card`}
          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-slate-200/80 border border-slate-300/60 flex items-center justify-center text-slate-900 font-bold text-xs font-mono">
              {selectedAirport.iata}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                {selectedAirport.city} ({selectedAirport.iata})
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {selectedAirport.name} · {selectedAirport.country}
              </div>
            </div>
          </div>
          <button
            id={`${id}-clear-btn`}
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
            title="Clear selected airport"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id={id}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full pl-9 pr-8 py-2 bg-slate-50/60 border ${
              error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-800'
            } rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors`}
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}

      {/* Dropdown Results */}
      {isOpen && !selectedAirport && (
        <div
          id={`${id}-dropdown`}
          className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100"
        >
          {results.length > 0 ? (
            results.map((airport) => (
              <button
                key={airport.iata + airport.name}
                id={`${id}-option-${airport.iata}`}
                type="button"
                onClick={() => handleSelect(airport)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                      {airport.city}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono font-medium">
                      {airport.iata}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{airport.name}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] text-slate-400 block">{airport.country}</span>
                </div>
              </button>
            ))
          ) : query.trim().length > 0 && !isLoading ? (
            <div className="px-4 py-3 text-center text-xs text-slate-500">
              No matching airports found for "{query}".
            </div>
          ) : (
            <div className="px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Search by city name (e.g. "Mumbai") or 3-letter IATA ("BOM")</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
