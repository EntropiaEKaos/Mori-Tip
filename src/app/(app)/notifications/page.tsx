"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, MessageCircle, UserPlus, Radio, Bell, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/utils";

type Notif = {
  id: number;
  type: "like" | "comment" | "follow" | "mention" | "message" | "live" | "system";
  message: string;
  entityId: number | null;
  isRead: boolean;
  createdAt: string;
  actorId: number | null;
  actorUsername: string | null;
  actorAvatar: string | null;
};

const ICONS: Record<Notif["type"], React.ReactNode> = {
  like: <Heart size={16} className="text-red-500" />,
  comment: <MessageCircle size={16} className="text-cyan-500" />,
  follow: <UserPlus size={16} className="text-emerald-500" />,
  mention: <MessageSquare size={16} className="text-violet-500" />,
  message: <MessageCircle size={16} className="text-emerald-500" />,
  live: <Radio size={16} className="text-red-500" />,
  system: <Bell size={16} className="text-slate-500" />,
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);

  const load = useCallback(async () => {
    const r = await fetch("/api/notifications", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setItems(d.items);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markAll() {
    await fetch("/api/notifications", { method: "POST" });
    load();
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Notificações</h1>
        <button onClick={markAll} className="text-sm text-cyan-600 font-medium hover:underline">
          Marcar todas como lidas
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {items.length === 0 && (
          <p className="text-center text-sm text-slate-500 p-10">
            Você não tem notificações ainda.
          </p>
        )}
        {items.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-4 ${n.isRead ? "" : "bg-cyan-50/40"}`}
          >
            <div className="relative">
              {n.actorUsername ? (
                <Avatar src={n.actorAvatar} name={n.actorUsername} size={40} />
              ) : (
                <div className="w-10 h-10 bg-slate-100 rounded-full grid place-items-center">
                  <Bell size={16} className="text-slate-500" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 grid place-items-center">
                {ICONS[n.type]}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-slate-500 mt-0.5">{timeAgo(n.createdAt)}</p>
            </div>
            {!n.isRead && <span className="w-2 h-2 rounded-full bg-cyan-500 mt-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
