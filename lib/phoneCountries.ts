export interface PhoneCountry {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: 'CO', name: 'Colombia', dialCode: '57', flag: '🇨🇴' },
  { code: 'MX', name: 'México', dialCode: '52', flag: '🇲🇽' },
  { code: 'PE', name: 'Perú', dialCode: '51', flag: '🇵🇪' },
  { code: 'EC', name: 'Ecuador', dialCode: '593', flag: '🇪🇨' },
  { code: 'PA', name: 'Panamá', dialCode: '507', flag: '🇵🇦' },
  { code: 'CL', name: 'Chile', dialCode: '56', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', dialCode: '54', flag: '🇦🇷' },
  { code: 'US', name: 'Estados Unidos', dialCode: '1', flag: '🇺🇸' },
  { code: 'ES', name: 'España', dialCode: '34', flag: '🇪🇸' },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];
