function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const wompiConfig = {
  get publicKey(): string {
    const value = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

    if (!value) {
      throw new Error('Missing required environment variable: NEXT_PUBLIC_WOMPI_PUBLIC_KEY');
    }

    return value;
  },
  get privateKey(): string {
    return required('WOMPI_PRIVATE_KEY');
  },
  // The checkout widget can't open without the integrity secret; when it's
  // missing, payments fall back to a Wompi-hosted payment link instead.
  get hasIntegritySecret(): boolean {
    return Boolean(process.env.WOMPI_INTEGRITY_SECRET);
  },
  get integritySecret(): string {
    return required('WOMPI_INTEGRITY_SECRET');
  },
  get eventsSecret(): string {
    return required('WOMPI_EVENTS_SECRET');
  },
  // Sandbox and production are separate hosts; the key prefix says which one
  // the configured credentials belong to.
  get apiBaseUrl(): string {
    return this.publicKey.startsWith('pub_test_')
      ? 'https://sandbox.wompi.co/v1'
      : 'https://production.wompi.co/v1';
  },
};
