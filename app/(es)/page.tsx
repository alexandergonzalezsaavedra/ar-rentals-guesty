import Menu from '@/components/menu/Menu';
import HomeHero from '@/components/listings/HomeHero';
import DiscoverPlaces from '@/components/listings/DiscoverPlaces';
import { RevealProvider } from '@/components/home/RevealContext';

export default function Home() {
  return (
    <RevealProvider delayMs={300}>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <main>
        <HomeHero />
        <DiscoverPlaces />
      </main>
    </RevealProvider>
  );
}
