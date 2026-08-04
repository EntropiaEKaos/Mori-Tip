import { db } from "@/db";
import { itineraries, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const { id } = await ctx.params;
    const [row] = await db
      .select({
        id: itineraries.id,
        title: itineraries.title,
        description: itineraries.description,
        coverUrl: itineraries.coverUrl,
        city: itineraries.city,
        state: itineraries.state,
        days: itineraries.days,
        budget: itineraries.budget,
        tags: itineraries.tags,
        stops: itineraries.stops,
        isPublic: itineraries.isPublic,
        likesCount: itineraries.likesCount,
        createdAt: itineraries.createdAt,
        authorId: itineraries.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatarUrl,
      })
      .from(itineraries)
      .innerJoin(users, eq(users.id, itineraries.authorId))
      .where(eq(itineraries.id, Number(id)))
      .limit(1);
    if (!row) throw new Error("Roteiro não encontrado");
    return row;
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const [row] = await db.select().from(itineraries).where(eq(itineraries.id, Number(id))).limit(1);
    if (!row) throw new Error("Roteiro não encontrado");
    if (row.authorId !== me.id && me.role !== "admin") throw new Error("FORBIDDEN");
    await db.delete(itineraries).where(eq(itineraries.id, Number(id)));
    return { ok: true };
  });
}
