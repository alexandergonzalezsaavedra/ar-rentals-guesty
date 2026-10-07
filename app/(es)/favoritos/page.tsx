import { IconHeart } from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import FavoritesList from '@/components/listings/FavoritesList';
import { spaceGrotesk } from '@/lib/fonts';

export const metadata = {
  title: 'Favoritos',
};

export default function FavoritosPage() {
  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <PageBreadcrumbs
        items={[{ label: 'Favoritos', icon: <IconHeart size={12} /> }]}
      />
      <main className='container mx-auto px-4 py-8'>
        <h1 className={`${spaceGrotesk.className} mb-6 text-3xl font-bold text-foreground sm:text-6xl`}>
          Tus propiedades favoritas
        </h1>
        <FavoritesList />
      </main>
    </>
  );
}
