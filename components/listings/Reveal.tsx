'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RevealProps {
  id?: string;
  className?: string;
  delay?: number;
  children: ReactNode;
}

// Section that fades up into place the first time it scrolls into view.
const Reveal = ({ id, className, delay = 0, children }: RevealProps) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export default Reveal;
