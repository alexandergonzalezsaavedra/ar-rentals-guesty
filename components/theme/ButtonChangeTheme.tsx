'use client';

import { useRef } from 'react';
import { Button } from '@heroui/react';
import { IconMoon, IconSun } from '@tabler/icons-react';
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
        className={`bg-white shadow-lg rounded-full ${
          theme === 'dark' ? 'text-primary bg-black' : 'text-primary bg-white'
        }`}
        onPress={handlePress}
        isIconOnly
        size='sm'
      >
        {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
      </Button>
    </>
  );
};

export default ButtonChangeTheme;
