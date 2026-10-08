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

const linkGroups = [
  { title: 'Empresa', links: companyLinks },
  { title: 'Acceso Rápido', links: quickLinks },
];

const PHONE_HREF = 'tel:+573143593612';
const PHONE_LABEL = '+57 314 359 3612';
const EMAIL = 'contacto@arrentals.com.co';
const ADDRESS = 'Calle 22 # 1 - 67 Edificio Reserva del Mar, Playa Salguero, Santa Marta.';

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61556943585357',
    icon: IconBrandFacebook,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/arrentalsoficial/',
    icon: IconBrandInstagram,
  },
];

const SocialButtons = ({ size }: { size: 'sm' | 'md' }) => (
  <>
    {socialLinks.map(({ label, href, icon: SocialIcon }) => (
      <Button
        key={label}
        as='a'
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={label}
        className='bg-primary shadow-sm'
        isIconOnly
        radius='full'
        size={size}
      >
        <SocialIcon
          className='text-white'
          size={size === 'md' ? 22 : 20}
        />
      </Button>
    ))}
  </>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <div className='bg-black text-white'>
      {/* Phones: one centered column. Link groups read as short inline rows and the contact details become tap targets, instead of a shrunk copy of the desktop grid. */}
      <div className='flex flex-col items-center gap-9 px-6 pt-12 pb-10 text-center sm:hidden'>
        <Image
          src='/ar-rentals-logo.png'
          alt='AR Rentals - Rentas cortas'
          width={160}
          height={71}
          className='w-44 brightness-0 invert'
        />

        {linkGroups.map(({ title, links }) => (
          <div key={title}>
            <h3 className='text-[11px] font-semibold tracking-[0.2em] text-white/50 uppercase'>{title}</h3>
            <ul className='mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm'>
              {links.map((link, index) => (
                <li
                  key={link.label}
                  className='flex items-center gap-2'
                >
                  {index > 0 && <span className='size-1 rounded-full bg-primary' />}
                  <Link
                    href={link.href}
                    className='py-1 text-white/90 active:text-primary'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className='flex w-full max-w-xs flex-col items-center gap-3'>
          <h3 className='text-[11px] font-semibold tracking-[0.2em] text-white/50 uppercase'>Contacto</h3>
          <a
            href={PHONE_HREF}
            className='flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium active:bg-white/10'
          >
            <IconPhone
              size={18}
              className='shrink-0 text-primary'
            />
            {PHONE_LABEL}
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className='flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium active:bg-white/10'
          >
            <IconMail
              size={18}
              className='shrink-0 text-primary'
            />
            {EMAIL}
          </a>
          <p className='mt-1 flex flex-col items-center gap-1.5 text-sm text-white/60'>
            <IconMapPin
              size={18}
              className='text-primary'
            />
            <span className='text-balance'>{ADDRESS}</span>
          </p>
        </div>

        <div className='flex gap-3'>
          <SocialButtons size='md' />
        </div>
      </div>

      {/* sm and up: the left-aligned column grid. */}
      <div className='w-full hidden grid-cols-2 gap-10 px-4 py-12 sm:grid lg:grid-cols-4'>
        <div>
          <Image
            src='/ar-rentals-logo.png'
            alt='AR Rentals - Rentas cortas'
            width={160}
            height={71}
            className='w-40 brightness-0 invert'
          />
        </div>

        {linkGroups.map(({ title, links }) => (
          <div key={title}>
            <h3 className='mb-3 font-semibold text-white'>{title}</h3>
            <ul className='flex flex-col gap-2 text-sm text-white/70'>
              {links.map((link) => (
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
        ))}

        <div>
          <h3 className='mb-3 font-semibold text-white'>Contacto</h3>
          <ul className='flex flex-col gap-3 text-sm text-white/70'>
            <li className='flex items-center gap-2'>
              <IconPhone
                size={16}
                className='shrink-0'
              />
              <a href={PHONE_HREF}>{PHONE_LABEL}</a>
            </li>
            <li className='flex items-center gap-2'>
              <IconMail
                size={16}
                className='shrink-0'
              />
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li className='flex items-start gap-2'>
              <IconMapPin
                size={16}
                className='mt-0.5 shrink-0'
              />
              <span>{ADDRESS}</span>
            </li>
          </ul>

          <div className='mt-4 flex gap-2'>
            <SocialButtons size='sm' />
          </div>
        </div>
      </div>

      <div className='site-footer-bottom flex flex-wrap items-center justify-center gap-1 border-t border-white/10 px-4 pt-4 pb-6 text-center text-xs text-white/70 sm:py-3'>
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
