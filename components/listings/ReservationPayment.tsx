'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import {
  IconAlertCircle,
  IconCircleCheckFilled,
  IconClockHour4,
  IconLock,
  IconMapPin,
  IconMoonStars,
  IconShieldCheck,
  IconUsers,
} from '@tabler/icons-react';
import { formatPrice } from '@/lib/format';
import type { PendingStay } from '@/lib/pendingReservation';

interface WompiTransaction {
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
}

interface WompiWidgetOptions {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  signature: { integrity: string };
  customerData?: {
    email: string;
    fullName: string;
    phoneNumber: string;
    phoneNumberPrefix: string;
  };
}

declare global {
  interface Window {
    WidgetCheckout?: new (options: WompiWidgetOptions) => {
      open: (callback: (result: { transaction?: WompiTransaction }) => void) => void;
    };
  }
}

// `widget` opens Wompi's own checkout widget; `link` shows a Wompi-hosted
// payment link in a modal, used when the widget isn't configured.
export interface ReservationPaymentInfo {
  token: string;
  mode: 'widget' | 'link';
  amountInCents: number;
  currency: string;
}

interface ReservationPaymentProps {
  confirmationCode: string;
  payment: ReservationPaymentInfo;
  customer: {
    email: string;
    fullName: string;
    phoneNumber: string;
    phoneNumberPrefix: string;
  };
  /** Called once Wompi reports the payment as approved or in process. */
  onSettled?: (status: 'APPROVED' | 'PENDING') => void;
  /** What is being paid for, shown in the card right above the amount. */
  stay?: PendingStay;
}

const stayDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });

const ReservationPayment = ({ confirmationCode, payment, customer, onSettled, stay }: ReservationPaymentProps) => {
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<WompiTransaction['status'] | null>(null);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  const isLinkMode = payment.mode === 'link';

  // The payment link runs in an iframe; /api/wompi/return posts the outcome
  // back here once Wompi redirects to it.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'wompi-payment-result') {
        return;
      }

      setStatus(event.data.status);
      setIsLinkOpen(false);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (status === 'APPROVED' || status === 'PENDING') {
      onSettled?.(status);
    }
    // onSettled is a fresh function each render; reacting to the status is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const total = formatPrice(payment.amountInCents / 100, payment.currency);

  const handlePay = async () => {
    if (linkUrl) {
      setIsLinkOpen(true);
      return;
    }

    if (!isLinkMode && !window.WidgetCheckout) {
      setError('No pudimos cargar la pasarela de pago. Recarga la página e intenta de nuevo.');
      return;
    }

    setIsOpening(true);
    setError(null);

    try {
      const response = await fetch('/api/wompi/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: payment.token }),
      });

      const data = await response.json();

      if (!response.ok || 'error' in data) {
        setError(data.error ?? 'No pudimos iniciar el pago. Intenta de nuevo.');
        return;
      }

      if (isLinkMode) {
        setLinkUrl(data.url);
        setIsLinkOpen(true);
        return;
      }

      const widget = new window.WidgetCheckout!({
        currency: data.checkout.currency,
        amountInCents: data.checkout.amountInCents,
        reference: data.checkout.reference,
        publicKey: data.checkout.publicKey,
        signature: { integrity: data.checkout.signature },
        customerData: customer,
      });

      widget.open((result) => {
        if (result.transaction) {
          setStatus(result.transaction.status);
        }
      });
    } catch {
      setError('No pudimos iniciar el pago. Intenta de nuevo.');
    } finally {
      setIsOpening(false);
    }
  };

  if (status === 'APPROVED' || status === 'PENDING') {
    const isApproved = status === 'APPROVED';

    return (
      <div className='enter-card enter-stagger flex flex-col items-center gap-4 rounded-xl border border-slate-100 bg-content1 p-8 text-center shadow-sm dark:border-slate-800'>
        <span
          className={`flex size-16 items-center justify-center rounded-full ${
            isApproved ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}
        >
          {isApproved ? <IconCircleCheckFilled size={36} /> : <IconClockHour4 size={36} />}
        </span>
        <h2 className='text-xl font-semibold text-foreground'>
          {isApproved ? '¡Pago aprobado!' : 'Estamos confirmando tu pago'}
        </h2>
        <p className='text-sm text-default-600'>
          {isApproved
            ? 'Recibimos tu pago y tu reserva quedó registrada con el código '
            : 'Tu banco aún está procesando el pago. Te avisaremos por correo cuando se confirme. Tu código de reserva es '}
          <span className='font-semibold text-foreground'>{confirmationCode}</span>.
        </p>
        <Button
          as={Link}
          href='/'
          color='primary'
          radius='full'
          className='mt-2 text-white'
        >
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className='enter-card enter-stagger flex flex-col gap-5 rounded-xl border border-slate-100 bg-content1 p-5 shadow-sm sm:p-6 dark:border-slate-800'>
      {!isLinkMode && (
        <Script
          src='https://checkout.wompi.co/widget.js'
          onReady={() => setIsWidgetReady(true)}
        />
      )}

      <div>
        <h1 className='text-xl font-semibold text-foreground'>Paga para confirmar tu reserva</h1>
        <p className='mt-1 text-sm text-default-500'>
          Ya guardamos tus datos con el código{' '}
          <span className='font-semibold text-foreground'>{confirmationCode}</span>. Solo falta el pago.
        </p>
      </div>

      {stay && <StaySummary stay={stay} />}

      <div className='flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3'>
        <span className='font-semibold text-foreground'>Total a pagar</span>
        <span className='text-lg font-bold text-primary'>{total}</span>
      </div>

      {status && (
        <div className='flex items-start gap-2 text-sm text-danger'>
          <IconAlertCircle
            size={16}
            className='mt-0.5 shrink-0'
          />
          <p>El pago no fue aprobado. No se hizo ningún cobro; puedes intentarlo de nuevo con otro medio de pago.</p>
        </div>
      )}

      {error && (
        <div className='flex items-start gap-2 text-sm text-danger'>
          <IconAlertCircle
            size={16}
            className='mt-0.5 shrink-0'
          />
          <p>{error}</p>
        </div>
      )}

      <Button
        color='primary'
        radius='full'
        size='lg'
        className='text-white'
        isLoading={isOpening}
        isDisabled={!isLinkMode && !isWidgetReady}
        onPress={handlePay}
      >
        {status ? 'Intentar de nuevo' : `Pagar ${total}`}
      </Button>

      {linkUrl && (
        <Modal
          isOpen={isLinkOpen}
          onOpenChange={setIsLinkOpen}
          placement='center'
          isDismissable={false}
          classNames={{
            base: 'm-0 h-dvh max-h-dvh w-full max-w-full rounded-none sm:m-0 sm:h-[92dvh] sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-large',
            body: 'flex-1 overflow-hidden p-0',
          }}
        >
          <ModalContent>
            <ModalHeader className='text-base'>Pago de la reserva {confirmationCode}</ModalHeader>
            <ModalBody>
              <iframe
                src={linkUrl}
                title='Pago seguro con Wompi'
                className='h-full w-full border-0'
                allow='payment'
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Trust note right under the pay button, where the guest decides; tinted so it reads as reassurance, not fine print. */}
      <div className='flex items-start gap-3 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-white'>
          <IconShieldCheck size={20} />
        </span>
        <div className='text-sm'>
          <p className='flex items-center gap-1.5 font-semibold text-foreground'>
            Pago 100% seguro
            <IconLock
              size={14}
              className='text-secondary'
            />
          </p>
          <p className='mt-0.5 text-default-600'>
            Lo procesa Wompi, la pasarela de Bancolombia. Los datos de tu tarjeta o cuenta se ingresan directamente
            en Wompi y no pasan por nuestro sitio. Aceptamos tarjetas, PSE, Nequi y más.
          </p>
        </div>
      </div>
    </div>
  );
};

// Photo, name, address, dates and guests of the stay being paid for.
const StaySummary = ({ stay }: { stay: PendingStay }) => {
  const nights = Math.round(
    (new Date(`${stay.checkOut}T00:00:00`).getTime() - new Date(`${stay.checkIn}T00:00:00`).getTime()) / 86400000,
  );
  const guests = stay.adults + stay.children;

  return (
    <div className='flex gap-4 rounded-xl border border-default-200 p-3 dark:border-default-100/20'>
      {stay.listingImage && (
        <div className='relative size-20 shrink-0 overflow-hidden rounded-lg sm:size-24'>
          <Image
            src={stay.listingImage}
            alt={stay.listingTitle}
            fill
            sizes='96px'
            className='object-cover'
          />
        </div>
      )}
      <div className='min-w-0 flex-1'>
        <p className='leading-snug font-semibold text-foreground'>{stay.listingTitle}</p>
        {stay.listingAddress && (
          <p className='mt-1 flex items-start gap-1.5 text-xs text-default-500'>
            <IconMapPin
              size={14}
              className='mt-px shrink-0 text-primary'
            />
            <span className='line-clamp-2'>{stay.listingAddress}</span>
          </p>
        )}
        <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-default-600'>
          <span className='flex items-center gap-1.5'>
            <IconMoonStars
              size={14}
              className='text-primary'
            />
            {stayDate(stay.checkIn)} – {stayDate(stay.checkOut)} · {nights} {nights === 1 ? 'noche' : 'noches'}
          </span>
          <span className='flex items-center gap-1.5'>
            <IconUsers
              size={14}
              className='text-primary'
            />
            {guests} {guests === 1 ? 'huésped' : 'huéspedes'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReservationPayment;
