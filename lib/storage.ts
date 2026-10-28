import { toStoredDate, type StoredDate } from '@/lib/dates';
import type { GuestyListing } from '@/lib/guesty/listings';
import { buildCitySlug, buildTitleSlug } from '@/lib/guesty/slug';
import type { PendingReservation } from '@/lib/pendingReservation';

// Everything the site keeps in the visitor's browser lives under one
// localStorage key, as one flat JSON object, so it can be read (and later sent
// to a database for tracking preferences) in a single piece.
//
// {
//   version: 2,
//   deviceId, sessionId, sessionTimestamp,                 // ids for this browser and the current visit
//   primerIngreso, ultimoIngreso, cantidadVisitas,         // every date is DD/MM/YYYY HH:mm:ss, local time (lib/dates)
//   urlPrimerIngreso,                                      // page the visitor first landed on, e.g. "/"
//   utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
//   originMedia, utm_origin_media,                         // campaign of the last visit that came with one; only with adTracking consent
//   nombres, apellidos, email, codTelefono, telefono,      // only with personalData consent
//   divisa: 'COP',
//   ubicaciones: [{ latitud, longitud, precision, ciudad, pais, region, fechaObtencion }],   // only with location consent
//   dispositivo: [{ userAgent, browser, os, screen, language, timezone, platform }],        // only with adTracking consent
//   favoritos: [{ ...card, fechaAgregado, estaActivo }],
//   masVistos: [{ ...card, visitas, fechaAgregado, ultimaVisita, estaActivo }],
//   reservacionesPendientes: [{ ...reservation }],
//   consent: { decidedAt, categories: { functional, security, personalization, personalData, location, advertising, adTracking } },
//   theme: 'light' | 'dark',
// }
//
// What each consent category allows is decided here, in the write helpers:
// nothing outside this file needs to check consent before saving.

export const STORAGE_KEY = 'vaiven';
const CHANGE_EVENT = 'vaiven:storage';
const VERSION = 2;
const DEFAULT_CURRENCY = 'COP';
/** History lists keep only the most recent entries, so storage stays small. */
const MAX_LOCATIONS = 20;
const MAX_DEVICES = 10;

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
 * favorites, pending payments, security), plus remembering properties viewed
 * and the booking form's contact data.
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
  latitud: number;
  longitud: number;
  /** Radius of uncertainty, in meters. */
  precision: number;
  ciudad: string;
  pais: string;
  region: string;
  fechaObtencion: StoredDate;
}

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  screen: { width: number; height: number };
  language: string;
  timezone: string;
  platform: string;
}

/** What a property card needs, and nothing more: favorites and most viewed are rebuilt into cards from this. */
export interface StoredProperty {
  id: string;
  titulo: string;
  urlPropiedad: string;
  imagen: string;
  ciudad: string;
  departamento: string;
  huespedes: number;
  habitaciones: number;
  banos: number;
  precioBase: number;
  divisa: string;
  estaActivo: boolean;
}

export interface FavoriteEntry extends StoredProperty {
  fechaAgregado: StoredDate;
}

export interface MostViewedEntry extends StoredProperty {
  /** How many times the visitor has opened it. */
  visitas: number;
  /** First time the visitor opened it. */
  fechaAgregado: StoredDate;
  ultimaVisita: StoredDate;
}

export interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  dialCode: string;
  phone: string;
}

export const UTM_FIELDS = ['utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent', 'originMedia', 'utm_origin_media'] as const;

export type UtmField = (typeof UTM_FIELDS)[number];

export interface VaivenStorage extends Record<UtmField, string> {
  version: number;
  deviceId: string;
  sessionId: string;
  /** Last activity of the current visit, in milliseconds. */
  sessionTimestamp: number;
  primerIngreso: StoredDate;
  ultimoIngreso: StoredDate;
  /** Visits, counting a new one after 30 minutes without activity. */
  cantidadVisitas: number;
  /** Path of the first page the visitor landed on, e.g. "/". */
  urlPrimerIngreso?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  /** With the plus sign, e.g. "+57". */
  codTelefono?: string;
  telefono?: string;
  divisa: string;
  ubicaciones: VisitorLocation[];
  dispositivo: DeviceInfo[];
  favoritos: FavoriteEntry[];
  /** One entry per property, most recently viewed last. */
  masVistos: MostViewedEntry[];
  reservacionesPendientes: PendingReservation[];
  consent?: ConsentState;
  theme?: ThemeName;
}

const randomId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Math.random().toString(36).slice(2, 9)}`;

export const newSessionId = () => randomId('session');

const emptyUtm = () => Object.fromEntries(UTM_FIELDS.map((field) => [field, ''])) as Record<UtmField, string>;

const empty = (): VaivenStorage => {
  const now = toStoredDate();

  return {
    version: VERSION,
    deviceId: randomId('device'),
    sessionId: newSessionId(),
    sessionTimestamp: 0,
    primerIngreso: now,
    ultimoIngreso: now,
    cantidadVisitas: 0,
    ...emptyUtm(),
    divisa: DEFAULT_CURRENCY,
    ubicaciones: [],
    dispositivo: [],
    favoritos: [],
    masVistos: [],
    reservacionesPendientes: [],
  };
};

const parse = <T>(raw: string | null): T | null => {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

function removeLegacyKeys(): void {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
}

/** Address of a property's page, e.g. "/alojamiento/gaira/pet-friendly-balcon". */
export const propertyPath = (listing: Pick<GuestyListing, '_id' | 'title' | 'address'>) =>
  `/alojamiento/${buildCitySlug(listing)}/${buildTitleSlug(listing)}`;

type CardListing = Pick<
  GuestyListing,
  '_id' | 'title' | 'address' | 'picture' | 'accommodates' | 'bedrooms' | 'bathrooms' | 'prices'
>;

export function toStoredProperty(listing: CardListing): StoredProperty {
  return {
    id: listing._id,
    titulo: listing.title,
    urlPropiedad: propertyPath(listing),
    imagen: listing.picture?.regular ?? '',
    ciudad: listing.address.city,
    departamento: listing.address.state ?? '',
    huespedes: listing.accommodates,
    habitaciones: listing.bedrooms,
    banos: listing.bathrooms,
    precioBase: listing.prices.basePrice,
    divisa: listing.prices.currency,
    estaActivo: true,
  };
}

/** Rebuilds a listing a PropertyCard can show from a stored property; fields the card doesn't use are left empty. */
export function toCardListing(property: StoredProperty): GuestyListing {
  return {
    _id: property.id,
    title: property.titulo,
    type: '',
    roomType: '',
    propertyType: '',
    amenities: [],
    accommodates: property.huespedes,
    bedrooms: property.habitaciones,
    bathrooms: property.banos,
    beds: 0,
    timezone: '',
    address: { full: '', city: property.ciudad, state: property.departamento || undefined, country: '', lat: 0, lng: 0 },
    picture: { thumbnail: property.imagen, regular: property.imagen, large: property.imagen, caption: '' },
    pictures: [],
    prices: { basePrice: property.precioBase, currency: property.divisa },
    reviews: { avg: null, total: 0 },
  };
}

/** The shape stored before version 2: nested sections in English. */
interface V1Storage {
  version?: number;
  consent?: ConsentState;
  theme?: ThemeName;
  favorites?: (GuestyListing & { savedAt?: StoredDate })[];
  pendingReservations?: PendingReservation[];
  guest?: GuestData;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    city: string;
    region: string;
    country: string;
    obtainedAt: StoredDate;
  };
  tracking?: { firstVisitAt?: StoredDate; lastSeenAt?: StoredDate; visits?: number };
}

/** Carries over from version 1 what still matters, so nothing the visitor relies on is lost. */
function migrateV1(stored: V1Storage): VaivenStorage {
  const data = empty();
  const tracking = stored.tracking ?? {};
  const guest = stored.guest;
  const location = stored.location;

  data.consent = stored.consent;
  data.theme = stored.theme;
  data.reservacionesPendientes = asArray(stored.pendingReservations);
  data.favoritos = asArray<GuestyListing & { savedAt?: StoredDate }>(stored.favorites)
    .filter((listing) => listing?._id && listing.address && listing.prices)
    .map((listing) => ({ ...toStoredProperty(listing), fechaAgregado: listing.savedAt ?? toStoredDate() }));

  if (tracking.firstVisitAt) data.primerIngreso = tracking.firstVisitAt;
  if (tracking.lastSeenAt) data.ultimoIngreso = tracking.lastSeenAt;
  if (typeof tracking.visits === 'number') data.cantidadVisitas = tracking.visits;

  if (guest) {
    Object.assign(data, {
      nombres: guest.firstName,
      apellidos: guest.lastName,
      email: guest.email,
      codTelefono: `+${guest.dialCode}`,
      telefono: guest.phone,
    });
  }

  if (location) {
    data.ubicaciones = [
      {
        latitud: location.latitude,
        longitud: location.longitude,
        precision: location.accuracy,
        ciudad: location.city,
        pais: location.country,
        region: location.region,
        fechaObtencion: location.obtainedAt,
      },
    ];
  }

  return data;
}

/** The whole stored object. Safe to call anywhere; returns an empty one on the server or without storage. */
export function readStorage(): VaivenStorage {
  if (typeof window === 'undefined') {
    return empty();
  }

  try {
    const stored = parse<Partial<VaivenStorage> & V1Storage>(localStorage.getItem(STORAGE_KEY));

    removeLegacyKeys();

    if (stored && stored.version !== VERSION) {
      return migrateV1(stored);
    }

    return {
      ...empty(),
      ...stored,
      ubicaciones: asArray(stored?.ubicaciones),
      dispositivo: asArray(stored?.dispositivo),
      favoritos: asArray(stored?.favoritos),
      masVistos: asArray(stored?.masVistos),
      reservacionesPendientes: asArray(stored?.reservacionesPendientes),
    };
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
  return Object.fromEntries(readStorage().favoritos.map((entry) => [entry.id, toCardListing(entry)]));
}

/** Saves the favorites, keeping the original fechaAgregado of the ones already stored. */
export function writeFavorites(favorites: Record<string, GuestyListing>): void {
  updateStorage((data) => {
    const addedAt = new Map(data.favoritos.map((entry) => [entry.id, entry.fechaAgregado]));
    data.favoritos = Object.values(favorites).map((listing) => ({
      ...toStoredProperty(listing),
      fechaAgregado: addedAt.get(listing._id) ?? toStoredDate(),
    }));
  });
}

export function writeTheme(theme: ThemeName): void {
  updateStorage((data) => {
    data.theme = theme;
  });
}

/** The booking form's contact data, or null if none is stored. dialCode comes without the plus sign. */
export function readGuest(): GuestData | null {
  const data = readStorage();

  if (!data.nombres && !data.email) return null;

  return {
    firstName: data.nombres ?? '',
    lastName: data.apellidos ?? '',
    email: data.email ?? '',
    dialCode: (data.codTelefono ?? '').replace(/^\+/, ''),
    phone: data.telefono ?? '',
  };
}

/** Kept only with personalData consent (to prefill the booking form next time). */
export function writeGuest(guest: GuestData): void {
  if (!hasConsent('personalData')) return;

  updateStorage((data) => {
    data.nombres = guest.firstName;
    data.apellidos = guest.lastName;
    data.email = guest.email;
    data.codTelefono = `+${guest.dialCode}`;
    data.telefono = guest.phone;
  });
}

function deleteGuest(data: VaivenStorage): void {
  delete data.nombres;
  delete data.apellidos;
  delete data.email;
  delete data.codTelefono;
  delete data.telefono;
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

    if (!merged.personalData) deleteGuest(data);
    if (!merged.location) data.ubicaciones = [];
    if (!merged.personalization) data.masVistos = [];
    if (!merged.adTracking) {
      Object.assign(data, emptyUtm());
      data.dispositivo = [];
    }
  });
}

export function acceptAllConsent(): void {
  writeConsent(Object.fromEntries(CONSENT_CATEGORIES.map((category) => [category, true])));
}

export function rejectOptionalConsent(): void {
  writeConsent({});
}

// ---- Location and devices ------------------------------------------------------

/** Adds a reading to the location history (only with location consent). */
export function writeLocation(location: VisitorLocation): void {
  if (!hasConsent('location')) return;

  updateStorage((data) => {
    data.ubicaciones = [...data.ubicaciones, location].slice(-MAX_LOCATIONS);
  });
}

/** Adds this device to the list, or moves it to the end if it's already there (same browser and screen). */
export function writeDevice(device: DeviceInfo, data: VaivenStorage): void {
  const isSame = (entry: DeviceInfo) =>
    entry.userAgent === device.userAgent &&
    entry.screen?.width === device.screen.width &&
    entry.screen?.height === device.screen.height;

  data.dispositivo = [...data.dispositivo.filter((entry) => !isSame(entry)), device].slice(-MAX_DEVICES);
}

/**
 * Deletes everything stored about the visitor, including the device id.
 * Unpaid reservations are kept unless `includePending` is set: without them
 * the visitor couldn't get back to a payment they still owe.
 */
export function clearStoredData({ includePending = false } = {}): void {
  updateStorage((data) => {
    const pending = includePending ? [] : data.reservacionesPendientes;

    for (const key of Object.keys(data) as (keyof VaivenStorage)[]) {
      delete data[key];
    }

    Object.assign(data, empty(), { reservacionesPendientes: pending });
  });
}
