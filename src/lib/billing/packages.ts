export const BILLING_PACKAGES = {
  starter: {
    id: "pkg_starter",
    name: "Starter Pack",
    price: 5,
    credits: 500,
    description: "Ideal for individual developers & personal ChatGPT/Claude agents",
    variantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID || "starter_variant_demo",
  },
  pro: {
    id: "pkg_pro",
    name: "Pro Researcher",
    price: 20,
    credits: 2500,
    description: "Heavy usage with YouTube transcription, Reddit deep search & Xueqiu quotes",
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || "pro_variant_demo",
  },
  agency: {
    id: "pkg_agency",
    name: "Agency & Enterprise",
    price: 50,
    credits: 10000,
    description: "High concurrency multi-agent teams with priority queueing",
    variantId: process.env.LEMONSQUEEZY_AGENCY_VARIANT_ID || "agency_variant_demo",
  },
};
