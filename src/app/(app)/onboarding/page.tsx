"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { CompassLogo } from "@/components/compass-logo";
import { UserCheck, Palmtree, Map } from "lucide-react";

const ROLES = [
  {
    key: "user",
    icon: UserCheck,
    title: "Viajante",
    desc: "Siga guias, reserve pousadas e monte roteiros inesquecíveis pelo mundo.",
  },
  {
    key: "host",
    icon: Palmtree,
    title: "Anfitrião",
    desc: "Divulgue sua pousada ou restaurante. Receba hóspedes e monetize em Moris.",
  },
  {
    key: "guide",
    icon: Map,
    title: "Guia local",
    desc: "Ofereça passeios e tours. Seu conhecimento da região vale muito.",
  },
] as const;

export default function OnboardingPage() {
  const { me, refresh } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<string>("user");
  const [displayName, setDisplayName] = useState(me?.displayName ?? "");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const r = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, displayName, bio, location }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return alert(d.error || "Erro");
    await refresh();
    router.push("/feed");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 pt-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#eae3ce] p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <CompassLogo size={36} />
          <span className="text-2xl font-extrabold text-[#c5a84a]">Mori</span>
        </div>
        <h1 className="text-xl font-extrabold text-center mb-2">
          Bem-vindo(a), {me?.displayName || "viajante"}!
        </h1>
        <p className="text-sm text-[#8a826a] text-center mb-6">
          Escolha como deseja participar na comunidade Mori. Você pode mudar depois.
        </p>

        <div className="grid gap-2 mb-6">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`text-left p-4 rounded-2xl border transition flex gap-3 items-start ${
                  role === r.key
                    ? "border-[#c5a84a] bg-[#faf7f0]"
                    : "border-[#eae3ce] hover:border-[#c5a84a]"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a84a] to-[#9b8038] text-[#0f0f11] grid place-items-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-sm">{r.title}</div>
                  <p className="text-xs text-[#5c5648] mt-0.5">{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-2">
          <input
            placeholder="Nome de exibição"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl bg-[#f5f1e8] px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#c5a84a]"
          />
          <input
            placeholder="Localização (ex: Jericoacoara, CE)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl bg-[#f5f1e8] px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#c5a84a]"
          />
          <textarea
            placeholder="Bio (opcional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl bg-[#f5f1e8] px-3 py-2.5 text-sm min-h-20 outline-none focus:ring-1 focus:ring-[#c5a84a]"
          />
        </div>

        <button
          disabled={busy}
          onClick={save}
          className="mt-5 w-full bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl py-3 font-extrabold shadow-[0_4px_18px_rgba(197,168,74,0.35)]"
        >
          {busy ? "Salvando..." : "Entrar na comunidade"}
        </button>
      </div>
    </div>
  );
}
