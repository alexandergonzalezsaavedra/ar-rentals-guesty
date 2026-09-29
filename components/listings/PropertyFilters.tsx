'use client';

import { useState, type SubmitEvent } from 'react';
import { Button, DatePicker, Select, SelectItem } from '@heroui/react';
import {
  getLocalTimeZone,
  parseDate,
  today,
  type DateValue,
} from '@internationalized/date';
import {
  IconBabyCarriage,
  IconBath,
  IconBed,
  IconBuildingSkyscraper,
  IconFilter,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import Stepper from './Stepper';

export interface PropertyFiltersValues {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  numberOfBedrooms?: string;
  numberOfBathrooms?: string;
  minOccupancy?: string;
  adults?: string;
  children?: string;
}

interface PropertyFiltersProps {
  cities: string[];
  onSubmit: (values: PropertyFiltersValues) => void;
  onClear: () => void;
  isLoading?: boolean;
  initialValues?: PropertyFiltersValues;
  variant?: 'solid' | 'glass';
}

const MAX_BEDROOMS = 5;
const MAX_BATHROOMS = 3;
const MAX_ADULTS = 8;
const MAX_CHILDREN = 5;

function readField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === 'string' && value !== '' ? value : undefined;
}

const PropertyFilters = ({
  cities,
  onSubmit,
  onClear,
  isLoading,
  initialValues,
  variant = 'solid',
}: PropertyFiltersProps) => {
  const isGlass = variant === 'glass';
  const dividerColor = isGlass ? 'border-default-200/60' : 'border-default-200';
  const [dateError, setDateError] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<DateValue | null>(() =>
    initialValues?.checkIn ? parseDate(initialValues.checkIn) : null,
  );
  const [checkOutDate, setCheckOutDate] = useState<DateValue | null>(() =>
    initialValues?.checkOut ? parseDate(initialValues.checkOut) : null,
  );
  const [bedrooms, setBedrooms] = useState(() =>
    Number(initialValues?.numberOfBedrooms ?? 0),
  );
  const [bathrooms, setBathrooms] = useState(() =>
    Number(initialValues?.numberOfBathrooms ?? 0),
  );
  const [adultsCount, setAdultsCount] = useState(() =>
    Math.max(1, Number(initialValues?.adults ?? 1)),
  );
  const [childrenCount, setChildrenCount] = useState(() =>
    Number(initialValues?.children ?? 0),
  );

  // Guesty enforces a minimum advance notice on every listing we've checked,
  // so same-day check-in always gets rejected as LISTING_IS_NOT_AVAILABLE —
  // block it here instead of letting the user hit that error at quote time.
  const minCheckIn = today(getLocalTimeZone()).add({ days: 1 });

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const values: PropertyFiltersValues = {
      city: readField(formData, 'city'),
      checkIn: checkInDate?.toString(),
      checkOut: checkOutDate?.toString(),
      numberOfBedrooms: bedrooms > 0 ? String(bedrooms) : undefined,
      numberOfBathrooms: bathrooms > 0 ? String(bathrooms) : undefined,
      adults: adultsCount > 0 ? String(adultsCount) : undefined,
      children: adultsCount > 0 ? String(childrenCount) : undefined,
      minOccupancy:
        adultsCount > 0 ? String(adultsCount + childrenCount) : undefined,
    };

    if (Boolean(values.checkIn) !== Boolean(values.checkOut)) {
      setDateError('Complete check-in y check-out, o deje ambos vacíos.');
      return;
    }

    if (checkInDate && checkOutDate && checkOutDate.compare(checkInDate) <= 0) {
      setDateError('El check-out debe ser posterior al check-in.');
      return;
    }

    setDateError(null);
    onSubmit(values);
  };

  return (
    <form
      id='booking-filters'
      onSubmit={handleSubmit}
      className={
        isGlass
          ? '@container bg-content1/9 backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-6 rounded-2xl scroll-mt-4'
          : '@container mb-6 bg-content1 p-4 sm:p-6 rounded-2xl shadow-2xl scroll-mt-4'
      }
    >
      <div className='grid grid-cols-1 @sm:grid-cols-3 gap-3'>
        <DatePicker
          label='Fecha de llegada'
          size='sm'
          value={checkInDate}
          onChange={setCheckInDate}
          minValue={minCheckIn}
        />

        <DatePicker
          label='Fecha de salida'
          size='sm'
          value={checkOutDate}
          onChange={setCheckOutDate}
          minValue={checkInDate ?? minCheckIn}
        />

        <Select
          label='Ciudad'
          name='city'
          placeholder='Cualquiera'
          size='sm'
          startContent={
            <IconBuildingSkyscraper
              size={16}
              className='text-default-400'
            />
          }
          defaultSelectedKeys={
            initialValues?.city ? [initialValues.city] : undefined
          }
        >
          {cities.map((city) => (
            <SelectItem key={city}>{city}</SelectItem>
          ))}
        </Select>
      </div>

      <div
        className={
          isGlass
            ? 'mt-4 grid grid-cols-2 @lg:grid-cols-4 @lg:divide-x divide-default-200/60 bg-content1/50 rounded-lg px-4'
            : 'mt-4 grid grid-cols-2 @lg:grid-cols-4 @lg:divide-x divide-default-200 bg-default-50 rounded-xl px-4'
        }
      >
        <Stepper
          label='Adultos'
          tooltip='> 12 años'
          icon={<IconUser size={16} />}
          value={adultsCount}
          min={1}
          max={MAX_ADULTS}
          onChange={setAdultsCount}
          className={`border-b border-r @lg:border-r-0 @lg:border-b-0 ${dividerColor}`}
        />

        <Stepper
          label='Niños'
          tooltip='< 12 años'
          icon={<IconBabyCarriage size={16} />}
          value={childrenCount}
          min={0}
          max={MAX_CHILDREN}
          onChange={setChildrenCount}
          className={`border-b @lg:border-b-0 ${dividerColor}`}
        />

        <Stepper
          label='Habitaciones'
          tooltip='Cantidad mínima de habitaciones'
          icon={<IconBed size={16} />}
          value={bedrooms}
          min={0}
          max={MAX_BEDROOMS}
          onChange={setBedrooms}
          className={`border-r @lg:border-r-0 ${dividerColor}`}
        />

        <Stepper
          label='Baños'
          tooltip='Cantidad mínima de baños'
          icon={<IconBath size={16} />}
          value={bathrooms}
          min={0}
          max={MAX_BATHROOMS}
          onChange={setBathrooms}
        />
      </div>

      <div className='flex gap-2 mt-4'>
        <Button
          type='submit'
          color='primary'
          isLoading={isLoading}
          startContent={!isLoading && <IconFilter size={16} />}
          className='flex-1 text-white font-medium'
          radius='full'
        >
          Buscar alojamiento
        </Button>
        <Button
          type='button'
          variant='light'
          isIconOnly
          aria-label='Limpiar filtros'
          onPress={onClear}
          radius='full'
        >
          <IconX size={16} />
        </Button>
      </div>

      {dateError && <p className='text-danger text-xs mt-2'>{dateError}</p>}
    </form>
  );
};

export default PropertyFilters;
