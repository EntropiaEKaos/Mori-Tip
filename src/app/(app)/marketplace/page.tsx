"use client";

import { useEffect, useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";

type Product = {
  id: number;
  name: string;
  description: string;
  type: string;
  priceMoris: number;
  stock: number;
  imageUrl: string | null;
  city: string | null;
  tags: string[];
  salesCount: number;
  sellerUsername: string;
  sellerDisplayName: string;
  sellerAvatar: string | null;
};

export default function MarketplacePage() {
  const { me, refresh } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", type: "physical", priceMoris: "", stock: "1", city: "", tags: "" });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch(`/api/marketplace/products?q=${encodeURIComponent(q)}&type=${type}`);
    if (r.ok) setItems(await r.json());
  }
  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/marketplace/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        priceMoris: Number(form.priceMoris),
        stock: Number(form.stock),
        tags: form.tags.split(/[\s,]+/).filter(Boolean),
      }),
    });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error || "Erro");
    setShow(false);
    setMsg("Produto publicado!");
    load();
  }

  async function buy(id: number) {
    if (!me) return alert("Faça login");
    if (!confirm("Comprar com Moris?")) return;
    const r = await fetch("/api/marketplace/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, quantity: 1 }),
    });
    const d = await r.json();
    if (!r.ok) return alert(d.error || "Erro");
    alert("Compra realizada!");
    await refresh();
    load();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4 flex flex-wrap gap-3 items-center">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-2"><ShoppingBag size={18} className="text-[#c5a84a]" /> Marketplace</h1>
          <p className="text-xs text-[#8a826a]">Compre e venda com Moris · saldo: {me?.moris ?? 0}</p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produtos" className="flex-1 min-w-[160px] rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#c5a84a]" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm">
          <option value="">Todos</option>
          <option value="physical">Físico</option>
          <option value="digital">Digital</option>
          <option value="experience">Experiência</option>
          <option value="service">Serviço</option>
        </select>
        {me && (
          <button onClick={() => setShow((v) => !v)} className="flex items-center gap-1.5 bg-[#0f0f11] text-[#c5a84a] px-3 py-2 rounded-xl text-sm font-bold">
            <Plus size={16} /> Vender
          </button>
        )}
      </div>

      {show && (
        <form onSubmit={create} className="bg-white rounded-2xl border border-[#eae3ce] p-4 grid gap-2">
          <input required placeholder="Nome do produto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm min-h-20" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm">
              <option value="physical">Físico</option>
              <option value="digital">Digital</option>
              <option value="experience">Experiência</option>
              <option value="service">Serviço</option>
            </select>
            <input type="number" required placeholder="Preço em Moris" value={form.priceMoris} onChange={(e) => setForm({ ...form, priceMoris: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input type="number" placeholder="Estoque" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          </div>
          <input placeholder="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <button className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold rounded-xl py-2.5">Publicar produto</button>
          {msg && <p className="text-sm text-[#9b8038]">{msg}</p>}
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-[#eae3ce] overflow-hidden">
            <div className="h-36 bg-gradient-to-br from-[#0f0f11] to-[#c5a84a] grid place-items-center text-[#fdf5d8] font-bold">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                p.type.toUpperCase()
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold">{p.name}</h3>
                <span className="text-[10px] bg-[#f5f1e8] px-2 py-0.5 rounded-full uppercase">{p.type}</span>
              </div>
              <p className="text-sm text-[#5c5648] mt-1 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Avatar src={p.sellerAvatar} name={p.sellerDisplayName} size={24} />
                <span className="text-xs text-[#8a826a]">@{p.sellerUsername}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-lg font-extrabold text-[#c5a84a]">{p.priceMoris}</span>
                  <span className="text-xs text-[#8a826a]"> Moris</span>
                  <div className="text-[10px] text-[#a89f80]">estoque {p.stock} · {p.salesCount} vendas</div>
                </div>
                <button
                  onClick={() => buy(p.id)}
                  disabled={!me || p.stock < 1}
                  className="bg-[#0f0f11] text-[#c5a84a] px-3 py-1.5 rounded-full text-xs font-extrabold disabled:opacity-40"
                >
                  Comprar
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full text-center text-sm text-[#a89f80] py-10">Nenhum produto.</p>}
      </div>
    </div>
  );
}
