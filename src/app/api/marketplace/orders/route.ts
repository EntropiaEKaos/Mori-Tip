import { db } from "@/db";
import { orders, products, users, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { awardXp, spendMoris, awardMoris, checkAndAwardBadges } from "@/lib/gamification";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const me = await requireUser();
    const bought = await db
      .select({
        id: orders.id,
        quantity: orders.quantity,
        totalMoris: orders.totalMoris,
        status: orders.status,
        createdAt: orders.createdAt,
        productName: products.name,
        productImage: products.imageUrl,
        sellerUsername: users.username,
        side: sql<string>`'buy'`,
      })
      .from(orders)
      .innerJoin(products, eq(products.id, orders.productId))
      .innerJoin(users, eq(users.id, orders.sellerId))
      .where(eq(orders.buyerId, me.id))
      .orderBy(desc(orders.createdAt));

    const sold = await db
      .select({
        id: orders.id,
        quantity: orders.quantity,
        totalMoris: orders.totalMoris,
        status: orders.status,
        createdAt: orders.createdAt,
        productName: products.name,
        productImage: products.imageUrl,
        buyerUsername: users.username,
        side: sql<string>`'sell'`,
      })
      .from(orders)
      .innerJoin(products, eq(products.id, orders.productId))
      .innerJoin(users, eq(users.id, orders.buyerId))
      .where(eq(orders.sellerId, me.id))
      .orderBy(desc(orders.createdAt));

    return { bought, sold };
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const productId = Number(body.productId);
    const quantity = Math.max(1, Number(body.quantity) || 1);
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product || !product.isActive) throw new Error("Produto não encontrado");
    if (product.sellerId === me.id) throw new Error("Não pode comprar o próprio produto");
    if (product.stock < quantity) throw new Error("Estoque insuficiente");
    const total = product.priceMoris * quantity;
    await spendMoris(me.id, total, "purchase", `Compra: ${product.name}`);
    // credit seller (platform keeps 5%)
    const fee = Math.floor(total * 0.05);
    const sellerGets = total - fee;
    await awardMoris(product.sellerId, sellerGets, "sale", `Venda: ${product.name}`);

    const [order] = await db
      .insert(orders)
      .values({
        buyerId: me.id,
        sellerId: product.sellerId,
        productId: product.id,
        quantity,
        totalMoris: total,
        status: "paid",
        notes: String(body.notes ?? "").slice(0, 300),
      })
      .returning();

    await db
      .update(products)
      .set({
        stock: sql`${products.stock} - ${quantity}`,
        salesCount: sql`${products.salesCount} + ${quantity}`,
      })
      .where(eq(products.id, product.id));

    await db.insert(notifications).values([
      {
        userId: product.sellerId,
        actorId: me.id,
        type: "order",
        entityId: order.id,
        message: `${me.displayName} comprou ${quantity}x ${product.name} (+${sellerGets} Moris)`,
      },
      {
        userId: me.id,
        type: "order",
        entityId: order.id,
        message: `Compra confirmada: ${product.name} (−${total} Moris)`,
      },
    ]);
    await awardXp(me.id, 25, "purchase");
    await awardXp(product.sellerId, 40, "sale");
    await checkAndAwardBadges(product.sellerId);
    return order;
  });
}
