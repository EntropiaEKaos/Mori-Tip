"use client";

import Link from "next/link";
import { CompassLogo } from "@/components/compass-logo";
import { ArrowRight, MapPin, Users, Award, Zap, Star, Heart, Calendar, Sparkles, MessageCircle, Camera, Radio } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fdfaf4] to-[#f8f6f0] text-[#1a1815] overflow-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">
          <Link href="/" className="flex items-center gap-2.5">
            <CompassLogo size={36} />
            <span className="font-serif text-3xl tracking-[-1.5px] text-[#0f0f11]">Mori</span>
          </Link>
          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-[#5c5648]">
            <a href="#descobrir" className="hover:text-[#c5a84a] transition">Descobrir</a>
            <a href="#experiencia" className="hover:text-[#c5a84a] transition">Experiência</a>
            <a href="#comunidade" className="hover:text-[#c5a84a] transition">Comunidade</a>
            <a href="#premium" className="hover:text-[#c5a84a] transition">Premium</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-5 py-2.5 text-sm font-medium hover:bg-[#fdfaf4] rounded-full transition">Entrar</Link>
            <Link href="/register" className="px-6 py-2.5 bg-[#0f0f11] text-white text-sm font-semibold rounded-full hover:bg-[#c5a84a] hover:text-[#0f0f11] transition">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#e8e2d4] rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c5a84a] gold-pulse" />
          <span className="text-[10px] font-extrabold tracking-[1.5px] text-[#9b8038]">LANÇAMENTO 2026</span>
        </div>

        <h1 className="font-serif text-[88px] md:text-[120px] leading-[0.88] tracking-[-7.2px] mb-6 text-[#0f0f11]">
          Viaje.<br />Conecte.<br />Lembre.
        </h1>

        <p className="max-w-lg mx-auto text-xl text-[#5c5648] font-light tracking-[-0.3px] mb-10">
          A rede social premium de pousadas e viagens do Brasil.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-9 py-4 bg-[#0f0f11] text-white text-lg font-bold rounded-2xl hover:bg-[#c5a84a] hover:text-[#0f0f11] active:scale-[0.985] transition shadow-[0_8px_24px_rgba(15,15,17,0.18)]">
            Entrar na comunidade <ArrowRight size={18} className="group-hover:translate-x-0.5 transition" />
          </Link>
          <Link href="/preview" className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-[#c5a84a] text-[#9b8038] text-lg font-bold rounded-2xl hover:bg-[#c5a84a] hover:text-white active:scale-[0.985] transition">
            Ver demonstração
          </Link>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="border-y border-[#e8e2d4] bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-14 gap-y-6 py-7 text-[#8a826a] text-xs font-bold tracking-[2.5px]">
          <div>JERICOACOARA</div>
          <div>MONTE VERDE</div>
          <div>CHAPADA</div>
          <div>OURO PRETO</div>
          <div>GRAMADO</div>
          <div>BÚZIOS</div>
          <div>BONITO</div>
        </div>
      </div>

      {/* DESCOBRIR */}
      <section id="descobrir" className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <div className="text-center mb-16">
          <div className="text-[#c5a84a] text-[10px] tracking-[3px] font-extrabold mb-3">EXPERIÊNCIA</div>
          <h2 className="font-serif text-6xl md:text-7xl tracking-[-3px] text-[#0f0f11]">Descubra o Brasil com quem entende.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: <MapPin className="w-6 h-6" />, title: "Pousadas", desc: "Mais de 180 pousadas verificadas em 22 destinos" },
            { icon: <Users className="w-6 h-6" />, title: "Guias Locais", desc: "Profissionais credenciados que conhecem o destino" },
            { icon: <Calendar className="w-6 h-6" />, title: "Roteiros", desc: "Itinerários testados por viajantes experientes" }
          ].map((item, i) => (
            <div key={i} className="mori-card p-8 group">
              <div className="text-[#c5a84a] mb-6 group-hover:scale-110 transition">{item.icon}</div>
              <div className="font-extrabold text-2xl tracking-[-0.5px] mb-2 text-[#0f0f11]">{item.title}</div>
              <p className="text-[#5c5648] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIÊNCIA — Black section */}
      <section id="experiencia" className="bg-[#0f0f11] text-[#faf8f3] py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(197,168,74,0.08),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="text-[#c5a84a] text-[10px] tracking-[3px] font-extrabold mb-4">MOMENTOS</div>
          <h3 className="font-serif text-6xl md:text-7xl tracking-[-3.5px] mb-6">Viva. Compartilhe.<br />Inspire.</h3>
          <p className="max-w-md mx-auto text-lg text-[#b8b0a6] mb-12">Fotos com filtros exclusivos, momentos de até 24h e lives diretamente da pousada.</p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[
              { icon: <Camera size={20} />, label: "Filtros" },
              { icon: <Sparkles size={20} />, label: "Momentos 24h" },
              { icon: <Radio size={20} />, label: "Lives" }
            ].map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="text-[#c5a84a]">{f.icon}</div>
                <div className="text-sm font-bold text-left">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMUNIDADE */}
      <section id="comunidade" className="max-w-6xl mx-auto px-6 pt-28 pb-28">
        <div className="text-center mb-14">
          <div className="text-[#c5a84a] text-[10px] tracking-[3px] font-extrabold mb-3">COMUNIDADE</div>
          <h2 className="font-serif text-6xl md:text-7xl tracking-[-3px] text-[#0f0f11]">Viajantes que viajam.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { icon: <Star className="w-5 h-5" />, label: "12 Badges", desc: "Conquistas reais" },
            { icon: <Heart className="w-5 h-5" />, label: "6 Reações", desc: "Além de curtir" },
            { icon: <Award className="w-5 h-5" />, label: "Níveis", desc: "Suba e ganhe Moris" },
            { icon: <Zap className="w-5 h-5" />, label: "IA Concierge", desc: "Assistente de viagens" }
          ].map((item, idx) => (
            <div key={idx} className="mori-card p-6">
              <div className="text-[#c5a84a] mb-5">{item.icon}</div>
              <div className="font-extrabold text-2xl tracking-tight mb-1 text-[#0f0f11]">{item.label}</div>
              <div className="text-xs text-[#8a826a]">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PREMIUM CTA */}
      <section id="premium" className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-[#0f0f11] via-[#1a1815] to-[#3a2f12] text-[#faf8f3] rounded-[2.5rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a84a]/10 rounded-full blur-[100px]" />
          <div className="relative">
            <div className="text-[#c5a84a] text-[10px] tracking-[3px] font-extrabold mb-3">MORI PREMIUM</div>
            <h3 className="font-serif text-5xl tracking-[-2px] mb-4">A rede completa.</h3>
            <p className="text-[#b8b0a6] mb-8 max-w-md mx-auto">500 Moris / 30 dias. Reservas em pousadas, badge exclusiva, marketplace e Mori Concierge IA.</p>
            <Link href="/premium" className="inline-block px-9 py-3.5 bg-[#c5a84a] text-[#0f0f11] rounded-2xl font-extrabold hover:bg-white transition">
              Conhecer Premium
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e2d4] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#8a826a]">
          <div className="flex items-center gap-2">
            <CompassLogo size={20} />
            <span className="font-serif text-lg text-[#0f0f11]">Mori</span>
          </div>
          <div>Mori © {new Date().getFullYear()} — Feito para quem realmente viaja.</div>
        </div>
      </footer>
    </div>
  );
}
