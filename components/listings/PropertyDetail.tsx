'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Spinner } from '@heroui/react';
import {
  IconBath,
  IconBed,
  IconCheck,
  IconHeart,
  IconHeartFilled,
  IconHome2,
  IconInfoCircle,
  IconChecklist,
  IconKey,
  IconMessageCircle,
  IconNotes,
  IconPhoto,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { useFavorites } from '@/hooks/favorites/useFavorites';
import { useCustomToast } from '@/hooks/toast/useCustomToast';
import type {
  GuestyBedArrangementRoom,
  GuestyListingDetail,
} from '@/lib/guesty/listings';
import BookingWidget from './BookingWidget';
import GridGallery from './GridGallery';
import MobileBookingNav from './MobileBookingNav';
import PropertyDetailSidebar from './PropertyDetailSidebar';
import Reveal from './Reveal';
import ShareButton from './ShareButton';
import HighlightedHeading from '@/components/listings/HighlightedHeading';

const PropertyLocationMap = dynamic(() => import('./PropertyLocationMap'), {
  ssr: false,
  loading: () => (
    <div className='mt-6 flex h-80 w-full items-center justify-center rounded-xl bg-default-50 sm:h-96'>
      <Spinner label='Cargando mapa...' />
    </div>
  ),
});

interface PropertyDetailProps {
  listing: GuestyListingDetail;
  bedArrangements: GuestyBedArrangementRoom[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: string;
  initialChildren?: string;
}

const BED_TYPE_LABELS: Record<string, string> = {
  KING_BED: 'cama king',
  QUEEN_BED: 'cama queen',
  DOUBLE_BED: 'cama doble',
  SINGLE_BED: 'cama individual',
  SOFA_BED: 'sofá cama',
  BUNK_BED: 'litera',
  AIR_MATTRESS: 'colchón inflable',
  FLOOR_MATTRESS: 'colchón en el piso',
  WATER_BED: 'cama de agua',
  TODDLER_BED: 'cama para niños',
  CRIB: 'cuna',
};

const ROOM_NAME_LABELS: Record<string, string> = {
  Bedroom: 'Habitación',
  'Living room': 'Sala',
};

function describeBeds(beds: Record<string, number>): string {
  return Object.entries(beds)
    .filter(([, count]) => count > 0)
    .map(
      ([type, count]) =>
        `${count} ${BED_TYPE_LABELS[type] ?? type.toLowerCase().replace(/_/g, ' ')}`,
    )
    .join(', ');
}

const DESCRIPTION_SECTIONS: {
  key: keyof NonNullable<GuestyListingDetail['publicDescription']>;
  title: string;
  icon: Icon;
}[] = [
  { key: 'summary', title: 'Sobre este alojamiento', icon: IconInfoCircle },
  { key: 'space', title: 'El espacio', icon: IconHome2 },
  { key: 'access', title: 'Acceso de huéspedes', icon: IconKey },
  {
    key: 'interactionWithGuests',
    title: 'Atención durante su estadía',
    icon: IconMessageCircle,
  },
];

const PropertyDetail = ({
  listing,
  bedArrangements,
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  initialChildren,
}: PropertyDetailProps) => {
  const galleryImages = listing.pictures.map((picture) => ({
    url: picture.original,
    name: picture.caption || listing.title,
  }));

  const sleepingRooms = bedArrangements.filter((room) =>
    Object.values(room.beds).some((count) => count > 0),
  );

  const hasDescription = DESCRIPTION_SECTIONS.some(
    ({ key }) => listing.publicDescription?.[key],
  );
  const hasAmenities = listing.amenities.length > 0;
  const hasCoords =
    Number.isFinite(listing.address.lat) &&
    Number.isFinite(listing.address.lng);

  const { isFavorite, toggle } = useFavorites();
  const { favoriteProperty } = useCustomToast();
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const isFav = isFavorite(listing._id);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const stats = [
    {
      icon: IconUsers,
      value: listing.accommodates,
      label: listing.accommodates === 1 ? 'huésped' : 'huéspedes',
    },
    {
      icon: IconBed,
      value: listing.bedrooms,
      label: listing.bedrooms === 1 ? 'habitación' : 'habitaciones',
      detail: `${listing.beds} ${listing.beds === 1 ? 'cama' : 'camas'}`,
    },
    {
      icon: IconBath,
      value: listing.bathrooms,
      label: listing.bathrooms === 1 ? 'baño' : 'baños',
    },
  ];

  const handleToggleFavorite = () => {
    favoriteProperty(isFav, listing.title, favoriteButtonRef);
    toggle(listing);
  };

  return (
    <div className='pb-6 lg:pb-0'>
      {/* Below lg the mobile nav owns the bottom edge, so these sit just above it in the corner; on desktop they float mid-height. */}
      <div className='fixed right-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-center gap-3 sm:right-6 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2'>
        <ShareButton
          title={listing.title}
          className='size-11 sm:size-12 [&_svg]:size-5'
        />

        <button
          ref={favoriteButtonRef}
          type='button'
          onClick={handleToggleFavorite}
          aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          className={`flex size-11 items-center justify-center rounded-full bg-content1 shadow-lg ring-1 ring-default-200 transition-[opacity,transform] active:scale-90 sm:size-12 dark:ring-default-100/20 ${
            isFav ? 'opacity-60 hover:opacity-100' : 'animate-heartbeat'
          }`}
        >
          {isFav ? (
            <>
              <IconHeartFilled
                className='text-default-400 sm:hidden'
                size={20}
              />
              <IconHeartFilled
                className='hidden text-default-400 sm:block'
                size={22}
              />
            </>
          ) : (
            <>
              <IconHeart
                className='text-danger sm:hidden'
                size={20}
              />
              <IconHeart
                className='hidden text-danger sm:block'
                size={22}
              />
            </>
          )}
        </button>
      </div>

      <div
        id='property-overview'
        className='mt-6 scroll-mt-20 lg:flex lg:items-start lg:gap-6'
      >
        <PropertyDetailSidebar
          hasDescription={hasDescription}
          hasAmenities={hasAmenities}
          hasLocation={hasCoords}
          expanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded((value) => !value)}
        />

        <div className='grid gap-8 lg:min-w-0 lg:flex-1 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <div className='flex justify-start mb-8'>
              <HighlightedHeading />
            </div>
            {/* Always three across: stacked and centered on phones so the row stays compact, icon-beside-text from sm up. */}
            <div className='grid grid-cols-3 gap-2 sm:gap-4'>
              {stats.map(({ icon: StatIcon, value, label, detail }, index) => (
                <Reveal
                  key={label}
                  delay={index * 0.12}
                  className='group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-content1 px-2 py-4 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg sm:flex-row sm:gap-4 sm:p-5 sm:text-left dark:border-slate-800'
                >
                  <span className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white sm:size-16'>
                    <StatIcon
                      className='animate-icon-float size-7 sm:size-9'
                      style={{ animationDelay: `${index * 0.4}s` }}
                    />
                  </span>
                  <div className='min-w-0'>
                    <p className='text-2xl leading-none font-bold text-foreground sm:text-3xl'>{value}</p>
                    <p className='mt-1 text-xs font-medium text-default-600 sm:text-sm'>{label}</p>
                    {detail && <p className='text-[11px] text-default-400 sm:text-xs'>{detail}</p>}
                  </div>
                </Reveal>
              ))}
            </div>

            {sleepingRooms.length > 0 && (
              <Reveal className='mt-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-5 shadow-sm'>
                <h2 className='mb-4 flex items-center gap-3 text-xl font-bold sm:text-2xl'>
                  <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <IconBed size={26} />
                  </span>
                  Distribución de camas
                </h2>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-default-600'>
                  {sleepingRooms.map((room) => (
                    <li
                      key={room.roomNumber}
                      className='flex items-start gap-2 rounded-lg bg-content2 p-3'
                    >
                      <IconBed
                        size={22}
                        className='mt-0.5 shrink-0 text-primary'
                      />
                      <div>
                        <p className='font-medium text-default-700'>
                          {ROOM_NAME_LABELS[room.name] ?? room.name}
                        </p>
                        <p>{describeBeds(room.beds)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <div
              id='property-description'
              className='scroll-mt-20'
            >
              {DESCRIPTION_SECTIONS.map(({ key, title, icon: SectionIcon }) => {
                const content = listing.publicDescription?.[key];

                if (!content) {
                  return null;
                }

                return (
                  <Reveal
                    key={key}
                    className='mt-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-5 shadow-sm'
                  >
                    <h2 className='mb-4 flex items-center gap-3 text-xl font-bold sm:text-2xl'>
                      <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                        <SectionIcon size={26} />
                      </span>
                      {title}
                    </h2>
                    <p className='text-default-600 whitespace-pre-line'>
                      {content}
                    </p>
                  </Reveal>
                );
              })}
            </div>

            {/* Galeria */}
            <Reveal
              id='property-gallery'
              className='mt-6 scroll-mt-20 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-5 shadow-sm'
            >
              <h2 className='mb-2 flex items-center gap-3 text-xl font-bold sm:text-2xl'>
                <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <IconPhoto size={26} />
                </span>
                Conoce cada espacio
              </h2>
              <p className='mb-3 text-sm text-default-500'>
                Recorre la propiedad en imágenes y descubre los detalles que
                harán de tu estadía una experiencia inolvidable.
              </p>
              <div className='overflow-hidden rounded-xl'>
                <GridGallery
                  images={galleryImages}
                  quantityImageRow={3}
                />
              </div>
            </Reveal>

            {hasAmenities && (
              <Reveal
                id='property-amenities'
                className='mt-6 scroll-mt-20 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-5 shadow-sm'
              >
                <h2 className='mb-4 flex items-center gap-3 text-xl font-bold sm:text-2xl'>
                  <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <IconChecklist size={26} />
                  </span>
                  Comodidades
                </h2>
                <ul className='grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-default-600'>
                  {listing.amenities.map((amenity, index) => (
                    <motion.li
                      key={amenity}
                      initial={{ opacity: 0, y: 16, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '0px 0px -30px 0px' }}
                      transition={{ duration: 0.4, delay: (index % 3) * 0.06, ease: 'easeOut' }}
                      className='flex items-center gap-2.5 rounded-lg bg-content2 px-3 py-2.5 transition-colors duration-200 hover:bg-primary/10'
                    >
                      <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary'>
                        <IconCheck size={16} />
                      </span>
                      {amenity}
                    </motion.li>
                  ))}
                </ul>
              </Reveal>
            )}

            {hasCoords && (
              <Reveal>
                <PropertyLocationMap
                  lat={listing.address.lat}
                  lng={listing.address.lng}
                  address={listing.address.full}
                />
              </Reveal>
            )}

            {listing.publicDescription?.notes && (
              <Reveal className='mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-5 text-foreground'>
                <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary'>
                  <IconNotes size={26} />
                </span>
                <div>
                  <h2 className='mb-1 text-xl font-bold sm:text-2xl'>
                    Notas importantes
                  </h2>
                  <p className='whitespace-pre-line text-default-700'>
                    {listing.publicDescription.notes}
                  </p>
                </div>
              </Reveal>
            )}
          </div>

          <aside
            id='booking-widget'
            className='scroll-mt-22'
          >
            <BookingWidget
              listing={listing}
              initialCheckIn={initialCheckIn}
              initialCheckOut={initialCheckOut}
              initialAdults={initialAdults}
              initialChildren={initialChildren}
            />
          </aside>
        </div>
      </div>

      <MobileBookingNav
        title={listing.title}
        hasDescription={hasDescription}
        hasAmenities={hasAmenities}
        hasLocation={hasCoords}
      />
    </div>
  );
};

export default PropertyDetail;
