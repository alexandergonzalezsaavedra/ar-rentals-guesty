'use client';

import { useState, type ComponentType, type ReactNode } from 'react';
import Link from 'next/link';
import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from '@heroui/react';
import {
  IconActivity,
  IconCookie,
  IconHeart,
  IconMapPin,
  IconReceipt,
  IconTrash,
  IconUserCircle,
} from '@tabler/icons-react';
import { useVaivenStorage } from '@/hooks/storage/useVaivenStorage';
import { fromStoredDate, type StoredDate } from '@/lib/dates';
import { requestVisitorLocation } from '@/lib/location';
import { clearStoredData, CONSENT_CATEGORIES, readConsent, REQUIRED_CATEGORIES } from '@/lib/storage';
import { CONSENT_COPY, openCookieSettings } from './cookieSettings';

const dateTime = (value: StoredDate) =>
  new Date(fromStoredDate(value)).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const Section = ({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className='rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm dark:border-default-100/20'>
    <div className='mb-3 flex items-center justify-between gap-3'>
      <h2 className='flex items-center gap-2 font-semibold text-foreground'>
        <span className='flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
          <Icon size={16} />
        </span>
        {title}
      </h2>
      {action}
    </div>
    <div className='text-sm text-default-600'>{children}</div>
  </section>
);

const Empty = ({ children }: { children: ReactNode }) => <p className='text-default-400'>{children}</p>;

// What this browser has stored for the visitor, section by section, with ways
// to change consent or delete it.
const MyData = () => {
  const data = useVaivenStorage();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [includePending, setIncludePending] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  if (!data) {
    return (
      <div className='flex justify-center py-16'>
        <Spinner label='Cargando tus datos…' />
      </div>
    );
  }

  const consent = readConsent();
  const location = data.ubicaciones.at(-1);
  const device = data.dispositivo.at(-1);
  const campaign = [data.utmSource, data.utmMedium, data.utmCampaign, data.utmTerm, data.utmContent].filter(Boolean);

  const handleRefreshLocation = async () => {
    setIsLocating(true);
    await requestVisitorLocation();
    setIsLocating(false);
  };

  const handleDelete = () => {
    clearStoredData({ includePending });
    setIsDeleteOpen(false);
    setIncludePending(false);
  };

  return (
    <>
      <div className='mb-6 flex flex-wrap justify-center gap-3'>
        <Button
          radius='full'
          variant='bordered'
          startContent={<IconCookie size={16} />}
          onPress={openCookieSettings}
        >
          Configurar cookies
        </Button>
        <Button
          radius='full'
          color='danger'
          variant='flat'
          startContent={<IconTrash size={16} />}
          onPress={() => setIsDeleteOpen(true)}
        >
          Eliminar mis datos
        </Button>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Section
          icon={IconCookie}
          title='Preferencias de cookies'
          action={
            <button
              type='button'
              onClick={openCookieSettings}
              className='text-xs font-semibold text-primary hover:underline'
            >
              Cambiar
            </button>
          }
        >
          {consent.decidedAt === null ? (
            <p className='mb-2 text-warning-600'>Aún no has elegido; solo están activas las necesarias.</p>
          ) : (
            <p className='mb-2 text-default-400'>Elegidas el {dateTime(consent.decidedAt)}.</p>
          )}
          <ul className='flex flex-col gap-1'>
            {CONSENT_CATEGORIES.map((category) => (
              <li
                key={category}
                className='flex items-center justify-between gap-2'
              >
                <span>{CONSENT_COPY[category].title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    consent.categories[category] ? 'bg-sierra text-white dark:bg-secondary' : 'bg-content2 text-default-500'
                  }`}
                >
                  {REQUIRED_CATEGORIES.includes(category) ? 'Siempre' : consent.categories[category] ? 'Sí' : 'No'}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          icon={IconMapPin}
          title='Ubicación'
          action={
            consent.categories.location && (
              <Button
                size='sm'
                radius='full'
                variant='light'
                isLoading={isLocating}
                onPress={handleRefreshLocation}
              >
                Actualizar
              </Button>
            )
          }
        >
          {location ? (
            <>
              <p className='text-base font-medium text-foreground'>
                {[location.ciudad, location.region, location.pais].filter(Boolean).join(', ') || 'Ciudad no identificada'}
              </p>
              <p className='mt-1 text-default-400'>
                {location.latitud.toFixed(3)}, {location.longitud.toFixed(3)} · precisión ±{location.precision} m ·{' '}
                {dateTime(location.fechaObtencion)}
              </p>
              {data.ubicaciones.length > 1 && (
                <p className='mt-1 text-default-400'>{data.ubicaciones.length} ubicaciones registradas.</p>
              )}
            </>
          ) : (
            <Empty>
              {consent.categories.location
                ? 'Aceptaste las cookies de ubicación, pero aún no tenemos tu ubicación. Pulsa "Actualizar" y permite el acceso en tu navegador.'
                : 'No guardamos tu ubicación. Puedes permitirlo activando las cookies de ubicación.'}
            </Empty>
          )}
        </Section>

        <Section
          icon={IconUserCircle}
          title='Datos de contacto'
        >
          {data.nombres || data.email ? (
            <ul className='flex flex-col gap-1'>
              <li>
                <span className='text-default-400'>Nombre:</span> {data.nombres} {data.apellidos}
              </li>
              <li>
                <span className='text-default-400'>Correo:</span> {data.email}
              </li>
              <li>
                <span className='text-default-400'>Teléfono:</span> {data.codTelefono} {data.telefono}
              </li>
            </ul>
          ) : (
            <Empty>
              {consent.categories.personalData
                ? 'Se guardarán cuando hagas una reserva, para completar el formulario la próxima vez.'
                : 'No guardamos tus datos de contacto (cookies de datos personales desactivadas).'}
            </Empty>
          )}
        </Section>

        <Section
          icon={IconActivity}
          title='Actividad'
        >
          {data.cantidadVisitas > 0 ? (
            <>
              <ul className='flex flex-col gap-1'>
                <li>
                  <span className='text-default-400'>Visitas:</span> {data.cantidadVisitas}
                </li>
                <li>
                  <span className='text-default-400'>Primera visita:</span> {dateTime(data.primerIngreso)}
                </li>
                <li>
                  <span className='text-default-400'>Última visita:</span> {dateTime(data.ultimoIngreso)}
                </li>
                {device && (
                  <li>
                    <span className='text-default-400'>Dispositivo:</span> {device.browser} · {device.os} ·{' '}
                    {device.screen.width}x{device.screen.height} · {device.language}
                  </li>
                )}
                {campaign.length > 0 && (
                  <li>
                    <span className='text-default-400'>Campaña de llegada:</span> {campaign.join(' / ')}
                  </li>
                )}
              </ul>

              {data.masVistos.length > 0 && (
                <>
                  <p className='mt-3 font-medium text-foreground'>Propiedades vistas recientemente</p>
                  <ul className='mt-1 flex flex-col gap-0.5'>
                    {data.masVistos
                      .slice(-5)
                      .reverse()
                      .map((view) => (
                        <li key={view.id}>
                          <Link
                            href={view.urlPropiedad}
                            className='text-primary hover:underline'
                          >
                            {view.titulo}
                          </Link>{' '}
                          <span className='text-default-400'>
                            · {view.ciudad} · {view.visitas} {view.visitas === 1 ? 'vez' : 'veces'}
                          </span>
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            <Empty>Todavía no hay actividad registrada.</Empty>
          )}
        </Section>

        <Section
          icon={IconHeart}
          title='Favoritos'
          action={
            data.favoritos.length > 0 && (
              <Link
                href='/favoritos'
                className='text-xs font-semibold text-primary hover:underline'
              >
                Ver
              </Link>
            )
          }
        >
          {data.favoritos.length > 0 ? (
            <p>
              {data.favoritos.length} {data.favoritos.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}.
            </p>
          ) : (
            <Empty>No tienes propiedades favoritas.</Empty>
          )}
        </Section>

        <Section
          icon={IconReceipt}
          title='Pagos pendientes'
        >
          {data.reservacionesPendientes.length > 0 ? (
            <ul className='flex flex-col gap-1'>
              {data.reservacionesPendientes.map((reservation) => (
                <li key={reservation.confirmationCode}>
                  <span className='font-mono text-xs'>{reservation.confirmationCode}</span> · {reservation.listingTitle}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No tienes pagos pendientes.</Empty>
          )}
        </Section>
      </div>

      <p className='mt-6 text-center text-xs text-default-400'>
        Todo esto se guarda solo en este navegador, en una única entrada llamada «vaiven». Última actividad:{' '}
        {dateTime(data.ultimoIngreso)}.
      </p>

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        placement='center'
      >
        <ModalContent>
          <ModalHeader>¿Eliminar tus datos?</ModalHeader>
          <ModalBody className='text-sm text-default-600'>
            <p>
              Se borrarán tus preferencias de cookies, favoritos, datos de contacto, ubicación y actividad guardados en
              este navegador. Esta acción no se puede deshacer.
            </p>
            {data.reservacionesPendientes.length > 0 && (
              <Checkbox
                isSelected={includePending}
                onValueChange={setIncludePending}
                size='sm'
              >
                <span className='text-sm'>
                  Eliminar también mis pagos pendientes (ya no podrás volver a ellos desde este sitio)
                </span>
              </Checkbox>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              radius='full'
              variant='light'
              onPress={() => setIsDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              radius='full'
              color='danger'
              onPress={handleDelete}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MyData;
