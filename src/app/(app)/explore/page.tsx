"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { Search } from "lucide-react";

type User = { id: number; username: string; displayName: string; avatarUrl: string | null; bio: string; isVerified: boolean; role: string };

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const r = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
      if (r.ok) setUsers(await r.json());
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar viajantes e anfitriões"
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-100 outline-none focus:bg-white focus:ring-1 focus:ring-cyan-500 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {users.length === 0 && <p className="text-sm text-slate-500 p-6 text-center">Nenhum viajante encontrado.</p>}
        {users.map((u) => (
          <Link
            key={u.id}
            href={`/u/${u.username}`}
            className="flex items-start gap-3 p-4 hover:bg-slate-50"
          >
            <Avatar src={u.avatarUrl} name={u.displayName} size={48} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{u.displayName}</span>
                {u.isVerified && <span className="text-cyan-500 text-xs">✔</span>}
                {u.role === "host" && (
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                    Anfitrião
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">@{u.username}</div>
              {u.bio && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{u.bio}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
