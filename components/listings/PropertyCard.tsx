'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Card, CardBody, Chip, Tooltip } from '@heroui/react';
import {
  IconBath,
  IconBed,
  IconBookmark,
  IconCalendar,
  IconHeart,
  IconHeartFilled,
  IconMapPin,
  IconStarFilled,
  IconUsers,
} from '@tabler/icons-react';
import { useFavorites } from '@/hooks/favorites/useFavorites';
import { useCustomToast } from '@/hooks/toast/useCustomToast';
import type { GuestyListing } from '@/lib/guesty/listings';
import { buildCitySlug, buildTitleSlug } from '@/lib/guesty/slug';
import { ConciergeBell } from 'lucide-react';

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
  document
    .getElementById('booking-filters')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const PropertyCard = ({
  listing,
  checkIn,
  checkOut,
  adults,
  childrenCount,
  index = 0,
}: PropertyCardProps) => {
  const detailParams = new URLSearchParams();
  if (checkIn) detailParams.set('checkIn', checkIn);
  if (checkOut) detailParams.set('checkOut', checkOut);
  if (adults) detailParams.set('adults', adults);
  if (childrenCount) detailParams.set('children', childrenCount);
  const detailQuery = detailParams.toString();
  const detailHref = `/alojamiento/${buildCitySlug(listing)}/${buildTitleSlug(listing)}${detailQuery ? `?${detailQuery}` : ''}`;

  const nightlyValues = listing.nightlyRates
    ? Object.values(listing.nightlyRates)
    : [];
  const hasDates = nightlyValues.length > 0;
  const avgNightly = hasDates
    ? nightlyValues.reduce((sum, value) => sum + value, 0) /
      nightlyValues.length
    : listing.prices.basePrice;
  const isDeal = hasDates && avgNightly < listing.prices.basePrice;

  const totalGuests = Number(adults ?? 0) + Number(childrenCount ?? 0);
  const extraGuests = Math.max(0, totalGuests - BASE_OCCUPANCY);
  const nightlyPrice = avgNightly + extraGuests * EXTRA_GUEST_SURCHARGE;

  const allotmentValues = listing.allotment
    ? Object.values(listing.allotment)
    : [];
  const isLastUnit =
    allotmentValues.length > 0 && Math.min(...allotmentValues) <= 1;

  const ratingAvg = listing.reviews.avg;

  const { isFavorite, toggle } = useFavorites();
  const { favoriteProperty } = useCustomToast();
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const isFav = isFavorite(listing._id);

  const handleToggleFavorite = () => {
    favoriteProperty(isFav, listing.title, favoriteButtonRef);
    toggle(listing);
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(12px)', y: 24 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.08, 0.4),
        ease: 'easeOut',
      }}
    >
      <Card
        shadow='sm'
        className='group overflow-visible p-3'
      >
        <div className='relative aspect-4/3 w-full overflow-hidden rounded-[14px]'>
          <Image
            src={listing.picture.regular}
            alt={listing.title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
            className='object-cover rounded-[14px] transition-transform duration-300 ease-out group-hover:scale-110'
          />

          {/* {isDeal && (
            <Chip
              color='primary'
              size='sm'
              className='absolute top-2 left-2 shadow'
            >
              Oferta limitada
            </Chip>
          )} */}

          <Button
            ref={favoriteButtonRef}
            isIconOnly
            size='md'
            radius='full'
            aria-label={isFav ? 'Quitar de favoritos' : 'Guardar propiedad'}
            className='absolute top-2 right-2 bg-white/90 text-default-700'
            onPress={handleToggleFavorite}
          >
            {isFav ? (
              <IconHeartFilled
                className='text-danger'
                size={16}
              />
            ) : (
              <IconHeart
                className='text-slate-600'
                size={16}
              />
            )}
          </Button>
        </div>

        <CardBody className='gap-1 p-3'>
          <Tooltip content={listing.title}>
            <h3 className='font-semibold text-sm line-clamp-1 text-center'>
              {listing.title}
            </h3>
          </Tooltip>

          <div className='flex items-center gap-1 text-xs text-default-500 justify-center mb-2'>
            <IconMapPin size={14} />
            <span className='line-clamp-1'>
              {listing.address.city}
              {listing.address.state ? `, ${listing.address.state}` : ''}
            </span>
          </div>

          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-xs text-default-500'>
            <span
              className='flex items-center gap-1.5'
              title='Huéspedes'
            >
              <span className='flex items-center justify-center rounded-md p-2 bg-content2'>
                <IconUsers
                  size={16}
                  strokeWidth={1.5}
                  className='text-default-500'
                />
              </span>
              {listing.accommodates} huéspedes
            </span>
            <span
              className='flex items-center gap-1.5'
              title='Habitaciones'
            >
              <span className='flex items-center justify-center rounded-md p-2 bg-content2'>
                <IconBed
                  size={16}
                  strokeWidth={1.5}
                  className='text-default-500'
                />
              </span>
              {listing.bedrooms} hab.
            </span>
            <span
              className='flex items-center gap-1.5'
              title='Baños'
            >
              <span className='flex items-center justify-center rounded-md p-2 bg-content2'>
                <IconBath
                  size={16}
                  strokeWidth={1.5}
                  className='text-default-500'
                />
              </span>
              {listing.bathrooms} baños
            </span>
          </div>

          <div className='flex items-baseline gap-2'>
            {/* {isDeal && (
              <span className='text-xs text-default-400 line-through'>
                {formatPrice(listing.prices.basePrice, listing.prices.currency)}
              </span>
            )} */}
            <div className='w-full text-center'>
              <span className='font-bold text-primary text-3xl'>
                {formatPrice(Math.round(nightlyPrice), listing.prices.currency)}{' '}
                <small className='text-default-400'>COP</small>
              </span>
              <div className='text-xs text-default-500 font-bold'>
                precio por noche
              </div>
            </div>
          </div>
          {extraGuests > 0 && (
            <p className='text-xs text-default-400'>
              Incluye suplemento por {extraGuests} huésped(es) adicional(es)
            </p>
          )}

          {!hasDates && (
            <Button
              type='button'
              variant='light'
              color='primary'
              size='md'
              className='justify-center p-2 h-auto min-h-0 mt-0.5'
              startContent={<IconCalendar size={14} />}
              radius='full'
              onPress={scrollToFilters}
            >
              Elegir fecha para ver disponibilidad
            </Button>
          )}

          {/* {isLastUnit && (
            <p className='text-xs text-danger'>
              Última unidad disponible a este precio
            </p>
          )} */}

          <Button
            as={Link}
            href={detailHref}
            color='primary'
            size='md'
            className='w-full mt-2 text-white font-bold'
            radius='full'
          >
            Reservar <ConciergeBell size={18} />
          </Button>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default PropertyCard;
