'use client';

import {
  IconBrandWhatsapp,
  IconCalendarCheck,
  IconChecklist,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { EASE_BRAND } from '@/lib/easing';
import { scrollToPropertySection } from './propertySections';

// AR Rentals' contact line (same number shown in the footer).
const WHATSAPP_NUMBER = '573143593612';

interface MobileBookingNavProps {
  title: string;
  hasDescription: boolean;
  hasAmenities: boolean;
  hasLocation: boolean;
}

const MobileBookingNav = ({
  title,
  hasDescription,
  hasAmenities,
  hasLocation,
}: MobileBookingNavProps) => {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, quiero más información sobre ${title}`,
  )}`;

  return (
    // Mobile only (hidden from lg): rises from below the screen shortly after the page loads.
    <motion.nav
      data-mobile-booking-nav
      initial={{ y: '110%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: EASE_BRAND }}
      className='fixed inset-x-0 bottom-0 z-40 lg:hidden'
    >
      <div className='relative grid grid-cols-[1fr_136px_1fr] items-center border-t border-slate-100 bg-content1/95 px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur dark:border-slate-800'>
        <div className='flex items-center justify-evenly'>
          {hasDescription && (
            <button
              type='button'
              onClick={() => scrollToPropertySection('property-description')}
              className='flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95'
            >
              <IconInfoCircle size={20} />
              <span className='text-[9px] font-medium'>Descripción</span>
            </button>
          )}
          {hasAmenities && (
            <button
              type='button'
              onClick={() => scrollToPropertySection('property-amenities')}
              className='flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95'
            >
              <IconChecklist size={20} />
              <span className='text-[9px] font-medium'>Comodidades</span>
            </button>
          )}
        </div>

        <div />

        <div className='flex items-center justify-evenly'>
          {hasLocation && (
            <button
              type='button'
              onClick={() => scrollToPropertySection('property-location')}
              className='flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95'
            >
              <IconMapPin size={20} />
              <span className='text-[9px] font-medium'>Mapa</span>
            </button>
          )}
          <button
            type='button'
            onClick={() => scrollToPropertySection('property-gallery')}
            className='flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95'
          >
            <IconPhoto size={20} />
            <span className='text-[9px] font-medium'>Galería</span>
          </button>
        </div>
      </div>

      {/* The two actions that matter most sit raised in the middle: book, or ask on WhatsApp. */}
      <div className='absolute bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 items-center gap-3'>
        <a
          href={whatsappHref}
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Escribir por WhatsApp'
          className='flex size-14 items-center justify-center rounded-full border-2 border-primary bg-white text-primary shadow-lg ring-4 ring-background active:scale-95'
        >
          <IconBrandWhatsapp size={26} />
        </a>
        <button
          type='button'
          onClick={() => scrollToPropertySection('booking-widget')}
          aria-label='Ir a reservar'
          className='flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-background active:scale-95'
        >
          <IconCalendarCheck size={24} />
        </button>
      </div>
    </motion.nav>
  );
};

export default MobileBookingNav;
