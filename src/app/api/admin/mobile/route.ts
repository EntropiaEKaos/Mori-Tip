import { db } from "@/db";
import { mobileApps } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();
    return await db.select().from(mobileApps).orderBy(desc(mobileApps.createdAt));
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    await requireAdmin();
    const body = await req.json();
    const [row] = await db
      .insert(mobileApps)
      .values({
        platform: body.platform,
        version: body.version,
        buildNumber: Number(body.buildNumber) || 1,
        isForceUpdate: !!body.isForceUpdate,
        minSupportedVersion: body.minSupportedVersion || "1.0.0",
        storeUrl: body.storeUrl || null,
        releaseNotes: body.releaseNotes || "",
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

    const patch: Partial<typeof mobileApps.$inferInsert> = {};
    if (typeof body.isForceUpdate === "boolean") patch.isForceUpdate = body.isForceUpdate;
    if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
    if (typeof body.version === "string") patch.version = body.version;
    if (typeof body.minSupportedVersion === "string") patch.minSupportedVersion = body.minSupportedVersion;
    if (typeof body.storeUrl === "string") patch.storeUrl = body.storeUrl;
    if (typeof body.releaseNotes === "string") patch.releaseNotes = body.releaseNotes;

    await db.update(mobileApps).set(patch).where(eq(mobileApps.id, id));
    return { ok: true };
  });
}
