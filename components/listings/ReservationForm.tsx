'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { IconAlertCircle, IconCheck, IconCircleCheckFilled } from '@tabler/icons-react';
import { DEFAULT_PHONE_COUNTRY, PHONE_COUNTRIES } from '@/lib/phoneCountries';
import {
  findPendingReservation,
  removePendingReservation,
  savePendingReservation,
  type PendingStay,
} from '@/lib/pendingReservation';
import { readStorage, writeGuest } from '@/lib/storage';
import ReservationPayment, { type ReservationPaymentInfo } from './ReservationPayment';

interface ReservationFormProps {
  /** Null when Guesty couldn't quote the stay, e.g. because this visitor's own unpaid reservation holds the dates. */
  quoteId: string | null;
  ratePlanId: string | null;
  propertyHref: string;
  stay: PendingStay;
  /** Stay and price summary, shown beside the guest form. */
  summary: ReactNode;
}

interface InquiryResult {
  confirmationCode: string;
  payment: ReservationPaymentInfo | null;
}

const STEPS = ['Tus datos', 'Pago'];


const ReservationSteps = ({ current }: { current: number }) => (
  <ol className='enter-stagger mb-4 flex items-center gap-3 text-sm'>
    {STEPS.map((label, index) => {
      const isDone = index < current;
      const isActive = index === current;

      return (
        <li
          key={label}
          className='flex items-center gap-2'
        >
          {index > 0 && <span className='h-px w-6 bg-default-300 sm:w-10' />}
          <span
            className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
              isDone || isActive ? 'bg-primary text-white' : 'bg-default-200 text-default-500'
            }`}
          >
            {isDone ? <IconCheck size={14} /> : index + 1}
          </span>
          <span className={isActive ? 'font-semibold text-foreground' : 'text-default-500'}>{label}</span>
        </li>
      );
    })}
  </ol>
);

const ReservationForm = ({ quoteId, ratePlanId, propertyHref, stay, summary }: ReservationFormProps) => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState(DEFAULT_PHONE_COUNTRY.dialCode);
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InquiryResult | null>(null);
  // Until the browser's saved reservation has been checked we can't tell the
  // form from the payment step, so nothing renders for that first moment.
  const [isCheckingPending, setIsCheckingPending] = useState(true);

  // Coming back to this stay with a reservation already created and unpaid:
  // go straight to the payment step instead of creating a second one.
  useEffect(() => {
    const pending = findPendingReservation(stay);

    /* eslint-disable react-hooks/set-state-in-effect -- restoring browser-saved state on mount */
    if (pending) {
      setFirstName(pending.customer.firstName);
      setLastName(pending.customer.lastName);
      setEmail(pending.customer.email);
      setDialCode(pending.customer.dialCode);
      setPhone(pending.customer.phone);
      setResult({ confirmationCode: pending.confirmationCode, payment: pending.payment });
    } else if (!quoteId) {
      // Nothing to resume and nothing to book: back to the property, which explains why.
      router.replace(
        `${propertyHref}?checkIn=${stay.checkIn}&checkOut=${stay.checkOut}&adults=${stay.adults}&children=${stay.children}`,
      );
      return;
    }

    setIsCheckingPending(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    // Runs once per visit; the stay comes from the URL and doesn't change in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const guest = readStorage().guest;

    if (!guest) {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    if (typeof guest.firstName === 'string') setFirstName(guest.firstName);
    if (typeof guest.lastName === 'string') setLastName(guest.lastName);
    if (typeof guest.email === 'string') setEmail(guest.email);
    if (typeof guest.phone === 'string') setPhone(guest.phone);
    if (PHONE_COUNTRIES.some((country) => country.dialCode === guest.dialCode)) {
      setDialCode(guest.dialCode);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quoteId || !ratePlanId) {
      return;
    }

    if (!acceptPrivacy) {
      setError('Debes aceptar la política de privacidad para continuar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    writeGuest({ firstName, lastName, email, dialCode, phone });

    try {
      const response = await fetch(`/api/guesty/quotes/${quoteId}/inquiry`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ratePlanId,
          firstName,
          lastName,
          email,
          phone: `${dialCode}${phone.replace(/\D/g, '')}`,
          specialRequests: specialRequests || undefined,
          acceptPrivacy,
          acceptMarketing,
        }),
      });

      const data = await response.json();

      if (!response.ok || 'error' in data) {
        setError(data.error ?? 'No pudimos completar la reserva. Intenta de nuevo.');
        return;
      }

      setResult({
        confirmationCode: data.reservation.confirmationCode,
        payment: data.payment ?? null,
      });

      if (data.payment) {
        savePendingReservation({
          ...stay,
          confirmationCode: data.reservation.confirmationCode,
          payment: data.payment,
          customer: { firstName, lastName, email, dialCode, phone },
          createdAt: Date.now(),
        });
      }
    } catch {
      setError('No pudimos completar la reserva. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingPending) {
    return null;
  }

  // Payment: a single centered card that carries the stay itself, instead of the side summary.
  if (result?.payment) {
    return (
      <div className='mx-auto w-full max-w-2xl'>
        <ReservationSteps current={1} />
        <ReservationPayment
          confirmationCode={result.confirmationCode}
          payment={result.payment}
          stay={stay}
          customer={{
            email,
            fullName: `${firstName} ${lastName}`.trim(),
            phoneNumber: phone.replace(/\D/g, ''),
            phoneNumberPrefix: `+${dialCode}`,
          }}
          onSettled={() => removePendingReservation(result.confirmationCode)}
        />
      </div>
    );
  }

  if (result) {
    return (
      <div className='enter-card mx-auto max-w-2xl enter-stagger flex flex-col items-center gap-4 rounded-xl border border-slate-100 bg-content1 p-8 text-center shadow-sm dark:border-slate-800'>
        <span className='flex size-16 items-center justify-center rounded-full bg-success/10 text-success'>
          <IconCircleCheckFilled size={36} />
        </span>
        <h2 className='text-xl font-semibold text-foreground'>¡Reserva recibida!</h2>
        <p className='text-sm text-default-600'>
          Tu código de reserva es <span className='font-semibold text-foreground'>{result.confirmationCode}</span>. El
          pago en línea no está disponible en este momento; te contactaremos al correo que nos diste para completarlo.
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
    <div className='grid gap-8 lg:grid-cols-3'>
      <div className='lg:col-span-2'>
        <ReservationSteps current={0} />
        <form
          onSubmit={handleSubmit}
          className='enter-card enter-stagger flex flex-col gap-5 rounded-xl border border-slate-100 bg-content1 p-5 shadow-sm sm:p-6 dark:border-slate-800'
        >
          <div>
            <h1 className='text-xl font-semibold text-foreground'>Completa tus datos</h1>
            <p className='mt-1 text-sm text-default-500'>Información del huésped principal</p>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Input
              label='Nombre'
              value={firstName}
              onValueChange={setFirstName}
              isRequired
            />
            <Input
              label='Apellido'
              value={lastName}
              onValueChange={setLastName}
              isRequired
            />
          </div>

          <Input
            type='email'
            label='Correo electrónico'
            value={email}
            onValueChange={setEmail}
            isRequired
          />

          <div className='flex gap-2'>
            <Select
              label='País'
              className='w-36 shrink-0'
              selectedKeys={[dialCode]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (typeof selected === 'string') {
                  setDialCode(selected);
                }
              }}
            >
              {PHONE_COUNTRIES.map((country) => (
                <SelectItem
                  key={country.dialCode}
                  textValue={`${country.flag} +${country.dialCode}`}
                >
                  {`${country.flag} +${country.dialCode}`}
                </SelectItem>
              ))}
            </Select>
            <Input
              type='tel'
              label='Número de teléfono'
              value={phone}
              onValueChange={setPhone}
              isRequired
              className='flex-1'
            />
          </div>

          <Textarea
            label='Solicitud especial (opcional)'
            value={specialRequests}
            onValueChange={setSpecialRequests}
            minRows={3}
          />

          <div className='flex flex-col gap-2'>
            <Checkbox
              isSelected={acceptPrivacy}
              onValueChange={setAcceptPrivacy}
              isRequired
            >
              <span className='text-sm text-default-600'>
                He leído y acepto la política de privacidad y los términos y condiciones
              </span>
            </Checkbox>
            <Checkbox
              isSelected={acceptMarketing}
              onValueChange={setAcceptMarketing}
            >
              <span className='text-sm text-default-600'>
                Quiero recibir descuentos, promociones y novedades de AR Rentals
              </span>
            </Checkbox>
          </div>

          {error && (
            <div className='flex items-start gap-2 text-sm text-danger'>
              <IconAlertCircle
                size={16}
                className='mt-0.5 shrink-0'
              />
              <p>{error}</p>
            </div>
          )}

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <Link
              href={propertyHref}
              className='text-sm text-default-500 underline-offset-2 hover:underline'
            >
              Volver al alojamiento
            </Link>
            <Button
              type='submit'
              color='primary'
              radius='full'
              className='text-white'
              isLoading={isSubmitting}
              isDisabled={!acceptPrivacy}
            >
              Continuar al pago
            </Button>
          </div>
        </form>
      </div>
      <aside>{summary}</aside>
    </div>
  );
};

export default ReservationForm;
