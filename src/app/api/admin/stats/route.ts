import { db } from "@/db";
import { users, posts, comments, lives, inns, notifications, messages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();
    const [u] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
    const [p] = await db.select({ c: sql<number>`count(*)::int` }).from(posts);
    const [c] = await db.select({ c: sql<number>`count(*)::int` }).from(comments);
    const [l] = await db.select({ c: sql<number>`count(*)::int` }).from(lives);
    const [i] = await db.select({ c: sql<number>`count(*)::int` }).from(inns);
    const [n] = await db.select({ c: sql<number>`count(*)::int` }).from(notifications);
    const [m] = await db.select({ c: sql<number>`count(*)::int` }).from(messages);
    const [pendingInns] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(inns)
      .where(sql`is_approved = false`);
    const [bannedUsers] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(users)
      .where(sql`is_banned = true`);
    const [liveNow] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(lives)
      .where(sql`status = 'live'`);
    return {
      users: u.c,
      posts: p.c,
      comments: c.c,
      lives: l.c,
      liveNow: liveNow.c,
      inns: i.c,
      pendingInns: pendingInns.c,
      notifications: n.c,
      messages: m.c,
      bannedUsers: bannedUsers.c,
    };
  });
}
