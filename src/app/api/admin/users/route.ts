import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        isVerified: users.isVerified,
        isBanned: users.isBanned,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
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
    const patch: Record<string, unknown> = {};
    if (typeof body.isBanned === "boolean") patch.isBanned = body.isBanned;
    if (typeof body.isVerified === "boolean") patch.isVerified = body.isVerified;
    if (typeof body.role === "string" && ["user", "host", "admin"].includes(body.role)) {
      patch.role = body.role;
    }
    if (Object.keys(patch).length === 0) throw new Error("nada para atualizar");
    await db.update(users).set(patch).where(eq(users.id, id));
    return { ok: true };
  });
}
