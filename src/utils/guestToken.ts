// src/utils/guest.ts
// import { v4 as uuidv4 } from 'uuid';

/**
 * Local‑storage key where we keep the JWT between page loads.
 */
const STORAGE_KEY = 'virage_jwt';

/**
 * Decode the JWT payload without verifying the signature.
 * We only need `exp` to know when to refresh.
 */
function decodePayload(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Is the token missing or about to expire (<= 30 s threshold)?
 */
function isExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodePayload(token);
  if (!payload?.exp) return true;
  const now = Date.now() / 1000;
  return now >= payload.exp - 30;
}

/**
 * Fetch a signed *guest* JWT from the backend.
 * Endpoint must reply `{ "token": "…" }`.
 */
async function fetchGuestToken(): Promise<string> {
  const api =
    process.env.NEXT_PUBLIC_VIRAGE_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${api}/auth/guest`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to fetch guest token (${res.status})`);
  const { token } = (await res.json()) as { token: string };
  return token;
}

/**
 * Return a **valid** JWT for the current visitor.
 * – if they’re logged‑in, Auth flow should have put the user‑JWT
 *   into `localStorage.setItem('virage_jwt', token)`.
 * – otherwise we fetch (or refresh) a *guest* JWT on demand.
 */
export async function getJwt(forceRefresh = false): Promise<string> {
  if (typeof window === 'undefined') {
    return 'guest-server';
  }

  let token = localStorage.getItem(STORAGE_KEY);

  if (forceRefresh || isExpired(token)) {
    try {
      token = await fetchGuestToken();
      localStorage.setItem(STORAGE_KEY, token);
    } catch (err) {
      console.error('[guestToken] fetch failed, using fallback uuid', err);
      // token = `guest-${uuidv4()}`; //  won’t pass the guard – only for dev
    }
  }

  return token!;
}
