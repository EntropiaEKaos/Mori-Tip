import { db } from "@/db";
import { restaurants, users } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const { id } = await ctx.params;
    const [row] = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        description: restaurants.description,
        city: restaurants.city,
        state: restaurants.state,
        coverUrl: restaurants.coverUrl,
        cuisineType: restaurants.cuisineType,
        avgPrice: restaurants.avgPrice,
        rating: restaurants.rating,
        amenities: restaurants.amenities,
        isApproved: restaurants.isApproved,
        isVerified: restaurants.isVerified,
        acceptsReservations: restaurants.acceptsReservations,
        ownerId: restaurants.ownerId,
        ownerUsername: users.username,
        ownerDisplayName: users.displayName,
        ownerIsPremium: users.isPremium,
      })
      .from(restaurants)
      .innerJoin(users, eq(users.id, restaurants.ownerId))
      .where(eq(restaurants.id, Number(id)))
      .limit(1);
    if (!row) throw new Error("Restaurante não encontrado");
    return row;
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const [r] = await db.select().from(restaurants).where(eq(restaurants.id, Number(id))).limit(1);
    if (!r) throw new Error("Restaurante não encontrado");
    if (r.ownerId !== me.id && me.role !== "admin") throw new Error("FORBIDDEN");
    const body = await req.json();
    const patch: Partial<typeof restaurants.$inferInsert> = {};
    if (typeof body.description === "string") patch.description = body.description.slice(0, 2000);
    if (typeof body.avgPrice === "number") patch.avgPrice = body.avgPrice;
    if (typeof body.cuisineType === "string") patch.cuisineType = body.cuisineType.slice(0, 60);
    if (typeof body.acceptsReservations === "boolean") {
      if (body.acceptsReservations && !me.isPremium && me.role !== "admin") {
        throw new Error("Reservas online exigem conta Premium");
      }
      patch.acceptsReservations = body.acceptsReservations;
    }
    if (typeof body.coverUrl === "string") patch.coverUrl = body.coverUrl;
    await db.update(restaurants).set(patch).where(eq(restaurants.id, r.id));
    return { ok: true };
  });
}

export const _g = getCurrentUser;
