'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L, {
  type LatLngBounds,
  type LeafletMouseEvent,
  type Point,
} from 'leaflet';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import {
  IconBath,
  IconBed,
  IconHeart,
  IconHeartFilled,
  IconMapPin,
  IconUsers,
} from '@tabler/icons-react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useFavorites } from '@/hooks/favorites/useFavorites';
import { useCustomToast } from '@/hooks/toast/useCustomToast';
import type { GuestyListing } from '@/lib/guesty/listings';
import { buildCitySlug, buildTitleSlug } from '@/lib/guesty/slug';
import { ConciergeBell } from 'lucide-react';

interface PropertyMapProps {
  listings: GuestyListing[];
}

// Guesty's default marker relies on image URLs that don't resolve under a
// bundler, so we draw our own pin instead of fighting Leaflet's default icon.
const PIN_SVG = `
  <svg width="34" height="34" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.45));">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#7c9c87" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="12" cy="9" r="3" fill="#ffffff"/>
  </svg>
`;

const markerIcon = L.divIcon({
  className: '',
  html: PIN_SVG,
  iconSize: [34, 34],
  // Anchor at the pin's tip, which is where the actual location sits.
  iconAnchor: [17, 34],
});

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function formatPrice(amount: number, currency: string): string {
  let formatter = currencyFormatters.get(currency);

  if (!formatter) {
    formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    currencyFormatters.set(currency, formatter);
  }

  return formatter.format(amount);
}

// Falls back to Santa Marta (this catalog's main hub) when nothing has coordinates.
const DEFAULT_CENTER: [number, number] = [11.2408, -74.211];

// Groups listings by city and returns the biggest group, so the map opens
// zoomed into wherever most results actually are instead of a plain
// average of every coordinate (which can land in the middle of nowhere
// when results are spread across several distant cities).
function findDensestCluster(listings: GuestyListing[]): GuestyListing[] {
  const groups = new Map<string, GuestyListing[]>();

  for (const listing of listings) {
    const group = groups.get(listing.address.city);
    if (group) {
      group.push(listing);
    } else {
      groups.set(listing.address.city, [listing]);
    }
  }

  return [...groups.values()].reduce((densest, group) =>
    group.length > densest.length ? group : densest,
  );
}

interface MapBoundsUpdaterProps {
  bounds: LatLngBounds | null;
}

// MapContainer only reads its `bounds`/`center` props once, at creation time,
// so re-filtering (which swaps the `listings` prop but keeps the same map
// instance mounted) never re-centers the map on its own — this imperatively
// re-fits the view whenever the computed bounds actually change.
function MapBoundsUpdater({ bounds }: MapBoundsUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    }
  }, [map, bounds]);

  return null;
}

interface MapInteractionWatcherProps {
  onInteraction: () => void;
}

// The floating card is anchored to a fixed pixel position; once the user
// pans or zooms that position is stale, so just close it instead of trying
// to track the map's transform live.
function MapInteractionWatcher({ onInteraction }: MapInteractionWatcherProps) {
  useMapEvents({
    movestart: onInteraction,
    zoomstart: onInteraction,
  });

  return null;
}

interface PropertyMapCardProps {
  listing: GuestyListing;
}

function PropertyMapCard({ listing }: PropertyMapCardProps) {
  const { isFavorite, toggle } = useFavorites();
  const { favoriteProperty } = useCustomToast();
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const isFav = isFavorite(listing._id);

  const handleToggleFavorite = () => {
    favoriteProperty(isFav, listing.title, favoriteButtonRef);
    toggle(listing);
  };

  return (
    <div className='w-56'>
      <div className='relative aspect-4/3 w-full overflow-hidden rounded-[14px]'>
        <Image
          src={listing.picture.regular}
          alt={listing.title}
          fill
          sizes='224px'
          className='object-cover'
        />

        <Button
          ref={favoriteButtonRef}
          isIconOnly
          size='md'
          radius='full'
          aria-label={isFav ? 'Quitar de favoritos' : 'Guardar propiedad'}
          className='absolute top-2 right-2 bg-white/90 text-default-700'
          onPress={handleToggleFavorite}
        >
          {isFav ? (
            <IconHeartFilled
              className='text-danger'
              size={16}
            />
          ) : (
            <IconHeart
              className='text-slate-600'
              size={16}
            />
          )}
        </Button>
      </div>

      <p className='mt-2 line-clamp-1 text-center text-sm font-semibold'>
        {listing.title}
      </p>

      <div className='mb-1 flex items-center justify-center gap-1 text-xs text-default-500'>
        <IconMapPin size={14} />
        <span className='line-clamp-1'>
          {listing.address.city}
          {listing.address.state ? `, ${listing.address.state}` : ''}
        </span>
      </div>

      <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-1 text-xs text-default-500'>
        <span
          className='flex items-center gap-1'
          title='Huéspedes'
        >
          <span className='flex items-center justify-center rounded-md bg-content2 p-1'>
            <IconUsers
              size={14}
              strokeWidth={1.5}
              className='text-default-500'
            />
          </span>
          {listing.accommodates}
        </span>
        <span
          className='flex items-center gap-1'
          title='Habitaciones'
        >
          <span className='flex items-center justify-center rounded-md bg-content2 p-1'>
            <IconBed
              size={14}
              strokeWidth={1.5}
              className='text-default-500'
            />
          </span>
          {listing.bedrooms}
        </span>
        <span
          className='flex items-center gap-1'
          title='Baños'
        >
          <span className='flex items-center justify-center rounded-md bg-content2 p-1'>
            <IconBath
              size={14}
              strokeWidth={1.5}
              className='text-default-500'
            />
          </span>
          {listing.bathrooms}
        </span>
      </div>

      <div className='text-center'>
        <span className='text-xl font-bold text-primary'>
          {formatPrice(listing.prices.basePrice, listing.prices.currency)}{' '}
          <small className='text-default-400'>COP</small>
        </span>
        <div className='text-xs font-bold text-default-500'>
          precio por noche
        </div>
      </div>

      <Button
        as={Link}
        href={`/alojamiento/${buildCitySlug(listing)}/${buildTitleSlug(listing)}`}
        color='primary'
        size='sm'
        radius='full'
        className='mt-2 w-full font-bold text-white no-underline'
      >
        <span className='flex items-center gap-2 font-bold text-white'>
          Reservar <ConciergeBell size={18} />
        </span>
      </Button>
    </div>
  );
}

const PropertyMap = ({ listings }: PropertyMapProps) => {
  const [selected, setSelected] = useState<{
    listing: GuestyListing;
    point: Point;
  } | null>(null);

  const withCoords = listings.filter(
    (listing) =>
      Number.isFinite(listing.address.lat) &&
      Number.isFinite(listing.address.lng),
  );

  const bounds =
    withCoords.length > 0
      ? L.latLngBounds(
          findDensestCluster(withCoords).map(
            (listing): [number, number] => [
              listing.address.lat,
              listing.address.lng,
            ],
          ),
        )
      : null;

  return (
    <div className='relative'>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom
        className='isolate h-150 w-full rounded-xl'
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        <MapBoundsUpdater bounds={bounds} />
        <MapInteractionWatcher onInteraction={() => setSelected(null)} />

        {withCoords.map((listing) => (
          <Marker
            key={listing._id}
            position={[listing.address.lat, listing.address.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: (event: LeafletMouseEvent) => {
                setSelected({ listing, point: event.containerPoint });
              },
            }}
          />
        ))}
      </MapContainer>

      {selected && (
        <Popover
          isOpen
          placement='top'
          onOpenChange={(isOpen) => !isOpen && setSelected(null)}
        >
          <PopoverTrigger>
            <div
              className='pointer-events-none absolute h-0 w-0'
              style={{ left: selected.point.x, top: selected.point.y }}
            />
          </PopoverTrigger>
          <PopoverContent className='p-3'>
            <PropertyMapCard listing={selected.listing} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default PropertyMap;
