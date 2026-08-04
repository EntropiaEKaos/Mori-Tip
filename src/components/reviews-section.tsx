"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Star, ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/utils";

type Review = {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  pros: string[];
  cons: string[];
  createdAt: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string | null;
  authorLevel?: number;
};

export function ReviewsSection({
  targetType,
  targetId,
  canReview,
}: {
  targetType: "inn" | "guide" | "product";
  targetId: number;
  canReview?: boolean;
}) {
  const { me } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", content: "", pros: "", cons: "" });

  async function load() {
    const r = await fetch(`/api/reviews?type=${targetType}&id=${targetId}`);
    if (r.ok) {
      const d = await r.json();
      setItems(d.reviews);
      setAverage(d.average);
      setTotal(d.total);
    }
  }
  useEffect(() => {
    void load();
  }, [targetId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType, targetId,
        rating: form.rating,
        title: form.title,
        content: form.content,
        pros: form.pros.split("\n").map((s) => s.trim()).filter(Boolean),
        cons: form.cons.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    if (r.ok) {
      setShowForm(false);
      setForm({ rating: 5, title: "", content: "", pros: "", cons: "" });
      load();
    } else {
      const d = await r.json();
      alert(d.error || "Erro");
    }
  }

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: items.filter((r) => r.rating === star).length,
    pct: items.length ? (items.filter((r) => r.rating === star).length / items.length) * 100 : 0,
  }));

  return (
    <div className="bg-white border border-[#e8e2d4] rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-[-0.5px]">Avaliações</h2>
          {total > 0 ? (
            <div className="flex items-center gap-3 mt-2">
              <div className="text-4xl font-black text-[#0f0f11]">{average.toFixed(1)}</div>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className={s <= Math.round(average) ? "text-[#c5a84a] fill-[#c5a84a]" : "text-[#e8e2d4]"} />
                  ))}
                </div>
                <div className="text-xs text-[#8a826a]">{total} avaliações</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#8a826a] mt-1">Seja o primeiro a avaliar!</p>
          )}
        </div>
        {me && canReview && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-[#0f0f11] text-[#c5a84a] rounded-full px-4 py-2 text-xs font-extrabold flex items-center gap-1 hover:bg-[#1a1815] transition"
          >
            <Plus size={14} /> Avaliar
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 text-xs">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-2">
              <span className="w-4 text-[#8a826a]">{b.star}★</span>
              <div className="flex-1 h-2 bg-[#fdfaf4] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#c5a84a] to-[#9b8038]" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-8 text-right text-[#8a826a]">{b.count}</span>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="bg-[#fdfaf4] border border-[#e8e2d4] rounded-2xl p-4 space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Sua nota:</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}>
                  <Star size={22} className={s <= form.rating ? "text-[#c5a84a] fill-[#c5a84a]" : "text-[#e8e2d4]"} />
                </button>
              ))}
            </div>
          </div>
          <input
            placeholder="Título (opcional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-white border border-[#e8e2d4] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#c5a84a]"
          />
          <textarea
            placeholder="Conte sua experiência..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full bg-white border border-[#e8e2d4] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#c5a84a] min-h-20"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <textarea
              placeholder="Pontos positivos (um por linha)"
              value={form.pros}
              onChange={(e) => setForm({ ...form, pros: e.target.value })}
              className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-400 min-h-16"
            />
            <textarea
              placeholder="Pontos a melhorar (um por linha)"
              value={form.cons}
              onChange={(e) => setForm({ ...form, cons: e.target.value })}
              className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-400 min-h-16"
            />
          </div>
          <button className="w-full bg-[#0f0f11] text-[#c5a84a] rounded-xl py-2.5 font-extrabold text-sm">Publicar avaliação</button>
        </form>
      )}

      <div className="space-y-4">
        {items.map((r) => (
          <div key={r.id} className="border-b border-[#fdfaf4] pb-4 last:border-0">
            <div className="flex items-start gap-3">
              <Avatar src={r.authorAvatar} name={r.authorDisplayName} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1">
                      {r.authorDisplayName}
                      {r.authorLevel != null && r.authorLevel >= 5 && <span className="text-[10px] bg-[#c5a84a] text-[#0f0f11] px-1.5 rounded-full">Nv.{r.authorLevel}</span>}
                    </div>
                    <div className="text-[10px] text-[#8a826a]">{timeAgo(r.createdAt)}</div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={s <= r.rating ? "text-[#c5a84a] fill-[#c5a84a]" : "text-[#e8e2d4]"} />
                    ))}
                  </div>
                </div>
                {r.title && <h4 className="font-bold text-sm mt-2">{r.title}</h4>}
                <p className="text-sm text-[#1a1815] mt-1 leading-relaxed">{r.content}</p>
                {r.pros.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {r.pros.map((p, i) => (
                      <div key={i} className="text-xs text-emerald-700 flex items-start gap-1.5">
                        <ThumbsUp size={11} className="shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
                {r.cons.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {r.cons.map((c, i) => (
                      <div key={i} className="text-xs text-orange-700 flex items-start gap-1.5">
                        <ThumbsDown size={11} className="shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
