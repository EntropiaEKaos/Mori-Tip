"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, ImageIcon, Check, CheckCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/components/auth-provider";
import { timeAgo } from "@/lib/utils";

type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  type: "text" | "image" | "audio" | "video";
  content: string;
  createdAt: string;
};

type ConvInfo = {
  id: number;
  title: string | null;
  members: { userId: number; username: string; displayName: string; avatarUrl: string | null }[];
};

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { me } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [info, setInfo] = useState<ConvInfo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSince = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadInfo = useCallback(async () => {
    const r = await fetch("/api/conversations", { cache: "no-store" });
    if (r.ok) {
      const list: ConvInfo[] = await r.json();
      const found = list.find((c) => c.id === Number(id));
      if (found) setInfo(found);
    }
  }, [id]);

  const loadInitial = useCallback(async () => {
    const r = await fetch(`/api/conversations/${id}/messages`, { cache: "no-store" });
    if (r.ok) {
      const arr: Message[] = await r.json();
      setMessages(arr);
      if (arr.length) lastSince.current = arr[arr.length - 1].createdAt;
    }
  }, [id]);

  const poll = useCallback(async () => {
    const since = lastSince.current;
    const url = since
      ? `/api/conversations/${id}/messages?since=${encodeURIComponent(since)}`
      : `/api/conversations/${id}/messages`;
    const r = await fetch(url, { cache: "no-store" });
    if (r.ok) {
      const arr: Message[] = await r.json();
      if (arr.length) {
        setMessages((prev) => [...prev, ...arr]);
        lastSince.current = arr[arr.length - 1].createdAt;
      }
    }
  }, [id]);

  useEffect(() => {
    void loadInfo();
    void loadInitial();
  }, [loadInfo, loadInitial]);

  useEffect(() => {
    const t = setInterval(poll, 2000);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text;
    setText("");
    const r = await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, type: "text" }),
    });
    if (r.ok) {
      const m = await r.json();
      setMessages((prev) => [...prev, m]);
      lastSince.current = m.createdAt;
    }
  }

  async function sendImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2_500_000) {
      alert("Imagem grande demais.");
      return;
    }
    const dataUrl = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(f);
    });
    const img = new Image();
    img.onload = async () => {
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      const compressed = c.toDataURL("image/jpeg", 0.8);
      const r = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: compressed, type: "image" }),
      });
      if (r.ok) {
        const m = await r.json();
        setMessages((prev) => [...prev, m]);
        lastSince.current = m.createdAt;
      }
    };
    img.src = dataUrl;
  }

  const other = info?.members.find((m) => m.userId !== me?.id) ?? info?.members[0];
  const name = info?.title || other?.displayName || "Conversa";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[calc(100vh-6rem)] overflow-hidden">
      <header className="flex items-center gap-3 p-3 border-b border-slate-100">
        <Link href="/messages" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={18} />
        </Link>
        <Avatar src={other?.avatarUrl} name={name} size={40} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{name}</div>
          <div className="text-xs text-emerald-500">online</div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2 bg-[linear-gradient(180deg,#f8fafc,#eef2f7)]"
      >
        {messages.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-10">Diga oi 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === me?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  mine ? "chat-bubble-me rounded-br-sm" : "chat-bubble-other rounded-bl-sm"
                }`}
              >
                {m.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.content} alt="" className="rounded-lg max-w-full max-h-80" />
                ) : (
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                )}
                <div className={`text-[10px] mt-1 flex items-center gap-1 ${mine ? "text-white/70 justify-end" : "text-slate-400"}`}>
                  {timeAgo(m.createdAt)}
                  {mine && <CheckCheck size={12} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="border-t border-slate-100 p-3 flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={sendImage} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <ImageIcon size={18} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma mensagem"
          className="flex-1 rounded-full bg-slate-100 focus:bg-white border border-transparent focus:border-cyan-500 px-4 py-2 outline-none text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2.5 rounded-full bg-cyan-500 text-white disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
