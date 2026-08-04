import { db } from "@/db";
import { products, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export async function GET(req: Request) {
  return handleApi(async () => {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const type = url.searchParams.get("type");
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        type: products.type,
        priceMoris: products.priceMoris,
        stock: products.stock,
        imageUrl: products.imageUrl,
        images: products.images,
        city: products.city,
        tags: products.tags,
        salesCount: products.salesCount,
        createdAt: products.createdAt,
        sellerId: products.sellerId,
        sellerUsername: users.username,
        sellerDisplayName: users.displayName,
        sellerAvatar: users.avatarUrl,
      })
      .from(products)
      .innerJoin(users, eq(users.id, products.sellerId))
      .where(
        and(
          eq(products.isActive, true),
          type ? eq(products.type, type as "physical" | "digital" | "experience" | "service") : undefined,
          q
            ? or(ilike(products.name, `%${q}%`), ilike(products.city, `%${q}%`), ilike(products.description, `%${q}%`))
            : undefined,
        ),
      )
      .orderBy(desc(products.createdAt))
      .limit(60);
    return rows;
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const name = String(body.name ?? "").slice(0, 160).trim();
    if (!name) throw new Error("Nome obrigatório");
    const priceMoris = Math.max(1, Number(body.priceMoris) || 0);
    if (!priceMoris) throw new Error("Preço em Moris inválido");
    const type = (["physical", "digital", "experience", "service"].includes(body.type)
      ? body.type
      : "physical") as "physical" | "digital" | "experience" | "service";
    const [row] = await db
      .insert(products)
      .values({
        sellerId: me.id,
        innId: body.innId ? Number(body.innId) : null,
        name,
        description: String(body.description ?? "").slice(0, 2000),
        type,
        priceMoris,
        stock: Math.max(0, Number(body.stock) || 1),
        imageUrl: body.imageUrl ?? null,
        images: Array.isArray(body.images) ? body.images.map(String).slice(0, 6) : [],
        city: body.city ? String(body.city).slice(0, 100) : null,
        tags: Array.isArray(body.tags) ? body.tags.map(String).slice(0, 10) : [],
      })
      .returning();
    return row;
  });
}
