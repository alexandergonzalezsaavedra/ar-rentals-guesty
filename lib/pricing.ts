import type { ReservationQuoteMoney } from '@/lib/guesty/quotes';

export interface PricingBreakdown {
  nights: number;
  totalGuests: number;
  baseAccommodation: number;
  discount: number;
  cleaningFee: number;
  taxes: number;
  currency: string;
  total: number;
}

// Every figure here comes straight from Guesty's own quote response — no
// invented surcharges or fee schedules get layered on top. `nights` and
// `totalGuests` are only carried through for display (e.g. "5 huéspedes ·
// 3 noches"); they don't feed into any of the money math.
export function buildPricingBreakdown(
  money: ReservationQuoteMoney,
  nights: number,
  totalGuests: number,
): PricingBreakdown {
  const accommodationAdjusted = money.fareAccommodationAdjusted ?? money.fareAccommodation;
  const discount = money.fareAccommodation - accommodationAdjusted;
  const cleaningFee = money.fareCleaning ?? 0;

  return {
    nights,
    totalGuests,
    baseAccommodation: money.fareAccommodation,
    discount,
    cleaningFee,
    taxes: money.totalTaxes,
    currency: money.currency,
    total: money.subTotalPrice + money.totalTaxes,
  };
}
