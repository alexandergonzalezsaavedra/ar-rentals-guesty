'use client';

import { useEffect, useState } from 'react';
import {
  onPendingReservationsChange,
  readPendingReservations,
  type PendingReservation,
} from '@/lib/pendingReservation';

/** The visitor's unpaid reservations, kept in sync across components and tabs. Empty until mounted. */
export function usePendingReservations(): PendingReservation[] {
  const [pending, setPending] = useState<PendingReservation[]>([]);

  useEffect(() => {
    const sync = () => setPending(readPendingReservations());

    sync();
    return onPendingReservationsChange(sync);
  }, []);

  return pending;
}
