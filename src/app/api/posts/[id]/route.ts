import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, eq } from "drizzle-orm";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const user = await requireUser();
    const { id } = await ctx.params;
    const [existing] = await db.select().from(posts).where(eq(posts.id, Number(id))).limit(1);
    if (!existing) throw new Error("Post não encontrado");
    if (existing.authorId !== user.id && user.role !== "admin") throw new Error("FORBIDDEN");
    await db.delete(posts).where(eq(posts.id, Number(id)));
    return { ok: true };
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const user = await requireUser();
    if (user.role !== "admin") throw new Error("FORBIDDEN");
    const { id } = await ctx.params;
    const body = await req.json();
    await db
      .update(posts)
      .set({ isHidden: Boolean(body.isHidden) })
      .where(eq(posts.id, Number(id)));
    return { ok: true };
  });
}

export const dynamic = "force-dynamic";
export const _unused = and;
