"use client";

import { useEffect, useState } from "react";
import { MapPin, Star, Plus, Utensils } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

type Rest = {
  id: number;
  name: string;
  slug: string;
  description: string;
  city: string;
  state: string;
  coverUrl: string | null;
  cuisineType: string | null;
  avgPrice: number;
  rating: number;
  amenities: string[];
  isVerified: boolean;
  acceptsReservations: boolean;
  ownerUsername: string;
  ownerDisplayName: string;
};

export default function RestaurantesPage() {
  const { me } = useAuth();
  const [items, setItems] = useState<Rest[]>([]);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    description: "",
    cuisineType: "",
    avgPrice: "",
  });

  async function load() {
    const r = await fetch(`/api/restaurants?q=${encodeURIComponent(q)}`);
    if (r.ok) setItems(await r.json());
  }
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, avgPrice: Number(form.avgPrice) || 0 }),
    });
    const d = await r.json();
    if (!r.ok) return alert(d.error || "Erro");
    setShowForm(false);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4 flex flex-wrap gap-3 items-center">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-1.5">
            <Utensils className="text-[#c5a84a]" size={18} /> Restaurantes
          </h1>
          <p className="text-xs text-[#8a826a]">Descubra e reserve os melhores sabores do destino</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nome, cidade ou tipo de cozinha"
          className="flex-1 min-w-[180px] rounded-xl bg-[#f5f1e8] px-3 py-2 outline-none focus:ring-1 focus:ring-[#c5a84a] text-sm"
        />
        {me && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-[#0f0f11] text-[#c5a84a] px-3 py-2 rounded-xl text-sm font-bold"
          >
            <Plus size={16} /> Cadastrar
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-[#eae3ce] p-4 grid gap-2">
          <input required placeholder="Nome do restaurante" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input placeholder="Estado" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          </div>
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm min-h-20" />
          <input placeholder="Tipo de cozinha (ex: Frutos do Mar)" value={form.cuisineType} onChange={(e) => setForm({ ...form, cuisineType: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <input type="number" placeholder="Preço médio (R$)" value={form.avgPrice} onChange={(e) => setForm({ ...form, avgPrice: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <button className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold rounded-xl py-2.5">Cadastrar restaurante</button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-[#eae3ce] overflow-hidden">
            <div className="aspect-[16/9] bg-gradient-to-br from-[#0f0f11] to-[#9b8038] grid place-items-center text-[#fdf5d8] font-bold text-lg">
              {r.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Utensils size={40} />
                  {r.cuisineType && <span className="text-xs font-bold opacity-80">{r.cuisineType}</span>}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-1">
                    {r.name}
                    {r.isVerified && <span className="text-[#c5a84a] text-xs">✔</span>}
                  </h3>
                  <p className="text-xs text-[#8a826a] flex items-center gap-1">
                    <MapPin size={11} /> {r.city}, {r.state}
                  </p>
                </div>
                {r.rating > 0 && (
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                    <Star size={12} fill="currentColor" /> {r.rating}
                  </div>
                )}
              </div>
              {r.description && <p className="text-sm text-[#5c5648] mt-2 line-clamp-3">{r.description}</p>}
              {r.amenities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.amenities.map((a) => (
                    <span key={a} className="text-[10px] bg-[#f5f1e8] px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-end justify-between">
                {r.avgPrice > 0 ? (
                  <div>
                    <span className="text-sm font-extrabold text-[#c5a84a]">R$ {r.avgPrice}</span>
                    <span className="text-xs text-[#8a826a]"> /médio</span>
                  </div>
                ) : (
                  <span />
                )}
                <span className="text-xs text-[#a89f80]">@{r.ownerUsername}</span>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center text-[#a89f80] py-10 text-sm">Nenhum restaurante encontrado.</div>
        )}
      </div>
    </div>
  );
}
