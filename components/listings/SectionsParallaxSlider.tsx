'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { EASE_BRAND_SOFT, cubicBezier } from '@/lib/easing';
import { HERO_SECTION_ID, PROPERTY_SECTION_EVENT } from './propertySections';

// Scroll distances, as a fraction of the stage height.
/** How much scrolling one slide-to-slide transition takes. */
const TRANSITION = 0.9;
/** How long a slide stays put, on top of whatever it needs to scroll its own content. */
const DWELL = 0.3;

// A card takes clicks while at rest, and also this close to it on either side
// of a transition (as a fraction of the transition).
const INTERACTIVE_MARGIN_IN = 0.8;
const INTERACTIVE_MARGIN_OUT = 0.2;

/** Share of the remaining distance covered each frame; lower is a longer, softer glide. */
const SMOOTHING = 0.14;

// Card surface for each slide, cycled in order. One hue on purpose: white and
// two tints of the brand green, so consecutive sections read as different
// cards without the page turning multicolored.
const CARD_TONES = [
  'bg-content1',
  'bg-[#eef3f1] dark:bg-[#1c2420]',
  'bg-[#dfe9e3] dark:bg-[#232e28]',
];

// One sweeping stroke per card, drawn behind its content as the page scrolls
// through that section. Cycled like the tones.
const CARD_LINES = [
  'M-60 240 C 180 40, 430 460, 600 250 S 900 90, 1060 400 S 720 900, 410 760 S 110 950, -60 800',
  'M1060 140 C 800 350, 610 40, 400 300 S 140 650, 450 710 S 900 600, 1060 910',
  'M-60 610 C 250 910, 400 290, 650 500 S 950 800, 1060 340',
];

// Content pieces that rise in one by one when a slide arrives.
const REVEAL_SELECTOR = 'h2, p, li, [data-reveal]';
/** Past this many, the rest come in together rather than keep the reader waiting. */
const MAX_REVEAL_STEPS = 12;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const ease = cubicBezier(EASE_BRAND_SOFT);

export interface SectionSlide {
  key: string;
  /** Section id used by the page navigation; slides without one belong to the previous section. */
  navId?: string;
  /** Short name shown in the card's header strip. */
  label: string;
  content: ReactNode;
}

interface SectionsParallaxSliderProps {
  slides: SectionSlide[];
}

/**
 * The property page's sections as full-height slides on a stage that stays
 * pinned while the page scrolls. Moving on, the current slide swells, blurs
 * and fades into the background while the next one rises from below to take
 * its place — the scroll-scrubbed handoff of a cinematic landing hero,
 * repeated once per section. Each slide is a card with its own tone, so the
 * incoming one visibly covers the one before it. Behind each card's content
 * a line draws itself with the scroll, and the content itself rises in piece
 * by piece as the card arrives.
 *
 * A slide taller than the stage first scrolls its own content with the page,
 * so nothing is cut off and there are no nested scrollbars.
 *
 * Everything is written straight to the DOM from one rAF loop; scrolling
 * never re-renders React.
 */
const SectionsParallaxSlider = ({ slides }: SectionsParallaxSliderProps) => {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentsRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<(SVGPathElement | null)[]>([]);

  const slideKeys = slides.map((slide) => `${slide.key}:${slide.navId ?? ''}`).join('|');

  useIsomorphicLayoutEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;

    if (!outer || !stage) return;

    const slideEls = slidesRef.current.filter((el): el is HTMLDivElement => el !== null);
    const contentEls = contentsRef.current.filter((el): el is HTMLDivElement => el !== null);
    const count = slideEls.length;

    if (count === 0 || contentEls.length !== count) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Per slide: where in the scroll range it comes to rest, how far its own
    // content has to scroll, and the offset that centers short content.
    const starts: number[] = [];
    const overflows: number[] = [];
    const bases: number[] = [];
    let stageHeight = 0;
    let transition = 0;
    let total = 0;

    let current = 0;
    let target = 0;
    let frame = 0;
    let activeId = '';

    // Marks the pieces of each slide that animate in, in reading order. Runs
    // again after layout changes because some content (the map) mounts late.
    const tagReveals = () => {
      contentEls.forEach((content) => {
        const candidates = Array.from(content.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)).filter(
          (element) => !element.closest('[data-no-reveal]'),
        );
        // A piece inside another piece moves with its parent, not on its own.
        const pieces = candidates.filter(
          (element) => !candidates.some((other) => other !== element && other.contains(element)),
        );

        pieces.forEach((piece, order) => {
          piece.classList.add('slide-reveal');
          piece.style.setProperty('--reveal-index', String(Math.min(order, MAX_REVEAL_STEPS)));
        });
      });
    };

    const measure = () => {
      tagReveals();
      stageHeight = stage.clientHeight;
      transition = stageHeight * TRANSITION;

      let cursor = 0;

      slideEls.forEach((slide, index) => {
        const contentHeight = contentEls[index].offsetHeight;

        overflows[index] = Math.max(0, contentHeight - stageHeight);
        bases[index] = Math.max(0, (stageHeight - contentHeight) / 2);
        starts[index] = cursor;
        slide.dataset.slideStart = String(Math.round(cursor));

        cursor += overflows[index] + stageHeight * DWELL;

        if (index < count - 1) {
          cursor += transition;
        }
      });

      total = cursor;
      // The scroll range itself, plus the pinned stage.
      outer.style.height = `${total + stageHeight}px`;
    };

    // How far the page has scrolled into the slider; negative before it pins.
    const readScroll = () => (parseFloat(getComputedStyle(stage).top) || 0) - outer.getBoundingClientRect().top;

    const announce = (id: string) => {
      if (id !== activeId) {
        activeId = id;
        window.dispatchEvent(new CustomEvent(PROPERTY_SECTION_EVENT, { detail: id }));
      }
    };

    // `position` is the smoothed, clamped scroll into the slider; `rawScroll`
    // is the real one, which goes negative while the slider is still on its
    // way up the screen.
    const render = (position: number, rawScroll: number) => {
      let active = 0;

      slideEls.forEach((slide, index) => {
        const enterStart = starts[index] - transition;
        const exitStart = starts[index] + overflows[index] + stageHeight * DWELL;

        const inner = clamp(position - starts[index], 0, overflows[index]);
        contentEls[index].style.transform = `translate3d(0, ${bases[index] - inner}px, 0)`;

        let y = 0;
        let scale = 1;
        let blur = 0;
        let opacity = 1;
        let visible = true;
        let resting = true;

        if (index > 0 && position <= enterStart) {
          // Still waiting below the stage.
          visible = false;
        } else if (index > 0 && position < starts[index]) {
          // Rising into place.
          const progress = (position - enterStart) / transition;
          const eased = ease(progress);

          // Clickable for the last stretch of the rise: by then the card is
          // all but in place, and a reader who stops scrolling a hair early
          // shouldn't find its top rows dead to the mouse.
          resting = progress > INTERACTIVE_MARGIN_IN;

          if (reducedMotion) {
            opacity = eased;
          } else {
            y = (1 - eased) * stageHeight * 1.05;
            scale = 0.94 + 0.06 * eased;
          }
        } else if (index < count - 1 && position > exitStart) {
          // Swelling and dissolving into the background as the next one arrives.
          const progress = Math.min(1, (position - exitStart) / transition);
          const eased = ease(progress);

          // Likewise still clickable for the first stretch of the way out.
          resting = progress < INTERACTIVE_MARGIN_OUT;
          visible = progress < 1;
          opacity = 1 - eased;

          if (!reducedMotion) {
            scale = 1 + 0.15 * eased;
            blur = 20 * eased;
          }
        }

        if (position >= starts[index] - transition / 2) {
          active = index;
        }

        slide.style.visibility = visible ? 'visible' : 'hidden';
        slide.style.opacity = String(opacity);
        slide.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
        slide.style.filter = blur > 0.1 ? `blur(${blur}px)` : 'none';
        slide.style.pointerEvents = resting ? 'auto' : 'none';

        // The first slide has no rise of its own: it is "arriving" while the
        // whole slider scrolls into view.
        const arrival = index === 0 ? -stageHeight * 0.85 : enterStart;
        const place = index === 0 ? Math.min(rawScroll, position) : position;

        const line = linesRef.current[index];

        if (line) {
          const drawn = clamp((place - arrival) / (exitStart - arrival), 0, 1);
          line.style.strokeDashoffset = String(1 - drawn);
        }

        // Entrances start once the card is about halfway into place.
        const entered = place > arrival + (starts[index] - arrival) * 0.5;
        slide.dataset.entered = String(entered);
      });

      return active;
    };

    // The section in focus is the one owning the slide at (or nearest) rest.
    const announceFor = (active: number, rawScroll: number) => {
      let id = HERO_SECTION_ID;

      if (rawScroll > -stageHeight * 0.5) {
        for (let index = 0; index <= active; index++) {
          id = slideEls[index].dataset.slideNav || id;
        }
      }

      announce(id);
    };

    const tick = () => {
      const distance = target - current;

      current = reducedMotion || Math.abs(distance) < 0.5 ? target : current + distance * SMOOTHING;
      const rawScroll = readScroll();

      announceFor(render(current, rawScroll), rawScroll);
      frame = current === target ? 0 : requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      target = clamp(readScroll(), 0, total);

      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    // Jumps straight to the right frame, with no glide, after a layout change.
    const sync = () => {
      measure();
      target = clamp(readScroll(), 0, total);
      current = target;

      const rawScroll = readScroll();

      announceFor(render(current, rawScroll), rawScroll);
    };

    sync();

    // Section heights change after mount (photos, the map), and every
    // distance here is derived from them.
    const resizeObserver = new ResizeObserver(sync);

    resizeObserver.observe(stage);
    contentEls.forEach((content) => resizeObserver.observe(content));

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [slideKeys]);

  return (
    <div
      ref={outerRef}
      data-sections-slider
      className='relative'
    >
      {/* Pinned below the sticky menu and breadcrumb; below lg it also leaves room for the mobile bottom nav. */}
      <div
        ref={stageRef}
        data-sections-stage
        className='sticky top-24 h-[calc(100dvh-6rem-5.5rem)] overflow-hidden lg:h-[calc(100dvh-7rem)]'
      >
        {slides.map((slide, index) => (
          <div
            key={slide.key}
            ref={(element) => {
              slidesRef.current[index] = element;
            }}
            data-slide-nav={slide.navId}
            className={`absolute inset-0 overflow-hidden rounded-3xl border border-default-200 will-change-transform dark:border-default-100/20 ${CARD_TONES[index % CARD_TONES.length]}`}
            // Until the script takes over, only the first slide shows, so they never flash stacked on top of each other.
            style={{ visibility: index === 0 ? 'visible' : 'hidden' }}
          >
            <svg
              aria-hidden='true'
              viewBox='0 0 1000 1000'
              preserveAspectRatio='xMidYMid slice'
              className='pointer-events-none absolute inset-0 h-full w-full text-primary/15'
            >
              <path
                ref={(element) => {
                  linesRef.current[index] = element;
                }}
                d={CARD_LINES[index % CARD_LINES.length]}
                pathLength={1}
                fill='none'
                stroke='currentColor'
                strokeWidth={46}
                strokeLinecap='round'
                strokeDasharray={1}
                strokeDashoffset={1}
              />
            </svg>
            <div
              ref={(element) => {
                contentsRef.current[index] = element;
              }}
              className='relative px-5 py-6 will-change-transform sm:px-8 sm:py-8'
            >
              <div
                data-reveal
                className='mb-6 flex items-center justify-between gap-4 border-b border-default-300/60 pb-3 font-mono text-[11px] tracking-[0.18em] text-default-500 uppercase'
              >
                <span className='flex items-center gap-2'>
                  <span className='size-1.5 rounded-full bg-primary' />
                  {slide.label}
                </span>
                <span>
                  <span className='text-foreground'>{String(index + 1).padStart(2, '0')}</span> /{' '}
                  {String(slides.length).padStart(2, '0')}
                </span>
              </div>
              {slide.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionsParallaxSlider;
