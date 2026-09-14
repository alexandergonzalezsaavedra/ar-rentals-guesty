'use client';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { Provider } from 'react-redux';
import { store } from '@/store';

export function ProvidersUI({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <HeroUIProvider locale='es-CO'>
        <ToastProvider placement='bottom-center' />
        {children}
      </HeroUIProvider>
    </Provider>
  );
}
