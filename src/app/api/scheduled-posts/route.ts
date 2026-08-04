import { db } from "@/db";
import { scheduledPosts, posts } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { awardXp } from "@/lib/gamification";
import { and, eq, lte, sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const me = await requireUser();
    return db.select().from(scheduledPosts).where(eq(scheduledPosts.authorId, me.id)).orderBy(scheduledPosts.scheduledFor);
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const scheduledFor = new Date(body.scheduledFor);
    if (Number.isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
      throw new Error("Data de agendamento deve ser futura");
    }
    const [row] = await db.insert(scheduledPosts).values({
      authorId: me.id,
      content: String(body.content ?? "").slice(0, 2000),
      mediaUrls: Array.isArray(body.mediaUrls) ? body.mediaUrls.map(String).slice(0, 8) : [],
      filter: body.filter ? String(body.filter).slice(0, 40) : null,
      tags: Array.isArray(body.tags) ? body.tags.map(String).slice(0, 10) : [],
      scheduledFor,
      status: "pending",
    }).returning();
    return row;
  });
}

export async function DELETE(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));
    await db.delete(scheduledPosts).where(and(eq(scheduledPosts.id, id), eq(scheduledPosts.authorId, me.id)));
    return { ok: true };
  });
}

// Cron-friendly endpoint para publicar posts agendados
export async function PUT() {
  return handleApi(async () => {
    const now = new Date();
    const due = await db.select().from(scheduledPosts).where(and(eq(scheduledPosts.status, "pending"), lte(scheduledPosts.scheduledFor, now)));
    let published = 0;
    for (const s of due) {
      await db.insert(posts).values({
        authorId: s.authorId,
        type: s.mediaUrls.length > 0 ? "photo" : "text",
        content: s.content,
        mediaUrls: s.mediaUrls,
        imageUrl: s.mediaUrls[0] ?? null,
        filter: s.filter,
        tags: s.tags,
      });
      await db.update(scheduledPosts).set({ status: "published" }).where(eq(scheduledPosts.id, s.id));
      await awardXp(s.authorId, 20, "post");
      published++;
    }
    return { published, total: due.length };
  });
}
