'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  born: number;
  lifetime: number;
}

// Small ring of dots that bursts out from wherever the user clicks and fades
// within ~0.4s. Drawn on a full-screen canvas above the page; the animation
// loop only runs while a burst is on screen, so it costs nothing in between.
const ClickBurst = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const primary = getComputedStyle(document.documentElement).getPropertyValue('--heroui-primary').trim();
    const color = primary ? `hsl(${primary})` : '#7c9c87';

    let particles: Particle[] = [];
    let frame = 0;
    let last = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const animate = (now: number) => {
      const elapsed = (now - last) / 1000;
      last = now;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = color;

      particles = particles.filter((particle) => {
        const age = now - particle.born;

        if (age >= particle.lifetime) {
          return false;
        }

        const progress = age / particle.lifetime;
        particle.x += particle.vx * elapsed;
        particle.y += particle.vy * elapsed;
        particle.vx *= 0.97;
        particle.vy *= 0.97;

        // Each dot shrinks to half its size and fades out as it travels.
        ctx.globalAlpha = 1 - progress;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * (1 - 0.5 * progress), 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      ctx.globalAlpha = 1;
      frame = particles.length ? requestAnimationFrame(animate) : 0;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      const count = 6 + Math.floor(Math.random() * 3);
      const born = performance.now();

      for (let i = 0; i < count; i++) {
        // Evenly spread around the circle, with a little jitter so it doesn't look mechanical.
        const angle = (2 * Math.PI * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 50 + Math.random() * 50;

        particles.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random(),
          born,
          lifetime: 300 + Math.random() * 100,
        });
      }

      if (!frame) {
        last = born;
        frame = requestAnimationFrame(animate);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden='true'
      className='pointer-events-none fixed inset-0 size-full'
      // Above the sticky menu and modals, so a click anywhere shows its burst.
      style={{ zIndex: 70 }}
    />
  );
};

export default ClickBurst;
