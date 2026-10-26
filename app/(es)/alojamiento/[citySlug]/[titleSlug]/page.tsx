import { cache } from 'react';
import type { Metadata } from 'next';
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
  type GuestyListingDetail,
} from '@/lib/guesty/listings';
import { SITE_NAME, SITE_URL, excerpt, shareImageFromGuesty } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';

// generateMetadata and the page both need the listing; this makes it one
// Guesty lookup per request instead of two.
const loadListing = cache(getListingBySlug);

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function describeListing(listing: GuestyListingDetail): string {
  const facts = [
    plural(listing.accommodates, 'huésped', 'huéspedes'),
    plural(listing.bedrooms, 'habitación', 'habitaciones'),
    plural(listing.bathrooms, 'baño', 'baños'),
  ].join(' · ');
  const summary = listing.publicDescription?.summary;

  return excerpt(`${listing.address.city}: ${facts}. ${summary ?? 'Consulte disponibilidad y reserve en línea.'}`);
}

export async function generateMetadata(
  props: PageProps<'/alojamiento/[citySlug]/[titleSlug]'>,
): Promise<Metadata> {
  const { citySlug, titleSlug } = await props.params;
  const listing = await loadListing(citySlug, titleSlug);

  if (!listing) {
    return { title: 'Alojamiento no encontrado', robots: { index: false } };
  }

  const picture = listing.picture.large || listing.picture.regular;

  return pageMetadata({
    title: `${listing.title} en ${listing.address.city}`,
    description: describeListing(listing),
    // Canonical without ?checkIn=…: every date search shows the same page.
    path: `/alojamiento/${citySlug}/${titleSlug}`,
    image: picture
      ? { url: shareImageFromGuesty(picture), width: 1200, height: 630, alt: listing.title }
      : undefined,
  });
}

// schema.org description of the rental, so search engines can show it as a
// lodging result with its photos, location and capacity.
function listingJsonLd(listing: GuestyListingDetail, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VacationRental',
    name: listing.title,
    description: describeListing(listing),
    url: `${SITE_URL}${path}`,
    image: listing.pictures.slice(0, 8).map((picture) => picture.original),
    brand: { '@type': 'Brand', name: SITE_NAME },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.address.city,
      addressRegion: listing.address.state,
      addressCountry: listing.address.country,
    },
    ...(Number.isFinite(listing.address.lat) && Number.isFinite(listing.address.lng)
      ? { geo: { '@type': 'GeoCoordinates', latitude: listing.address.lat, longitude: listing.address.lng } }
      : {}),
    containsPlace: {
      '@type': 'Accommodation',
      occupancy: { '@type': 'QuantitativeValue', maxValue: listing.accommodates },
      numberOfBedrooms: listing.bedrooms,
      numberOfBathroomsTotal: listing.bathrooms,
      amenityFeature: listing.amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    },
    ...(listing.defaultCheckInTime ? { checkinTime: listing.defaultCheckInTime } : {}),
    ...(listing.defaultCheckOutTime ? { checkoutTime: listing.defaultCheckOutTime } : {}),
  };
}

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
  const listing = await loadListing(citySlug, titleSlug);

  if (!listing) {
    notFound();
  }

  const bedArrangements = await fetchBedArrangements(listing._id);

  return (
    <>
      <script
        type='application/ld+json'
        // JSON.stringify output is safe here once '<' is escaped, so a description can't close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(listingJsonLd(listing, `/alojamiento/${citySlug}/${titleSlug}`)).replace(/</g, '\\u003c'),
        }}
      />
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
