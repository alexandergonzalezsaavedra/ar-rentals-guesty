'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

/** Roughly one swing across the section for every this many pixels of height. */
const SWING_HEIGHT = 520;

interface ScrollLineProps {
  /** Starts the line from the right edge instead of the left. */
  mirrored?: boolean;
}

// A path that snakes down a box of the given size, swinging from side to
// side, entering from off one edge and leaving off the bottom. Built in real
// pixels so the stroke keeps the same thickness however tall the section is.
function buildPath(width: number, height: number, mirrored: boolean): string {
  const swings = Math.max(2, Math.round(height / SWING_HEIGHT));
  const near = width * 0.1;
  const far = width * 0.88;
  const side = (index: number) => ((index % 2 === 0) !== mirrored ? near : far);

  let x = mirrored ? width + 60 : -60;
  let y = Math.min(140, height * 0.15);
  let d = `M${x} ${y}`;

  for (let index = 1; index <= swings; index++) {
    const nextX = index === swings ? (side(index) < width / 2 ? -60 : width + 60) : side(index);
    const nextY = (height * index) / swings;
    const pull = (nextY - y) * 0.55;

    d += ` C ${x} ${y + pull}, ${nextX} ${nextY - pull}, ${nextX} ${nextY}`;
    x = nextX;
    y = nextY;
  }

  return d;
}

// Thick translucent line that draws itself behind a section as the page
// scrolls through it, and un-draws on the way back up.
//
// Drop it in as the first child of a section that is `relative` and forms its
// own stacking context (`isolate`, or any z-index): it fills the section and
// sits behind its content.
const ScrollLine = ({ mirrored = false }: ScrollLineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const box = ref.current;

    if (!box) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      setSize((current) =>
        Math.abs(current.width - width) < 1 && Math.abs(current.height - height) < 1
          ? current
          : { width: Math.round(width), height: Math.round(height) },
      );
    });

    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Starts as the section's top nears the bottom of the screen and completes
  // a little before its end reaches the middle.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'end 55%'] });
  const drawn = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 80, damping: 26, mass: 0.6 });

  const hasSize = size.width > 0 && size.height > 0;

  return (
    <div
      ref={ref}
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 -z-10 overflow-hidden text-primary/10'
    >
      {hasSize && (
        <svg
          viewBox={`0 0 ${size.width} ${size.height}`}
          className='h-full w-full'
        >
          <motion.path
            d={buildPath(size.width, size.height, mirrored)}
            fill='none'
            stroke='currentColor'
            strokeWidth={size.width < 640 ? 28 : 46}
            strokeLinecap='round'
            style={{ pathLength: reduceMotion ? 1 : drawn }}
          />
        </svg>
      )}
    </div>
  );
};

export default ScrollLine;
