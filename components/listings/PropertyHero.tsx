'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
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

interface PropertyHeroProps {
  listing: GuestyListingDetail;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const PropertyHero = ({ listing }: PropertyHeroProps) => {
  const ratingAvg = listing.reviews.avg;

  return (
    <section
      id='property-hero'
      className='relative flex min-h-[70vh] w-full scroll-mt-20 items-center justify-center overflow-hidden rounded-xl sm:min-h-[85vh]'
    >
      <div className='animate-curtain-reveal absolute inset-0'>
        <Image
          src={listing.picture.large}
          alt={listing.title}
          fill
          priority
          sizes='100vw'
          className='animate-kenburns object-cover'
        />
        <div className='absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/65' />
      </div>

      <div className='relative z-10 flex flex-col items-center gap-4 px-6 text-center'>
        <motion.div
          className='flex flex-col items-center gap-2'
          initial={{ opacity: 0, y: -28, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
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
        </motion.div>

        <motion.div
          className='flex flex-col items-center gap-4'
          initial={{ opacity: 0, y: 28, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
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
            className='font-bold text-white'
            onPress={() => scrollToId('booking-widget')}
          >
            Ver disponibilidad <IconCalendarHeart size={25} />
          </Button>
        </motion.div>
      </div>

      <button
        type='button'
        aria-label='Desplazarse hacia la siguiente sección'
        onClick={() => scrollToId('property-overview')}
        className='absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white cursor-pointer'
      >
        <IconChevronDown size={40} />
      </button>
    </section>
  );
};

export default PropertyHero;
