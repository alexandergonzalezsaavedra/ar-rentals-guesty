import type { GuestyListing } from '@/lib/guesty/listings';
import { msSince, toStoredDate, fromStoredDate } from '@/lib/dates';
import { hasConsent, readStorage, updateTracking, type DeviceInfo, type PropertyView } from '@/lib/storage';

// Records what the visitor does, into the `tracking` section of the single
// storage object, so it can later be sent to a database. Every function checks
// consent itself:
//   - personalization (always on, see REQUIRED_CATEGORIES): searches and properties viewed
//   - adTracking: page views, device and campaign (UTM) parameters
// Visits are always counted: a number, nothing about the person.

/** A new visit starts after this long without activity. */
const VISIT_GAP_MS = 30 * 60 * 1000;
/** Lists keep only the most recent entries, so storage stays small. */
const MAX_ENTRIES = 50;
/** Properties viewed: one entry each, so this can be larger. */
const MAX_PROPERTIES = 100;

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

const pushRecent = <T>(list: T[], entry: T) => {
  list.push(entry);
  list.splice(0, Math.max(0, list.length - MAX_ENTRIES));
};

function readDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  const type = /iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';

  return {
    type,
    userAgent: ua,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function readUtm(): Record<string, string> | undefined {
  const params = new URLSearchParams(window.location.search);
  const utm = Object.fromEntries(UTM_PARAMS.filter((key) => params.get(key)).map((key) => [key, params.get(key)!]));

  return Object.keys(utm).length > 0 ? utm : undefined;
}

/** Call once per page load: counts the visit and, with adTracking consent, keeps device and campaign data. */
export function trackVisit(): void {
  const withAdTracking = hasConsent('adTracking');

  updateTracking((tracking) => {
    if (tracking.visits === 0 || msSince(tracking.lastSeenAt) > VISIT_GAP_MS) {
      tracking.visits += 1;
    }
    tracking.lastSeenAt = toStoredDate();

    if (withAdTracking) {
      tracking.device = readDevice();
      // The first campaign that brought them is the one worth keeping.
      tracking.utm ??= readUtm();
    }
  });
}

export function trackPageView(path: string): void {
  if (!hasConsent('adTracking')) return;

  updateTracking((tracking) => {
    const last = tracking.pageViews.at(-1);

    tracking.lastSeenAt = toStoredDate();

    // The same page again within 2 s is a re-render, not a new view.
    if (last?.path === path && msSince(last.at) < 2000) return;

    pushRecent(tracking.pageViews, { path, at: toStoredDate() });
  });
}

/** A search from the home or listing filters; empty values are left out. */
export function trackSearch(filters: Record<string, string | undefined>): void {
  if (!hasConsent('personalization')) return;

  const used = Object.fromEntries(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );

  updateTracking((tracking) => {
    pushRecent(tracking.searches, { filters: used, at: toStoredDate() });
  });
}

/**
 * Counts a visit to a property page: one entry per property with how many
 * times it was opened and when first and last. Feeds "most viewed" lists.
 */
export function trackPropertyView(listing: Pick<GuestyListing, '_id' | 'title' | 'address'>, path: string): void {
  if (!hasConsent('personalization')) return;

  updateTracking((tracking) => {
    const now = toStoredDate();
    const existing = tracking.propertyViews.find((view) => view.id === listing._id);

    // React runs effects twice in development: a repeat within 2 s isn't a new view.
    if (existing && msSince(existing.lastViewedAt) < 2000) return;

    const entry: PropertyView = {
      id: listing._id,
      title: listing.title,
      city: listing.address.city,
      path,
      views: (existing?.views ?? 0) + 1,
      firstViewedAt: existing?.firstViewedAt ?? now,
      lastViewedAt: now,
    };

    // Most recently viewed last; the oldest drop off past MAX_PROPERTIES.
    tracking.propertyViews = [...tracking.propertyViews.filter((view) => view.id !== listing._id), entry].slice(
      -MAX_PROPERTIES,
    );
  });
}

/** The visitor's most viewed properties, most views first (ties: most recent first). */
export function readMostViewedProperties(limit = 6): PropertyView[] {
  const views = readStorage().tracking?.propertyViews ?? [];

  return [...views]
    .filter((view) => typeof view.views === 'number')
    .sort((a, b) => b.views - a.views || fromStoredDate(b.lastViewedAt) - fromStoredDate(a.lastViewedAt))
    .slice(0, limit);
}
