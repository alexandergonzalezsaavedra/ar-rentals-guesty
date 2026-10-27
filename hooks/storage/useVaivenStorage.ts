'use client';

import { useEffect, useState } from 'react';
import { onStorageChange, readStorage, type VaivenStorage } from '@/lib/storage';

/** The visitor's stored data, kept in sync across components and tabs. Null until mounted (storage is browser-only). */
export function useVaivenStorage(): VaivenStorage | null {
  const [data, setData] = useState<VaivenStorage | null>(null);

  useEffect(() => {
    const sync = () => setData(readStorage());

    sync();
    return onStorageChange(sync);
  }, []);

  return data;
}
