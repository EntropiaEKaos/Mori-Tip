"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Wallet } from "lucide-react";
import { Avatar } from "@/components/avatar";

type Itin = {
  id: number;
  title: string;
  description: string;
  city: string;
  state: string;
  days: number;
  budget: number;
  tags: string[];
  stops: Array<{ day: number; title: string; description: string; location?: string }>;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string | null;
};

export default function RoteiroDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [it, setIt] = useState<Itin | null>(null);

  useEffect(() => {
    fetch(`/api/itineraries/${id}`).then(async (r) => {
      if (r.ok) setIt(await r.json());
    });
  }, [id]);

  if (!it) return <p className="p-4 text-sm text-[#8a826a]">Carregando roteiro...</p>;

  const byDay = new Map<number, typeof it.stops>();
  for (const s of it.stops || []) {
    const arr = byDay.get(s.day) ?? [];
    arr.push(s);
    byDay.set(s.day, arr);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#eae3ce] overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-[#0f0f11] via-[#1a1815] to-[#c5a84a] p-4 flex items-end">
          <Link href="/roteiros" className="absolute top-6 left-8 p-2 rounded-lg bg-black/30 text-white">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#fdf5d8]">{it.title}</h1>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Avatar src={it.authorAvatar} name={it.authorDisplayName} size={36} />
            <div>
              <div className="text-sm font-bold">{it.authorDisplayName}</div>
              <div className="text-xs text-[#8a826a]">@{it.authorUsername}</div>
            </div>
          </div>
          <p className="text-sm text-[#5c5648]">{it.description}</p>
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="flex items-center gap-1 bg-[#f5f1e8] px-2 py-1 rounded-full"><MapPin size={11} /> {it.city}, {it.state}</span>
            <span className="flex items-center gap-1 bg-[#f5f1e8] px-2 py-1 rounded-full"><Calendar size={11} /> {it.days} dias</span>
            <span className="flex items-center gap-1 bg-[#f5f1e8] px-2 py-1 rounded-full"><Wallet size={11} /> R$ {it.budget}</span>
          </div>
        </div>
      </div>

      {[...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([day, stops]) => (
        <div key={day} className="bg-white rounded-2xl border border-[#eae3ce] p-4">
          <h2 className="font-extrabold text-[#c5a84a] mb-3">Dia {day}</h2>
          <div className="space-y-3">
            {stops.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0f0f11] text-[#c5a84a] grid place-items-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold text-sm">{s.title}</div>
                  <p className="text-sm text-[#5c5648]">{s.description}</p>
                  {s.location && <p className="text-xs text-[#a89f80] mt-0.5 flex items-center gap-1"><MapPin size={10} /> {s.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export const dynamic = "force-dynamic";
