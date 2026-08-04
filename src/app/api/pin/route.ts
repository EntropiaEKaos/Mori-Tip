import { db } from "@/db";
import { pinnedPosts, posts } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  return handleApi(async () => {
    const url = new URL(req.url);
    const userId = Number(url.searchParams.get("userId"));
    if (!userId) throw new Error("userId obrigatório");
    return db
      .select({
        id: posts.id,
        content: posts.content,
        imageUrl: posts.imageUrl,
        mediaUrls: posts.mediaUrls,
        filter: posts.filter,
        location: posts.location,
        tags: posts.tags,
        createdAt: posts.createdAt,
        type: posts.type,
        position: pinnedPosts.position,
      })
      .from(pinnedPosts)
      .innerJoin(posts, eq(posts.id, pinnedPosts.postId))
      .where(eq(pinnedPosts.userId, userId))
      .orderBy(pinnedPosts.position, desc(posts.createdAt));
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const postId = Number(body.postId);
    if (!postId) throw new Error("postId obrigatório");
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post || post.authorId !== me.id) throw new Error("FORBIDDEN");
    // Limite: 3 pins
    const existing = await db.select().from(pinnedPosts).where(eq(pinnedPosts.userId, me.id));
    if (existing.length >= 3 && !existing.find((p) => p.postId === postId)) {
      throw new Error("Limite de 3 posts fixados atingido");
    }
    await db.insert(pinnedPosts).values({ userId: me.id, postId, position: existing.length }).onConflictDoNothing();
    return { ok: true };
  });
}

export async function DELETE(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const url = new URL(req.url);
    const postId = Number(url.searchParams.get("postId"));
    await db.delete(pinnedPosts).where(and(eq(pinnedPosts.userId, me.id), eq(pinnedPosts.postId, postId)));
    return { ok: true };
  });
}
