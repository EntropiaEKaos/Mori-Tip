import Link from "next/link";
import { CompassLogo } from "@/components/compass-logo";
import { Camera, MapPin, MessageCircle, Radio, Bell, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f11] via-[#16151a] to-[#0f0f11] text-[#fdf5d8]">
      <header className="max-w-6xl mx-auto flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight">
          <CompassLogo size={36} />
          <span className="text-[#c5a84a]">Mori</span>
        </Link>
        <div className="flex gap-2">
          <Link href="/login" className="px-4 py-2 rounded-lg font-medium hover:bg-white/5 border border-white/10 text-xs sm:text-sm">Entrar</Link>
          <Link href="/register" className="px-4 py-2 rounded-lg font-medium bg-[#c5a84a] text-[#0f0f11] hover:bg-[#d4bc6a] text-xs sm:text-sm shadow-[0_4px_20px_rgba(197,168,74,0.25)]">Criar conta</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#1a1815] border border-[#c5a84a]/20 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#c5a84a] mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a84a] gold-pulse" />
            Lives de pousadas agora
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-[#fdf5d8]">
            A rede social dos viajantes e <span className="text-[#c5a84a]">pousadas</span>.
          </h1>
          <p className="mt-6 text-lg text-[#b8b0a6] max-w-lg leading-relaxed">
            Descubra destinos, compartilhe memórias com filtros dourados, participe de lives ao vivo e converse como se estivesse ao lado.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold shadow-[0_8px_24px_rgba(197,168,74,0.35)] hover:-translate-y-0.5 transition"
            >
              Começar grátis
            </Link>
            <Link
              href="/feed"
              className="px-7 py-3.5 rounded-xl bg-[#16151a] border border-[#c5a84a]/20 font-semibold text-[#fdf5d8] hover:bg-[#1a1815] hover:border-[#c5a84a]/40 transition"
            >
              Explorar feed
            </Link>
          </div>
          <p className="text-xs text-[#8a826a] mt-5">
            Nova instalação? <a href="/api/seed" className="text-[#c5a84a] underline hover:text-white">popular dados de exemplo</a>
          </p>
        </div>

        <div className="relative">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#c5a84a]/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-[#c5a84a]/10 rounded-full blur-[100px]" />
          <div className="relative grid grid-cols-2 gap-3">
            <FeatureCard icon={<Camera size={18} />} title="Fotos com filtros" desc="8 filtros dourados para viagens" color="from-[#c5a84a] to-[#9b8038]" />
            <FeatureCard icon={<Radio size={18} />} title="Lives WebRTC" desc="Transmita direto da pousada" color="from-[#c5a84a] to-[#8a6b2e]" />
            <FeatureCard icon={<MessageCircle size={18} />} title="Chat completo" desc="Estilo WhatsApp em tempo real" color="from-[#d4bc6a] to-[#9b8038]" />
            <FeatureCard icon={<Bell size={18} />} title="Notificações" desc="Curtidas, follows e menções" color="from-[#c5a84a] to-[#0f0f11]" />
            <FeatureCard icon={<MapPin size={18} />} title="Pousadas" desc="Descubra novos destinos" color="from-[#9b8038] to-[#6e5c28]" />
            <FeatureCard icon={<Users size={18} />} title="Comunidade viva" desc="Siga viajantes reais" color="from-[#0f0f11] to-[#c5a84a]" />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="bg-[#16151a] backdrop-blur-sm rounded-2xl border border-[#2a2722] p-5 shadow-[0_4px_20px_rgba(197,168,74,0.06)]">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} text-[#0f0f11] grid place-items-center mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`}>
        {icon}
      </div>
      <div className="font-bold text-sm text-[#fdf5d8]">{title}</div>
      <div className="text-xs text-[#b8b0a6] mt-1">{desc}</div>
    </div>
  );
}
