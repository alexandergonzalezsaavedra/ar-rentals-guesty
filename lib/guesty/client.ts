import { guestyConfig } from './config';
import { getGuestyAccessToken } from './token';

export class GuestyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = 'GuestyApiError';
  }
}

export async function guestyFetch<T>(
  path: string,
  searchParams?: Record<string, string | undefined>
): Promise<T> {
  const accessToken = await getGuestyAccessToken();

  const base = guestyConfig.apiBaseUrl.replace(/\/$/, '');
  const url = new URL(`${base}${path}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: 'application/json',
    },
  });

  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new GuestyApiError(`Guesty API request failed: ${response.status}`, response.status, body);
  }

  return body as T;
}

export async function guestyPost<T>(path: string, payload: unknown): Promise<T> {
  const accessToken = await getGuestyAccessToken();

  const base = guestyConfig.apiBaseUrl.replace(/\/$/, '');

  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new GuestyApiError(`Guesty API request failed: ${response.status}`, response.status, body);
  }

  return body as T;
}
