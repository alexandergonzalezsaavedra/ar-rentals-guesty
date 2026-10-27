import type { Metadata } from 'next';
import Image from 'next/image';
import {
  IconAward,
  IconBuildingCommunity,
  IconCalendarStar,
  IconHeadset,
  IconPhone,
  IconTarget,
  IconTelescope,
  IconUsersGroup,
} from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import ScrollLine from '@/components/effects/ScrollLine';
import { spaceGrotesk } from '@/lib/fonts';
import { pageMetadata } from '@/lib/seo';
import { SHOW_CONTACT_CTA } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Nosotros',
  description:
    'Vaivén es la marca de cortas estadías de AR Soluciones Inmobiliarias: más de 12 años administrando propiedades, con atención personalizada antes, durante y después de cada estancia.',
  path: '/nosotros',
});

const PHONE_HREF = 'tel:+573143593612';
const PHONE_LABEL = '+57 314 359 3612';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  /** Photo in /public/equipo; members without one show their initials. */
  photo?: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Luis Javier Reyes',
    role: 'Gerente General',
    bio: 'Administrador de Empresas, especialista en Gerencia Estratégica, con experiencia en comercialización y relaciones internacionales, liderando equipos enfocados en crecimiento, diversificación y optimización de recursos para maximizar utilidades.',
    photo: '/equipo/vaiven-cortas-estadias-Luis-Javier-Reyes.jpg',
  },
  {
    name: 'Angela Estupiñán',
    role: 'Directora Comercial',
    bio: 'Ingeniera Comercial, responsable de la oferta de inmuebles, liderando el equipo comercial y las estrategias de mercadeo con el objetivo de cumplir las metas trazadas.',
    photo: '/equipo/vaiven-cortas-estadias-Angela-Estupinan.jpg',
  },
  {
    name: 'Nathalia Acero',
    role: 'Directora de Servicio al Cliente',
    bio: 'Administradora de Empresas, especialista en Gestión de Proyectos, liderando el equipo de servicio al cliente en la administración de inmuebles, enfocada en mejorar la experiencia del cliente mediante mejoras y automatización de servicios.',
    photo: '/equipo/vaiven-cortas-estadias-Nathalia-Acero.jpg',
  },
  {
    name: 'Milieth Marriaga',
    role: 'Auxiliar Administrativa',
    bio: 'Gestiona procesos administrativos clave, incluyendo la administración de contratos, facturación, coordinación con proveedores, realización de giros de renta y apoyo en la operación interna.',
    photo: '/equipo/vaiven-cortas-estadias-Milieth-Marriaga.jpg',
  },
  {
    name: 'Ana Márquez',
    role: 'Auxiliar Comercial',
    bio: 'Encargada de trámites comerciales para el proceso de captación y de apoyo a la gestión comercial.',
    photo: '/equipo/vaiven-cortas-estadias-Ana-Marquez.jpg',
  },
  {
    name: 'Netzer Polo',
    role: 'Todero',
    bio: 'Encargado de realizar los inventarios con el objetivo de identificar necesidades de mantenimiento preventivo y correctivo, contribuyendo a la protección y conservación de las propiedades.',
    photo: '/equipo/vaiven-cortas-estadias-Netzer-Polo-todero.jpg',
  },
];

const HIGHLIGHTS = [
  { icon: IconCalendarStar, value: '+12 años', label: 'en el mercado de rentas tradicionales' },
  { icon: IconAward, value: 'Súper Host', label: 'estatus de anfitrión destacado' },
  { icon: IconHeadset, value: 'Antes, durante y después', label: 'atención personalizada en cada estancia' },
];

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

const SectionHeading = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div className='text-center'>
    <p className='font-mono text-xs tracking-[0.18em] text-arena-tostada uppercase dark:text-arena'>{eyebrow}</p>
    <h2 className={`${spaceGrotesk.className} mt-2 text-3xl font-bold text-balance text-foreground sm:text-5xl`}>
      {title}
    </h2>
  </div>
);

export default function NosotrosPage() {
  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>

      <main>
        <PageBreadcrumbs items={[{ label: 'Nosotros', icon: <IconUsersGroup size={12} /> }]} />

        {/* `isolate` gives the scroll line a layer of its own to sit behind the content. */}
        <div className='relative isolate w-full px-4 py-10 sm:py-16'>
          <ScrollLine />

          {/* Who we are */}
          <section className='container mx-auto text-center'>
            <span className='inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase'>
              <IconBuildingCommunity size={14} />
              Nosotros
            </span>
            <h1 className={`${spaceGrotesk.className} mt-3 text-4xl font-bold text-foreground sm:text-6xl`}>
              ¿Quiénes somos?
            </h1>
            <p className='mx-auto mt-4 max-w-3xl text-lg text-balance text-default-600 sm:text-xl'>
              <strong className='font-semibold text-foreground'>Vaivén – Cortas Estadías</strong> es la marca de AR
              Soluciones Inmobiliarias que abarca la línea de administración de propiedades para cortas estadías.
            </p>
          </section>

          {/* Experience */}
          <section className='container mx-auto mt-16 grid items-center gap-10 lg:mt-24 lg:grid-cols-2'>
            <div>
              <p className='font-mono text-xs tracking-[0.18em] text-arena-tostada uppercase dark:text-arena'>
                Experiencia
              </p>
              <h2
                className={`${spaceGrotesk.className} mt-2 text-3xl font-bold text-balance text-foreground sm:text-5xl`}
              >
                Calidad en cada etapa de la reserva
              </h2>
              <p className='mt-5 text-default-600 lg:text-lg lg:leading-relaxed'>
                Nos comprometemos a brindar un servicio de alta calidad en cada etapa del proceso de reserva, asegurando
                atención personalizada antes, durante y después de la estancia. Con más de 12 años de experiencia en el
                mercado de rentas tradicionales y un sólido conocimiento en el sector de la hospitalidad, garantizamos
                una gestión eficiente y una experiencia excepcional para nuestros clientes y huéspedes.
              </p>
            </div>

            <ul className='grid gap-4'>
              {HIGHLIGHTS.map(({ icon: Icon, value, label }) => (
                <li
                  key={value}
                  className='flex items-center gap-4 rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm dark:border-default-100/20'
                >
                  <span className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <Icon size={28} />
                  </span>
                  <div>
                    <p className={`${spaceGrotesk.className} text-2xl leading-tight font-bold text-foreground`}>
                      {value}
                    </p>
                    <p className='text-sm text-default-500'>{label}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Mission and vision */}
          <section className='container mx-auto mt-16 grid gap-6 lg:mt-24 lg:grid-cols-2'>
            <article className='rounded-3xl bg-sierra p-8 text-white sm:p-10'>
              <span className='flex size-12 items-center justify-center rounded-xl bg-white/10 text-arena'>
                <IconTarget size={26} />
              </span>
              <h2 className={`${spaceGrotesk.className} mt-5 text-3xl font-bold`}>Misión</h2>
              <p className='mt-3 text-white/80 lg:text-lg lg:leading-relaxed'>
                Prestamos un servicio integral de calidad profesional al propietario o huésped en la administración y
                comercialización del inmueble.
              </p>
            </article>
            <article className='rounded-3xl bg-arena p-8 text-sierra sm:p-10'>
              <span className='flex size-12 items-center justify-center rounded-xl bg-sierra/10 text-arena-tostada'>
                <IconTelescope size={26} />
              </span>
              <h2 className={`${spaceGrotesk.className} mt-5 text-3xl font-bold`}>Visión</h2>
              <p className='mt-3 text-sierra/80 lg:text-lg lg:leading-relaxed'>
                Ser líderes en la administración y comercialización de propiedades de cortas estadías en el año 2028,
                ofreciendo experiencias sorprendentes a nuestros propietarios y huéspedes. Nuestra meta es generar una
                alta rentabilidad a través de la prestación de un servicio excepcional, con tecnología de punta y
                óptimos estándares de calidad.
              </p>
            </article>
          </section>

          {/* Team */}
          <section className='container mx-auto mt-16 lg:mt-24'>
            <SectionHeading
              eyebrow='Nuestro equipo'
              title='Las personas detrás de cada estadía'
            />

            {/* Narrower than the page container, so on desktop the portraits stay card-sized instead of filling the screen. */}
            <ul className='mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {TEAM.map((member, index) => (
                <li
                  key={member.name}
                  // With three columns, a lone card on the last row moves to the middle one instead of sitting at the left.
                  className={`group flex flex-col overflow-hidden rounded-3xl border border-default-200 bg-content1 shadow-sm transition-[translate,box-shadow] duration-500 ease-brand hover:-translate-y-1 hover:shadow-xl dark:border-default-100/20 ${
                    index === TEAM.length - 1 && TEAM.length % 3 === 1 ? 'lg:col-start-2' : ''
                  }`}
                >
                  <div className='relative aspect-square overflow-hidden bg-arena'>
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={`${member.name}, ${member.role} de Vaivén`}
                        fill
                        sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                        className='object-cover transition-transform duration-700 ease-brand group-hover:scale-105'
                      />
                    ) : (
                      <span
                        className={`${spaceGrotesk.className} flex size-full items-center justify-center text-7xl font-bold text-arena-tostada`}
                        aria-hidden='true'
                      >
                        {initials(member.name)}
                      </span>
                    )}
                    <div className='absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent p-5 pt-16 text-white'>
                      <h3 className={`${spaceGrotesk.className} text-xl leading-tight font-bold`}>{member.name}</h3>
                      <p className='mt-0.5 font-mono text-[11px] tracking-[0.14em] text-arena uppercase'>
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <p className='p-5 text-sm leading-relaxed text-default-600'>{member.bio}</p>
                </li>
              ))}
            </ul>
          </section>

          {SHOW_CONTACT_CTA && (
            <>
              {/* Owners */}
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
