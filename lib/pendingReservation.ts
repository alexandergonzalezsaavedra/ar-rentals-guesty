import type { ReservationPaymentInfo } from '@/components/listings/ReservationPayment';
import { fromStoredDate, msSince, type StoredDate } from '@/lib/dates';
import { onStorageChange, readStorage, updateStorage } from '@/lib/storage';

// Reservations created in Guesty but not paid yet. The site has no database,
// so they live in the visitor's browser: without them, leaving the payment
// step would lose the confirmation code, and coming back would try to quote
// dates that the unpaid reservation itself is now holding. They are the
// `reservacionesPendientes` section of the site's single storage object (lib/storage).

/** After this long a reservation is treated as abandoned. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface PendingStay {
  propertyHref: string;
  listingTitle: string;
  /** Photo and full address of the property, shown in the pending payments list. Missing on reservations saved before they were added. */
  listingImage?: string;
  listingAddress?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

export interface PendingReservation extends PendingStay {
  confirmationCode: string;
  payment: ReservationPaymentInfo;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    dialCode: string;
    phone: string;
  };
  createdAt: StoredDate;
}

export function isSameStay(a: PendingStay, b: PendingStay): boolean {
  return (
    a.propertyHref === b.propertyHref &&
    a.checkIn === b.checkIn &&
    a.checkOut === b.checkOut &&
    a.adults === b.adults &&
    a.children === b.children
  );
}

/** Address of the booking page for a stay; opening it resumes the payment. */
export function paymentHref(stay: PendingStay): string {
  const params = new URLSearchParams({
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    adults: String(stay.adults),
    children: String(stay.children),
  });

  return `${stay.propertyHref}/reservar?${params.toString()}`;
}

function isUsable(pending: PendingReservation): boolean {
  return Boolean(pending?.confirmationCode && pending.payment?.token) && msSince(pending.createdAt) <= MAX_AGE_MS;
}

function write(list: PendingReservation[]): void {
  updateStorage((data) => {
    data.reservacionesPendientes = list;
  });
}

/** Unpaid, unexpired reservations, newest first. Expired ones are dropped from storage. */
export function readPendingReservations(): PendingReservation[] {
  const list = readStorage().reservacionesPendientes;
  const usable = list.filter(isUsable).sort((a, b) => fromStoredDate(b.createdAt) - fromStoredDate(a.createdAt));

  if (usable.length !== list.length) {
    write(usable);
  }

  return usable;
}

export function findPendingReservation(stay: PendingStay): PendingReservation | null {
  return readPendingReservations().find((pending) => isSameStay(pending, stay)) ?? null;
}

/** Adds a reservation, replacing an older one for the same stay. */
export function savePendingReservation(pending: PendingReservation): void {
  write([pending, ...readPendingReservations().filter((item) => !isSameStay(item, pending))]);
}

export function removePendingReservation(confirmationCode: string): void {
  write(readPendingReservations().filter((item) => item.confirmationCode !== confirmationCode));
}

/** Calls `listener` whenever the pending reservations (or anything else in storage) change, in this tab or another. */
export const onPendingReservationsChange = onStorageChange;
