'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@heroui/react';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconHeartFilled,
  IconMail,
  IconMapPin,
  IconPhone,
} from '@tabler/icons-react';

const companyLinks = [
  { label: 'Nosotros', href: '#' },
  { label: 'Servicios', href: '#' },
  { label: 'Contacto', href: '#' },
];

const quickLinks = [
  { label: 'Lugares Turísticos', href: '/lugares-turisticos' },
  { label: 'Vincule su propiedad', href: '#' },
  { label: 'Reserva', href: '/alojamiento' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <div className='bg-black text-white'>
      <div className='container mx-auto grid grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4'>
        <div>
          <Image
            src='/ar-rentals-logo.png'
            alt='AR Rentals - Rentas cortas'
            width={160}
            height={71}
            className='w-40 brightness-0 invert'
          />
        </div>

        <div>
          <h3 className='mb-3 font-semibold text-white'>Empresa</h3>
          <ul className='flex flex-col gap-2 text-sm text-white/70'>
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className='hover:text-white'
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className='mb-3 font-semibold text-white'>Acceso Rápido</h3>
          <ul className='flex flex-col gap-2 text-sm text-white/70'>
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className='hover:text-white'
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className='mb-3 font-semibold text-white'>Contacto</h3>
          <ul className='flex flex-col gap-3 text-sm text-white/70'>
            <li className='flex items-center gap-2'>
              <IconPhone
                size={16}
                className='shrink-0'
              />
              <a href='tel:+573143593612'>+57 314 359 3612</a>
            </li>
            <li className='flex items-center gap-2'>
              <IconMail
                size={16}
                className='shrink-0'
              />
              <a href='mailto:contacto@arrentals.com.co'>
                contacto@arrentals.com.co
              </a>
            </li>
            <li className='flex items-start gap-2'>
              <IconMapPin
                size={16}
                className='mt-0.5 shrink-0'
              />
              <span>
                Calle 22 # 1 - 67 Edificio Reserva del Mar, Playa Salguero,
                Santa Marta.
              </span>
            </li>
          </ul>

          <div className='mt-4 flex gap-2'>
            <Button
              as='a'
              href='https://www.facebook.com/profile.php?id=61556943585357'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-primary shadow-sm'
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
              className='bg-primary shadow-sm'
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
        </div>
      </div>

      <div className='flex items-center justify-center gap-1 border-t border-white/10 py-3 text-center text-xs text-white/70'>
        <span>Hecho con</span>
        <IconHeartFilled
          size={14}
          className='text-danger'
        />
        <span>por AR Rentals</span>
        <span className='mx-1'>-</span>
        <span>Todos los derechos reservados © {year}</span>
      </div>
    </div>
  );
};

export default Footer;
