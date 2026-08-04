import { db } from "@/db";
import { badges, userBadges, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { ensureBadgesSeeded, levelFromXp, xpForLevel } from "@/lib/gamification";
import { eq } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const me = await requireUser();
    await ensureBadgesSeeded();
    const [user] = await db
      .select({
        xp: users.xp,
        level: users.level,
        moris: users.moris,
        credits: users.credits,
        isPremium: users.isPremium,
      })
      .from(users)
      .where(eq(users.id, me.id))
      .limit(1);
    const allBadges = await db.select().from(badges);
    const mine = await db.select().from(userBadges).where(eq(userBadges.userId, me.id));
    const owned = new Set(mine.map((m) => m.badgeId));
    const level = user?.level ?? levelFromXp(user?.xp ?? 0);
    const currentXp = user?.xp ?? 0;
    const thisLevelXp = xpForLevel(level);
    const nextLevelXp = xpForLevel(level + 1);
    return {
      xp: currentXp,
      level,
      moris: user?.moris ?? 0,
      credits: user?.credits ?? 0,
      isPremium: user?.isPremium ?? false,
      progress: {
        current: currentXp - thisLevelXp,
        needed: nextLevelXp - thisLevelXp,
        percent: Math.min(100, Math.round(((currentXp - thisLevelXp) / Math.max(1, nextLevelXp - thisLevelXp)) * 100)),
      },
      badges: allBadges.map((b) => ({
        ...b,
        owned: owned.has(b.id),
        earnedAt: mine.find((m) => m.badgeId === b.id)?.earnedAt ?? null,
      })),
    };
  });
}
