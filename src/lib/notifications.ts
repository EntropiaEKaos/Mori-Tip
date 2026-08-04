import { db } from "@/db";
import { systemSettings, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function sendExternalNotification(userId: number, type: string, message: string) {
  try {
    // 1. Save in internal DB
    const [notif] = await db
      .insert(notifications)
      .values({
        userId,
        type: type as any,
        message,
      })
      .returning();

    // 2. Fetch OneSignal config
    const [appIdRow] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "onesignal_app_id"))
      .limit(1);
    const [apiKeyRow] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "onesignal_api_key"))
      .limit(1);

    const appId = appIdRow?.value;
    const apiKey = apiKeyRow?.value;

    if (appId && apiKey && appId !== "DEMO" && apiKey !== "DEMO") {
      // Send real push notification via OneSignal API
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${apiKey}`,
        },
        body: JSON.stringify({
          app_id: appId,
          contents: { en: message, pt: message },
          channel_for_external_user_ids: "push",
          include_aliases: { external_id: [String(userId)] },
          target_channel: "push",
        }),
      });

      if (!response.ok) {
        console.error("OneSignal push dispatch error:", await response.text());
      }
    } else {
      // Mock log to show it ran beautifully
      console.log(`[Notification Proxy (OneSignal Simulation)] Sent to User ID ${userId}: "${message}"`);
    }

    return notif;
  } catch (err) {
    console.error("External Notification Error:", err);
  }
}
