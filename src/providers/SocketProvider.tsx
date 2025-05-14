//  src/providers/SocketProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/utils/socket";

const SocketCtx = createContext<Socket | null | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [sock, setSock] = useState<Socket | null>(null);

  useEffect(() => {
    let mounted = true;
    getSocket().then((s) => mounted && setSock(s));
    return () => {
      mounted = false;
      sock?.disconnect();
    };
  });

  return <SocketCtx.Provider value={sock}>{children}</SocketCtx.Provider>;
};

export const useSocket = (): Socket | null => {
  const ctx = useContext(SocketCtx);
  if (ctx === undefined)
    throw new Error("useSocket must be inside <SocketProvider>");
  return ctx; // may be null while connecting
};
