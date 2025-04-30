// src/utils/socket.ts
import { io, Socket } from "socket.io-client";
import { getGuestId } from "./guest";

let socket: Socket | null = null;

/**
 * Initialize and return a singleton Socket.IO client.
 * Passes JWT from localStorage as auth token.
 */
export function getSocket(): Socket {
  if (socket) return socket;

  // Retrieve auth token however we decidevto store it (cookie/localStorage)
  // Use guest ID for anonymous testing
  const token = getGuestId();

  socket = io(process.env.NEXT_PUBLIC_VIRAGE_WS_URL || "ws://localhost:8000", {
    transports: ["websocket"],
    auth: {
      token,
    },
    reconnectionAttempts: 3,
    reconnectionDelay: 1000, //Automatically retries up to 3 tim...ection drops, waiting 1 second (1000 ms) between attempts. ?????
    timeout: 20000,
  });

  // log connection events
  socket.on("connect", () => console.log("WS connected:", socket?.id));
  socket.on("disconnect", (reason) => console.warn("WS disconnected:", reason));
  socket.on("connect_error", (err) => console.error("WS connect_error:", err));

  return socket;
}
