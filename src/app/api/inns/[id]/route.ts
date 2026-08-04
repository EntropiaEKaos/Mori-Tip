import { db } from "@/db";
import { inns, users } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const { id } = await ctx.params;
    const [row] = await db
      .select({
        id: inns.id,
        name: inns.name,
        slug: inns.slug,
        description: inns.description,
        city: inns.city,
        state: inns.state,
        country: inns.country,
        coverUrl: inns.coverUrl,
        pricePerNight: inns.pricePerNight,
        rating: inns.rating,
        amenities: inns.amenities,
        isApproved: inns.isApproved,
        acceptsBookings: inns.acceptsBookings,
        totalBookings: inns.totalBookings,
        ownerId: inns.ownerId,
        ownerUsername: users.username,
        ownerDisplayName: users.displayName,
        ownerAvatar: users.avatarUrl,
        ownerIsPremium: users.isPremium,
      })
      .from(inns)
      .innerJoin(users, eq(users.id, inns.ownerId))
      .where(eq(inns.id, Number(id)))
      .limit(1);
    if (!row) throw new Error("Pousada não encontrada");
    return row;
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const [inn] = await db.select().from(inns).where(eq(inns.id, Number(id))).limit(1);
    if (!inn) throw new Error("Pousada não encontrada");
    if (inn.ownerId !== me.id && me.role !== "admin") throw new Error("FORBIDDEN");
    const body = await req.json();
    const patch: Partial<typeof inns.$inferInsert> = {};
    if (typeof body.description === "string") patch.description = body.description.slice(0, 2000);
    if (typeof body.pricePerNight === "number") patch.pricePerNight = body.pricePerNight;
    if (Array.isArray(body.amenities)) patch.amenities = body.amenities.map(String);
    if (typeof body.acceptsBookings === "boolean") {
      if (body.acceptsBookings && !me.isPremium && me.role !== "admin") {
        throw new Error("Reservas online exigem conta Premium");
      }
      patch.acceptsBookings = body.acceptsBookings;
    }
    if (typeof body.coverUrl === "string") patch.coverUrl = body.coverUrl;
    await db.update(inns).set(patch).where(eq(inns.id, inn.id));
    return { ok: true };
  });
}

export const _g = getCurrentUser;
