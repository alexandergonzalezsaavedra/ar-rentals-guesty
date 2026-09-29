'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import {
  IconAlertCircle,
  IconCircleCheckFilled,
} from '@tabler/icons-react';
import { DEFAULT_PHONE_COUNTRY, PHONE_COUNTRIES } from '@/lib/phoneCountries';

interface ReservationFormProps {
  quoteId: string;
  propertyHref: string;
}

interface InquiryResult {
  confirmationCode: string;
}

const ReservationForm = ({ quoteId, propertyHref }: ReservationFormProps) => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!acceptPrivacy) {
      setError('Debes aceptar la política de privacidad para continuar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/guesty/quotes/${quoteId}/inquiry`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
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

      setResult({ confirmationCode: data.reservation.confirmationCode });
    } catch {
      setError('No pudimos completar la reserva. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className='flex flex-col items-center gap-4 rounded-xl border border-slate-100 bg-content1 p-8 text-center shadow-sm dark:border-slate-800'>
        <span className='flex size-16 items-center justify-center rounded-full bg-success/10 text-success'>
          <IconCircleCheckFilled size={36} />
        </span>
        <h2 className='text-xl font-semibold text-foreground'>¡Reserva enviada!</h2>
        <p className='text-sm text-default-600'>
          Tu código de confirmación es{' '}
          <span className='font-semibold text-foreground'>{result.confirmationCode}</span>. Te
          enviamos los detalles a tu correo.
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
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-5 rounded-xl border border-slate-100 bg-content1 p-5 shadow-sm sm:p-6 dark:border-slate-800'
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
            <SelectItem key={country.dialCode}>
              {country.flag} +{country.dialCode}
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
          Confirmar reserva
        </Button>
      </div>
    </form>
  );
};

export default ReservationForm;
