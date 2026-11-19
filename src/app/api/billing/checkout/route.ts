import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { BILLING_PACKAGES } from "@/lib/billing/packages";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId, userId, simulated } = body;

    const pkg = BILLING_PACKAGES[packageId as keyof typeof BILLING_PACKAGES];
    if (!pkg) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid billing package." }), { status: 400 });
    }

    const targetUserId = userId || "user_demo_01";
    let user = db.getUser(targetUserId);
    if (!user) {
      user = db.createUser(
        targetUserId.includes("@") ? targetUserId : `${targetUserId}@agent-reach.cloud`,
        "Cloud Subscriber"
      );
    }

    // If running in development / test / simulated checkout mode:
    if (simulated || !process.env.LEMONSQUEEZY_API_KEY) {
      const orderId = "ls_order_sim_" + Math.random().toString(36).substring(2, 10);
      const updatedUser = db.addCredits(
        targetUserId,
        pkg.credits,
        orderId,
        pkg.price * 100,
        packageId
      );

      return new Response(
        JSON.stringify({
          ok: true,
          mode: "instant_credit",
          message: `Successfully credited ${pkg.credits} Compute Units to ${user.email}`,
          user: updatedUser,
          orderId,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call real Lemon Squeezy API when credentials present
    const lsApiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${lsApiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              custom: {
                user_id: targetUserId,
                package_id: packageId,
                credits: pkg.credits,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: pkg.variantId,
              },
            },
          },
        },
      }),
    });

    const data = await response.json();
    const checkoutUrl = data?.data?.attributes?.url;

    return new Response(
      JSON.stringify({
        ok: true,
        checkoutUrl: checkoutUrl || `/dashboard?checkout=success&credits=${pkg.credits}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}
