'use client';

import type { ReactNode } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
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
  /** Tighter padding and smaller buttons, for narrow cards like the booking widget. */
  compact?: boolean;
}

const Stepper = ({ label, description, tooltip, icon, value, min, max, onChange, className = '', compact = false }: StepperProps) => {
  const buttonSize = compact ? 'h-8 w-8 min-w-8' : 'h-10 w-10 min-w-10 @lg:h-8 @lg:w-8 @lg:min-w-8';

  return (
    <div
      className={`flex flex-col items-center text-center @lg:items-start @lg:px-4 @lg:text-left ${compact ? 'gap-1.5 px-2 py-2' : 'gap-2 px-2 py-3'} ${className}`}
    >
      <div>
        <p className='flex items-center justify-center gap-1.5 text-sm font-semibold text-default-900 @lg:justify-start'>
          {icon && <span className='text-primary'>{icon}</span>}
          {label}
          {tooltip && (
            // A real button in a popover rather than a hover tooltip, so the
            // help also opens with a tap on phones and from the keyboard.
            <Popover placement='top'>
              <PopoverTrigger>
                <button
                  type='button'
                  aria-label={`Ayuda sobre ${label}`}
                  className='-m-1 flex shrink-0 cursor-help rounded-full p-1 text-default-500 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus'
                >
                  <IconInfoCircle size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className='px-3 py-2 text-xs'>{tooltip}</PopoverContent>
            </Popover>
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
          className={`${buttonSize} bg-content1 text-foreground shadow-sm`}
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
          className={`${buttonSize} bg-content1 text-foreground shadow-sm`}
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
