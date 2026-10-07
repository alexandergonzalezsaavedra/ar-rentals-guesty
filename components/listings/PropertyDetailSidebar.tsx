'use client';

import { useEffect, useState, type ComponentType } from 'react';
import {
  IconChecklist,
  IconChevronLeft,
  IconChevronRight,
  IconHome2,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
} from '@tabler/icons-react';

interface PropertyDetailSidebarProps {
  hasDescription: boolean;
  hasAmenities: boolean;
  hasLocation: boolean;
  expanded: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

function scrollToId(id: string) {
  // The hero is sticky on sm+, so once the content has slid over it the
  // browser already considers it "in view" and scrollIntoView does nothing.
  if (id === 'property-hero') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const PropertyDetailSidebar = ({
  hasDescription,
  hasAmenities,
  hasLocation,
  expanded,
  onToggle,
}: PropertyDetailSidebarProps) => {
  const items = [
    { id: 'property-hero', label: 'Inicio', icon: IconHome2 },
    hasDescription && {
      id: 'property-description',
      label: 'Descripción',
      icon: IconInfoCircle,
    },
    { id: 'property-gallery', label: 'Galería', icon: IconPhoto },
    hasAmenities && {
      id: 'property-amenities',
      label: 'Comodidades',
      icon: IconChecklist,
    },
    hasLocation && {
      id: 'property-location',
      label: 'Ubicación',
      icon: IconMapPin,
    },
  ].filter(Boolean) as NavItem[];

  const trackedIds = items.map((item) => item.id).join(',');
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const ids = trackedIds.split(',').filter(Boolean);

    if (ids.length === 0) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let rafId: number;
    let attempts = 0;

    // The location section (PropertyLocationMap) is loaded via next/dynamic
    // with ssr:false, so on first paint only its loading placeholder exists —
    // document.getElementById would miss it. Keep retrying a few frames
    // until every tracked section has actually mounted before observing.
    const trySetup = () => {
      const sections = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      attempts += 1;

      if (sections.length < ids.length && attempts < 60) {
        rafId = requestAnimationFrame(trySetup);
        return;
      }

      if (sections.length === 0) {
        return;
      }

      // Counts a section as "active" once it reaches the top band of the
      // viewport (below the sticky header) and until it's mostly scrolled
      // past, instead of requiring the whole section to be on screen.
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);

          if (visible.length > 0) {
            // Among the sections currently in the band, the one most
            // recently reached is the one whose top is closest to (but not
            // past) it — i.e. the largest top, not the smallest: a section
            // that's almost scrolled away still "intersects" with a very
            // negative top and would otherwise outrank the one actually
            // coming into focus.
            const current = visible.reduce((a, b) =>
              a.boundingClientRect.top > b.boundingClientRect.top ? a : b,
            );
            setActiveId(current.target.id);
          }
        },
        { rootMargin: '-110px 0px -65% 0px', threshold: [0, 1] },
      );

      sections.forEach((section) => observer?.observe(section));
    };

    trySetup();

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [trackedIds]);

  return (
    <aside
      className={`top-24 z-30 hidden shrink-0 flex-col gap-0.5 self-start overflow-hidden rounded-2xl border border-default-200 bg-content1 py-3 shadow-lg transition-[width] duration-300 lg:sticky lg:flex dark:border-default-100/20 ${
        expanded ? 'w-56' : 'w-16'
      }`}
    >
      <button
        type='button'
        onClick={onToggle}
        aria-label={expanded ? 'Colapsar menú' : 'Expandir menú'}
        className='mb-2 flex h-10 items-center gap-3 px-[1.125rem] text-default-500 hover:text-primary'
      >
        {expanded ? (
          <IconChevronLeft size={20} />
        ) : (
          <IconChevronRight size={20} />
        )}
        {expanded && (
          <span className='text-xs font-semibold tracking-wide text-default-400 uppercase'>
            Menú
          </span>
        )}
      </button>

      {items.map(({ id, label, icon: ItemIcon }) => {
        const isActive = id === activeId;

        return (
          <button
            key={id}
            type='button'
            onClick={() => scrollToId(id)}
            aria-current={isActive ? 'true' : undefined}
            className={`relative flex h-11 items-center gap-3 px-[1.125rem] transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-default-600 hover:bg-primary/5 hover:text-primary'
            }`}
          >
            {isActive && (
              <span className='absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary' />
            )}
            <ItemIcon
              size={20}
              className='shrink-0'
            />
            {expanded && (
              <span className='truncate text-sm font-medium'>{label}</span>
            )}
          </button>
        );
      })}
    </aside>
  );
};

export default PropertyDetailSidebar;
