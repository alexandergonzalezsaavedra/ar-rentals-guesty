'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/store';
import { setTheme } from '../../store/slices/theme/themeSlice';

interface ThemeChangeOrigin {
  x: number;
  y: number;
}

export const useSetTheme = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const storageTheme = localStorage.getItem('ar-rentals-theme') ?? '';
    if (storageTheme) {
      dispatch(setTheme(storageTheme));
    }
  }, [dispatch]);
  const { theme } = useAppSelector((state) => state.theme);
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const changeTheme = (origin?: ThemeChangeOrigin) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    const canAnimate =
      origin &&
      typeof document.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!canAnimate) {
      dispatch(setTheme(nextTheme));
      return;
    }

    const { x, y } = origin;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      dispatch(setTheme(nextTheme));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return { changeTheme, theme };
};
