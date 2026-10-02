'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Spinner } from '@heroui/react';
import {
  IconBath,
  IconBed,
  IconCheck,
  IconHeart,
  IconHeartFilled,
  IconHome2,
  IconInfoCircle,
  IconKey,
  IconMessageCircle,
  IconNotes,
  IconSparkles,
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
import ShareButton from './ShareButton';

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
    Number.isFinite(listing.address.lat) && Number.isFinite(listing.address.lng);

  const { isFavorite, toggle } = useFavorites();
  const { favoriteProperty } = useCustomToast();
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const isFav = isFavorite(listing._id);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleToggleFavorite = () => {
    favoriteProperty(isFav, listing.title, favoriteButtonRef);
    toggle(listing);
  };

  return (
    <div className='pb-24 lg:pb-0'>
      <div className='fixed top-1/2 right-3 z-40 flex -translate-y-1/2 flex-col items-center gap-3 sm:right-6'>
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

      <div className='mt-6 lg:flex lg:items-start lg:gap-6'>
        <PropertyDetailSidebar
          hasDescription={hasDescription}
          hasAmenities={hasAmenities}
          hasLocation={hasCoords}
          expanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded((value) => !value)}
        />

        <div className='grid gap-8 lg:min-w-0 lg:flex-1 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <div className='flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-4 shadow-sm'>
              <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconUsers size={24} />
              </span>
              <div>
                <p className='text-lg font-bold text-foreground'>
                  {listing.accommodates}
                </p>
                <p className='text-sm text-default-500'>huéspedes</p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-4 shadow-sm'>
              <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconBed size={24} />
              </span>
              <div>
                <p className='text-lg font-bold text-foreground'>
                  {listing.bedrooms}
                </p>
                <p className='text-sm text-default-500'>
                  habitaciones · {listing.beds} camas
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-4 shadow-sm'>
              <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <IconBath size={24} />
              </span>
              <div>
                <p className='text-lg font-bold text-foreground'>
                  {listing.bathrooms}
                </p>
                <p className='text-sm text-default-500'>baños</p>
              </div>
            </div>
          </div>

          {sleepingRooms.length > 0 && (
            <section className='mt-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-5 shadow-sm'>
              <h2 className='mb-3 flex items-center gap-2 text-lg font-semibold'>
                <span className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <IconBed size={18} />
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
                      size={16}
                      className='mt-0.5 shrink-0 text-default-400'
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
            </section>
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
                <section
                  key={key}
                  className='mt-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-5 shadow-sm'
                >
                  <h2 className='mb-3 flex items-center gap-2 text-lg font-semibold'>
                    <span className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                      <SectionIcon size={18} />
                    </span>
                    {title}
                  </h2>
                  <p className='text-default-600 whitespace-pre-line'>
                    {content}
                  </p>
                </section>
              );
            })}
          </div>

          {/* Galeria */}
          <div
            id='property-gallery'
            className='scroll-mt-20 rounded-xl overflow-hidden'
          >
            <GridGallery
              images={galleryImages}
              quantityImageRow={3}
            />
          </div>

          {hasAmenities && (
            <section
              id='property-amenities'
              className='mt-6 scroll-mt-20 rounded-xl border border-slate-100 dark:border-slate-800 bg-content1 p-5 shadow-sm'
            >
              <h2 className='mb-3 flex items-center gap-2 text-lg font-semibold'>
                <span className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <IconSparkles size={18} />
                </span>
                Comodidades
              </h2>
              <ul className='grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-default-600'>
                {listing.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className='flex items-center gap-2 rounded-lg bg-content2 px-3 py-2'
                  >
                    <IconCheck
                      size={14}
                      className='text-success shrink-0'
                    />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasCoords && (
            <PropertyLocationMap
              lat={listing.address.lat}
              lng={listing.address.lng}
              address={listing.address.full}
            />
          )}

          {listing.publicDescription?.notes && (
            <section className='mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-5 text-foreground'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary'>
                <IconNotes size={18} />
              </span>
              <div>
                <h2 className='mb-1 text-lg font-semibold'>
                  Notas importantes
                </h2>
                <p className='whitespace-pre-line text-default-700'>
                  {listing.publicDescription.notes}
                </p>
              </div>
            </section>
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
