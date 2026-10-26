'use client';

import Link from 'next/link';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { IconCalendarEvent, IconClockHour4, IconUsers } from '@tabler/icons-react';
import { formatPrice } from '@/lib/format';
import { paymentHref, type PendingReservation } from '@/lib/pendingReservation';

interface PendingPaymentsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  reservations: PendingReservation[];
}

const shortDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

// The visitor's unpaid reservations, each with a way back to its payment step.
// There is deliberately no way to remove one from here: an entry only leaves
// the list once it is paid or after 24 hours.
const PendingPaymentsModal = ({ isOpen, onOpenChange, reservations }: PendingPaymentsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement='center'
      scrollBehavior='inside'
      size='lg'
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              <span className='flex items-center gap-2'>
                <IconClockHour4
                  size={20}
                  className='text-arena-tostada dark:text-arena'
                />
                Pagos pendientes
              </span>
              <span className='text-sm font-normal text-default-500'>
                Reservas que creaste en este navegador y aún no has pagado. Se guardan 24 horas.
              </span>
            </ModalHeader>
            <ModalBody className='pb-6'>
              {reservations.length === 0 ? (
                <p className='py-6 text-center text-sm text-default-500'>No tienes pagos pendientes.</p>
              ) : (
                <ul className='flex flex-col gap-3'>
                  {reservations.map((reservation) => {
                    const guests = reservation.adults + reservation.children;

                    return (
                      <li
                        key={reservation.confirmationCode}
                        className='rounded-xl border border-default-200 p-4 dark:border-default-100/20'
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='font-semibold text-foreground'>{reservation.listingTitle}</p>
                            <p className='font-mono text-xs tracking-wide text-default-500'>
                              {reservation.confirmationCode}
                            </p>
                          </div>
                          <p className='shrink-0 text-right font-bold text-primary'>
                            {formatPrice(reservation.payment.amountInCents / 100, reservation.payment.currency)}
                          </p>
                        </div>

                        <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-default-600'>
                          <span className='flex items-center gap-1.5'>
                            <IconCalendarEvent
                              size={14}
                              className='text-primary'
                            />
                            {shortDate(reservation.checkIn)} – {shortDate(reservation.checkOut)}
                          </span>
                          <span className='flex items-center gap-1.5'>
                            <IconUsers
                              size={14}
                              className='text-primary'
                            />
                            {guests} {guests === 1 ? 'huésped' : 'huéspedes'}
                          </span>
                        </div>

                        <div className='mt-3 flex justify-end'>
                          <Link
                            href={paymentHref(reservation)}
                            onClick={onClose}
                            className='rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90'
                          >
                            Ir al pago
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PendingPaymentsModal;
