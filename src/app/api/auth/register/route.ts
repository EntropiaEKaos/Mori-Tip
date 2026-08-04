import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { handleApi, bad } from "@/lib/api";
import { or, eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(3).max(40).regex(/^[a-z0-9_]+$/i, "letras, números e _"),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).max(80),
});

export async function POST(req: Request) {
  return handleApi(async () => {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");
    const { username, email, password, displayName } = parsed.data;
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username.toLowerCase()), eq(users.email, email.toLowerCase())));
    if (existing.length) throw new Error("Usuário ou email já cadastrado");
    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        displayName,
      })
      .returning();
    const token = signToken({ userId: user.id, role: user.role });
    await setSessionCookie(token);
    return { id: user.id, username: user.username, role: user.role };
  }).catch((e) => bad(e instanceof Error ? e.message : "erro"));
}
