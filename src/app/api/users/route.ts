import { db } from "@/db";
import { users } from "@/db/schema";
import { handleApi } from "@/lib/api";
import { ilike, or, ne, and, eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  return handleApi(async () => {
    const me = await getCurrentUser();
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        isVerified: users.isVerified,
        role: users.role,
      })
      .from(users)
      .where(
        and(
          eq(users.isBanned, false),
          me ? ne(users.id, me.id) : undefined,
          q ? or(ilike(users.username, `%${q}%`), ilike(users.displayName, `%${q}%`)) : undefined,
        ),
      )
      .orderBy(desc(users.createdAt))
      .limit(30);
    return rows;
  });
}
