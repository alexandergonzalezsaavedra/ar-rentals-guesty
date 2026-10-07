'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@heroui/react';
import {
  IconBrandGoogleMaps,
  IconBrandWaze,
  IconMapPin,
} from '@tabler/icons-react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

interface PropertyLocationMapProps {
  lat: number;
  lng: number;
  address: string;
}

// Guesty's default marker relies on image URLs that don't resolve under a
// bundler, so we draw our own pin instead of fighting Leaflet's default icon.
// Red pin with two rings pulsing out from its tip, so the property stands out
// against the map tiles. The pulse styles live in globals.css (.map-pin-*).
const PIN_HTML = `
  <div class="map-pin">
    <span class="map-pin-pulse"></span>
    <span class="map-pin-pulse map-pin-pulse-late"></span>
    <svg class="map-pin-icon" width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#e11d48" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3" fill="#ffffff"/>
    </svg>
  </div>
`;

const markerIcon = L.divIcon({
  className: '',
  html: PIN_HTML,
  iconSize: [44, 44],
  // Anchor at the pin's tip, which is where the actual location sits.
  iconAnchor: [22, 44],
});

const PropertyLocationMap = ({
  lat,
  lng,
  address,
}: PropertyLocationMapProps) => {
  const wazeUrl = `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lng}`;

  return (
    <section
      id='property-location'
      className='mt-6 scroll-mt-20 rounded-xl border border-slate-100 bg-content1 p-5 shadow-sm dark:border-slate-800'
    >
      <h2 className='mb-4 flex items-center gap-3 text-xl font-bold sm:text-2xl'>
        <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
          <IconMapPin size={26} />
        </span>
        Ubicación
      </h2>

      <p className='mb-4 text-sm text-default-600'>{address}</p>

      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className='isolate h-80 w-full rounded-xl sm:h-96'
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker
          position={[lat, lng]}
          icon={markerIcon}
        />
      </MapContainer>

      <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:flex-row'>
        <Button
          as='a'
          href={wazeUrl}
          target='_blank'
          rel='noopener noreferrer'
          color='primary'
          radius='full'
          className='w-full font-bold text-white sm:w-auto'
          startContent={<IconBrandWaze size={20} />}
        >
          Cómo llegar con Waze
        </Button>

        <Button
          as='a'
          href={googleMapsUrl}
          target='_blank'
          rel='noopener noreferrer'
          variant='bordered'
          color='primary'
          radius='full'
          className='w-full font-bold sm:w-auto'
          startContent={<IconBrandGoogleMaps size={20} />}
        >
          Cómo llegar con Google Maps
        </Button>
      </div>
    </section>
  );
};

export default PropertyLocationMap;
