'use client';

import type { MouseEvent, ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  IconCalendarCheck,
  IconSearch,
  IconShieldCheck,
} from '@tabler/icons-react';
import { spaceGrotesk } from '@/lib/fonts';

const steps = [
  {
    icon: IconSearch,
    title: 'Elija su destino',
    description:
      'Filtre por ciudad, fechas y huéspedes para encontrar el alojamiento ideal.',
  },
  {
    icon: IconCalendarCheck,
    title: 'Consulte disponibilidad',
    description:
      'Vemos precio y disponibilidad en tiempo real para las fechas que elija.',
  },
  {
    icon: IconShieldCheck,
    title: 'Reserve y disfrute',
    description:
      'Reserve con confianza, con sus datos protegidos, y disfrute su estadía sin sorpresas.',
  },
];

const MAX_TILT = 10;
const SPRING = { stiffness: 200, damping: 18 };

// Card that leans toward the cursor. The pointer position inside the card
// (-0.5 to 0.5 on each axis) drives the rotation through a spring, so it
// eases in and settles back flat when the mouse leaves.
const TiltCard = ({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) => {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]),
    SPRING,
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]),
    SPRING,
  );

  const handleMouseMove = (event: MouseEvent<HTMLLIElement>) => {
    if (reduceMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.5 + index * 0.12 }}
      whileHover={{ scale: 1.03 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
      }}
      className='rounded-3xl bg-[#ffffff] p-6 shadow-[10px_10px_24px_#cdd6d2,-10px_-10px_24px_#ffffff] dark:bg-[#1c2420] dark:shadow-[10px_10px_24px_#131916,-10px_-10px_24px_#252f2a]'
    >
      {children}
    </motion.li>
  );
};

const PropertyAdvantages = () => {
  return (
    <div className='container mx-auto mb-8 flex flex-col gap-8'>
      <div className='text-center'>
        <motion.p
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-sm font-medium tracking-wide text-default-500 uppercase sm:text-base'
        >
          Negocios · Descanso · Aventura
        </motion.p>
        {/* The two sentences rise in one after the other, then the step cards follow. */}
        <h2
          className={`mx-auto mt-2 max-w-4xl text-3xl font-bold text-balance text-foreground sm:text-6xl`}
        >
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className='inline-block'
          >
            Tú eliges el motivo.
          </motion.span>{' '}
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className='inline-block text-primary'
          >
            Nosotros, el lugar perfecto.
          </motion.span>
        </h2>
      </div>

      <ul className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
        {steps.map(({ icon: Icon, title, description }, index) => (
          <TiltCard
            key={title}
            index={index}
          >
            {/* translateZ lifts the content off the card face, which is what sells the depth when it tilts. */}
            <div
              className='flex items-start justify-between gap-3'
              style={{ transform: 'translateZ(36px)' }}
            >
              <div>
                <p className='text-xs font-semibold tracking-widest text-default-500 uppercase'>
                  Paso {index + 1}
                </p>
                <p className='mt-1 text-2xl leading-tight font-bold text-foreground'>
                  {title}
                </p>
              </div>
              <span className='flex size-14 shrink-0 items-center justify-center rounded-full bg-[#eef3f1] shadow-[inset_4px_4px_8px_#cdd6d2,inset_-4px_-4px_8px_#ffffff] dark:bg-[#1c2420] dark:shadow-[inset_4px_4px_8px_#131916,inset_-4px_-4px_8px_#252f2a]'>
                <Icon
                  size={24}
                  className='text-primary'
                />
              </span>
            </div>
            <p
              className='mt-4 text-sm font-medium text-default-600'
              style={{ transform: 'translateZ(20px)' }}
            >
              {description}
            </p>
          </TiltCard>
        ))}
      </ul>
    </div>
  );
};

export default PropertyAdvantages;
