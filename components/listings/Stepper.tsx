'use client';

import type { ReactNode } from 'react';
import { Button, Tooltip } from '@heroui/react';
import { IconInfoCircle, IconMinus, IconPlus } from '@tabler/icons-react';

interface StepperProps {
  label: string;
  description?: string;
  tooltip?: string;
  icon?: ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}

const Stepper = ({ label, description, tooltip, icon, value, min, max, onChange, className = '' }: StepperProps) => {
  return (
    <div className={`flex flex-col items-center gap-2 px-2 py-3 text-center @lg:items-start @lg:px-4 @lg:text-left ${className}`}>
      <div>
        <p className='flex items-center justify-center gap-1.5 text-sm font-semibold text-default-900 @lg:justify-start'>
          {icon && <span className='text-primary'>{icon}</span>}
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

      <div className='flex items-center justify-center gap-3 @lg:justify-start'>
        <Button
          isIconOnly
          size='sm'
          variant='flat'
          radius='full'
          className='h-10 w-10 min-w-10 bg-content1 text-foreground shadow-sm @lg:h-8 @lg:w-8 @lg:min-w-8'
          isDisabled={value <= min}
          aria-label={`Disminuir ${label}`}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <IconMinus size={16} />
        </Button>
        <span className='w-4 text-center text-sm font-medium text-foreground'>{value}</span>
        <Button
          isIconOnly
          size='sm'
          variant='flat'
          radius='full'
          className='h-10 w-10 min-w-10 bg-content1 text-foreground shadow-sm @lg:h-8 @lg:w-8 @lg:min-w-8'
          isDisabled={value >= max}
          aria-label={`Aumentar ${label}`}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <IconPlus size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Stepper;
