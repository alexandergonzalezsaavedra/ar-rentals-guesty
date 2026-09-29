'use client';

import Image from 'next/image';
import { Button } from '@heroui/react';
import {
  IconBath,
  IconBed,
  IconCalendarHeart,
  IconChevronDown,
  IconStarFilled,
  IconUsers,
} from '@tabler/icons-react';
import type { GuestyListingDetail } from '@/lib/guesty/listings';
import ShareButton from './ShareButton';

interface PropertyHeroProps {
  listing: GuestyListingDetail;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const PropertyHero = ({ listing }: PropertyHeroProps) => {
  const ratingAvg = listing.reviews.avg;

  return (
    <section className='relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden sm:min-h-[85vh] rounded-xl'>
      <div className='absolute inset-0'>
        <Image
          src={listing.picture.large}
          alt={listing.title}
          fill
          priority
          sizes='100vw'
          className='animate-kenburns object-cover'
        />
      </div>
      <div className='absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/65' />

      <div className='absolute top-4 right-4 z-10 hidden lg:block'>
        <ShareButton title={listing.title} />
      </div>

      <div className='relative z-10 flex flex-col items-center gap-4 px-6 text-center'>
        {/* {ratingAvg !== null && listing.reviews.total > 0 && (
          <span className='flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-default-900 shadow'>
            <IconStarFilled
              size={14}
              className='text-warning'
            />
            {ratingAvg.toFixed(1)} · {listing.reviews.total} reseñas
          </span>
        )} */}

        <h1 className='max-w-3xl text-3xl leading-tight font-bold text-white uppercase drop-shadow-lg sm:text-5xl'>
          {listing.title}
        </h1>

        <span className='text-large font-semibold max-w-xl text-white shadow-md'>
          {listing.address.full}
        </span>

        <div className='flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-xs text-white'>
          <span
            className='flex items-center gap-1.5'
            title='Huéspedes'
          >
            <span className='flex items-center justify-center w-10 h-10 rounded-md p-2 bg-black/40'>
              <IconUsers
                size={20}
                strokeWidth={1.5}
                className='text-white me-1'
              />
              {listing.accommodates}
            </span>
          </span>
          <span
            className='flex items-center gap-1.5'
            title='Habitaciones'
          >
            <span className='flex items-center justify-center w-10 h-10 rounded-md p-2 bg-black/40 text-white'>
              <IconBed
                size={20}
                strokeWidth={1.5}
                className='text-white me-1'
              />
              {listing.bedrooms}
            </span>
          </span>
          <span
            className='flex items-center gap-1.5'
            title='Baños'
          >
            <span className='flex items-center justify-center w-10 h-10 rounded-md p-2 bg-black/40'>
              <IconBath
                size={20}
                strokeWidth={1.5}
                className='text-white me-1'
              />
              {listing.bathrooms}
            </span>
          </span>
        </div>

        <Button
          color='primary'
          radius='full'
          size='lg'
          className='mt-2 font-bold text-white'
          onPress={() => scrollToId('booking-widget')}
        >
          Ver disponibilidad <IconCalendarHeart size={25} />
        </Button>
      </div>

      <button
        type='button'
        aria-label='Desplazarse hacia la galería'
        onClick={() => scrollToId('property-gallery')}
        className='absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white cursor-pointer'
      >
        <IconChevronDown size={40} />
      </button>
    </section>
  );
};

export default PropertyHero;
