import { db } from "@/db";
import { itineraryCollaborators, itineraries, users, notifications } from "@/db/schema";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq, and } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const { id } = await ctx.params;
    const rows = await db
      .select({
        userId: itineraryCollaborators.userId,
        role: itineraryCollaborators.role,
        invitedAt: itineraryCollaborators.invitedAt,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(itineraryCollaborators)
      .innerJoin(users, eq(users.id, itineraryCollaborators.userId))
      .where(eq(itineraryCollaborators.itineraryId, Number(id)));
    return rows;
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const itinId = Number(id);
    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, itinId)).limit(1);
    if (!itin) throw new Error("Roteiro não encontrado");
    if (itin.authorId !== me.id && me.role !== "admin") throw new Error("FORBIDDEN");
    const body = await req.json();
    const userId = Number(body.userId);
    if (!userId) throw new Error("userId obrigatório");
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error("Usuário não encontrado");
    const role = ["viewer", "editor", "admin"].includes(body.role) ? body.role : "editor";
    await db.insert(itineraryCollaborators).values({ itineraryId: itinId, userId, role }).onConflictDoNothing();
    await db.insert(notifications).values({
      userId, actorId: me.id, type: "system",
      message: `${me.displayName} convidou você para colaborar no roteiro "${itin.title}"`,
    });
    return { ok: true };
  });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const url = new URL(req.url);
    const userId = Number(url.searchParams.get("userId"));
    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, Number(id))).limit(1);
    if (!itin) throw new Error("Roteiro não encontrado");
    if (itin.authorId !== me.id && me.role !== "admin" && userId !== me.id) throw new Error("FORBIDDEN");
    await db.delete(itineraryCollaborators).where(and(eq(itineraryCollaborators.itineraryId, Number(id)), eq(itineraryCollaborators.userId, userId)));
    return { ok: true };
  });
}
