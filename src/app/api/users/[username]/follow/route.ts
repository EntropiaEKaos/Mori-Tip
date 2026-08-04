import { db } from "@/db";
import { users, follows, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, eq } from "drizzle-orm";

export async function POST(_req: Request, ctx: { params: Promise<{ username: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { username } = await ctx.params;
    const [target] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);
    if (!target) throw new Error("Usuário não encontrado");
    if (target.id === me.id) throw new Error("Não pode seguir a si mesmo");
    const [existing] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, me.id), eq(follows.followingId, target.id)))
      .limit(1);
    if (existing) {
      await db
        .delete(follows)
        .where(and(eq(follows.followerId, me.id), eq(follows.followingId, target.id)));
      return { followed: false };
    }
    await db.insert(follows).values({ followerId: me.id, followingId: target.id });
    await db.insert(notifications).values({
      userId: target.id,
      actorId: me.id,
      type: "follow",
      message: `${me.displayName} começou a seguir você`,
    });
    return { followed: true };
  });
}
