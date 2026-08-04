import { db } from "@/db";
import { featureFlags } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();
    return await db.select().from(featureFlags).orderBy(desc(featureFlags.updatedAt));
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    await requireAdmin();
    const body = await req.json();
    const [row] = await db
      .insert(featureFlags)
      .values({
        key: body.key,
        name: body.name,
        description: body.description || "",
        enabledForRoles: Array.isArray(body.enabledForRoles) ? body.enabledForRoles : ["user", "host", "guide", "admin"],
        enabledForPremium: !!body.enabledForPremium,
        isActive: body.isActive !== false,
      })
      .returning();
    return row;
  });
}

export async function PATCH(req: Request) {
  return handleApi(async () => {
    await requireAdmin();
    const body = await req.json();
    const id = Number(body.id);
    if (!id) throw new Error("id requerido");

    const patch: Partial<typeof featureFlags.$inferInsert> = {};
    if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
    if (typeof body.enabledForPremium === "boolean") patch.enabledForPremium = body.enabledForPremium;
    if (Array.isArray(body.enabledForRoles)) patch.enabledForRoles = body.enabledForRoles;

    await db.update(featureFlags).set(patch).where(eq(featureFlags.id, id));
    return { ok: true };
  });
}
