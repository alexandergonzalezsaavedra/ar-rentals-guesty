import type { Metadata } from 'next';
import Link from 'next/link';
import { IconDatabase } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import MyData from '@/components/consent/MyData';
import { spaceGrotesk } from '@/lib/fonts';

// Personal to each visitor: nothing here for search engines.
export const metadata: Metadata = {
  title: 'Mis datos',
  robots: { index: false },
};

export default function MisDatosPage() {
  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>

      <main>
        <PageBreadcrumbs items={[{ label: 'Mis datos', icon: <IconDatabase size={12} /> }]} />

        <div className='container mx-auto max-w-5xl px-4 py-10 sm:py-14'>
          <div className='mt-6 text-center'>
            <h1 className={`${spaceGrotesk.className} text-4xl font-bold text-foreground sm:text-5xl`}>Mis datos</h1>
            <p className='mx-auto mt-3 max-w-2xl text-default-600'>
              Esto es lo que Vaivén guarda en este navegador según las cookies que aceptaste. Puedes cambiar tus
              preferencias o eliminarlo cuando quieras. Más información en{' '}
              <Link
                href='/terminos-y-condiciones#datos-personales'
                className='font-medium text-primary underline underline-offset-2'
              >
                Términos y condiciones
              </Link>
              .
            </p>
          </div>

          <div className='mt-8'>
            <MyData />
          </div>
        </div>
      </main>
    </>
  );
}
