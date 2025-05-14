//  src/store/auth/token.ts

import { setCookie, getCookie } from "cookies-next";
import { JWT_KEY } from "@/config/cookies";
import { TOKEN_REFRESH_THRESHOLD } from "@/config/auth";
import { fetchGuestToken } from "./api";

/* ────────────────────────────────────────────────────────────────
   Internals
----------------------------------------------------------------- */
const isBrowser = typeof window !== "undefined";

type JwtPayload = { exp?: number; sub?: string };

function decode(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1]!));
  } catch {
    return null;
  }
}

function expired(token: string | null): boolean {
  if (!token) return true;
  const { exp } = decode(token) ?? {};
  if (!exp) return true;
  return Date.now() / 1000 >= exp - TOKEN_REFRESH_THRESHOLD;
}

async function saveBoth(token: string) {
  setCookie(JWT_KEY, token, {
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
  });
  try {
    if (isBrowser) localStorage.setItem(JWT_KEY, token);
  } catch {}
}

/* ────────────────────────────────────────────────────────────────
   Public helpers
----------------------------------------------------------------- */

/**
 * Return a valid JWT, refreshing if needed.
 */
export async function getJwt(force = false): Promise<string> {
  let token: string | null =
    force || !isBrowser
      ? null
      : localStorage.getItem(JWT_KEY) || (getCookie(JWT_KEY) as string | null);

  if (force || expired(token)) {
    token = await fetchGuestToken();
    await saveBoth(token);
  }
  return token!;
}

/**
 * Quick helper to extract `sub` (user id) – no network.
 */
export function getUserIdFromJwt(token: string | null): string | null {
  return decode(token ?? "")?.sub ?? null;
}
