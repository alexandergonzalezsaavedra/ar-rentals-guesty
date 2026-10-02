'use client';

import { motion } from 'framer-motion';
import { spaceGrotesk } from '@/lib/fonts';
import { useReveal } from '@/components/home/RevealContext';
import HomeSearchForm from './HomeSearchForm';

interface HomeHeroContentProps {
  cities: string[];
}

const HomeHeroContent = ({ cities }: HomeHeroContentProps) => {
  const revealed = useReveal();
  const show = revealed ?? true;

  return (
    <div className='relative z-10 flex min-h-[85dvh] flex-col items-center justify-center gap-8 px-4 py-16 text-center sm:px-8'>
      <motion.div
        className='flex flex-col items-center gap-4'
        initial={{ opacity: 0, y: -28, filter: 'blur(14px)' }}
        animate={
          show
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: -40, filter: 'blur(14px)' }
        }
        transition={{ duration: 2, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2
          className={`${spaceGrotesk.className} text-3xl sm:text-6xl font-bold text-white drop-shadow-lg`}
        >
          Encuentre su próximo alojamiento
        </h2>
        <p className='max-w-xl text-2xl text-white/90 drop-shadow-lg'>
          Arriendos cortos en los mejores destinos de Colombia, listos para
          reservar.
        </p>
      </motion.div>

      <motion.div
        className='w-full max-w-3xl'
        initial={{ opacity: 0, y: 28, filter: 'blur(12px)' }}
        animate={
          show
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: 40, filter: 'blur(12px)' }
        }
        transition={{ duration: 2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <HomeSearchForm cities={cities} />
      </motion.div>
    </div>
  );
};

export default HomeHeroContent;
