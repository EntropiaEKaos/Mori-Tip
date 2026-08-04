import { db } from "@/db";
import { likes, posts, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, eq } from "drizzle-orm";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const user = await requireUser();
    const { id } = await ctx.params;
    const postId = Number(id);
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post) throw new Error("Post não encontrado");
    const [exists] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)))
      .limit(1);
    if (exists) {
      await db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));
      return { liked: false };
    }
    await db.insert(likes).values({ postId, userId: user.id });
    if (post.authorId !== user.id) {
      await db.insert(notifications).values({
        userId: post.authorId,
        actorId: user.id,
        type: "like",
        entityId: postId,
        message: `${user.displayName} curtiu seu post`,
      });
    }
    return { liked: true };
  });
}
