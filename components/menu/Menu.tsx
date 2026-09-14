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
  IconMap2,
} from '@tabler/icons-react';
import { ConciergeBell } from 'lucide-react';
import { useReveal } from '@/components/home/RevealContext';

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const Menu = () => {
  const pathname = usePathname();
  const revealed = useReveal();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isPropiedadesActive = isActivePath(pathname, '/propiedades');
  const isDestinosActive = isActivePath(pathname, '/destinos');

  const menuItems = [
    'Profile',
    'Dashboard',
    'Activity',
    'Analytics',
    'System',
    'Deployments',
    'My Settings',
    'Team Settings',
    'Help & Feedback',
    'Log Out',
  ];

  const navbar = (
    <Navbar
      maxWidth='2xl'
      position='sticky'
      classNames={{ base: 'z-50' }}
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
              className='w-25 h-12'
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
              href='/propiedades'
              radius='full'
              size='sm'
              variant={isPropiedadesActive ? 'solid' : 'light'}
              className={
                isPropiedadesActive
                  ? 'group bg-content1 text-foreground font-semibold shadow-sm'
                  : 'group bg-transparent text-default-500 font-medium'
              }
            >
              <span className='flex flex-row items-center gap-1'>
                <ConciergeBell
                  className={`${isPropiedadesActive ? 'text-primary' : 'text-default'} transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110`}
                  size={18}
                />
                Alojamiento
              </span>
            </Button>
            <Button
              as='a'
              href='/destinos'
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
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className='w-full'
              color={
                index === 2
                  ? 'primary'
                  : index === menuItems.length - 1
                    ? 'danger'
                    : 'foreground'
              }
              href='#'
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
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
