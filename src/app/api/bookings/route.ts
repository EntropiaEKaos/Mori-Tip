import { db } from "@/db";
import { bookings, inns, users, notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { awardXp, spendMoris } from "@/lib/gamification";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  return handleApi(async () => {
    const me = await requireUser();
    // as guest
    const asGuest = await db
      .select({
        id: bookings.id,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        guests: bookings.guests,
        nights: bookings.nights,
        totalPrice: bookings.totalPrice,
        paidWithMoris: bookings.paidWithMoris,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        innId: bookings.innId,
        innName: inns.name,
        innCity: inns.city,
        innState: inns.state,
        role: sql<string>`'guest'`,
      })
      .from(bookings)
      .innerJoin(inns, eq(inns.id, bookings.innId))
      .where(eq(bookings.userId, me.id))
      .orderBy(desc(bookings.createdAt));

    // as host
    const asHost = await db
      .select({
        id: bookings.id,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        guests: bookings.guests,
        nights: bookings.nights,
        totalPrice: bookings.totalPrice,
        paidWithMoris: bookings.paidWithMoris,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        innId: bookings.innId,
        innName: inns.name,
        innCity: inns.city,
        innState: inns.state,
        guestUsername: users.username,
        guestDisplayName: users.displayName,
        role: sql<string>`'host'`,
      })
      .from(bookings)
      .innerJoin(inns, eq(inns.id, bookings.innId))
      .innerJoin(users, eq(users.id, bookings.userId))
      .where(eq(inns.ownerId, me.id))
      .orderBy(desc(bookings.createdAt));

    return { asGuest, asHost };
  });
}

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    if (!me.isPremium && me.role !== "admin") {
      throw new Error("Reservas disponíveis apenas para contas Premium. Assine em /premium.");
    }
    const body = await req.json();
    const innId = Number(body.innId);
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);
    if (!innId || Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      throw new Error("Dados de reserva inválidos");
    }
    if (checkOut <= checkIn) throw new Error("Check-out deve ser após o check-in");
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
    const guests = Math.max(1, Number(body.guests) || 1);
    const [inn] = await db.select().from(inns).where(eq(inns.id, innId)).limit(1);
    if (!inn || !inn.isApproved) throw new Error("Pousada não encontrada");
    if (!inn.acceptsBookings) throw new Error("Esta pousada ainda não aceita reservas online");

    const totalPrice = inn.pricePerNight * nights;
    const useMoris = Math.min(Math.max(0, Number(body.useMoris) || 0), me.moris, totalPrice);
    if (useMoris > 0) {
      await spendMoris(me.id, useMoris, "booking", `Reserva em ${inn.name}`);
    }

    const [row] = await db
      .insert(bookings)
      .values({
        userId: me.id,
        innId,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice,
        paidWithMoris: useMoris,
        notes: String(body.notes ?? "").slice(0, 500),
        status: "pending",
      })
      .returning();

    await db
      .update(inns)
      .set({
        totalBookings: sql`${inns.totalBookings} + 1`,
        revenueMoris: sql`${inns.revenueMoris} + ${useMoris}`,
      })
      .where(eq(inns.id, innId));

    await db.insert(notifications).values({
      userId: inn.ownerId,
      actorId: me.id,
      type: "booking",
      entityId: row.id,
      message: `${me.displayName} solicitou reserva em ${inn.name} (${nights} noites)`,
    });
    await awardXp(me.id, 60, "booking");
    return row;
  });
}
