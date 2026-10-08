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
import SectionsParallaxSlider, { type SectionSlide } from './SectionsParallaxSlider';
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

const DESCRIPTION_SLIDE_GROUPS: (typeof DESCRIPTION_SECTIONS)[number]['key'][][] = [
  ['summary', 'access', 'interactionWithGuests'],
  ['space'],
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

  // The stay-related texts share one slide; "El espacio" keeps its own.
  // Groups left empty because Guesty has none of their texts are dropped.
  const descriptionSlides = DESCRIPTION_SLIDE_GROUPS.map((keys) =>
    DESCRIPTION_SECTIONS.filter(({ key }) => keys.includes(key) && listing.publicDescription?.[key]),
  ).filter((group) => group.length > 0);

  // Each entry is one slide of the section slider. `navId` ties a slide to an
  // entry of the page navigation; slides without one belong to the section
  // before them.
  const slides: SectionSlide[] = [
    {
      key: 'capacity',
      label: 'Capacidad',
      content: (
        <>
          <div className='mb-8 flex justify-start'>
            <HighlightedHeading />
          </div>
          {/* Always three across: stacked and centered on phones so the row stays compact, icon-beside-text from sm up. */}
          <div className='grid grid-cols-3 gap-2 sm:gap-4'>
            {stats.map(({ icon: StatIcon, value, label, detail }, index) => (
              <div
                key={label}
                data-reveal
                className='group flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left'
              >
                <span className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white sm:size-16'>
                  <StatIcon
                    className='animate-icon-float size-7 sm:size-9'
                    style={{ animationDelay: `${index * 0.4}s` }}
                  />
                </span>
                <div className='min-w-0'>
                  <p className='text-2xl leading-none font-bold text-foreground sm:text-3xl'>{value}</p>
                  <p className='mt-1.5 font-mono text-[10px] tracking-wider text-default-600 uppercase sm:text-[11px]'>{label}</p>
                  {detail && <p className='font-mono text-[10px] tracking-wider text-default-400 uppercase'>{detail}</p>}
                </div>
              </div>
            ))}
          </div>

          {sleepingRooms.length > 0 && (
            <section className='mt-10 border-t border-default-200 pt-10 dark:border-default-100/20'>
              <h2 className='mb-4 flex items-center gap-3 text-xl font-bold sm:text-2xl'>
                <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                  <IconBed size={26} />
                </span>
                Distribución de camas
              </h2>
              <ul className='grid grid-cols-1 gap-3 text-sm text-default-600 sm:grid-cols-2'>
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
                      <p className='font-medium text-default-700'>{ROOM_NAME_LABELS[room.name] ?? room.name}</p>
                      <p>{describeBeds(room.beds)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ),
    },
    ...descriptionSlides.map(
      (group, index): SectionSlide => ({
        key: group.map(({ key }) => key).join('-'),
        label: group.length > 1 ? 'Descripción' : group[0].title,
        navId: index === 0 ? 'property-description' : undefined,
        content: (
          <>
            {group.map(({ key, title, icon: SectionIcon }, position) => (
              <section
                key={key}
                className={position > 0 ? 'mt-8 border-t border-default-200 pt-8 dark:border-default-100/20' : undefined}
              >
                <h2 className='mb-4 flex items-center gap-3 text-xl font-bold sm:text-2xl'>
                  <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <SectionIcon size={26} />
                  </span>
                  {title}
                </h2>
                <p className='whitespace-pre-line text-default-600'>{listing.publicDescription?.[key]}</p>
              </section>
            ))}
          </>
        ),
      }),
    ),
    {
      key: 'gallery',
      label: 'Galería',
      navId: 'property-gallery',
      content: (
        <section>
          <h2 className='mb-2 flex items-center gap-3 text-xl font-bold sm:text-2xl'>
            <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <IconPhoto size={26} />
            </span>
            Conoce cada espacio
          </h2>
          <p className='mb-3 text-sm text-default-500'>
            Recorre la propiedad en imágenes y descubre los detalles que harán de tu estadía una experiencia
            inolvidable.
          </p>
          <div className='overflow-hidden rounded-xl'>
            <GridGallery
              images={galleryImages}
              quantityImageRow={3}
            />
          </div>
        </section>
      ),
    },
    ...(hasAmenities
      ? [
          {
            key: 'amenities',
            label: 'Comodidades',
            navId: 'property-amenities',
            content: (
              <section>
                <h2 className='mb-4 flex items-center gap-3 text-xl font-bold sm:text-2xl'>
                  <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <IconChecklist size={26} />
                  </span>
                  Comodidades
                </h2>
                <ul className='grid grid-cols-2 gap-2 text-sm text-default-600 sm:grid-cols-3'>
                  {listing.amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className='flex items-center gap-2.5 rounded-lg bg-content2 px-3 py-2.5 transition-colors duration-200 hover:bg-primary/10'
                    >
                      <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary'>
                        <IconCheck size={16} />
                      </span>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </section>
            ),
          },
        ]
      : []),
    ...(hasCoords
      ? [
          {
            key: 'location',
            label: 'Ubicación',
            navId: 'property-location',
            content: (
              <PropertyLocationMap
                lat={listing.address.lat}
                lng={listing.address.lng}
                address={listing.address.full}
              />
            ),
          },
        ]
      : []),
    ...(listing.publicDescription?.notes
      ? [
          {
            key: 'notes',
            label: 'Notas',
            navId: 'property-notes',
            content: (
              <section className='flex items-start gap-3 text-foreground'>
                <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary'>
                  <IconNotes size={26} />
                </span>
                <div>
                  <h2 className='mb-1 text-xl font-bold sm:text-2xl'>Notas importantes</h2>
                  <p className='whitespace-pre-line text-default-700'>{listing.publicDescription.notes}</p>
                </div>
              </section>
            ),
          },
        ]
      : []),
  ];

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
          hasNotes={Boolean(listing.publicDescription?.notes)}
          expanded={isSidebarExpanded}
          onToggle={() => setIsSidebarExpanded((value) => !value)}
        />

        <div className='grid gap-8 lg:min-w-0 lg:flex-1 lg:grid-cols-3'>
          {/* min-w-0 keeps the column at its grid width whatever the slides hold. */}
          <div className='min-w-0 lg:col-span-2'>
            <SectionsParallaxSlider slides={slides} />
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
