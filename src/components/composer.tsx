"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, MapPin, X, Send, Sparkles, Video, Images, Lightbulb, Star } from "lucide-react";
import { PHOTO_FILTERS, getFilterCss } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";

const TYPES = [
  { key: "text", label: "Texto", icon: null },
  { key: "photo", label: "Foto", icon: ImageIcon },
  { key: "carousel", label: "Carrossel", icon: Images },
  { key: "video", label: "Vídeo", icon: Video },
  { key: "tip", label: "Dica", icon: Lightbulb },
  { key: "review", label: "Review", icon: Star },
] as const;

export function Composer({ onPosted }: { onPosted?: () => void }) {
  const { me } = useAuth();
  const [type, setType] = useState<(typeof TYPES)[number]["key"]>("text");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("none");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!me) return null;

  async function compressImage(file: File): Promise<string> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    if (file.type.startsWith("video")) return dataUrl;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1080;
        const scale = Math.min(1, maxW / img.width);
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = dataUrl;
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (type === "carousel" || files.length > 1) {
      const urls: string[] = [];
      for (const f of files.slice(0, 8)) {
        if (f.size > 3_000_000) continue;
        urls.push(await compressImage(f));
      }
      setMediaUrls(urls);
      setType("carousel");
      setShowFilters(true);
      return;
    }
    const f = files[0];
    if (f.size > 3_000_000) {
      alert("Arquivo grande. Escolha até ~3MB.");
      return;
    }
    const url = await compressImage(f);
    if (f.type.startsWith("video")) {
      setVideoUrl(url);
      setType("video");
    } else {
      setImage(url);
      setType("photo");
      setShowFilters(true);
    }
  }

  async function uploadDataUrl(dataUrl: string) {
    const up = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const upData = await up.json();
    if (!up.ok) throw new Error(upData.error || "Falha upload");
    return upData.url as string;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !image && !videoUrl && mediaUrls.length === 0) return;
    setBusy(true);
    try {
      let imageUrl: string | null = null;
      let finalVideo: string | null = null;
      let finalMedia: string[] = [];
      if (image) {
        const baked = await bakeFilter(image, getFilterCss(filter));
        imageUrl = await uploadDataUrl(baked);
      }
      if (videoUrl) finalVideo = await uploadDataUrl(videoUrl);
      if (mediaUrls.length) {
        for (const m of mediaUrls) {
          const baked = await bakeFilter(m, getFilterCss(filter));
          finalMedia.push(await uploadDataUrl(baked));
        }
      }
      const tagList = tags
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, "").toLowerCase())
        .filter(Boolean);
      const r = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          content,
          imageUrl: imageUrl ?? finalMedia[0] ?? null,
          videoUrl: finalVideo,
          mediaUrls: finalMedia,
          filter,
          location: location || null,
          tags: tagList,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || "Erro");
      }
      setContent("");
      setImage(null);
      setMediaUrls([]);
      setVideoUrl(null);
      setLocation("");
      setTags("");
      setFilter("none");
      setShowFilters(false);
      setType("text");
      onPosted?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  const preview = image || mediaUrls[0] || null;

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-[#eae3ce] p-4 flex flex-col gap-3 shadow-[0_2px_12px_rgba(15,15,17,0.03)]">
      <div className="flex gap-1 overflow-x-auto scrollbar-thin">
        {TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                type === t.key
                  ? "bg-[#0f0f11] text-[#c5a84a] border-[#0f0f11]"
                  : "bg-[#fdfaf4] text-[#8a826a] border-[#eae3ce] hover:border-[#c5a84a]"
              }`}
            >
              {Icon && <Icon size={12} />}
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Avatar src={me.avatarUrl} name={me.displayName} size={40} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            type === "tip"
              ? "Compartilhe uma dica de viagem..."
              : type === "review"
              ? "Escreva sua avaliação..."
              : "Compartilhe sua viagem, dica ou foto..."
          }
          className="flex-1 resize-none outline-none text-[15px] min-h-[64px] placeholder:text-[#b8b0a6]"
          maxLength={2000}
        />
      </div>

      {preview && (
        <div className="relative rounded-xl overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" className="w-full max-h-[420px] object-cover" style={{ filter: getFilterCss(filter) }} />
          <button
            type="button"
            onClick={() => {
              setImage(null);
              setMediaUrls([]);
              setFilter("none");
              setShowFilters(false);
            }}
            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full"
          >
            <X size={14} />
          </button>
          {mediaUrls.length > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {mediaUrls.length} fotos
            </div>
          )}
        </div>
      )}

      {videoUrl && !preview && (
        <div className="relative rounded-xl overflow-hidden bg-black p-4 text-white text-sm">
          Vídeo selecionado
          <button type="button" onClick={() => setVideoUrl(null)} className="absolute top-2 right-2 bg-white/20 p-1.5 rounded-full">
            <X size={14} />
          </button>
        </div>
      )}

      {showFilters && preview && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {PHOTO_FILTERS.map((f) => (
            <button
              type="button"
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 flex flex-col items-center gap-1 rounded-lg p-1.5 border ${
                filter === f.key ? "border-[#c5a84a] bg-[#faf7f0]" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={f.label} className="w-14 h-14 object-cover rounded-md" style={{ filter: f.css }} />
              <span className="text-[10px] font-medium">{f.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Localização"
          className="flex-1 min-w-[160px] rounded-lg bg-[#f5f1e8] px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#c5a84a]"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags: #praia #serra"
          className="flex-1 min-w-[160px] rounded-lg bg-[#f5f1e8] px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#c5a84a]"
        />
      </div>

      <div className="flex items-center gap-1 pt-1 border-t border-[#f5f1e8]">
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFile} />
        <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#8a826a] hover:bg-[#f5f1e8]">
          <ImageIcon size={18} /> Mídia
        </button>
        {preview && (
          <button type="button" onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#8a826a] hover:bg-[#f5f1e8]">
            <Sparkles size={18} /> Filtros
          </button>
        )}
        <span className="ml-auto text-xs text-[#b8b0a6]">{content.length}/2000</span>
        <button
          type="submit"
          disabled={busy || (!content.trim() && !image && !videoUrl && mediaUrls.length === 0)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#c5a84a] to-[#9b8038] hover:opacity-90 disabled:opacity-40 text-[#0f0f11] px-4 py-2 rounded-xl font-extrabold text-sm"
        >
          <Send size={14} /> Publicar
        </button>
      </div>
    </form>
  );
}

async function bakeFilter(dataUrl: string, css: string): Promise<string> {
  if (!css || dataUrl.startsWith("data:video")) return dataUrl;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.filter = css;
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
