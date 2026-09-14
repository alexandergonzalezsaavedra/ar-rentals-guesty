import Menu from '@/components/menu/Menu';
import PropertyListings from '@/components/listings/PropertyListings';

export default async function PropiedadesPage(
  props: PageProps<'/propiedades'>,
) {
  const searchParams = await props.searchParams;

  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <main className='container mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold mb-6'>Inmuebles disponibles</h1>
        <PropertyListings searchParams={searchParams} />
      </main>
    </>
  );
}
