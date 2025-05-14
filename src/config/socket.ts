export const WS_URL =
  process.env.NEXT_PUBLIC_VIRAGE_WS_URL ?? 'ws://localhost:8000';

/** ms to wait before reconnect() after token refresh. */
export const RECONNECT_DELAY = 250;
