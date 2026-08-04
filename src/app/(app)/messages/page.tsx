"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { Plus, Search } from "lucide-react";

type Conv = {
  id: number;
  isGroup: boolean;
  title: string | null;
  lastMessageAt: string;
  members: { userId: number; username: string; displayName: string; avatarUrl: string | null }[];
  lastMessage: { content: string; type: string; createdAt: string; senderId: number } | null;
  unread: number;
};
type UserItem = { id: number; username: string; displayName: string; avatarUrl: string | null };

export default function MessagesPage() {
  const { me } = useAuth();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);

  const load = useCallback(async () => {
    const r = await fetch("/api/conversations", { cache: "no-store" });
    if (r.ok) setConvs(await r.json());
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!newOpen) return;
    const t = setTimeout(async () => {
      const r = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
      if (r.ok) setUsers(await r.json());
    }, 200);
    return () => clearTimeout(t);
  }, [q, newOpen]);

  async function startChat(userId: number) {
    const r = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const d = await r.json();
    if (r.ok) {
      window.location.href = `/messages/${d.id}`;
    }
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Mensagens</h1>
        <button
          onClick={() => setNewOpen((v) => !v)}
          className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
        >
          <Plus size={16} /> Nova conversa
        </button>
      </div>

      {newOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 p-3">
          <div className="relative mb-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar viajante para conversar"
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-lg outline-none text-sm"
            />
          </div>
          <div className="max-h-60 overflow-auto scrollbar-thin divide-y divide-slate-100">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => startChat(u.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 text-left"
              >
                <Avatar src={u.avatarUrl} name={u.displayName} size={36} />
                <div>
                  <div className="text-sm font-semibold">{u.displayName}</div>
                  <div className="text-xs text-slate-500">@{u.username}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {convs.length === 0 && (
          <p className="text-sm text-slate-500 p-8 text-center">
            Sem conversas. Comece uma nova!
          </p>
        )}
        {convs.map((c) => {
          const other = c.members.find((m) => m.userId !== me?.id) ?? c.members[0];
          const name = c.title || other?.displayName || "Conversa";
          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center gap-3 p-3 hover:bg-slate-50"
            >
              <Avatar src={other?.avatarUrl} name={name} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-semibold text-sm truncate">{name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(c.lastMessageAt)}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-xs text-slate-500 truncate">
                    {c.lastMessage?.content ?? "Sem mensagens ainda"}
                  </p>
                  {c.unread > 0 && (
                    <span className="bg-cyan-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
