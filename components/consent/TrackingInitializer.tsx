'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackVisit } from '@/lib/tracking';

// Counts the visit once per page load and records each page the visitor opens.
// lib/tracking checks consent before saving anything.
const TrackingInitializer = () => {
  const pathname = usePathname();

  useEffect(() => {
    trackVisit();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
};

export default TrackingInitializer;
