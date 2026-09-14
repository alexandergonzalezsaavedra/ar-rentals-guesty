import { notFound } from 'next/navigation';
import Menu from '@/components/menu/Menu';
import PropertyDetail from '@/components/listings/PropertyDetail';
import { GuestyApiError } from '@/lib/guesty/client';
import {
  getListing,
  getListingBedArrangements,
  listAllListings,
  type GuestyBedArrangementRoom,
  type GuestyListingDetail,
} from '@/lib/guesty/listings';
import { findListingBySlug } from '@/lib/guesty/slug';

async function fetchListing(citySlug: string, titleSlug: string): Promise<GuestyListingDetail | null> {
  try {
    const { results } = await listAllListings({});
    const match = findListingBySlug(results, citySlug, titleSlug);

    if (!match) {
      return null;
    }

    return await getListing(match._id);
  } catch (error) {
    // A well-formed but nonexistent/removed listing id from Guesty means
    // "we can't show this listing" to the user, same as no match at all.
    if (error instanceof GuestyApiError && error.status >= 400 && error.status < 500) {
      return null;
    }

    throw error;
  }
}

async function fetchBedArrangements(id: string): Promise<GuestyBedArrangementRoom[]> {
  try {
    return await getListingBedArrangements(id);
  } catch (error) {
    // Non-critical: the rest of the page is still useful without this section.
    console.error('PropertyDetailPage: failed to load bed arrangements', error);
    return [];
  }
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PropertyDetailPage(props: PageProps<'/propiedades/[citySlug]/[titleSlug]'>) {
  const { citySlug, titleSlug } = await props.params;
  const searchParams = await props.searchParams;
  const listing = await fetchListing(citySlug, titleSlug);

  if (!listing) {
    notFound();
  }

  const bedArrangements = await fetchBedArrangements(listing._id);

  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <main className='container mx-auto px-4 py-8'>
        <PropertyDetail
          listing={listing}
          bedArrangements={bedArrangements}
          initialCheckIn={firstValue(searchParams.checkIn)}
          initialCheckOut={firstValue(searchParams.checkOut)}
          initialAdults={firstValue(searchParams.adults)}
          initialChildren={firstValue(searchParams.children)}
        />
      </main>
    </>
  );
}
