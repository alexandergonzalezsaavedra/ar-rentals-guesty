'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setFavorites, toggleFavorite } from '@/store/projects/favoritos';
import type { GuestyListing } from '@/lib/guesty/listings';

const STORAGE_KEY = 'ar-rentals-favorites';

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.favorites);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      dispatch(setFavorites(JSON.parse(stored)));
    } catch {
      // Corrupted localStorage value; ignore and start with an empty list.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFavorite = (id: string) => Boolean(favorites[id]);
  const toggle = (listing: GuestyListing) => dispatch(toggleFavorite(listing));

  return { favorites, isFavorite, toggle };
};
