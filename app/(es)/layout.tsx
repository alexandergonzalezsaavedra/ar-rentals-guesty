import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import { ProvidersUI } from '../heroproviders';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import Footer from '@/components/footer/footer';
import ClickBurst from '@/components/effects/ClickBurst';
import CursorFluid from '@/components/effects/CursorFluid';
import SiteCursor from '@/components/effects/SiteCursor';
import PendingPaymentBanner from '@/components/listings/PendingPaymentBanner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Pages refine this with their own title, description, image and canonical
// URL through pageMetadata(); everything here is the fallback.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  ...pageMetadata({ locale: 'es_CO' }),
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='es'
      // Lets Next switch off the smooth scroll from globals.css while navigating,
      // so a new page opens at its top instead of gliding (and stalling) mid-way.
      data-scroll-behavior='smooth'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light text-foreground bg-background`}
    >
      <body className='min-h-full flex flex-col'>
        <ProvidersUI>
          <ClickBurst />
          <CursorFluid />
          <SiteCursor />
          <PendingPaymentBanner />
          {children}
          <footer>
            <Footer />
          </footer>
        </ProvidersUI>
      </body>
    </html>
  );
}
