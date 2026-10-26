'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger, RangeCalendar } from '@heroui/react';
import type { DateValue } from '@internationalized/date';
import type { RangeValue } from '@react-types/shared';
import { IconCalendar } from '@tabler/icons-react';

interface StayDatesPickerProps {
  checkIn: DateValue | null;
  checkOut: DateValue | null;
  onChange: (checkIn: DateValue, checkOut: DateValue) => void;
  minValue: DateValue;
  checkInLabel?: string;
  checkOutLabel?: string;
  size?: 'sm' | 'md';
}

const pad = (value: number) => String(value).padStart(2, '0');
const formatDate = (date: DateValue) => `${pad(date.day)}/${pad(date.month)}/${date.year}`;

// Check-in and check-out as two fields that open one shared calendar: the
// first click sets the arrival, the second the departure, and the nights in
// between are shaded. It closes itself once the range is complete.
const StayDatesPicker = ({
  checkIn,
  checkOut,
  onChange,
  minValue,
  checkInLabel = 'Fecha de llegada',
  checkOutLabel = 'Fecha de salida',
  size = 'sm',
}: StayDatesPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const range = checkIn && checkOut ? { start: checkIn, end: checkOut } : null;

  const handleChange = (value: RangeValue<DateValue> | null) => {
    // A single click on one day gives start === end; keep waiting for the second.
    if (!value || value.end.compare(value.start) <= 0) {
      return;
    }

    onChange(value.start, value.end);
    setIsOpen(false);
  };

  const fieldClass = `flex w-full flex-col items-start justify-center rounded-medium bg-default-100 px-3 text-left transition-[background-color,box-shadow] hover:bg-default-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
    size === 'sm' ? 'h-12' : 'h-14'
  } ${isOpen ? 'bg-content1 ring-2 ring-secondary hover:bg-content1' : ''}`;

  const renderField = (label: string, value: DateValue | null) => (
    <span className={fieldClass}>
      <span className='text-tiny text-default-600'>{label}</span>
      <span className='flex w-full items-center justify-between gap-2'>
        <span className={`text-small ${value ? 'text-foreground' : 'text-default-400'}`}>
          {value ? formatDate(value) : 'dd/mm/aaaa'}
        </span>
        <IconCalendar
          size={18}
          className='shrink-0 text-default-400'
        />
      </span>
    </span>
  );

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement='bottom-start'
      offset={8}
    >
      <PopoverTrigger>
        {/* Both fields are one trigger, so either opens the same calendar. */}
        <button
          type='button'
          aria-label={`${checkInLabel} y ${checkOutLabel}`}
          className='grid w-full grid-cols-2 gap-3'
        >
          {renderField(checkInLabel, checkIn)}
          {renderField(checkOutLabel, checkOut)}
        </button>
      </PopoverTrigger>
      <PopoverContent className='p-1'>
        <RangeCalendar
          aria-label='Fechas de la estadía'
          color='primary'
          firstDayOfWeek='mon'
          minValue={minValue}
          value={range}
          onChange={handleChange}
          defaultFocusedValue={checkIn ?? minValue}
          classNames={{ base: 'shadow-none bg-transparent' }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default StayDatesPicker;
