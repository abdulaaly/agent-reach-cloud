import { Shield, Zap, Lock, Terminal, Cpu, CloudLightning } from "lucide-react";

const FEATURES = [
  {
    icon: CloudLightning,
    title: "Remote MCP Gateway",
    description: "Standard Model Context Protocol compliant (2024-11-05). Delivers Server-Sent Events (SSE) and streamable HTTP JSON-RPC 2.0 directly to ChatGPT Web and Claude.",
  },
  {
    icon: Lock,
    title: "Multi-Tenant Token Auth",
    description: "Cryptographically secure API tokens (`ar_live_...`). Real-time bearer validation, token revocation, and per-token rate limit counters.",
  },
  {
    icon: Cpu,
    title: "Live Compute Deduction",
    description: "Dynamic per-tool credit calculation. Deducts 1 unit for search and 2 units for video audio transcription with zero balance overdraft.",
  },
  {
    icon: Zap,
    title: "Lemon Squeezy Billing",
    description: "Instant compute top-up via Lemon Squeezy checkout. Webhook verification with HMAC-SHA256 signatures and instant credit allocation.",
  },
  {
    icon: Shield,
    title: "CloakBrowser Cloud Sandboxes",
    description: "Isolated anti-fingerprint headless browser instances designed to cleanly bypass anti-bot hurdles without leaking user cookies.",
  },
  {
    icon: Terminal,
    title: "Sub-200ms Edge Latency",
    description: "Built on serverless edge architecture with intelligent caching, token streaming, and automatic native fallback pathways.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 relative border-t border-slate-200 dark:border-[#23252a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] text-slate-700 dark:text-[#d0d6e0] text-xs font-mono mb-4">
            <Shield className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Architecture & Infrastructure</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-[#f7f8f8] mb-3 tracking-headline">
            Built for Autonomous High-Frequency Agents
          </h2>
          <p className="text-slate-600 dark:text-[#8a8f98] text-xs sm:text-sm">
            Everything required to run official Agent Reach scrapers as a multi-tenant cloud SaaS with seamless LLM connectivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-xl bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] hover:border-[#5e6ad2]/50 transition group shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#141516] group-hover:bg-[#5e6ad2]/15 flex items-center justify-center text-slate-700 dark:text-[#d0d6e0] group-hover:text-[#5e6ad2] transition mb-4">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f7f8f8] mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#8a8f98] leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
