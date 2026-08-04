"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, MessageCircle, Pin, Star, Plus, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { PostCard, type FeedPost } from "@/components/post-card";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

type Profile = {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  location: string | null;
  role: string;
  isVerified: boolean;
  followers: number;
  following: number;
  posts: number;
  followedByMe: boolean;
  isMe: boolean;
};

type Pinned = {
  id: number;
  content: string;
  imageUrl: string | null;
  mediaUrls: string[];
  filter: string | null;
  location: string | null;
  tags: string[];
  createdAt: string;
  type: string;
  position: number;
};

type Highlight = {
  id: number;
  title: string;
  coverUrl: string | null;
  momentIds: number[];
};

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { me } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [pinned, setPinned] = useState<Pinned[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "reviews">("posts");

  const load = useCallback(async () => {
    const pr = await fetch(`/api/users/${username}`).then((r) => (r.ok ? r.json() : null));
    setProfile(pr);
    if (pr) {
      const [postsRes, pinnedRes, highlightsRes] = await Promise.all([
        fetch(`/api/posts?authorId=${pr.id}`).then((r) => r.json()),
        fetch(`/api/pin?userId=${pr.id}`).then((r) => r.json()),
        fetch(`/api/highlights?username=${username}`).then((r) => r.json()),
      ]);
      setPosts(postsRes);
      setPinned(pinnedRes);
      setHighlights(highlightsRes);
    }
  }, [username]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleFollow() {
    if (!profile || !me) return;
    setProfile({
      ...profile,
      followedByMe: !profile.followedByMe,
      followers: profile.followers + (profile.followedByMe ? -1 : 1),
    });
    await fetch(`/api/users/${profile.username}/follow`, { method: "POST" });
    load();
  }

  async function openChat() {
    if (!profile) return;
    const r = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: profile.id }),
    });
    const d = await r.json();
    if (r.ok) router.push(`/messages/${d.id}`);
  }

  async function togglePin(postId: number) {
    await fetch("/api/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    load();
  }

  if (!profile) return <p className="text-sm text-slate-500 p-4">Carregando perfil...</p>;

  return (
    <div className="space-y-4">
      {/* Cover + Avatar */}
      <div className="relative bg-white border border-[#e8e2d4] rounded-3xl overflow-hidden">
        <div className="h-44 bg-gradient-to-br from-[#c5a84a] via-[#9b8038] to-[#0f0f11] relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        </div>
        <div className="px-6 pb-6 -mt-14 relative">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div className="relative">
              <Avatar
                src={profile.avatarUrl}
                name={profile.displayName}
                size={104}
                className="ring-4 ring-white shadow-xl"
              />
            </div>
            {!profile.isMe && me && (
              <div className="flex gap-2 mb-2">
                <button
                  onClick={toggleFollow}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition ${
                    profile.followedByMe
                      ? "bg-white border border-[#e8e2d4] text-[#0f0f11] hover:border-[#c5a84a]"
                      : "bg-[#0f0f11] text-white hover:bg-[#c5a84a] hover:text-[#0f0f11]"
                  }`}
                >
                  {profile.followedByMe ? "Seguindo" : "Seguir"}
                </button>
                <button
                  onClick={openChat}
                  className="p-2.5 rounded-full border border-[#e8e2d4] hover:border-[#c5a84a] hover:bg-[#fdfaf4] transition"
                  title="Mensagem"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            )}
            {profile.isMe && (
              <Link href="/settings" className="px-5 py-2 rounded-full text-sm font-bold border border-[#e8e2d4] hover:border-[#c5a84a] mb-2">
                Editar perfil
              </Link>
            )}
          </div>
          <div className="mt-3">
            <h1 className="text-2xl font-extrabold tracking-[-1px] flex items-center gap-2">
              {profile.displayName}
              {profile.isVerified && <span className="text-[#c5a84a] text-sm">✔</span>}
              {profile.role === "host" && <span className="text-[10px] bg-[#fdfaf4] border border-[#c5a84a] text-[#9b8038] px-2 py-0.5 rounded-full font-bold">Anfitrião</span>}
              {profile.role === "admin" && <span className="text-[10px] bg-[#0f0f11] text-white px-2 py-0.5 rounded-full font-bold">Admin</span>}
            </h1>
            <p className="text-sm text-[#8a826a]">@{profile.username}</p>
            {profile.bio && <p className="text-sm mt-2 max-w-md text-[#1a1815]">{profile.bio}</p>}
            {profile.location && (
              <p className="text-xs text-[#8a826a] flex items-center gap-1 mt-1">
                <MapPin size={11} /> {profile.location}
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-8 text-sm">
            <span><b className="text-[#0f0f11]">{profile.posts}</b> <span className="text-[#8a826a]">posts</span></span>
            <span><b className="text-[#0f0f11]">{profile.followers}</b> <span className="text-[#8a826a]">seguidores</span></span>
            <span><b className="text-[#0f0f11]">{profile.following}</b> <span className="text-[#8a826a]">seguindo</span></span>
          </div>
        </div>
      </div>

      {/* Highlights (estilo Instagram) */}
      {highlights.length > 0 && (
        <div className="bg-white border border-[#e8e2d4] rounded-3xl p-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-1">
            {highlights.map((h) => (
              <div key={h.id} className="shrink-0 flex flex-col items-center gap-2 w-16 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#c5a84a] via-[#c5a84a]/60 to-[#0f0f11] p-[2px] group-hover:scale-105 transition">
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#fdfaf4] flex items-center justify-center text-2xl overflow-hidden">
                      {h.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.coverUrl} alt={h.title} className="w-full h-full object-cover" />
                      ) : (
                        <span>⭐</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-[#0f0f11] font-medium truncate w-full text-center">{h.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-[#e8e2d4] rounded-2xl flex overflow-hidden">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-3 text-sm font-bold transition ${
            activeTab === "posts" ? "text-[#c5a84a] border-b-2 border-[#c5a84a]" : "text-[#8a826a] hover:bg-[#fdfaf4]"
          }`}
        >
          Publicações
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 py-3 text-sm font-bold transition ${
            activeTab === "reviews" ? "text-[#c5a84a] border-b-2 border-[#c5a84a]" : "text-[#8a826a] hover:bg-[#fdfaf4]"
          }`}
        >
          Avaliações
        </button>
      </div>

      {/* Pinned Posts */}
      {activeTab === "posts" && pinned.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[11px] tracking-[2px] text-[#8a826a] font-bold flex items-center gap-1.5 px-2">
            <Pin size={11} /> FIXADOS
          </h2>
          {pinned.map((p) => (
            <div key={p.id} className="relative">
              {profile.isMe && (
                <button
                  onClick={() => togglePin(p.id)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur hover:bg-white border border-[#e8e2d4]"
                  title="Desafixar"
                >
                  <X size={12} />
                </button>
              )}
              <PostCard
                post={{
                  ...p,
                  isHidden: false,
                  authorId: profile.id,
                  authorUsername: profile.username,
                  authorDisplayName: profile.displayName,
                  authorAvatar: profile.avatarUrl,
                  authorVerified: profile.isVerified,
                  likeCount: 0,
                  commentCount: 0,
                  likedByMe: false,
                }}
                onChange={load}
              />
            </div>
          ))}
        </div>
      )}

      {/* Posts normais */}
      {activeTab === "posts" && (
        <div className="space-y-3">
          {posts.filter((p) => !pinned.find((pn) => pn.id === p.id)).map((p) => (
            <div key={p.id} className="relative">
              {profile.isMe && pinned.length < 3 && !pinned.find((pn) => pn.id === p.id) && (
                <button
                  onClick={() => togglePin(p.id)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur border border-[#e8e2d4] text-[#8a826a] hover:text-[#c5a84a]"
                  title="Fixar no perfil"
                >
                  <Pin size={12} />
                </button>
              )}
              <PostCard post={p} onChange={load} />
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-sm text-[#8a826a] text-center py-8">Ainda sem publicações.</p>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <ReviewsList userId={profile.id} username={profile.username} />
      )}
    </div>
  );
}

function ReviewsList({ userId, username }: { userId: number; username: string }) {
  const [reviews, setReviews] = useState<Array<{
    id: number;
    rating: number;
    title: string | null;
    content: string;
    pros: string[];
    cons: string[];
    createdAt: string;
    authorUsername: string;
    authorDisplayName: string;
    authorAvatar: string | null;
  }>>([]);

  useEffect(() => {
    fetch(`/api/reviews?type=guide&id=0`).catch(() => {});
    // Reviews de pousadas e produtos desse usuário serão carregados via API dedicada
  }, []);

  return (
    <div className="bg-white border border-[#e8e2d4] rounded-2xl p-8 text-center text-sm text-[#8a826a]">
      <Star className="mx-auto mb-3 text-[#c5a84a]" />
      <p>As avaliações aparecem aqui quando outros viajantes deixam reviews sobre pousadas, produtos ou guias vinculados a @{username}.</p>
    </div>
  );
}

export const dynamic = "force-dynamic";
