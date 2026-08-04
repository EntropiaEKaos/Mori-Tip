import { db } from "@/db";
import { lives, users } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const { id } = await ctx.params;
    const [row] = await db
      .select({
        id: lives.id,
        title: lives.title,
        description: lives.description,
        status: lives.status,
        roomId: lives.roomId,
        viewerCount: lives.viewerCount,
        startedAt: lives.startedAt,
        hostId: lives.hostId,
        hostUsername: users.username,
        hostDisplayName: users.displayName,
        hostAvatar: users.avatarUrl,
      })
      .from(lives)
      .innerJoin(users, eq(users.id, lives.hostId))
      .where(eq(lives.id, Number(id)))
      .limit(1);
    if (!row) throw new Error("Live não encontrada");
    const me = await getCurrentUser();
    return { ...row, isHost: me?.id === row.hostId };
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const [row] = await db.select().from(lives).where(eq(lives.id, Number(id))).limit(1);
    if (!row) throw new Error("Live não encontrada");
    if (row.hostId !== me.id && me.role !== "admin") throw new Error("FORBIDDEN");
    await db
      .update(lives)
      .set({ status: "ended", endedAt: new Date() })
      .where(eq(lives.id, Number(id)));
    return { ok: true };
  });
}
