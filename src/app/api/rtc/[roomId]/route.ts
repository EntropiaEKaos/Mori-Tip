import { db } from "@/db";
import { rtcSignals } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, asc, eq, gt, ne, or, isNull } from "drizzle-orm";

// Long-poll-ish WebRTC signaling via DB.
export async function GET(req: Request, ctx: { params: Promise<{ roomId: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { roomId } = await ctx.params;
    const url = new URL(req.url);
    const since = url.searchParams.get("since");
    const rows = await db
      .select()
      .from(rtcSignals)
      .where(
        and(
          eq(rtcSignals.roomId, roomId),
          ne(rtcSignals.fromUserId, me.id),
          or(isNull(rtcSignals.toUserId), eq(rtcSignals.toUserId, me.id)),
          since ? gt(rtcSignals.createdAt, new Date(since)) : undefined,
        ),
      )
      .orderBy(asc(rtcSignals.createdAt))
      .limit(100);
    return rows;
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ roomId: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { roomId } = await ctx.params;
    const body = await req.json();
    const kind = String(body.kind ?? "");
    if (!["offer", "answer", "ice", "join", "leave"].includes(kind)) throw new Error("kind inválido");
    const toUserId = body.toUserId ? Number(body.toUserId) : null;
    const payload = body.payload ?? {};
    const [row] = await db
      .insert(rtcSignals)
      .values({ roomId, fromUserId: me.id, toUserId, kind, payload })
      .returning();
    return row;
  });
}
