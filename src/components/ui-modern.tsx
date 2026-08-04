"use client";
import { CompassLogo } from "@/components/compass-logo";

export function ModernLoader({ label = "Mori" }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-[#fdfaf4] to-[#f8f6f0]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#c5a84a]/20 blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-[#0f0f11] flex items-center justify-center shadow-[0_20px_60px_rgba(15,15,17,0.25)]">
            <CompassLogo size={56} />
          </div>
        </div>
        <div className="text-center">
          <h2 className="font-serif text-5xl tracking-[-2.5px] text-[#0f0f11]">{label}</h2>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a84a] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a84a] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a84a] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

export function BadgeGold({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] text-[10px] font-extrabold tracking-wider uppercase">
      {children}
    </span>
  );
}

export function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-[#c5a84a]/0 via-[#c5a84a]/40 to-[#c5a84a]/0 opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-white border border-[#e8e2d4] rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(197,168,74,0.12)] hover:border-[#c5a84a]/40 transition-all duration-500">
        {children}
      </div>
    </div>
  );
}
