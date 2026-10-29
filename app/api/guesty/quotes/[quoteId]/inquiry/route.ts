import { NextRequest, NextResponse } from 'next/server';
import { GuestyApiError } from '@/lib/guesty/client';
import { submitReservationInquiry } from '@/lib/guesty/inquiry';
import { getReservationQuoteById } from '@/lib/guesty/quotes';
import { buildPricingBreakdown } from '@/lib/pricing';
import { RESERVATION_RECAPTCHA_ACTION, verifyRecaptcha } from '@/lib/recaptcha';
import { createPaymentToken } from '@/lib/wompi/checkout';
import { wompiConfig } from '@/lib/wompi/config';

// The amount to charge is read from Guesty's own quote, never from the
// browser. Returns null when it can't be worked out, in which case the
// reservation is still created and simply has no online payment step.
async function getAmountDue(quoteId: string, ratePlanId: string) {
  try {
    const quote = await getReservationQuoteById(quoteId);
    const ratePlan = quote.rates.ratePlans.find((plan) => plan.ratePlan._id === ratePlanId);

    if (!ratePlan) {
      return null;
    }

    const pricing = buildPricingBreakdown(ratePlan.ratePlan.money, ratePlan.days.length, quote.guestsCount);

    return { amountInCents: Math.round(pricing.total * 100), currency: pricing.currency };
  } catch (error) {
    console.error('Could not read Guesty quote to build the payment', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext<'/api/guesty/quotes/[quoteId]/inquiry'>
) {
  const { quoteId } = await params;
  const body = await request.json().catch(() => null);

  const ratePlanId = typeof body?.ratePlanId === 'string' ? body.ratePlanId.trim() : '';
  const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : '';
  const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const specialRequests = typeof body?.specialRequests === 'string' ? body.specialRequests.trim() : undefined;
  const acceptPrivacy = body?.acceptPrivacy === true;
  const acceptMarketing = body?.acceptMarketing === true;

  if (!ratePlanId || !firstName || !lastName || !email || !phone || !acceptPrivacy) {
    return NextResponse.json(
      { error: 'Plan de tarifa, nombre, apellido, correo, teléfono y la aceptación de la política de privacidad son obligatorios' },
      { status: 400 }
    );
  }

  // Checked before anything reaches Guesty, so bots can't create reservations.
  if (!(await verifyRecaptcha(body?.recaptchaToken, RESERVATION_RECAPTCHA_ACTION))) {
    return NextResponse.json(
      { error: 'No pudimos verificar que la solicitud es legítima. Recarga la página e intenta de nuevo.' },
      { status: 403 }
    );
  }

  try {
    const amountDue = await getAmountDue(quoteId, ratePlanId);

    const reservation = await submitReservationInquiry({
      quoteId,
      ratePlanId,
      firstName,
      lastName,
      email,
      phone,
      specialRequests,
      acceptPrivacy,
      acceptMarketing,
    });

    let payment = null;

    if (amountDue) {
      try {
        payment = {
          ...amountDue,
          token: createPaymentToken({ confirmationCode: reservation.confirmationCode, ...amountDue }),
          mode: wompiConfig.hasIntegritySecret ? 'widget' : 'link',
        };
      } catch (error) {
        console.error('Wompi payment could not be prepared', error);
      }
    }

    return NextResponse.json({ reservation, payment });
  } catch (error) {
    if (error instanceof GuestyApiError) {
      // Guesty's reason (expired quote, dates taken, invalid field...) is in the body.
      console.error('Guesty rejected the reservation inquiry', { quoteId, status: error.status, body: error.body });
      return NextResponse.json({ error: error.message, details: error.body }, { status: error.status });
    }

    console.error('Guesty reservation inquiry failed', error);
    return NextResponse.json({ error: 'Unexpected error contacting Guesty' }, { status: 502 });
  }
}
