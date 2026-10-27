import type { Metadata } from 'next';
import Link from 'next/link';
import {
  IconAlertTriangle,
  IconBuildingCommunity,
  IconCalendarCheck,
  IconClock,
  IconCookie,
  IconCreditCard,
  IconFileCertificate,
  IconId,
  IconPhoto,
  IconPool,
  IconReceipt2,
  IconRefresh,
  IconScale,
  IconShieldLock,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';
import Menu from '@/components/menu/Menu';
import PageBreadcrumbs from '@/components/breadcrumbs/PageBreadcrumbs';
import ScrollLine from '@/components/effects/ScrollLine';
import LegalAccordion, { type LegalItem } from '@/components/legal/LegalAccordion';
import CookieSettingsButton from '@/components/consent/CookieSettingsButton';
import { CONSENT_COPY } from '@/components/consent/cookieSettings';
import { CONSENT_CATEGORIES, REQUIRED_CATEGORIES } from '@/lib/storage';
import { spaceGrotesk } from '@/lib/fonts';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Términos y condiciones',
  description:
    'Nota legal de Vaivén: condiciones de reserva y estadía, pagos, propiedad horizontal, política de cookies y tratamiento de datos personales (Ley 1581 de 2012).',
  path: '/terminos-y-condiciones',
});

const COMPANY = 'AR SOLUCIONES INMOBILIARIAS S.A.S.';
const DATA_EMAIL = 'protecciondedatosari@arinmobiliaria.com.co';
const DATA_ADDRESS = 'Calle 113 No. 7 – 80, Piso 18, Torre AR, Bogotá D.C.';
const UPDATED_AT = 'octubre de 2026';

// Structure taken from the AR Construcciones legal note, rewritten for short
// stays: clauses about selling new homes (built areas, social-interest
// housing, construction stages, licenses, parking per project) don't apply
// here and were left out. Pending legal review.
const STAY_TERMS: LegalItem[] = [
  {
    title: 'Reservas y disponibilidad',
    icon: <IconCalendarCheck size={18} />,
    body: `La disponibilidad y los precios que se muestran en el sitio se consultan en tiempo real en el sistema de administración de las propiedades y pueden cambiar hasta el momento en que se confirma la reserva.

Una reserva queda confirmada únicamente cuando el pago ha sido aprobado. Mientras tanto, las fechas pueden quedar retenidas por un tiempo limitado y, si el pago no se completa, la reserva puede ser liberada.`,
  },
  {
    title: 'Tarifas y costos adicionales',
    icon: <IconReceipt2 size={18} />,
    body: `El precio de la estadía depende de las fechas, la cantidad de noches y de huéspedes, y de la disponibilidad de la propiedad. Antes de pagar se muestra el desglose: valor del alojamiento, descuentos aplicables, tarifa de limpieza e impuestos cuando corresponda.

Los servicios opcionales (por ejemplo, lavandería, limpiezas adicionales o traslados) no están incluidos en la tarifa y se informarán y cobrarán por separado.`,
  },
  {
    title: 'Pagos',
    icon: <IconCreditCard size={18} />,
    body: `Los pagos en línea se procesan a través de Wompi, pasarela de pagos de Bancolombia, con tarjetas, PSE, Nequi y otros medios disponibles. Los datos de tu tarjeta o cuenta se ingresan directamente en Wompi; ${COMPANY} no los recibe ni los almacena.

La aprobación de los pagos depende de la entidad financiera del cliente. Un pago rechazado no genera ningún cobro y puede intentarse de nuevo con otro medio de pago.`,
  },
  {
    title: 'Cambios y cancelaciones',
    icon: <IconRefresh size={18} />,
    body: `Las condiciones de cambio, cancelación y reembolso son las informadas para cada propiedad al momento de reservar. Para solicitar un cambio o una cancelación, comunícate con nuestro equipo indicando tu código de reserva.`,
  },
  {
    title: 'Capacidad y huéspedes',
    icon: <IconUsers size={18} />,
    body: `Cada propiedad tiene una capacidad máxima de huéspedes que no puede superarse. Se consideran adultos las personas de 13 años o más, y niños las de 2 a 12 años.

El titular de la reserva es responsable del comportamiento de sus acompañantes y de los daños que se causen a la propiedad durante la estadía.`,
  },
  {
    title: 'Registro de huéspedes (TRA y SIRE)',
    icon: <IconId size={18} />,
    body: `De acuerdo con la normatividad colombiana, todos los huéspedes deben registrarse en la Tarjeta de Registro de Alojamiento (TRA) y los extranjeros, además, en el Sistema de Información para el Registro de Extranjeros (SIRE) de Migración Colombia.

Para ello se solicitarán los datos y documentos de identidad de cada huésped antes o al momento del ingreso.`,
  },
  {
    title: 'Check-in y check-out',
    icon: <IconClock size={18} />,
    body: `Los horarios de ingreso y salida de cada propiedad se informan en su ficha y en la confirmación de la reserva. Los ingresos anticipados o salidas tardías están sujetos a disponibilidad y pueden tener un costo adicional.`,
  },
  {
    title: 'Régimen de propiedad horizontal',
    icon: <IconBuildingCommunity size={18} />,
    body: `Las propiedades ubicadas en edificios y conjuntos están sometidas al régimen de propiedad horizontal conforme a lo dispuesto en la Ley 675 de 2001.

Los huéspedes deben cumplir el reglamento de propiedad horizontal y las normas de convivencia de cada edificio, incluidas las disposiciones sobre ruido, mascotas, visitantes y uso de parqueaderos.`,
  },
  {
    title: 'Áreas comunes',
    icon: <IconPool size={18} />,
    body: `El uso de las áreas comunes (piscinas, gimnasios, terrazas, playas privadas y demás) está regulado por el reglamento de propiedad horizontal y la administración de cada edificio, que pueden fijar horarios, cupos y restricciones, o cerrarlas por mantenimiento sin previo aviso.

Su disponibilidad no depende de Vaivén y su cierre temporal no da lugar a descuentos ni reembolsos.`,
  },
  {
    title: 'Imágenes y descripciones',
    icon: <IconPhoto size={18} />,
    body: `Las fotografías, videos y descripciones de las propiedades son ilustrativos. Pueden presentar variaciones en decoración, dotación o vista respecto de la realidad, sin que esto comprometa ni obligue a ${COMPANY}.

Las comodidades, la dotación y las características de las propiedades pueden modificarse por circunstancias técnicas, comerciales o ajenas a nuestra voluntad.`,
  },
];

export default function TerminosCondicionesPage() {
  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>

      <main>
        <PageBreadcrumbs items={[{ label: 'Términos y condiciones', icon: <IconScale size={12} /> }]} />

        <div className='relative isolate w-full px-4 py-10 sm:py-16'>
          <ScrollLine />

          {/* Intro */}
          <section className='container mx-auto text-center'>
            <span className='inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 font-mono text-xs font-semibold tracking-[0.14em] text-primary uppercase'>
              <IconScale size={14} />
              Nota legal
            </span>
            <h1 className={`${spaceGrotesk.className} mt-3 text-4xl font-bold text-foreground sm:text-6xl`}>
              Términos y condiciones
            </h1>
            <p className='mx-auto mt-4 max-w-2xl text-lg text-balance text-default-600'>
              Información legal sobre el uso del sitio, las reservas de estadías cortas, las cookies y el tratamiento de
              tus datos personales.
            </p>
            <p className='mt-2 text-sm text-default-400'>Última actualización: {UPDATED_AT}</p>
          </section>

          {/* Legal note */}
          <section className='container mx-auto mt-14 max-w-4xl'>
            <div className='mb-6 flex items-center gap-3'>
              <span className='flex size-12 items-center justify-center rounded-full bg-warning/10 text-warning'>
                <IconAlertTriangle size={22} />
              </span>
              <div>
                <h2 className={`${spaceGrotesk.className} text-2xl font-bold text-foreground sm:text-3xl`}>
                  Condiciones de reserva y estadía
                </h2>
                <p className='text-sm text-default-500'>
                  Aplican a todas las reservas realizadas a través de este sitio, operado por {COMPANY}.
                </p>
              </div>
            </div>
            <LegalAccordion items={STAY_TERMS} />
            <p className='mt-6 text-center text-sm text-default-500'>Publicidad aplicable en la República de Colombia.</p>
          </section>

          {/* Cookies */}
          <section
            id='cookies'
            className='container mx-auto mt-16 max-w-4xl scroll-mt-28'
          >
            <div className='mb-6 flex items-center gap-3'>
              <span className='flex size-12 items-center justify-center rounded-full bg-arena text-arena-tostada dark:bg-arena-tostada/30 dark:text-arena'>
                <IconCookie size={22} />
              </span>
              <div>
                <h2 className={`${spaceGrotesk.className} text-2xl font-bold text-foreground sm:text-3xl`}>
                  Política de cookies
                </h2>
                <p className='text-sm text-default-500'>
                  Qué guardamos en tu navegador y para qué. Tú decides qué categorías aceptas.
                </p>
              </div>
            </div>

            <ul className='grid gap-3 sm:grid-cols-2'>
              {CONSENT_CATEGORIES.map((category) => (
                <li
                  key={category}
                  className='rounded-2xl border border-default-200 bg-content1 p-4 dark:border-default-100/20'
                >
                  <p className='flex items-center justify-between gap-2 font-semibold text-foreground'>
                    {CONSENT_COPY[category].title}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                        REQUIRED_CATEGORIES.includes(category)
                          ? 'bg-sierra text-white dark:bg-secondary'
                          : 'bg-content2 text-default-500'
                      }`}
                    >
                      {REQUIRED_CATEGORIES.includes(category) ? 'Siempre activas' : 'Opcional'}
                    </span>
                  </p>
                  <p className='mt-1.5 text-sm text-default-600'>{CONSENT_COPY[category].description}</p>
                </li>
              ))}
            </ul>

            <p className='mt-5 text-sm text-default-600'>
              Esta información se guarda en el almacenamiento local de tu navegador. Puedes cambiar tus preferencias en
              cualquier momento, y consultar o eliminar lo que tenemos guardado en{' '}
              <Link
                href='/mis-datos'
                className='font-medium text-primary underline underline-offset-2'
              >
                Mis datos
              </Link>
              .
            </p>
            <CookieSettingsButton className='mt-4 inline-flex items-center gap-2 rounded-full bg-sierra px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-arena dark:text-sierra'>
              <IconCookie size={16} />
              Configurar cookies
            </CookieSettingsButton>
          </section>

          {/* Personal data */}
          <section
            id='datos-personales'
            className='container mx-auto mt-16 max-w-4xl scroll-mt-28'
          >
            <div className='mb-6 flex items-center gap-3'>
              <span className='flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <IconShieldLock size={22} />
              </span>
              <div>
                <h2 className={`${spaceGrotesk.className} text-2xl font-bold text-foreground sm:text-3xl`}>
                  Tratamiento de datos personales
                </h2>
                <p className='text-sm text-default-500'>Ley Estatutaria 1581 de 2012 y normas concordantes</p>
              </div>
            </div>

            <div className='grid gap-4 lg:grid-cols-2'>
              <article className='rounded-2xl border border-default-200 bg-content1 p-5 dark:border-default-100/20'>
                <h3 className='flex items-center gap-2 font-semibold text-foreground'>
                  <IconFileCertificate
                    size={18}
                    className='text-primary'
                  />
                  Autorización
                </h3>
                <p className='mt-3 text-sm leading-relaxed text-default-600'>
                  En cumplimiento de la Ley Estatutaria 1581 de 2012 de Protección de Datos y normas concordantes,
                  autorizo como Titular de los datos personales para que éstos sean incorporados en una base de datos
                  responsabilidad de {COMPANY} para su tratamiento, el cual podrá incluir la recolección,
                  almacenamiento, uso, circulación y destinación con la finalidad de realizar gestión administrativa,
                  verificación de datos, gestión de estadísticas internas, encuestas de opinión, marketing, prospección
                  comercial, publicidad propia, contacto y envío de comunicaciones a través de los medios registrados
                  (correo electrónico, número de celular, teléfono fijo, dirección física y sistemas de mensajería
                  instantánea) y segmentación de mercados. De igual manera, autorizo la transmisión nacional e
                  internacional de datos personales con proveedores de servicios de almacenamiento, custodia y seguridad
                  de la información y con proveedores de servicios necesarios para desarrollar las finalidades aquí
                  previstas.
                </p>
                <p className='mt-3 text-sm leading-relaxed text-default-600'>
                  Es de carácter facultativo suministrar información que verse sobre datos sensibles, entendidos como
                  aquellos que afectan la intimidad o generen algún tipo de discriminación, o sobre menores de edad.
                </p>
              </article>

              <article className='rounded-2xl border border-default-200 bg-content1 p-5 dark:border-default-100/20'>
                <h3 className='flex items-center gap-2 font-semibold text-foreground'>
                  <IconUserCircle
                    size={18}
                    className='text-primary'
                  />
                  Tus derechos
                </h3>
                <p className='mt-3 text-sm leading-relaxed text-default-600'>
                  Como titular puedes ejercer los derechos de acceso, corrección, supresión de tus datos y revocación de
                  la autorización, o presentar un reclamo por infracción sobre tus datos, mediante un escrito dirigido a{' '}
                  {COMPANY}:
                </p>
                <ul className='mt-3 flex flex-col gap-1.5 text-sm text-default-600'>
                  <li>
                    <span className='font-medium text-foreground'>Correo:</span>{' '}
                    <a
                      href={`mailto:${DATA_EMAIL}`}
                      className='break-all text-primary underline underline-offset-2'
                    >
                      {DATA_EMAIL}
                    </a>
                    , indicando en el asunto el derecho que deseas ejercer.
                  </li>
                  <li>
                    <span className='font-medium text-foreground'>Correspondencia:</span> {DATA_ADDRESS}
                  </li>
                </ul>
                <p className='mt-3 text-sm leading-relaxed text-default-600'>
                  Lo que este sitio guarda en tu navegador puedes verlo o eliminarlo tú mismo en{' '}
                  <Link
                    href='/mis-datos'
                    className='font-medium text-primary underline underline-offset-2'
                  >
                    Mis datos
                  </Link>
                  .
                </p>
              </article>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
