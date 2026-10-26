import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // API routes and the per-guest booking steps have nothing to index.
      disallow: ['/api/', '/alojamiento/*/*/reservar'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
