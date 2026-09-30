'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button, Card, DatePicker, Spinner } from '@heroui/react';
import Stepper from './Stepper';
import {
  getLocalTimeZone,
  parseDate,
  today,
  type DateValue,
} from '@internationalized/date';
import {
  IconAlertCircle,
  IconCalendarEvent,
  IconClock,
  IconDiscount,
  IconHome2,
  IconMoonStars,
  IconPlaneArrival,
  IconPlaneDeparture,
  IconReceipt2,
  IconSparkles,
  IconWallet,
} from '@tabler/icons-react';
import type { GuestyListingDetail } from '@/lib/guesty/listings';
import type { ReservationQuoteMoney } from '@/lib/guesty/quotes';
import {
  formatPrice,
  formatMonthShort,
  formatWeekdayLong,
} from '@/lib/format';
import { buildPricingBreakdown, type PricingBreakdown } from '@/lib/pricing';

interface BookingWidgetProps {
  listing: GuestyListingDetail;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: string;
  initialChildren?: string;
}

interface QuoteResponse {
  quote: {
    rates: {
      ratePlans: {
        ratePlan: { money: ReservationQuoteMoney };
        days: { date: string }[];
      }[];
    };
  };
}

interface QuoteError {
  error: string;
  details?: { error?: { code?: string } };
}

const ERROR_MESSAGES: Record<string, string> = {
  LISTING_IS_NOT_AVAILABLE:
    'El inmueble no está disponible para esas fechas (puede no cumplir la estadía mínima, o ya está reservado).',
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const BookingWidget = ({
  listing,
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  initialChildren,
}: BookingWidgetProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const defaultNights = Math.max(1, listing.terms?.minNights ?? 1);
  const maxGuests = Math.max(1, listing.accommodates);
  // Guesty enforces a minimum advance notice on every listing we've checked,
  // so same-day check-in always gets rejected as LISTING_IS_NOT_AVAILABLE —
  // block it here instead of letting the user hit that error at quote time.
  const minCheckIn = today(getLocalTimeZone()).add({ days: 1 });

  const [checkInDate, setCheckInDate] = useState<DateValue>(() => {
    if (!initialCheckIn) {
      return minCheckIn;
    }
    const parsed = parseDate(initialCheckIn);
    return parsed.compare(minCheckIn) >= 0 ? parsed : minCheckIn;
  });
  const [checkOutDate, setCheckOutDate] = useState<DateValue>(() =>
    initialCheckOut
      ? parseDate(initialCheckOut)
      : minCheckIn.add({ days: defaultNights }),
  );
  const [adults, setAdults] = useState(() =>
    String(clamp(initialAdults ? Number(initialAdults) : 2, 1, maxGuests)),
  );
  const [children, setChildren] = useState(() =>
    String(
      clamp(initialChildren ? Number(initialChildren) : 0, 0, maxGuests - 1),
    ),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Guards against an older request resolving after a newer one (e.g. the user
  // flips adults then children in quick succession) and overwriting fresh data.
  const requestIdRef = useRef(0);

  const checkInStr = checkInDate.toString();
  const checkOutStr = checkOutDate.toString();

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- syncing local form state with the Guesty quote API on every change is the point of this effect */
    const requestId = ++requestIdRef.current;

    if (checkOutDate.compare(checkInDate) <= 0) {
      setError('El check-out debe ser posterior al check-in.');
      setPricing(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const response = await fetch('/api/guesty/quote', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            listingId: listing._id,
            checkIn: checkInStr,
            checkOut: checkOutStr,
            adults: Number(adults),
            children: Number(children),
          }),
        });

        const data = (await response.json()) as QuoteResponse | QuoteError;

        // A newer request has since started; this response is stale, ignore it.
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (!response.ok || 'error' in data) {
          const code =
            'details' in data ? data.details?.error?.code : undefined;

          if (code === 'VALIDATION_ERROR') {
            setError(
              `La cantidad de huéspedes supera la capacidad del inmueble (máximo ${maxGuests} huéspedes).`,
            );
          } else {
            setError(
              (code && ERROR_MESSAGES[code]) ||
                ('error' in data
                  ? data.error
                  : 'No pudimos consultar disponibilidad.'),
            );
          }

          setPricing(null);
          return;
        }

        const ratePlan = data.quote.rates.ratePlans[0];

        if (!ratePlan) {
          setPricing(null);
          return;
        }

        setPricing(
          buildPricingBreakdown(
            ratePlan.ratePlan.money,
            ratePlan.days.length,
            Number(adults) + Number(children),
          ),
        );
      } catch {
        if (requestId === requestIdRef.current) {
          setError('No pudimos consultar disponibilidad. Intente de nuevo.');
          setPricing(null);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInStr, checkOutStr, adults, children]);

  const hasValidRange = checkOutDate.compare(checkInDate) > 0;
  const selectedNights = hasValidRange
    ? Math.round(
        (checkOutDate.toDate(getLocalTimeZone()).getTime() -
          checkInDate.toDate(getLocalTimeZone()).getTime()) /
          86400000,
      )
    : 0;

  const handleReserve = () => {
    const params = new URLSearchParams({
      checkIn: checkInStr,
      checkOut: checkOutStr,
      adults,
      children,
    });
    router.push(`${pathname}/reservar?${params.toString()}`);
  };

  return (
    <Card
      shadow='sm'
      className='p-4 sm:sticky sm:top-24'
    >
      <p className='text-3xl font-bold text-primary'>
        {formatPrice(listing.prices.basePrice, listing.prices.currency)}{' '}
        <span className='text-sm font-normal text-default-500'>/ noche</span>
      </p>

      <div className='mt-4 flex flex-col gap-3'>
        <div className='grid grid-cols-2 gap-2'>
          <DatePicker
            label='Llegada'
            size='sm'
            value={checkInDate}
            onChange={(value) => value && setCheckInDate(value)}
            minValue={minCheckIn}
          />
          <DatePicker
            label='Salida'
            size='sm'
            value={checkOutDate}
            onChange={(value) => value && setCheckOutDate(value)}
            minValue={checkInDate}
          />
        </div>

        {hasValidRange && (
          <div>
            <p className='mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-default-400 uppercase'>
              <IconCalendarEvent
                size={14}
                className='text-primary'
              />
              Fechas de tu estadía
            </p>

            <div className='flex items-stretch overflow-hidden rounded-xl border border-default-200 bg-content1'>
              <div className='flex-1 px-3 py-2.5'>
                <span className='flex items-center gap-1 text-[11px] font-medium text-default-400'>
                  <IconPlaneArrival
                    size={13}
                    className='animate-icon-float shrink-0 text-primary'
                  />
                  Llegada
                </span>
                <p className='mt-0.5 text-xl leading-none font-bold text-foreground'>
                  {checkInDate.day}
                  <span className='ml-1 text-sm font-medium text-default-500'>
                    {formatMonthShort(checkInDate.toDate(getLocalTimeZone()))}
                  </span>
                </p>
                <p className='mt-1 text-xs text-default-500'>
                  {formatWeekdayLong(checkInDate.toDate(getLocalTimeZone()))}
                </p>
              </div>

              <div className='flex w-16 shrink-0 flex-col items-center justify-center gap-1 border-x border-default-200 bg-primary/10 px-1 text-primary'>
                <IconMoonStars
                  size={16}
                  className='animate-icon-float shrink-0'
                  style={{ animationDelay: '0.4s' }}
                />
                <span className='text-lg leading-none font-bold'>
                  {selectedNights}
                </span>
                <span className='text-[10px] leading-none font-medium'>
                  {selectedNights === 1 ? 'noche' : 'noches'}
                </span>
              </div>

              <div className='flex-1 px-3 py-2.5 text-right'>
                <span className='flex items-center justify-end gap-1 text-[11px] font-medium text-default-400'>
                  Salida
                  <IconPlaneDeparture
                    size={13}
                    className='animate-icon-float shrink-0 text-primary'
                    style={{ animationDelay: '0.8s' }}
                  />
                </span>
                <p className='mt-0.5 text-xl leading-none font-bold text-foreground'>
                  {checkOutDate.day}
                  <span className='ml-1 text-sm font-medium text-default-500'>
                    {formatMonthShort(checkOutDate.toDate(getLocalTimeZone()))}
                  </span>
                </p>
                <p className='mt-1 text-xs text-default-500'>
                  {formatWeekdayLong(checkOutDate.toDate(getLocalTimeZone()))}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-2 gap-2'>
          <Stepper
            label='Adultos'
            description='Edad: 13 años o más'
            value={Number(adults)}
            min={1}
            max={maxGuests}
            onChange={(value) => setAdults(String(value))}
            className='rounded-lg border border-default-200'
          />

          <Stepper
            label='Niños'
            description='Edades 2 – 12'
            value={Number(children)}
            min={0}
            max={maxGuests - 1}
            onChange={(value) => setChildren(String(value))}
            className='rounded-lg border border-default-200'
          />
        </div>

        {isLoading && (
          <div className='flex items-center gap-2 text-sm text-default-500'>
            <Spinner size='sm' />
            Consultando disponibilidad...
          </div>
        )}
      </div>

      {error && !isLoading && (
        <div className='mt-3 flex items-start gap-2 text-sm text-danger'>
          <IconAlertCircle
            size={16}
            className='mt-0.5 shrink-0'
          />
          <p>{error}</p>
        </div>
      )}

      {pricing && !isLoading && (
        <div className='mt-4 rounded-xl border border-default-200 bg-content1 p-4'>
          <div className='flex flex-col gap-3 text-sm text-default-600'>
            <div className='flex items-center justify-between gap-2'>
              <span className='flex items-center gap-2'>
                <IconHome2
                  size={16}
                  className='shrink-0 text-primary'
                />
                Alojamiento
              </span>
              <span className='font-medium text-foreground'>
                {formatPrice(pricing.baseAccommodation, pricing.currency)}
              </span>
            </div>

            {pricing.discount > 0 && (
              <div className='flex items-center justify-between gap-2'>
                <span className='flex items-center gap-2'>
                  <IconDiscount
                    size={16}
                    className='shrink-0 text-success'
                  />
                  Descuento
                </span>
                <span className='font-medium text-success'>
                  -{formatPrice(pricing.discount, pricing.currency)}
                </span>
              </div>
            )}

            {pricing.cleaningFee > 0 && (
              <div className='flex items-center justify-between gap-2'>
                <span className='flex items-center gap-2'>
                  <IconSparkles
                    size={16}
                    className='shrink-0 text-primary'
                  />
                  Limpieza
                </span>
                <span className='font-medium text-foreground'>
                  {formatPrice(pricing.cleaningFee, pricing.currency)}
                </span>
              </div>
            )}

            {pricing.taxes > 0 && (
              <div className='flex items-center justify-between gap-2'>
                <span className='flex items-center gap-2'>
                  <IconReceipt2
                    size={16}
                    className='shrink-0 text-primary'
                  />
                  Impuestos
                </span>
                <span className='font-medium text-foreground'>
                  {formatPrice(pricing.taxes, pricing.currency)}
                </span>
              </div>
            )}
          </div>

          <div className='mt-4 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2.5'>
            <span className='flex items-center gap-2 font-semibold text-foreground'>
              <IconWallet
                size={18}
                className='text-primary'
              />
              Total
            </span>
            <span className='text-lg font-bold text-primary'>
              {formatPrice(pricing.total, pricing.currency)}
            </span>
          </div>

          <p className='mt-2 text-xs text-default-400'>
            {pricing.totalGuests} huéspedes · {pricing.nights}{' '}
            {pricing.nights === 1 ? 'noche' : 'noches'}
          </p>
        </div>
      )}

      <Button
        className='mt-4 text-white'
        radius='full'
        variant='solid'
        color='primary'
        isDisabled={!hasValidRange || !pricing || isLoading}
        onPress={handleReserve}
      >
        Reservar ahora
      </Button>

      {(listing.defaultCheckInTime || listing.defaultCheckOutTime) && (
        <p className='mt-3 flex items-center gap-1 text-xs text-default-500'>
          <IconClock size={14} />
          Check-in {listing.defaultCheckInTime} · Check-out{' '}
          {listing.defaultCheckOutTime}
        </p>
      )}
    </Card>
  );
};

export default BookingWidget;
