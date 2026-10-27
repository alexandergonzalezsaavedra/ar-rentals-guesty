import { listAllListings } from '@/lib/guesty/listings';
import HomeHeroContent from './HomeHeroContent';

const HERO_VIDEO = '/home/hero-vaiven.mp4';
/** First frame of the video: shows (and counts as the page's largest paint) before the video has loaded. */
export const HERO_POSTER = '/home/hero-vaiven-poster.jpg';

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
    <section className='relative z-0 p-4 sm:sticky sm:top-0'>
      <div className='relative min-h-[85dvh] w-full overflow-hidden rounded-xl bg-background'>
        <div className='animate-curtain-reveal absolute inset-0'>
          <video
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay
            loop
            muted
            playsInline
            preload='auto'
            className='absolute inset-0 h-full w-full object-cover'
          />
          <div className='absolute inset-0 bg-linear-to-b from-black/60 via-black/25 to-black/70' />
        </div>

        <HomeHeroContent cities={cities} />
      </div>
    </section>
  );
}
