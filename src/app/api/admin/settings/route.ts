import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();
    const rows = await db.select().from(systemSettings);
    // Convert list to dynamic dictionary
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  });
}

export async function PATCH(req: Request) {
  return handleApi(async () => {
    await requireAdmin();
    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      const valStr = typeof value === "object" ? JSON.stringify(value) : String(value);
      
      // Upsert
      const [existing] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1);

      if (existing) {
        await db
          .update(systemSettings)
          .set({ value: valStr, updatedAt: new Date() })
          .where(eq(systemSettings.key, key));
      } else {
        await db
          .insert(systemSettings)
          .values({ key, value: valStr });
      }
    }

    return { ok: true };
  });
}
