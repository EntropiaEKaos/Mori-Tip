"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/components/auth-provider";
import { CompassLogo } from "@/components/compass-logo";
import { getFilterCss } from "@/lib/utils";
import { Plus, X } from "lucide-react";

type MomentItem = {
  id: number;
  mediaUrl: string;
  mediaType: string;
  caption: string;
  filter: string | null;
  durationHours: number;
  expiresAt: string;
  viewCount: number;
  createdAt: string;
  seenByMe: boolean;
};

type Group = {
  authorId: number;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string | null;
  moments: MomentItem[];
  hasUnseen: boolean;
};

export function MomentsBar() {
  const { me } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [viewer, setViewer] = useState<{ groupIdx: number; momentIdx: number } | null>(null);
  const [composer, setComposer] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hours, setHours] = useState(24);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/moments", { cache: "no-store" });
    if (r.ok) setGroups(await r.json());
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!viewer) return;
    const g = groups[viewer.groupIdx];
    const m = g?.moments[viewer.momentIdx];
    if (!m) return;
    void fetch(`/api/moments/${m.id}/view`, { method: "POST" });
    const ms = Math.min(8000, Math.max(4000, (m.durationHours / 24) * 8000));
    const t = setTimeout(() => {
      if (viewer.momentIdx + 1 < (g?.moments.length ?? 0)) {
        setViewer({ groupIdx: viewer.groupIdx, momentIdx: viewer.momentIdx + 1 });
      } else if (viewer.groupIdx + 1 < groups.length) {
        setViewer({ groupIdx: viewer.groupIdx + 1, momentIdx: 0 });
      } else {
        setViewer(null);
        load();
      }
    }, ms);
    return () => clearTimeout(t);
  }, [viewer, groups, load]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(f);
    });
    if (f.type.startsWith("video")) {
      setMedia(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const max = 1080;
      const scale = Math.min(1, max / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      setMedia(c.toDataURL("image/jpeg", 0.82));
    };
    img.src = dataUrl;
  }

  async function publish() {
    if (!media) return;
    setBusy(true);
    const up = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl: media }),
    });
    const upData = await up.json();
    if (!up.ok) {
      alert(upData.error || "Falha no upload");
      setBusy(false);
      return;
    }
    const r = await fetch("/api/moments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaUrl: upData.url,
        mediaType: media.startsWith("data:video") ? "video" : "image",
        caption,
        durationHours: hours,
      }),
    });
    setBusy(false);
    if (r.ok) {
      setComposer(false);
      setMedia(null);
      setCaption("");
      setHours(24);
      load();
    } else {
      const d = await r.json();
      alert(d.error || "Erro");
    }
  }

  const current =
    viewer != null ? groups[viewer.groupIdx]?.moments[viewer.momentIdx] : null;
  const currentGroup = viewer != null ? groups[viewer.groupIdx] : null;

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#eae3ce] p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-extrabold text-[#0f0f11] flex items-center gap-1.5">
            <CompassLogo size={16} /> Momentos
          </h2>
          <span className="text-[10px] text-[#a89f80]">até 24h</span>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-1">
          {me && (
            <button onClick={() => setComposer(true)} className="shrink-0 flex flex-col items-center gap-1 w-16">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#c5a84a] grid place-items-center bg-[#fdfaf4]">
                <Plus size={20} className="text-[#c5a84a]" />
              </div>
              <span className="text-[10px] font-semibold text-[#8a826a]">Seu</span>
            </button>
          )}
          {groups.map((g, gi) => (
            <button
              key={g.authorId}
              onClick={() => setViewer({ groupIdx: gi, momentIdx: 0 })}
              className="shrink-0 flex flex-col items-center gap-1 w-16"
            >
              <div
                className={`p-[2px] rounded-full ${
                  g.hasUnseen
                    ? "bg-gradient-to-tr from-[#c5a84a] to-[#0f0f11]"
                    : "bg-[#eae3ce]"
                }`}
              >
                <div className="p-[2px] bg-white rounded-full">
                  <Avatar src={g.authorAvatar} name={g.authorDisplayName} size={48} />
                </div>
              </div>
              <span className="text-[10px] font-semibold text-[#0f0f11] truncate w-full text-center">
                {g.authorUsername}
              </span>
            </button>
          ))}
          {groups.length === 0 && (
            <p className="text-xs text-[#a89f80] py-4 px-2">Nenhum momento ativo. Seja o primeiro!</p>
          )}
        </div>
      </div>

      {composer && (
        <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 border border-[#eae3ce]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold">Novo momento</h3>
              <button onClick={() => setComposer(false)} className="p-1 hover:bg-[#f5f1e8] rounded-lg">
                <X size={18} />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={onFile} />
            {!media ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-48 rounded-xl border-2 border-dashed border-[#c5a84a] text-[#c5a84a] font-semibold"
              >
                Escolher foto ou vídeo
              </button>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media} alt="" className="w-full max-h-64 object-cover rounded-xl mb-3" />
            )}
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Legenda (opcional)"
              className="w-full mt-3 rounded-xl border border-[#eae3ce] px-3 py-2 text-sm outline-none focus:border-[#c5a84a]"
            />
            <label className="block mt-3 text-xs text-[#8a826a] font-semibold">
              Duração: {hours}h
              <input
                type="range"
                min={1}
                max={24}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full accent-[#c5a84a]"
              />
            </label>
            <button
              disabled={!media || busy}
              onClick={publish}
              className="mt-4 w-full bg-[#0f0f11] text-[#c5a84a] font-extrabold rounded-xl py-2.5 disabled:opacity-40"
            >
              {busy ? "Publicando..." : "Publicar momento"}
            </button>
          </div>
        </div>
      )}

      {viewer && current && currentGroup && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setViewer(null)}>
          <div className="flex gap-1 p-2 pt-3">
            {currentGroup.moments.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/30 rounded overflow-hidden">
                <div
                  className={`h-full bg-[#c5a84a] ${i < viewer.momentIdx ? "w-full" : i === viewer.momentIdx ? "w-full animate-pulse" : "w-0"}`}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-white">
            <Avatar src={currentGroup.authorAvatar} name={currentGroup.authorDisplayName} size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">{currentGroup.authorDisplayName}</div>
              <div className="text-[10px] text-white/60">expira em {current.durationHours}h · {current.viewCount} views</div>
            </div>
            <button className="p-2" onClick={() => setViewer(null)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 grid place-items-center p-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.mediaUrl}
              alt=""
              className="max-h-full max-w-full object-contain rounded-lg"
              style={{ filter: getFilterCss(current.filter) }}
            />
          </div>
          {current.caption && (
            <p className="text-white text-center p-4 text-sm">{current.caption}</p>
          )}
        </div>
      )}
    </>
  );
}
