"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Calendar, Trash2, Clock, CheckCircle2 } from "lucide-react";

type Scheduled = {
  id: number;
  content: string;
  mediaUrls: string[];
  filter: string | null;
  tags: string[];
  scheduledFor: string;
  status: string;
  createdAt: string;
};

export default function ScheduledPage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Scheduled[]>([]);
  const [content, setContent] = useState("");
  const [when, setWhen] = useState("");

  async function load() {
    const r = await fetch("/api/scheduled-posts");
    if (r.ok) setItems(await r.json());
  }
  useEffect(() => {
    if (loading) return;
    if (!me) router.push("/login");
    else void load();
  }, [me, loading, router]);

  async function schedule(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !when) return;
    const r = await fetch("/api/scheduled-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, scheduledFor: when }),
    });
    if (r.ok) {
      setContent("");
      setWhen("");
      load();
    }
  }

  async function remove(id: number) {
    await fetch(`/api/scheduled-posts?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e8e2d4] rounded-3xl p-6">
        <h1 className="text-2xl font-extrabold tracking-[-1px] flex items-center gap-2">
          <Calendar className="text-[#c5a84a]" /> Posts agendados
        </h1>
        <p className="text-sm text-[#8a826a] mt-1">Programe publicações para o momento perfeito.</p>
      </div>

      <form onSubmit={schedule} className="bg-white border border-[#e8e2d4] rounded-3xl p-5 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="O que você quer publicar?"
          className="w-full bg-[#fdfaf4] border border-[#e8e2d4] rounded-2xl p-4 text-sm outline-none focus:border-[#c5a84a] focus:bg-white transition min-h-24"
        />
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full bg-[#fdfaf4] border border-[#e8e2d4] rounded-2xl p-3 text-sm outline-none focus:border-[#c5a84a] focus:bg-white transition"
        />
        <button className="w-full bg-[#0f0f11] text-[#c5a84a] rounded-2xl py-3 font-extrabold hover:bg-[#1a1815] transition">
          Agendar publicação
        </button>
      </form>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-center text-sm text-[#8a826a] py-6">Nenhum agendamento.</p>}
        {items.map((s) => (
          <div key={s.id} className="bg-white border border-[#e8e2d4] rounded-2xl p-4 flex gap-3 items-start">
            <div className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${
              s.status === "published" ? "bg-emerald-50 text-emerald-600" : "bg-[#fdfaf4] text-[#c5a84a]"
            }`}>
              {s.status === "published" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-[#8a826a] flex items-center gap-2">
                {s.status === "published" ? <span className="text-emerald-600 font-bold">PUBLICADO</span> : <span className="text-[#c5a84a] font-bold">AGENDADO</span>}
                <span>· {new Date(s.scheduledFor).toLocaleString("pt-BR")}</span>
              </div>
              <p className="text-sm mt-1 line-clamp-2">{s.content || <em className="text-[#8a826a]">(sem texto)</em>}</p>
            </div>
            {s.status === "pending" && (
              <button onClick={() => remove(s.id)} className="p-2 rounded-lg text-[#8a826a] hover:bg-red-50 hover:text-red-500 transition">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
