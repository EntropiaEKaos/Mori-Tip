import { db } from "@/db";
import { reviews, users, inns, guides, products } from "@/db/schema";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET(req: Request) {
  return handleApi(async () => {
    const url = new URL(req.url);
    const targetType = url.searchParams.get("type") as "inn" | "guide" | "product";
    const targetId = Number(url.searchParams.get("id"));
    if (!targetType || !targetId) throw new Error("Parâmetros inválidos");
    const rows = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      content: reviews.content,
      pros: reviews.pros,
      cons: reviews.cons,
      createdAt: reviews.createdAt,
      authorUsername: users.username,
      authorDisplayName: users.displayName,
      authorAvatar: users.avatarUrl,
      authorLevel: users.level,
    }).from(reviews)
      .innerJoin(users, eq(users.id, reviews.authorId))
      .where(and(eq(reviews.targetType, targetType), eq(reviews.targetId, targetId)))
      .orderBy(desc(reviews.createdAt));
    const [{ avg, count }] = await db.select({
      avg: sql<number>`COALESCE(AVG(${reviews.rating})::float, 0)`,
      count: sql<number>`count(*)::int`,
    }).from(reviews).where(and(eq(reviews.targetType, targetType), eq(reviews.targetId, targetId)));
    return { reviews: rows, average: Number(avg), total: count };
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const targetType = body.targetType as "inn" | "guide" | "product";
    const targetId = Number(body.targetId);
    const rating = Number(body.rating);
    if (!["inn", "guide", "product"].includes(targetType)) throw new Error("Tipo inválido");
    if (!targetId || rating < 1 || rating > 5) throw new Error("Dados inválidos");
    const [row] = await db.insert(reviews).values({
      authorId: me.id, targetType, targetId, rating,
      title: String(body.title ?? "").slice(0, 120),
      content: String(body.content ?? "").slice(0, 2000),
      pros: Array.isArray(body.pros) ? body.pros.map(String).slice(0, 6) : [],
      cons: Array.isArray(body.cons) ? body.cons.map(String).slice(0, 6) : [],
    }).returning();
    // Atualizar rating agregado
    if (targetType === "inn") {
      const [{ avg }] = await db.select({ avg: sql<number>`AVG(${reviews.rating})::float` }).from(reviews).where(and(eq(reviews.targetType, "inn"), eq(reviews.targetId, targetId)));
      await db.update(inns).set({ rating: Math.round(Number(avg) || 0) }).where(eq(inns.id, targetId));
    } else if (targetType === "guide") {
      const [{ avg }] = await db.select({ avg: sql<number>`AVG(${reviews.rating})::float` }).from(reviews).where(and(eq(reviews.targetType, "guide"), eq(reviews.targetId, targetId)));
      await db.update(guides).set({ rating: Number(avg) || 0 }).where(eq(guides.id, targetId));
    } else if (targetType === "product") {
      const [{ avg }] = await db.select({ avg: sql<number>`AVG(${reviews.rating})::float` }).from(reviews).where(and(eq(reviews.targetType, "product"), eq(reviews.targetId, targetId)));
      await db.update(products).set({ /* se houver campo rating */ }).where(eq(products.id, targetId));
    }
    return row;
  });
}
