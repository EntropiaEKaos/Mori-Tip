"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { CompassLogo } from "@/components/compass-logo";
import { Send, Sparkles, MapPin, Calendar, Compass, UserCheck } from "lucide-react";
import Link from "next/link";

type Msg = {
  id: string;
  sender: "ai" | "user";
  text: string;
  inns?: any[];
  guides?: any[];
  itineraries?: any[];
};

export default function ConciergePage() {
  const { me } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      sender: "ai",
      text: `Olá, ${me?.displayName || "viajante"}! Sou o **Mori Concierge 🧭**, seu assistente inteligente especializado em turismo. \n\nPosso gerar roteiros, localizar pousadas exclusivas ou sugerir guias credenciados em qualquer destino. Diga-me, qual será nossa próxima viagem?`,
    },
  ]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || busy) return;

    const userText = prompt;
    setPrompt("");
    setMessages((prev) => [...prev, { id: String(Date.now()), sender: "user", text: userText }]);
    setBusy(true);

    try {
      const r = await fetch("/api/ai/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
      });
      if (r.ok) {
        const d = await r.json();
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: "ai",
            text: d.message,
            inns: d.inns,
            guides: d.guides,
            itineraries: d.itineraries,
          },
        ]);
      } else {
        throw new Error();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "ai",
          text: "Desculpe, tive um problema de comunicação na rede Mori. Tente novamente em instantes!",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-[#eae3ce] flex flex-col h-[calc(100vh-6rem)] overflow-hidden shadow-xl">
      <header className="p-4 border-b border-[#f5f1e8] bg-gradient-to-r from-[#0f0f11] to-[#1a1815] text-[#fdf5d8] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#c5a84a]/10 border border-[#c5a84a]/30 flex items-center justify-center">
          <CompassLogo size={28} />
        </div>
        <div>
          <h1 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5 text-[#c5a84a]">
            Mori Concierge <Sparkles size={14} className="animate-pulse" />
          </h1>
          <p className="text-[10px] text-[#b8b0a6]">Assistência e roteiros personalizados de turismo</p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4 bg-gradient-to-b from-[#fdfaf4] to-[#f5f1e8]"
      >
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                  isUser
                    ? "bg-[#0f0f11] text-[#fdf5d8] rounded-tr-none border border-[#2a2722]"
                    : "bg-white text-[#0f0f11] rounded-tl-none border border-[#eae3ce]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* Recommendations carousel inside the balloon */}
                {!isUser && (m.inns?.length || m.guides?.length || m.itineraries?.length) ? (
                  <div className="mt-4 pt-3 border-t border-[#f5f1e8] space-y-2">
                    {m.inns && m.inns.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-[#c5a84a] uppercase tracking-wide mb-1.5">Pousadas Recomendadas</div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                          {m.inns.map((i) => (
                            <Link
                              key={i.id}
                              href="/pousadas"
                              className="shrink-0 w-44 bg-[#fdfaf4] border border-[#eae3ce] rounded-xl p-2 hover:border-[#c5a84a] transition block"
                            >
                              <div className="font-extrabold text-xs text-[#0f0f11] truncate">{i.name}</div>
                              <div className="text-[10px] text-[#8a826a] flex items-center gap-0.5 mt-0.5">
                                <MapPin size={10} /> {i.city}
                              </div>
                              <div className="text-xs font-bold text-[#c5a84a] mt-1">R$ {i.pricePerNight}/noite</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.guides && m.guides.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] font-bold text-[#c5a84a] uppercase tracking-wide mb-1.5">Guias sugeridos</div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                          {m.guides.map((g) => (
                            <Link
                              key={g.id}
                              href="/guias"
                              className="shrink-0 w-44 bg-[#fdfaf4] border border-[#eae3ce] rounded-xl p-2 hover:border-[#c5a84a] transition block"
                            >
                              <div className="font-extrabold text-xs text-[#0f0f11] truncate">{g.headline}</div>
                              <div className="text-[10px] text-[#8a826a] flex items-center gap-0.5 mt-0.5">
                                <UserCheck size={10} /> {g.city}
                              </div>
                              <div className="text-xs font-bold text-[#c5a84a] mt-1">R$ {g.pricePerDay}/dia</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.itineraries && m.itineraries.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] font-bold text-[#c5a84a] uppercase tracking-wide mb-1.5">Roteiros sob medida</div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                          {m.itineraries.map((it) => (
                            <Link
                              key={it.id}
                              href={`/roteiros/${it.id}`}
                              className="shrink-0 w-44 bg-[#fdfaf4] border border-[#eae3ce] rounded-xl p-2 hover:border-[#c5a84a] transition block"
                            >
                              <div className="font-extrabold text-xs text-[#0f0f11] truncate">{it.title}</div>
                              <div className="text-[10px] text-[#8a826a] flex items-center gap-0.5 mt-0.5">
                                <Calendar size={10} /> {it.days} dias
                              </div>
                              <div className="text-xs font-bold text-[#c5a84a] mt-1">R$ {it.budget} est.</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {busy && (
          <div className="flex items-center gap-2 text-xs text-[#8a826a]">
            <Compass className="animate-spin text-[#c5a84a]" size={16} />
            <span>Mori Concierge está consultando as rotas...</span>
          </div>
        )}
      </div>

      <form onSubmit={send} className="p-3 border-t border-[#f5f1e8] flex gap-2 bg-white">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Onde vamos passar o feriado? Procuro pousadas em Jeri..."
          className="flex-1 rounded-full bg-[#f5f1e8] px-4 py-3 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#c5a84a] transition placeholder:text-[#8a826a]"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || busy}
          className="p-3 rounded-full bg-[#0f0f11] text-[#c5a84a] hover:bg-[#1a1815] disabled:opacity-40 transition shadow-md shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
