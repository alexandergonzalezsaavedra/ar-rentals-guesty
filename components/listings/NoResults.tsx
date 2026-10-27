'use client';

import { Button } from '@heroui/react';
import {
  IconBuildingSkyscraper,
  IconCalendarOff,
  IconHomeSearch,
  IconLayoutGrid,
  IconAdjustmentsOff,
} from '@tabler/icons-react';
import { spaceGrotesk } from '@/lib/fonts';
import { describeFilters } from './ActiveFiltersBar';
import type { PropertyFiltersValues } from './PropertyFilters';

interface NoResultsProps {
  filters: PropertyFiltersValues;
  isLoading?: boolean;
  /** Runs the search again with some filters dropped. */
  onRelax: (values: PropertyFiltersValues) => void;
  onClear: () => void;
}

// Empty search: says plainly that nothing matched, shows what was searched,
// and offers one-click searches with fewer filters, built from the ones that
// are actually set, so the visitor always has a next step.
const NoResults = ({ filters, isLoading, onRelax, onClear }: NoResultsProps) => {
  const searched = describeFilters(filters);

  const suggestions = [
    filters.city && {
      label: 'Buscar en todas las ciudades',
      icon: IconBuildingSkyscraper,
      values: { ...filters, city: undefined },
    },
    filters.checkIn &&
      filters.checkOut && {
        label: 'Ver sin fechas',
        icon: IconCalendarOff,
        values: { ...filters, checkIn: undefined, checkOut: undefined },
      },
    (filters.numberOfBedrooms || filters.numberOfBathrooms) && {
      label: 'Sin mínimo de habitaciones y baños',
      icon: IconAdjustmentsOff,
      values: { ...filters, numberOfBedrooms: undefined, numberOfBathrooms: undefined },
    },
  ].filter(Boolean) as { label: string; icon: typeof IconHomeSearch; values: PropertyFiltersValues }[];

  return (
    <div className='container mx-auto py-6'>
      <div className='mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-default-200 bg-content1 px-6 py-10 text-center shadow-sm sm:px-10 dark:border-default-100/20'>
        <span className='flex size-16 items-center justify-center rounded-full bg-arena text-arena-tostada dark:bg-arena-tostada/30 dark:text-arena'>
          <IconHomeSearch size={30} />
        </span>

        <h3 className={`${spaceGrotesk.className} mt-5 text-2xl font-bold text-balance text-foreground sm:text-3xl`}>
          No encontramos alojamientos con esas características
        </h3>
        <p className='mt-2 max-w-md text-sm text-default-500 sm:text-base'>
          Pero hay más opciones cerca. Pruebe quitando alguno de los filtros para ver alojamientos similares.
        </p>

        {searched.length > 0 && (
          <div className='mt-5 flex flex-wrap justify-center gap-1.5'>
            {searched.map((label) => (
              <span
                key={label}
                className='rounded-full bg-content2 px-3 py-1 text-xs font-medium text-default-600'
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className='mt-7 w-full'>
            <p className='font-mono text-[11px] tracking-[0.18em] text-arena-tostada uppercase dark:text-arena'>
              Pruebe con
            </p>
            <div className='mt-3 flex flex-wrap justify-center gap-2'>
              {suggestions.map(({ label, icon: Icon, values }) => (
                <Button
                  key={label}
                  radius='full'
                  variant='bordered'
                  isDisabled={isLoading}
                  startContent={<Icon size={16} />}
                  onPress={() => onRelax(values)}
                  className='border-default-300 font-medium text-foreground hover:border-primary hover:text-primary'
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Button
          radius='full'
          isLoading={isLoading}
          startContent={!isLoading && <IconLayoutGrid size={16} />}
          onPress={onClear}
          className='mt-6 bg-sierra px-6 font-semibold text-white dark:bg-arena dark:text-sierra'
        >
          Ver todos los alojamientos
        </Button>
      </div>
    </div>
  );
};

export default NoResults;
