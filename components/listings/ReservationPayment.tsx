'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import {
  IconAlertCircle,
  IconCircleCheckFilled,
  IconClockHour4,
  IconLock,
} from '@tabler/icons-react';
import { formatPrice } from '@/lib/format';

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
}

const ReservationPayment = ({ confirmationCode, payment, customer }: ReservationPaymentProps) => {
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

      <p className='flex items-center justify-center gap-1.5 text-xs text-default-500'>
        <IconLock size={14} />
        Pago seguro con Wompi: tarjetas, PSE, Nequi y más
      </p>
    </div>
  );
};

export default ReservationPayment;
