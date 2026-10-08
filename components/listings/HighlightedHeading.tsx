'use client';

import { motion } from 'framer-motion';
import { EASE_BRAND, EASE_BRAND_SOFT } from '@/lib/easing';
import { spaceGrotesk } from '@/lib/fonts';

const RISE = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_BRAND },
  },
};

// Drawn left to right like a pen stroke, once the words have landed.
const UNDERLINE = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.7, delay: 0.55, ease: EASE_BRAND_SOFT },
      opacity: { delay: 0.55 },
    },
  },
};

// "Todo lo mejor para tí" heading for the property page. The animation waits
// until the heading is actually on screen, and plays only once.
const HighlightedHeading = () => {
  return (
    <motion.h2
      data-no-reveal
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.8 }}
      transition={{ staggerChildren: 0.15 }}
      className={`${spaceGrotesk.className} text-3xl sm:text-4xl font-bold text-foreground`}
    >
      <motion.span
        variants={RISE}
        className='inline-block'
      >
        Todo lo mejor
      </motion.span>{' '}
      <motion.span
        variants={RISE}
        className='relative inline-block text-primary'
      >
        para tí
        <svg
          viewBox='0 0 120 6'
          className='absolute left-0 bottom-0 -mb-1 w-full overflow-visible'
          aria-hidden='true'
        >
          <motion.path
            variants={UNDERLINE}
            d='M1 4.5C25.46 1.63 78.43 1.39 119 4.5'
            stroke='#7c9c87'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            fill='none'
          />
        </svg>
      </motion.span>
    </motion.h2>
  );
};

export default HighlightedHeading;
