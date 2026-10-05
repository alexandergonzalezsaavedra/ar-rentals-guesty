'use client';

import {
  IconBrandWhatsapp,
  IconCalendarCheck,
  IconChecklist,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
} from '@tabler/icons-react';
import ShareButton from './ShareButton';

// AR Rentals' contact line (same number shown in the footer).
const WHATSAPP_NUMBER = '573143593612';

interface MobileBookingNavProps {
  title: string;
  hasDescription: boolean;
  hasAmenities: boolean;
  hasLocation: boolean;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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
    <nav className='fixed inset-x-0 bottom-0 z-40 lg:hidden'>
      <div className='relative grid grid-cols-[1fr_64px_1fr] items-center border-t border-slate-100 bg-content1/95 px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur dark:border-slate-800'>
        <div className='flex items-center justify-evenly'>
          {hasDescription && (
            <button
              type='button'
              onClick={() => scrollToId('property-description')}
              className='flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95'
            >
              <IconInfoCircle size={20} />
              <span className='text-[9px] font-medium'>Descripción</span>
            </button>
          )}
          <button
            type='button'
            onClick={() => scrollToId('property-gallery')}
            className='flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95'
          >
            <IconPhoto size={20} />
            <span className='text-[9px] font-medium'>Galería</span>
          </button>
          {hasLocation && (
            <button
              type='button'
              onClick={() => scrollToId('property-location')}
              className='flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95'
            >
              <IconMapPin size={20} />
              <span className='text-[9px] font-medium'>Mapa</span>
            </button>
          )}
        </div>

        <div />

        <div className='flex items-center justify-evenly'>
          {hasAmenities && (
            <button
              type='button'
              onClick={() => scrollToId('property-amenities')}
              className='flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95'
            >
              <IconChecklist size={20} />
              <span className='text-[9px] font-medium'>Comodidades</span>
            </button>
          )}
          <ShareButton
            title={title}
            variant='nav'
          />
          <a
            href={whatsappHref}
            target='_blank'
            rel='noopener noreferrer'
            className='flex flex-col items-center gap-1 px-1 py-1 text-default-500 active:scale-95'
          >
            <IconBrandWhatsapp
              size={20}
              className='text-[#25D366]'
            />
            <span className='text-[9px] font-medium'>WhatsApp</span>
          </a>
        </div>
      </div>

      <button
        type='button'
        onClick={() => scrollToId('booking-widget')}
        aria-label='Ir a reservar'
        className='absolute bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-background active:scale-95'
      >
        <IconCalendarCheck size={24} />
      </button>
    </nav>
  );
};

export default MobileBookingNav;
