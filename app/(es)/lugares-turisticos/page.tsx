import type { Metadata } from 'next';
import { IconMap2 } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import LugaresTuristicosTabs from '@/components/listings/LugaresTuristicosTabs';

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

        <div className='container mx-auto px-4 py-10'>
          <h1 className='text-3xl font-bold text-foreground sm:text-4xl'>
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
