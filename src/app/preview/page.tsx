"use client";

import Link from "next/link";
import { CompassLogo } from "@/components/compass-logo";
import { useAuth } from "@/components/auth-provider";
import { Camera, MapPin, MessageCircle, Radio, Bell, Users, Eye, EyeOff, WifiOff, Sparkles } from "lucide-react";

export default function PreviewPage() {
  const { me } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f11] via-[#16151a] to-[#0f0f11] text-[#fdf5d8]">
      {/* Badge offline */}
      <div className="fixed top-4 right-4 z-50 bg-[#c5a84a]/20 border border-[#c5a84a]/30 text-[#c5a84a] text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
        <WifiOff size={14} /> Modo Offline / Preview
      </div>

      <header className="max-w-6xl mx-auto flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-[#fdf5d8]">
          <CompassLogo size={36} />
          <span className="text-[#c5a84a]">Mori</span>
        </Link>
        <div className="flex gap-2">
          <Link href="/login" className="px-4 py-2 rounded-lg font-semibold hover:bg-white/5 border border-white/10 text-xs sm:text-sm">Entrar</Link>
          <Link href="/register" className="px-4 py-2 rounded-lg font-semibold bg-[#c5a84a] text-[#0f0f11] hover:bg-[#d4bc6a] text-xs sm:text-sm">Criar conta</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-[#fdf5d8]">
            A rede social dos viajantes e <span className="text-[#c5a84a]">pousadas</span>.
          </h1>
          <p className="mt-6 text-lg text-[#b8b0a6] max-w-lg leading-relaxed">
            Descubra destinos, compartilhe memórias com filtros dourados, participe de lives ao vivo e converse como se estivesse ao lado.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#c5a84a] to-[#9b8038] text-[#0f0f11] font-extrabold shadow-[0_8px_24px_rgba(197,168,74,0.35)] hover:-translate-y-0.5 transition">Começar grátis</Link>
            <Link href="/feed" className="px-7 py-3.5 rounded-xl bg-[#16151a] border border-[#c5a84a]/20 font-semibold text-[#fdf5d8] hover:bg-[#1a1815] hover:border-[#c5a84a]/40 transition">Explorar feed</Link>
          </div>
          <p className="text-xs text-[#8a826a] mt-5">Novo? <Link href="/api/seed" className="text-[#c5a84a] underline">popular dados de exemplo</Link></p>
        </div>

        <div className="relative">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#c5a84a]/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-[#c5a84a]/10 rounded-full blur-[100px]" />
          <div className="relative grid grid-cols-2 gap-3">
            <PreviewFeature icon={<Camera size={18} />} title="Fotos com filtros" desc="8 filtros dourados para viagens" />
            <PreviewFeature icon={<Radio size={18} />} title="Lives WebRTC" desc="Transmita direto da pousada" />
            <PreviewFeature icon={<MessageCircle size={18} />} title="Chat completo" desc="Estilo WhatsApp em tempo real" />
            <PreviewFeature icon={<Bell size={18} />} title="Notificações" desc="Curtidas, follows e menções" />
            <PreviewFeature icon={<MapPin size={18} />} title="Pousadas" desc="Descubra novos destinos" />
            <PreviewFeature icon={<Users size={18} />} title="Comunidade" desc="Siga viajantes reais" />
          </div>
        </div>
      </main>

      {/* Seção de recursos detalhados */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-[#16151a] border border-[#2a2722] rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#fdf5d8] mb-8">O que você encontra no Mori</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureBlock title="Bússola Dourada" desc="Cada postagem carrega o símbolo da bússola Mori como assinatura visual. Filtros dourados, preto e branco, e uma estética luxuosa para viajantes." icon={<CompassLogo size={28} />} />
            <FeatureBlock title="Reações Completas" desc="Além de curtir, reaja com emojis: nascer do sol, montanha, mar, serra, favorito e incrível. Interaja de forma completa com a comunidade." icon={<Sparkles size={28} className="text-[#c5a84a]" />} />
            <FeatureBlock title="Modo Offline / Preview" desc="Acesse esta página de preview para avaliar todos os recursos sem conexão. Ideal para apresentações e testes locais antes de publicar." icon={<EyeOff size={28} className="text-[#c5a84a]" />} />
          </div>
        </div>
      </section>

      {/* Seção de avaliação para preview */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-[#0f0f11] border border-[#c5a84a]/20 rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_rgba(197,168,74,0.08)]">
          <h3 className="text-xl font-extrabold text-[#fdf5d8] mb-4 flex items-center gap-2">
            <Eye size={20} className="text-[#c5a84a]" /> Avaliação do projeto — Modo Offline
          </h3>
          <p className="text-[#b8b0a6] text-sm leading-relaxed mb-6">
            Esta página funciona como um preview estático completo da identidade visual do <b className="text-[#c5a84a]">Mori</b>. Você pode navegar por ela sem internet para avaliar:
          </p>
          <ul className="space-y-2 text-sm text-[#fdf5d8]">
            <li className="flex items-start gap-2"><span className="text-[#c5a84a] mt-0.5">●</span> Paleta dourado/preto/branco aplicada em todos os componentes</li>
            <li className="flex items-start gap-2"><span className="text-[#c5a84a] mt-0.5">●</span> Logotipo da bússola em SVG integrado nas postagens e cards</li>
            <li className="flex items-start gap-2"><span className="text-[#c5a84a] mt-0.5">●</span> Sistema de reações completo com 6 tipos de reação</li>
            <li className="flex items-start gap-2"><span className="text-[#c5a84a] mt-0.5">●</span> Layout e tipografia para leitura em modo offline</li>
            <li className="flex items-start gap-2"><span className="text-[#c5a84a] mt-0.5">●</span> Componentes de feed, perfil, chat, lives e admin disponíveis via rotas</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function PreviewFeature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-[#16151a] backdrop-blur-sm rounded-2xl border border-[#2a2722] p-5 shadow-[0_4px_20px_rgba(197,168,74,0.06)]">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c5a84a] to-[#9b8038] text-[#0f0f11] grid place-items-center mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">{icon}</div>
      <div className="font-bold text-sm text-[#fdf5d8]">{title}</div>
      <div className="text-xs text-[#b8b0a6] mt-1">{desc}</div>
    </div>
  );
}

function FeatureBlock({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#16151a]/50 rounded-2xl border border-[#2a2722] p-6">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c5a84a] to-[#0f0f11] text-[#c5a84a] grid place-items-center mb-4 shadow-lg">{icon}</div>
      <h4 className="font-extrabold text-[#fdf5d8] mb-2">{title}</h4>
      <p className="text-sm text-[#b8b0a6] leading-relaxed">{desc}</p>
    </div>
  );
}
