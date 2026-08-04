"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";

type FeatureFlag = {
  id: number;
  key: string;
  name: string;
  description: string;
  enabledForRoles: string[];
  enabledForPremium: boolean;
  isActive: boolean;
  updatedAt: string;
};

export default function FeatureFlagsPage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    key: "",
    name: "",
    description: "",
    enabledForRoles: ["user", "host", "guide", "admin"],
    enabledForPremium: false,
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!me || me.role !== "admin") router.push("/feed");
    else load();
  }, [me, loading, router]);

  async function load() {
    const r = await fetch("/api/admin/features");
    if (r.ok) setFlags(await r.json());
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setMsg("Feature flag criada!");
      setShowForm(false);
      load();
    } else setMsg("Erro");
  }

  async function toggle(id: number, active: boolean) {
    await fetch("/api/admin/features", {
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
          <h1 className="text-lg font-extrabold flex items-center gap-2">Feature Flags</h1>
          <p className="text-xs text-[#8a826a]">Controle granular de funcionalidades por role e premium</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 bg-[#0f0f11] text-[#c5a84a] px-3 py-2 rounded-xl text-sm font-bold">
          <Plus size={16} /> Nova Flag
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white rounded-2xl border border-[#eae3ce] p-4 grid gap-2">
          <input placeholder="Chave (ex: concierge_ia)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <input placeholder="Nome amigável" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm" />
          <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl bg-[#f5f1e8] px-3 py-2 text-sm min-h-16" />
          <label className="flex items-center gap-2 text-sm text-[#8a826a]">
            <input type="checkbox" checked={form.enabledForPremium} onChange={(e) => setForm({ ...form, enabledForPremium: e.target.checked })} /> Exigir Premium
          </label>
          <button className="bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold rounded-xl py-2.5">Criar Flag</button>
          {msg && <p className="text-sm text-[#9b8038]">{msg}</p>}
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#eae3ce] divide-y divide-[#f5f1e8]">
        {flags.length === 0 && <p className="p-6 text-sm text-[#a89f80] text-center">Nenhuma feature flag cadastrada.</p>}
        {flags.map((f) => (
          <div key={f.id} className="p-4 flex items-start justify-between gap-3">
            <div>
              <div className="font-extrabold flex items-center gap-2">{f.name} <code className="text-xs bg-[#f5f1e8] px-1.5 py-0.5 rounded">{f.key}</code></div>
              <p className="text-sm text-[#5c5648]">{f.description}</p>
              <div className="text-xs text-[#8a826a] mt-1">Roles: {f.enabledForRoles.join(", ")} {f.enabledForPremium && "· Premium"}</div>
            </div>
            <button onClick={() => toggle(f.id, !f.isActive)} className="text-[#c5a84a]">
              {f.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
