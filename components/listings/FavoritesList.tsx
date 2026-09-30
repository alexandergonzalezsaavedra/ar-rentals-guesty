'use client';

import Link from 'next/link';
import { Button } from '@heroui/react';
import { IconHeartOff } from '@tabler/icons-react';
import { useFavorites } from '@/hooks/favorites/useFavorites';
import PropertyCard from './PropertyCard';

const FavoritesList = () => {
  const { favorites } = useFavorites();
  const listings = Object.values(favorites);

  if (listings.length === 0) {
    return (
      <div className='flex flex-col items-center gap-4 py-20 text-center'>
        <span className='flex size-16 items-center justify-center rounded-full bg-content2 text-default-400'>
          <IconHeartOff size={32} />
        </span>
        <div>
          <h2 className='text-lg font-semibold text-foreground'>
            Aún no tienes favoritos
          </h2>
          <p className='mt-1 text-sm text-default-500'>
            Toca el corazón en cualquier propiedad para guardarla aquí.
          </p>
        </div>
        <Button
          as={Link}
          href='/alojamiento'
          color='primary'
          radius='full'
          className='text-white'
        >
          Explorar alojamiento
        </Button>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {listings.map((listing, index) => (
        <PropertyCard
          key={listing._id}
          listing={listing}
          index={index}
        />
      ))}
    </div>
  );
};

export default FavoritesList;
