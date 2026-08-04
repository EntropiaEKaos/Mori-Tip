"use client";

import Link from "next/link";
import { CompassLogo } from "@/components/compass-logo";
import { ArrowRight, MapPin, Users, Award, Zap, Star, Heart, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#1a1815] overflow-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-[#e8e2d4]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">
          <div className="flex items-center gap-3">
            <CompassLogo size={42} />
            <span className="font-serif text-3xl tracking-[-1.5px] text-[#0f0f11]">Mori</span>
          </div>
          <div className="hidden md:flex items-center gap-9 text-sm font-medium">
            <a href="#descobrir" className="hover:text-[#c5a84a] transition">Descobrir</a>
            <a href="#experiencia" className="hover:text-[#c5a84a] transition">Experiência</a>
            <a href="#comunidade" className="hover:text-[#c5a84a] transition">Comunidade</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 text-sm font-medium hover:bg-[#f5f1e8] rounded-full transition">Entrar</Link>
            <Link href="/register" className="px-6 py-2.5 bg-[#0f0f11] text-white text-sm font-semibold rounded-full hover:bg-[#c5a84a] hover:text-[#0f0f11] transition">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO — Ultra clean with generous white space */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#e8e2d4] rounded-full px-4 py-1 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#c5a84a] animate-pulse" />
          <span className="text-xs font-semibold tracking-[1px] text-[#8a826a]">LANÇAMENTO 2026</span>
        </div>

        <h1 className="font-serif text-[92px] md:text-[120px] leading-[0.88] tracking-[-7.2px] mb-6 text-[#0f0f11]">
          Viaje.<br />Conecte.<br />Lembre.
        </h1>
        
        <p className="max-w-lg mx-auto text-2xl text-[#5c5648] font-light tracking-[-0.3px] mb-12">
          A rede social premium de pousadas e viagens do Brasil.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#0f0f11] text-white text-xl font-semibold rounded-2xl hover:bg-[#c5a84a] hover:text-[#0f0f11] active:scale-[0.985] transition">
            Entrar na comunidade <ArrowRight className="group-hover:translate-x-0.5 transition" />
          </Link>
          <Link href="/preview" className="inline-flex items-center justify-center gap-3 px-10 py-5 border border-[#c5a84a] text-[#c5a84a] text-xl font-medium rounded-2xl hover:bg-[#c5a84a] hover:text-white active:scale-[0.985] transition">
            Ver demonstração
          </Link>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="border-y border-[#e8e2d4] bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-16 gap-y-6 text-[#8a826a] text-sm tracking-[2px]">
          <div>JERICOACOARA</div>
          <div>MONTE VERDE</div>
          <div>CHAPADA DIAMANTINA</div>
          <div>OURO PRETO</div>
          <div>GRAMADO</div>
          <div>BUZIOS</div>
        </div>
      </div>

      {/* DESCUBRIR */}
      <section id="descobrir" className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-16">
          <div className="text-[#c5a84a] text-xs tracking-[3px] mb-3">EXPERIÊNCIA</div>
          <h2 className="font-serif text-7xl tracking-[-3px]">Descubra o Brasil com quem entende.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <MapPin className="w-6 h-6" />, title: "Pousadas Exclusivas", desc: "Mais de 180 pousadas verificadas em 22 destinos" },
            { icon: <Users className="w-6 h-6" />, title: "Guias Locais", desc: "Profissionais credenciados que realmente conhecem o destino" },
            { icon: <Calendar className="w-6 h-6" />, title: "Roteiros Prontos", desc: "Itinerários testados e otimizados por viajantes reais" }
          ].map((item, i) => (
            <div key={i} className="mori-card p-9 group">
              <div className="text-[#c5a84a] mb-8 group-hover:scale-110 transition">{item.icon}</div>
              <div className="font-semibold text-3xl tracking-[-1px] mb-3">{item.title}</div>
              <p className="text-[#5c5648] text-[15px] leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIÊNCIA — Black section with gold accents */}
      <section id="experiencia" className="bg-[#0f0f11] text-[#faf8f3] py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="text-[#c5a84a] text-xs tracking-[3px] mb-4">MOMENTOS</div>
          <h3 className="font-serif text-7xl tracking-[-3.5px] mb-8">Viva. Compartilhe.<br />Inspire.</h3>
          <p className="max-w-md mx-auto text-xl text-[#b8b0a6]">Fotos com filtros exclusivos, momentos de até 24h e lives diretamente da pousada.</p>
        </div>
      </section>

      {/* COMUNIDADE */}
      <section id="comunidade" className="max-w-6xl mx-auto px-6 pt-24 pb-28">
        <div className="text-center mb-16">
          <div className="text-[#c5a84a] text-xs tracking-[3px] mb-3">COMUNIDADE</div>
          <h2 className="font-serif text-7xl tracking-[-3px]">Viajantes que realmente viajam.</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: <Star className="w-5 h-5" />, label: "12 Badges", desc: "Conquistas de verdade" },
            { icon: <Heart className="w-5 h-5" />, label: "6 Reações", desc: "Além de curtir" },
            { icon: <Award className="w-5 h-5" />, label: "Níveis", desc: "Suba e ganhe Moris" },
            { icon: <Zap className="w-5 h-5" />, label: "IA Concierge", desc: "Assistente inteligente" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-[#e8e2d4] rounded-3xl p-8 hover:border-[#c5a84a] transition group">
              <div className="text-[#c5a84a] mb-8 group-hover:rotate-12 transition">{item.icon}</div>
              <div className="font-semibold text-3xl tracking-tight mb-2">{item.label}</div>
              <div className="text-[#8a826a]">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="border-t border-[#e8e2d4] bg-white py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-2xl text-[#5c5648] mb-8 tracking-[-0.3px]">Pronto para começar a viajar de verdade?</p>
          <Link href="/register" className="inline-block px-14 py-5 bg-[#0f0f11] text-white text-xl font-semibold rounded-2xl hover:bg-[#c5a84a] hover:text-[#0f0f11] transition">Criar conta grátis</Link>
          <p className="mt-6 text-xs text-[#a89f80]">Não é necessário cartão de crédito.</p>
        </div>
      </div>

      <footer className="text-center py-12 text-xs text-[#a89f80]">
        Mori © {new Date().getFullYear()} — Feito para quem realmente viaja.
      </footer>
    </div>
  );
}
