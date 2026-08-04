"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Coins, CreditCard, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";

type WalletData = {
  wallet: { moris: number; credits: number; xp: number; level: number; isPremium: boolean; premiumUntil: string | null };
  transactions: Array<{ id: number; kind: string; amountMoris: number; amountCredits: number; description: string; createdAt: string }>;
  packages: Array<{ id: number; name: string; credits: number; priceMoris: number; bonusCredits: number }>;
};

export default function WalletPage() {
  const { me, loading, refresh } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/wallet", { cache: "no-store" });
    if (r.ok) setData(await r.json());
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!me) router.push("/login");
    else void load();
  }, [me, loading, router, load]);

  async function buyPackage(packageId: number) {
    setBusy(true);
    const r = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    setBusy(false);
    const d = await r.json();
    if (!r.ok) return alert(d.error || "Erro");
    await refresh();
    load();
  }

  if (!data) return <p className="p-4 text-sm text-[#8a826a]">Carregando carteira...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#0f0f11] to-[#1a1815] text-[#fdf5d8] rounded-2xl p-6 border border-[#c5a84a]/20">
        <h1 className="text-lg font-extrabold mb-4">Carteira Mori</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-[#c5a84a] text-xs font-bold uppercase"><Coins size={14} /> Moris</div>
            <div className="text-3xl font-extrabold mt-1">{data.wallet.moris}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-[#c5a84a] text-xs font-bold uppercase"><CreditCard size={14} /> Créditos ads</div>
            <div className="text-3xl font-extrabold mt-1">{data.wallet.credits}</div>
          </div>
        </div>
        <p className="text-xs text-[#b8b0a6] mt-3">Nível {data.wallet.level} · {data.wallet.xp} XP {data.wallet.isPremium ? "· Premium ativo" : ""}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4">
        <h2 className="font-extrabold mb-3">Comprar créditos de divulgação</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {data.packages.map((p) => (
            <button
              key={p.id}
              disabled={busy}
              onClick={() => buyPackage(p.id)}
              className="text-left border border-[#eae3ce] rounded-xl p-3 hover:border-[#c5a84a] hover:bg-[#fdfaf4] transition"
            >
              <div className="font-extrabold">{p.name}</div>
              <div className="text-sm text-[#5c5648]">{p.credits} créditos {p.bonusCredits > 0 && <span className="text-[#c5a84a]">+{p.bonusCredits} bônus</span>}</div>
              <div className="text-sm font-bold text-[#c5a84a] mt-1">{p.priceMoris} Moris</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#eae3ce] divide-y divide-[#f5f1e8]">
        <div className="p-4 font-extrabold">Extrato</div>
        {data.transactions.length === 0 && <p className="p-6 text-sm text-[#a89f80] text-center">Sem movimentações.</p>}
        {data.transactions.map((t) => (
          <div key={t.id} className="p-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full grid place-items-center ${t.amountMoris >= 0 && t.amountCredits >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              {t.amountMoris >= 0 && t.amountCredits >= 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{t.description || t.kind}</div>
              <div className="text-[11px] text-[#a89f80]">{timeAgo(t.createdAt)}</div>
            </div>
            <div className="text-right text-sm font-bold">
              {t.amountMoris !== 0 && <div className={t.amountMoris > 0 ? "text-emerald-600" : "text-red-500"}>{t.amountMoris > 0 ? "+" : ""}{t.amountMoris} M</div>}
              {t.amountCredits !== 0 && <div className={t.amountCredits > 0 ? "text-emerald-600" : "text-red-500"}>{t.amountCredits > 0 ? "+" : ""}{t.amountCredits} cr</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
