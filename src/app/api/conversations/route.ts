import { db } from "@/db";
import { conversations, conversationMembers, messages, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, desc, eq, sql, inArray } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const me = await requireUser();
    // fetch conversation ids I belong to
    const mine = await db
      .select({ id: conversationMembers.conversationId, lastReadAt: conversationMembers.lastReadAt })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, me.id));
    if (mine.length === 0) return [];
    const ids = mine.map((m) => m.id);
    const convs = await db
      .select()
      .from(conversations)
      .where(inArray(conversations.id, ids))
      .orderBy(desc(conversations.lastMessageAt));
    const members = await db
      .select({
        conversationId: conversationMembers.conversationId,
        userId: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(users.id, conversationMembers.userId))
      .where(inArray(conversationMembers.conversationId, ids));
    // last message per conv
    const lastMsgs = await db
      .select({
        conversationId: messages.conversationId,
        content: messages.content,
        type: messages.type,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        id: messages.id,
      })
      .from(messages)
      .where(inArray(messages.conversationId, ids))
      .orderBy(desc(messages.createdAt));
    const seen = new Set<number>();
    const lastByConv: Record<number, (typeof lastMsgs)[number]> = {};
    for (const m of lastMsgs) {
      if (!seen.has(m.conversationId)) {
        seen.add(m.conversationId);
        lastByConv[m.conversationId] = m;
      }
    }
    // unread count
    const unreadRows = await db
      .select({
        conversationId: messages.conversationId,
        count: sql<number>`count(*)::int`,
      })
      .from(messages)
      .innerJoin(
        conversationMembers,
        and(
          eq(conversationMembers.conversationId, messages.conversationId),
          eq(conversationMembers.userId, me.id),
        ),
      )
      .where(sql`${messages.createdAt} > ${conversationMembers.lastReadAt} and ${messages.senderId} <> ${me.id}`)
      .groupBy(messages.conversationId);
    const unreadMap = Object.fromEntries(unreadRows.map((r) => [r.conversationId, r.count]));
    return convs.map((c) => ({
      ...c,
      members: members.filter((m) => m.conversationId === c.id).map(({ conversationId: _c, ...rest }) => rest),
      lastMessage: lastByConv[c.id] ?? null,
      unread: unreadMap[c.id] ?? 0,
    }));
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const targetUserId = Number(body.userId);
    if (!targetUserId) throw new Error("userId requerido");
    if (targetUserId === me.id) throw new Error("Não pode falar consigo mesmo");
    // find existing direct conversation
    const shared = await db
      .select({ id: conversationMembers.conversationId })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, me.id));
    const myConvIds = shared.map((s) => s.id);
    if (myConvIds.length) {
      const otherMemberships = await db
        .select({ id: conversationMembers.conversationId })
        .from(conversationMembers)
        .where(
          and(
            eq(conversationMembers.userId, targetUserId),
            inArray(conversationMembers.conversationId, myConvIds),
          ),
        );
      // pick one that is not a group
      for (const om of otherMemberships) {
        const [c] = await db.select().from(conversations).where(eq(conversations.id, om.id)).limit(1);
        if (c && !c.isGroup) return c;
      }
    }
    const [conv] = await db.insert(conversations).values({ isGroup: false }).returning();
    await db.insert(conversationMembers).values([
      { conversationId: conv.id, userId: me.id },
      { conversationId: conv.id, userId: targetUserId },
    ]);
    return conv;
  });
}
