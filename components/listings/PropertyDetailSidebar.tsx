'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import {
  IconChecklist,
  IconChevronLeft,
  IconChevronRight,
  IconHome2,
  IconInfoCircle,
  IconMapPin,
  IconNotes,
  IconPhoto,
} from '@tabler/icons-react';
import { EASE_BRAND } from '@/lib/easing';
import { HERO_SECTION_ID, PROPERTY_SECTION_EVENT, scrollToPropertySection } from './propertySections';

interface PropertyDetailSidebarProps {
  hasDescription: boolean;
  hasAmenities: boolean;
  hasLocation: boolean;
  hasNotes: boolean;
  expanded: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const PropertyDetailSidebar = ({
  hasDescription,
  hasAmenities,
  hasLocation,
  hasNotes,
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
    hasNotes && {
      id: 'property-notes',
      label: 'Notas importantes',
      icon: IconNotes,
    },
  ].filter(Boolean) as NavItem[];

  const [activeId, setActiveId] = useState<string | null>(HERO_SECTION_ID);

  // The section slider announces which section is in focus as it scrolls.
  useEffect(() => {
    const handleChange = (event: Event) => setActiveId((event as CustomEvent<string>).detail);

    window.addEventListener(PROPERTY_SECTION_EVENT, handleChange);
    return () => window.removeEventListener(PROPERTY_SECTION_EVENT, handleChange);
  }, []);

  return (
    // Desktop only (hidden below lg): slides in from the left the first time it scrolls into view.
    <motion.aside
      initial={{ opacity: 0, x: -72 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: EASE_BRAND }}
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
            onClick={() => scrollToPropertySection(id)}
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
    </motion.aside>
  );
};

export default PropertyDetailSidebar;
