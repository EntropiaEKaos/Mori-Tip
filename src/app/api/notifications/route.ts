import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const me = await requireUser();
    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        message: notifications.message,
        entityId: notifications.entityId,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        actorId: notifications.actorId,
        actorUsername: users.username,
        actorAvatar: users.avatarUrl,
      })
      .from(notifications)
      .leftJoin(users, eq(users.id, notifications.actorId))
      .where(eq(notifications.userId, me.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    const [{ unread }] = await db
      .select({ unread: sql<number>`count(*) filter (where is_read = false)::int` })
      .from(notifications)
      .where(eq(notifications.userId, me.id));
    return { items: rows, unread };
  });
}

export async function POST() {
  // mark all as read
  return handleApi(async () => {
    const me = await requireUser();
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, me.id));
    return { ok: true };
  });
}
