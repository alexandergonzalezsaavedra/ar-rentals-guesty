import { IconMap2 } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import { spaceGrotesk } from '@/lib/fonts';

export default function Home() {
  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <main className='w-full px-4 py-8'>
        <PageBreadcrumbs
          items={[{ label: 'Destinos', icon: <IconMap2 size={12} /> }]}
        />
        <h1 className={`${spaceGrotesk.className} text-3xl sm:text-6xl font-bold mb-6`}>
          Encuentre su próximo destino
        </h1>
      </main>
    </>
  );
}
