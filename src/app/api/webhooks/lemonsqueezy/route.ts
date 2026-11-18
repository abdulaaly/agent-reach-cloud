import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    // Verify HMAC signature if webhook secret is configured
    if (secret && signature) {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
      const signatureBuffer = Buffer.from(signature, "utf8");

      if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
        return new Response(JSON.stringify({ error: "Invalid HMAC signature" }), { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data || {};
    const attributes = payload.data?.attributes || {};

    let userId = customData.user_id;
    const userEmail = attributes.user_email;

    if (!userId && userEmail) {
      const user = db.getOrCreateUser(userEmail);
      userId = user.id;
    }

    if (!userId) {
      return new Response(JSON.stringify({ received: true, note: "No user identified" }), { status: 200 });
    }

    const orderId = String(payload.data?.id || `ls_${Date.now()}`);
    const totalCents = attributes.total || 0;

    // Determine credits
    let creditsToAdd = Number(customData.credits) || 500;
    let tier = customData.package_id || "starter";

    if (totalCents >= 5000) {
      creditsToAdd = 10000;
      tier = "agency";
    } else if (totalCents >= 2000) {
      creditsToAdd = 2500;
      tier = "pro";
    }

    if (eventName === "order_created" || eventName === "subscription_created" || eventName === "payment_success") {
      db.addCredits(userId, creditsToAdd, orderId, totalCents, tier);
      console.log(`[LemonSqueezy Webhook] Credited ${creditsToAdd} units to ${userId} (Order: ${orderId})`);
    }

    return new Response(JSON.stringify({ ok: true, received: true, event: eventName }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
