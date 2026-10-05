import { createHmac, timingSafeEqual } from 'node:crypto';
import { wompiConfig } from './config';
import { buildIntegritySignature } from './signature';

export interface PaymentIntent {
  confirmationCode: string;
  amountInCents: number;
  currency: string;
}

export interface WompiCheckout {
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency: string;
  signature: string;
}

function sign(payload: string): string {
  return createHmac('sha256', wompiConfig.privateKey).update(payload).digest('base64url');
}

/**
 * The project has no database, so the amount owed for a reservation travels
 * through the browser inside this token. The HMAC keeps it from being edited
 * on the way back: the checkout endpoint only signs what the server itself
 * computed from the Guesty quote.
 */
export function createPaymentToken(intent: PaymentIntent): string {
  const payload = Buffer.from(JSON.stringify(intent)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readPaymentToken(token: string): PaymentIntent | null {
  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()) as PaymentIntent;
  } catch {
    return null;
  }
}

// Wompi rejects a reference it has already seen, even on a declined
// transaction, so every attempt gets its own suffix. The confirmation code
// stays as the prefix so a payment can be matched to its Guesty reservation.
export function buildCheckout(intent: PaymentIntent): WompiCheckout {
  const reference = `${intent.confirmationCode}-${Date.now().toString(36)}`;

  return {
    publicKey: wompiConfig.publicKey,
    reference,
    amountInCents: intent.amountInCents,
    currency: intent.currency,
    signature: buildIntegritySignature(reference, intent.amountInCents, intent.currency),
  };
}

// A dropped connection to Wompi shouldn't cost the guest their payment step,
// so network-level failures get a couple more tries before giving up.
async function fetchWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(url, init);
    } catch (error) {
      if (attempt >= attempts) {
        throw error;
      }
    }
  }
}

/**
 * Creates a single-use payment link, per
 * https://docs.wompi.co/docs/colombia/links-de-pago/
 * Unlike the widget it only needs the private key. Wompi generates its own
 * transaction reference for links, so the confirmation code goes in `sku`
 * and in the name to keep the payment traceable to the Guesty reservation.
 * `redirectUrl` is where Wompi sends the buyer when the payment ends.
 */
export async function createPaymentLink(intent: PaymentIntent, redirectUrl: string): Promise<string> {
  const response = await fetchWithRetry(`${wompiConfig.apiBaseUrl}/payment_links`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${wompiConfig.privateKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      name: `Reserva ${intent.confirmationCode}`,
      description: `Pago de la reserva ${intent.confirmationCode} en AR Rentals`,
      single_use: true,
      collect_shipping: false,
      currency: intent.currency,
      amount_in_cents: intent.amountInCents,
      sku: intent.confirmationCode,
      redirect_url: redirectUrl,
    }),
  });

  const body = await response.json().catch(() => undefined);

  if (!response.ok || typeof body?.data?.id !== 'string') {
    throw new Error(`Wompi payment link request failed: ${response.status} ${JSON.stringify(body)}`);
  }

  return `https://checkout.wompi.co/l/${body.data.id}`;
}
