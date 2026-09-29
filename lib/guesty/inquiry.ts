import { guestyPost } from './client';

export interface ReservationInquiryParams {
  quoteId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  acceptPrivacy: boolean;
  acceptMarketing: boolean;
}

export interface ReservationInquiryResult {
  _id: string;
  status: string;
  confirmationCode: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
}

/**
 * Step 2 of Guesty's documented reservation creation flow (the "inquiry"
 * option, as opposed to "instant"): submits guest details against a quote
 * already created via getReservationQuote. Lives on the same OAuth-protected
 * Booking Engine API as the quote itself, per
 * https://booking-api-docs.guesty.com/docs/new-reservation-creation-flow
 */
export async function submitReservationInquiry(
  params: ReservationInquiryParams
): Promise<ReservationInquiryResult> {
  return guestyPost<ReservationInquiryResult>(`/reservations/quotes/${encodeURIComponent(params.quoteId)}/inquiry`, {
    ratePlanId: 'default-rateplan-id',
    guest: {
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phone,
      preferredLanguage: 'es',
      email: params.email,
    },
    policy: {
      privacy: {
        version: 1,
        dateOfAcceptance: new Date().toISOString().slice(0, 10),
        isAccepted: params.acceptPrivacy,
      },
      marketing: { isAccepted: params.acceptMarketing },
    },
    notes: { specialRequests: params.specialRequests ?? '' },
  });
}
