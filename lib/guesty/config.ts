function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const guestyConfig = {
  tokenUrl: process.env.GUESTY_BE_TOKEN_URL ?? 'https://booking.guesty.com/oauth2/token',
  apiBaseUrl: process.env.GUESTY_BE_API_BASE_URL ?? 'https://booking.guesty.com/api',
  accountId: process.env.GUESTY_ACCOUNT_ID ?? '6a32d810df13a890fa85e1b4',
  get clientId(): string {
    return required('GUESTY_BE_CLIENT_ID');
  },
  get clientSecret(): string {
    return required('GUESTY_BE_CLIENT_SECRET');
  },
};
