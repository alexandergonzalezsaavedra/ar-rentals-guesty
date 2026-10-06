import { notFound } from 'next/navigation';
import { ConciergeBell } from 'lucide-react';
import { IconMapPin } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
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
      <div className='p-4'>
        <PropertyHero listing={listing} />
      </div>
      <main className='container mx-auto px-4 py-8'>
        <h2 className='text-3xl md:text-4xl font-bold tracking-tight text-foreground'>
          Todo lo mejor{' '}
          <span className='relative inline-block'>
            para tí
            <svg
              viewBox='0 0 120 6'
              className='absolute left-0 bottom-0 -mb-1 w-full'
              aria-hidden='true'
            >
              <path
                d='M1 4.5C25.46 1.63 78.43 1.39 119 4.5'
                stroke='#f472b6'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
              ></path>
            </svg>
          </span>
        </h2>
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
