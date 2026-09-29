import { notFound, redirect } from 'next/navigation';
import { ConciergeBell } from 'lucide-react';
import { IconMapPin } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import ReservationSummary from '@/components/listings/ReservationSummary';
import ReservationForm from '@/components/listings/ReservationForm';
import { GuestyApiError } from '@/lib/guesty/client';
import { getListingBySlug } from '@/lib/guesty/listings';
import { getReservationQuote } from '@/lib/guesty/quotes';
import { buildPricingBreakdown } from '@/lib/pricing';

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReservationPage(
  props: PageProps<'/alojamiento/[citySlug]/[titleSlug]/reservar'>
) {
  const { citySlug, titleSlug } = await props.params;
  const searchParams = await props.searchParams;

  const checkIn = firstValue(searchParams.checkIn);
  const checkOut = firstValue(searchParams.checkOut);
  const adults = Number(firstValue(searchParams.adults) ?? 0);
  const children = Number(firstValue(searchParams.children) ?? 0);

  const propertyHref = `/alojamiento/${citySlug}/${titleSlug}`;

  if (!checkIn || !checkOut || !adults) {
    redirect(propertyHref);
  }

  const listing = await getListingBySlug(citySlug, titleSlug);

  if (!listing) {
    notFound();
  }

  let quote;

  try {
    quote = await getReservationQuote({ listingId: listing._id, checkIn, checkOut, adults, children });
  } catch (error) {
    if (error instanceof GuestyApiError && error.status >= 400 && error.status < 500) {
      redirect(`${propertyHref}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`);
    }

    throw error;
  }

  const ratePlan = quote.rates.ratePlans[0];

  if (!ratePlan) {
    redirect(`${propertyHref}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`);
  }

  const pricing = buildPricingBreakdown(
    ratePlan.ratePlan.money,
    ratePlan.days.length,
    adults + children,
  );

  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <PageBreadcrumbs
        items={[
          { label: 'Alojamiento', href: '/alojamiento', icon: <ConciergeBell size={12} /> },
          {
            label: listing.address.city,
            href: `/alojamiento?city=${encodeURIComponent(listing.address.city)}`,
            icon: <IconMapPin size={12} />,
          },
          { label: listing.title, href: propertyHref },
          { label: 'Reservar' },
        ]}
      />
      <main className='container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <ReservationForm
            quoteId={quote._id}
            propertyHref={propertyHref}
          />
        </div>
        <aside>
          <ReservationSummary
            listing={listing}
            checkIn={new Date(`${checkIn}T00:00:00`)}
            checkOut={new Date(`${checkOut}T00:00:00`)}
            adults={adults}
            childrenCount={children}
            pricing={pricing}
          />
        </aside>
      </main>
    </>
  );
}
