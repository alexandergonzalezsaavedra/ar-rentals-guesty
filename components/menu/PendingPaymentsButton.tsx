'use client';

import { useState } from 'react';
import { Button, NavbarItem, Tooltip } from '@heroui/react';
import { IconReceipt } from '@tabler/icons-react';
import { usePendingReservations } from '@/hooks/pendingReservations/usePendingReservations';
import PendingPaymentsModal from '@/components/listings/PendingPaymentsModal';

// Menu shortcut to the visitor's unpaid reservations. Like the favorites
// heart, it only shows up when there is something to see.
const PendingPaymentsButton = () => {
  const reservations = usePendingReservations();
  const [isOpen, setIsOpen] = useState(false);

  if (reservations.length === 0) {
    return null;
  }

  return (
    <NavbarItem>
      <Tooltip
        content='Pagos pendientes'
        placement='bottom'
      >
        <Button
          aria-label={`Ver pagos pendientes (${reservations.length})`}
          color='default'
          variant='light'
          radius='full'
          className='min-w-0 gap-0 px-1 sm:px-2'
          onPress={() => setIsOpen(true)}
        >
          <IconReceipt size={20} />
          <span className='flex size-4 items-center justify-center rounded-full bg-arena-tostada text-[8px] text-white'>
            {reservations.length}
          </span>
        </Button>
      </Tooltip>

      <PendingPaymentsModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        reservations={reservations}
      />
    </NavbarItem>
  );
};

export default PendingPaymentsButton;
