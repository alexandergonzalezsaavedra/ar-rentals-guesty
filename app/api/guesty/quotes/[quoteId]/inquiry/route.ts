import { NextRequest, NextResponse } from 'next/server';
import { GuestyApiError } from '@/lib/guesty/client';
import { submitReservationInquiry } from '@/lib/guesty/inquiry';

export async function POST(
  request: NextRequest,
  { params }: RouteContext<'/api/guesty/quotes/[quoteId]/inquiry'>
) {
  const { quoteId } = await params;
  const body = await request.json().catch(() => null);

  const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : '';
  const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const specialRequests = typeof body?.specialRequests === 'string' ? body.specialRequests.trim() : undefined;
  const acceptPrivacy = body?.acceptPrivacy === true;
  const acceptMarketing = body?.acceptMarketing === true;

  if (!firstName || !lastName || !email || !phone || !acceptPrivacy) {
    return NextResponse.json(
      { error: 'Nombre, apellido, correo, teléfono y la aceptación de la política de privacidad son obligatorios' },
      { status: 400 }
    );
  }

  try {
    const reservation = await submitReservationInquiry({
      quoteId,
      firstName,
      lastName,
      email,
      phone,
      specialRequests,
      acceptPrivacy,
      acceptMarketing,
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    if (error instanceof GuestyApiError) {
      return NextResponse.json({ error: error.message, details: error.body }, { status: error.status });
    }

    console.error('Guesty reservation inquiry failed', error);
    return NextResponse.json({ error: 'Unexpected error contacting Guesty' }, { status: 502 });
  }
}
