import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();
    const rows = await db
      .select({
        id: posts.id,
        content: posts.content,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        isHidden: posts.isHidden,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .orderBy(desc(posts.createdAt))
      .limit(200);
    return rows;
  });
}
