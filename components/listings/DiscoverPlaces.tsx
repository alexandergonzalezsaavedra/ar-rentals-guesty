'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { IconArrowRight, IconStarFilled } from '@tabler/icons-react';
import { dmSans, spaceGrotesk } from '@/lib/fonts';
import ScrollLine from '@/components/effects/ScrollLine';
import CategoryStackCard from './CategoryStackCard';
import { CATEGORIES } from './LugaresTuristicosTabs';

interface Place {
  src: string;
  label: string;
}

const PLACES: Place[] = [
  {
    src: '/home/lugares-por-descubrir/lugares-de-interes.jpg',
    label: 'Lugares de interés',
  },
  {
    src: '/home/lugares-por-descubrir/parques-naturales.jpg',
    label: 'Parques naturales',
  },
  {
    src: '/home/lugares-por-descubrir/sitios-culturales-y-historicos.jpg',
    label: 'Sitios culturales e históricos',
  },
  {
    src: '/home/lugares-por-descubrir/vida-nocturna.jpg',
    label: 'Vida nocturna',
  },
  {
    src: '/home/lugares-por-descubrir/Destinos-AR-Rentals-7.jpg',
    label: 'Destinos destacados',
  },
];

// One line per category for the home cards; the photos and place counts come
// from the tourist places page so the two never drift apart.
const CATEGORY_SUMMARIES: Record<string, string> = {
  playas:
    'Aguas cristalinas, bahías escondidas y atardeceres frente al Caribe.',
  'parques-naturales':
    'Selva, montaña y mar: el Tayrona, la Sierra Nevada y Minca.',
  'sitios-historicos-y-culturales':
    'La historia de Santa Marta, de Teyuna al centro colonial.',
  'sitios-de-interes':
    'Miradores, cascadas y paseos para llenar cualquier tarde.',
  'vida-nocturna': 'Rooftops, música en vivo y noches que terminan tarde.',
};

const CARDS_PER_SIDE = 5;
const DURATION_SECONDS = 14;

interface CorridorSlot {
  place: Place;
  direction: 1 | -1;
  delay: number;
}

const CORRIDOR_SLOTS: CorridorSlot[] = Array.from(
  { length: CARDS_PER_SIDE * 2 },
  (_, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const slotOnSide = Math.floor(i / 2);
    return {
      place: PLACES[i % PLACES.length],
      direction: side as 1 | -1,
      // Negative delay starts each card already partway through the loop,
      // so the corridor is evenly populated from the very first frame.
      delay: -((slotOnSide / CARDS_PER_SIDE) * DURATION_SECONDS),
    };
  },
);

function CorridorCard({ place, direction, delay }: CorridorSlot) {
  return (
    <div
      className='animate-corridor-fly absolute top-1/2 left-1/2 h-56 w-40 shrink-0 sm:h-72 sm:w-52'
      style={
        {
          '--dir': direction,
          '--corridor-duration': `${DURATION_SECONDS}s`,
          '--corridor-delay': `${delay}s`,
        } as CSSProperties
      }
    >
      <div className='relative h-full w-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-foreground/10'>
        <Image
          src={place.src}
          alt={place.label}
          fill
          sizes='210px'
          className='object-cover'
        />
      </div>
    </div>
  );
}

const DiscoverPlaces = () => {
  return (
    <section className='relative z-10 overflow-hidden rounded-t-3xl bg-background py-16 shadow-[0_-24px_48px_-12px_rgba(0,0,0,0.25)]'>
      <ScrollLine />
      {/* Soft defocus zone just above the solid card, so the hero blurs out
          gradually as this section slides over it instead of a hard cut.
          Only relevant on sm+ where HomeHero is sticky and slides underneath. */}
      <div
        className='pointer-events-none absolute inset-x-0 -top-28 hidden h-28 backdrop-blur-xl sm:block'
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
        }}
      />

      <div className={`${dmSans.className} w-full px-4 text-center`}>
        <span className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary'>
          <IconStarFilled size={14} />
          #1 en rentas cortas Colombia
        </span>

        <h2
          className={`${spaceGrotesk.className} mt-5 text-3xl font-bold text-foreground sm:text-6xl`}
        >
          Descubre lugares
        </h2>
        <p
          className={`${spaceGrotesk.className} mt-1 text-2xl font-bold text-primary sm:text-3xl`}
        >
          Naturaleza, cultura, historia y vida nocturna
        </p>
        <p className='mx-auto mt-3 max-w-xl text-default-500'>
          Todo lo que puedes vivir alrededor de tu próximo alojamiento.
        </p>

        <Button
          as={Link}
          href='/alojamiento'
          color='primary'
          radius='full'
          size='lg'
          className='mt-6 font-semibold text-white'
          endContent={<IconArrowRight size={18} />}
        >
          Reserva ahora
        </Button>
        <p className='mt-3 text-sm text-default-400'>
          No te preocupes por nada, solo disfruta tu estadía
        </p>
      </div>

      <div
        className='relative mt-2 sm:-mt-6 h-80 w-full sm:h-[26rem]'
        style={{ perspective: '900px' }}
      >
        <div className='absolute top-1/2 left-1/2 h-24 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl' />

        <div
          className='relative h-full w-full'
          style={{ transformStyle: 'preserve-3d' }}
        >
          {CORRIDOR_SLOTS.map((slot, index) => (
            <CorridorCard
              key={index}
              {...slot}
            />
          ))}
        </div>
      </div>

      {/* Category cards: a swipeable row on phones, a grid from sm up. */}
      <div className='container mx-auto mt-8 w-full'>
        <div className='flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-5'>
          {CATEGORIES.map(({ label, slug, icon, places }) => (
            <CategoryStackCard
              key={slug}
              href={`/lugares-turisticos#${slug}`}
              title={label}
              icon={icon}
              description={CATEGORY_SUMMARIES[slug] ?? ''}
              images={places.map((place) => ({
                src: place.src,
                alt: place.label,
              }))}
              stats={[`${places.length} lugares`, 'Santa Marta']}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoverPlaces;
