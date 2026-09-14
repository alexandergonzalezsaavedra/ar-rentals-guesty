'use client';

import { useMemo, useState } from 'react';
import { Pagination } from '@heroui/react';
import type { GuestyListing } from '@/lib/guesty/listings';
import PropertyCard from './PropertyCard';
import PropertyFilters, { type PropertyFiltersValues } from './PropertyFilters';

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

const PropertyListingsGrid = ({ listings: initialListings, cities, initialFilters }: PropertyListingsGridProps) => {
  const [listings, setListings] = useState(initialListings);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState<PropertyFiltersValues>(initialFilters ?? {});

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
      setError('No pudimos aplicar el filtro. Intentá de nuevo.');
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
  };

  return (
    <div>
      <PropertyFilters
        key={resetKey}
        cities={cities}
        onSubmit={handleFilter}
        onClear={handleClear}
        isLoading={isLoading}
        initialValues={initialFilters}
      />

      {error && <p className='text-danger text-sm mb-4'>{error}</p>}

      <p className='text-default-500 text-sm mb-4'>
        {listings.length} inmuebles · página {page} de {totalPages}
      </p>

      {listings.length === 0 ? (
        <p className='text-default-500 py-12 text-center'>No hay inmuebles que coincidan con los filtros.</p>
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

      {totalPages > 1 && (
        <div className='flex justify-center mt-8'>
          <Pagination
            total={totalPages}
            page={page}
            onChange={setPage}
            showControls
          />
        </div>
      )}
    </div>
  );
};

export default PropertyListingsGrid;
