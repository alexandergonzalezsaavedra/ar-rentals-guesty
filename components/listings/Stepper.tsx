'use client';

import { Button, Tooltip } from '@heroui/react';
import { IconInfoCircle, IconMinus, IconPlus } from '@tabler/icons-react';

interface StepperProps {
  label: string;
  description?: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const Stepper = ({ label, description, tooltip, value, min, max, onChange }: StepperProps) => {
  return (
    <div className='flex flex-col gap-2 py-3 lg:px-4'>
      <div>
        <p className='flex items-center gap-1 text-sm font-semibold text-default-900'>
          {label}
          {tooltip && (
            <Tooltip
              content={tooltip}
              placement='top'
            >
              <IconInfoCircle
                size={14}
                className='cursor-help text-foreground shrink-0'
              />
            </Tooltip>
          )}
        </p>
        {description && <p className='text-xs text-default-400'>{description}</p>}
      </div>

      <div className='flex items-center gap-3'>
        <Button
          isIconOnly
          size='sm'
          variant='flat'
          radius='full'
          className='bg-content1 text-foreground shadow-sm'
          isDisabled={value <= min}
          aria-label={`Disminuir ${label}`}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <IconMinus size={14} />
        </Button>
        <span className='w-4 text-center text-sm font-medium text-foreground'>{value}</span>
        <Button
          isIconOnly
          size='sm'
          variant='flat'
          radius='full'
          className='bg-content1 text-foreground shadow-sm'
          isDisabled={value >= max}
          aria-label={`Aumentar ${label}`}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <IconPlus size={14} />
        </Button>
      </div>
    </div>
  );
};

export default Stepper;
