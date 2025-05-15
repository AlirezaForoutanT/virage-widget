//  src/utils/socket.ts
import { io, Socket } from "socket.io-client";
import { WS_URL, RECONNECT_DELAY } from "@/config/socket";
import { getJwt } from "@/store/auth/token";
import { Error } from "@/common/interfaces/error.interface";
import { ErrorCode } from "@/common/error-codes";
let socketPromise: Promise<Socket> | null = null;

async function makeSocket(): Promise<Socket> {
  const token = await getJwt();
  const sock: Socket = io(WS_URL, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { token },
  });

  return new Promise<Socket>((resolve) => {
    sock.on("connect", () => {
      console.log("[ws] connected", sock.id);
      resolve(sock);
    });
    sock.on("connect_error", console.error);
    sock.on("error", async (data: Error) => {
      if (data.code === ErrorCode.AUTH_TOKEN_EXPIRED) {
        const fresh = await getJwt(true);
        sock.auth = { token: fresh };
        sock.disconnect();
        setTimeout(() => sock.connect(), RECONNECT_DELAY);
      }
    });
    sock.connect();
  });
}

export const getSocket = (): Promise<Socket> =>
  socketPromise ?? (socketPromise = makeSocket());
