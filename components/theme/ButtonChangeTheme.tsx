'use client';

import { Button } from '@heroui/react';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useSetTheme } from '@/hooks/theme/useSetTheme';

const ButtonChangeTheme = () => {
  const { changeTheme, theme } = useSetTheme();
  return (
    <>
      <Button
        className={`bg-linear-to-tr text-white shadow-lg rounded-full ${
          theme === 'dark'
            ? 'from-pink-500 to-yellow-500'
            : 'from-blue-500 to-indigo-500'
        }`}
        onPress={changeTheme}
        isIconOnly
      >
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </Button>
    </>
  );
};

export default ButtonChangeTheme;
