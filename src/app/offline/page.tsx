"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";
import { CompassLogo } from "@/components/compass-logo";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f11] via-[#16151a] to-[#0f0f11] text-[#fdf5d8] flex items-center justify-center p-8">
      <div className="max-w-lg text-center bg-[#16151a]/90 backdrop-blur-xl rounded-3xl border border-[#2a2722] p-10 shadow-[0_20px_60px_rgba(197,168,74,0.08)]">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#c5a84a]/10 border border-[#c5a84a]/20 flex items-center justify-center mb-6">
          <CompassLogo size={48} />
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Você está offline</h1>
        <p className="text-[#b8b0a6] mb-8 leading-relaxed">
          O Mori está projetado para funcionar com cache básico via PWA. Algumas funcionalidades estão disponíveis localmente para você continuar explorando enquanto a conexão retorna.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/preview" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold shadow-[0_4px_18px_rgba(197,168,74,0.35)]">Ver preview</Link>
          <Link href="/feed" className="px-5 py-2.5 rounded-xl bg-[#0f0f11] border border-[#2a2722] text-[#fdf5d8] font-semibold hover:bg-[#16151a]">Tentar feed</Link>
        </div>
      </div>
    </div>
  );
}
