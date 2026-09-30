'use client';

import type { RefObject } from 'react';
import { addToast } from '@heroui/react';
import confetti from 'canvas-confetti';
import { Heart, HeartCrack } from 'lucide-react';

export const useCustomToast = () => {
  const colors = ['#d80915', '#e0e0e0'];

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
      color: !isFavorite ? 'default' : 'danger',
      variant: !isFavorite ? 'bordered' : 'flat',
      radius: 'lg',
      icon: !isFavorite ? <Heart /> : <HeartCrack />,
      classNames: {
        icon: 'text-danger fill-none',
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
