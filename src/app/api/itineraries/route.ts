import { db } from "@/db";
import { itineraries, users } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { awardXp } from "@/lib/gamification";
import { desc, eq, ilike, or, and } from "drizzle-orm";

export async function GET(req: Request) {
  return handleApi(async () => {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const me = await getCurrentUser();
    const rows = await db
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
      .where(
        and(
          or(eq(itineraries.isPublic, true), me ? eq(itineraries.authorId, me.id) : undefined),
          q
            ? or(
                ilike(itineraries.title, `%${q}%`),
                ilike(itineraries.city, `%${q}%`),
                ilike(itineraries.state, `%${q}%`),
              )
            : undefined,
        ),
      )
      .orderBy(desc(itineraries.createdAt))
      .limit(50);
    return rows;
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const title = String(body.title ?? "").slice(0, 160).trim();
    if (!title) throw new Error("Título obrigatório");
    const stops = Array.isArray(body.stops)
      ? body.stops.map((s: { day?: number; title?: string; description?: string; location?: string }) => ({
          day: Number(s.day) || 1,
          title: String(s.title ?? "").slice(0, 120),
          description: String(s.description ?? "").slice(0, 500),
          location: s.location ? String(s.location).slice(0, 160) : undefined,
        }))
      : [];
    const [row] = await db
      .insert(itineraries)
      .values({
        authorId: me.id,
        title,
        description: String(body.description ?? "").slice(0, 2000),
        coverUrl: body.coverUrl ?? null,
        city: String(body.city ?? "—").slice(0, 100),
        state: String(body.state ?? "—").slice(0, 100),
        days: Math.max(1, Number(body.days) || 1),
        budget: Math.max(0, Number(body.budget) || 0),
        tags: Array.isArray(body.tags) ? body.tags.map(String).slice(0, 12) : [],
        stops,
        isPublic: body.isPublic !== false,
      })
      .returning();
    await awardXp(me.id, 40, "itinerary");
    return row;
  });
}
