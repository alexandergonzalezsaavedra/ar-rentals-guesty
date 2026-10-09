'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { Button, Tab, Tabs } from '@heroui/react';
import {
  IconBeach,
  IconBuildingMonument,
  IconMapPin,
  IconMoonStars,
  IconTrees,
} from '@tabler/icons-react';
import DotArrowLabel from './DotArrowLabel';
import PlacesRotateSlider from './PlacesRotateSlider';

interface Place {
  src: string;
  label: string;
  description: string;
}

interface CategorySection {
  slug: string;
  label: string;
  /** One word, for the phone layout where five tabs share the width. */
  shortLabel: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  places: Place[];
}

export const CATEGORIES: CategorySection[] = [
  {
    slug: 'playas',
    shortLabel: 'Playas',
    label: 'Playas',
    icon: IconBeach,
    places: [
      {
        src: '/lugares-turisticos/playas/playa-blanca.jpg',
        label: 'Playa Blanca',
        description:
          'Famosa por sus aguas cristalinas y tranquilas. Perfecta para pasar el día y relajarte.',
      },
      {
        src: '/lugares-turisticos/playas/playa-cristal.jpg',
        label: 'Playa Cristal',
        description:
          'Aguas transparentes perfectas para el snorkel, dentro del Parque Tayrona.',
      },
      {
        src: '/lugares-turisticos/playas/playa-cinto.jpg',
        label: 'Playa Cinto',
        description:
          'Apartada y virgen, perfecta para quienes buscan un escape de las multitudes.',
      },
      {
        src: '/lugares-turisticos/playas/bahia-concha.jpg',
        label: 'Bahía Concha',
        description:
          'Una playa serena dentro del Parque Tayrona, ideal para nadar y descansar rodeado de naturaleza.',
      },
      {
        src: '/lugares-turisticos/playas/el-rodadero.jpg',
        label: 'El Rodadero',
        description:
          'La playa más popular y comercial, llena de restaurantes, bares y actividades acuáticas.',
      },
      {
        src: '/lugares-turisticos/playas/taganga.jpg',
        label: 'Taganga',
        description:
          'Un pueblo de pescadores con una bahía ideal para bucear y hacer snorkel. También ofrece buena vida nocturna.',
      },
    ],
  },
  {
    slug: 'parques-naturales',
    shortLabel: 'Parques',
    label: 'Parques Naturales',
    icon: IconTrees,
    places: [
      {
        src: '/lugares-turisticos/parques-naturales/parque-nacional-natural-tayrona.jpg',
        label: 'Parque Nacional Natural Tayrona',
        description:
          'Selva, playas y montañas se combinan en uno de los parques más espectaculares de Colombia.',
      },
      {
        src: '/lugares-turisticos/parques-naturales/sierra-nevada-de-santa-marta.jpg',
        label: 'Sierra Nevada de Santa Marta',
        description:
          'El macizo costero más alto del mundo, hogar de comunidades indígenas y paisajes impresionantes.',
      },
      {
        src: '/lugares-turisticos/parques-naturales/minca.jpg',
        label: 'Minca',
        description:
          'Un pueblo de montaña rodeado de fincas cafeteras, cascadas y senderos entre la naturaleza.',
      },
    ],
  },
  {
    slug: 'sitios-historicos-y-culturales',
    shortLabel: 'Historia',
    label: 'Sitios Históricos y Culturales',
    icon: IconBuildingMonument,
    places: [
      {
        src: '/lugares-turisticos/sitios-historicos-y-culturales/ciudad-perdida-Teyuna.jpg',
        label: 'Ciudad Perdida - Teyuna',
        description:
          'Una antigua ciudad indígena escondida en la selva, accesible tras varios días de caminata.',
      },
      {
        src: '/lugares-turisticos/sitios-historicos-y-culturales/quinta-de-san-pedro-alejandrino.jpg',
        label: 'Quinta de San Pedro Alejandrino',
        description:
          'Hacienda histórica donde murió el Libertador Simón Bolívar, hoy convertida en museo y jardín botánico.',
      },
      {
        src: '/lugares-turisticos/sitios-historicos-y-culturales/centro-historico-de-santa-marta.jpg',
        label: 'Centro Histórico de Santa Marta',
        description:
          'Calles coloniales, plazas y edificios históricos en el corazón de la ciudad más antigua de Colombia.',
      },
      {
        src: '/lugares-turisticos/sitios-historicos-y-culturales/museo-del-oro-tairona.jpg',
        label: 'Museo del Oro Tairona',
        description:
          'Exhibe piezas arqueológicas de la cultura Tairona y la historia precolombina de la región.',
      },
      {
        src: '/lugares-turisticos/sitios-historicos-y-culturales/pueblo-indígena-chairama.jpg',
        label: 'Pueblo Indígena Chairama',
        description:
          'Una comunidad indígena en la Sierra Nevada que conserva vivas sus tradiciones ancestrales.',
      },
    ],
  },
  {
    slug: 'sitios-de-interes',
    shortLabel: 'Interés',
    label: 'Sitios de Interés',
    icon: IconMapPin,
    places: [
      {
        src: '/lugares-turisticos/sitios-de-interes/malecon-de-santa-marta.jpg',
        label: 'Malecón de Santa Marta',
        description:
          'Un paseo frente al mar ideal para caminar, ver el atardecer y disfrutar de la brisa marina.',
      },
      {
        src: '/lugares-turisticos/sitios-de-interes/cerro-ziruma.jpg',
        label: 'Cerro Ziruma',
        description:
          'Mirador natural con vistas panorámicas de la bahía y la ciudad de Santa Marta.',
      },
      {
        src: '/lugares-turisticos/sitios-de-interes/cascadas-de-marinka-minca.jpg',
        label: 'Cascadas de Marinka, Minca',
        description:
          'Caídas de agua rodeadas de selva, perfectas para refrescarte en medio de la naturaleza.',
      },
      {
        src: '/lugares-turisticos/sitios-de-interes/acuario-y-museo-del-mar-del-rodadero.jpg',
        label: 'Acuario y Museo del Mar del Rodadero',
        description:
          'Conoce especies marinas del Caribe colombiano en este acuario frente al mar.',
      },
    ],
  },
  {
    slug: 'vida-nocturna',
    shortLabel: 'Noche',
    label: 'Vida Nocturna',
    icon: IconMoonStars,
    places: [
      {
        src: '/lugares-turisticos/vida-nocturna/la-puerta.jpg',
        label: 'La Puerta',
        description:
          'Uno de los bares más icónicos de Santa Marta, con buena música y ambiente nocturno.',
      },
      {
        src: '/lugares-turisticos/vida-nocturna/donde-chucho.jpeg',
        label: 'Donde Chucho',
        description:
          'Restaurante y bar frente al mar en Taganga, famoso por sus noches de rumba.',
      },
      {
        src: '/lugares-turisticos/vida-nocturna/la-brisa-loca-rooftop.jpg',
        label: 'La Brisa Loca Rooftop',
        description:
          'Terraza con vista panorámica, ideal para disfrutar tragos y música en las alturas.',
      },
      {
        src: '/lugares-turisticos/vida-nocturna/el-mirador-taganga.jpg',
        label: 'El Mirador, Taganga',
        description:
          'Punto alto con vistas espectaculares de la bahía, perfecto para el atardecer y la fiesta después.',
      },
    ],
  },
];

const SLUGS = CATEGORIES.map((category) => category.slug);

function getSlugFromHash(): string {
  const hash = window.location.hash.replace('#', '');
  return SLUGS.includes(hash) ? hash : CATEGORIES[0].slug;
}

const LugaresTuristicosTabs = () => {
  const [selected, setSelected] = useState(CATEGORIES[0].slug);

  const containerRef = useRef<HTMLDivElement>(null);

  // Scrolls the page so the tab content starts right under the sticky tab
  // bar. With `onlyIfPast`, it only moves when the reader is already further
  // down than that.
  const scrollToContentStart = (behavior: ScrollBehavior, onlyIfPast: boolean) => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const stickyTop = parseFloat(getComputedStyle(container.firstElementChild ?? container).top) || 0;
    const target = container.getBoundingClientRect().top + window.scrollY - stickyTop;

    if (!onlyIfPast || window.scrollY > target) {
      window.scrollTo({ top: target, behavior });
    }
  };

  useEffect(() => {
    setSelected(getSlugFromHash());

    // Arriving from a category link (/lugares-turisticos#playas): there's no
    // element with that id, so the browser keeps whatever scroll position the
    // previous page had and the reader lands deep inside, or past, the
    // category. Start them at its beginning instead. Deferred a beat so it
    // runs after the router's own scroll handling.
    let frame = 0;
    const timeout = window.setTimeout(() => {
      if (window.location.hash) {
        frame = requestAnimationFrame(() => scrollToContentStart('instant', false));
      }
    }, 50);

    const onHashChange = () => {
      setSelected(getSlugFromHash());
      scrollToContentStart('smooth', false);
    };

    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  return (
    // Wraps the tabs so there's one element marking where the content starts;
    // it also still spans the whole panel, which the sticky tab bar needs.
    <div ref={containerRef}>
    <Tabs
      aria-label='Categorías de lugares turísticos'
      selectedKey={selected}
      onSelectionChange={(key) => {
        const slug = String(key);
        setSelected(slug);
        window.history.replaceState(null, '', `#${slug}`);
        // Switching category while scrolled into the previous one would leave the reader
        // in the middle (or past the end) of the new one.
        scrollToContentStart('smooth', true);
      }}
      color='primary'
      variant='solid'
      classNames={{
        // Stays pinned under the menu and breadcrumb while the places scroll
        // by. It's the wrapper that sticks: its parent spans the whole panel,
        // which gives it room to; the tab list alone is only as tall as itself.
        base: 'sticky top-24 z-30 w-full justify-center',
        // A floating pill. On phones the five categories share the width
        // equally as icon-over-word buttons; from sm up each gets its full name.
        tabList:
          'h-auto w-full max-w-full flex-nowrap gap-1 overflow-visible rounded-3xl border border-default-200 bg-content1 p-1.5 shadow-lg sm:w-fit sm:gap-1.5 sm:rounded-full sm:p-2 dark:border-default-100/20',
        tab: 'group h-auto min-w-0 flex-1 rounded-2xl px-1 py-2 data-[hover-unselected=true]:opacity-100 sm:w-auto sm:flex-none sm:rounded-full sm:px-5 sm:py-2.5',
        cursor: 'rounded-2xl bg-primary shadow-md sm:rounded-full',
        panel: 'pt-6',
      }}
    >
      {CATEGORIES.map(({ slug, label, shortLabel, icon: CategoryIcon, places }) => {
        const isActive = selected === slug;

        return (
          <Tab
            key={slug}
            title={
              <span
                className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors duration-300 sm:flex-row sm:gap-2.5 sm:text-sm ${
                  isActive ? 'text-white' : 'text-default-600 group-hover:text-primary'
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                    isActive ? 'bg-white/20' : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                  }`}
                >
                  <CategoryIcon size={17} />
                </span>
                <span className='sm:hidden'>{shortLabel}</span>
                <span className='hidden sm:inline'>{label}</span>
              </span>
            }
          >
            {/* Full-bleed (cancels the page's side padding): the slider sizes its cards in viewport units and pins itself to the screen while it scrolls. */}
            <div className='-mx-4'>
              <PlacesRotateSlider places={places} />
            </div>

            <div className='mt-10 flex justify-center'>
              <Button
                as={Link}
                href='/alojamiento?city=Santa+Marta'
                color='primary'
                radius='full'
                size='lg'
                className='group px-8 font-semibold text-white shadow-lg'
              >
                <DotArrowLabel>Ver todas las propiedades en Santa Marta</DotArrowLabel>
              </Button>
            </div>
          </Tab>
        );
      })}
    </Tabs>
    </div>
  );
};

export default LugaresTuristicosTabs;
