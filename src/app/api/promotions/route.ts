import { db } from "@/db";
import { promotions, posts, users } from "@/db/schema";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { spendCredits } from "@/lib/gamification";
import { and, desc, eq, gt } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const now = new Date();
    const rows = await db
      .select({
        id: promotions.id,
        title: promotions.title,
        description: promotions.description,
        imageUrl: promotions.imageUrl,
        linkUrl: promotions.linkUrl,
        impressions: promotions.impressions,
        clicks: promotions.clicks,
        endsAt: promotions.endsAt,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
      })
      .from(promotions)
      .innerJoin(users, eq(users.id, promotions.userId))
      .where(and(eq(promotions.status, "active"), gt(promotions.endsAt, now)))
      .orderBy(desc(promotions.createdAt))
      .limit(20);
    return rows;
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const title = String(body.title ?? "").slice(0, 160).trim();
    if (!title) throw new Error("Título obrigatório");
    const days = Math.min(30, Math.max(1, Number(body.days) || 3));
    // 10 credits per day base
    const cost = days * 10;
    await spendCredits(me.id, cost, `Promoção "${title}" por ${days} dias`);
    const endsAt = new Date(Date.now() + days * 86_400_000);
    const [promo] = await db
      .insert(promotions)
      .values({
        userId: me.id,
        postId: body.postId ? Number(body.postId) : null,
        productId: body.productId ? Number(body.productId) : null,
        title,
        description: String(body.description ?? "").slice(0, 500),
        imageUrl: body.imageUrl ?? null,
        linkUrl: body.linkUrl ?? null,
        creditsSpent: cost,
        endsAt,
        status: "active",
      })
      .returning();

    // also create a sponsored post in feed
    await db.insert(posts).values({
      authorId: me.id,
      type: "promo",
      content: `${title}\n\n${String(body.description ?? "").slice(0, 400)}`,
      imageUrl: body.imageUrl ?? null,
      tags: ["promovido", "mori-ads"],
      isSponsored: true,
      promoId: promo.id,
    });

    return promo;
  });
}

export const _unused = getCurrentUser;
