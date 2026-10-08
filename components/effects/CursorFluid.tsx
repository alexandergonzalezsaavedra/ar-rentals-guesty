'use client';

import { useEffect, useRef } from 'react';
import { createCursorFluid } from '@/lib/cursorFluid';

// Resolves the theme's primary color (stored as an HSL triple) to 0..1 RGB for the shader.
function readPrimaryColor(): [number, number, number] {
  const probe = document.createElement('span');

  probe.style.color = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--heroui-primary')})`;
  document.body.appendChild(probe);

  const channels = getComputedStyle(probe).color.match(/[\d.]+/g)?.map(Number) ?? [];

  probe.remove();

  return channels.length >= 3 ? [channels[0] / 255, channels[1] / 255, channels[2] / 255] : [0.49, 0.61, 0.53];
}

// Liquid trail behind the cursor: the pointer pushes a translucent fluid that
// keeps flowing the way it was pushed, curls and dissolves. The simulation is
// in lib/cursorFluid.ts; this only feeds it input and runs its loop, which
// stops by itself once every trace has faded.
const CursorFluid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    // Touch devices have no pointer to follow, and reduced-motion users have
    // asked not to get effects like this one.
    if (
      !canvas ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const fluid = createCursorFluid(canvas, readPrimaryColor());

    // No WebGL: the page simply goes without the trail.
    if (!fluid) {
      return;
    }

    let frame = 0;
    let lastTime = 0;
    let lastScrollY = window.scrollY;

    const tick = (time: number) => {
      const delta = lastTime ? (time - lastTime) / 1000 : 1 / 60;

      lastTime = time;
      frame = fluid.frame(delta) ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (!frame) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const handleMove = (event: MouseEvent) => {
      fluid.move(event.clientX, event.clientY);
      wake();
    };

    // Only worth waking for while there's paint on screen to carry along.
    const handleScroll = () => {
      if (frame) {
        fluid.scroll(window.scrollY - lastScrollY);
      }

      lastScrollY = window.scrollY;
    };

    const handleResize = () => fluid.resize();

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frame);
      fluid.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden='true'
      className='pointer-events-none fixed inset-0 size-full'
      // Just under the cursor dot (90), above everything else.
      style={{ zIndex: 89 }}
    />
  );
};

export default CursorFluid;
