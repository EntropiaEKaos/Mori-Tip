"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Plus, X, Star } from "lucide-react";

type Highlight = {
  id: number;
  title: string;
  coverUrl: string | null;
  momentIds: number[];
};

export default function HighlightsPage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Highlight[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", momentIds: "" });

  async function load() {
    if (!me) return;
    const r = await fetch(`/api/highlights?username=${me.username}`);
    if (r.ok) setItems(await r.json());
  }
  useEffect(() => {
    if (loading) return;
    if (!me) router.push("/login");
    else void load();
  }, [me, loading, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    const momentIds = form.momentIds.split(",").map((s) => Number(s.trim())).filter(Boolean);
    const r = await fetch("/api/highlights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, momentIds }),
    });
    if (r.ok) {
      setShowForm(false);
      setForm({ title: "", momentIds: "" });
      load();
    }
  }

  async function remove(id: number) {
    if (!confirm("Excluir destaque?")) return;
    await fetch(`/api/highlights?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e8e2d4] rounded-3xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-[-1px] flex items-center gap-2">
              <Star className="text-[#c5a84a]" /> Destaques
            </h1>
            <p className="text-sm text-[#8a826a]">Organize seus melhores momentos em coleções fixas no seu perfil.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-[#0f0f11] text-[#c5a84a] rounded-full px-4 py-2 text-sm font-extrabold flex items-center gap-1.5 hover:bg-[#1a1815] transition"
          >
            <Plus size={16} /> Novo destaque
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-[#e8e2d4] rounded-3xl p-5 space-y-3">
          <input
            placeholder="Título do destaque (ex: Melhores Trilhas)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2.5 outline-none focus:border-[#c5a84a] text-sm"
            required
          />
          <input
            placeholder="IDs dos momentos separados por vírgula"
            value={form.momentIds}
            onChange={(e) => setForm({ ...form, momentIds: e.target.value })}
            className="w-full bg-[#fdfaf4] border border-[#e8e2d4] rounded-xl px-3 py-2.5 outline-none focus:border-[#c5a84a] text-sm"
          />
          <p className="text-[11px] text-[#8a826a]">Os IDs podem ser encontrados na URL de cada momento publicado.</p>
          <button className="w-full bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] rounded-xl py-2.5 font-extrabold text-sm">Criar destaque</button>
        </form>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {items.length === 0 && (
          <div className="col-span-full text-center text-[#8a826a] py-12 text-sm">Nenhum destaque ainda. Crie o primeiro!</div>
        )}
        {items.map((h) => (
          <div key={h.id} className="text-center group cursor-pointer relative">
            <div className="aspect-square rounded-full bg-gradient-to-tr from-[#c5a84a] via-[#c5a84a]/60 to-[#0f0f11] p-[3px] mx-auto w-20 group-hover:scale-105 transition">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full bg-[#fdfaf4] flex items-center justify-center text-2xl overflow-hidden">
                  {h.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.coverUrl} alt={h.title} className="w-full h-full object-cover" />
                  ) : (
                    <span>⭐</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs font-medium text-[#0f0f11] truncate">{h.title}</div>
            <button
              onClick={() => remove(h.id)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
