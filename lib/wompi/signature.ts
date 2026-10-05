import { createHash, timingSafeEqual } from 'node:crypto';
import { wompiConfig } from './config';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Integrity signature the checkout widget requires, per
 * https://docs.wompi.co/docs/colombia/widget-checkout-web/
 * Must be computed server-side: it is what stops the amount from being
 * tampered with in the browser.
 */
export function buildIntegritySignature(reference: string, amountInCents: number, currency: string): string {
  return sha256(`${reference}${amountInCents}${currency}${wompiConfig.integritySecret}`);
}

export interface WompiEvent {
  event: string;
  data: Record<string, unknown>;
  environment: string;
  signature: { properties: string[]; checksum: string };
  timestamp: number;
  sent_at: string;
}

function readPath(source: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (current, key) =>
        current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined,
      source,
    );
}

/**
 * Validates a webhook event, per https://docs.wompi.co/docs/colombia/eventos/
 * The checksum is the SHA-256 of the values named in `signature.properties`
 * (read from `data`, in order), followed by the timestamp and the events secret.
 */
export function isValidEventChecksum(event: WompiEvent): boolean {
  const properties = event?.signature?.properties;
  const checksum = event?.signature?.checksum;

  if (!Array.isArray(properties) || typeof checksum !== 'string') {
    return false;
  }

  const values = properties.map((property) => String(readPath(event.data, property) ?? '')).join('');
  const expected = Buffer.from(sha256(`${values}${event.timestamp}${wompiConfig.eventsSecret}`));
  const received = Buffer.from(checksum.toLowerCase());

  return expected.length === received.length && timingSafeEqual(expected, received);
}
