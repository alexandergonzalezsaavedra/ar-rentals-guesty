import type { ReservationPaymentInfo } from '@/components/listings/ReservationPayment';

// Reservations created in Guesty but not paid yet. The site has no database,
// so they live in the visitor's browser: without them, leaving the payment
// step would lose the confirmation code, and coming back would try to quote
// dates that the unpaid reservation itself is now holding.

const STORAGE_KEY = 'vaiven-pending-reservations';
/** Earlier versions kept a single reservation under this key. */
const LEGACY_KEY = 'vaiven-pending-reservation';
const CHANGE_EVENT = 'vaiven:pending-reservations';
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
  createdAt: number;
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
  return Boolean(pending?.confirmationCode && pending.payment?.token) && Date.now() - pending.createdAt <= MAX_AGE_MS;
}

function write(list: PendingReservation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage unavailable (private mode, quota): the payment still works in this visit.
  }
}

/** Unpaid, unexpired reservations, newest first. */
export function readPendingReservations(): PendingReservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: PendingReservation[] = raw ? JSON.parse(raw) : [];
    const legacy = localStorage.getItem(LEGACY_KEY);

    if (legacy) {
      list = [...list, JSON.parse(legacy)];
      localStorage.removeItem(LEGACY_KEY);
    }

    const usable = (Array.isArray(list) ? list : []).filter(isUsable).sort((a, b) => b.createdAt - a.createdAt);

    if (raw === null ? usable.length > 0 : usable.length !== list.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usable));
    }

    return usable;
  } catch {
    return [];
  }
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

/** Calls `listener` whenever the pending reservations change, in this tab or another. */
export function onPendingReservationsChange(listener: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };

  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}
