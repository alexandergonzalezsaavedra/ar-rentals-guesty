'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackVisit } from '@/lib/tracking';

// Counts the visit once per page load and keeps the session alive on each page
// the visitor opens. lib/tracking checks consent before saving anything.
const TrackingInitializer = () => {
  const pathname = usePathname();

  useEffect(() => {
    trackVisit();
  }, []);

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
};

export default TrackingInitializer;
