import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GuestyListing } from '@/lib/guesty/listings';

interface FavoritesState {
  favorites: Record<string, GuestyListing>;
}

const initialState: FavoritesState = {
  favorites: {},
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites(state, action: PayloadAction<Record<string, GuestyListing>>) {
      state.favorites = action.payload;
    },

    toggleFavorite(state, action: PayloadAction<GuestyListing>) {
      const listing = action.payload;

      if (state.favorites[listing._id]) {
        delete state.favorites[listing._id];
      } else {
        state.favorites[listing._id] = listing;
      }

      localStorage.setItem('ar-rentals-favorites', JSON.stringify(state.favorites));
    },
  },
});

export const { toggleFavorite, setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
