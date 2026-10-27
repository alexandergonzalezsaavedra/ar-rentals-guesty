import type { Metadata } from 'next';
import Menu from '@/components/menu/Menu';
import { pageMetadata } from '@/lib/seo';
import HomeHero, { HERO_POSTER } from '@/components/listings/HomeHero';
import DiscoverPlaces from '@/components/listings/DiscoverPlaces';

export const metadata: Metadata = pageMetadata({ path: '/' });

export default function Home() {
  return (
    <>
      {/* React hoists this into <head>, so the poster (the page's largest paint) starts downloading with the
          HTML instead of after the video tag, which only arrives once Guesty has answered. */}
      <link
        rel='preload'
        as='image'
        href={HERO_POSTER}
        fetchPriority='high'
      />
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <main>
        <HomeHero />
        <DiscoverPlaces />
      </main>
    </>
  );
}
