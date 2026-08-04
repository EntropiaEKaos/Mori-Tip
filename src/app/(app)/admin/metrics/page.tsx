"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, DollarSign, CalendarCheck } from "lucide-react";

type Metrics = {
  totals: {
    users: number;
    premiumUsers: number;
    posts: number;
    bookings: number;
    orders: number;
    deposits: number;
    morisMoved: number;
    revenueBrl: number;
  };
  recentUsers: Array<{ id: number; username: string; displayName: string; createdAt: string }>;
  lastUpdated: string;
};

export default function MetricsPage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!me || me.role !== "admin") router.push("/feed");
    else load();
  }, [me, loading, router]);

  async function load() {
    const r = await fetch("/api/admin/metrics");
    if (r.ok) setMetrics(await r.json());
  }

  if (!metrics) return <p className="p-4 text-sm text-[#8a826a]">Carregando métricas...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#0f0f11] to-[#1a1815] text-[#fdf5d8] rounded-3xl p-6 border border-[#c5a84a]/20">
        <h1 className="text-xl font-extrabold flex items-center gap-2 mb-4"><TrendingUp className="text-[#c5a84a]" /> Dashboard Investidores</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div><div className="text-2xl font-black text-[#c5a84a]">{metrics.totals.users}</div><div className="text-xs text-[#b8b0a6]">Usuários totais</div></div>
          <div><div className="text-2xl font-black text-[#c5a84a]">{metrics.totals.premiumUsers}</div><div className="text-xs text-[#b8b0a6]">Premium ({((metrics.totals.premiumUsers / metrics.totals.users) * 100).toFixed(1)}%)</div></div>
          <div><div className="text-2xl font-black text-[#c5a84a]">{metrics.totals.bookings}</div><div className="text-xs text-[#b8b0a6]">Reservas</div></div>
          <div><div className="text-2xl font-black text-[#c5a84a]">R$ {metrics.totals.revenueBrl.toFixed(2)}</div><div className="text-xs text-[#b8b0a6]">Receita (BRL)</div></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-[#eae3ce] p-4">
          <h3 className="font-extrabold mb-3 flex items-center gap-2"><Users className="text-[#c5a84a]" /> Últimos cadastros</h3>
          <div className="space-y-2 text-sm">
            {metrics.recentUsers.map((u) => (
              <div key={u.id} className="flex justify-between border-b border-[#f5f1e8] pb-1 last:border-none">
                <span>@{u.username}</span>
                <span className="text-[#8a826a]">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#eae3ce] p-4">
          <h3 className="font-extrabold mb-3 flex items-center gap-2"><DollarSign className="text-[#c5a84a]" /> Volume</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div><div className="text-2xl font-black">{metrics.totals.morisMoved}</div><div className="text-xs text-[#8a826a]">Moris movimentados</div></div>
            <div><div className="text-2xl font-black">{metrics.totals.orders}</div><div className="text-xs text-[#8a826a]">Pedidos marketplace</div></div>
            <div><div className="text-2xl font-black">{metrics.totals.deposits}</div><div className="text-xs text-[#8a826a]">Depósitos MP</div></div>
            <div><div className="text-2xl font-black">{metrics.totals.posts}</div><div className="text-xs text-[#8a826a]">Posts</div></div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-[#a89f80] text-center">Atualizado {new Date(metrics.lastUpdated).toLocaleString("pt-BR")}</p>
    </div>
  );
}
