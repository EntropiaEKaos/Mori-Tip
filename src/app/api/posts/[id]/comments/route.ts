import { db } from "@/db";
import { comments, posts, users, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { asc, eq } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const { id } = await ctx.params;
    const postId = Number(id);
    const rows = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        authorId: comments.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatarUrl,
      })
      .from(comments)
      .innerJoin(users, eq(users.id, comments.authorId))
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt))
      .limit(200);
    return rows;
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const user = await requireUser();
    const { id } = await ctx.params;
    const postId = Number(id);
    const { content } = await req.json();
    const text = String(content ?? "").slice(0, 500).trim();
    if (!text) throw new Error("Comentário vazio");
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post) throw new Error("Post não encontrado");
    const [row] = await db
      .insert(comments)
      .values({ postId, authorId: user.id, content: text })
      .returning();
    if (post.authorId !== user.id) {
      await db.insert(notifications).values({
        userId: post.authorId,
        actorId: user.id,
        type: "comment",
        entityId: postId,
        message: `${user.displayName} comentou: "${text.slice(0, 60)}"`,
      });
    }
    return row;
  });
}
