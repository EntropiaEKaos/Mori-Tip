import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_BASE = Platform.OS === "web"
  ? ""
  : "https://mori.app.br";

export const api = {
  async get(path: string) {
    return this.request(path, { method: "GET" });
  },
  async post(path: string, body: unknown) {
    return this.request(path, { method: "POST", body: JSON.stringify(body) });
  },
  async patch(path: string, body: unknown) {
    return this.request(path, { method: "PATCH", body: JSON.stringify(body) });
  },
  async delete(path: string) {
    return this.request(path, { method: "DELETE" });
  },
  async request(path: string, init: RequestInit) {
    const token = await AsyncStorage.getItem("mori_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };
    if (token) headers["Cookie"] = `mori_session=${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: "include" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
  async setToken(token: string) {
    await AsyncStorage.setItem("mori_token", token);
  },
  async clearToken() {
    await AsyncStorage.removeItem("mori_token");
  },
};
