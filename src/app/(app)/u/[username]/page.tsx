"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
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

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { me } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);

  const load = useCallback(async () => {
    const [pr, po] = await Promise.all([
      fetch(`/api/users/${username}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/posts?authorId=@${username}`).then(async () => null),
    ]);
    setProfile(pr);
    if (pr) {
      const r = await fetch(`/api/posts?authorId=${pr.id}`);
      if (r.ok) setPosts(await r.json());
    }
    void po;
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

  if (!profile) return <p className="text-sm text-slate-500 p-4">Carregando perfil...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-cyan-400 via-cyan-500 to-orange-400" />
        <div className="p-4 -mt-12">
          <Avatar
            src={profile.avatarUrl}
            name={profile.displayName}
            size={92}
            className="ring-4 ring-white"
          />
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {profile.displayName}
                {profile.isVerified && <span className="text-cyan-500 text-sm">✔</span>}
                {profile.role === "host" && (
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                    Anfitrião
                  </span>
                )}
                {profile.role === "admin" && (
                  <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded-full font-medium">
                    Admin
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500">@{profile.username}</p>
              {profile.bio && <p className="text-sm mt-2 max-w-md">{profile.bio}</p>}
              {profile.location && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {profile.location}
                </p>
              )}
            </div>
            {!profile.isMe && me && (
              <div className="flex gap-2">
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    profile.followedByMe
                      ? "bg-slate-100 hover:bg-slate-200"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {profile.followedByMe ? "Seguindo" : "Seguir"}
                </button>
                <button
                  onClick={openChat}
                  className="p-2 rounded-full border border-slate-300 hover:bg-slate-50"
                  title="Mensagem"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            )}
            {profile.isMe && (
              <Link
                href="/settings"
                className="px-4 py-1.5 rounded-full text-sm font-semibold border border-slate-300"
              >
                Editar perfil
              </Link>
            )}
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <span><b>{profile.posts}</b> <span className="text-slate-500">posts</span></span>
            <span><b>{profile.followers}</b> <span className="text-slate-500">seguidores</span></span>
            <span><b>{profile.following}</b> <span className="text-slate-500">seguindo</span></span>
          </div>
        </div>
      </div>

      {posts.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">Ainda sem publicações.</p>
      )}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} onChange={load} />
      ))}
    </div>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
