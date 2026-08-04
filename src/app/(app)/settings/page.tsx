"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";

export default function SettingsPage() {
  const { me, refresh, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", bio: "", location: "", avatarUrl: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!me) {
      router.push("/login");
      return;
    }
    setForm({
      displayName: me.displayName ?? "",
      bio: me.bio ?? "",
      location: me.location ?? "",
      avatarUrl: me.avatarUrl ?? "",
    });
  }, [me, loading, router]);

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2_000_000) return alert("Máx 2MB");
    const url = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(f);
    });
    const img = new Image();
    img.onload = () => {
      const size = 400;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      ctx.drawImage(
        img,
        (img.width - min) / 2,
        (img.height - min) / 2,
        min,
        min,
        0,
        0,
        size,
        size,
      );
      setForm((f) => ({ ...f, avatarUrl: c.toDataURL("image/jpeg", 0.85) }));
    };
    img.src = url;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    const d = await r.json();
    if (!r.ok) {
      setMsg(d.error || "Erro");
      return;
    }
    setMsg("Perfil atualizado!");
    await refresh();
  }

  if (!me) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h1 className="text-lg font-bold">Configurações</h1>
      </div>
      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar src={form.avatarUrl || null} name={form.displayName || me.displayName} size={72} />
          <label className="text-sm text-cyan-600 font-semibold cursor-pointer hover:underline">
            <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
            Trocar foto
          </label>
        </div>
        <div>
          <label className="text-xs text-slate-500">Nome de exibição</label>
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-cyan-500 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-cyan-500 text-sm min-h-24"
            maxLength={500}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Localização</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-cyan-500 text-sm"
          />
        </div>
        {msg && <p className="text-sm text-cyan-700">{msg}</p>}
        <button
          type="submit"
          disabled={busy}
          className="bg-slate-900 text-white rounded-xl px-6 py-2.5 font-semibold disabled:opacity-50"
        >
          {busy ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
