'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Pagination, Spinner } from '@heroui/react';
import { IconLayoutGrid, IconMap2 } from '@tabler/icons-react';
import type { GuestyListing } from '@/lib/guesty/listings';
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
      <div className='relative overflow-hidden bg-[#eef3f1] py-16 dark:bg-[#1c2420]'>
        <div className='absolute inset-y-0 right-0 w-full sm:w-2/5 lg:w-1/3'>
          <Image
            src='/alojamiento/bg-alojamiento-3.png'
            alt='ar rentals alojamientos'
            fill
            priority
            sizes='35vw'
            className='object-cover object-bottom'
          />
          {/* Mobile: the image spans the full section width, so it needs a strong overlay to keep the text readable and tone down the photo. */}
          <div className='absolute inset-0 bg-[#eef3f1]/90 sm:hidden dark:bg-[#1c2420]/90' />
          {/* sm+: the image is confined to a corner accent, so a diagonal fade reveals it cleanly. */}
          <div className='absolute inset-0 hidden bg-linear-to-bl from-transparent via-[#eef3f1]/70 to-[#eef3f1] sm:block dark:via-[#1c2420]/70 dark:to-[#1c2420]' />
        </div>
        <div className='container relative mx-auto px-4 sm:px-0'>
          <PropertyAdvantages />
        </div>
      </div>

      <div className='container mx-auto px-4 pb-12'>
        <div className='relative -mt-9 z-10'>
          <PropertyFilters
            key={resetKey}
            cities={cities}
            onSubmit={handleFilter}
            onClear={handleClear}
            isLoading={isLoading}
            initialValues={initialFilters}
          />
        </div>
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
  );
};

export default PropertyListingsGrid;
