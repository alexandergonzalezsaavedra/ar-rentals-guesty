import Image from 'next/image';
import { IconUsers } from '@tabler/icons-react';
import { formatPrice, formatMonthShort, formatWeekdayLong } from '@/lib/format';
import type { PricingBreakdown } from '@/lib/pricing';
import type { GuestyListingDetail } from '@/lib/guesty/listings';

interface ReservationSummaryProps {
  listing: GuestyListingDetail;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  childrenCount: number;
  pricing: PricingBreakdown;
}

const ReservationSummary = ({
  listing,
  checkIn,
  checkOut,
  adults,
  childrenCount,
  pricing,
}: ReservationSummaryProps) => {
  const totalGuests = adults + childrenCount;

  return (
    <div className='enter-card enter-from-right overflow-hidden rounded-xl border border-slate-100 bg-content1 shadow-sm dark:border-slate-800'>
      <div className='relative h-44 w-full'>
        <Image
          src={listing.picture.large}
          alt={listing.title}
          fill
          sizes='(min-width: 1024px) 400px, 100vw'
          className='object-cover'
        />
      </div>

      <div className='enter-stagger enter-stagger-late p-5'>
        <h2 className='text-lg font-semibold text-foreground'>{listing.title}</h2>
        <p className='mt-1 text-sm text-default-500'>{listing.address.full}</p>

        <div className='mt-4 flex items-stretch overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800'>
          <div className='flex-1 px-3 py-2.5'>
            <p className='text-[11px] font-medium text-default-400'>Llegada</p>
            <p className='mt-0.5 text-lg leading-none font-bold text-foreground'>
              {checkIn.getDate()}
              <span className='ml-1 text-sm font-medium text-default-500'>{formatMonthShort(checkIn)}</span>
            </p>
            <p className='mt-1 text-xs text-default-500'>{formatWeekdayLong(checkIn)}</p>
          </div>

          <div className='flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 border-x border-slate-100 bg-primary/10 px-1 text-primary dark:border-slate-800'>
            <span className='text-base leading-none font-bold'>{pricing.nights}</span>
            <span className='text-[10px] leading-none font-medium'>{pricing.nights === 1 ? 'noche' : 'noches'}</span>
          </div>

          <div className='flex-1 px-3 py-2.5 text-right'>
            <p className='text-[11px] font-medium text-default-400'>Salida</p>
            <p className='mt-0.5 text-lg leading-none font-bold text-foreground'>
              {checkOut.getDate()}
              <span className='ml-1 text-sm font-medium text-default-500'>{formatMonthShort(checkOut)}</span>
            </p>
            <p className='mt-1 text-xs text-default-500'>{formatWeekdayLong(checkOut)}</p>
          </div>
        </div>

        <p className='mt-3 flex items-center gap-1.5 text-sm text-default-600'>
          <IconUsers
            size={16}
            className='text-primary'
          />
          {totalGuests} {totalGuests === 1 ? 'huésped' : 'huéspedes'}
        </p>

        <div className='enter-stagger enter-stagger-late mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm text-default-600 dark:border-slate-800'>
          <div className='flex items-center justify-between'>
            <span>Alojamiento</span>
            <span className='font-medium text-foreground'>
              {formatPrice(pricing.baseAccommodation, pricing.currency)}
            </span>
          </div>
          {pricing.discount > 0 && (
            <div className='flex items-center justify-between'>
              <span>Descuento</span>
              <span className='font-medium text-success'>
                -{formatPrice(pricing.discount, pricing.currency)}
              </span>
            </div>
          )}
          {pricing.cleaningFee > 0 && (
            <div className='flex items-center justify-between'>
              <span>Limpieza</span>
              <span className='font-medium text-foreground'>
                {formatPrice(pricing.cleaningFee, pricing.currency)}
              </span>
            </div>
          )}
          {pricing.taxes > 0 && (
            <div className='flex items-center justify-between'>
              <span>Impuestos</span>
              <span className='font-medium text-foreground'>
                {formatPrice(pricing.taxes, pricing.currency)}
              </span>
            </div>
          )}
        </div>

        <div className='mt-3 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2.5'>
          <span className='font-semibold text-foreground'>Total</span>
          <span className='text-lg font-bold text-primary'>{formatPrice(pricing.total, pricing.currency)}</span>
        </div>
      </div>
    </div>
  );
};

export default ReservationSummary;
