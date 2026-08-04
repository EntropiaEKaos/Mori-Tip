import { db } from "@/db";
import { restaurants, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  return handleApi(async () => {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const rows = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        slug: restaurants.slug,
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
        totalBookings: restaurants.totalBookings,
        createdAt: restaurants.createdAt,
        ownerId: restaurants.ownerId,
        ownerUsername: users.username,
        ownerDisplayName: users.displayName,
      })
      .from(restaurants)
      .innerJoin(users, eq(users.id, restaurants.ownerId))
      .where(
        and(
          eq(restaurants.isApproved, true),
          q
            ? or(
                ilike(restaurants.name, `%${q}%`),
                ilike(restaurants.city, `%${q}%`),
                ilike(restaurants.state, `%${q}%`),
                ilike(restaurants.cuisineType, `%${q}%`),
              )
            : undefined,
        ),
      )
      .orderBy(desc(restaurants.rating))
      .limit(50);
    return rows;
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const name = String(body.name ?? "").slice(0, 120).trim();
    if (!name) throw new Error("Nome obrigatório");
    const city = String(body.city ?? "").slice(0, 100).trim() || "—";
    const state = String(body.state ?? "").slice(0, 100).trim() || "—";
    const slug = `${slugify(name)}-${Date.now().toString(36)}`;
    const [row] = await db
      .insert(restaurants)
      .values({
        ownerId: me.id,
        name,
        slug,
        description: String(body.description ?? "").slice(0, 2000),
        city,
        state,
        country: String(body.country ?? "Brasil").slice(0, 100),
        coverUrl: body.coverUrl ?? null,
        cuisineType: body.cuisineType ? String(body.cuisineType).slice(0, 60) : null,
        avgPrice: Number(body.avgPrice ?? 0) || 0,
        amenities: Array.isArray(body.amenities) ? body.amenities.map(String).slice(0, 20) : [],
        isApproved: me.role === "admin" || me.isPremium,
        acceptsReservations: me.isPremium || me.role === "admin",
      })
      .returning();
    return row;
  });
}
