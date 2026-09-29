import {
  IconCalendarCheck,
  IconHome2,
  IconSearch,
  IconShieldCheck,
} from '@tabler/icons-react';

const steps = [
  {
    icon: IconSearch,
    title: 'Elija su destino',
    description:
      'Filtre por ciudad, fechas y huéspedes para encontrar el alojamiento ideal.',
  },
  {
    icon: IconCalendarCheck,
    title: 'Consulte disponibilidad',
    description:
      'Vemos precio y disponibilidad en tiempo real para las fechas que elija.',
  },
  {
    icon: IconShieldCheck,
    title: 'Reserve con confianza',
    description: 'Confirmación inmediata y datos protegidos en cada reserva.',
  },
  {
    icon: IconHome2,
    title: 'Disfrute su estadía',
    description: 'Llegue a su alojamiento y viva la experiencia sin sorpresas.',
  },
];

const PropertyAdvantages = () => {
  return (
    <div className='mb-8 flex flex-col gap-6'>
      <div>
        <p className='text-sm font-medium text-default-400'>Cómo funciona</p>
        <h2 className='text-3xl font-bold text-foreground'>
          Simple, rápido y seguro
        </h2>
      </div>

      <ul className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {steps.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className='flex flex-row items-center gap-3 sm:flex-col sm:items-start'
          >
            <span className='flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/30 shadow-sm'>
              <Icon
                size={20}
                className='text-primary'
              />
            </span>
            <div>
              <p className='font-semibold text-foreground text-[20px]'>
                {title}
              </p>
              <p className='text-sm font-semibold text-default-500 text-[14px]'>
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PropertyAdvantages;
