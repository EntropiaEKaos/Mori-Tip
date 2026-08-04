import { db } from "@/db";
import { users, transactions, creditPackages } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { spendMoris } from "@/lib/gamification";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const me = await requireUser();
    const [user] = await db
      .select({
        moris: users.moris,
        credits: users.credits,
        xp: users.xp,
        level: users.level,
        isPremium: users.isPremium,
        premiumUntil: users.premiumUntil,
      })
      .from(users)
      .where(eq(users.id, me.id))
      .limit(1);
    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, me.id))
      .orderBy(desc(transactions.createdAt))
      .limit(40);
    const packages = await db.select().from(creditPackages).where(eq(creditPackages.isActive, true));
    return { wallet: user, transactions: txs, packages };
  });
}

/** Buy ad credits with Moris */
export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const packageId = Number(body.packageId);
    const [pkg] = await db.select().from(creditPackages).where(eq(creditPackages.id, packageId)).limit(1);
    if (!pkg || !pkg.isActive) throw new Error("Pacote inválido");
    await spendMoris(me.id, pkg.priceMoris, "purchase_credits", `Pacote ${pkg.name}`);
    const totalCredits = pkg.credits + pkg.bonusCredits;
    await db
      .update(users)
      .set({ credits: sql`${users.credits} + ${totalCredits}` })
      .where(eq(users.id, me.id));
    await db.insert(transactions).values({
      userId: me.id,
      kind: "purchase_credits",
      amountCredits: totalCredits,
      description: `+${totalCredits} créditos (${pkg.name})`,
    });
    return { ok: true, credits: totalCredits };
  });
}
