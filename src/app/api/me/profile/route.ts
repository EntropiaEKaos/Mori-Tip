import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const body = await req.json();
    const patch: Partial<typeof users.$inferInsert> = {};
    if (typeof body.displayName === "string") patch.displayName = body.displayName.slice(0, 80);
    if (typeof body.bio === "string") patch.bio = body.bio.slice(0, 500);
    if (typeof body.location === "string") patch.location = body.location.slice(0, 120);
    if (typeof body.avatarUrl === "string") patch.avatarUrl = body.avatarUrl;
    if (typeof body.coverUrl === "string") patch.coverUrl = body.coverUrl;
    await db.update(users).set(patch).where(eq(users.id, me.id));
    return { ok: true };
  });
}
