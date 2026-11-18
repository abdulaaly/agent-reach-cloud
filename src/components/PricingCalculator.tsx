"use client";

import { useState } from "react";
import { Check, Zap, Loader2, ArrowRight } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  popular?: boolean;
  features: string[];
  description: string;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 5,
    credits: 500,
    description: "For individual developers experimenting with custom GPTs and personal Claude agents.",
    features: [
      "500 Compute Units (no expiry)",
      "~500 Web or Reddit queries",
      "~250 YouTube video transcripts",
      "Standard Remote MCP SSE Gateway",
      "1 Live API Access Token",
      "Discord & GitHub Support",
    ],
  },
  {
    id: "pro",
    name: "Pro Researcher",
    price: 20,
    credits: 2500,
    popular: true,
    description: "For active developers, finance researchers, and autonomous multi-agent pipelines.",
    features: [
      "2,500 Compute Units (Priority)",
      "~2,500 Web or Xueqiu stock lookups",
      "~1,250 YouTube & Bilibili transcripts",
      "Sub-200ms Dedicated Cloud Workers",
      "Up to 10 Active API Tokens",
      "Full 16-Platform Channel Access",
      "Interactive Dashboard Telemetry",
    ],
  },
  {
    id: "agency",
    name: "Agency & Enterprise",
    price: 50,
    credits: 10000,
    description: "High concurrency infrastructure for production SaaS and enterprise multi-tenant agents.",
    features: [
      "10,000 Compute Units",
      "Unlimited Concurrent SSE Connections",
      "Unlimited API Tokens & Revocation",
      "High-throughput CloakBrowser Sandboxes",
      "Lemon Squeezy Auto-Recharge Support",
      "Dedicated 24/7 Slack SLA Channel",
    ],
  },
];

export function PricingCalculator() {
  const [sliderCredits, setSliderCredits] = useState<number>(2500);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  const calculateCost = (units: number) => {
    return Math.round((units * 0.008) * 10) / 10;
  };

  const handleCheckout = async (plan: Plan) => {
    setLoadingPlan(plan.id);
    setCheckoutSuccess(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: plan.id,
          userId: "user_demo_01",
          simulated: true,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        if (data.url && !data.simulated) {
          window.location.href = data.url;
        } else {
          setCheckoutSuccess(
            `Successfully topped up ${plan.credits} Compute Units! New Balance: ${data.newBalance} units.`
          );
        }
      }
    } catch (err: any) {
      alert("Billing error: " + err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-20 relative border-t border-slate-200 dark:border-[#23252a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] text-slate-700 dark:text-[#d0d6e0] text-xs font-mono mb-4">
            <Zap className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Pay As You Query</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-[#f7f8f8] mb-3 tracking-headline">
            Transparent Compute Billing
          </h2>
          <p className="text-slate-600 dark:text-[#8a8f98] text-xs sm:text-sm">
            Top up compute credits with Lemon Squeezy. No recurring subscription lock-in. Credits never expire.
          </p>
        </div>

        {checkoutSuccess && (
          <div className="max-w-xl mx-auto mb-8 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs text-center font-medium">
            {checkoutSuccess}
          </div>
        )}

        {/* Dynamic Calculator Slider */}
        <div className="max-w-2xl mx-auto mb-14 p-6 rounded-xl bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-900 dark:text-[#f7f8f8]">
              Estimated Agent Workload
            </span>
            <span className="text-xs font-mono text-[#5e6ad2] font-semibold">
              {sliderCredits.toLocaleString()} Units (~${calculateCost(sliderCredits)})
            </span>
          </div>

          <input
            type="range"
            min="500"
            max="15000"
            step="500"
            value={sliderCredits}
            onChange={(e) => setSliderCredits(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-[#191a1b] rounded-lg appearance-none cursor-pointer accent-[#5e6ad2]"
          />

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-[#141516] text-center text-xs">
            <div>
              <div className="font-semibold text-slate-900 dark:text-[#f7f8f8]">
                {sliderCredits.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#8a8f98]">Web / Reddit Searches</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-[#f7f8f8]">
                {Math.round(sliderCredits / 2).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#8a8f98]">YouTube Transcripts</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-[#f7f8f8]">
                {sliderCredits.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#8a8f98]">Xueqiu Stock Quotes</div>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isPop = plan.popular;
            return (
              <div
                key={plan.id}
                className={`p-6 rounded-xl bg-white dark:bg-[#0f1011] border transition flex flex-col justify-between shadow-sm relative ${
                  isPop
                    ? "border-[#5e6ad2] ring-1 ring-[#5e6ad2]"
                    : "border-slate-200 dark:border-[#23252a] hover:border-slate-300 dark:hover:border-[#34343a]"
                }`}
              >
                {isPop && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#5e6ad2] text-white">
                    RECOMMENDED
                  </span>
                )}

                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-[#f7f8f8] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#8a8f98] mb-4 min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-slate-900 dark:text-[#f7f8f8]">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#8a8f98]">
                      / {plan.credits.toLocaleString()} units
                    </span>
                  </div>

                  <ul className="space-y-2 mb-8 text-xs text-slate-600 dark:text-[#d0d6e0]">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#5e6ad2] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md transition ${
                    isPop
                      ? "text-white bg-[#5e6ad2] hover:bg-[#828fff]"
                      : "text-slate-800 dark:text-[#f7f8f8] bg-slate-100 dark:bg-[#141516] hover:bg-slate-200 dark:hover:bg-[#191a1b] border border-slate-200 dark:border-[#23252a]"
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Opening Checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>Get {plan.credits} Units</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
