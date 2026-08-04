import { db } from "@/db";
import { liveMessages, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { asc, eq, gt, and } from "drizzle-orm";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const { id } = await ctx.params;
    const url = new URL(req.url);
    const since = url.searchParams.get("since");
    const rows = await db
      .select({
        id: liveMessages.id,
        content: liveMessages.content,
        createdAt: liveMessages.createdAt,
        userId: liveMessages.userId,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(liveMessages)
      .innerJoin(users, eq(users.id, liveMessages.userId))
      .where(
        and(
          eq(liveMessages.liveId, Number(id)),
          since ? gt(liveMessages.createdAt, new Date(since)) : undefined,
        ),
      )
      .orderBy(asc(liveMessages.createdAt))
      .limit(200);
    return rows;
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const { content } = await req.json();
    const text = String(content ?? "").slice(0, 300).trim();
    if (!text) throw new Error("Mensagem vazia");
    const [row] = await db
      .insert(liveMessages)
      .values({ liveId: Number(id), userId: me.id, content: text })
      .returning();
    return row;
  });
}
