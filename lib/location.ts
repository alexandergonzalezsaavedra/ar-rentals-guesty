import { toStoredDate } from '@/lib/dates';
import { hasConsent, writeLocation, type VisitorLocation } from '@/lib/storage';

const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

/**
 * Asks the browser for the visitor's position and turns it into a city,
 * region and country (BigDataCloud's free client-side reverse geocoding, no
 * key needed). Only runs with location consent; the result is saved to
 * storage and also returned. Resolves to null if the visitor or the browser
 * says no, or after 15 seconds.
 */
export async function requestVisitorLocation(): Promise<VisitorLocation | null> {
  if (typeof window === 'undefined' || !navigator.geolocation || !hasConsent('location')) {
    return null;
  }

  try {
    const permission = await navigator.permissions?.query({ name: 'geolocation' });

    if (permission?.state === 'denied') {
      return null;
    }
  } catch {
    // Permissions API unavailable (older Safari): just ask.
  }

  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 10 * 60 * 1000,
    });
  });

  if (!position) {
    return null;
  }

  const { latitude, longitude, accuracy } = position.coords;
  const location: VisitorLocation = {
    latitude,
    longitude,
    accuracy: Math.round(accuracy),
    city: '',
    region: '',
    country: '',
    obtainedAt: toStoredDate(),
  };

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      localityLanguage: 'es',
    });
    const response = await fetch(`${REVERSE_GEOCODE_URL}?${params.toString()}`);
    const data = (await response.json()) as { city?: string; locality?: string; principalSubdivision?: string; countryName?: string };

    location.city = data.city || data.locality || '';
    location.region = data.principalSubdivision || '';
    location.country = data.countryName || '';
  } catch {
    // Coordinates alone are still useful; the place names stay empty.
  }

  writeLocation(location);
  return location;
}
