import { slugify } from '@/lib/slugify';

interface SluggableListing {
  _id: string;
  title: string;
  address: { city: string };
}

/**
 * URL slug for a listing's city, e.g. "gaira".
 * URL slug for a listing's name, e.g. "moderno-loft-pet-friendly-con-balcon".
 *
 * Kept in their own module (no dependency on client.ts/token.ts) so they're safe
 * to import from Client Components without pulling Node-only code (fs, path)
 * into the browser bundle.
 */
export function buildCitySlug(listing: SluggableListing): string {
  return slugify(listing.address.city);
}

export function buildTitleSlug(listing: SluggableListing): string {
  return slugify(listing.title);
}

/**
 * Finds the listing whose city/title slugs match the URL segments. The url has
 * no id in it, so this is a linear scan over the catalog — acceptable given the
 * catalog size, and it keeps URLs clean as the user asked. If two listings ever
 * slugify to the same city+title, the first match wins.
 */
export function findListingBySlug<T extends SluggableListing>(
  listings: T[],
  citySlug: string,
  titleSlug: string
): T | undefined {
  return listings.find((listing) => buildCitySlug(listing) === citySlug && buildTitleSlug(listing) === titleSlug);
}
