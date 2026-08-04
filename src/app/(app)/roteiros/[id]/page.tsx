"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Wallet, UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/components/auth-provider";

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

type Collab = {
  userId: number;
  role: string;
  invitedAt: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export default function RoteiroDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { me } = useAuth();
  const [it, setIt] = useState<Itin | null>(null);
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [showInvite, setShowInvite] = useState(false);

  async function load() {
    const r = await fetch(`/api/itineraries/${id}`);
    if (r.ok) setIt(await r.json());
    const cr = await fetch(`/api/itineraries/${id}/collaborators`);
    if (cr.ok) setCollabs(await cr.json());
  }
  useEffect(() => {
    void load();
  }, [id]);

  if (!it) return <p className="p-4 text-sm text-[#8a826a]">Carregando roteiro...</p>;

  const byDay = new Map<number, typeof it.stops>();
  for (const s of it.stops || []) {
    const arr = byDay.get(s.day) ?? [];
    arr.push(s);
    byDay.set(s.day, arr);
  }
  const isOwner = me?.username === it.authorUsername;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e8e2d4] rounded-3xl overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-[#0f0f11] via-[#1a1815] to-[#9b8038] p-6 flex items-end relative">
          <Link href="/roteiros" className="absolute top-5 left-5 p-2 rounded-full bg-black/30 backdrop-blur text-white">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="text-[10px] tracking-[2px] text-[#c5a84a] font-bold mb-1">ROTEIRO</div>
            <h1 className="text-3xl font-extrabold tracking-[-1.5px] text-white">{it.title}</h1>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Avatar src={it.authorAvatar} name={it.authorDisplayName} size={36} />
            <div>
              <div className="text-sm font-bold">{it.authorDisplayName}</div>
              <div className="text-xs text-[#8a826a]">@{it.authorUsername}</div>
            </div>
          </div>
          <p className="text-sm text-[#5c5648] leading-relaxed">{it.description}</p>
          <div className="flex flex-wrap gap-2 mt-4 text-xs">
            <span className="flex items-center gap-1 bg-[#fdfaf4] border border-[#e8e2d4] px-3 py-1 rounded-full"><MapPin size={11} className="text-[#c5a84a]" /> {it.city}, {it.state}</span>
            <span className="flex items-center gap-1 bg-[#fdfaf4] border border-[#e8e2d4] px-3 py-1 rounded-full"><Calendar size={11} className="text-[#c5a84a]" /> {it.days} dias</span>
            <span className="flex items-center gap-1 bg-[#fdfaf4] border border-[#e8e2d4] px-3 py-1 rounded-full"><Wallet size={11} className="text-[#c5a84a]" /> R$ {it.budget}</span>
          </div>
        </div>
      </div>

      {/* Colaboradores */}
      <div className="bg-white border border-[#e8e2d4] rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-sm">Colaboradores ({collabs.length})</h2>
          {isOwner && (
            <button
              onClick={() => setShowInvite((v) => !v)}
              className="text-xs font-bold bg-[#0f0f11] text-[#c5a84a] px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-[#1a1815] transition"
            >
              <UserPlus size={12} /> Convidar
            </button>
          )}
        </div>
        {showInvite && <InviteForm itineraryId={it.id} onInvited={() => { setShowInvite(false); load(); }} />}
        {collabs.length === 0 ? (
          <p className="text-xs text-[#8a826a]">Nenhum colaborador ainda. Convide amigos para editar juntos!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {collabs.map((c) => (
              <div key={c.userId} className="flex items-center gap-2 p-2 bg-[#fdfaf4] border border-[#e8e2d4] rounded-2xl">
                <Avatar src={c.avatarUrl} name={c.displayName} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{c.displayName}</div>
                  <div className="text-[10px] text-[#8a826a]">{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {[...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([day, stops]) => (
        <div key={day} className="bg-white border border-[#e8e2d4] rounded-3xl p-5">
          <h2 className="font-extrabold text-sm text-[#c5a84a] mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#0f0f11] text-[#c5a84a] grid place-items-center text-xs">{day}</span>
            Dia {day}
          </h2>
          <div className="space-y-3">
            {stops.map((s, i) => (
              <div key={i} className="flex gap-3 pl-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c5a84a] mt-2 shrink-0" />
                <div>
                  <div className="font-bold text-sm">{s.title}</div>
                  <p className="text-sm text-[#5c5648]">{s.description}</p>
                  {s.location && <p className="text-xs text-[#8a826a] mt-0.5 flex items-center gap-1"><MapPin size={10} /> {s.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function InviteForm({ itineraryId, onInvited }: { itineraryId: number; onInvited: () => void }) {
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username) return;
    setBusy(true);
    const ur = await fetch(`/api/users/${username}`);
    if (!ur.ok) { setBusy(false); return alert("Usuário não encontrado"); }
    const user = await ur.json();
    const r = await fetch(`/api/itineraries/${itineraryId}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, role: "editor" }),
    });
    setBusy(false);
    if (r.ok) { setUsername(""); onInvited(); }
    else { const d = await r.json(); alert(d.error || "Erro"); }
  }
  return (
    <form onSubmit={submit} className="flex gap-2 mb-3">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="@usuario"
        className="flex-1 bg-[#fdfaf4] border border-[#e8e2d4] rounded-full px-3 py-1.5 text-sm outline-none focus:border-[#c5a84a]"
      />
      <button disabled={busy} className="bg-[#0f0f11] text-[#c5a84a] rounded-full px-3 py-1.5 text-xs font-bold">
        Convidar
      </button>
    </form>
  );
}

export const dynamic = "force-dynamic";
