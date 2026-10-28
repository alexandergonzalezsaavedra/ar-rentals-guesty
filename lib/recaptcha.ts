// Server-side check of a reCAPTCHA v3 token: Google confirms it is genuine,
// was issued for the expected action and gives the visitor a score from 0.0
// (bot) to 1.0 (human). Without this check the token in the browser proves
// nothing.

/** Action names: the browser and the server must use the same one for each form. */
export const RESERVATION_RECAPTCHA_ACTION = 'reserva';

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
/** Google's recommended starting threshold; raise it if bots still get through. */
const MIN_SCORE = 0.5;

interface SiteVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  'error-codes'?: string[];
}

export async function verifyRecaptcha(token: unknown, expectedAction: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    // Not configured (e.g. a local copy without the key): don't block bookings over it.
    console.warn('RECAPTCHA_SECRET_KEY is not set; skipping reCAPTCHA verification');
    return true;
  }

  if (typeof token !== 'string' || !token) {
    return false;
  }

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
      cache: 'no-store',
    });
    const result = (await response.json()) as SiteVerifyResponse;

    if (!result.success || result.action !== expectedAction || (result.score ?? 0) < MIN_SCORE) {
      console.warn('reCAPTCHA rejected', {
        action: result.action,
        score: result.score,
        errors: result['error-codes'],
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('reCAPTCHA verification failed', error);
    return false;
  }
}
