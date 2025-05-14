// src/providers/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getJwt, getUserIdFromJwt } from "@/store/auth/token";

interface AuthContextValue {
  token: string | null;
  userId: string | null;
  loading: boolean;
  refresh: (force?: boolean) => Promise<void>;
}

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async (force = false) => {
    const t = await getJwt(force);
    setToken(t);
    setUserId(getUserIdFromJwt(t));
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AuthCtx.Provider value={{ token, userId, loading, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthCtx);
  if (!ctx)
    throw new Error("useAuth must be used within an <AuthProvider> tree");
  return ctx;
};
