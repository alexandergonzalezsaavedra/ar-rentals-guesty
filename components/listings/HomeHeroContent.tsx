import { spaceGrotesk } from '@/lib/fonts';
import HomeSearchForm from './HomeSearchForm';

interface HomeHeroContentProps {
  cities: string[];
}

// The headline and search rise in with CSS animations (app/globals.css,
// .animate-hero-*), not framer-motion: they start with the first paint of the
// server HTML instead of waiting for JavaScript to load and hydrate, which is
// what kept Lighthouse's "largest contentful paint" late. Same motion and
// timing as before: they come in just as the curtain opens.
const HomeHeroContent = ({ cities }: HomeHeroContentProps) => {
  return (
    <div className='relative z-10 flex min-h-[85dvh] flex-col items-center justify-center gap-8 px-4 py-16 text-center sm:px-8'>
      <div className='animate-hero-from-above flex flex-col items-center gap-4'>
        <h1 className={`${spaceGrotesk.className} text-3xl font-bold text-white drop-shadow-lg sm:text-6xl`}>
          Encuentre su próximo alojamiento
        </h1>
        <p className='max-w-xl text-2xl text-white/90 drop-shadow-lg'>
          Arriendos cortos en los mejores destinos de Colombia, listos para reservar.
        </p>
      </div>

      <div className='animate-hero-from-below w-full max-w-3xl'>
        <HomeSearchForm cities={cities} />
      </div>
    </div>
  );
};

export default HomeHeroContent;
