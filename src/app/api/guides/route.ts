import { db } from "@/db";
import { guides, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { awardXp, checkAndAwardBadges } from "@/lib/gamification";
import { desc, eq, ilike, or, and } from "drizzle-orm";

export async function GET(req: Request) {
  return handleApi(async () => {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const rows = await db
      .select({
        id: guides.id,
        headline: guides.headline,
        about: guides.about,
        city: guides.city,
        state: guides.state,
        languages: guides.languages,
        specialties: guides.specialties,
        pricePerDay: guides.pricePerDay,
        rating: guides.rating,
        reviewCount: guides.reviewCount,
        isAvailable: guides.isAvailable,
        isVerified: guides.isVerified,
        userId: guides.userId,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(guides)
      .innerJoin(users, eq(users.id, guides.userId))
      .where(
        and(
          eq(guides.isAvailable, true),
          q
            ? or(
                ilike(guides.city, `%${q}%`),
                ilike(guides.headline, `%${q}%`),
                ilike(users.displayName, `%${q}%`),
              )
            : undefined,
        ),
      )
      .orderBy(desc(guides.rating))
      .limit(50);
    return rows;
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const headline = String(body.headline ?? "").slice(0, 160).trim();
    if (!headline) throw new Error("Headline obrigatória");
    // upsert-ish: one guide profile per user
    const [existing] = await db.select().from(guides).where(eq(guides.userId, me.id)).limit(1);
    if (existing) {
      const [row] = await db
        .update(guides)
        .set({
          headline,
          about: String(body.about ?? "").slice(0, 2000),
          city: String(body.city ?? "—").slice(0, 100),
          state: String(body.state ?? "—").slice(0, 100),
          languages: Array.isArray(body.languages) ? body.languages.map(String) : ["Português"],
          specialties: Array.isArray(body.specialties) ? body.specialties.map(String).slice(0, 12) : [],
          pricePerDay: Math.max(0, Number(body.pricePerDay) || 0),
          isAvailable: body.isAvailable !== false,
        })
        .where(eq(guides.id, existing.id))
        .returning();
      return row;
    }
    const [row] = await db
      .insert(guides)
      .values({
        userId: me.id,
        headline,
        about: String(body.about ?? "").slice(0, 2000),
        city: String(body.city ?? "—").slice(0, 100),
        state: String(body.state ?? "—").slice(0, 100),
        languages: Array.isArray(body.languages) ? body.languages.map(String) : ["Português"],
        specialties: Array.isArray(body.specialties) ? body.specialties.map(String).slice(0, 12) : [],
        pricePerDay: Math.max(0, Number(body.pricePerDay) || 0),
      })
      .returning();
    await db.update(users).set({ role: "guide" }).where(eq(users.id, me.id));
    await awardXp(me.id, 50, "guide");
    await checkAndAwardBadges(me.id);
    return row;
  });
}
