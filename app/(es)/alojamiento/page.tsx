import type { Metadata } from 'next';
import { ConciergeBell } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import Menu from '@/components/menu/Menu';
import PropertyListings from '@/components/listings/PropertyListings';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';

function cityFrom(searchParams: Record<string, string | string[] | undefined>): string | undefined {
  const city = searchParams.city;
  return Array.isArray(city) ? city[0] : city;
}

export async function generateMetadata(props: PageProps<'/alojamiento'>): Promise<Metadata> {
  const city = cityFrom(await props.searchParams);
  const place = city ?? 'Colombia';

  return pageMetadata({
    title: `Alojamiento en ${place}`,
    description: `Apartamentos y casas para estadías cortas en ${place}. Filtre por fechas y huéspedes, vea el precio en tiempo real y reserve en línea con Vaivén.`,
    // Date and guest filters don't make a different page; the city does.
    path: city ? `/alojamiento?city=${encodeURIComponent(city)}` : '/alojamiento',
  });
}

export default async function AlojamientoPage(
  props: PageProps<'/alojamiento'>,
) {
  const searchParams = await props.searchParams;
  const city = cityFrom(searchParams);

  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <PageBreadcrumbs
        items={[{ label: 'Alojamiento', icon: <ConciergeBell size={12} /> }]}
      />
      <main>
        {/* The banner below carries the visible headline; this names the page for search engines and screen readers. */}
        <h1 className='sr-only'>Alojamiento en {city ?? 'Colombia'} para estadías cortas</h1>
        <PropertyListings searchParams={searchParams} />
      </main>
    </>
  );
}
