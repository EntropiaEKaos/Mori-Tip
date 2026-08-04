"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, MessageCircle, Share2, MapPin, Trash2, EyeOff, Send } from "lucide-react";
import { CompassLogo } from "@/components/compass-logo";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/components/auth-provider";
import { getFilterCss, timeAgo, cn } from "@/lib/utils";

export type FeedPost = {
  id: number;
  type?: string;
  content: string;
  imageUrl: string | null;
  mediaUrls?: string[];
  videoUrl?: string | null;
  filter: string | null;
  location: string | null;
  tags: string[];
  createdAt: string;
  isHidden: boolean;
  isSponsored?: boolean;
  authorId: number;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string | null;
  authorVerified: boolean;
  authorLevel?: number;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  authorId: number;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string | null;
};

const REACTIONS = [
  { emoji: "🌅", label: "Nascer do sol", key: "sunrise" },
  { emoji: "🏔️", label: "Montanha", key: "mountain" },
  { emoji: "🌊", label: "Mar", key: "ocean" },
  { emoji: "🌲", label: "Serra", key: "forest" },
  { emoji: "⭐", label: "Favorito", key: "favorite" },
  { emoji: "✨", label: "Incrível", key: "wow" },
] as const;

export function PostCard({ post, onChange }: { post: FeedPost; onChange?: () => void }) {
  const { me } = useAuth();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  async function toggleLike() {
    if (!me) return;
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    const r = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (r.ok) {
      const d = await r.json();
      setLiked(d.liked);
    }
  }

  async function react(key: string) {
    if (!me) return;
    setSelectedReaction(key);
    setLikeCount((c) => c + 1);
    setLiked(true);
    await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
  }

  async function loadComments() {
    setShowComments((v) => !v);
    if (!comments) {
      const r = await fetch(`/api/posts/${post.id}/comments`);
      if (r.ok) setComments(await r.json());
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentInput.trim() || !me) return;
    setBusy(true);
    const r = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentInput }),
    });
    setBusy(false);
    if (r.ok) {
      const c = await r.json();
      setComments((prev) => [
        ...(prev ?? []),
        {
          ...c,
          authorId: me.id,
          authorUsername: me.username,
          authorDisplayName: me.displayName,
          authorAvatar: me.avatarUrl,
        },
      ]);
      setCommentInput("");
    }
  }

  async function del() {
    if (!confirm("Apagar este post?")) return;
    const r = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (r.ok) onChange?.();
  }

  async function hide() {
    const r = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden: !post.isHidden }),
    });
    if (r.ok) onChange?.();
  }

  async function share() {
    const url = `${location.origin}/post/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: `Post de ${post.authorDisplayName}` });
      else {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
      }
    } catch {}
  }

  const canDelete = me?.id === post.authorId || me?.role === "admin";

  return (
    <article className="bg-white rounded-2xl border border-[#eae3ce] overflow-hidden shadow-[0_2px_12px_rgba(15,15,17,0.03)] hover:shadow-[0_6px_24px_rgba(15,15,17,0.06)] transition">
      <header className="flex items-center gap-3 p-4">
        <Link href={`/u/${post.authorUsername}`}>
          <Avatar src={post.authorAvatar} name={post.authorDisplayName} size={42} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/u/${post.authorUsername}`} className="text-sm font-bold hover:underline text-[#0f0f11] flex items-center gap-1">
            {post.authorDisplayName}
            {post.authorVerified && <span className="text-[#c5a84a] text-xs">●</span>}
            {post.authorLevel != null && (
              <span className="text-[10px] bg-[#f5f1e8] text-[#9b8038] px-1.5 py-0.5 rounded-full font-bold">
                Nv.{post.authorLevel}
              </span>
            )}
            {post.isSponsored && (
              <span className="text-[10px] bg-[#0f0f11] text-[#c5a84a] px-1.5 py-0.5 rounded-full font-bold">
                Promovido
              </span>
            )}
            {post.type && post.type !== "text" && post.type !== "photo" && (
              <span className="text-[10px] border border-[#eae3ce] text-[#8a826a] px-1.5 py-0.5 rounded-full font-bold uppercase">
                {post.type}
              </span>
            )}
          </Link>
          <div className="text-[11px] text-[#8a826a] flex items-center gap-1">
            @{post.authorUsername} · {timeAgo(post.createdAt)}
            {post.location && (
              <>
                <span>·</span>
                <MapPin size={11} /> {post.location}
              </>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#c5a84a] font-bold tracking-widest uppercase">
          <CompassLogo size={16} /> Mori
        </div>
        {canDelete && (
          <div className="flex gap-0.5">
            {me?.role === "admin" && (
              <button onClick={hide} title="Ocultar" className="p-2 rounded-lg hover:bg-[#f5f1e8] text-[#a89f80]">
                <EyeOff size={16} />
              </button>
            )}
            <button onClick={del} title="Apagar" className="p-2 rounded-lg hover:bg-red-50 text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </header>

      {post.content && (
        <p className="px-4 pb-3 text-[15px] leading-relaxed whitespace-pre-wrap text-[#0f0f11]">{post.content}</p>
      )}

      {(post.imageUrl || (post.mediaUrls && post.mediaUrls.length > 0)) && (
        <div className="w-full bg-[#0f0f11] relative overflow-hidden">
          <div className="absolute top-3 right-3 z-10 opacity-80">
            <CompassLogo size={32} />
          </div>
          {post.mediaUrls && post.mediaUrls.length > 1 ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-thin">
              {post.mediaUrls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-full max-h-[520px] object-cover shrink-0 snap-center"
                  style={{ filter: getFilterCss(post.filter) }}
                />
              ))}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl || post.mediaUrls?.[0] || ""}
              alt=""
              className="w-full max-h-[520px] object-cover"
              style={{ filter: getFilterCss(post.filter) }}
            />
          )}
        </div>
      )}
      {post.videoUrl && (
        <div className="w-full bg-black">
          <video src={post.videoUrl} controls className="w-full max-h-[520px]" />
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t} className="text-[11px] text-[#0f0f11] bg-[#f5f1e8] px-2.5 py-0.5 rounded-full border border-[#eae3ce] font-medium">#{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 p-2 border-t border-[#f5f1e8] mt-2">
        <div className="relative">
          <button
            onClick={() => setShowReactions((v) => !v)}
            onMouseEnter={() => setShowReactions(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm hover:bg-[#f5f1e8] transition",
              liked ? "text-[#c5a84a] bg-[#faf7f0]" : "text-[#8a826a]",
            )}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} strokeWidth={2} />
            <span className="font-semibold">{likeCount}</span>
          </button>
          {showReactions && (
            <div
              onMouseLeave={() => setShowReactions(false)}
              className="absolute -top-12 left-0 bg-[#0f0f11] rounded-xl px-2.5 py-1.5 flex gap-2 shadow-xl z-20"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => react(r.key)}
                  title={r.label}
                  className={cn(
                    "w-9 h-9 rounded-full bg-[#16151a] hover:scale-110 transition flex items-center justify-center text-base shadow-lg",
                    selectedReaction === r.key && "ring-2 ring-[#c5a84a] scale-110",
                  )}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#8a826a] hover:bg-[#f5f1e8] hover:text-[#0f0f11] transition"
        >
          <MessageCircle size={18} />
          <span className="font-semibold">{post.commentCount}</span>
        </button>
        <button
          onClick={share}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#8a826a] hover:bg-[#f5f1e8] hover:text-[#0f0f11] transition"
        >
          <Share2 size={16} /> Compartilhar
        </button>
      </div>

      {showComments && (
        <div className="border-t border-[#f5f1e8] p-4 bg-[#fdfaf4]/60">
          <div className="space-y-3 max-h-72 overflow-auto scrollbar-thin pr-1">
            {comments?.length === 0 && <p className="text-xs text-[#a89f80]">Seja o primeiro a comentar.</p>}
            {comments?.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar src={c.authorAvatar} name={c.authorDisplayName} size={30} />
                <div className="flex-1">
                  <div className="bg-white rounded-xl px-3.5 py-2.5 border border-[#eae3ce] shadow-[0_1px_4px_rgba(15,15,17,0.04)] rounded-tl-none">
                    <Link href={`/u/${c.authorUsername}`} className="text-xs font-extrabold hover:underline text-[#0f0f11]">{c.authorDisplayName}</Link>
                    <p className="text-sm mt-1 text-[#0f0f11]">{c.content}</p>
                  </div>
                  <div className="text-[10px] text-[#b8b0a6] mt-1">{timeAgo(c.createdAt)}</div>
                </div>
              </div>
            ))}
            {!comments && <p className="text-xs text-[#a89f80]">Carregando...</p>}
          </div>
          {me && (
            <form onSubmit={submitComment} className="flex gap-2 mt-3">
              <Avatar src={me.avatarUrl} name={me.displayName} size={30} />
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Comente..."
                className="flex-1 rounded-full px-4 py-2 bg-white border border-[#eae3ce] text-sm outline-none focus:border-[#c5a84a] transition"
              />
              <button
                type="submit"
                disabled={busy || !commentInput.trim()}
                className="p-2.5 rounded-full bg-[#0f0f11] text-[#c5a84a] hover:bg-[#1a1815] disabled:opacity-40 transition shadow-lg"
              >
                <Send size={15} />
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
