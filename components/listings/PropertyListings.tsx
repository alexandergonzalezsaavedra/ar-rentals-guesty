import { GuestyApiError } from '@/lib/guesty/client';
import {
  listAllListings,
  type GuestyListing,
  type ListListingsParams,
} from '@/lib/guesty/listings';
import PropertyListingsGrid from './PropertyListingsGrid';
import type { PropertyFiltersValues } from './PropertyFilters';

interface PropertyListingsProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function fetchListings(
  params: Omit<ListListingsParams, 'limit' | 'cursor'>,
): Promise<{ listings: GuestyListing[] } | { error: string }> {
  try {
    const { results } = await listAllListings(params);
    return { listings: results };
  } catch (error) {
    console.error('PropertyListings: failed to load Guesty listings', error);

    return {
      error:
        error instanceof GuestyApiError
          ? 'No pudimos cargar los inmuebles en este momento.'
          : 'Ocurrió un error inesperado al consultar los inmuebles.',
    };
  }
}

export default async function PropertyListings({
  searchParams,
}: PropertyListingsProps) {
  const initialFilters: PropertyFiltersValues = {
    city: firstValue(searchParams?.city),
    checkIn: firstValue(searchParams?.checkIn),
    checkOut: firstValue(searchParams?.checkOut),
    numberOfBedrooms: firstValue(searchParams?.numberOfBedrooms),
    numberOfBathrooms: firstValue(searchParams?.numberOfBathrooms),
    minOccupancy: firstValue(searchParams?.minOccupancy),
    adults: firstValue(searchParams?.adults),
    children: firstValue(searchParams?.children),
  };
  const hasFilters = Object.values(initialFilters).some(Boolean);

  // The "Ciudad" dropdown needs every city in the catalog, not just the ones
  // matching the current filter, so this fetch always runs unfiltered.
  const catalogOutcome = await fetchListings({});

  if ('error' in catalogOutcome) {
    return (
      <p className='text-default-500 py-12 text-center'>
        {catalogOutcome.error}
      </p>
    );
  }

  if (catalogOutcome.listings.length === 0) {
    return (
      <p className='text-default-500 py-12 text-center'>
        No hay inmuebles disponibles.
      </p>
    );
  }

  const cities = Array.from(
    new Set(catalogOutcome.listings.map((listing) => listing.address.city)),
  ).sort();

  let initialListings = catalogOutcome.listings;

  if (hasFilters) {
    const filteredOutcome = await fetchListings({
      city: initialFilters.city,
      country: initialFilters.city ? 'Colombia' : undefined,
      checkIn: initialFilters.checkIn,
      checkOut: initialFilters.checkOut,
      numberOfBedrooms: initialFilters.numberOfBedrooms,
      numberOfBathrooms: initialFilters.numberOfBathrooms,
      minOccupancy: initialFilters.minOccupancy,
    });

    if ('error' in filteredOutcome) {
      return (
        <p className='text-default-500 py-12 text-center'>
          {filteredOutcome.error}
        </p>
      );
    }

    initialListings = filteredOutcome.listings;
  }

  return (
    <PropertyListingsGrid
      listings={initialListings}
      cities={cities}
      initialFilters={initialFilters}
    />
  );
}
