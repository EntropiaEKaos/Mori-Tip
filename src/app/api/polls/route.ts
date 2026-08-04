import { db } from "@/db";
import { postPolls, postPollVotes, posts } from "@/db/schema";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { awardXp } from "@/lib/gamification";
import { and, eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const postId = Number(body.postId);
    const question = String(body.question ?? "").slice(0, 200).trim();
    if (!postId || !question) throw new Error("Dados inválidos");
    const opts = Array.isArray(body.options) ? body.options : [];
    if (opts.length < 2 || opts.length > 6) throw new Error("Forneça entre 2 e 6 opções");
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post || post.authorId !== me.id) throw new Error("FORBIDDEN");
    const options = opts.map((o: any, i: number) => ({
      id: `opt_${i}`,
      text: String(o).slice(0, 80),
      votes: 0,
    }));
    const [row] = await db.insert(postPolls).values({
      postId, question, options,
      closesAt: body.closesAt ? new Date(body.closesAt) : null,
    }).returning();
    return row;
  });
}

export async function PATCH(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const pollId = Number(body.pollId);
    const optionId = String(body.optionId);
    const [poll] = await db.select().from(postPolls).where(eq(postPolls.id, pollId)).limit(1);
    if (!poll) throw new Error("Enquete não encontrada");
    if (poll.closesAt && poll.closesAt < new Date()) throw new Error("Enquete encerrada");
    // Verificar se já votou
    const [existing] = await db.select().from(postPollVotes).where(and(eq(postPollVotes.pollId, pollId), eq(postPollVotes.userId, me.id))).limit(1);
    if (existing) {
      if (existing.optionId === optionId) return { ok: true, already: true };
      // Trocar voto
      await db.delete(postPollVotes).where(eq(postPollVotes.id, existing.id));
      await db.update(postPolls).set({ options: sql`jsonb_set(${postPolls.options}::jsonb, '{${sql.raw("")}options}', ${postPolls.options})` }).where(eq(postPolls.id, pollId));
    }
    await db.insert(postPollVotes).values({ pollId, userId: me.id, optionId });
    // Incrementar voto
    const newOptions = (poll.options as any[]).map((o) => o.id === optionId ? { ...o, votes: o.votes + 1 } : o);
    await db.update(postPolls).set({ options: newOptions }).where(eq(postPolls.id, pollId));
    await awardXp(me.id, 5, "poll");
    return { ok: true, options: newOptions };
  });
}
