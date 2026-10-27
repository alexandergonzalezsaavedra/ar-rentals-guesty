import { toStoredDate, type StoredDate } from '@/lib/dates';
import type { GuestyListing } from '@/lib/guesty/listings';
import type { PendingReservation } from '@/lib/pendingReservation';

// Everything the site keeps in the visitor's browser lives under one
// localStorage key, as one JSON object, so it can be read (and later sent to
// a database for tracking preferences) in a single piece.
//
// {
//   version: 1,
//   updatedAt: '27/10/2026 11:04:35',   // every date is DD/MM/YYYY HH:mm:ss, local time (lib/dates)
//   consent: { decidedAt, categories: { functional, security, personalization, personalData, location, advertising, adTracking } },
//   theme: 'light' | 'dark',
//   favorites: [{ ...listing, savedAt }],
//   guest: { firstName, lastName, email, dialCode, phone },          // only with personalData consent
//   location: { city, region, country, latitude, longitude, ... },   // only with location consent
//   tracking: { visits, device, utm, pageViews, searches, propertyViews },
//   pendingReservations: [{ ...reservation }]
// }
//
// What each consent category allows is decided here, in the write helpers:
// nothing outside this file needs to check consent before saving.

export const STORAGE_KEY = 'vaiven';
const CHANGE_EVENT = 'vaiven:storage';
const VERSION = 1;

/** Keys used before everything moved under STORAGE_KEY. Their data isn't carried over; they are just deleted. */
const LEGACY_KEYS = [
  'ar-rentals-favorites',
  'ar-rentals-guest',
  'ar-rentals-theme',
  'vaiven-pending-reservations',
  'vaiven-pending-reservation',
  '__users__redux__state',
];

export type ThemeName = 'light' | 'dark';

/** Cookie / storage consent categories, as listed in the cookie settings and the terms page. */
export const CONSENT_CATEGORIES = [
  'functional',
  'security',
  'personalization',
  'personalData',
  'location',
  'advertising',
  'adTracking',
] as const;

export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

/**
 * Always on, part of "Solo necesarias": the site's basic features (theme,
 * favorites, pending payments, security), plus remembering searches and
 * properties viewed and the booking form's contact data.
 */
export const REQUIRED_CATEGORIES: readonly ConsentCategory[] = ['functional', 'security', 'personalization', 'personalData'];

const withRequired = (categories: Record<ConsentCategory, boolean>) => {
  for (const category of REQUIRED_CATEGORIES) {
    categories[category] = true;
  }

  return categories;
};

export interface ConsentState {
  /** When the visitor chose; null until they answer the cookie notice. */
  decidedAt: StoredDate | null;
  categories: Record<ConsentCategory, boolean>;
}

export interface VisitorLocation {
  latitude: number;
  longitude: number;
  /** Radius of uncertainty, in meters. */
  accuracy: number;
  city: string;
  region: string;
  country: string;
  obtainedAt: StoredDate;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
  language: string;
  screen: string;
  timezone: string;
}

export interface PropertyView {
  id: string;
  title: string;
  city: string;
  path: string;
  /** How many times the visitor has opened it. */
  views: number;
  firstViewedAt: StoredDate;
  lastViewedAt: StoredDate;
}

export interface TrackingData {
  firstVisitAt: StoredDate;
  lastSeenAt: StoredDate;
  /** Visits, counting a new one after 30 minutes without activity. */
  visits: number;
  device?: DeviceInfo;
  /** Campaign parameters of the visit that first brought the visitor (utm_source, utm_medium, ...). */
  utm?: Record<string, string>;
  pageViews: { path: string; at: StoredDate }[];
  searches: { filters: Record<string, string>; at: StoredDate }[];
  /** One entry per property, most recently viewed last. */
  propertyViews: PropertyView[];
}

export interface FavoriteEntry extends GuestyListing {
  /** When the visitor saved it. */
  savedAt: StoredDate;
}

export interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  dialCode: string;
  phone: string;
}

export interface VaivenStorage {
  version: number;
  updatedAt: StoredDate;
  consent?: ConsentState;
  theme?: ThemeName;
  favorites: FavoriteEntry[];
  guest?: GuestData;
  location?: VisitorLocation;
  tracking?: TrackingData;
  pendingReservations: PendingReservation[];
}

const empty = (): VaivenStorage => ({
  version: VERSION,
  updatedAt: toStoredDate(),
  favorites: [],
  pendingReservations: [],
});

const parse = <T>(raw: string | null): T | null => {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

function removeLegacyKeys(): void {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
}

/** The whole stored object. Safe to call anywhere; returns an empty one on the server or without storage. */
export function readStorage(): VaivenStorage {
  if (typeof window === 'undefined') {
    return empty();
  }

  try {
    const stored = parse<Partial<VaivenStorage>>(localStorage.getItem(STORAGE_KEY));
    const data: VaivenStorage = {
      ...empty(),
      ...stored,
      favorites: Array.isArray(stored?.favorites) ? stored.favorites : [],
      pendingReservations: Array.isArray(stored?.pendingReservations) ? stored.pendingReservations : [],
    };

    removeLegacyKeys();

    return data;
  } catch {
    // Storage unavailable (private mode, blocked): behave as a first visit.
    return empty();
  }
}

/** Applies `update` to the stored object and saves it. */
export function updateStorage(update: (data: VaivenStorage) => void): void {
  if (typeof window === 'undefined') return;

  try {
    const data = readStorage();
    update(data);
    data.updatedAt = toStoredDate();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage unavailable (private mode, quota): the site keeps working for this visit.
  }
}

/** Calls `listener` whenever the stored object changes, in this tab or another. */
export function onStorageChange(listener: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };

  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}

// ---- Sections ---------------------------------------------------------------

export function readFavorites(): Record<string, GuestyListing> {
  // Entries carry an extra savedAt; the rest of the site just ignores it.
  return Object.fromEntries(readStorage().favorites.map((entry) => [entry._id, entry]));
}

/** Saves the favorites, keeping the original savedAt of the ones already stored. */
export function writeFavorites(favorites: Record<string, GuestyListing>): void {
  updateStorage((data) => {
    const savedAt = new Map(data.favorites.map((entry) => [entry._id, entry.savedAt]));
    data.favorites = Object.values(favorites).map((listing) => ({
      ...listing,
      savedAt: savedAt.get(listing._id) ?? toStoredDate(),
    }));
  });
}

export function writeTheme(theme: ThemeName): void {
  updateStorage((data) => {
    data.theme = theme;
  });
}

/** Kept only with personalData consent (to prefill the booking form next time). */
export function writeGuest(guest: GuestData): void {
  if (!hasConsent('personalData')) return;

  updateStorage((data) => {
    data.guest = guest;
  });
}

// ---- Consent ----------------------------------------------------------------

const defaultCategories = (): Record<ConsentCategory, boolean> =>
  Object.fromEntries(CONSENT_CATEGORIES.map((category) => [category, REQUIRED_CATEGORIES.includes(category)])) as Record<
    ConsentCategory,
    boolean
  >;

/** The visitor's choice, or the defaults (only the required categories) if they haven't chosen yet. */
export function readConsent(): ConsentState {
  const consent = readStorage().consent;

  return {
    decidedAt: consent?.decidedAt ?? null,
    categories: withRequired({ ...defaultCategories(), ...consent?.categories }),
  };
}

export function hasConsent(category: ConsentCategory): boolean {
  return readConsent().categories[category];
}

/** Saves the choice and deletes whatever a category that is now off had stored. */
export function writeConsent(categories: Partial<Record<ConsentCategory, boolean>>): void {
  updateStorage((data) => {
    const merged = withRequired({ ...defaultCategories(), ...categories });

    data.consent = { decidedAt: toStoredDate(), categories: merged };

    if (!merged.personalData) delete data.guest;
    if (!merged.location) delete data.location;

    if (data.tracking) {
      if (!merged.personalization) {
        data.tracking.searches = [];
        data.tracking.propertyViews = [];
      }
      if (!merged.adTracking) {
        data.tracking.pageViews = [];
        delete data.tracking.device;
        delete data.tracking.utm;
      }
    }
  });
}

export function acceptAllConsent(): void {
  writeConsent(Object.fromEntries(CONSENT_CATEGORIES.map((category) => [category, true])));
}

export function rejectOptionalConsent(): void {
  writeConsent({});
}

// ---- Location and tracking ----------------------------------------------------

export function writeLocation(location: VisitorLocation): void {
  if (!hasConsent('location')) return;

  updateStorage((data) => {
    data.location = location;
  });
}

/** Applies `update` to the tracking section, creating it on first use. */
export function updateTracking(update: (tracking: TrackingData) => void): void {
  updateStorage((data) => {
    const now = toStoredDate();

    data.tracking ??= {
      firstVisitAt: now,
      lastSeenAt: now,
      visits: 0,
      pageViews: [],
      searches: [],
      propertyViews: [],
    };
    update(data.tracking);
  });
}

/**
 * Deletes everything stored about the visitor. Unpaid reservations are kept
 * unless `includePending` is set: without them the visitor couldn't get back
 * to a payment they still owe.
 */
export function clearStoredData({ includePending = false } = {}): void {
  updateStorage((data) => {
    const pending = includePending ? [] : data.pendingReservations;

    for (const key of Object.keys(data) as (keyof VaivenStorage)[]) {
      if (key !== 'version' && key !== 'updatedAt') delete data[key];
    }

    data.favorites = [];
    data.pendingReservations = pending;
  });
}
