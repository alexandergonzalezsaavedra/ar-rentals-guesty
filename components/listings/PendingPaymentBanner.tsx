'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { IconClockHour4, IconX } from '@tabler/icons-react';
import { EASE_BRAND } from '@/lib/easing';
import { paymentHref } from '@/lib/pendingReservation';
import { usePendingReservations } from '@/hooks/pendingReservations/usePendingReservations';
import PendingPaymentsModal from './PendingPaymentsModal';

// Reminds a visitor who created a reservation and left before paying that it
// is still waiting, with a way straight back to the payment step (or to the
// list, when there is more than one). Hidden on the booking page itself.
// Closing it only hides it on the current page: it comes back on the next one
// for as long as there is something unpaid.
const PendingPaymentBanner = () => {
  const pathname = usePathname();
  const reservations = usePendingReservations();
  // The page it was closed on; navigating anywhere else shows it again.
  const [dismissedOn, setDismissedOn] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const latest = reservations[0] ?? null;

  const isVisible = latest !== null && dismissedOn !== pathname && !pathname.endsWith('/reservar');

  const actionClass =
    'shrink-0 rounded-full bg-arena px-4 py-2 text-xs font-semibold text-sierra transition-colors hover:bg-white';

  return (
    <>
      <AnimatePresence>
        {isVisible && latest && (
          <motion.div
            role='status'
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.5, ease: EASE_BRAND }}
            // Above the property page's mobile booking bar; bottom-left on desktop.
            className='fixed inset-x-3 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 flex items-center gap-3 rounded-2xl bg-sierra p-3 text-white shadow-2xl ring-1 shadow-black/30 ring-white/10 sm:inset-x-auto sm:left-6 sm:max-w-md lg:bottom-6'
          >
            <span className='flex size-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-arena text-arena-tostada'>
              <IconClockHour4 size={20} />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-semibold text-white'>
                {reservations.length === 1
                  ? 'Tienes una reserva pendiente de pago'
                  : `Tienes ${reservations.length} reservas pendientes de pago`}
              </p>
              <p className='truncate text-xs text-white/70'>
                {latest.confirmationCode} · {latest.listingTitle}
              </p>
            </div>
            {reservations.length === 1 ? (
              <Link
                href={paymentHref(latest)}
                className={actionClass}
              >
                Ir al pago
              </Link>
            ) : (
              <button
                type='button'
                onClick={() => setIsListOpen(true)}
                className={actionClass}
              >
                Ver pagos
              </button>
            )}
            <button
              type='button'
              onClick={() => setDismissedOn(pathname)}
              aria-label='Cerrar aviso'
              className='flex size-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white'
            >
              <IconX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PendingPaymentsModal
        isOpen={isListOpen}
        onOpenChange={setIsListOpen}
        reservations={reservations}
      />
    </>
  );
};

export default PendingPaymentBanner;
