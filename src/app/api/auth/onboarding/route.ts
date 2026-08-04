import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { checkAndAwardBadges } from "@/lib/gamification";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const { role, displayName, bio, location } = await req.json();
    const chosenRole = role as "user" | "host" | "guide";
    if (!["user", "host", "guide"].includes(chosenRole)) {
      throw new Error("Escolha viajante, anfitrião ou guia");
    }

    await db
      .update(users)
      .set({
        role: chosenRole,
        hasChosenRole: true,
        displayName: displayName ? String(displayName).slice(0, 80) : me.displayName,
        bio: bio ? String(bio).slice(0, 500) : me.bio,
        location: location ? String(location).slice(0, 120) : me.location,
      })
      .where(eq(users.id, me.id));

    await checkAndAwardBadges(me.id);
    return { ok: true, role: chosenRole };
  });
}
