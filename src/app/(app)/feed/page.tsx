"use client";

import { useCallback, useEffect, useState } from "react";
import { Composer } from "@/components/composer";
import { PostCard, type FeedPost } from "@/components/post-card";
import { MomentsBar } from "@/components/moments-bar";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function FeedPage() {
  const { me } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [tab, setTab] = useState<"for-you" | "following">("for-you");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/posts?scope=${tab}`, { cache: "no-store" });
    if (r.ok) setPosts(await r.json());
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-4 pb-10">
      <MomentsBar />

      <div className="bg-white rounded-2xl border border-[#eae3ce] sticky top-0 lg:top-4 z-30 flex overflow-hidden">
        <button
          onClick={() => setTab("for-you")}
          className={cn(
            "flex-1 py-3 font-semibold text-sm relative",
            tab === "for-you" ? "text-[#c5a84a]" : "text-[#8a826a] hover:bg-[#fdfaf4]",
          )}
        >
          Para você
          {tab === "for-you" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#c5a84a] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setTab("following")}
          className={cn(
            "flex-1 py-3 font-semibold text-sm relative",
            tab === "following" ? "text-[#c5a84a]" : "text-[#8a826a] hover:bg-[#fdfaf4]",
          )}
        >
          Seguindo
          {tab === "following" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#c5a84a] rounded-t-full" />
          )}
        </button>
      </div>

      {me ? (
        <Composer onPosted={load} />
      ) : (
        <div className="bg-white border border-[#eae3ce] rounded-2xl p-6 text-center">
          <p className="text-[#8a826a] mb-3">Entre para publicar, curtir e conversar.</p>
          <div className="flex gap-2 justify-center">
            <Link href="/login" className="px-4 py-2 rounded-lg bg-[#0f0f11] text-[#c5a84a] text-sm font-bold">
              Entrar
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-lg border border-[#eae3ce] text-sm font-bold">
              Criar conta
            </Link>
          </div>
        </div>
      )}

      {loading && <p className="text-center text-sm text-[#a89f80] py-8">Carregando feed...</p>}
      {!loading && posts.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#eae3ce] p-10 text-center">
          <p className="text-[#8a826a]">
            {tab === "following"
              ? "Você ainda não segue ninguém. Explore para descobrir viajantes."
              : "Ainda sem publicações. Seja o primeiro a compartilhar!"}
          </p>
        </div>
      )}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} onChange={load} />
      ))}
    </div>
  );
}
