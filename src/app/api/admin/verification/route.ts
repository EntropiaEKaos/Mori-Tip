import { db } from "@/db";
import {
  verificationRequests,
  inns,
  restaurants,
  guides,
  users,
  notifications,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    await requireAdmin();
    const rows = await db
      .select({
        id: verificationRequests.id,
        userId: verificationRequests.userId,
        userDisplayName: users.displayName,
        userUsername: users.username,
        entityType: verificationRequests.entityType,
        entityId: verificationRequests.entityId,
        status: verificationRequests.status,
        adminNotes: verificationRequests.adminNotes,
        createdAt: verificationRequests.createdAt,
      })
      .from(verificationRequests)
      .innerJoin(users, eq(users.id, verificationRequests.userId))
      .orderBy(desc(verificationRequests.createdAt))
      .limit(100);
    return rows;
  });
}

export async function PATCH(req: Request) {
  return handleApi(async () => {
    await requireAdmin();
    const { id, status, adminNotes } = await req.json();
    if (!id || !status) throw new Error("id e status obrigatórios");
    const reqId = Number(id);

    const [vr] = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.id, reqId))
      .limit(1);
    if (!vr) throw new Error("Solicitação não encontrada");

    await db
      .update(verificationRequests)
      .set({
        status: status as "approved" | "rejected",
        adminNotes: String(adminNotes ?? "").slice(0, 500),
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, reqId));

    if (status === "approved") {
      if (vr.entityType === "inn") {
        await db.update(inns).set({ isVerified: true }).where(eq(inns.id, vr.entityId));
      } else if (vr.entityType === "restaurant") {
        await db
          .update(restaurants)
          .set({ isVerified: true })
          .where(eq(restaurants.id, vr.entityId));
      } else if (vr.entityType === "guide") {
        await db.update(guides).set({ isVerified: true }).where(eq(guides.id, vr.entityId));
      }
    }

    await db.insert(notifications).values({
      userId: vr.userId,
      type: "system",
      entityId: reqId,
      message: `Solicitação de verificação (${vr.entityType}) foi ${status === "approved" ? "aprovada ✅" : "recusada ❌"}. ${adminNotes ? `Obs: ${adminNotes}` : ""}`,
    });

    return { ok: true };
  });
}
