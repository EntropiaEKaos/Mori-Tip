import { db } from "@/db";
import { systemSettings, mpPayments } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleApi } from "@/lib/api";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  return handleApi(async () => {
    const me = await requireUser();
    const { amountBrl, morisAmount } = await req.json();

    const price = Number(amountBrl);
    const moris = Number(morisAmount);
    if (!price || !moris) throw new Error("Parâmetros de transação inválidos");

    // 1. Get Access Token
    const [tokenRow] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "mercadopago_access_token"))
      .limit(1);

    const accessToken = tokenRow?.value || process.env.MP_ACCESS_TOKEN || "TEST-ACCESS-TOKEN-MOCKED";

    // Create Preference in Mercado Pago API
    let initPoint = `/wallet?payment_mock_success=true&moris=${moris}&price=${price}`;
    let preferenceId = `pref_mock_${Date.now().toString(36)}`;

    if (accessToken && !accessToken.startsWith("TEST-ACCESS-TOKEN-MOCKED")) {
      try {
        const response = await fetch("https://api.mercadopago.com/v1/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            items: [
              {
                title: `${moris} Moedas Moris - Rede Mori`,
                quantity: 1,
                unit_price: price,
                currency_id: "BRL",
              },
            ],
            back_urls: {
              success: `${req.headers.get("origin")}/wallet?mp_success=true`,
              failure: `${req.headers.get("origin")}/wallet?mp_failure=true`,
              pending: `${req.headers.get("origin")}/wallet?mp_pending=true`,
            },
            auto_return: "approved",
            notification_url: `${req.headers.get("origin")}/api/payments/webhook`,
            external_reference: String(me.id),
          }),
        });

        if (response.ok) {
          const pref = await response.json();
          initPoint = pref.init_point;
          preferenceId = pref.id;
        }
      } catch (err) {
        console.error("Mercado Pago API failed, using fallback mock", err);
      }
    }

    // Save transaction in database
    await db.insert(mpPayments).values({
      userId: me.id,
      preferenceId,
      amountBrl: price,
      morisCredited: moris,
      status: "pending",
    });

    return { initPoint, preferenceId };
  });
}
