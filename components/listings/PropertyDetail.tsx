'use client';

import Image from 'next/image';
import { Chip } from '@heroui/react';
import { IconBath, IconBed, IconCheck, IconMapPin, IconStarFilled, IconUsers } from '@tabler/icons-react';
import type { GuestyBedArrangementRoom, GuestyListingDetail } from '@/lib/guesty/listings';
import BookingWidget from './BookingWidget';

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
    .map(([type, count]) => `${count} ${BED_TYPE_LABELS[type] ?? type.toLowerCase().replace(/_/g, ' ')}`)
    .join(', ');
}

const DESCRIPTION_SECTIONS: { key: keyof NonNullable<GuestyListingDetail['publicDescription']>; title: string }[] = [
  { key: 'summary', title: 'Sobre este alojamiento' },
  { key: 'space', title: 'El espacio' },
  { key: 'access', title: 'Acceso de huéspedes' },
  { key: 'interactionWithGuests', title: 'Atención durante tu estadía' },
  { key: 'notes', title: 'Notas importantes' },
];

const PropertyDetail = ({
  listing,
  bedArrangements,
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  initialChildren,
}: PropertyDetailProps) => {
  const heroSrc = listing.pictures[0]?.original ?? listing.picture.regular;
  const thumbnails = listing.pictures.slice(1, 5);
  const remainingCount = Math.max(0, listing.pictures.length - thumbnails.length - 1);

  const ratingAvg = listing.reviews.avg;
  const sleepingRooms = bedArrangements.filter((room) => Object.values(room.beds).some((count) => count > 0));

  return (
    <div>
      <div className='grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden h-64 sm:h-96'>
        <div className='relative col-span-4 row-span-2 sm:col-span-2'>
          <Image
            src={heroSrc}
            alt={listing.title}
            fill
            sizes='(max-width: 640px) 100vw, 50vw'
            className='object-cover'
            priority
          />
        </div>

        {thumbnails.map((picture, index) => (
          <div
            key={picture.original}
            className='relative hidden sm:block'
          >
            <Image
              src={picture.thumbnail}
              alt={listing.title}
              fill
              sizes='25vw'
              className='object-cover'
            />
            {index === thumbnails.length - 1 && remainingCount > 0 && (
              <div className='absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold'>
                +{remainingCount} fotos
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='mt-6 grid lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <h1 className='text-2xl font-bold'>{listing.title}</h1>

          <div className='flex items-center gap-1 text-default-500 mt-1'>
            <IconMapPin size={16} />
            <span>{listing.address.full}</span>
          </div>

          {ratingAvg !== null && listing.reviews.total > 0 && (
            <Chip
              size='sm'
              className='mt-2 bg-default-100'
              startContent={
                <IconStarFilled
                  size={12}
                  className='text-warning'
                />
              }
            >
              {ratingAvg.toFixed(1)} ({listing.reviews.total} reseñas)
            </Chip>
          )}

          <div className='flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-default-600 border-y border-default-200 py-4'>
            <span className='flex items-center gap-1'>
              <IconUsers size={16} />
              {listing.accommodates} huéspedes
            </span>
            <span className='flex items-center gap-1'>
              <IconBed size={16} />
              {listing.bedrooms} habitaciones · {listing.beds} camas
            </span>
            <span className='flex items-center gap-1'>
              <IconBath size={16} />
              {listing.bathrooms} baños
            </span>
          </div>

          {sleepingRooms.length > 0 && (
            <section className='mt-6'>
              <h2 className='text-lg font-semibold mb-2'>Distribución de camas</h2>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-default-600'>
                {sleepingRooms.map((room) => (
                  <li
                    key={room.roomNumber}
                    className='flex items-start gap-2 border border-default-200 rounded-lg p-3'
                  >
                    <IconBed
                      size={16}
                      className='mt-0.5 shrink-0 text-default-400'
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

          {DESCRIPTION_SECTIONS.map(({ key, title }) => {
            const content = listing.publicDescription?.[key];

            if (!content) {
              return null;
            }

            return (
              <section
                key={key}
                className='mt-6'
              >
                <h2 className='text-lg font-semibold mb-2'>{title}</h2>
                <p className='text-default-600 whitespace-pre-line'>{content}</p>
              </section>
            );
          })}

          {listing.amenities.length > 0 && (
            <section className='mt-6'>
              <h2 className='text-lg font-semibold mb-2'>Comodidades</h2>
              <ul className='grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-default-600'>
                {listing.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className='flex items-center gap-2'
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
        </div>

        <aside>
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
  );
};

export default PropertyDetail;
