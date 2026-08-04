"use client";

import { useEffect, useState } from "react";
import { MapPin, Star, Plus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

type Guide = {
  id: number;
  headline: string;
  about: string;
  city: string;
  state: string;
  languages: string[];
  specialties: string[];
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export default function GuiasPage() {
  const { me } = useAuth();
  const [items, setItems] = useState<Guide[]>([]);
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    headline: "",
    about: "",
    city: "",
    state: "",
    specialties: "",
    languages: "Português",
    pricePerDay: "",
  });

  async function load() {
    const r = await fetch(`/api/guides?q=${encodeURIComponent(q)}`);
    if (r.ok) setItems(await r.json());
  }
  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/guides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pricePerDay: Number(form.pricePerDay) || 0,
        specialties: form.specialties.split(/[\s,]+/).filter(Boolean),
        languages: form.languages.split(/[\s,]+/).filter(Boolean),
      }),
    });
    if (r.ok) {
      setShow(false);
      load();
    } else {
      const d = await r.json();
      alert(d.error || "Erro");
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4 flex flex-wrap gap-3 items-center">
        <div>
          <h1 className="text-lg font-extrabold">Guias locais</h1>
          <p className="text-xs text-[#8a826a]">Encontre quem conhece o destino de verdade</p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cidade ou especialidade" className="flex-1 min-w-[180px] rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#c5a84a]" />
        {me && (
          <button onClick={() => setShow((v) => !v)} className="flex items-center gap-1.5 bg-[#0f0f11] text-[#c5a84a] px-3 py-2 rounded-xl text-sm font-bold">
            <Plus size={16} /> Quero ser guia
          </button>
        )}
      </div>

      {show && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-[#eae3ce] p-4 grid gap-2">
          <input required placeholder="Headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <textarea placeholder="Sobre você" value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm min-h-20" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input placeholder="Estado" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          </div>
          <input placeholder="Especialidades (dunas, trilhas...)" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <input placeholder="Idiomas" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <input type="number" placeholder="Preço por dia (R$)" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <button className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold rounded-xl py-2.5">Salvar perfil de guia</button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((g) => (
          <div key={g.id} className="bg-white rounded-2xl border border-[#eae3ce] p-4">
            <div className="flex gap-3">
              <Avatar src={g.avatarUrl} name={g.displayName} size={52} />
              <div className="min-w-0">
                <div className="font-extrabold flex items-center gap-1">
                  {g.displayName}
                  {g.isVerified && <span className="text-[#c5a84a] text-xs">✔</span>}
                </div>
                <div className="text-xs text-[#8a826a]">@{g.username}</div>
                <p className="text-sm font-semibold text-[#0f0f11] mt-1">{g.headline}</p>
              </div>
            </div>
            <p className="text-sm text-[#5c5648] mt-2 line-clamp-3">{g.about}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {g.specialties?.map((s) => (
                <span key={s} className="text-[10px] bg-[#f5f1e8] px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-[#8a826a]"><MapPin size={11} /> {g.city}, {g.state}</span>
              <span className="flex items-center gap-1 text-amber-600 font-bold"><Star size={12} fill="currentColor" /> {g.rating || "—"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-extrabold text-[#c5a84a]">R$ {g.pricePerDay}<span className="text-xs text-[#8a826a] font-normal">/dia</span></span>
              <Link href={`/u/${g.username}`} className="text-xs font-bold border border-[#eae3ce] px-3 py-1.5 rounded-full hover:bg-[#fdfaf4]">
                Ver perfil
              </Link>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full text-center text-sm text-[#a89f80] py-10">Nenhum guia encontrado.</p>}
      </div>
    </div>
  );
}
