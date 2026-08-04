import { db } from "@/db";
import { users } from "@/db/schema";
import { signToken, setSessionCookie } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  return handleApi(async () => {
    const { provider, credential, displayName, avatarUrl, email } = await req.json();

    if (provider === "google") {
      if (!credential) throw new Error("Credencial Google obrigatória");
      // In production: verify the Google ID Token via Google APIs
      // For sandbox/demo we treat credential as the googleId
      const googleId = String(credential).slice(0, 80);
      let userEmail = email ? String(email).toLowerCase() : `${googleId.slice(0, 12)}@google.mori`;

      // Find by googleId or fallback email
      let [existing] = await db
        .select()
        .from(users)
        .where(eq(users.googleId, googleId))
        .limit(1);
      if (!existing) {
        [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, userEmail))
          .limit(1);
      }

      if (!existing) {
        const slug = `mori_${Math.random().toString(36).slice(2, 8)}`;
        const [created] = await db
          .insert(users)
          .values({
            username: slug,
            email: userEmail,
            googleId,
            displayName: displayName || `Viajante Mori`,
            passwordHash: "google_authenticated_no_password",
            role: "user",
            avatarUrl: avatarUrl ?? null,
            moris: 150,
          })
          .returning();
        existing = created;
      } else {
        if (!existing.googleId) {
          await db.update(users).set({ googleId }).where(eq(users.id, existing.id));
        }
      }

      if (existing.isBanned) throw new Error("Conta suspensa");
      const token = signToken({ userId: existing.id, role: existing.role });
      await setSessionCookie(token);
      return {
        id: existing.id,
        username: existing.username,
        role: existing.role,
        hasChosenRole: existing.hasChosenRole,
      };
    }

    throw new Error("Provider não suportado");
  });
}
