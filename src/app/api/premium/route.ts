import { db } from "@/db";
import { users, inns } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { spendMoris, awardXp, checkAndAwardBadges } from "@/lib/gamification";
import { eq, sql } from "drizzle-orm";

const PREMIUM_PRICE_MORIS = 500;
const PREMIUM_DAYS = 30;

export async function GET() {
  return handleApi(async () => {
    const me = await requireUser();
    return {
      isPremium: me.isPremium,
      premiumUntil: me.premiumUntil,
      priceMoris: PREMIUM_PRICE_MORIS,
      days: PREMIUM_DAYS,
      benefits: [
        "Reservas em pousadas parceiras",
        "Badge Premium exclusiva",
        "Destaque no feed e busca",
        "+200 Moris de bônus na assinatura",
        "Pousadas do host liberam reservas online",
        "Suporte prioritário",
      ],
    };
  });
}

export async function POST() {
  return handleApi(async () => {
    const me = await requireUser();
    await spendMoris(me.id, PREMIUM_PRICE_MORIS, "premium", "Assinatura Mori Premium 30 dias");
    const base = me.premiumUntil && me.premiumUntil > new Date() ? me.premiumUntil : new Date();
    const until = new Date(base.getTime() + PREMIUM_DAYS * 86_400_000);
    await db
      .update(users)
      .set({
        isPremium: true,
        premiumUntil: until,
        moris: sql`${users.moris} + 200`,
      })
      .where(eq(users.id, me.id));
    // enable bookings on owned inns
    await db
      .update(inns)
      .set({ acceptsBookings: true })
      .where(eq(inns.ownerId, me.id));
    await awardXp(me.id, 100, "premium");
    await checkAndAwardBadges(me.id);
    return { ok: true, premiumUntil: until };
  });
}
