import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
if (Platform.OS !== "web" && (!API_BASE || !API_BASE.startsWith("https://"))) {
  throw new Error("Configure EXPO_PUBLIC_API_URL com a URL HTTPS da API MORI.");
}
const TOKEN_KEY = "mori_token";
let webToken: string | null = null;

export const api = {
  get(path: string) { return this.request(path, { method: "GET" }); },
  post(path: string, body: unknown) { return this.request(path, { method: "POST", body: JSON.stringify(body) }); },
  patch(path: string, body: unknown) { return this.request(path, { method: "PATCH", body: JSON.stringify(body) }); },
  delete(path: string) { return this.request(path, { method: "DELETE" }); },
  async request(path: string, init: RequestInit) {
    const token = Platform.OS === "web" ? webToken : await SecureStore.getItemAsync(TOKEN_KEY);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE || ""}${path}`, {
      ...init, headers, credentials: Platform.OS === "web" ? "include" : "omit",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
  async setToken(token: string) {
    if (!token) throw new Error("API não retornou token de sessão.");
    if (Platform.OS === "web") webToken = token;
    else await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clearToken() {
    if (Platform.OS === "web") webToken = null;
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
