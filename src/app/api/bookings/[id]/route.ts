import { db } from "@/db";
import { bookings, inns, restaurants, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const me = await requireUser();
    const { id } = await ctx.params;
    const body = await req.json();
    const status = body.status as "confirmed" | "cancelled" | "completed";
    if (!["confirmed", "cancelled", "completed"].includes(status)) throw new Error("Status inválido");

    const [row] = await db.select().from(bookings).where(eq(bookings.id, Number(id))).limit(1);
    if (!row) throw new Error("Reserva não encontrada");

    // Determine who is the host/owner
    let hostOwnerId: number | null = null;
    if (row.innId) {
      const [r] = await db.select().from(inns).where(eq(inns.id, row.innId)).limit(1);
      if (r) hostOwnerId = r.ownerId;
    } else if (row.restaurantId) {
      const [r] = await db.select().from(restaurants).where(eq(restaurants.id, row.restaurantId)).limit(1);
      if (r) hostOwnerId = r.ownerId;
    }

    const isHost = (hostOwnerId === me.id) || me.role === "admin";
    const isGuest = row.userId === me.id;
    if (status === "cancelled") {
      if (!isHost && !isGuest) throw new Error("FORBIDDEN");
    } else {
      if (!isHost) throw new Error("FORBIDDEN");
    }

    await db.update(bookings).set({ status }).where(eq(bookings.id, row.id));
    const target = isHost ? row.userId : (hostOwnerId ?? row.userId);
    await db.insert(notifications).values({
      userId: target,
      actorId: me.id,
      type: "booking",
      entityId: row.id,
      message: `Reserva #${row.id} atualizada para: ${status}`,
    });
    return { ok: true, status };
  });
}
