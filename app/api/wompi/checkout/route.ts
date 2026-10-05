import { NextRequest, NextResponse } from 'next/server';
import { buildCheckout, createPaymentLink, readPaymentToken } from '@/lib/wompi/checkout';
import { wompiConfig } from '@/lib/wompi/config';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';

  try {
    const intent = readPaymentToken(token);

    if (!intent) {
      return NextResponse.json({ error: 'El enlace de pago no es válido' }, { status: 400 });
    }

    if (wompiConfig.hasIntegritySecret) {
      return NextResponse.json({ checkout: buildCheckout(intent) });
    }

    return NextResponse.json({
      url: await createPaymentLink(intent, `${request.nextUrl.origin}/api/wompi/return`),
    });
  } catch (error) {
    console.error('Wompi checkout signing failed', error);
    return NextResponse.json({ error: 'No pudimos iniciar el pago' }, { status: 500 });
  }
}
