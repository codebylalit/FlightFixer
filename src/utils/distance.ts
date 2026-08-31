import { Airport } from '../types';

/**
 * Calculates the great-circle distance between two airports using the Haversine formula.
 * @returns distance in kilometers rounded to the nearest integer, or null if coordinates are missing.
 */
export function calculateHaversineDistance(origin: Airport | null, destination: Airport | null): number | null {
  if (!origin || !destination) return null;
  if (typeof origin.lat !== 'number' || typeof origin.lon !== 'number') return null;
  if (typeof destination.lat !== 'number' || typeof destination.lon !== 'number') return null;
  
  if (origin.iata === destination.iata) return 0;

  const R = 6371; // Earth's mean radius in km
  const lat1Rad = (origin.lat * Math.PI) / 180;
  const lon1Rad = (origin.lon * Math.PI) / 180;
  const lat2Rad = (destination.lat * Math.PI) / 180;
  const lon2Rad = (destination.lon * Math.PI) / 180;

  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

/**
 * Formats a route distance into a clear display string.
 * e.g., "Approx. 446 km" or "Approx. 1,148 km"
 */
export function formatDistanceString(distanceKm: number | null): string {
  if (distanceKm === null) return 'Distance pending airport selection';
  if (distanceKm === 0) return 'Same origin & destination';
  return `Approx. ${distanceKm.toLocaleString('en-US')} km`;
}
