import { db } from "@/db";
import { conversations, conversationMembers, messages, notifications, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, asc, desc, eq, gt, ne } from "drizzle-orm";

async function assertMember(conversationId: number, userId: number) {
  const [m] = await db
    .select()
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, userId),
      ),
    )
    .limit(1);
  if (!m) throw new Error("FORBIDDEN");
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const convId = Number(id);
    await assertMember(convId, me.id);
    const url = new URL(req.url);
    const since = url.searchParams.get("since");
    const rows = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, convId),
          since ? gt(messages.createdAt, new Date(since)) : undefined,
        ),
      )
      .orderBy(since ? asc(messages.createdAt) : desc(messages.createdAt))
      .limit(200);
    // mark read
    await db
      .update(conversationMembers)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationMembers.conversationId, convId),
          eq(conversationMembers.userId, me.id),
        ),
      );
    return since ? rows : rows.reverse();
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const convId = Number(id);
    await assertMember(convId, me.id);
    const body = await req.json();
    const content = String(body.content ?? "").slice(0, 4000).trim();
    const type = (body.type ?? "text") as "text" | "image" | "audio" | "video";
    if (!content) throw new Error("Mensagem vazia");
    const [msg] = await db
      .insert(messages)
      .values({ conversationId: convId, senderId: me.id, type, content })
      .returning();
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, convId));
    // notify other members
    const others = await db
      .select({ userId: conversationMembers.userId })
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, convId),
          ne(conversationMembers.userId, me.id),
        ),
      );
    if (others.length) {
      await db.insert(notifications).values(
        others.map((o) => ({
          userId: o.userId,
          actorId: me.id,
          type: "message" as const,
          entityId: convId,
          message: `${me.displayName}: ${content.slice(0, 60)}`,
        })),
      );
    }
    return msg;
  });
}

export const _unused = users;
