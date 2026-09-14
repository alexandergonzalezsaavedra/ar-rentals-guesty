import { NextRequest, NextResponse } from 'next/server';
import { GuestyApiError } from '@/lib/guesty/client';
import { getReservationQuote } from '@/lib/guesty/quotes';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const listingId = typeof body?.listingId === 'string' ? body.listingId : undefined;
  const checkIn = typeof body?.checkIn === 'string' ? body.checkIn : undefined;
  const checkOut = typeof body?.checkOut === 'string' ? body.checkOut : undefined;
  const adults = typeof body?.adults === 'number' ? body.adults : undefined;
  const children = typeof body?.children === 'number' ? body.children : undefined;

  if (!listingId || !checkIn || !checkOut || !adults) {
    return NextResponse.json({ error: 'listingId, checkIn, checkOut y adults son obligatorios' }, { status: 400 });
  }

  try {
    const quote = await getReservationQuote({ listingId, checkIn, checkOut, adults, children });
    return NextResponse.json({ quote });
  } catch (error) {
    if (error instanceof GuestyApiError) {
      return NextResponse.json({ error: error.message, details: error.body }, { status: error.status });
    }

    console.error('Guesty quote request failed', error);
    return NextResponse.json({ error: 'Unexpected error contacting Guesty' }, { status: 502 });
  }
}
