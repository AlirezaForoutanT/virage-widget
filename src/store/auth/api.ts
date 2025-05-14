//  src/store/auth/api.ts

import { JWT_KEY } from "@/config/cookies";

interface GuestTokenResponse {
  token: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_VIRAGE_API_URL ?? "http://localhost:3000";

/**
 * POST /auth/guest → returns a short-lived JWT
 */
export async function fetchGuestToken(): Promise<string> {
  const r = await fetch(`${API_BASE}/auth/guest`, { method: "POST" });
  if (!r.ok) throw new Error(`guest token fetch failed: ${r.status}`);
  const { token } = (await r.json()) as GuestTokenResponse;

  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(JWT_KEY, token);
    }
  } catch {}
  return token;
}
