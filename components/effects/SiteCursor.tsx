'use client';

import { useEffect, useRef } from 'react';

/** Share of the remaining distance covered each frame; lower trails further behind the pointer. */
const FOLLOW = 0.2;

const CLICKABLE = 'a, button, [role="button"], input, select, textarea, label, summary';

// Custom cursor for the whole site: a dot that trails the pointer, opens
// into a ring over anything clickable, and into a labelled disc over elements
// carrying `data-cursor="Text"`. The native cursor stays visible; this rides
// along with it. Styles live in app/globals.css (.prop-cursor).
//
// Position is written straight to the DOM from a rAF loop that stops once the
// dot has caught up, so moving the mouse never re-renders React.
const SiteCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const label = labelRef.current;

    // Touch devices have no pointer to follow, and reduced-motion users have
    // asked not to get effects like this one.
    if (
      !cursor ||
      !label ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    let hasPosition = false;

    const tick = () => {
      x += (targetX - x) * FOLLOW;
      y += (targetY - y) * FOLLOW;

      const settled = Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1;

      if (settled) {
        x = targetX;
        y = targetY;
      }

      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const handleMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      // First sighting: appear on the pointer instead of flying in from the corner.
      if (!hasPosition) {
        hasPosition = true;
        x = targetX;
        y = targetY;
      }

      cursor.dataset.visible = 'true';

      const target = event.target instanceof Element ? event.target : null;
      const labelled = target?.closest<HTMLElement>('[data-cursor]');

      if (labelled) {
        label.textContent = labelled.dataset.cursor ?? '';
        cursor.dataset.state = 'label';
      } else {
        cursor.dataset.state = target?.closest(CLICKABLE) ? 'link' : 'dot';
      }

      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    const handleLeave = () => {
      cursor.dataset.visible = 'false';
    };

    const handleDown = () => {
      cursor.dataset.pressed = 'true';
    };

    const handleUp = () => {
      cursor.dataset.pressed = 'false';
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden='true'
      className='prop-cursor'
      data-state='dot'
      // Above the sticky menu and modals, so it never slips behind them.
      style={{ zIndex: 90 }}
    >
      <div className='prop-cursor-disc'>
        <span
          ref={labelRef}
          className='prop-cursor-label'
        />
      </div>
    </div>
  );
};

export default SiteCursor;
