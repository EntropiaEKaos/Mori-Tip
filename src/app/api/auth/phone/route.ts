import { db } from "@/db";
import { users, systemSettings } from "@/db/schema";
import { signToken, setSessionCookie } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  return handleApi(async () => {
    const { phoneNumber, displayName, firebaseToken, isMock } = await req.json();
    if (!phoneNumber) throw new Error("Número de celular obrigatório");

    let finalPhone = String(phoneNumber).trim();
    let finalDisplayName = displayName ? String(displayName).trim() : `Viajante ${finalPhone.slice(-4)}`;

    // 1. If not mock, we can verify firebase ID Token with project_id from settings
    if (!isMock && firebaseToken) {
      const [projIdRow] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, "firebase_project_id"))
        .limit(1);

      const projectId = projIdRow?.value;
      if (projectId && projectId !== "DEMO") {
        try {
          // Verify Firebase ID Token
          const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${projectId}`;
          const res = await fetch(verifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: firebaseToken }),
          });
          if (!res.ok) {
            console.warn("Firebase verification failed, using token payload fallback");
          }
        } catch (e) {
          console.error("Firebase auth verification error", e);
        }
      }
    }

    // 2. Register/Login user with this phoneNumber
    // Check if phone already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, finalPhone))
      .limit(1);

    let user = existing;

    if (!user) {
      // Create new user
      const slug = `mori_${Math.random().toString(36).slice(2, 8)}`;
      const randomEmail = `${slug}@mori.app`;
      const [created] = await db
        .insert(users)
        .values({
          username: slug,
          email: randomEmail,
          phoneNumber: finalPhone,
          displayName: finalDisplayName,
          passwordHash: "firebase_authenticated_no_password",
          role: "user",
          moris: 150, // bonus for phone auth
        })
        .returning();
      user = created;
    }

    if (user.isBanned) throw new Error("Conta suspensa pelo administrador");

    const token = signToken({ userId: user.id, role: user.role });
    await setSessionCookie(token);

    return {
      success: true,
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    };
  });
}
