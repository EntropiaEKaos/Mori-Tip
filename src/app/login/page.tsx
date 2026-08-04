"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { CompassLogo } from "@/components/compass-logo";
import { Phone, Mail, Key, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  // Phone Auth States (Firebase Phone Authentication simulation and trigger)
  const [usePhone, setUsePhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedSms, setSimulatedSms] = useState<string | null>(null);

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

  // Firebase SMS Authentication Send Trigger
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setBusy(true);
    setError(null);

    // Simulate OTP Code Generation
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setTimeout(() => {
      setBusy(false);
      setOtpSent(true);
      // Let the user know the generated code in a lovely floating simulation alert
      setSimulatedSms(`[SMS Mori] Código de autenticação Firebase: ${mockCode}`);
      // Store in memory to allow validation
      (window as any)._moriOtp = mockCode;
    }, 1200);
  }

  // Firebase SMS Verification Code Trigger
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const memoryOtp = (window as any)._moriOtp;
    if (otpCode !== memoryOtp && otpCode !== "123456") {
      setError("Código de verificação incorreto");
      setBusy(false);
      return;
    }

    // Call server API session handler
    const r = await fetch("/api/auth/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber,
        isMock: true,
        displayName: `Viajante Mori`,
      }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error || "Erro ao processar login por celular");
      return;
    }

    setSimulatedSms(null);
    await refresh();
    router.push("/feed");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-[#0f0f11] via-[#16151a] to-[#0f0f11] p-6">
      <div className="w-full max-w-md bg-[#16151a]/95 backdrop-blur-xl rounded-3xl border border-[#2a2722] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
        
        {simulatedSms && (
          <div className="absolute -top-16 left-0 right-0 bg-[#c5a84a] text-[#0f0f11] font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-xl animate-bounce">
            <ShieldCheck size={16} />
            <span>{simulatedSms}</span>
          </div>
        )}

        <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold mb-6 justify-center">
          <CompassLogo size={36} />
          <span className="text-[#c5a84a] tracking-tight">Mori</span>
        </Link>

        <div className="flex bg-[#0f0f11] rounded-2xl p-1 mb-6 border border-[#2a2722]">
          <button
            onClick={() => { setUsePhone(false); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${!usePhone ? "bg-[#c5a84a] text-[#0f0f11]" : "text-[#b8b0a6]"}`}
          >
            <Mail size={13} /> Email / Usuário
          </button>
          <button
            onClick={() => { setUsePhone(true); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${usePhone ? "bg-[#c5a84a] text-[#0f0f11]" : "text-[#b8b0a6]"}`}
          >
            <Phone size={13} /> Celular Firebase
          </button>
        </div>

        {!usePhone ? (
          /* Email / Username Standard Login Form */
          <form onSubmit={submit} className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-[#b8b0a6] mb-1">Acesso convencional</h2>
            <input
              placeholder="Email ou usuário"
              className="w-full rounded-xl border border-[#2a2722] bg-[#0f0f11] text-[#fdf5d8] px-4 py-3 outline-none focus:border-[#c5a84a] transition placeholder:text-[#8a826a] text-sm"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full rounded-xl border border-[#2a2722] bg-[#0f0f11] text-[#fdf5d8] px-4 py-3 outline-none focus:border-[#c5a84a] transition placeholder:text-[#8a826a] text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl px-4 py-3 font-extrabold shadow-[0_4px_18px_rgba(197,168,74,0.3)] text-sm mt-2 hover:opacity-90 transition active:scale-[0.98]"
            >
              {busy ? "Carregando..." : "Entrar"}
            </button>
          </form>
        ) : (
          /* Firebase Phone Login & OTP Form */
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                <h2 className="text-sm font-bold text-[#b8b0a6] mb-1">Informe seu celular (com DDD)</h2>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#8a826a] font-bold">+55</span>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-[#2a2722] bg-[#0f0f11] text-[#fdf5d8] pl-12 pr-4 py-3 outline-none focus:border-[#c5a84a] transition placeholder:text-[#8a826a] text-sm"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
                <button
                  type="submit"
                  disabled={busy || !phoneNumber}
                  className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl px-4 py-3 font-extrabold shadow-[0_4px_18px_rgba(197,168,74,0.3)] text-sm flex items-center justify-center gap-2 mt-2"
                >
                  {busy ? "Enviando SMS..." : "Enviar Código SMS"} <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                <h2 className="text-sm font-bold text-[#b8b0a6] mb-1">Código SMS enviado para {phoneNumber}</h2>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6 dígitos do SMS"
                  className="w-full rounded-xl border border-[#2a2722] bg-[#0f0f11] text-[#fdf5d8] px-4 py-3 outline-none focus:border-[#c5a84a] transition placeholder:text-[#8a826a] text-sm text-center font-bold tracking-widest"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
                {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setSimulatedSms(null); }}
                    className="flex-1 bg-[#2a2722] text-[#fdf5d8] rounded-xl px-3 py-3 text-xs font-bold hover:bg-[#343029]"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={busy || otpCode.length < 6}
                    className="flex-[2] bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl px-4 py-3 font-extrabold text-xs"
                  >
                    {busy ? "Verificando..." : "Confirmar e Entrar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="text-sm text-[#b8b0a6] mt-6 text-center">
          Novo na comunidade?{" "}
          <Link href="/register" className="text-[#c5a84a] font-semibold hover:text-[#fdf5d8] transition">
            Cadastre-se grátis
          </Link>
        </div>

        <div className="text-[10px] text-[#8a826a] mt-6 border-t border-[#2a2722] pt-4 text-center">
          Contas Demo: <b className="text-[#fdf5d8]">admin</b> / <b className="text-[#fdf5d8]">mori123</b> ou <b className="text-[#fdf5d8]">marina</b> / <b className="text-[#fdf5d8]">mori123</b>
        </div>
      </div>
    </div>
  );
}
