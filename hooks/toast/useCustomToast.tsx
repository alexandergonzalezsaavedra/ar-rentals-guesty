'use client';

import type { RefObject } from 'react';
import { addToast } from '@heroui/react';
import confetti from 'canvas-confetti';
import { Heart, HeartCrack } from 'lucide-react';

export const useCustomToast = () => {
  // Brand palette (see heroui.plugin.js): Sierra, Salvia, Arena, Arena tostada.
  const colors = ['#243a2c', '#7c9a82', '#e3d3b8', '#7a6246'];

  // `isFavorite` is the state *before* toggling: false means the property is
  // about to be added (congrats + confetti), true means it's about to be removed.
  const favoriteProperty = (
    isFavorite: boolean,
    propertyTitle: string,
    buttonRef: RefObject<HTMLButtonElement | null>,
  ) => {
    addToast({
      title: !isFavorite ? '🥳 ¡Felicidades!' : '😔 Se eliminó de tus favoritos',
      description: !isFavorite
        ? `${propertyTitle} está ahora en tus favoritos`
        : `${propertyTitle}`,
      color: 'default',
      variant: !isFavorite ? 'bordered' : 'flat',
      radius: 'lg',
      icon: !isFavorite ? <Heart /> : <HeartCrack />,
      // Removal stands out in warm Arena / Arena tostada instead of HeroUI's red.
      classNames: !isFavorite
        ? { icon: 'text-danger fill-none' }
        : {
            base: 'border border-arena-tostada/40 bg-arena dark:border-arena/30 dark:bg-arena-tostada/40',
            title: 'text-arena-tostada dark:text-arena',
            description: 'text-arena-tostada/90 dark:text-arena/90',
            icon: 'text-arena-tostada fill-none dark:text-arena',
            closeButton: 'text-arena-tostada dark:text-arena',
          },
    });

    if (buttonRef.current && !isFavorite) {
      confetti({
        particleCount: 200,
        angle: 60,
        spread: 150,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 200,
        angle: 120,
        spread: 150,
        origin: { x: 1 },
        colors,
      });
    }
  };

  return { favoriteProperty };
};
