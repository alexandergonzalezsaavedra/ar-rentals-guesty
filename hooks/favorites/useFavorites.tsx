'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setFavorites, toggleFavorite } from '@/store/projects/favoritos';
import type { GuestyListing } from '@/lib/guesty/listings';
import { readFavorites, readStorage } from '@/lib/storage';

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.favorites);

  useEffect(() => {
    // Nothing saved yet: leave the empty list, and don't write one back.
    if (readStorage().favorites.length === 0) {
      return;
    }

    dispatch(setFavorites(readFavorites()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFavorite = (id: string) => Boolean(favorites[id]);
  const toggle = (listing: GuestyListing) => dispatch(toggleFavorite(listing));

  return { favorites, isFavorite, toggle };
};
