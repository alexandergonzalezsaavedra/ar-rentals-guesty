'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Image from 'next/image';
import { Tab, Tabs } from '@heroui/react';
import {
  IconBeach,
  IconBuildingMonument,
  IconMapPin,
  IconMoonStars,
  IconTrees,
} from '@tabler/icons-react';

interface Place {
  src: string;
  label: string;
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
      { src: '/lugares-turisticos/playas/playa-blanca.jpg', label: 'Playa Blanca' },
      { src: '/lugares-turisticos/playas/playa-cristal.jpg', label: 'Playa Cristal' },
      { src: '/lugares-turisticos/playas/playa-cinto.jpg', label: 'Playa Cinto' },
      { src: '/lugares-turisticos/playas/bahia-concha.jpg', label: 'Bahía Concha' },
      { src: '/lugares-turisticos/playas/el-rodadero.jpg', label: 'El Rodadero' },
      { src: '/lugares-turisticos/playas/taganga.jpg', label: 'Taganga' },
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
      },
      {
        src: '/lugares-turisticos/parques-naturales/sierra-nevada-de-santa-marta.jpg',
        label: 'Sierra Nevada de Santa Marta',
      },
      { src: '/lugares-turisticos/parques-naturales/minca.jpg', label: 'Minca' },
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
      },
      {
        src: '/lugares-turisticos/sitios-historicos-y-culturales/quinta-de-san-pedro-alejandrino.jpg',
        label: 'Quinta de San Pedro Alejandrino',
      },
      {
        src: '/lugares-turisticos/sitios-historicos-y-culturales/centro-historico-de-santa-marta.jpg',
        label: 'Centro Histórico de Santa Marta',
      },
      {
        src: '/lugares-turisticos/sitios-historicos-y-culturales/museo-del-oro-tairona.jpg',
        label: 'Museo del Oro Tairona',
      },
      {
        src: '/lugares-turisticos/sitios-historicos-y-culturales/pueblo-indígena-chairama.jpg',
        label: 'Pueblo Indígena Chairama',
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
      },
      { src: '/lugares-turisticos/sitios-de-interes/cerro-ziruma.jpg', label: 'Cerro Ziruma' },
      {
        src: '/lugares-turisticos/sitios-de-interes/cascadas-de-marinka-minca.jpg',
        label: 'Cascadas de Marinka, Minca',
      },
      {
        src: '/lugares-turisticos/sitios-de-interes/acuario-y-museo-del-mar-del-rodadero.jpg',
        label: 'Acuario y Museo del Mar del Rodadero',
      },
    ],
  },
  {
    slug: 'vida-nocturna',
    label: 'Vida Nocturna',
    icon: IconMoonStars,
    places: [
      { src: '/lugares-turisticos/vida-nocturna/la-puerta.jpg', label: 'La Puerta' },
      { src: '/lugares-turisticos/vida-nocturna/donde-chucho.jpeg', label: 'Donde Chucho' },
      {
        src: '/lugares-turisticos/vida-nocturna/la-brisa-loca-rooftop.jpg',
        label: 'La Brisa Loca Rooftop',
      },
      {
        src: '/lugares-turisticos/vida-nocturna/el-mirador-taganga.jpg',
        label: 'El Mirador, Taganga',
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
        base: 'w-full',
        tabList:
          'h-auto w-full flex-wrap gap-2 overflow-visible bg-content2 p-1.5',
        tab: 'h-auto flex-1 basis-[46%] px-4 py-3 sm:basis-0',
        panel: 'pt-6',
      }}
    >
      {CATEGORIES.map(({ slug, label, icon: CategoryIcon, places }) => (
        <Tab
          key={slug}
          title={
            <span className='flex items-center gap-2 text-sm font-semibold'>
              <CategoryIcon size={16} />
              {label}
            </span>
          }
        >
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
            {places.map((place) => (
              <div
                key={place.src}
                className='group relative aspect-4/3 overflow-hidden rounded-xl shadow-md ring-1 ring-foreground/10'
              >
                <Image
                  src={place.src}
                  alt={place.label}
                  fill
                  sizes='(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw'
                  className='object-cover transition-transform duration-500 group-hover:scale-110'
                />
                <div className='absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3'>
                  <span className='text-sm font-semibold text-white'>
                    {place.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};

export default LugaresTuristicosTabs;
