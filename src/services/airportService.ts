import { Airport } from '../types';
import { FALLBACK_AIRPORTS } from '../data/fallbackAirports';

// In-memory cache for search queries
const searchCache = new Map<string, Airport[]>();

/**
 * Searches for airports matching a given query string (IATA, city, airport name, or country).
 * Attempts to call the server API or falls back gracefully to the embedded local database.
 */
export async function searchAirports(query: string): Promise<Airport[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // Check cache first
  if (searchCache.has(cleanQuery)) {
    return searchCache.get(cleanQuery)!;
  }

  // 1. Local search algorithm for instant, reliable zero-latency results
  const localResults = queryLocalAirports(cleanQuery);

  // 2. If available and online, attempt to fetch from backend proxy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout max

    const response = await fetch(`/api/airports?q=${encodeURIComponent(cleanQuery)}`, {
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response && response.ok) {
      const data: Airport[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Merge with local results, deduplicating by IATA
        const merged = deduplicateAirports([...data, ...localResults]);
        searchCache.set(cleanQuery, merged);
        return merged;
      }
    }
  } catch {
    // Network or API error: silently fallback to local dataset
  }

  // Cache and return local results
  searchCache.set(cleanQuery, localResults);
  return localResults;
}

function queryLocalAirports(query: string): Airport[] {
  const upper = query.toUpperCase();

  // Exact IATA match gets highest priority
  const exactIata = FALLBACK_AIRPORTS.filter(a => a.iata.toUpperCase() === upper);
  
  // Starts-with IATA match
  const startsIata = FALLBACK_AIRPORTS.filter(
    a => a.iata.toUpperCase().startsWith(upper) && a.iata.toUpperCase() !== upper
  );

  // City match
  const cityMatches = FALLBACK_AIRPORTS.filter(
    a => a.city.toLowerCase().includes(query) && !exactIata.includes(a) && !startsIata.includes(a)
  );

  // Name or Country match
  const otherMatches = FALLBACK_AIRPORTS.filter(
    a => (a.name.toLowerCase().includes(query) || a.country.toLowerCase().includes(query)) &&
         !exactIata.includes(a) &&
         !startsIata.includes(a) &&
         !cityMatches.includes(a)
  );

  return [...exactIata, ...startsIata, ...cityMatches, ...otherMatches];
}

function deduplicateAirports(airports: Airport[]): Airport[] {
  const seen = new Set<string>();
  return airports.filter(a => {
    if (!a.iata) return false;
    const key = a.iata.toUpperCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Find airport by exact IATA code
 */
export function getAirportByIata(iata: string): Airport | null {
  if (!iata) return null;
  const upper = iata.trim().toUpperCase();
  return FALLBACK_AIRPORTS.find(a => a.iata.toUpperCase() === upper) || null;
}
