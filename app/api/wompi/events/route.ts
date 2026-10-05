import { NextRequest, NextResponse } from 'next/server';
import { isValidEventChecksum, type WompiEvent } from '@/lib/wompi/signature';

// Webhook Wompi calls when a transaction changes state. Register this URL in
// the Wompi dashboard as the "URL de eventos". For now it only authenticates
// and logs the event: marking the reservation as paid in Guesty needs Open API
// access the project doesn't have yet.
export async function POST(request: NextRequest) {
  const event = (await request.json().catch(() => null)) as WompiEvent | null;

  if (!event || !isValidEventChecksum(event)) {
    return NextResponse.json({ error: 'Invalid checksum' }, { status: 401 });
  }

  if (event.event === 'transaction.updated') {
    const transaction = event.data.transaction as
      | { id?: string; reference?: string; status?: string; amount_in_cents?: number }
      | undefined;

    console.info('Wompi transaction updated', {
      id: transaction?.id,
      reference: transaction?.reference,
      status: transaction?.status,
      amountInCents: transaction?.amount_in_cents,
    });
  }

  return NextResponse.json({ received: true });
}
