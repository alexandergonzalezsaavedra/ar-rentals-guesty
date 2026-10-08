'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Pagination, Spinner } from '@heroui/react';
import { IconLayoutGrid, IconMap2 } from '@tabler/icons-react';
import type { GuestyListing } from '@/lib/guesty/listings';
import ScrollLine from '@/components/effects/ScrollLine';
import ActiveFiltersBar from './ActiveFiltersBar';
import PropertyAdvantages from './PropertyAdvantages';
import PropertyCard from './PropertyCard';
import PropertyFilters, { type PropertyFiltersValues } from './PropertyFilters';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className='flex h-150 w-full items-center justify-center rounded-xl bg-default-50'>
      <Spinner label='Cargando mapa...' />
    </div>
  ),
});

const PAGE_SIZE = 20;

interface PropertyListingsGridProps {
  listings: GuestyListing[];
  cities: string[];
  initialFilters?: PropertyFiltersValues;
}

interface SearchSuccess {
  results: GuestyListing[];
  pagination: { total: number };
}

interface SearchFailure {
  error: string;
}

const PropertyListingsGrid = ({
  listings: initialListings,
  cities,
  initialFilters,
}: PropertyListingsGridProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [listings, setListings] = useState(initialListings);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [activeFilters, setActiveFilters] = useState<PropertyFiltersValues>(
    initialFilters ?? {},
  );

  const filtersRef = useRef<HTMLDivElement>(null);
  const [isPastFilters, setIsPastFilters] = useState(false);

  // The floating summary only makes sense once the filter form has scrolled
  // off the top of the screen (not while it's still below the fold).
  useEffect(() => {
    const filters = filtersRef.current;

    if (!filters) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsPastFilters(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      // Offset by the sticky menu, which covers the top of the viewport.
      { rootMargin: '-64px 0px 0px 0px' },
    );

    observer.observe(filters);
    return () => observer.disconnect();
  }, []);

  const handleEditFilters = () => {
    filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));

  const pageListings = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return listings.slice(start, start + PAGE_SIZE);
  }, [listings, page]);

  const handleFilter = async (values: PropertyFiltersValues) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ all: 'true' });
    for (const [key, value] of Object.entries(values)) {
      if (value) {
        params.set(key, value);
      }
    }
    // Guesty requires "country" whenever "city" is set; this catalog is Colombia-only.
    if (values.city) {
      params.set('country', 'Colombia');
    }

    try {
      const response = await fetch(`/api/guesty/search?${params.toString()}`);
      const data = (await response.json()) as SearchSuccess | SearchFailure;

      if (!response.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : 'request failed');
      }

      setListings(data.results);
      setPage(1);
      setActiveFilters(values);
    } catch {
      setError('No pudimos aplicar el filtro. Intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setListings(initialListings);
    setPage(1);
    setError(null);
    setActiveFilters({});
    setResetKey((key) => key + 1);
    // The active filters can come from the URL (e.g. a "city" link from the
    // map popup or breadcrumb), so clearing the form must also clear those
    // query params — otherwise a refresh would silently reapply them.
    router.replace(pathname, { scroll: false });
  };

  return (
    <div>
      <div className='relative z-0 overflow-hidden bg-[#eef3f1] py-16 sm:sticky sm:top-0 dark:bg-[#1c2420]'>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className='absolute inset-y-0 right-0 w-full overflow-hidden sm:w-3/5 lg:w-1/2'
        >
          <Image
            src='/alojamiento/bg-alojamiento-3.png'
            alt='ar rentals alojamientos'
            fill
            priority
            sizes='(min-width: 1024px) 50vw, (min-width: 640px) 60vw, 100vw'
            className='animate-banner-drift object-cover object-bottom'
          />
          {/* Mobile: the photo is the backdrop for the whole section. The veil is only strong at the top, behind the title; the step cards below are opaque and don't need it. */}
          <div className='absolute inset-0 bg-linear-to-b from-[#eef3f1]/85 via-[#eef3f1]/45 to-[#eef3f1]/10 sm:hidden dark:from-[#1c2420]/85 dark:via-[#1c2420]/45 dark:to-[#1c2420]/10' />
          {/* sm+: the image takes the right side of the banner and a diagonal fade blends it into the flat background. */}
          <div className='absolute inset-0 hidden bg-linear-to-bl from-transparent via-[#eef3f1]/40 to-[#eef3f1] sm:block dark:via-[#1c2420]/40 dark:to-[#1c2420]' />
        </motion.div>
        <div className='relative w-full px-4'>
          <PropertyAdvantages />
        </div>
      </div>

      {/* Opaque and stacked above the sticky banner, so it slides over it on scroll (same effect as the home page). */}
      <div className='relative z-10 rounded-t-3xl bg-background shadow-[0_-24px_48px_-12px_rgba(0,0,0,0.25)]'>
        <ScrollLine mirrored />
        <div className='w-full px-4 pb-12'>
          {/* Comes in last, after the banner title and step cards have settled. */}
          <motion.div
            ref={filtersRef}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
            className='relative z-10 scroll-mt-20 pt-8'
          >
            <PropertyFilters
              key={resetKey}
              cities={cities}
              onSubmit={handleFilter}
              onClear={handleClear}
              isLoading={isLoading}
              initialValues={initialFilters}
            />
          </motion.div>
          <ActiveFiltersBar
            filters={activeFilters}
            total={listings.length}
            isVisible={isPastFilters}
            onEdit={handleEditFilters}
          />
          {error && <p className='text-danger text-sm mb-4'>{error}</p>}

          <div className='mb-4 flex items-center justify-between gap-3'>
            <p className='text-default-500 text-sm'>
              {listings.length} inmuebles
              {view === 'list' && ` · página ${page} de ${totalPages}`}
            </p>

            <div className='flex items-center gap-1 rounded-full border border-default-200 bg-content1 p-1'>
              <Button
                size='sm'
                radius='full'
                variant={view === 'list' ? 'solid' : 'light'}
                color={view === 'list' ? 'primary' : 'default'}
                startContent={<IconLayoutGrid size={16} />}
                onPress={() => setView('list')}
                className={
                  view === 'list' ? 'text-white font-bold' : 'text-default-800'
                }
              >
                Lista
              </Button>
              <Button
                size='sm'
                radius='full'
                variant={view === 'map' ? 'solid' : 'light'}
                color={view === 'map' ? 'primary' : 'default'}
                startContent={<IconMap2 size={16} />}
                onPress={() => setView('map')}
                className={
                  view === 'map' ? 'text-white font-bold' : 'text-default-800'
                }
              >
                Mapa
              </Button>
            </div>
          </div>

          {listings.length === 0 ? (
            <p className='text-default-500 py-12 text-center'>
              No hay inmuebles que coincidan con los filtros.
            </p>
          ) : view === 'map' ? (
            <PropertyMap listings={listings} />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {pageListings.map((listing, index) => (
                <PropertyCard
                  key={listing._id}
                  listing={listing}
                  index={index}
                  checkIn={activeFilters.checkIn}
                  checkOut={activeFilters.checkOut}
                  adults={activeFilters.adults}
                  childrenCount={activeFilters.children}
                />
              ))}
            </div>
          )}

          {view === 'list' && totalPages > 1 && (
            <div className='flex justify-center mt-8'>
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                showControls
                className='text-white'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyListingsGrid;
