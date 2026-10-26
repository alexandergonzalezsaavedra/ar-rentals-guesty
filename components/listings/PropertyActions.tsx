'use client';

import { useRef } from 'react';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useFavorites } from '@/hooks/favorites/useFavorites';
import { useCustomToast } from '@/hooks/toast/useCustomToast';
import type { GuestyListingDetail } from '@/lib/guesty/listings';
import ShareButton from './ShareButton';

interface PropertyActionsProps {
  listing: GuestyListingDetail;
}

// Share and favorite buttons for a property. The page shows them in more than
// one place (on the hero, under the section menu, above the mobile nav); each
// copy reads the same favorites store, so they always agree.
const PropertyActions = ({ listing }: PropertyActionsProps) => {
  const { isFavorite, toggle } = useFavorites();
  const { favoriteProperty } = useCustomToast();
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const isFav = isFavorite(listing._id);

  const handleToggleFavorite = () => {
    favoriteProperty(isFav, listing.title, favoriteButtonRef);
    toggle(listing);
  };

  return (
    <>
      <ShareButton
        title={listing.title}
        className='size-11 sm:size-12 [&_svg]:size-5'
      />

      <button
        ref={favoriteButtonRef}
        type='button'
        onClick={handleToggleFavorite}
        aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        className={`flex size-11 items-center justify-center rounded-full bg-content1 shadow-lg ring-1 ring-default-200 transition-[opacity,transform] active:scale-90 sm:size-12 dark:ring-default-100/20 ${
          isFav ? 'opacity-60 hover:opacity-100' : 'animate-heartbeat'
        }`}
      >
        {isFav ? (
          <IconHeartFilled className='size-5 text-default-400 sm:size-[22px]' />
        ) : (
          <IconHeart className='size-5 text-danger sm:size-[22px]' />
        )}
      </button>
    </>
  );
};

export default PropertyActions;
