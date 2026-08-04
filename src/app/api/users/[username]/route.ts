import { db } from "@/db";
import { users, follows, posts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq, sql, and } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ username: string }> }) {
  return handleApi(async () => {
    const { username } = await ctx.params;
    const me = await getCurrentUser();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);
    if (!user) throw new Error("Usuário não encontrado");
    const [{ f }] = await db
      .select({ f: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followingId, user.id));
    const [{ fg }] = await db
      .select({ fg: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followerId, user.id));
    const [{ p }] = await db
      .select({ p: sql<number>`count(*)::int` })
      .from(posts)
      .where(eq(posts.authorId, user.id));
    let followedByMe = false;
    if (me && me.id !== user.id) {
      const [exists] = await db
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, me.id), eq(follows.followingId, user.id)))
        .limit(1);
      followedByMe = Boolean(exists);
    }
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      location: user.location,
      role: user.role,
      isVerified: user.isVerified,
      followers: f,
      following: fg,
      posts: p,
      followedByMe,
      isMe: me?.id === user.id,
    };
  });
}
