import { db } from "@/db";
import { moments, momentViews, users } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { awardXp } from "@/lib/gamification";
import { and, desc, eq, gt, sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const me = await getCurrentUser();
    const now = new Date();
    const rows = await db
      .select({
        id: moments.id,
        mediaUrl: moments.mediaUrl,
        mediaType: moments.mediaType,
        caption: moments.caption,
        filter: moments.filter,
        durationHours: moments.durationHours,
        expiresAt: moments.expiresAt,
        viewCount: moments.viewCount,
        createdAt: moments.createdAt,
        authorId: moments.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatarUrl,
        seenByMe: me
          ? sql<boolean>`exists(select 1 from ${momentViews} where ${momentViews.momentId} = ${moments.id} and ${momentViews.userId} = ${me.id})`
          : sql<boolean>`false`,
      })
      .from(moments)
      .innerJoin(users, eq(users.id, moments.authorId))
      .where(gt(moments.expiresAt, now))
      .orderBy(desc(moments.createdAt))
      .limit(100);

    // group by author
    const byAuthor = new Map<
      number,
      {
        authorId: number;
        authorUsername: string;
        authorDisplayName: string;
        authorAvatar: string | null;
        moments: typeof rows;
        hasUnseen: boolean;
      }
    >();
    for (const m of rows) {
      let g = byAuthor.get(m.authorId);
      if (!g) {
        g = {
          authorId: m.authorId,
          authorUsername: m.authorUsername,
          authorDisplayName: m.authorDisplayName,
          authorAvatar: m.authorAvatar,
          moments: [],
          hasUnseen: false,
        };
        byAuthor.set(m.authorId, g);
      }
      g.moments.push(m);
      if (!m.seenByMe) g.hasUnseen = true;
    }
    return Array.from(byAuthor.values());
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const mediaUrl = String(body.mediaUrl ?? "");
    if (!mediaUrl) throw new Error("Mídia obrigatória");
    let hours = Number(body.durationHours ?? 24);
    if (!Number.isFinite(hours) || hours < 1) hours = 1;
    if (hours > 24) hours = 24;
    const expiresAt = new Date(Date.now() + hours * 3600_000);
    const [row] = await db
      .insert(moments)
      .values({
        authorId: me.id,
        mediaUrl,
        mediaType: body.mediaType === "video" ? "video" : "image",
        caption: String(body.caption ?? "").slice(0, 300),
        filter: body.filter ? String(body.filter).slice(0, 40) : null,
        durationHours: hours,
        expiresAt,
      })
      .returning();
    await awardXp(me.id, 15, "moment");
    return row;
  });
}
