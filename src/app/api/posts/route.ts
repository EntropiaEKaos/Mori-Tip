import { db } from "@/db";
import { posts, users, likes, comments, follows } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { awardXp } from "@/lib/gamification";
import { desc, eq, sql, and, inArray } from "drizzle-orm";

export async function GET(req: Request) {
  return handleApi(async () => {
    const url = new URL(req.url);
    const scope = url.searchParams.get("scope") ?? "for-you";
    const authorId = url.searchParams.get("authorId");
    const me = await getCurrentUser();

    let authorFilter: number[] | null = null;
    if (scope === "following" && me) {
      const rows = await db
        .select({ id: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, me.id));
      authorFilter = rows.map((r) => r.id);
      if (authorFilter.length === 0) return [];
    }
    if (authorId) {
      authorFilter = [Number(authorId)];
    }

    const list = await db
      .select({
        id: posts.id,
        type: posts.type,
        content: posts.content,
        imageUrl: posts.imageUrl,
        mediaUrls: posts.mediaUrls,
        videoUrl: posts.videoUrl,
        filter: posts.filter,
        location: posts.location,
        tags: posts.tags,
        createdAt: posts.createdAt,
        isHidden: posts.isHidden,
        isSponsored: posts.isSponsored,
        authorId: posts.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatarUrl,
        authorVerified: users.isVerified,
        authorLevel: users.level,
        likeCount: sql<number>`(select count(*)::int from ${likes} where ${likes.postId} = ${posts.id})`,
        commentCount: sql<number>`(select count(*)::int from ${comments} where ${comments.postId} = ${posts.id})`,
        likedByMe: me
          ? sql<boolean>`exists(select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${me.id})`
          : sql<boolean>`false`,
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .where(
        and(
          eq(posts.isHidden, false),
          authorFilter ? inArray(posts.authorId, authorFilter) : sql`true`,
        ),
      )
      .orderBy(desc(posts.createdAt))
      .limit(50);
    return list;
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const user = await requireUser();
    const body = await req.json();
    const content = String(body.content ?? "").slice(0, 2000);
    const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
    const videoUrl = body.videoUrl ? String(body.videoUrl) : null;
    const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls.map(String).slice(0, 8) : [];
    if (!content && !imageUrl && !videoUrl && mediaUrls.length === 0) {
      throw new Error("Adicione texto, foto ou vídeo");
    }
    const allowed = ["text", "photo", "video", "carousel", "tip", "review", "promo"] as const;
    let type = (allowed.includes(body.type) ? body.type : "text") as (typeof allowed)[number];
    if (type === "text") {
      if (mediaUrls.length > 1) type = "carousel";
      else if (videoUrl) type = "video";
      else if (imageUrl) type = "photo";
    }
    const filter = body.filter ? String(body.filter).slice(0, 20) : null;
    const location = body.location ? String(body.location).slice(0, 160) : null;
    const tags = Array.isArray(body.tags) ? body.tags.map(String).slice(0, 10) : [];
    const [row] = await db
      .insert(posts)
      .values({
        authorId: user.id,
        type,
        content,
        imageUrl,
        videoUrl,
        mediaUrls,
        filter,
        location,
        tags,
      })
      .returning();
    await awardXp(user.id, 20, "post");
    return row;
  });
}
