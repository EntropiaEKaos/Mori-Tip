import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { or, eq } from "drizzle-orm";

export async function POST(req: Request) {
  return handleApi(async () => {
    const { identifier, password } = await req.json();
    if (!identifier || !password) throw new Error("Preencha os campos");
    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, String(identifier).toLowerCase()),
          eq(users.username, String(identifier).toLowerCase()),
        ),
      )
      .limit(1);
    if (!user) throw new Error("Credenciais inválidas");
    if (user.isBanned) throw new Error("Conta suspensa");
    const okPw = await verifyPassword(password, user.passwordHash);
    if (!okPw) throw new Error("Credenciais inválidas");
    const token = signToken({ userId: user.id, role: user.role });
    await setSessionCookie(token);
    return { id: user.id, username: user.username, role: user.role };
  });
}
