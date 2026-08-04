import { db } from "@/db";
import { inns, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();
    const rows = await db
      .select({
        id: inns.id,
        name: inns.name,
        slug: inns.slug,
        city: inns.city,
        state: inns.state,
        isApproved: inns.isApproved,
        coverUrl: inns.coverUrl,
        createdAt: inns.createdAt,
        ownerUsername: users.username,
      })
      .from(inns)
      .innerJoin(users, eq(users.id, inns.ownerId))
      .orderBy(desc(inns.createdAt))
      .limit(200);
    return rows;
  });
}

export async function PATCH(req: Request) {
  return handleApi(async () => {
    await requireAdmin();
    const body = await req.json();
    const id = Number(body.id);
    if (!id) throw new Error("id requerido");
    if (typeof body.isApproved !== "boolean") throw new Error("isApproved requerido");
    await db.update(inns).set({ isApproved: body.isApproved }).where(eq(inns.id, id));
    return { ok: true };
  });
}

export async function DELETE(req: Request) {
  return handleApi(async () => {
    await requireAdmin();
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));
    if (!id) throw new Error("id requerido");
    await db.delete(inns).where(eq(inns.id, id));
    return { ok: true };
  });
}
