import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { writeFavorites, writeTheme, type ThemeName } from '@/lib/storage';
import favoritesReducer from './projects/favoritos';
import themeReducer from './slices/theme/themeSlice';

// Saves the favorites and theme slices into the site's single storage object
// (lib/storage) whenever an action changes them.
const persistanceLocalStorageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const type = (action as { type?: string }).type ?? '';

  if (type.startsWith('favorites/')) {
    writeFavorites(store.getState().favorites.favorites);
  } else if (type.startsWith('theme/')) {
    writeTheme(store.getState().theme.theme as ThemeName);
  }

  return result;
};

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistanceLocalStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
