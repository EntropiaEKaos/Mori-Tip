import { db } from "@/db";
import { lives, users, follows, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { desc, eq, ne } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const rows = await db
      .select({
        id: lives.id,
        title: lives.title,
        description: lives.description,
        status: lives.status,
        roomId: lives.roomId,
        viewerCount: lives.viewerCount,
        startedAt: lives.startedAt,
        createdAt: lives.createdAt,
        hostId: lives.hostId,
        hostUsername: users.username,
        hostDisplayName: users.displayName,
        hostAvatar: users.avatarUrl,
      })
      .from(lives)
      .innerJoin(users, eq(users.id, lives.hostId))
      .where(ne(lives.status, "ended"))
      .orderBy(desc(lives.createdAt))
      .limit(50);
    return rows;
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const title = String(body.title ?? "").slice(0, 160).trim();
    if (!title) throw new Error("Título obrigatório");
    const description = String(body.description ?? "").slice(0, 500);
    const roomId = `live-${me.id}-${Date.now().toString(36)}`;
    const [live] = await db
      .insert(lives)
      .values({ hostId: me.id, title, description, roomId, status: "live", startedAt: new Date() })
      .returning();
    // notify followers
    const fs = await db.select({ id: follows.followerId }).from(follows).where(eq(follows.followingId, me.id));
    if (fs.length) {
      await db.insert(notifications).values(
        fs.map((f) => ({
          userId: f.id,
          actorId: me.id,
          type: "live" as const,
          entityId: live.id,
          message: `${me.displayName} entrou ao vivo: ${title}`,
        })),
      );
    }
    return live;
  });
}
