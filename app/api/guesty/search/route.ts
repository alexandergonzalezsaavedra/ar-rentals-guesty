import { NextRequest, NextResponse } from 'next/server';
import { GuestyApiError } from '@/lib/guesty/client';
import { listAllListings, listListings } from '@/lib/guesty/listings';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const fetchAll = params.get('all') === 'true';

  const baseParams = {
    checkIn: params.get('checkIn') ?? undefined,
    checkOut: params.get('checkOut') ?? undefined,
    city: params.get('city') ?? undefined,
    country: params.get('country') ?? undefined,
    minOccupancy: params.get('minOccupancy') ?? undefined,
    numberOfBedrooms: params.get('numberOfBedrooms') ?? undefined,
    numberOfBathrooms: params.get('numberOfBathrooms') ?? undefined,
    minPrice: params.get('minPrice') ?? undefined,
    maxPrice: params.get('maxPrice') ?? undefined,
    includeAmenities: params.get('includeAmenities') ?? undefined,
    fields: params.get('fields') ?? undefined,
  };

  try {
    if (fetchAll) {
      const data = await listAllListings(baseParams);
      return NextResponse.json(data);
    }

    const data = await listListings({
      ...baseParams,
      limit: params.get('limit') ?? undefined,
      cursor: params.get('cursor') ?? undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GuestyApiError) {
      return NextResponse.json({ error: error.message, details: error.body }, { status: error.status });
    }

    console.error('Guesty search request failed', error);
    return NextResponse.json({ error: 'Unexpected error contacting Guesty' }, { status: 502 });
  }
}
