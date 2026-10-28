import { fromStoredDate, msSince, toStoredDate } from '@/lib/dates';
import {
  hasConsent,
  newSessionId,
  readStorage,
  toStoredProperty,
  updateStorage,
  writeDevice,
  type DeviceInfo,
  type MostViewedEntry,
  type UtmField,
} from '@/lib/storage';

// Records what the visitor does into the single storage object, so it can
// later be sent to a database. Every function checks consent itself:
//   - personalization (always on, see REQUIRED_CATEGORIES): properties viewed (masVistos)
//   - adTracking: devices and campaign (UTM) parameters
// Visits and the device / session ids are always kept: counters and random
// ids, nothing about the person.

/** A new visit (and session) starts after this long without activity. */
const VISIT_GAP_MS = 30 * 60 * 1000;
/** Properties viewed: one entry each. */
const MAX_PROPERTIES = 100;

/** URL parameter → stored field. The origin media code is kept under both names it is reported with. */
const UTM_PARAMS: [param: string, fields: UtmField[]][] = [
  ['utm_source', ['utmSource']],
  ['utm_medium', ['utmMedium']],
  ['utm_campaign', ['utmCampaign']],
  ['utm_term', ['utmTerm']],
  ['utm_content', ['utmContent']],
  ['utm_origin_media', ['originMedia', 'utm_origin_media']],
];

function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/SamsungBrowser/.test(ua)) return 'Samsung Internet';
  if (/Firefox|FxiOS/.test(ua)) return 'Firefox';
  if (/Chrome|CriOS/.test(ua)) return 'Chrome';
  if (/Safari/.test(ua)) return 'Safari';
  return 'Otro';
}

function detectOs(ua: string): string {
  if (/Windows/.test(ua)) return 'Windows';
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Otro';
}

function readDevice(): DeviceInfo {
  const ua = navigator.userAgent;

  return {
    userAgent: ua,
    browser: detectBrowser(ua),
    os: detectOs(ua),
    screen: { width: window.screen.width, height: window.screen.height },
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
  };
}

/** The campaign fields in this URL, or null if it carries none. */
function readUtm(): Partial<Record<UtmField, string>> | null {
  const params = new URLSearchParams(window.location.search);
  const utm: Partial<Record<UtmField, string>> = {};

  for (const [param, fields] of UTM_PARAMS) {
    const value = params.get(param);

    if (value) {
      for (const field of fields) utm[field] = value;
    }
  }

  return Object.keys(utm).length > 0 ? utm : null;
}

/** Marks activity now; past VISIT_GAP_MS since the last one, it is a new visit with a new session id. */
function touchSession(data: { sessionId: string; sessionTimestamp: number; ultimoIngreso: string; cantidadVisitas: number }) {
  const now = Date.now();

  if (data.cantidadVisitas === 0 || now - data.sessionTimestamp > VISIT_GAP_MS) {
    data.cantidadVisitas += 1;
    data.sessionId = newSessionId();
  }
  data.sessionTimestamp = now;
  data.ultimoIngreso = toStoredDate(now);
}

/** Call once per page load: counts the visit and, with adTracking consent, keeps device and campaign data. */
export function trackVisit(): void {
  const withAdTracking = hasConsent('adTracking');

  updateStorage((data) => {
    touchSession(data);
    data.urlPrimerIngreso ??= window.location.pathname;

    if (withAdTracking) {
      writeDevice(readDevice(), data);

      // A URL with campaign parameters replaces the whole campaign, so fields
      // from an earlier one don't mix with it; a URL without them keeps it.
      const utm = readUtm();
      if (utm) {
        for (const [, fields] of UTM_PARAMS) {
          for (const field of fields) data[field] = utm[field] ?? '';
        }
      }
    }
  });
}

/** Keeps the session alive while the visitor moves between pages. */
export function trackPageView(): void {
  updateStorage(touchSession);
}

/**
 * Counts a visit to a property page: one entry per property with what its
 * card needs, how many times it was opened and when first and last. Feeds
 * "most viewed" lists.
 */
export function trackPropertyView(listing: Parameters<typeof toStoredProperty>[0]): void {
  if (!hasConsent('personalization')) return;

  updateStorage((data) => {
    const now = toStoredDate();
    const existing = data.masVistos.find((view) => view.id === listing._id);

    // React runs effects twice in development: a repeat within 2 s isn't a new view.
    if (existing && msSince(existing.ultimaVisita) < 2000) return;

    const entry: MostViewedEntry = {
      ...toStoredProperty(listing),
      visitas: (existing?.visitas ?? 0) + 1,
      fechaAgregado: existing?.fechaAgregado ?? now,
      ultimaVisita: now,
    };

    // Most recently viewed last; the oldest drop off past MAX_PROPERTIES.
    data.masVistos = [...data.masVistos.filter((view) => view.id !== listing._id), entry].slice(-MAX_PROPERTIES);
  });
}

/** The visitor's most viewed properties, most views first (ties: most recent first). */
export function readMostViewedProperties(limit = 6): MostViewedEntry[] {
  return [...readStorage().masVistos]
    .filter((view) => typeof view.visitas === 'number')
    .sort((a, b) => b.visitas - a.visitas || fromStoredDate(b.ultimaVisita) - fromStoredDate(a.ultimaVisita))
    .slice(0, limit);
}
