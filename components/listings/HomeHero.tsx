import { listAllListings } from '@/lib/guesty/listings';
import HomeHeroContent from './HomeHeroContent';

async function fetchCities(): Promise<string[]> {
  try {
    const { results } = await listAllListings({});
    return Array.from(
      new Set(results.map((listing) => listing.address.city)),
    ).sort();
  } catch (error) {
    console.error('HomeHero: failed to load cities', error);
    return [];
  }
}

export default async function HomeHero() {
  const cities = await fetchCities();

  return (
    <section className='relative p-4'>
      <div className='relative min-h-[85dvh] w-full overflow-hidden rounded-xl bg-default-200'>
        <video
          src='/hero-banner-ar-rentals.mp4'
          autoPlay
          loop
          muted
          playsInline
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-linear-to-b from-black/60 via-black/25 to-black/70 rounded-xl' />

        <HomeHeroContent cities={cities} />
      </div>
    </section>
  );
}
