import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { guestyConfig } from './config';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

interface GuestyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Guesty's own reference implementation caches the token to disk and reuses it
// until it's close to expiring, to stay well under their daily token-issuance quota.
// We do the same, plus keep it on `globalThis` so a single server process only
// ever holds one in-flight request even if many requests arrive at once (and so
// the cache survives Next.js dev-server module reloads, which would otherwise
// silently reset a plain module-level variable and burn quota on every edit).
const CACHE_FILE = path.join(process.cwd(), '.cache', 'guesty-token.json');

interface GlobalTokenState {
  cache: TokenCache | null;
  pending: Promise<TokenCache> | null;
}

function getGlobalState(): GlobalTokenState {
  const g = globalThis as typeof globalThis & { __guestyTokenState?: GlobalTokenState };

  if (!g.__guestyTokenState) {
    g.__guestyTokenState = { cache: null, pending: null };
  }

  return g.__guestyTokenState;
}

async function readCacheFile(): Promise<TokenCache | null> {
  try {
    const raw = await readFile(CACHE_FILE, 'utf8');
    return JSON.parse(raw) as TokenCache;
  } catch {
    return null;
  }
}

async function writeCacheFile(cache: TokenCache): Promise<void> {
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(cache), 'utf8');
}

function isValid(cache: TokenCache | null): cache is TokenCache {
  return cache !== null && Date.now() < cache.expiresAt;
}

async function fetchAccessToken(): Promise<TokenCache> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'booking_engine:api',
    client_id: guestyConfig.clientId,
    client_secret: guestyConfig.clientSecret,
  });

  const response = await fetch(guestyConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Guesty token request failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as GuestyTokenResponse;

  return {
    accessToken: data.access_token,
    // Refresh 5 minutes early, per Guesty's recommended pattern.
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };
}

export async function getGuestyAccessToken(): Promise<string> {
  const state = getGlobalState();

  if (isValid(state.cache)) {
    return state.cache.accessToken;
  }

  const fromDisk = await readCacheFile();

  if (isValid(fromDisk)) {
    state.cache = fromDisk;
    return fromDisk.accessToken;
  }

  // Multiple concurrent requests can land here at once with no valid token;
  // make sure they all await the same fetch instead of each requesting one.
  if (!state.pending) {
    state.pending = fetchAccessToken()
      .then(async (cache) => {
        state.cache = cache;
        await writeCacheFile(cache);
        return cache;
      })
      .finally(() => {
        state.pending = null;
      });
  }

  const cache = await state.pending;
  return cache.accessToken;
}
