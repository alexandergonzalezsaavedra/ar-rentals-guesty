'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const RevealContext = createContext<boolean | null>(null);

interface RevealProviderProps {
  children: ReactNode;
  delayMs?: number;
}

export function RevealProvider({ children, delayMs = 2000 }: RevealProviderProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return <RevealContext.Provider value={revealed}>{children}</RevealContext.Provider>;
}

// null means "no RevealProvider ancestor" — callers should treat that as already revealed.
export function useReveal(): boolean | null {
  return useContext(RevealContext);
}
