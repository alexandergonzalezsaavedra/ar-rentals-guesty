'use client';

import { useEffect } from 'react';

// Set when the browser's back/forward buttons cause the navigation, so the
// page they return to keeps the scroll position the browser restores.
let isHistoryNavigation = false;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    isHistoryNavigation = true;
  });
}

// Starts the page at the very top when it's reached through a link.
//
// Next.js normally does this, but it skips sticky elements when looking for
// where the page begins. A page that opens with a sticky header and a sticky
// hero gives it nothing to scroll to, so the visitor stays at whatever height
// they were on the previous page — below the hero, or further.
const ScrollToTopOnArrive = () => {
  useEffect(() => {
    if (isHistoryNavigation) {
      isHistoryNavigation = false;
      return;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return null;
};

export default ScrollToTopOnArrive;
