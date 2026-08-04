import { db } from "@/db";
import { users, posts, bookings, orders, mpPayments, transactions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();

    const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`count(*)::int` }).from(users);
    const [{ premiumUsers }] = await db.select({ premiumUsers: sql<number>`count(*) filter (where is_premium)::int` }).from(users);
    const [{ totalPosts }] = await db.select({ totalPosts: sql<number>`count(*)::int` }).from(posts);
    const [{ totalBookings }] = await db.select({ totalBookings: sql<number>`count(*)::int` }).from(bookings);
    const [{ totalOrders }] = await db.select({ totalOrders: sql<number>`count(*)::int` }).from(orders);
    const [{ totalDeposits }] = await db.select({ totalDeposits: sql<number>`count(*)::int` }).from(mpPayments);
    const [{ totalMorisMoved }] = await db.select({ totalMorisMoved: sql<number>`coalesce(sum(abs(amount_moris)),0)::int` }).from(transactions);

    const [{ revenueBrl }] = await db
      .select({ revenueBrl: sql<number>`coalesce(sum(amount_brl),0)::real` })
      .from(mpPayments)
      .where(sql`status = 'approved'`);

    const recentUsers = await db
      .select({ id: users.id, username: users.username, displayName: users.displayName, createdAt: users.createdAt })
      .from(users)
      .orderBy(sql`created_at desc`)
      .limit(10);

    return {
      totals: {
        users: totalUsers,
        premiumUsers,
        posts: totalPosts,
        bookings: totalBookings,
        orders: totalOrders,
        deposits: totalDeposits,
        morisMoved: totalMorisMoved,
        revenueBrl,
      },
      recentUsers,
      lastUpdated: new Date().toISOString(),
    };
  });
}
