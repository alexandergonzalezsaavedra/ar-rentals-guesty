'use client';

import { useEffect, useState, type ReactNode } from 'react';

// Backdrop tone for each section of the property page, in reading order.
// Single-hue on purpose: it alternates between the plain page background and
// two tints of the brand green, so the shift reads as rhythm, not as color.
// The section cards keep their own surface; only the page behind them shifts.
const TONES = [
  { id: 'property-description', className: 'bg-[#eef3f1] dark:bg-[#1c2420]' },
  { id: 'property-gallery', className: 'bg-background' },
  { id: 'property-amenities', className: 'bg-[#dfe9e3] dark:bg-[#232e28]' },
  { id: 'property-location', className: 'bg-[#eef3f1] dark:bg-[#1c2420]' },
];

const DEFAULT_TONE = 'bg-background';

// A section takes over once its top edge crosses this fraction of the viewport height.
const TRIGGER_LINE = 0.4;

interface SectionBackdropProps {
  className?: string;
  children: ReactNode;
}

// Surface behind the property detail whose color cross-fades as the reader
// moves from one section to the next.
const SectionBackdrop = ({ className = '', children }: SectionBackdropProps) => {
  const [tone, setTone] = useState(DEFAULT_TONE);

  useEffect(() => {
    let frame = 0;

    // Sections are looked up on every pass rather than cached: some of them
    // (the map) load after this component mounts.
    const update = () => {
      frame = 0;

      const line = window.innerHeight * TRIGGER_LINE;
      let next = DEFAULT_TONE;

      for (const { id, className: toneClass } of TONES) {
        const section = document.getElementById(id);

        if (section && section.getBoundingClientRect().top <= line) {
          next = toneClass;
        }
      }

      setTone(next);
    };

    const handleScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div className={`transition-colors duration-500 ease-out ${tone} ${className}`}>{children}</div>;
};

export default SectionBackdrop;
