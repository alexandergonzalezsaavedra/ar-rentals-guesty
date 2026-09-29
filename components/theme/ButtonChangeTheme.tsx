'use client';

import { useRef } from 'react';
import { Button } from '@heroui/react';
import { IconContrastFilled } from '@tabler/icons-react';
import { useSetTheme } from '@/hooks/theme/useSetTheme';

const ButtonChangeTheme = () => {
  const { changeTheme, theme } = useSetTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePress = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : undefined;
    changeTheme(origin);
  };

  return (
    <>
      <Button
        ref={buttonRef}
        aria-label={
          theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
        }
        className={`shadow-lg rounded-full ${
          theme === 'dark' ? 'bg-black text-primary' : 'bg-white text-primary'
        }`}
        onPress={handlePress}
        isIconOnly
        size='sm'
      >
        <IconContrastFilled size={18} />
      </Button>
    </>
  );
};

export default ButtonChangeTheme;
