import { notFound, redirect } from 'next/navigation';
import { ConciergeBell } from 'lucide-react';
import { IconMapPin } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import ReservationSummary from '@/components/listings/ReservationSummary';
import ReservationForm from '@/components/listings/ReservationForm';
import { RecaptchaProvider } from '@/components/recaptcha/RecaptchaProvider';
import { GuestyApiError } from '@/lib/guesty/client';
import { getListingBySlug } from '@/lib/guesty/listings';
import { getReservationQuote } from '@/lib/guesty/quotes';
import { buildPricingBreakdown } from '@/lib/pricing';

export const metadata = {
  title: 'Reservar',
  robots: { index: false },
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReservationPage(props: PageProps<'/alojamiento/[citySlug]/[titleSlug]/reservar'>) {
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

  // A failed quote doesn't send the visitor away from here: if they already
  // created a reservation for these dates and haven't paid it, that very
  // reservation is what makes the dates unavailable now. ReservationForm
  // resumes its payment from the browser, or goes back to the property if
  // there is none.
  let quote = null;

  try {
    quote = await getReservationQuote({
      listingId: listing._id,
      checkIn,
      checkOut,
      adults,
      children,
    });
  } catch (error) {
    if (!(error instanceof GuestyApiError && error.status >= 400 && error.status < 500)) {
      throw error;
    }
  }

  const ratePlan = quote?.rates.ratePlans[0] ?? null;
  const pricing = ratePlan
    ? buildPricingBreakdown(ratePlan.ratePlan.money, ratePlan.days.length, adults + children)
    : null;

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
          { label: listing.title, href: propertyHref },
          { label: 'Reservar' },
        ]}
      />
      <main className='w-full px-4 py-8'>
        {/* The form lays out the summary itself: beside the guest form, but folded into the payment card on
            the payment step, so on phones what is being paid for shows up with the payment, not below it. */}
        <RecaptchaProvider>
          <ReservationForm
            quoteId={quote && ratePlan ? quote._id : null}
            ratePlanId={ratePlan?.ratePlan._id ?? null}
            propertyHref={propertyHref}
            stay={{
              propertyHref,
              listingTitle: listing.title,
              listingImage: listing.picture.regular || listing.picture.large,
              listingAddress: listing.address.full,
              checkIn,
              checkOut,
              adults,
              children,
            }}
            summary={
              <ReservationSummary
                listing={listing}
                checkIn={new Date(`${checkIn}T00:00:00`)}
                checkOut={new Date(`${checkOut}T00:00:00`)}
                adults={adults}
                childrenCount={children}
                pricing={pricing}
              />
            }
          />
        </RecaptchaProvider>
      </main>
    </>
  );
}
