import { db } from "@/db";
import { highlights, moments, users } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  return handleApi(async () => {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");
    if (!username) throw new Error("username obrigatório");
    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
    if (!user) throw new Error("Usuário não encontrado");
    return db.select().from(highlights).where(eq(highlights.userId, user.id)).orderBy(desc(highlights.createdAt));
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const title = String(body.title ?? "").slice(0, 60).trim();
    if (!title) throw new Error("Título obrigatório");
    const momentIds = Array.isArray(body.momentIds) ? body.momentIds.map(Number).filter(Boolean) : [];
    const [row] = await db.insert(highlights).values({
      userId: me.id, title, momentIds,
      coverUrl: body.coverUrl ?? null,
    }).returning();
    return row;
  });
}

export async function DELETE(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));
    const [row] = await db.select().from(highlights).where(eq(highlights.id, id)).limit(1);
    if (!row || row.userId !== me.id) throw new Error("FORBIDDEN");
    await db.delete(highlights).where(eq(highlights.id, id));
    return { ok: true };
  });
}
