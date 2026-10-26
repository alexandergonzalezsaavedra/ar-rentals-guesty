import type { Metadata } from 'next';
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME, SITE_TAGLINE } from './site';

interface PageMetadataOptions {
  /** Page title without the brand; the layout's template appends "| Vaivén". */
  title?: string;
  description?: string;
  /** Path of the page (no query string), used as canonical and og:url. */
  path?: string;
  image?: { url: string; width?: number; height?: number; alt?: string };
  locale?: string;
}

// Next replaces `openGraph` and `twitter` as whole objects when a page sets
// them, instead of merging with the layout's. So every page builds both from
// here, and the brand defaults (site name, locale, fallback image) are never
// lost on the way.
export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  locale = 'es_CO',
}: PageMetadataOptions): Metadata {
  const shareTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – ${SITE_TAGLINE}`;

  return {
    ...(title ? { title } : {}),
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale,
      title: shareTitle,
      description,
      ...(path ? { url: path } : {}),
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [image.url],
    },
  };
}
