import type { Metadata } from 'next';
import Link from 'next/link';
import { IconMap2, IconMapPin } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import LugaresTuristicosTabs from '@/components/listings/LugaresTuristicosTabs';
import { spaceGrotesk } from '@/lib/fonts';
import ScrollLine from '@/components/effects/ScrollLine';

export const metadata: Metadata = {
  title: 'Lugares Turísticos | AR Rentals',
  description:
    'Descubre playas, parques naturales, sitios históricos y culturales, lugares de interés y vida nocturna cerca de tu próximo alojamiento con AR Rentals en Santa Marta.',
};

export default function LugaresTuristicosPage() {
  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>

      <main>
        <PageBreadcrumbs
          items={[{ label: 'Lugares Turísticos', icon: <IconMap2 size={12} /> }]}
        />

        {/* `isolate` gives the scroll line a layer of its own to sit behind the content. */}
        <div className='relative isolate w-full px-4 py-10'>
          <ScrollLine />
          <Link
            href='/alojamiento?city=Santa+Marta'
            className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20'
          >
            <IconMapPin size={14} />
            Santa Marta
          </Link>

          <h1 className={`${spaceGrotesk.className} mt-3 text-3xl font-bold text-foreground sm:text-6xl`}>
            Lugares Turísticos
          </h1>
          <p className='mt-2 max-w-2xl text-default-500'>
            Naturaleza, cultura, historia y vida nocturna: todo lo que puedes
            vivir alrededor de tu próximo alojamiento en Santa Marta.
          </p>

          <div className='mt-8'>
            <LugaresTuristicosTabs />
          </div>
        </div>
      </main>
    </>
  );
}
