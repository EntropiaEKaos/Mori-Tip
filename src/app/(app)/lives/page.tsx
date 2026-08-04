"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, Plus, Users } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/components/auth-provider";
import { timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Live = {
  id: number;
  title: string;
  description: string;
  status: "scheduled" | "live" | "ended";
  roomId: string;
  viewerCount: number;
  startedAt: string | null;
  createdAt: string;
  hostId: number;
  hostUsername: string;
  hostDisplayName: string;
  hostAvatar: string | null;
};

export default function LivesPage() {
  const { me } = useAuth();
  const router = useRouter();
  const [lives, setLives] = useState<Live[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/lives", { cache: "no-store" });
    if (r.ok) setLives(await r.json());
  }
  useEffect(() => {
    void load();
    const i = setInterval(load, 8000);
    return () => clearInterval(i);
  }, []);

  async function startLive(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    const r = await fetch("/api/lives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (r.ok) {
      const d = await r.json();
      router.push(`/lives/${d.id}`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Radio className="text-red-500" size={20} /> Lives
          </h1>
          <p className="text-xs text-slate-500">Transmita direto da sua pousada ou trip</p>
        </div>
        {me && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={16} /> Iniciar transmissão
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={startLive} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <input
            required
            placeholder="Título da live"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl bg-slate-100 px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-cyan-500 text-sm"
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl bg-slate-100 px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-cyan-500 text-sm min-h-16"
          />
          <button
            disabled={busy}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            {busy ? "Iniciando..." : "Ir ao vivo agora"}
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {lives.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-10 text-sm">
            Nenhuma live ativa agora.
          </div>
        )}
        {lives.map((l) => (
          <Link
            key={l.id}
            href={`/lives/${l.id}`}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition"
          >
            <div className="aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 grid place-items-center relative">
              <Avatar src={l.hostAvatar} name={l.hostDisplayName} size={72} />
              {l.status === "live" && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 live-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> AO VIVO
                </div>
              )}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                <Users size={12} /> {l.viewerCount}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2">{l.title}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                <span>@{l.hostUsername}</span>
                <span>·</span>
                <span>iniciou {timeAgo(l.startedAt ?? l.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
