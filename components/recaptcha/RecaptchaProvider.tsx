'use client';

import type { ReactNode } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Wraps a form so it can call useGoogleReCaptcha().executeRecaptcha(action)
// on submit. Google's script loads only on pages that use it. The token must
// still be checked on the server (lib/recaptcha) or it protects nothing.
export function RecaptchaProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''}
      language='es'
      scriptProps={{ async: true, defer: true, appendTo: 'head' }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
