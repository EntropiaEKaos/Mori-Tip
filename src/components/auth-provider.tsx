"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Me = {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  location: string | null;
  role: "user" | "host" | "guide" | "admin";
  hasChosenRole: boolean;
  isVerified: boolean;
  isPremium: boolean;
  premiumUntil: string | null;
  xp: number;
  level: number;
  moris: number;
  credits: number;
} | null;

type Ctx = {
  me: Me;
  loading: boolean;
  refresh: () => Promise<void>;
  setMe: (m: Me) => void;
};

const AuthCtx = createContext<Ctx>({ me: null, loading: true, refresh: async () => {}, setMe: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setMe(data ?? null);
      } else {
        setMe(null);
      }
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return <AuthCtx.Provider value={{ me, loading, refresh, setMe }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
