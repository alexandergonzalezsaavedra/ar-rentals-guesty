import { notFound } from 'next/navigation';
import { ConciergeBell } from 'lucide-react';
import { IconMapPin } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import ScrollToTopOnArrive from '@/components/effects/ScrollToTopOnArrive';
import PropertyDetail from '@/components/listings/PropertyDetail';
import PropertyHero from '@/components/listings/PropertyHero';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import {
  getListingBedArrangements,
  getListingBySlug,
  type GuestyBedArrangementRoom,
} from '@/lib/guesty/listings';

async function fetchBedArrangements(
  id: string,
): Promise<GuestyBedArrangementRoom[]> {
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

export default async function PropertyDetailPage(
  props: PageProps<'/alojamiento/[citySlug]/[titleSlug]'>,
) {
  const { citySlug, titleSlug } = await props.params;
  const searchParams = await props.searchParams;
  const listing = await getListingBySlug(citySlug, titleSlug);

  if (!listing) {
    notFound();
  }

  const bedArrangements = await fetchBedArrangements(listing._id);

  return (
    <>
      <ScrollToTopOnArrive />
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <PageBreadcrumbs
        items={[
          {
            label: 'Alojamiento',
            href: '/alojamiento',
            icon: <ConciergeBell size={12} />,
          },
          {
            label: listing.address.city,
            href: `/alojamiento?city=${encodeURIComponent(listing.address.city)}`,
            icon: <IconMapPin size={12} />,
          },
          { label: listing.title },
        ]}
      />
      {/* Bounds the sticky hero to this page's content, so it lets go before the footer instead of showing through it. */}
      <div className='relative'>
        <div className='relative z-0 p-4 sm:sticky sm:top-0'>
          <PropertyHero listing={listing} />
        </div>
        {/* Opaque and stacked above the sticky hero, so it slides over it on scroll (same effect as the home and listings pages). */}
        <div className='relative z-10 rounded-t-3xl bg-background shadow-[0_-24px_48px_-12px_rgba(0,0,0,0.25)]'>
          <main className='w-full px-4 py-8'>
            <PropertyDetail
              listing={listing}
              bedArrangements={bedArrangements}
              initialCheckIn={firstValue(searchParams.checkIn)}
              initialCheckOut={firstValue(searchParams.checkOut)}
              initialAdults={firstValue(searchParams.adults)}
              initialChildren={firstValue(searchParams.children)}
            />
          </main>
        </div>
      </div>
    </>
  );
}
