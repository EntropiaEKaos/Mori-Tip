import { db } from "@/db";
import { momentViews, moments, storyReactions, notifications, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const momentId = Number(id);
    const body = await req.json();
    const reaction = String(body.reaction ?? "heart").slice(0, 20);
    const [m] = await db.select().from(moments).where(eq(moments.id, momentId)).limit(1);
    if (!m) throw new Error("Momento não encontrado");
    // Marcar como visto
    const [existingView] = await db.select().from(momentViews).where(and(eq(momentViews.momentId, momentId), eq(momentViews.userId, me.id))).limit(1);
    if (!existingView) {
      await db.insert(momentViews).values({ momentId, userId: me.id });
      await db.update(moments).set({ viewCount: (m.viewCount || 0) + 1 }).where(eq(moments.id, momentId));
    }
    // Reagir (upsert)
    const [existing] = await db.select().from(storyReactions).where(and(eq(storyReactions.momentId, momentId), eq(storyReactions.userId, me.id))).limit(1);
    if (existing) {
      if (existing.reaction === reaction) {
        await db.delete(storyReactions).where(eq(storyReactions.id, existing.id));
        return { ok: true, removed: true };
      }
      await db.update(storyReactions).set({ reaction }).where(eq(storyReactions.id, existing.id));
    } else {
      await db.insert(storyReactions).values({ momentId, userId: me.id, reaction });
    }
    if (m.authorId !== me.id) {
      const [actor] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
      const reactionEmoji: Record<string, string> = { heart: "❤️", fire: "🔥", wow: "😮", laugh: "😂", sad: "😢", clap: "👏" };
      await db.insert(notifications).values({
        userId: m.authorId, actorId: me.id, type: "like", entityId: momentId,
        message: `${actor?.displayName} reagiu ao seu momento com ${reactionEmoji[reaction] ?? reaction}`,
      });
    }
    return { ok: true };
  });
}
