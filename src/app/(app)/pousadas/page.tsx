"use client";

import { useEffect, useState } from "react";
import { MapPin, Star, Plus, CalendarCheck, Crown } from "lucide-react";
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
  const [bookingInn, setBookingInn] = useState<Inn | null>(null);
  const [form, setForm] = useState({ name: "", city: "", state: "", description: "", pricePerNight: "" });
  const [bookForm, setBookForm] = useState({ checkIn: "", checkOut: "", guests: "2", useMoris: "0", notes: "" });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch(`/api/inns?q=${encodeURIComponent(q)}`);
    if (r.ok) {
      const list = await r.json();
      // enrich with acceptsBookings via detail when needed — list may not include it
      setInns(list);
    }
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

  async function openBooking(inn: Inn) {
    if (!me) return alert("Faça login");
    if (!me.isPremium) {
      if (confirm("Reservas exigem Premium. Ir para assinatura?")) {
        window.location.href = "/premium";
      }
      return;
    }
    // fetch detail for acceptsBookings
    const r = await fetch(`/api/inns/${inn.id}`);
    if (r.ok) {
      const detail = await r.json();
      setBookingInn({ ...inn, acceptsBookings: detail.acceptsBookings });
    } else {
      setBookingInn(inn);
    }
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingInn) return;
    const r = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        innId: bookingInn.id,
        checkIn: bookForm.checkIn,
        checkOut: bookForm.checkOut,
        guests: Number(bookForm.guests) || 1,
        useMoris: Number(bookForm.useMoris) || 0,
        notes: bookForm.notes,
      }),
    });
    const d = await r.json();
    if (!r.ok) return alert(d.error || "Erro");
    alert("Reserva solicitada!");
    setBookingInn(null);
    await refresh();
    window.location.href = "/reservas";
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-lg font-extrabold">Pousadas</h1>
          <p className="text-xs text-[#8a826a]">Reserve com Premium · gerencie em /reservas</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, cidade ou estado"
          className="flex-1 min-w-[200px] rounded-xl bg-[#f5f1e8] px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-[#c5a84a] text-sm"
        />
        <Link href="/reservas" className="text-xs font-bold border border-[#eae3ce] px-3 py-2 rounded-xl flex items-center gap-1">
          <CalendarCheck size={14} /> Minhas reservas
        </Link>
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
          <input placeholder="Nome da pousada" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 outline-none focus:ring-1 focus:ring-[#c5a84a] text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input placeholder="Estado (UF)" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          </div>
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm min-h-24" />
          <input type="number" placeholder="Preço por diária (R$)" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <p className="text-[11px] text-[#8a826a]">Hosts Premium liberam reservas online automaticamente no perfil da pousada.</p>
          <button className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl px-4 py-2 font-extrabold text-sm">Enviar</button>
          {msg && <p className="text-sm text-[#9b8038]">{msg}</p>}
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {inns.length === 0 && (
          <div className="col-span-full text-center text-[#a89f80] py-10 text-sm">Nenhuma pousada encontrada.</div>
        )}
        {inns.map((i) => (
          <div key={i.id} className="bg-white rounded-2xl border border-[#eae3ce] overflow-hidden">
            <div className="aspect-[16/9] bg-gradient-to-br from-[#0f0f11] to-[#c5a84a] grid place-items-center text-[#fdf5d8] text-lg font-bold">
              {i.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.coverUrl} alt={i.name} className="w-full h-full object-cover" />
              ) : (
                <MapPin size={40} />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base">{i.name}</h3>
                  <p className="text-xs text-[#8a826a] flex items-center gap-1">
                    <MapPin size={11} /> {i.city}, {i.state}
                  </p>
                </div>
                {i.rating > 0 && (
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                    <Star size={12} fill="currentColor" /> {i.rating}
                  </div>
                )}
              </div>
              {i.description && <p className="text-sm text-[#5c5648] mt-2 line-clamp-3">{i.description}</p>}
              {i.amenities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {i.amenities.slice(0, 4).map((a) => (
                    <span key={a} className="text-[10px] bg-[#f5f1e8] px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <span className="text-lg font-extrabold text-[#c5a84a]">R$ {i.pricePerNight}</span>
                  <span className="text-xs text-[#8a826a]"> /noite</span>
                  <div className="text-[10px] text-[#a89f80]">@{i.ownerUsername}</div>
                </div>
                <button
                  onClick={() => openBooking(i)}
                  className="flex items-center gap-1 text-xs font-extrabold bg-[#0f0f11] text-[#c5a84a] px-3 py-2 rounded-full"
                >
                  {me?.isPremium ? <CalendarCheck size={12} /> : <Crown size={12} />}
                  Reservar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bookingInn && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
          <form onSubmit={submitBooking} className="bg-white rounded-2xl w-full max-w-md p-5 border border-[#eae3ce] space-y-3">
            <h3 className="font-extrabold text-lg">Reservar · {bookingInn.name}</h3>
            {!bookingInn.acceptsBookings && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                Esta pousada pode ainda não ter reservas online ativas (host precisa ser Premium).
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-[#8a826a]">Check-in
                <input type="date" required value={bookForm.checkIn} onChange={(e) => setBookForm({ ...bookForm, checkIn: e.target.value })} className="mt-1 w-full rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
              </label>
              <label className="text-xs text-[#8a826a]">Check-out
                <input type="date" required value={bookForm.checkOut} onChange={(e) => setBookForm({ ...bookForm, checkOut: e.target.value })} className="mt-1 w-full rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
              </label>
            </div>
            <input type="number" min={1} value={bookForm.guests} onChange={(e) => setBookForm({ ...bookForm, guests: e.target.value })} placeholder="Hóspedes" className="w-full rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input type="number" min={0} value={bookForm.useMoris} onChange={(e) => setBookForm({ ...bookForm, useMoris: e.target.value })} placeholder={`Usar Moris (saldo ${me?.moris ?? 0})`} className="w-full rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <textarea value={bookForm.notes} onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })} placeholder="Observações" className="w-full rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm min-h-16" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setBookingInn(null)} className="flex-1 border border-[#eae3ce] rounded-xl py-2 text-sm font-bold">Cancelar</button>
              <button type="submit" className="flex-1 bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl py-2 text-sm font-extrabold">Confirmar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
