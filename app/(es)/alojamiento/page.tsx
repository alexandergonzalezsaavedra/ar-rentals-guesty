import { ConciergeBell } from 'lucide-react';
import Menu from '@/components/menu/Menu';
import PropertyListings from '@/components/listings/PropertyListings';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';

export default async function AlojamientoPage(
  props: PageProps<'/alojamiento'>,
) {
  const searchParams = await props.searchParams;

  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <PageBreadcrumbs
        items={[{ label: 'Alojamiento', icon: <ConciergeBell size={12} /> }]}
      />
      <main>
        <h1 className='text-[0px] m-0 p-0'>AR Rentals - Alojamiento</h1>
        <PropertyListings searchParams={searchParams} />
      </main>
    </>
  );
}
