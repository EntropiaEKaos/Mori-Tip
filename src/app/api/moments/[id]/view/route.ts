import { db } from "@/db";
import { moments, momentViews } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, eq, sql } from "drizzle-orm";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const momentId = Number(id);
    const [m] = await db.select().from(moments).where(eq(moments.id, momentId)).limit(1);
    if (!m) throw new Error("Momento não encontrado");
    const [exists] = await db
      .select()
      .from(momentViews)
      .where(and(eq(momentViews.momentId, momentId), eq(momentViews.userId, me.id)))
      .limit(1);
    if (!exists) {
      await db.insert(momentViews).values({ momentId, userId: me.id });
      await db
        .update(moments)
        .set({ viewCount: sql`${moments.viewCount} + 1` })
        .where(eq(moments.id, momentId));
    }
    return { ok: true };
  });
}
