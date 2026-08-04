"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { CompassLogo } from "@/components/compass-logo";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error || "Erro");
      return;
    }
    await refresh();
    router.push("/feed");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-[#0f0f11] via-[#16151a] to-[#0f0f11] p-6">
      <div className="w-full max-w-md bg-[#16151a]/90 backdrop-blur-xl rounded-3xl border border-[#2a2722] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
        <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold mb-6">
          <CompassLogo size={32} />
          <span className="text-[#c5a84a]">Mori</span>
        </Link>
        <h1 className="text-xl font-extrabold mb-6 text-[#fdf5d8]">Entrar na sua conta</h1>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            placeholder="Email ou usuário"
            className="w-full rounded-xl border border-[#2a2722] bg-[#0f0f11] text-[#fdf5d8] px-4 py-3 outline-none focus:border-[#c5a84a] transition placeholder:text-[#8a826a]"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full rounded-xl border border-[#2a2722] bg-[#0f0f11] text-[#fdf5d8] px-4 py-3 outline-none focus:border-[#c5a84a] transition placeholder:text-[#8a826a]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl px-4 py-3 font-extrabold disabled:opacity-40 shadow-[0_4px_18px_rgba(197,168,74,0.35)] hover:-translate-y-0.5 transition"
          >
            {busy ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="text-sm text-[#b8b0a6] mt-5 text-center">
          Não tem conta?{" "}
          <Link href="/register" className="text-[#c5a84a] font-semibold hover:text-[#fdf5d8]">
            Criar conta
          </Link>
        </div>
        <div className="text-[11px] text-[#8a826a] mt-4 border-t border-[#2a2722] pt-4 text-center">
          Demo admin: <b className="text-[#fdf5d8]">admin</b> / <b className="text-[#fdf5d8]">mori123</b> — Demo user: <b className="text-[#fdf5d8]">marina</b> / <b className="text-[#fdf5d8]">mori123</b>
        </div>
      </div>
    </div>
  );
}
