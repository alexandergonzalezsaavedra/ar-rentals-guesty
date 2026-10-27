'use client';

import type { ReactNode } from 'react';
import { openCookieSettings } from './cookieSettings';

/** Opens the cookie settings window; for server-rendered pages and the footer. */
const CookieSettingsButton = ({ className, children }: { className?: string; children: ReactNode }) => (
  <button
    type='button'
    onClick={openCookieSettings}
    className={className}
  >
    {children}
  </button>
);

export default CookieSettingsButton;
