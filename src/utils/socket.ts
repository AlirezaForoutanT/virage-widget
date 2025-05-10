import { io, Socket } from 'socket.io-client';
import { getJwt } from './guestToken';

let socketPromise: Promise<Socket> | null = null;

/**
 * Get a singleton Socket.IO client.
 * Always resolves to a *connected* socket with a valid JWT in its auth payload.
 */
export async function getSocket(): Promise<Socket> {
  if (socketPromise) return socketPromise;

  socketPromise = (async () => {
    const url =
      process.env.NEXT_PUBLIC_VIRAGE_WS_URL ?? 'ws://localhost:8000';
    const token = await getJwt();

    const sock = io(url, {
      transports: ['websocket'],
      auth: { token },
      timeout: 20_000,
      reconnectionAttempts: 3,
      reconnectionDelay: 1_000,
    });

    // ── Logging helpers
    sock.once('connect', () => console.log('[ws] connected', sock.id));
    sock.on('disconnect', (reason) =>
      console.warn('[ws] disconnected:', reason),
    );
    sock.on('connect_error', (err) =>
      console.error('[ws] connect_error:', err),
    );

    /**
     * If the backend emits `"Invalid or expired token"`, transparently refresh and reconnect.
     */
    sock.on('error', async (msg: unknown) => {
      if (msg === 'Invalid or expired token') {
        console.info('[ws] token expired – refreshing…');
        const fresh = await getJwt(true); // force refresh
        // You can’t change auth mid‑flight, so disconnect then reconnect
        sock.auth = { token: fresh };
        sock.disconnect();
        sock.connect();
      }
    });

    return sock;
  })();

  return socketPromise;
}
