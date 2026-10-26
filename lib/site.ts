// Public identity of the site, shared by metadata, Open Graph and structured data.
// Social networks and search engines need absolute URLs, so everything that
// points at the site is built from SITE_URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaivencol.com').replace(/\/$/, '');
export const SITE_NAME = 'Vaivén';
export const SITE_TAGLINE = 'Cortas estadías en Colombia';
export const DEFAULT_DESCRIPTION =
  'Apartamentos y casas para estadías cortas en Santa Marta y otros destinos de Colombia. Consulte disponibilidad en tiempo real y reserve en línea.';

/** 1200x630 share image used when a page has no picture of its own. */
export const DEFAULT_OG_IMAGE = {
  url: '/og-vaiven.jpg',
  width: 1200,
  height: 630,
  alt: 'Vaivén, cortas estadías en Colombia',
};

/**
 * Guesty serves photos through Cloudinary, which resizes on the fly when a
 * transformation is put right after `/image/upload/`. WhatsApp, Facebook and
 * LinkedIn want a ~1200x630 JPEG under a few hundred KB; the originals are
 * larger and come without an image content type.
 */
export function shareImageFromGuesty(url: string): string {
  return url.includes('/image/upload/')
    ? url.replace('/image/upload/', '/image/upload/w_1200,h_630,c_fill,g_auto,q_auto:good,f_jpg/')
    : url;
}

/** Plain-text excerpt for meta descriptions: collapses whitespace and cuts at a word near `max`. */
export function excerpt(text: string, max = 155): string {
  const flat = text.replace(/\s+/g, ' ').trim();

  if (flat.length <= max) {
    return flat;
  }

  const cut = flat.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}
