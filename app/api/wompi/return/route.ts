import { NextRequest } from 'next/server';
import { wompiConfig } from '@/lib/wompi/config';

const STATUSES = ['APPROVED', 'DECLINED', 'VOIDED', 'ERROR', 'PENDING'];

// Wompi sends the buyer here (inside the payment modal's iframe) once the
// payment link flow ends, with the transaction id in `?id=`. The page only
// relays the outcome to the reservation page that opened the modal.
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? '';
  let status = 'PENDING';

  try {
    const response = await fetch(`${wompiConfig.apiBaseUrl}/transactions/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
    const body = await response.json();

    if (STATUSES.includes(body?.data?.status)) {
      status = body.data.status;
    }
  } catch (error) {
    console.error('Could not read Wompi transaction', error);
  }

  const html = `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /><title>Pago</title></head>
  <body style="font-family: sans-serif; text-align: center; padding: 2rem">
    <p>Procesando el resultado de tu pago…</p>
    <script>
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'wompi-payment-result', status: '${status}' }, window.location.origin);
      } else {
        window.location.replace('/');
      }
    </script>
  </body>
</html>`;

  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
