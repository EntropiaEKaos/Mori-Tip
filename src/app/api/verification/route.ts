import { db } from "@/db";
import { verificationRequests, users, inns, restaurants, guides } from "@/db/schema";
import { requireUser, requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { and, desc, eq, sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const me = await requireUser();
    const rows = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.userId, me.id))
      .orderBy(desc(verificationRequests.createdAt));
    return rows;
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const { entityType, entityId } = await req.json();
    if (!entityType || !entityId) throw new Error("Entidade e ID obrigatórios");

    // upsert for this entity
    const [existing] = await db
      .select()
      .from(verificationRequests)
      .where(
        and(
          eq(verificationRequests.userId, me.id),
          eq(verificationRequests.entityType, String(entityType)),
          eq(verificationRequests.entityId, Number(entityId)),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(verificationRequests)
        .set({ status: "pending", updatedAt: new Date() })
        .where(eq(verificationRequests.id, existing.id));
      return existing;
    }

    const [row] = await db
      .insert(verificationRequests)
      .values({
        userId: me.id,
        entityType: String(entityType),
        entityId: Number(entityId),
      })
      .returning();
    return row;
  });
}
