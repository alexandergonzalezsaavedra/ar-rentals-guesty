import type { Metadata } from 'next';
import Image from 'next/image';
import {
  IconBrush,
  IconCalendarCheck,
  IconCamera,
  IconChartLine,
  IconChecklist,
  IconClipboardList,
  IconCpu,
  IconFileInvoice,
  IconHeadset,
  IconHistory,
  IconKey,
  IconMessageCircle,
  IconPackage,
  IconPhone,
  IconReceipt2,
  IconReportAnalytics,
  IconRosetteDiscountCheck,
  IconShieldCheck,
  IconShieldHeart,
  IconSparkles,
  IconSpeakerphone,
  IconTagStarred,
  IconTrendingUp,
  IconUserStar,
  IconWashMachine,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import ScrollLine from '@/components/effects/ScrollLine';
import { spaceGrotesk } from '@/lib/fonts';
import { pageMetadata } from '@/lib/seo';
import { SHOW_CONTACT_CTA } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Servicios para propietarios',
  description:
    'Administración integral de propiedades para cortas estadías: precios dinámicos, marketing, fotografía profesional, limpieza, check-in, atención al huésped y publicación en Airbnb y Booking.',
  path: '/servicios',
});

const PHONE_HREF = 'tel:+573143593612';
const PHONE_LABEL = '+57 314 359 3612';

/** Everything included in the administration, in the order of the current site. */
const INCLUDED: { icon: Icon; label: string }[] = [
  { icon: IconCpu, label: 'Herramientas tecnológicas como Dynamic Pricing y PMS (Property Management System).' },
  { icon: IconSpeakerphone, label: 'Gestión de publicidad y marketing.' },
  { icon: IconCamera, label: 'Fotografías profesionales.' },
  { icon: IconWashMachine, label: 'Lavandería de ropa de cama y toallas.' },
  { icon: IconSparkles, label: 'Suministro de insumos de aseo para la limpieza del apartamento.' },
  { icon: IconPackage, label: 'Suministro de amenities.' },
  { icon: IconFileInvoice, label: 'Facturación electrónica.' },
  { icon: IconShieldHeart, label: 'Seguro de asistencia para huéspedes.' },
  { icon: IconWorld, label: 'Gestión de plataformas comerciales y reservas.' },
  { icon: IconRosetteDiscountCheck, label: 'Amenities incluidas en cada reserva.' },
  { icon: IconSparkles, label: 'Servicio de limpieza del inmueble después de cada reserva.' },
  { icon: IconKey, label: 'Gestión de check-in y check-out.' },
  { icon: IconMessageCircle, label: 'Servicio de conserjería y atención al huésped.' },
  { icon: IconClipboardList, label: 'Realización de inventarios de entrada y salida.' },
  { icon: IconChartLine, label: 'Proyección de ingresos de la propiedad.' },
  {
    icon: IconChecklist,
    label:
      'Reporte de TRA (Tarjeta de Registro de Alojamiento) y SIRE (Sistema de Información para el Registro de Extranjeros).',
  },
  { icon: IconReceipt2, label: 'Trámite de pagos de servicios públicos y gastos del apartamento.' },
];

const REASONS: { icon: Icon; label: string }[] = [
  { icon: IconPackage, label: 'Paquete integral de servicios' },
  { icon: IconSpeakerphone, label: 'Estrategias de marketing' },
  { icon: IconCpu, label: 'Tecnología de vanguardia' },
  { icon: IconHeadset, label: 'Atención al cliente' },
  { icon: IconHistory, label: 'Trayectoria en el mercado' },
  { icon: IconReportAnalytics, label: 'Reportes de gestión de la propiedad' },
  { icon: IconTrendingUp, label: 'Sistema de precios dinámicos' },
  { icon: IconShieldCheck, label: 'Seguridad y transparencia' },
  { icon: IconTagStarred, label: 'Asesoría y comercialización' },
];

const EXTRAS: { title: string; description: string; image: string; icon: Icon }[] = [
  {
    title: 'Servicio de lavandería profesional',
    description: 'Tu alojamiento limpio y seguro, garantizando que tus huéspedes se sientan como en casa.',
    image: '/servicios/vaiven-lavanderia-profesional.jpg',
    icon: IconWashMachine,
  },
  {
    title: 'Cerraduras de seguridad inteligentes',
    description: 'Aseguramos el acceso de tus huéspedes, brindando tranquilidad y control total.',
    image: '/servicios/vaiven-cerraduras-inteligentes.jpg',
    icon: IconKey,
  },
  {
    title: 'Ahorradores de energía',
    description: 'Cuidamos el medio ambiente, reduciendo costos y creando un entorno más sostenible.',
    image: '/servicios/vaiven-ahorradores-de-energia.jpg',
    icon: IconSparkles,
  },
  {
    title: 'Pautas publicitarias adicionales',
    description: 'Más ocupación y fidelización de tus huéspedes con estrategias de marketing.',
    image: '/servicios/vaiven-pautas-publicitarias.jpg',
    icon: IconSpeakerphone,
  },
  {
    title: 'Asesoría en diseño de interiores',
    description: 'Convierte tu propiedad en un refugio de estilo y confort.',
    image: '/servicios/vaiven-diseno-de-interiores.jpg',
    icon: IconBrush,
  },
  {
    title: 'Paquete de lencería hotelera',
    description: 'Mejora la experiencia de tus huéspedes con detalles que aseguran hospitalidad.',
    image: '/servicios/vaiven-lenceria-hotelera.jpg',
    icon: IconPackage,
  },
  {
    title: 'Gestión de cuenta exclusiva',
    description: 'Atención exclusiva para tu propiedad, que asegura experiencias memorables.',
    image: '/servicios/vaiven-gestion-de-cuenta-exclusiva.jpg',
    icon: IconUserStar,
  },
  {
    title: 'Ejecutivo de cuenta exclusivo',
    description: 'Un ejecutivo exclusivo, atendiendo ágilmente las necesidades de tus huéspedes.',
    image: '/servicios/vaiven-ejecutivo-de-cuenta.jpg',
    icon: IconCalendarCheck,
  },
  {
    title: 'Adicionales de limpieza y mantenimiento',
    description: 'Ofrecemos limpieza y mantenimiento desde áreas comunes hasta jardinería.',
    image: '/servicios/vaiven-limpieza-y-mantenimiento.jpg',
    icon: IconSparkles,
  },
];

const PLATFORMS = [
  { name: 'Airbnb', logo: '/servicios/logo-airbnb.png', width: 169, height: 54 },
  { name: 'Booking.com', logo: '/servicios/logo-booking.png', width: 966, height: 160 },
];

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className='font-mono text-xs tracking-[0.18em] text-arena-tostada uppercase dark:text-arena'>{children}</p>
);

export default function ServiciosPage() {
  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>

      <main>
        <PageBreadcrumbs items={[{ label: 'Servicios', icon: <IconChecklist size={12} /> }]} />

        {/* `isolate` gives the scroll line a layer of its own to sit behind the content. */}
        <div className='relative isolate w-full px-4 py-10 sm:py-16'>
          <ScrollLine />

          {/* Intro */}
          <section className='container mx-auto text-center'>
            <span className='inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase'>
              <IconChecklist size={14} />
              Para propietarios
            </span>
            <h1 className={`${spaceGrotesk.className} mt-3 text-4xl font-bold text-foreground sm:text-6xl`}>
              Nuestros servicios
            </h1>
            <p className='mx-auto mt-4 max-w-2xl text-lg text-balance text-default-600 sm:text-xl'>
              Si eres propietario, nos encargamos de todo lo que necesita tu inmueble para recibir huéspedes y generar
              ingresos.
            </p>
          </section>

          {/* Included */}
          <section className='container mx-auto mt-14 lg:mt-20'>
            <div className='rounded-3xl border border-default-200 bg-content1 p-6 shadow-sm sm:p-10 dark:border-default-100/20'>
              <div className='text-center'>
                <Eyebrow>Administración integral</Eyebrow>
                <h2
                  className={`${spaceGrotesk.className} mt-2 text-3xl font-bold text-balance text-foreground sm:text-4xl`}
                >
                  Nuestros servicios incluyen
                </h2>
              </div>
              <ul className='mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3'>
                {INCLUDED.map(({ icon: ItemIcon, label }) => (
                  <li
                    key={label}
                    className='flex items-start gap-3'
                  >
                    <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                      <ItemIcon size={18} />
                    </span>
                    <span className='pt-1.5 text-sm text-default-700 sm:text-base'>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Why us */}
          <section className='container mx-auto mt-16 lg:mt-24'>
            <div className='rounded-3xl bg-sierra px-6 py-12 text-white sm:px-10'>
              <div className='text-center'>
                <p className='font-mono text-xs tracking-[0.18em] text-arena uppercase'>¿Por qué elegir a Vaivén?</p>
                <h2 className={`${spaceGrotesk.className} mt-2 text-3xl font-bold text-balance sm:text-4xl`}>
                  Detalles que hacen la diferencia
                </h2>
              </div>
              <ul className='mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3'>
                {REASONS.map(({ icon: ReasonIcon, label }) => (
                  <li
                    key={label}
                    className='flex flex-col items-center gap-3 rounded-2xl bg-white/5 px-4 py-6 text-center ring-1 ring-white/10 sm:flex-row sm:text-left'
                  >
                    <span className='flex size-11 shrink-0 items-center justify-center rounded-full bg-arena text-sierra'>
                      <ReasonIcon size={22} />
                    </span>
                    <span className='text-sm font-semibold sm:text-base'>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Optional extras */}
          <section className='container mx-auto mt-16 lg:mt-24'>
            <div className='text-center'>
              <Eyebrow>Opcionales</Eyebrow>
              <h2
                className={`${spaceGrotesk.className} mt-2 text-3xl font-bold text-balance text-foreground sm:text-5xl`}
              >
                Servicios extra
              </h2>
            </div>

            <ul className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {EXTRAS.map(({ title, description, image, icon: ExtraIcon }) => (
                <li
                  key={title}
                  className='group overflow-hidden rounded-3xl border border-default-200 bg-content1 shadow-sm transition-[translate,box-shadow] duration-500 ease-brand hover:-translate-y-1 hover:shadow-xl dark:border-default-100/20'
                >
                  <div className='relative aspect-3/2 overflow-hidden bg-content2'>
                    <Image
                      src={image}
                      alt={title}
                      fill
                      sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                      className='object-cover transition-transform duration-700 ease-brand group-hover:scale-105'
                    />
                    <span className='absolute top-4 left-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-sierra shadow-md'>
                      <ExtraIcon size={20} />
                    </span>
                  </div>
                  <div className='p-5'>
                    <h3 className={`${spaceGrotesk.className} text-lg leading-snug font-bold text-foreground`}>
                      {title}
                    </h3>
                    <p className='mt-1.5 text-sm text-default-600'>{description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className='mt-6 text-center text-sm text-default-500'>
              *Ten en cuenta que algunos de estos servicios pueden tener costos adicionales.
            </p>
          </section>

          {/* Platforms */}
          <section className='container mx-auto mt-16 lg:mt-24'>
            <div className='flex flex-col items-center gap-8 rounded-3xl border border-default-200 bg-content1 px-6 py-10 text-center shadow-sm sm:px-10 dark:border-default-100/20'>
              <div>
                <Eyebrow>Más visibilidad</Eyebrow>
                <h2
                  className={`${spaceGrotesk.className} mt-2 text-3xl font-bold text-balance text-foreground sm:text-4xl`}
                >
                  Tu propiedad visible en múltiples plataformas
                </h2>
              </div>
              {/* White plates keep the brand logos legible in the dark theme too. */}
              <ul className='flex flex-wrap items-center justify-center gap-4'>
                {PLATFORMS.map(({ name, logo, width, height }) => (
                  <li
                    key={name}
                    className='flex h-20 w-48 items-center justify-center rounded-2xl bg-white px-6 shadow-sm ring-1 ring-default-200'
                  >
                    <Image
                      src={logo}
                      alt={name}
                      width={width}
                      height={height}
                      className='h-auto max-h-9 w-auto max-w-full'
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {SHOW_CONTACT_CTA && (
            <>
              {/* Contact */}
              <section className='container mx-auto mt-16 lg:mt-24'>
                <div className='flex flex-col items-center gap-6 rounded-3xl bg-noche px-6 py-12 text-center text-white sm:px-12'>
                  <p className='font-mono text-xs tracking-[0.18em] text-arena uppercase'>¿Eres propietario?</p>
                  <h2 className={`${spaceGrotesk.className} max-w-2xl text-3xl font-bold text-balance sm:text-4xl`}>
                    Habla con nuestro equipo de expertos y comienza a obtener rentabilidad hoy
                  </h2>
                  <a
                    href={PHONE_HREF}
                    className='inline-flex items-center gap-2 rounded-full bg-arena px-6 py-3 font-semibold text-sierra transition-colors hover:bg-white'
                  >
                    <IconPhone size={18} />
                    {PHONE_LABEL}
                  </a>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
