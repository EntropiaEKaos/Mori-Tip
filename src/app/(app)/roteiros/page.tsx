"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Calendar, Wallet } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";
import Link from "next/link";

type Stop = { day: number; title: string; description: string; location?: string };
type Itin = {
  id: number;
  title: string;
  description: string;
  city: string;
  state: string;
  days: number;
  budget: number;
  tags: string[];
  stops: Stop[];
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string | null;
};

export default function RoteirosPage() {
  const { me } = useAuth();
  const [items, setItems] = useState<Itin[]>([]);
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    state: "",
    days: "3",
    budget: "",
    tags: "",
    stopsText: "1|Chegada|Check-in e passeio inicial\n2|Passeio principal|Atividade principal do destino\n3|Despedida|Últimas fotos e checkout",
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch(`/api/itineraries?q=${encodeURIComponent(q)}`);
    if (r.ok) setItems(await r.json());
  }
  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const stops = form.stopsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [day, title, description, location] = line.split("|").map((s) => s.trim());
        return { day: Number(day) || 1, title: title || "Parada", description: description || "", location };
      });
    const r = await fetch("/api/itineraries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        days: Number(form.days) || 1,
        budget: Number(form.budget) || 0,
        tags: form.tags.split(/[\s,]+/).filter(Boolean),
        stops,
      }),
    });
    const d = await r.json();
    if (!r.ok) {
      setMsg(d.error || "Erro");
      return;
    }
    setShow(false);
    setMsg("Roteiro publicado! +XP");
    load();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4 flex flex-wrap gap-3 items-center">
        <div>
          <h1 className="text-lg font-extrabold">Roteiros</h1>
          <p className="text-xs text-[#8a826a]">Monte e compartilhe itinerários de viagem</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cidade ou título"
          className="flex-1 min-w-[180px] rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#c5a84a]"
        />
        {me && (
          <button onClick={() => setShow((v) => !v)} className="flex items-center gap-1.5 bg-[#0f0f11] text-[#c5a84a] px-3 py-2 rounded-xl text-sm font-bold">
            <Plus size={16} /> Novo roteiro
          </button>
        )}
      </div>

      {show && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-[#eae3ce] p-4 grid gap-2">
          <input required placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#c5a84a]" />
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm outline-none min-h-20 focus:ring-1 focus:ring-[#c5a84a]" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input placeholder="Estado" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input type="number" placeholder="Dias" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input type="number" placeholder="Orçamento R$" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          </div>
          <input placeholder="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <label className="text-xs text-[#8a826a]">Paradas (uma por linha: dia|título|descrição|local)</label>
          <textarea value={form.stopsText} onChange={(e) => setForm({ ...form, stopsText: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm min-h-28 font-mono" />
          <button className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold rounded-xl py-2.5">Publicar roteiro</button>
          {msg && <p className="text-sm text-[#9b8038]">{msg}</p>}
        </form>
      )}

      <div className="grid gap-3">
        {items.map((it) => (
          <Link key={it.id} href={`/roteiros/${it.id}`} className="bg-white rounded-2xl border border-[#eae3ce] p-4 hover:shadow-md transition block">
            <div className="flex items-start gap-3">
              <Avatar src={it.authorAvatar} name={it.authorDisplayName} size={40} />
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-[#0f0f11]">{it.title}</h3>
                <p className="text-xs text-[#8a826a] flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {it.city}, {it.state} · @{it.authorUsername}
                </p>
                <p className="text-sm text-[#5c5648] mt-2 line-clamp-2">{it.description}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <span className="flex items-center gap-1 bg-[#f5f1e8] px-2 py-0.5 rounded-full"><Calendar size={11} /> {it.days} dias</span>
                  <span className="flex items-center gap-1 bg-[#f5f1e8] px-2 py-0.5 rounded-full"><Wallet size={11} /> R$ {it.budget}</span>
                  <span className="bg-[#f5f1e8] px-2 py-0.5 rounded-full">{it.stops?.length || 0} paradas</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {items.length === 0 && <p className="text-center text-sm text-[#a89f80] py-10">Nenhum roteiro encontrado.</p>}
      </div>
    </div>
  );
}
