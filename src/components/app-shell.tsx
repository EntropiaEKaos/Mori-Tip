"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Compass,
  Bell,
  MessageCircle,
  Radio,
  User,
  Settings,
  Shield,
  LogOut,
  MapPin,
  Search,
  Menu,
  X,
  Route,
  UsersRound,
  ShoppingBag,
  Wallet,
  Crown,
  Trophy,
  Megaphone,
  CalendarCheck,
} from "lucide-react";
import { CompassLogo } from "@/components/compass-logo";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { me, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!me) return;
    let alive = true;
    async function poll() {
      try {
        const [n, c] = await Promise.all([
          fetch("/api/notifications", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/conversations", { cache: "no-store" }).then((r) => r.json()),
        ]);
        if (!alive) return;
        setUnread(n?.unread ?? 0);
        setUnreadMsg(
          Array.isArray(c) ? c.reduce((s: number, x: { unread?: number }) => s + (x.unread ?? 0), 0) : 0,
        );
      } catch {}
    }
    void poll();
    const id = setInterval(poll, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [me, pathname]);

  const nav = [
    { href: "/feed", label: "Feed", icon: Home },
    { href: "/explore", label: "Explorar", icon: Compass },
    { href: "/roteiros", label: "Roteiros", icon: Route },
    { href: "/guias", label: "Guias", icon: UsersRound },
    { href: "/pousadas", label: "Pousadas", icon: MapPin },
    { href: "/reservas", label: "Reservas", icon: CalendarCheck },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/lives", label: "Lives", icon: Radio },
    { href: "/notifications", label: "Notificações", icon: Bell, badge: unread },
    { href: "/messages", label: "Mensagens", icon: MessageCircle, badge: unreadMsg },
    { href: "/wallet", label: "Carteira", icon: Wallet },
    { href: "/gamification", label: "Níveis", icon: Trophy },
    { href: "/premium", label: "Premium", icon: Crown },
    { href: "/promote", label: "Divulgar", icon: Megaphone },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/");
  }

  return (
    <div className="min-h-screen">
      {/* Top bar mobile */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 h-14">
        <button onClick={() => setMobileOpen((v) => !v)} className="p-2 rounded-lg hover:bg-slate-100">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/feed" className="flex items-center gap-2 font-extrabold text-lg">
          <CompassLogo size={22} />
          <span className="text-[#c5a84a]">Mori</span>
        </Link>
        <Link href="/messages" className="p-2 rounded-lg hover:bg-slate-100 relative">
          <MessageCircle size={20} />
          {unreadMsg > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 grid place-items-center">
              {unreadMsg}
            </span>
          )}
        </Link>
      </div>

      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_320px] gap-6 px-4 py-4">
        {/* Sidebar */}
        <aside
          className={cn(
            "lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:block",
            mobileOpen ? "block" : "hidden",
          )}
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col h-full">
        <Link href="/feed" className="hidden lg:flex items-center gap-2 font-extrabold text-2xl mb-4 px-2 tracking-tight">
          <CompassLogo size={28} />
          <span className="text-[#c5a84a]">Mori</span>
        </Link>
            <nav className="flex flex-col gap-1">
              {nav.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href + "/");
                const Icon = n.icon;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                      active ? "bg-cyan-50 text-cyan-700" : "text-slate-700 hover:bg-slate-100",
                    )}
                  >
                    <Icon size={20} />
                    <span>{n.label}</span>
                    {n.badge != null && n.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {n.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              {me && (
                <Link
                  href={`/u/${me.username}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                    pathname === `/u/${me.username}` ? "bg-cyan-50 text-cyan-700" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <User size={20} />
                  <span>Perfil</span>
                </Link>
              )}
              {me && (
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                    pathname === "/settings" ? "bg-cyan-50 text-cyan-700" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <Settings size={20} />
                  <span>Configurações</span>
                </Link>
              )}
              {me?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                    pathname.startsWith("/admin")
                      ? "bg-orange-50 text-orange-700"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <Shield size={20} />
                  <span>Painel admin</span>
                </Link>
              )}
            </nav>

            <Link
              href="/compose"
              onClick={() => setMobileOpen(false)}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold rounded-xl px-4 py-2.5 text-center"
            >
              Nova publicação
            </Link>

            <div className="mt-auto pt-4">
              {me ? (
                <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#fdfaf4]">
                  <Avatar src={me.avatarUrl} name={me.displayName} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate flex items-center gap-1">
                      {me.displayName}
                      {me.isPremium && <Crown size={12} className="text-[#c5a84a]" />}
                    </div>
                    <div className="text-[11px] text-[#8a826a] truncate">
                      Nv.{me.level} · {me.moris} Moris
                    </div>
                  </div>
                  <button onClick={logout} title="Sair" className="p-2 rounded-lg hover:bg-[#eae3ce]">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="text-center bg-slate-900 text-white rounded-xl px-4 py-2 font-medium"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="text-center border border-slate-300 rounded-xl px-4 py-2 font-medium"
                  >
                    Criar conta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0">{children}</main>

        {/* Right rail */}
        <aside className="hidden xl:block">
          <RightRail />
        </aside>
      </div>
    </div>
  );
}

function RightRail() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<Array<{ id: number; username: string; displayName: string; avatarUrl: string | null; isVerified: boolean }>>([]);
  const [lives, setLives] = useState<Array<{ id: number; title: string; hostDisplayName: string; hostUsername: string; hostAvatar: string | null }>>([]);

  useEffect(() => {
    const id = setTimeout(async () => {
      const r = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
      if (r.ok) setUsers(await r.json());
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    async function load() {
      const r = await fetch("/api/lives");
      if (r.ok) {
        const d = await r.json();
        setLives(d.filter((l: { status: string }) => l.status === "live").slice(0, 3));
      }
    }
    void load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sticky top-4 space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar viajantes e pousadas"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 focus:bg-white border border-transparent focus:border-cyan-500 outline-none text-sm"
          />
        </div>
      </div>

      {lives.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 live-pulse" />
            <h3 className="font-semibold text-sm">Lives agora</h3>
          </div>
          <div className="space-y-2">
            {lives.map((l) => (
              <Link
                key={l.id}
                href={`/lives/${l.id}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50"
              >
                <Avatar src={l.hostAvatar} name={l.hostDisplayName} size={32} />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{l.title}</div>
                  <div className="text-xs text-slate-500 truncate">@{l.hostUsername}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-sm mb-3">Sugestões</h3>
        <div className="space-y-2">
          {users.slice(0, 5).map((u) => (
            <Link
              key={u.id}
              href={`/u/${u.username}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50"
            >
              <Avatar src={u.avatarUrl} name={u.displayName} size={36} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate flex items-center gap-1">
                  {u.displayName}
                  {u.isVerified && <span className="text-cyan-500">●</span>}
                </div>
                <div className="text-xs text-slate-500 truncate">@{u.username}</div>
              </div>
            </Link>
          ))}
          {users.length === 0 && <p className="text-xs text-slate-500">Ninguém encontrado.</p>}
        </div>
      </div>

      <div className="text-[11px] text-slate-500 px-2">
        Mori © {new Date().getFullYear()} · Feito para viajantes
      </div>
    </div>
  );
}
