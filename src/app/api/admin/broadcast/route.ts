import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  return handleApi(async () => {
    const admin = await requireAdmin();
    const { message } = await req.json();
    const text = String(message ?? "").slice(0, 300).trim();
    if (!text) throw new Error("Mensagem vazia");
    const all = await db.select({ id: users.id }).from(users).where(eq(users.isBanned, false));
    if (all.length === 0) return { count: 0 };
    await db.insert(notifications).values(
      all.map((u) => ({
        userId: u.id,
        actorId: admin.id,
        type: "system" as const,
        message: text,
      })),
    );
    return { count: all.length };
  });
}
