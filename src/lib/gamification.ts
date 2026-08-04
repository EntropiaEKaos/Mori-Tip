import { db } from "@/db";
import { users, badges, userBadges, notifications, transactions, posts, follows, bookings } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

/** XP needed to reach a level (level 1 = 0) */
export function xpForLevel(level: number) {
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export const DEFAULT_BADGES = [
  { key: "first_post", name: "Primeira Pegada", description: "Publique seu primeiro post", icon: "📸", xpReward: 50, morisReward: 20, requirement: "posts:1" },
  { key: "storyteller", name: "Contador de Histórias", description: "Publique 10 posts", icon: "📖", xpReward: 150, morisReward: 50, requirement: "posts:10" },
  { key: "social", name: "Social Butterfly", description: "Siga 5 pessoas", icon: "🦋", xpReward: 80, morisReward: 30, requirement: "following:5" },
  { key: "popular", name: "Popular", description: "Tenha 10 seguidores", icon: "⭐", xpReward: 120, morisReward: 40, requirement: "followers:10" },
  { key: "explorer", name: "Explorador", description: "Crie um roteiro", icon: "🧭", xpReward: 100, morisReward: 50, requirement: "itineraries:1" },
  { key: "moment_maker", name: "Moment Maker", description: "Publique 3 momentos", icon: "✨", xpReward: 90, morisReward: 30, requirement: "moments:3" },
  { key: "booker", name: "Hóspede VIP", description: "Faça sua primeira reserva", icon: "🏨", xpReward: 200, morisReward: 100, requirement: "bookings:1" },
  { key: "merchant", name: "Comerciante", description: "Venda um produto no marketplace", icon: "🛍️", xpReward: 150, morisReward: 80, requirement: "sales:1" },
  { key: "level_5", name: "Viajante Experiente", description: "Alcance o nível 5", icon: "🎖️", xpReward: 0, morisReward: 100, requirement: "level:5" },
  { key: "level_10", name: "Lenda Mori", description: "Alcance o nível 10", icon: "👑", xpReward: 0, morisReward: 500, requirement: "level:10" },
  { key: "premium", name: "Membro Premium", description: "Assine o Mori Premium", icon: "💎", xpReward: 100, morisReward: 200, requirement: "premium:1" },
  { key: "guide_badge", name: "Guia Local", description: "Torne-se um guia verificado", icon: "🗺️", xpReward: 150, morisReward: 100, requirement: "guide:1" },
] as const;

export async function ensureBadgesSeeded() {
  const existing = await db.select({ id: badges.id }).from(badges).limit(1);
  if (existing.length) return;
  await db.insert(badges).values([...DEFAULT_BADGES]);
}

export async function awardXp(userId: number, amount: number, reason: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  const newXp = user.xp + amount;
  const newLevel = levelFromXp(newXp);
  const leveledUp = newLevel > user.level;
  await db
    .update(users)
    .set({ xp: newXp, level: newLevel })
    .where(eq(users.id, userId));
  if (leveledUp) {
    const bonus = newLevel * 25;
    await db
      .update(users)
      .set({ moris: sql`${users.moris} + ${bonus}` })
      .where(eq(users.id, userId));
    await db.insert(notifications).values({
      userId,
      type: "badge",
      message: `🎉 Você subiu para o nível ${newLevel}! +${bonus} Moris de bônus.`,
    });
    await db.insert(transactions).values({
      userId,
      kind: "reward",
      amountMoris: bonus,
      description: `Bônus de nível ${newLevel}`,
    });
  }
  await checkAndAwardBadges(userId);
  return { xp: newXp, level: newLevel, leveledUp };
}

export async function awardMoris(userId: number, amount: number, kind: string, description: string) {
  await db
    .update(users)
    .set({ moris: sql`${users.moris} + ${amount}` })
    .where(eq(users.id, userId));
  await db.insert(transactions).values({
    userId,
    kind,
    amountMoris: amount,
    description,
  });
}

export async function spendMoris(userId: number, amount: number, kind: string, description: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.moris < amount) throw new Error("Saldo de Moris insuficiente");
  await db
    .update(users)
    .set({ moris: sql`${users.moris} - ${amount}` })
    .where(eq(users.id, userId));
  await db.insert(transactions).values({
    userId,
    kind,
    amountMoris: -amount,
    description,
  });
}

export async function spendCredits(userId: number, amount: number, description: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.credits < amount) throw new Error("Créditos insuficientes");
  await db
    .update(users)
    .set({ credits: sql`${users.credits} - ${amount}` })
    .where(eq(users.id, userId));
  await db.insert(transactions).values({
    userId,
    kind: "spend",
    amountCredits: -amount,
    description,
  });
}

async function countByRequirement(userId: number, req: string): Promise<number> {
  const [kind, raw] = req.split(":");
  const need = Number(raw) || 1;
  if (kind === "posts") {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(posts).where(eq(posts.authorId, userId));
    return r.c >= need ? need : r.c;
  }
  if (kind === "following") {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(follows).where(eq(follows.followerId, userId));
    return r.c;
  }
  if (kind === "followers") {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(follows).where(eq(follows.followingId, userId));
    return r.c;
  }
  if (kind === "bookings") {
    const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(bookings).where(eq(bookings.userId, userId));
    return r.c;
  }
  if (kind === "level" || kind === "premium" || kind === "guide" || kind === "itineraries" || kind === "moments" || kind === "sales") {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return 0;
    if (kind === "level") return user.level;
    if (kind === "premium") return user.isPremium ? 1 : 0;
    if (kind === "guide") return user.role === "guide" ? 1 : 0;
    // for itineraries/moments/sales we check via dynamic import-less raw counts below
  }
  return 0;
}

export async function checkAndAwardBadges(userId: number) {
  await ensureBadgesSeeded();
  const all = await db.select().from(badges);
  const owned = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
  const ownedIds = new Set(owned.map((o) => o.badgeId));
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;

  // precompute some counts
  const [{ postCount }] = await db
    .select({ postCount: sql<number>`count(*)::int` })
    .from(posts)
    .where(eq(posts.authorId, userId));
  const [{ followingCount }] = await db
    .select({ followingCount: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followerId, userId));
  const [{ followerCount }] = await db
    .select({ followerCount: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followingId, userId));
  const [{ bookingCount }] = await db
    .select({ bookingCount: sql<number>`count(*)::int` })
    .from(bookings)
    .where(eq(bookings.userId, userId));

  // lazy tables
  const { itineraries, moments, orders } = await import("@/db/schema");
  const [{ itinCount }] = await db
    .select({ itinCount: sql<number>`count(*)::int` })
    .from(itineraries)
    .where(eq(itineraries.authorId, userId));
  const [{ momentCount }] = await db
    .select({ momentCount: sql<number>`count(*)::int` })
    .from(moments)
    .where(eq(moments.authorId, userId));
  const [{ saleCount }] = await db
    .select({ saleCount: sql<number>`count(*)::int` })
    .from(orders)
    .where(and(eq(orders.sellerId, userId), sql`${orders.status} <> 'cancelled'`));

  const values: Record<string, number> = {
    posts: postCount,
    following: followingCount,
    followers: followerCount,
    bookings: bookingCount,
    itineraries: itinCount,
    moments: momentCount,
    sales: saleCount,
    level: user.level,
    premium: user.isPremium ? 1 : 0,
    guide: user.role === "guide" ? 1 : 0,
  };

  for (const b of all) {
    if (ownedIds.has(b.id)) continue;
    const [kind, raw] = b.requirement.split(":");
    const need = Number(raw) || 1;
    const have = values[kind] ?? 0;
    if (have >= need) {
      await db.insert(userBadges).values({ userId, badgeId: b.id });
      if (b.xpReward > 0) {
        await db.update(users).set({ xp: sql`${users.xp} + ${b.xpReward}` }).where(eq(users.id, userId));
      }
      if (b.morisReward > 0) {
        await awardMoris(userId, b.morisReward, "reward", `Badge: ${b.name}`);
      }
      await db.insert(notifications).values({
        userId,
        type: "badge",
        entityId: b.id,
        message: `${b.icon} Badge desbloqueada: ${b.name}! +${b.morisReward} Moris`,
      });
    }
  }
}

// silence unused
void countByRequirement;
