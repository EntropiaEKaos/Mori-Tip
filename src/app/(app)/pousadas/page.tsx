"use client";

import { useEffect, useState } from "react";
import { MapPin, Star, Plus, CalendarCheck, Crown, Search } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

type Inn = {
  id: number;
  name: string;
  slug: string;
  description: string;
  city: string;
  state: string;
  country: string;
  coverUrl: string | null;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  ownerUsername: string;
  ownerDisplayName: string;
  acceptsBookings?: boolean;
};

export default function InnsPage() {
  const { me, refresh } = useAuth();
  const [inns, setInns] = useState<Inn[]>([]);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", state: "", description: "", pricePerNight: "" });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch(`/api/inns?q=${encodeURIComponent(q)}`);
    if (r.ok) setInns(await r.json());
  }
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/inns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, pricePerNight: Number(form.pricePerNight) || 0 }),
    });
    const d = await r.json();
    if (!r.ok) {
      setMsg(d.error || "Erro");
      return;
    }
    setMsg(me?.role === "admin" || me?.isPremium ? "Pousada publicada!" : "Enviada para aprovação.");
    setForm({ name: "", city: "", state: "", description: "", pricePerNight: "" });
    setShowForm(false);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e8e2d4] rounded-3xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-[-1px]">Pousadas</h1>
            <p className="text-sm text-[#8a826a]">Acomodações verificadas em destinos incríveis</p>
          </div>
          {me && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="bg-[#0f0f11] text-[#c5a84a] rounded-full px-4 py-2 text-sm font-extrabold flex items-center gap-1.5 hover:bg-[#1a1815] transition"
            >
              <Plus size={16} /> Cadastrar
            </button>
          )}
        </div>
        <div className="relative mt-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a826a]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar destino, cidade ou estado..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#fdfaf4] border border-[#e8e2d4] outline-none focus:border-[#c5a84a] focus:bg-white text-sm transition"
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-[#e8e2d4] rounded-3xl p-6 grid gap-3">
          <input placeholder="Nome da pousada" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2.5 outline-none focus:border-[#c5a84a] text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2.5 outline-none focus:border-[#c5a84a] text-sm" />
            <input placeholder="Estado" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2.5 outline-none focus:border-[#c5a84a] text-sm" />
          </div>
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2.5 outline-none focus:border-[#c5a84a] text-sm min-h-24" />
          <input type="number" placeholder="Preço por diária (R$)" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} className="bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2.5 outline-none focus:border-[#c5a84a] text-sm" />
          <button className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl px-4 py-2.5 font-extrabold text-sm">Enviar</button>
          {msg && <p className="text-sm text-[#9b8038] font-bold">{msg}</p>}
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {inns.length === 0 && (
          <div className="col-span-full text-center text-[#8a826a] py-12 text-sm">Nenhuma pousada encontrada.</div>
        )}
        {inns.map((i) => (
          <Link
            key={i.id}
            href={`/pousadas/${i.id}`}
            className="mori-card overflow-hidden group block"
          >
            <div className="aspect-[16/10] bg-gradient-to-br from-[#0f0f11] via-[#1a1815] to-[#9b8038] grid place-items-center text-white/30 text-5xl font-serif relative overflow-hidden">
              {i.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.coverUrl} alt={i.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              ) : (
                <span className="font-serif text-7xl tracking-tighter text-white/30">M</span>
              )}
              {i.acceptsBookings && (
                <span className="absolute top-3 right-3 bg-[#c5a84a] text-[#0f0f11] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CalendarCheck size={10} /> Reservas
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-lg tracking-[-0.5px]">{i.name}</h3>
                {i.rating > 0 && (
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star size={12} fill="currentColor" /> {i.rating}
                  </div>
                )}
              </div>
              <p className="text-xs text-[#8a826a] flex items-center gap-1 mt-1">
                <MapPin size={11} /> {i.city}, {i.state}
              </p>
              {i.description && <p className="text-sm text-[#5c5648] mt-2 line-clamp-2">{i.description}</p>}
              {i.amenities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {i.amenities.slice(0, 3).map((a) => (
                    <span key={a} className="text-[10px] bg-[#fdfaf4] border border-[#e8e2d4] px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                  {i.amenities.length > 3 && <span className="text-[10px] text-[#8a826a]">+{i.amenities.length - 3}</span>}
                </div>
              )}
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="text-2xl font-black text-[#0f0f11]">R$ {i.pricePerNight}</span>
                  <span className="text-xs text-[#8a826a]"> /noite</span>
                </div>
                <span className="text-[10px] text-[#8a826a]">@{i.ownerUsername}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
