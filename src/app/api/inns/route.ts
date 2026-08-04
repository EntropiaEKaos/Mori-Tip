import { db } from "@/db";
import { inns, users } from "@/db/schema";
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
        createdAt: inns.createdAt,
        ownerId: inns.ownerId,
        ownerUsername: users.username,
        ownerDisplayName: users.displayName,
      })
      .from(inns)
      .innerJoin(users, eq(users.id, inns.ownerId))
      .where(
        and(
          eq(inns.isApproved, true),
          q ? or(ilike(inns.name, `%${q}%`), ilike(inns.city, `%${q}%`), ilike(inns.state, `%${q}%`)) : undefined,
        ),
      )
      .orderBy(desc(inns.rating))
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
      .insert(inns)
      .values({
        ownerId: me.id,
        name,
        slug,
        description: String(body.description ?? "").slice(0, 2000),
        city,
        state,
        country: String(body.country ?? "Brasil").slice(0, 100),
        coverUrl: body.coverUrl ?? null,
        pricePerNight: Number(body.pricePerNight ?? 0) || 0,
        amenities: Array.isArray(body.amenities) ? body.amenities.map(String).slice(0, 20) : [],
        isApproved: me.role === "admin" || me.isPremium,
        acceptsBookings: me.isPremium || me.role === "admin",
      })
      .returning();
    return row;
  });
}
