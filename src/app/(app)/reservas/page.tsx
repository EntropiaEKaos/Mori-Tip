"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

type Booking = {
  id: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  paidWithMoris: number;
  status: string;
  createdAt: string;
  innName: string;
  innCity: string;
  innState: string;
  role: string;
  guestUsername?: string;
  guestDisplayName?: string;
};

export default function ReservasPage() {
  const { me, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{ asGuest: Booking[]; asHost: Booking[] } | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/bookings", { cache: "no-store" });
    if (r.ok) setData(await r.json());
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!me) router.push("/login");
    else void load();
  }, [me, loading, router, load]);

  async function updateStatus(id: number, status: string) {
    const r = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) load();
    else {
      const d = await r.json();
      alert(d.error || "Erro");
    }
  }

  if (!data) return <p className="p-4 text-sm text-[#8a826a]">Carregando reservas...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#eae3ce] p-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-2"><CalendarCheck className="text-[#c5a84a]" size={20} /> Reservas</h1>
          <p className="text-xs text-[#8a826a]">
            {me?.isPremium ? "Premium ativo — reservas liberadas" : "Recurso Premium"}
          </p>
        </div>
        {!me?.isPremium && (
          <Link href="/premium" className="text-xs font-extrabold bg-[#0f0f11] text-[#c5a84a] px-3 py-1.5 rounded-full">
            Assinar Premium
          </Link>
        )}
      </div>

      <Section title="Minhas estadias" items={data.asGuest} onUpdate={updateStatus} side="guest" />
      <Section title="Como anfitrião" items={data.asHost} onUpdate={updateStatus} side="host" />
    </div>
  );
}

function Section({
  title,
  items,
  onUpdate,
  side,
}: {
  title: string;
  items: Booking[];
  onUpdate: (id: number, status: string) => void;
  side: "guest" | "host";
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#eae3ce] divide-y divide-[#f5f1e8]">
      <div className="p-4 font-extrabold">{title}</div>
      {items.length === 0 && <p className="p-6 text-sm text-[#a89f80] text-center">Nenhuma reserva.</p>}
      {items.map((b) => (
        <div key={b.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-extrabold">{b.innName}</div>
              <div className="text-xs text-[#8a826a]">{b.innCity}, {b.innState}</div>
              <div className="text-sm mt-1">
                {new Date(b.checkIn).toLocaleDateString("pt-BR")} → {new Date(b.checkOut).toLocaleDateString("pt-BR")} · {b.nights} noites · {b.guests} hóspedes
              </div>
              {side === "host" && b.guestUsername && (
                <div className="text-xs text-[#8a826a] mt-0.5">hóspede @{b.guestUsername}</div>
              )}
              <div className="text-xs text-[#a89f80] mt-1">{timeAgo(b.createdAt)}</div>
            </div>
            <div className="text-right">
              <div className="font-extrabold text-[#c5a84a]">R$ {b.totalPrice}</div>
              {b.paidWithMoris > 0 && <div className="text-[10px] text-[#8a826a]">{b.paidWithMoris} Moris usados</div>}
              <span className="inline-block mt-1 text-[10px] uppercase font-bold bg-[#f5f1e8] px-2 py-0.5 rounded-full">{b.status}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {side === "host" && b.status === "pending" && (
              <>
                <button onClick={() => onUpdate(b.id, "confirmed")} className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">Confirmar</button>
                <button onClick={() => onUpdate(b.id, "cancelled")} className="text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 rounded-lg">Recusar</button>
              </>
            )}
            {side === "host" && b.status === "confirmed" && (
              <button onClick={() => onUpdate(b.id, "completed")} className="text-xs font-bold bg-[#f5f1e8] px-3 py-1.5 rounded-lg">Marcar concluída</button>
            )}
            {b.status === "pending" && side === "guest" && (
              <button onClick={() => onUpdate(b.id, "cancelled")} className="text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 rounded-lg">Cancelar</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
