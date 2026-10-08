// Adapted from the "cards rotate slider" in Hyperiux Vault: https://vault.hyperiux.com
'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';

const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1025;

// Vertical offset (in vh) a card gains per position away from the middle of the track.
const MOBILE_STEP = 2;
const TABLET_STEP = 6;
const DESKTOP_STEP = 10;

const MOBILE_ROTATE_IN = -60;
const TABLET_ROTATE_IN = -80;
const DESKTOP_ROTATE_IN = -100;

const MOBILE_ROTATE_OUT = 50;
const TABLET_ROTATE_OUT = 65;
const DESKTOP_ROTATE_OUT = 80;

const ROTATE_X_NEGATIVE = 5;
const ROTATE_X_POSITIVE = -5;

const PERSPECTIVE = '1200px';
// Reduced motion: a far larger perspective flattens the 3D effect, and the
// rotation itself is cut to a fraction, instead of dropping the slider.
const REDUCED_PERSPECTIVE = '4800px';
const ROTATION_REDUCTION_FACTOR = 0.15;

/** Share of the remaining distance covered each frame; lower is a longer, softer glide. */
const SMOOTHING = 0.12;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

interface PlacesRotateSliderProps {
  places: Array<{ src: string; label: string; description: string }>;
}

/**
 * The places of a category as a horizontal track pinned to the screen:
 * scrolling the page pans the track, and each card swings in from one side,
 * settles flat as it crosses the middle, then swings out the other, drifting
 * diagonally as it goes.
 *
 * The original drives this with GSAP ScrollTrigger; here the same motion is
 * computed directly from the scroll position in one rAF loop, so the page
 * doesn't need the library.
 */
const PlacesRotateSlider = ({ places }: PlacesRotateSliderProps) => {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const placeKeys = places.map((place) => place.src).join('|');

  useIsomorphicLayoutEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;

    if (!outer || !stage || !track) return;

    const wrappers = wrappersRef.current.filter((el): el is HTMLDivElement => el !== null);
    const cards = cardsRef.current.filter((el): el is HTMLDivElement => el !== null);
    const count = wrappers.length;

    if (count === 0 || cards.length !== count) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rotationScale = reducedMotion ? ROTATION_REDUCTION_FACTOR : 1;

    stage.style.perspective = reducedMotion ? REDUCED_PERSPECTIVE : PERSPECTIVE;

    let stageWidth = 0;
    let travel = 0;
    let step = DESKTOP_STEP;
    let rotateIn = DESKTOP_ROTATE_IN;
    let rotateOut = DESKTOP_ROTATE_OUT;

    let current = 0;
    let target = 0;
    let frame = 0;

    const measure = () => {
      stageWidth = stage.clientWidth;

      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const isTablet = !isMobile && window.innerWidth < TABLET_BREAKPOINT;

      step = isMobile ? MOBILE_STEP : isTablet ? TABLET_STEP : DESKTOP_STEP;
      rotateIn = (isMobile ? MOBILE_ROTATE_IN : isTablet ? TABLET_ROTATE_IN : DESKTOP_ROTATE_IN) * rotationScale;
      rotateOut = (isMobile ? MOBILE_ROTATE_OUT : isTablet ? TABLET_ROTATE_OUT : DESKTOP_ROTATE_OUT) * rotationScale;

      // The track stops once its last card is centered.
      const last = wrappers[count - 1];

      travel = Math.max(0, last.offsetLeft - (stageWidth - last.offsetWidth) / 2);
      // The scroll distance that pans the whole track, plus the pinned stage itself.
      outer.style.height = `${travel + stage.offsetHeight}px`;
    };

    const render = (position: number) => {
      track.style.transform = `translate3d(${-position}px, 0, 0)`;

      const mid = Math.floor(count / 2);

      wrappers.forEach((wrapper, index) => {
        const left = wrapper.offsetLeft - position;
        const width = wrapper.offsetWidth;

        // 0 as the card's left edge enters at the right of the stage, 0.5
        // when it's centered, 1 as its right edge leaves at the left.
        const progress = clamp((stageWidth - left) / (stageWidth + width), 0, 1);

        // Cards before the middle of the set start high and end low; the rest do the opposite.
        const offset = (index < mid ? -(mid - index) : index - mid + 1) * step;
        const tiltX = (offset < 0 ? ROTATE_X_NEGATIVE : ROTATE_X_POSITIVE) * rotationScale;

        let rotateY: number;
        let rotateX: number;
        let opacity: number;
        let y: number;

        if (progress < 0.5) {
          const amount = progress * 2;

          rotateY = mix(rotateIn, 0, amount);
          rotateX = mix(tiltX, 0, amount);
          opacity = mix(0.8, 1, amount);
          y = mix(offset, 0, amount);
        } else {
          const amount = (progress - 0.5) * 2;

          rotateY = mix(0, rotateOut, amount);
          rotateX = 0;
          opacity = mix(1, 0.9, amount);
          y = mix(0, -offset, amount);
        }

        const card = cards[index];

        card.style.opacity = String(opacity);
        card.style.transform = `translate3d(0, ${reducedMotion ? 0 : y}vh, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    };

    // How far the page has scrolled into the slider.
    const readScroll = () => clamp(-outer.getBoundingClientRect().top, 0, travel);

    const tick = () => {
      const distance = target - current;

      current = reducedMotion || Math.abs(distance) < 0.5 ? target : current + distance * SMOOTHING;
      render(current);
      frame = current === target ? 0 : requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      target = readScroll();

      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    // Jumps straight to the right frame, with no glide, after a layout change.
    const sync = () => {
      measure();
      target = readScroll();
      current = target;
      render(current);
    };

    sync();

    const resizeObserver = new ResizeObserver(sync);

    resizeObserver.observe(stage);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [placeKeys]);

  // overflowX is "clip", not "hidden": "hidden" would make this element the
  // scroll container for the sticky stage below and break the pinning.
  return (
    <div
      ref={outerRef}
      className='relative'
      style={{ overflowX: 'clip' }}
    >
      <div
        ref={stageRef}
        className='sticky top-0 flex h-screen items-center overflow-hidden'
        style={{ perspective: PERSPECTIVE }}
      >
        <div
          ref={trackRef}
          className='relative flex h-full items-center gap-[5vw] pr-[31vw] pl-[31vw] will-change-transform max-[1025px]:gap-[8vw] max-[1025px]:pr-[22.5vw] max-[1025px]:pl-[22.5vw] max-sm:gap-[10vw] max-sm:pr-[11vw] max-sm:pl-[11vw]'
          style={{ transformStyle: 'preserve-3d' }}
        >
          {places.map((place, index) => (
            <div
              key={place.src}
              ref={(element) => {
                wrappersRef.current[index] = element;
              }}
              className='relative h-[52vh] w-[38vw] shrink-0 max-[1025px]:h-[46vh] max-[1025px]:w-[55vw] max-sm:h-[52vh] max-sm:w-[78vw]'
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                ref={(element) => {
                  cardsRef.current[index] = element;
                }}
                className='group absolute inset-0 origin-right overflow-hidden rounded-3xl shadow-2xl'
                style={{ transformStyle: 'preserve-3d', zIndex: places.length - index }}
              >
                <Image
                  src={place.src}
                  alt={place.label}
                  fill
                  sizes='(max-width: 639px) 78vw, (max-width: 1024px) 55vw, 38vw'
                  className='object-cover transition-transform duration-700 ease-brand group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent' />
                <div className='absolute inset-x-0 bottom-0 p-5 text-white sm:p-7'>
                  <p className='font-mono text-[11px] tracking-[0.18em] text-white/70 uppercase'>
                    {String(index + 1).padStart(2, '0')} / {String(places.length).padStart(2, '0')}
                  </p>
                  <h3 className='mt-1 text-2xl leading-tight font-bold sm:text-3xl'>{place.label}</h3>
                  <p className='mt-2 max-w-xl text-sm text-white/85 sm:text-base'>{place.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlacesRotateSlider;
