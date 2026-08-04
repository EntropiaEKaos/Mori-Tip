"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users as UsersIcon,
  FileText,
  MessageSquare,
  Radio,
  MapPin,
  Bell,
  ShieldAlert,
  Send,
  CheckCircle2,
  XCircle,
  Trash2,
  Settings,
  HardDrive,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { cn, timeAgo } from "@/lib/utils";

type Stats = {
  users: number;
  posts: number;
  comments: number;
  lives: number;
  liveNow: number;
  inns: number;
  pendingInns: number;
  notifications: number;
  messages: number;
  bannedUsers: number;
};

type AdminUser = {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: "user" | "host" | "admin";
  isVerified: boolean;
  isBanned: boolean;
  avatarUrl: string | null;
  createdAt: string;
};

type AdminPost = {
  id: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  isHidden: boolean;
  authorUsername: string;
  authorDisplayName: string;
};

type AdminInn = {
  id: number;
  name: string;
  slug: string;
  city: string;
  state: string;
  isApproved: boolean;
  coverUrl: string | null;
  createdAt: string;
  ownerUsername: string;
};

const TABS = ["stats", "users", "posts", "inns", "broadcast", "settings", "storage"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [inns, setInns] = useState<AdminInn[]>([]);
  const [broadcast, setBroadcast] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState<string | null>(null);
  
  // Settings Integration States
  const [configs, setConfigs] = useState({
    mercadopago_access_token: "",
    mercadopago_public_key: "",
    onesignal_app_id: "",
    onesignal_api_key: "",
    firebase_project_id: "",
    firebase_api_key: "",
  });
  const [saveMsg, setSaveMsg] = useState("");

  // Storage Config
  const [storage, setStorage] = useState({
    provider: "server",
    s3_endpoint: "",
    s3_region: "us-east-1",
    s3_bucket: "",
    s3_access_key: "",
    s3_secret_key: "",
    s3_public_url: "",
    cloudinary_cloud_name: "",
    cloudinary_api_key: "",
    cloudinary_api_secret: "",
  });
  const [storageMsg, setStorageMsg] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!me || me.role !== "admin") {
      router.push("/feed");
    }
  }, [me, loading, router]);

  useEffect(() => {
    if (!me || me.role !== "admin") return;
    (async () => {
      if (tab === "stats") {
        const r = await fetch("/api/admin/stats");
        if (r.ok) setStats(await r.json());
      }
      if (tab === "users") {
        const r = await fetch("/api/admin/users");
        if (r.ok) setUsers(await r.json());
      }
      if (tab === "posts") {
        const r = await fetch("/api/admin/posts");
        if (r.ok) setPosts(await r.json());
      }
      if (tab === "inns") {
        const r = await fetch("/api/admin/inns");
        if (r.ok) setInns(await r.json());
      }
      if (tab === "settings") {
        const r = await fetch("/api/admin/settings");
        if (r.ok) {
          const d = await r.json();
          setConfigs({
            mercadopago_access_token: d.mercadopago_access_token || "",
            mercadopago_public_key: d.mercadopago_public_key || "",
            onesignal_app_id: d.onesignal_app_id || "",
            onesignal_api_key: d.onesignal_api_key || "",
            firebase_project_id: d.firebase_project_id || "",
            firebase_api_key: d.firebase_api_key || "",
          });
        }
      }
      if (tab === "storage") {
        const r = await fetch("/api/admin/settings");
        if (r.ok) {
          const d = await r.json();
          setStorage({
            provider: d.storage_provider || "server",
            s3_endpoint: d.s3_endpoint || "",
            s3_region: d.s3_region || "us-east-1",
            s3_bucket: d.s3_bucket || "",
            s3_access_key: d.s3_access_key || "",
            s3_secret_key: d.s3_secret_key || "",
            s3_public_url: d.s3_public_url || "",
            cloudinary_cloud_name: d.cloudinary_cloud_name || "",
            cloudinary_api_key: d.cloudinary_api_key || "",
            cloudinary_api_secret: d.cloudinary_api_secret || "",
          });
        }
      }
    })();
  }, [tab, me]);

  async function updateUser(id: number, patch: Partial<AdminUser>) {
    const r = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (r.ok) {
      const list = await fetch("/api/admin/users").then((r) => r.json());
      setUsers(list);
    }
  }

  async function deletePost(id: number) {
    if (!confirm("Apagar post?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    const list = await fetch("/api/admin/posts").then((r) => r.json());
    setPosts(list);
  }

  async function hidePost(id: number, hide: boolean) {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden: hide }),
    });
    const list = await fetch("/api/admin/posts").then((r) => r.json());
    setPosts(list);
  }

  async function approveInn(id: number, approved: boolean) {
    await fetch("/api/admin/inns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isApproved: approved }),
    });
    const list = await fetch("/api/admin/inns").then((r) => r.json());
    setInns(list);
  }

  async function deleteInn(id: number) {
    if (!confirm("Apagar pousada?")) return;
    await fetch(`/api/admin/inns?id=${id}`, { method: "DELETE" });
    const list = await fetch("/api/admin/inns").then((r) => r.json());
    setInns(list);
  }

  async function sendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    setBroadcastMsg(null);
    const r = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: broadcast }),
    });
    const d = await r.json();
    if (r.ok) {
      setBroadcast("");
      setBroadcastMsg(`Notificação enviada para ${d.count} usuários`);
    } else {
      setBroadcastMsg(d.error || "Erro");
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaveMsg("");
    const r = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configs),
    });
    if (r.ok) {
      setSaveMsg("Configurações atualizadas com sucesso!");
    } else {
      setSaveMsg("Falha ao salvar configurações.");
    }
  }

  async function saveStorage(e: React.FormEvent) {
    e.preventDefault();
    setStorageMsg("");
    const r = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(storage),
    });
    if (r.ok) {
      setStorageMsg(`Storage configurado: ${storage.provider.toUpperCase()}`);
    } else {
      setStorageMsg("Falha ao salvar storage.");
    }
  }

  if (!me || me.role !== "admin") return null;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 flex items-center gap-3">
        <ShieldAlert size={28} className="text-orange-300" />
        <div>
          <h1 className="text-xl font-bold">Painel de administração</h1>
          <p className="text-xs text-slate-300">Controle total e integrações Mori</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 flex flex-wrap overflow-hidden">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold capitalize transition",
              tab === t ? "text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50/10" : "text-slate-500 hover:bg-slate-50",
            )}
          >
            {t === "stats"
              ? "Visão geral"
              : t === "users"
              ? "Usuários"
              : t === "posts"
              ? "Publicações"
              : t === "inns"
              ? "Pousadas"
              : t === "broadcast"
              ? "Comunicados"
              : t === "settings"
              ? "Integrações"
              : "Storage"}
          </button>
        ))}
      </div>

      {tab === "stats" && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Usuários" value={stats.users} icon={<UsersIcon />} color="from-cyan-500 to-cyan-700" />
          <StatCard label="Publicações" value={stats.posts} icon={<FileText />} color="from-violet-500 to-violet-700" />
          <StatCard label="Comentários" value={stats.comments} icon={<MessageSquare />} color="from-emerald-500 to-emerald-700" />
          <StatCard label="Mensagens" value={stats.messages} icon={<MessageSquare />} color="from-teal-500 to-teal-700" />
          <StatCard label="Lives" value={stats.lives} icon={<Radio />} color="from-red-500 to-red-700" />
          <StatCard label="Pousadas" value={stats.inns} icon={<MapPin />} color="from-amber-500 to-amber-700" />
          <StatCard label="Notificações" value={stats.notifications} icon={<Bell />} color="from-purple-500 to-purple-700" />
          <StatCard label="Banidos" value={stats.bannedUsers} icon={<ShieldAlert />} color="from-slate-700 to-slate-900" />
        </div>
      )}

      {tab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="text-left p-3">Usuário</th>
                <th className="text-left p-3">Papel</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <Link href={`/u/${u.username}`} className="flex items-center gap-2">
                      <Avatar src={u.avatarUrl} name={u.displayName} size={32} />
                      <div>
                        <div className="font-semibold">{u.displayName}</div>
                        <div className="text-xs text-slate-500">@{u.username} · {u.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value as any })}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    >
                      <option value="user">Viajante</option>
                      <option value="host">Anfitrião</option>
                      <option value="guide">Guia local</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3 space-x-1">
                    {u.isVerified && (
                      <span className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full">Verificado</span>
                    )}
                    {u.isBanned && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Banido</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => updateUser(u.id, { isVerified: !u.isVerified })}
                      className="text-xs px-2 py-1 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                    >
                      {u.isVerified ? "Remover ✔" : "Verificar"}
                    </button>
                    <button
                      onClick={() => updateUser(u.id, { isBanned: !u.isBanned })}
                      className={cn(
                        "text-xs px-2 py-1 rounded-lg",
                        u.isBanned ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-700 hover:bg-red-100",
                      )}
                    >
                      {u.isBanned ? "Desbanir" : "Banir"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "posts" && (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {posts.map((p) => (
            <div key={p.id} className="p-3 flex gap-3 items-start hover:bg-slate-50">
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500">
                  @{p.authorUsername} · {timeAgo(p.createdAt)}
                  {p.isHidden && (
                    <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="text-sm line-clamp-3">{p.content || <em className="text-slate-400">(sem texto)</em>}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => hidePost(p.id, !p.isHidden)}
                  className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  {p.isHidden ? "Reexibir" : "Ocultar"}
                </button>
                <button
                  onClick={() => deletePost(p.id)}
                  className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1 justify-center"
                >
                  <Trash2 size={12} /> Apagar
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-center text-sm text-slate-500 p-8">Sem posts.</p>}
        </div>
      )}

      {tab === "inns" && (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {inns.map((i) => (
            <div key={i.id} className="p-3 flex gap-3 items-center hover:bg-slate-50">
              <div className="w-14 h-14 bg-slate-100 rounded-lg grid place-items-center text-slate-400">
                <MapPin size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{i.name}</div>
                <div className="text-xs text-slate-500">
                  {i.city}, {i.state} · @{i.ownerUsername} · {timeAgo(i.createdAt)}
                </div>
              </div>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full",
                  i.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700",
                )}
              >
                {i.isApproved ? "Aprovada" : "Pendente"}
              </span>
              <button
                onClick={() => approveInn(i.id, !i.isApproved)}
                className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center gap-1"
              >
                {i.isApproved ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                {i.isApproved ? "Suspender" : "Aprovar"}
              </button>
              <button
                onClick={() => deleteInn(i.id)}
                className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {inns.length === 0 && <p className="text-center text-sm text-slate-500 p-8">Sem pousadas cadastradas.</p>}
        </div>
      )}

      {tab === "broadcast" && (
        <form onSubmit={sendBroadcast} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold">Enviar comunicado para todos os usuários</h2>
          <textarea
            value={broadcast}
            onChange={(e) => setBroadcast(e.target.value)}
            placeholder="Escreva um aviso, novidade ou atualização..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-cyan-500 text-sm min-h-24"
            maxLength={300}
            required
          />
          <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2 font-semibold text-sm flex items-center gap-2">
            <Send size={14} /> Enviar broadcast
          </button>
          {broadcastMsg && <p className="text-sm text-cyan-700">{broadcastMsg}</p>}
        </form>
      )}

      {tab === "storage" && (
        <form onSubmit={saveStorage} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-extrabold flex items-center gap-1 text-cyan-700">
            <HardDrive size={18} /> Storage & Mídia
          </h2>
          <p className="text-xs text-slate-500">Escolha onde as imagens, vídeos e mídias enviadas pelos usuários serão armazenadas.</p>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { value: "server", label: "Servidor Local", desc: "Imagens como dataURL no Postgres. Ideal para demo/testes." },
              { value: "s3", label: "AWS S3", desc: "Bucket S3 da Amazon Web Services." },
              { value: "r2", label: "Cloudflare R2", desc: "R2 da Cloudflare, compatível com API S3 (mesma config)." },
              { value: "cloudinary", label: "Cloudinary", desc: "CDN com transformações automáticas de imagem." },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStorage({ ...storage, provider: opt.value })}
                className={`text-left p-4 rounded-2xl border transition ${
                  storage.provider === opt.value
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-cyan-300"
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  {opt.label}
                  {storage.provider === opt.value && <span className="text-cyan-600">●</span>}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>

          {(storage.provider === "s3" || storage.provider === "r2") && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">
                {storage.provider === "r2" ? "Configuração Cloudflare R2" : "Configuração AWS S3"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-xs text-slate-600 block">Endpoint (R2 ou custom)
                  <input value={storage.s3_endpoint} onChange={(e) => setStorage({ ...storage, s3_endpoint: e.target.value })} placeholder={storage.provider === "r2" ? "https://<account>.r2.cloudflarestorage.com" : "https://s3.us-east-1.amazonaws.com"} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500" />
                </label>
                <label className="text-xs text-slate-600 block">Região
                  <input value={storage.s3_region} onChange={(e) => setStorage({ ...storage, s3_region: e.target.value })} placeholder="us-east-1" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500" />
                </label>
                <label className="text-xs text-slate-600 block">Bucket
                  <input value={storage.s3_bucket} onChange={(e) => setStorage({ ...storage, s3_bucket: e.target.value })} placeholder="mori-uploads" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500" />
                </label>
                <label className="text-xs text-slate-600 block">URL pública (opcional)
                  <input value={storage.s3_public_url} onChange={(e) => setStorage({ ...storage, s3_public_url: e.target.value })} placeholder="https://cdn.mori.app" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500" />
                </label>
                <label className="text-xs text-slate-600 block">Access Key ID
                  <input type="password" value={storage.s3_access_key} onChange={(e) => setStorage({ ...storage, s3_access_key: e.target.value })} placeholder="AKIA..." className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500" />
                </label>
                <label className="text-xs text-slate-600 block">Secret Access Key
                  <input type="password" value={storage.s3_secret_key} onChange={(e) => setStorage({ ...storage, s3_secret_key: e.target.value })} placeholder="••••••" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500" />
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                {storage.provider === "r2"
                  ? "Para R2, gere um Access Key em Cloudflare → R2 → Manage R2 API Tokens."
                  : "Para S3, crie um IAM User com permissão PutObject no bucket."}
              </p>
            </div>
          )}

          {storage.provider === "cloudinary" && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Configuração Cloudinary</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-xs text-slate-600 block">Cloud Name
                  <input value={storage.cloudinary_cloud_name} onChange={(e) => setStorage({ ...storage, cloudinary_cloud_name: e.target.value })} placeholder="mori-cloud" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500" />
                </label>
                <label className="text-xs text-slate-600 block">API Key
                  <input value={storage.cloudinary_api_key} onChange={(e) => setStorage({ ...storage, cloudinary_api_key: e.target.value })} placeholder="1234567890" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500" />
                </label>
                <label className="text-xs text-slate-600 block sm:col-span-2">API Secret
                  <input type="password" value={storage.cloudinary_api_secret} onChange={(e) => setStorage({ ...storage, cloudinary_api_secret: e.target.value })} placeholder="••••••" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500" />
                </label>
              </div>
            </div>
          )}

          {storage.provider === "server" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              ⚠️ Modo demo: as mídias ficam como dataURL no Postgres. Para produção, escolha S3, R2 ou Cloudinary.
            </div>
          )}

          <button className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-4 py-2 font-bold text-xs">
            Salvar Storage
          </button>
          {storageMsg && <p className="text-xs font-semibold text-green-700">{storageMsg}</p>}
        </form>
      )}

      {tab === "settings" && (
        <form onSubmit={saveSettings} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-extrabold flex items-center gap-1 text-cyan-700">
            <Settings size={18} /> Integrações Globais & Chaves API
          </h2>
          <p className="text-xs text-slate-500">Insira as credenciais reais para conectar com os serviços correspondentes em produção.</p>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h3 className="font-bold text-sm text-slate-800">1. Mercado Pago (Monetização de Moris)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-xs text-slate-600 block">Access Token
                <input
                  type="password"
                  value={configs.mercadopago_access_token}
                  onChange={(e) => setConfigs({ ...configs, mercadopago_access_token: e.target.value })}
                  placeholder="TEST-..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500"
                />
              </label>
              <label className="text-xs text-slate-600 block">Public Key
                <input
                  value={configs.mercadopago_public_key}
                  onChange={(e) => setConfigs({ ...configs, mercadopago_public_key: e.target.value })}
                  placeholder="APP_USR-..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h3 className="font-bold text-sm text-slate-800">2. Firebase Auth (Login por Número de Celular)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-xs text-slate-600 block">Project ID
                <input
                  value={configs.firebase_project_id}
                  onChange={(e) => setConfigs({ ...configs, firebase_project_id: e.target.value })}
                  placeholder="mori-app-firebase"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500"
                />
              </label>
              <label className="text-xs text-slate-600 block">Web API Key
                <input
                  type="password"
                  value={configs.firebase_api_key}
                  onChange={(e) => setConfigs({ ...configs, firebase_api_key: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h3 className="font-bold text-sm text-slate-800">3. OneSignal (Disparador de Push Push / Web)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-xs text-slate-600 block">OneSignal App ID
                <input
                  value={configs.onesignal_app_id}
                  onChange={(e) => setConfigs({ ...configs, onesignal_app_id: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500"
                />
              </label>
              <label className="text-xs text-slate-600 block">REST API Key
                <input
                  type="password"
                  value={configs.onesignal_api_key}
                  onChange={(e) => setConfigs({ ...configs, onesignal_api_key: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs mt-1 outline-none focus:border-cyan-500"
                />
              </label>
            </div>
          </div>

          <button className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-4 py-2 font-bold text-xs">
            Salvar Chaves Globais
          </button>

          {saveMsg && <p className="text-xs font-semibold text-green-700">{saveMsg}</p>}
        </form>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} text-white grid place-items-center`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}
