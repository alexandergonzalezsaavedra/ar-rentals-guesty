'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@heroui/react';
import { IconAdjustmentsHorizontal, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { formatMonthShort } from '@/lib/format';
import type { PropertyFiltersValues } from './PropertyFilters';

interface ActiveFiltersBarProps {
  filters: PropertyFiltersValues;
  total: number;
  isVisible: boolean;
  onEdit: () => void;
}

function formatDay(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return `${date.getDate()} ${formatMonthShort(date)}`;
}

function plural(value: string | undefined, singular: string, pluralForm: string): string | null {
  const count = Number(value ?? 0);
  return count > 0 ? `${count} ${count === 1 ? singular : pluralForm}` : null;
}

function describeFilters(filters: PropertyFiltersValues): string[] {
  const dates =
    filters.checkIn && filters.checkOut ? `${formatDay(filters.checkIn)} – ${formatDay(filters.checkOut)}` : null;

  return [
    filters.city,
    dates,
    plural(filters.adults, 'adulto', 'adultos'),
    plural(filters.children, 'niño', 'niños'),
    plural(filters.numberOfBedrooms, 'habitación', 'habitaciones'),
    plural(filters.numberOfBathrooms, 'baño', 'baños'),
  ].filter((label): label is string => Boolean(label));
}

// Floating summary of the current search. It lives in a zero-height sticky
// wrapper, so it follows the scroll through the listings without pushing them
// down, and only shows once the filter form itself is out of view.
const ActiveFiltersBar = ({ filters, total, isVisible, onEdit }: ActiveFiltersBarProps) => {
  const labels = describeFilters(filters);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState({ left: false, right: false });

  // On narrow screens the labels don't fit and scroll sideways. Tracks which
  // edges have content cut off so each one can show a fade and an arrow.
  const updateHidden = () => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;

    setHidden((current) => (current.left === left && current.right === right ? current : { left, right }));
  };

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    // Fires once on observe and again whenever the bar or its labels resize.
    const observer = new ResizeObserver(updateHidden);
    observer.observe(el);
    for (const child of Array.from(el.children)) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, [labels.length, total]);

  const fade = `linear-gradient(to right, ${hidden.left ? 'transparent, black 28px' : 'black'}, ${
    hidden.right ? 'black calc(100% - 28px), transparent' : 'black'
  })`;

  return (
    <div
      className='pointer-events-none sticky top-[92px] z-30 h-0 sm:top-28'
      aria-hidden={!isVisible}
    >
      <div
        className={`flex justify-center transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <div
          className={`flex max-w-full items-center gap-4 rounded-full border border-default-200 bg-background/90 py-1.5 pr-1.5 pl-4 shadow-lg backdrop-blur-md ${
            isVisible ? 'pointer-events-auto' : ''
          }`}
        >
          <div className='relative flex min-w-0 items-center'>
            {hidden.left && (
              <IconChevronLeft
                size={14}
                className='pointer-events-none absolute -left-3 z-10 text-primary'
              />
            )}
            {hidden.right && (
              <IconChevronRight
                size={14}
                className='pointer-events-none absolute -right-3.5 z-10 animate-pulse text-primary'
              />
            )}
            <div
              ref={scrollRef}
              onScroll={updateHidden}
              className='flex min-w-0 items-center gap-1.5 overflow-x-auto text-sm whitespace-nowrap [scrollbar-width:none]'
              style={{ maskImage: fade, WebkitMaskImage: fade }}
            >
              <span className='font-semibold text-foreground'>
                {total} {total === 1 ? 'inmueble' : 'inmuebles'}
              </span>
              {labels.length === 0 && <span className='text-default-500'>· sin filtros</span>}
              {labels.map((label) => (
                <span
                  key={label}
                  className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <Button
            size='sm'
            radius='full'
            color='primary'
            className='shrink-0 text-white'
            startContent={<IconAdjustmentsHorizontal size={16} />}
            tabIndex={isVisible ? 0 : -1}
            onPress={onEdit}
          >
            {labels.length === 0 ? 'Filtrar' : 'Editar filtros'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActiveFiltersBar;
