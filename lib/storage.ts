import type { GuestyListing } from '@/lib/guesty/listings';
import type { PendingReservation } from '@/lib/pendingReservation';

// Everything the site keeps in the visitor's browser lives under one
// localStorage key, as one JSON object, so it can be read (and later sent to
// a database for tracking preferences) in a single piece.
//
// {
//   version: 1,
//   updatedAt: 1730000000000,
//   theme: 'light' | 'dark',
//   favorites: [{ ...listing, savedAt }],
//   guest: { firstName, lastName, email, dialCode, phone },
//   pendingReservations: [{ ...reservation }]
// }

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

export interface FavoriteEntry extends GuestyListing {
  /** When the visitor saved it (ms since epoch). */
  savedAt: number;
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
  updatedAt: number;
  theme?: ThemeName;
  favorites: FavoriteEntry[];
  guest?: GuestData;
  pendingReservations: PendingReservation[];
}

const empty = (): VaivenStorage => ({
  version: VERSION,
  updatedAt: Date.now(),
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
    data.updatedAt = Date.now();
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
      savedAt: savedAt.get(listing._id) ?? Date.now(),
    }));
  });
}

export function writeTheme(theme: ThemeName): void {
  updateStorage((data) => {
    data.theme = theme;
  });
}

export function writeGuest(guest: GuestData): void {
  updateStorage((data) => {
    data.guest = guest;
  });
}
