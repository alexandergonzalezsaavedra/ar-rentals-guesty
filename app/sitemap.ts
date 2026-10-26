import type { MetadataRoute } from 'next';
import { listAllListings } from '@/lib/guesty/listings';
import { buildCitySlug, buildTitleSlug } from '@/lib/guesty/slug';
import { SITE_URL } from '@/lib/site';

// Rebuilt at most once an hour, so new Guesty listings show up without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/alojamiento`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/lugares-turisticos`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/destinos`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const { results } = await listAllListings({});

    for (const listing of results) {
      pages.push({
        url: `${SITE_URL}/alojamiento/${buildCitySlug(listing)}/${buildTitleSlug(listing)}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch (error) {
    // Without Guesty the static pages are still worth listing.
    console.error('sitemap: failed to load Guesty listings', error);
  }

  return pages;
}
