import { guestyFetch, GuestyApiError } from './client';
import { findListingBySlug } from './slug';

// Guesty caps a single page at 100 results (enforced server-side by their API).
const MAX_PAGE_SIZE = 100;
// Safety cap on how many pages listAllListings will follow.
const MAX_PAGES = 20;

export interface GuestyListing {
  _id: string;
  nickname?: string;
  title: string;
  type: string;
  roomType: string;
  propertyType: string;
  amenities: string[];
  bathrooms: number;
  accommodates: number;
  bedrooms: number;
  beds: number;
  timezone: string;
  address: {
    full: string;
    city: string;
    state?: string;
    country: string;
    lat: number;
    lng: number;
  };
  picture: { thumbnail: string; regular: string; large: string; caption: string };
  pictures: { original: string; thumbnail: string; caption: string }[];
  prices: { basePrice: number; currency: string };
  publicDescription?: { summary?: string };
  reviews: { avg: number | null; total: number };
  nightlyRates?: Record<string, number>;
  allotment?: Record<string, number>;
  tags?: string[];
}

export interface GuestyListingDetail {
  _id: string;
  nickname?: string;
  title: string;
  type: string;
  roomType: string;
  propertyType: string;
  accommodates: number;
  amenities: string[];
  bathrooms: number;
  bedrooms: number;
  beds: number;
  timezone: string;
  defaultCheckInTime?: string;
  defaultCheckOutTime?: string;
  address: GuestyListing['address'];
  picture: GuestyListing['picture'];
  pictures: GuestyListing['pictures'];
  prices: {
    basePrice: number;
    currency: string;
    extraPersonFee?: number;
    cleaningFee?: number;
  };
  publicDescription?: {
    summary?: string;
    space?: string;
    access?: string;
    notes?: string;
    interactionWithGuests?: string;
  };
  terms?: { minNights?: number; maxNights?: number };
  reviews: { avg: number | null; total: number };
  tags?: string[];
}

export interface GuestyBedArrangementRoom {
  roomNumber: number;
  name: string;
  type: string;
  beds: Record<string, number>;
}

export interface GuestyListingsResponse {
  results: GuestyListing[];
  pagination: {
    total: number;
    cursor?: { next?: string };
  };
}

export interface ListListingsParams {
  checkIn?: string;
  checkOut?: string;
  city?: string;
  country?: string;
  minOccupancy?: string;
  numberOfBedrooms?: string;
  numberOfBathrooms?: string;
  minPrice?: string;
  maxPrice?: string;
  includeAmenities?: string;
  fields?: string;
  limit?: string;
  cursor?: string;
}

export async function listListings(params: ListListingsParams): Promise<GuestyListingsResponse> {
  return guestyFetch<GuestyListingsResponse>('/listings', { ...params });
}

export async function getListing(id: string): Promise<GuestyListingDetail> {
  return guestyFetch<GuestyListingDetail>(`/listings/${encodeURIComponent(id)}`);
}

/**
 * Room-by-room bed configuration. Guesty only returns `bedArrangements` when
 * explicitly requested via `fields`, and requesting `fields` drops every other
 * field from the response — so this is a separate call from `getListing`.
 */
export async function getListingBedArrangements(id: string): Promise<GuestyBedArrangementRoom[]> {
  const data = await guestyFetch<{ bedArrangements?: { bedrooms: GuestyBedArrangementRoom[] } }>(
    `/listings/${encodeURIComponent(id)}`,
    { fields: '_id title nickname type address.city accommodates bedArrangements' }
  );

  return data.bedArrangements?.bedrooms ?? [];
}

export async function listAllListings(
  params: Omit<ListListingsParams, 'limit' | 'cursor'>
): Promise<{ results: GuestyListing[]; pagination: { total: number } }> {
  const results: GuestyListing[] = [];
  let cursor: string | undefined;
  let total = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await listListings({ ...params, limit: String(MAX_PAGE_SIZE), cursor });

    results.push(...data.results);
    total = data.pagination.total;
    cursor = data.pagination.cursor?.next;

    if (!cursor || data.results.length === 0) {
      break;
    }
  }

  return { results, pagination: { total } };
}

/**
 * Resolves a listing from its URL slugs (used by property detail/checkout
 * routes, which don't carry the Guesty id in the URL). Returns null both when
 * no listing matches the slugs and when Guesty reports the matched id as
 * gone (4xx) — both cases mean "can't show this listing" to the caller.
 */
export async function getListingBySlug(
  citySlug: string,
  titleSlug: string
): Promise<GuestyListingDetail | null> {
  try {
    const { results } = await listAllListings({});
    const match = findListingBySlug(results, citySlug, titleSlug);

    if (!match) {
      return null;
    }

    return await getListing(match._id);
  } catch (error) {
    if (error instanceof GuestyApiError && error.status >= 400 && error.status < 500) {
      return null;
    }

    throw error;
  }
}
