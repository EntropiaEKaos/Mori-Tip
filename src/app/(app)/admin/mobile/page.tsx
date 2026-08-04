"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Plus, Smartphone } from "lucide-react";

type MobileApp = {
  id: number;
  platform: "ios" | "android" | "web";
  version: string;
  buildNumber: number;
  isForceUpdate: boolean;
  minSupportedVersion: string;
  storeUrl: string | null;
  releaseNotes: string;
  isActive: boolean;
  createdAt: string;
};

export default function MobileAdminPage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<MobileApp[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: "ios",
    version: "1.0.0",
    buildNumber: "1",
    isForceUpdate: false,
    minSupportedVersion: "1.0.0",
    storeUrl: "",
    releaseNotes: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!me || me.role !== "admin") router.push("/feed");
    else load();
  }, [me, loading, router]);

  async function load() {
    const r = await fetch("/api/admin/mobile");
    if (r.ok) setApps(await r.json());
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/mobile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setMsg("App salvo com sucesso!");
      setShowForm(false);
      load();
    } else {
      setMsg("Erro ao salvar");
    }
  }

  async function toggleActive(id: number, active: boolean) {
    await fetch("/api/admin/mobile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: active }),
    });
    load();
  }

  if (!me || me.role !== "admin") return null;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-2"><Smartphone className="text-[#c5a84a]" /> Apps Mobile</h1>
          <p className="text-xs text-[#8a826a]">Controle de versões e force-update</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 bg-[#0f0f11] text-[#c5a84a] px-3 py-2 rounded-xl text-sm font-bold">
          <Plus size={16} /> Nova Versão
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white rounded-2xl border border-[#eae3ce] p-4 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as any })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm">
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="web">Web (PWA)</option>
            </select>
            <input placeholder="Versão (1.2.3)" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Build Number" value={form.buildNumber} onChange={(e) => setForm({ ...form, buildNumber: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
            <input placeholder="Mínima suportada" value={form.minSupportedVersion} onChange={(e) => setForm({ ...form, minSupportedVersion: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          </div>
          <input placeholder="URL da App Store / Play Store" value={form.storeUrl} onChange={(e) => setForm({ ...form, storeUrl: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <textarea placeholder="Release notes" value={form.releaseNotes} onChange={(e) => setForm({ ...form, releaseNotes: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm min-h-20" />
          <label className="flex items-center gap-2 text-sm text-[#8a826a]">
            <input type="checkbox" checked={form.isForceUpdate} onChange={(e) => setForm({ ...form, isForceUpdate: e.target.checked })} /> Force Update
          </label>
          <button className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold rounded-xl py-2.5">Publicar Versão</button>
          {msg && <p className="text-sm text-[#9b8038]">{msg}</p>}
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#eae3ce] divide-y divide-[#f5f1e8]">
        {apps.length === 0 && <p className="p-6 text-sm text-[#a89f80] text-center">Nenhuma versão cadastrada.</p>}
        {apps.map((app) => (
          <div key={app.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-extrabold flex items-center gap-2">
                {app.platform.toUpperCase()} v{app.version} (build {app.buildNumber})
                {app.isForceUpdate && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">FORCE UPDATE</span>}
              </div>
              <div className="text-xs text-[#8a826a]">Mínima: {app.minSupportedVersion} · {new Date(app.createdAt).toLocaleDateString("pt-BR")}</div>
              {app.releaseNotes && <p className="text-sm text-[#5c5648] mt-1">{app.releaseNotes}</p>}
            </div>
            <button
              onClick={() => toggleActive(app.id, !app.isActive)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold ${app.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
            >
              {app.isActive ? "Ativo" : "Inativo"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
