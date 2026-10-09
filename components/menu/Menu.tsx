'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from '@heroui/react';
import Image from 'next/image';
import ButtonChangeTheme from '../theme/ButtonChangeTheme';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconHeart,
  IconMap2,
} from '@tabler/icons-react';
import { ConciergeBell } from 'lucide-react';
import { useReveal } from '@/components/home/RevealContext';
import { useFavorites } from '@/hooks/favorites/useFavorites';

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const Menu = () => {
  const pathname = usePathname();
  const revealed = useReveal();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isAlojamientoActive = isActivePath(pathname, '/alojamiento');
  const isDestinosActive = isActivePath(pathname, '/lugares-turisticos');

  const { favorites } = useFavorites();
  const favoritesCount = Object.keys(favorites).length;

  const mobileMenuItems = [
    {
      label: 'Alojamiento',
      href: '/alojamiento',
      icon: ConciergeBell,
      isActive: isAlojamientoActive,
    },
    {
      label: 'Destinos',
      href: '/lugares-turisticos',
      icon: IconMap2,
      isActive: isDestinosActive,
    },
  ];

  const navbar = (
    <Navbar
      maxWidth='2xl'
      position='sticky'
      isBlurred={false}
      classNames={{ base: 'z-50', menu: 'z-50 bg-background' }}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className='sm:hidden'
        />
        <NavbarBrand>
          <Link href='/'>
            <Image
              src='/ar-rentals-logo.png'
              alt='AR Rentals - Rentas cortas'
              width={100}
              height={48}
              loading='eager'
              className='h-12 w-[100px]'
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className='hidden sm:flex'
        justify='center'
      >
        <NavbarItem>
          <div className='flex items-center gap-1 rounded-full border border-default-200/60 bg-content2/60 px-2 py-1 backdrop-blur-md'>
            <Button
              as='a'
              href='/alojamiento'
              radius='full'
              size='sm'
              variant={isAlojamientoActive ? 'solid' : 'light'}
              className={
                isAlojamientoActive
                  ? 'group bg-content1 text-foreground font-semibold shadow-sm'
                  : 'group bg-transparent text-default-500 font-medium'
              }
            >
              <span className='flex flex-row items-center gap-1'>
                <ConciergeBell
                  className={`${isAlojamientoActive ? 'text-primary' : 'text-default'} transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110`}
                  size={18}
                />
                Alojamiento
              </span>
            </Button>
            <Button
              as='a'
              href='/lugares-turisticos'
              radius='full'
              size='sm'
              variant={isDestinosActive ? 'solid' : 'light'}
              className={
                isDestinosActive
                  ? 'group bg-content1 text-foreground font-semibold shadow-sm'
                  : 'group bg-transparent text-default-500 font-medium'
              }
            >
              <span className='flex flex-row items-center gap-1'>
                <IconMap2
                  className={`${isDestinosActive ? 'text-primary' : 'text-default'} transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110`}
                  size={18}
                />
                Destinos
              </span>
            </Button>
          </div>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent
        justify='end'
        className='gap-1'
      >
        {favoritesCount > 0 && (
          <NavbarItem>
            <Button
              as={Link}
              href='/favoritos'
              aria-label='Ver favoritos'
              color='default'
              variant='light'
              radius='full'
              className='min-w-0 gap-0 px-2'
            >
              <IconHeart
                className='animate-pulse'
                size={20}
              />
              <span className='flex size-4 items-center justify-center rounded-full bg-danger text-[8px] text-white'>
                {favoritesCount}
              </span>
            </Button>
          </NavbarItem>
        )}
        <div className='flex items-center gap-1 rounded-full border border-default-200/60 bg-content2/60 px-1.5 py-1 backdrop-blur-md'>
          <ButtonChangeTheme />
          <Button
            as='a'
            href='https://www.facebook.com/profile.php?id=61556943585357'
            target='_blank'
            rel='noopener noreferrer'
            className='bg-primary shadow-sm rounded-full'
            isIconOnly
            radius='full'
            size='sm'
          >
            <IconBrandFacebook
              className='text-white'
              size={20}
            />
          </Button>
          <Button
            as='a'
            href='https://www.instagram.com/arrentalsoficial/'
            target='_blank'
            rel='noopener noreferrer'
            className='bg-primary shadow-sm rounded-full'
            isIconOnly
            radius='full'
            size='sm'
          >
            <IconBrandInstagram
              className='text-white'
              size={20}
            />
          </Button>
        </div>
      </NavbarContent>
      {/* Menú móviles */}
      <NavbarMenu>
        <div className='grid grid-cols-2 gap-4 pt-6'>
          {mobileMenuItems.map(({ label, href, icon: Icon, isActive }) => (
            <NavbarMenuItem key={label}>
              <Link
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex flex-col items-center gap-3 rounded-2xl p-5 text-center shadow-lg transition-transform active:scale-95 ${
                  isActive
                    ? 'bg-primary/10 shadow-primary/20 ring-2 ring-primary'
                    : 'bg-content1 shadow-default-200/70 dark:shadow-black/40'
                }`}
              >
                <span
                  className={`flex size-14 items-center justify-center rounded-full ${
                    isActive ? 'bg-primary/20' : 'bg-primary/10'
                  }`}
                >
                  <Icon
                    size={28}
                    className='text-primary'
                  />
                </span>
                <span className='text-sm font-semibold text-foreground'>
                  {label}
                </span>
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </Navbar>
  );

  if (revealed === null) {
    return navbar;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, filter: 'blur(10px)' }}
      animate={
        revealed
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: -12, filter: 'blur(10px)' }
      }
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {navbar}
    </motion.div>
  );
};

export default Menu;
