import type { ConsentCategory } from '@/lib/storage';

const OPEN_EVENT = 'vaiven:open-cookie-settings';

/** Opens the cookie settings window from anywhere (footer, terms page, "Mis datos"). */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookieSettings(listener: () => void): () => void {
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
}

/** What each category does, as shown in the settings window and on the terms page. */
export const CONSENT_COPY: Record<ConsentCategory, { title: string; description: string }> = {
  functional: {
    title: 'Cookies de funcionalidad',
    description:
      'Guardan tus preferencias, como el tema visual, tu lista de favoritos y las reservas pendientes de pago. Son esenciales y no pueden desactivarse.',
  },
  security: {
    title: 'Cookies de seguridad',
    description:
      'Protegen tu información, ayudan a detectar actividades sospechosas y garantizan una navegación y un pago seguros. No pueden desactivarse.',
  },
  personalization: {
    title: 'Cookies de personalización',
    description:
      'Recuerdan tus búsquedas y las propiedades que has visto para mostrarte alojamientos acordes a lo que buscas. Son necesarias y no pueden desactivarse.',
  },
  personalData: {
    title: 'Cookies de datos personales',
    description:
      'Usamos los datos que ingresas al reservar (nombre, correo y teléfono) para completar el formulario automáticamente la próxima vez. Son necesarias y no pueden desactivarse.',
  },
  location: {
    title: 'Cookies de ubicación',
    description:
      'Usamos tu ubicación (ciudad, región y país) para ofrecerte sugerencias y contenidos relevantes según tu zona. Tu navegador te pedirá permiso.',
  },
  advertising: {
    title: 'Cookies de publicidad',
    description:
      'Nos permiten mostrarte anuncios relevantes basados en tus intereses y en las propiedades que visitas. Pueden provenir de terceros asociados.',
  },
  adTracking: {
    title: 'Cookies de seguimiento publicitario',
    description:
      'Registran las páginas que visitas, tu tipo de dispositivo y la campaña por la que llegaste, para medir la efectividad de nuestra publicidad.',
  },
};
