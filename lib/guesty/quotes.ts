import { guestyFetch, guestyPost } from './client';

export interface ReservationQuoteParams {
  listingId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
}

export interface ReservationQuoteMoney {
  currency: string;
  fareAccommodation: number;
  fareAccommodationAdjusted?: number;
  fareCleaning?: number;
  totalFees: number;
  subTotalPrice: number;
  totalTaxes: number;
}

export interface ReservationQuote {
  _id: string;
  status: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  guestsCount: number;
  numberOfGuests?: { numberOfAdults: number; numberOfChildren?: number };
  rates: {
    ratePlans: {
      ratePlan: {
        _id: string;
        name: string;
        minNights: number;
        money: ReservationQuoteMoney;
      };
      days: { date: string }[];
    }[];
  };
}

export async function getReservationQuote(params: ReservationQuoteParams): Promise<ReservationQuote> {
  const children = params.children ?? 0;

  return guestyPost<ReservationQuote>('/reservations/quotes', {
    listingId: params.listingId,
    checkInDateLocalized: params.checkIn,
    checkOutDateLocalized: params.checkOut,
    guestsCount: params.adults + children,
    numberOfGuests: {
      numberOfAdults: params.adults,
      numberOfChildren: children,
    },
  });
}

export async function getReservationQuoteById(quoteId: string): Promise<ReservationQuote> {
  return guestyFetch<ReservationQuote>(`/reservations/quotes/${encodeURIComponent(quoteId)}`);
}
