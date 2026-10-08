'use client';

import { useEffect, useState, type ComponentType } from 'react';
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
  icon: ComponentType<{ size?: number; className?: string }>;
  places: Place[];
}

const CATEGORIES: CategorySection[] = [
  {
    slug: 'playas',
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

  useEffect(() => {
    setSelected(getSlugFromHash());

    const onHashChange = () => setSelected(getSlugFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <Tabs
      aria-label='Categorías de lugares turísticos'
      selectedKey={selected}
      onSelectionChange={(key) => {
        const slug = String(key);
        setSelected(slug);
        window.history.replaceState(null, '', `#${slug}`);
      }}
      color='primary'
      variant='solid'
      classNames={{
        base: 'w-full justify-center',
        // A floating pill. Five categories don't fit across a phone, so there it scrolls sideways instead of wrapping into uneven rows.
        tabList:
          'h-auto w-full max-w-full flex-nowrap gap-1.5 overflow-x-auto rounded-full border border-default-200 bg-content1 p-2 shadow-lg [scrollbar-width:none] sm:w-fit dark:border-default-100/20',
        tab: 'group h-auto w-auto flex-none rounded-full px-4 py-2.5 data-[hover-unselected=true]:opacity-100 sm:px-5',
        cursor: 'rounded-full bg-primary shadow-md',
        panel: 'pt-6',
      }}
    >
      {CATEGORIES.map(({ slug, label, icon: CategoryIcon, places }) => {
        const isActive = selected === slug;

        return (
          <Tab
            key={slug}
            title={
              <span
                className={`flex items-center gap-2.5 text-sm font-semibold transition-colors duration-300 ${
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
                {label}
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
  );
};

export default LugaresTuristicosTabs;
