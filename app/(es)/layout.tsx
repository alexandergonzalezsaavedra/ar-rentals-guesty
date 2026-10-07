import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import { ProvidersUI } from '../heroproviders';
import Footer from '@/components/footer/footer';
import ClickBurst from '@/components/effects/ClickBurst';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = 'https://arrentals.com.co';
const DEFAULT_TITLE = 'AR Rentals – Rentas cortas en Colombia';
const DEFAULT_DESCRIPTION =
  'Le invitamos a explorar las propiedades más fascinantes. Hacemos de su estancia una experiencia única que le ofrecerá recuerdos inolvidables';
const DEFAULT_KEYWORDS = 'Rentas cortas';
const OG_IMAGE_URL = `${SITE_URL}/Imagen-web-AR.jpg`;

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: '%s | AR Rentals',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  icons: {
    icon: '/ar-construcciones.ico',
    shortcut: '/ar-construcciones.ico',
    apple: '/ar-construcciones.ico',
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'AR Rentals | Rentas cortas',
      },
    ],
    url: SITE_URL,
    siteName: 'AR Rentals',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='es'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light text-foreground bg-background`}
    >
      <link
        rel='icon'
        href='/ar-rentals-icon.png'
        sizes='192x192'
      ></link>

      <body className='min-h-full flex flex-col'>
        <ProvidersUI>
          <ClickBurst />
          {children}
          <footer>
            <Footer />
          </footer>
        </ProvidersUI>
      </body>
    </html>
  );
}
