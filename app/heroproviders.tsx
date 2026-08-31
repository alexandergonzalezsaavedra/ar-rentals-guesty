'use client';
import { ToastProvider } from '@heroui/react';
import { Provider } from 'react-redux';
import { store } from '@/store';

export function ProvidersUI({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider placement='bottom' />
      {children}
    </Provider>
  );
}
