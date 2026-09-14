'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import { IconBath, IconBed, IconBookmark, IconCalendar, IconMapPin, IconStarFilled, IconUsers } from '@tabler/icons-react';
import type { GuestyListing } from '@/lib/guesty/listings';
import { buildCitySlug, buildTitleSlug } from '@/lib/guesty/slug';

interface PropertyCardProps {
  listing: GuestyListing;
  checkIn?: string;
  checkOut?: string;
  adults?: string;
  childrenCount?: string;
  index?: number;
}

// Base rate covers up to 4 guests; beyond that, add a flat per-person, per-night surcharge.
const BASE_OCCUPANCY = 4;
const EXTRA_GUEST_SURCHARGE = 60000;

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function formatPrice(amount: number, currency: string): string {
  let formatter = currencyFormatters.get(currency);

  if (!formatter) {
    formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    currencyFormatters.set(currency, formatter);
  }

  return formatter.format(amount);
}

function scrollToFilters() {
  document.getElementById('booking-filters')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const PropertyCard = ({ listing, checkIn, checkOut, adults, childrenCount, index = 0 }: PropertyCardProps) => {
  const detailParams = new URLSearchParams();
  if (checkIn) detailParams.set('checkIn', checkIn);
  if (checkOut) detailParams.set('checkOut', checkOut);
  if (adults) detailParams.set('adults', adults);
  if (childrenCount) detailParams.set('children', childrenCount);
  const detailQuery = detailParams.toString();
  const detailHref = `/propiedades/${buildCitySlug(listing)}/${buildTitleSlug(listing)}${detailQuery ? `?${detailQuery}` : ''}`;

  const nightlyValues = listing.nightlyRates ? Object.values(listing.nightlyRates) : [];
  const hasDates = nightlyValues.length > 0;
  const avgNightly = hasDates
    ? nightlyValues.reduce((sum, value) => sum + value, 0) / nightlyValues.length
    : listing.prices.basePrice;
  const isDeal = hasDates && avgNightly < listing.prices.basePrice;

  const totalGuests = Number(adults ?? 0) + Number(childrenCount ?? 0);
  const extraGuests = Math.max(0, totalGuests - BASE_OCCUPANCY);
  const nightlyPrice = avgNightly + extraGuests * EXTRA_GUEST_SURCHARGE;

  const allotmentValues = listing.allotment ? Object.values(listing.allotment) : [];
  const isLastUnit = allotmentValues.length > 0 && Math.min(...allotmentValues) <= 1;

  const ratingAvg = listing.reviews.avg;

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(12px)', y: 24 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.4), ease: 'easeOut' }}
    >
      <Card
        shadow='sm'
        className='overflow-visible'
      >
        <div className='relative aspect-4/3 w-full'>
          <Image
            src={listing.picture.regular}
            alt={listing.title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
            className='object-cover rounded-t-lg'
          />

          {isDeal && (
            <Chip
              color='primary'
              size='sm'
              className='absolute top-2 left-2 shadow'
            >
              Oferta limitada
            </Chip>
          )}

          <Button
            isIconOnly
            size='sm'
            radius='full'
            aria-label='Guardar propiedad'
            className='absolute top-2 right-2 bg-white/90 text-default-700'
          >
            <IconBookmark size={16} />
          </Button>

          {ratingAvg !== null && listing.reviews.total > 0 && (
            <Chip
              size='sm'
              className='absolute bottom-2 left-2 bg-white/95 text-default-900 font-semibold'
              startContent={
                <IconStarFilled
                  size={12}
                  className='text-warning'
                />
              }
            >
              {ratingAvg.toFixed(1)} ({listing.reviews.total})
            </Chip>
          )}
        </div>

        <CardBody className='gap-1 p-3'>
          <h3 className='font-semibold text-sm line-clamp-1'>{listing.title}</h3>

          <div className='flex items-center gap-1 text-xs text-default-500'>
            <IconMapPin size={14} />
            <span className='line-clamp-1'>
              {listing.address.city}
              {listing.address.state ? `, ${listing.address.state}` : ''}
            </span>
          </div>

          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-default-500'>
            <span
              className='flex items-center gap-1'
              title='Huéspedes'
            >
              <IconUsers size={14} />
              {listing.accommodates} huéspedes
            </span>
            <span
              className='flex items-center gap-1'
              title='Habitaciones'
            >
              <IconBed size={14} />
              {listing.bedrooms} hab.
            </span>
            <span
              className='flex items-center gap-1'
              title='Baños'
            >
              <IconBath size={14} />
              {listing.bathrooms} baños
            </span>
          </div>

          <div className='flex items-baseline gap-2 mt-1'>
            {isDeal && (
              <span className='text-xs text-default-400 line-through'>
                {formatPrice(listing.prices.basePrice, listing.prices.currency)}
              </span>
            )}
            <span className='text-base font-bold text-danger'>
              {formatPrice(Math.round(nightlyPrice), listing.prices.currency)}
            </span>
            <span className='text-xs text-default-500'>precio por noche</span>
          </div>
          {extraGuests > 0 && (
            <p className='text-xs text-default-400'>Incluye suplemento por {extraGuests} huésped(es) adicional(es)</p>
          )}

          {!hasDates && (
            <Button
              type='button'
              variant='light'
              color='primary'
              size='sm'
              className='justify-start px-0 h-auto min-h-0 mt-0.5'
              startContent={<IconCalendar size={14} />}
              onPress={scrollToFilters}
            >
              Elegir fecha para ver disponibilidad
            </Button>
          )}

          {isLastUnit && <p className='text-xs text-danger'>Última unidad disponible a este precio</p>}

          <Button
            as={Link}
            href={detailHref}
            color='primary'
            size='sm'
            className='w-full mt-2'
          >
            Reservar
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default PropertyCard;
