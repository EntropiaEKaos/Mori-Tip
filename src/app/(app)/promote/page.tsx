"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import Link from "next/link";

export default function PromotePage() {
  const { me, loading, refresh } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", linkUrl: "", days: "3", imageUrl: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<Array<{ id: number; title: string; impressions: number; clicks: number; endsAt: string }>>([]);

  useEffect(() => {
    if (loading) return;
    if (!me) router.push("/login");
    else {
      fetch("/api/promotions").then(async (r) => {
        if (r.ok) setActive(await r.json());
      });
    }
  }, [me, loading, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, days: Number(form.days) }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setMsg(d.error || "Erro");
      return;
    }
    setMsg("Campanha no ar! Aparecerá no feed como promovida.");
    setForm({ title: "", description: "", linkUrl: "", days: "3", imageUrl: "" });
    await refresh();
    const list = await fetch("/api/promotions").then((r) => r.json());
    setActive(list);
  }

  const cost = (Number(form.days) || 1) * 10;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#eae3ce] p-5">
        <h1 className="text-lg font-extrabold flex items-center gap-2">
          <Megaphone className="text-[#c5a84a]" size={20} /> Divulgar no feed
        </h1>
        <p className="text-sm text-[#8a826a] mt-1">
          Use créditos de anúncio para promover produtos, pousadas ou posts. Saldo: <b>{me?.credits ?? 0} créditos</b>
        </p>
        <p className="text-xs text-[#a89f80] mt-1">
          Custo: 10 créditos/dia. <Link href="/wallet" className="text-[#c5a84a] underline">Comprar créditos</Link>
        </p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-[#eae3ce] p-4 grid gap-2">
        <input required placeholder="Título da campanha" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#c5a84a]" />
        <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm min-h-20 outline-none focus:ring-1 focus:ring-[#c5a84a]" />
        <input placeholder="Link (opcional)" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
        <label className="text-xs text-[#8a826a] font-semibold">
          Duração: {form.days} dias · custo {cost} créditos
          <input type="range" min={1} max={30} value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} className="w-full accent-[#c5a84a]" />
        </label>
        <button disabled={busy} className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold rounded-xl py-2.5 disabled:opacity-40">
          {busy ? "Publicando..." : "Ativar promoção"}
        </button>
        {msg && <p className="text-sm text-[#9b8038]">{msg}</p>}
      </form>

      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4">
        <h2 className="font-extrabold mb-3">Campanhas ativas na rede</h2>
        <div className="space-y-2">
          {active.map((a) => (
            <div key={a.id} className="border border-[#eae3ce] rounded-xl p-3">
              <div className="font-bold text-sm">{a.title}</div>
              <div className="text-xs text-[#8a826a] mt-1">
                {a.impressions} impressões · {a.clicks} cliques · até {new Date(a.endsAt).toLocaleDateString("pt-BR")}
              </div>
            </div>
          ))}
          {active.length === 0 && <p className="text-sm text-[#a89f80]">Nenhuma campanha ativa.</p>}
        </div>
      </div>
    </div>
  );
}
