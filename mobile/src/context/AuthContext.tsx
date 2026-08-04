import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

type Me = {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: "user" | "host" | "guide" | "admin";
  isPremium: boolean;
  level: number;
  moris: number;
  credits: number;
} | null;

type Ctx = {
  me: Me;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  me: null, loading: true, refresh: async () => {},
  login: async () => {}, loginWithPhone: async () => {}, logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get("/api/auth/me");
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const login = async (identifier: string, password: string) => {
    const data = await api.post("/api/auth/login", { identifier, password });
    await api.setToken(data.token || "");
    await refresh();
  };

  const loginWithPhone = async (phoneNumber: string, otp: string) => {
    const data = await api.post("/api/auth/phone", { phoneNumber, otp, isMock: true });
    await api.setToken(data.token || "");
    await refresh();
  };

  const logout = async () => {
    try { await api.post("/api/auth/logout", {}); } catch {}
    await api.clearToken();
    setMe(null);
  };

  return (
    <AuthCtx.Provider value={{ me, loading, refresh, login, loginWithPhone, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
