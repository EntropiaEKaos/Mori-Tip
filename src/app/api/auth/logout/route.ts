import { clearSessionCookie } from "@/lib/auth";
import { handleApi } from "@/lib/api";

export async function POST() {
  return handleApi(async () => {
    await clearSessionCookie();
    return { ok: true };
  });
}
