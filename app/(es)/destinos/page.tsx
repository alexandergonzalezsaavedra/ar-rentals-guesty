import { IconMap2 } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';

export default function Home() {
  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <main className='container mx-auto px-4 py-8'>
        <PageBreadcrumbs
          items={[{ label: 'Destinos', icon: <IconMap2 size={12} /> }]}
        />
        <h1 className='text-2xl font-bold mb-6'>
          Encuentre su próximo destino
        </h1>
      </main>
    </>
  );
}
