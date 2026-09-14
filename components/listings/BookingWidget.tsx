'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, DatePicker, Spinner } from '@heroui/react';
import Stepper from './Stepper';
import { getLocalTimeZone, parseDate, today, type DateValue } from '@internationalized/date';
import { IconAlertCircle, IconClock } from '@tabler/icons-react';
import type { GuestyListingDetail } from '@/lib/guesty/listings';
import type { ReservationQuoteMoney } from '@/lib/guesty/quotes';

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
  LISTING_IS_NOT_AVAILABLE: 'El inmueble no está disponible para esas fechas (puede no cumplir la estadía mínima, o ya está reservado).',
};

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Business rules: Guesty's own fare already covers an occupancy of 1 to 4 guests
// at a flat rate. Beyond that, we add our own per-person, per-night surcharge,
// and replace Guesty's cleaning fee with our own fixed schedule by bedroom count.
const BASE_OCCUPANCY = 4;
const EXTRA_GUEST_SURCHARGE = 60000;
// 1 hab: $80.000, 2 hab: $100.000, 3 hab: $120.000 (+$20.000 per bedroom).
// Extrapolated the same way for studios (treated as 1 hab) and 4+ bedrooms,
// since those aren't in the documented schedule.
function getCleaningFee(bedrooms: number): number {
  return 60000 + 20000 * Math.max(1, bedrooms);
}

interface PricingBreakdown {
  nights: number;
  totalGuests: number;
  extraGuests: number;
  baseAccommodation: number;
  extraGuestUnitPrice: number;
  extraGuestTotal: number;
  cleaningFee: number;
  taxes: number;
  currency: string;
  total: number;
}

function buildPricingBreakdown(
  money: ReservationQuoteMoney,
  nights: number,
  totalGuests: number,
  bedrooms: number
): PricingBreakdown {
  const extraGuests = Math.max(0, totalGuests - BASE_OCCUPANCY);
  const extraGuestUnitPrice = EXTRA_GUEST_SURCHARGE * nights;
  const extraGuestTotal = extraGuestUnitPrice * extraGuests;
  const cleaningFee = getCleaningFee(bedrooms);
  const taxes = money.totalTaxes ?? 0;

  return {
    nights,
    totalGuests,
    extraGuests,
    baseAccommodation: money.fareAccommodation,
    extraGuestUnitPrice,
    extraGuestTotal,
    cleaningFee,
    taxes,
    currency: money.currency,
    total: money.fareAccommodation + extraGuestTotal + cleaningFee + taxes,
  };
}

const BookingWidget = ({ listing, initialCheckIn, initialCheckOut, initialAdults, initialChildren }: BookingWidgetProps) => {
  const defaultNights = Math.max(1, listing.terms?.minNights ?? 1);
  const maxGuests = Math.max(1, listing.accommodates);
  const minDate = today(getLocalTimeZone());

  const [checkInDate, setCheckInDate] = useState<DateValue>(() =>
    initialCheckIn ? parseDate(initialCheckIn) : minDate.add({ days: 1 })
  );
  const [checkOutDate, setCheckOutDate] = useState<DateValue>(() =>
    initialCheckOut ? parseDate(initialCheckOut) : minDate.add({ days: 1 + defaultNights })
  );
  const [adults, setAdults] = useState(() => String(clamp(initialAdults ? Number(initialAdults) : 2, 1, maxGuests)));
  const [children, setChildren] = useState(() =>
    String(clamp(initialChildren ? Number(initialChildren) : 0, 0, maxGuests - 1))
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
          const code = 'details' in data ? data.details?.error?.code : undefined;

          if (code === 'VALIDATION_ERROR') {
            setError(`La cantidad de huéspedes supera la capacidad del inmueble (máximo ${maxGuests} huéspedes).`);
          } else {
            setError((code && ERROR_MESSAGES[code]) || ('error' in data ? data.error : 'No pudimos consultar disponibilidad.'));
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
          buildPricingBreakdown(ratePlan.ratePlan.money, ratePlan.days.length, Number(adults) + Number(children), listing.bedrooms)
        );
      } catch {
        if (requestId === requestIdRef.current) {
          setError('No pudimos consultar disponibilidad. Intentá de nuevo.');
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

  return (
    <Card
      shadow='sm'
      className='p-4 lg:sticky lg:top-[calc(var(--navbar-height)+1rem)]'
    >
      <div className='flex flex-col gap-3'>
        <div className='grid grid-cols-2 gap-2'>
          <DatePicker
            label='Llegada'
            size='sm'
            value={checkInDate}
            onChange={(value) => value && setCheckInDate(value)}
            minValue={minDate}
          />
          <DatePicker
            label='Salida'
            size='sm'
            value={checkOutDate}
            onChange={(value) => value && setCheckOutDate(value)}
            minValue={checkInDate}
          />
        </div>

        <div className='divide-y divide-default-200'>
          <Stepper
            label='Adultos'
            description='Edad: 13 años o más'
            value={Number(adults)}
            min={1}
            max={maxGuests}
            onChange={(value) => setAdults(String(value))}
          />

          <Stepper
            label='Niños'
            description='Edades 2 – 12'
            value={Number(children)}
            min={0}
            max={maxGuests - 1}
            onChange={(value) => setChildren(String(value))}
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
        <div className='mt-4 border-t border-default-200 pt-3'>
          <table className='w-full text-sm text-default-600 border-collapse'>
            <thead>
              <tr className='text-xs text-default-400'>
                <th className='text-left font-normal pb-1'>Concepto</th>
                <th className='text-right font-normal pb-1'>Valor unidad</th>
                <th className='text-right font-normal pb-1'>Cant.</th>
                <th className='text-right font-normal pb-1'>Valor total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='py-1'>Alojamiento (hasta 4 huéspedes)</td>
                <td className='text-right'>—</td>
                <td className='text-right'>—</td>
                <td className='text-right'>{formatPrice(pricing.baseAccommodation, pricing.currency)}</td>
              </tr>
              {pricing.extraGuests > 0 && (
                <tr>
                  <td className='py-1'>
                    Huéspedes adicionales ({pricing.nights} {pricing.nights === 1 ? 'noche' : 'noches'})
                  </td>
                  <td className='text-right'>{formatPrice(pricing.extraGuestUnitPrice, pricing.currency)}</td>
                  <td className='text-right'>{pricing.extraGuests}</td>
                  <td className='text-right'>{formatPrice(pricing.extraGuestTotal, pricing.currency)}</td>
                </tr>
              )}
              <tr>
                <td className='py-1'>Limpieza</td>
                <td className='text-right'>—</td>
                <td className='text-right'>—</td>
                <td className='text-right'>{formatPrice(pricing.cleaningFee, pricing.currency)}</td>
              </tr>
              {pricing.taxes > 0 && (
                <tr>
                  <td className='py-1'>Impuestos</td>
                  <td className='text-right'>—</td>
                  <td className='text-right'>—</td>
                  <td className='text-right'>{formatPrice(pricing.taxes, pricing.currency)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className='font-bold text-default-900 border-t border-default-200'>
                <td
                  className='pt-2'
                  colSpan={3}
                >
                  Total
                </td>
                <td className='text-right pt-2'>{formatPrice(pricing.total, pricing.currency)}</td>
              </tr>
            </tfoot>
          </table>

          <p className='text-xs text-default-400 mt-2'>
            {pricing.totalGuests} huéspedes · {pricing.nights} {pricing.nights === 1 ? 'noche' : 'noches'}
          </p>
        </div>
      )}

      {(listing.defaultCheckInTime || listing.defaultCheckOutTime) && (
        <p className='mt-3 flex items-center gap-1 text-xs text-default-500'>
          <IconClock size={14} />
          Check-in {listing.defaultCheckInTime} · Check-out {listing.defaultCheckOutTime}
        </p>
      )}
    </Card>
  );
};

export default BookingWidget;
