"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Crown, Check } from "lucide-react";
import Link from "next/link";

export default function PremiumPage() {
  const { me, loading, refresh } = useAuth();
  const router = useRouter();
  const [info, setInfo] = useState<{
    isPremium: boolean;
    premiumUntil: string | null;
    priceMoris: number;
    days: number;
    benefits: string[];
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!me) router.push("/login");
    else {
      fetch("/api/premium").then(async (r) => {
        if (r.ok) setInfo(await r.json());
      });
    }
  }, [me, loading, router]);

  async function subscribe() {
    setBusy(true);
    const r = await fetch("/api/premium", { method: "POST" });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return alert(d.error || "Erro");
    await refresh();
    setInfo((prev) => prev && { ...prev, isPremium: true, premiumUntil: d.premiumUntil });
    alert("Premium ativado! Reservas liberadas.");
  }

  if (!info) return <p className="p-4 text-sm text-[#8a826a]">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#0f0f11] via-[#1a1815] to-[#3a2f12] text-[#fdf5d8] rounded-2xl p-8 border border-[#c5a84a]/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a84a] text-[#0f0f11] grid place-items-center">
            <Crown size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Mori Premium</h1>
            <p className="text-sm text-[#b8b0a6]">Desbloqueie reservas e benefícios exclusivos</p>
          </div>
        </div>
        {info.isPremium ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-sm">
            Premium ativo até {info.premiumUntil ? new Date(info.premiumUntil).toLocaleDateString("pt-BR") : "—"}.
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <div className="text-4xl font-extrabold text-[#c5a84a]">{info.priceMoris} <span className="text-lg">Moris</span></div>
              <div className="text-xs text-[#b8b0a6]">por {info.days} dias · +200 Moris de bônus</div>
            </div>
            <button
              disabled={busy}
              onClick={subscribe}
              className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold px-6 py-3 rounded-xl disabled:opacity-40"
            >
              {busy ? "Ativando..." : "Assinar agora"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#eae3ce] p-5">
        <h2 className="font-extrabold mb-3">Benefícios</h2>
        <ul className="space-y-2">
          {info.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-[#c5a84a] mt-0.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-2">
          <Link href="/pousadas" className="text-sm font-bold text-[#c5a84a] hover:underline">Ver pousadas</Link>
          <span className="text-[#eae3ce]">·</span>
          <Link href="/wallet" className="text-sm font-bold text-[#c5a84a] hover:underline">Carteira</Link>
        </div>
      </div>
    </div>
  );
}
