"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Terminal,
  Copy,
  Check,
  Radio,
  Youtube,
  TrendingUp,
  MessageSquare,
  Code2,
  Sparkles,
  Zap,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { ReachLogo } from "./ReachLogo";

interface DemoTab {
  id: string;
  label: string;
  channel: string;
  icon: any;
  inputUrl: string;
  outputSummary: string;
  jsonPreview: string;
  cost: string;
}

const DEMO_TABS: DemoTab[] = [
  {
    id: "youtube",
    label: "Watch YouTube",
    channel: "youtube",
    icon: Youtube,
    inputUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    outputSummary: "Full video audio transcribed into structured timeline with timestamps and key takeaways.",
    cost: "2 Compute Units",
    jsonPreview: `{\n  "ok": true,\n  "channel": "youtube",\n  "data": {\n    "videoId": "dQw4w9WgXcQ",\n    "title": "Never Gonna Give You Up - 4K Remaster",\n    "duration": "3:32",\n    "transcription": "Full spoken dialogue captured by Whisper AI pipeline...",\n    "key_moments": ["00:18 Chorus", "01:24 Bridge", "02:40 Solo"]\n  }\n}`,
  },
  {
    id: "xueqiu",
    label: "Stream Markets (Xueqiu)",
    channel: "xueqiu",
    icon: TrendingUp,
    inputUrl: "NVDA (NVIDIA Corporation)",
    outputSummary: "Real-time stock price quote, P/E multiple, high/low spread, and community bullish sentiment.",
    cost: "1 Compute Unit",
    jsonPreview: `{\n  "ok": true,\n  "channel": "xueqiu",\n  "data": {\n    "symbol": "NVDA",\n    "name": "NVIDIA Corp",\n    "current": 185.50,\n    "percent": 3.42,\n    "high": 187.20,\n    "low": 182.10,\n    "volume": "48.2M",\n    "sentiment": "Bullish (89%)"\n  }\n}`,
  },
  {
    id: "reddit",
    label: "Analyze Social (Reddit / RED)",
    channel: "reddit",
    icon: MessageSquare,
    inputUrl: "r/LocalLLaMA",
    outputSummary: "Top community discussion threads, benchmark debates, and sentiment extraction.",
    cost: "1 Compute Unit",
    jsonPreview: `{\n  "ok": true,\n  "channel": "reddit",\n  "items": [\n    {\n      "title": "DeepSeek R1 Running on Consumer GPUs: Full Guide",\n      "score": 1420,\n      "num_comments": 234,\n      "subreddit": "r/LocalLLaMA",\n      "url": "https://reddit.com/r/LocalLLaMA/..."\n    }\n  ]\n}`,
  },
  {
    id: "github",
    label: "Inspect Code (GitHub)",
    channel: "github",
    icon: Code2,
    inputUrl: "Panniantong/agent-reach",
    outputSummary: "Clean markdown extraction of repo architecture, PR discussion, and dependency manifests.",
    cost: "1 Compute Unit",
    jsonPreview: `{\n  "ok": true,\n  "channel": "github",\n  "data": {\n    "repo": "Panniantong/agent-reach",\n    "stars": 3480,\n    "readme_summary": "CLI tool giving agent scrapers for 16 platforms...",\n    "primary_language": "Python / TypeScript"\n  }\n}`,
  },
];

export function Hero() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("youtube");

  const sampleEndpoint = "https://agent-reach.cloud/api/mcp/sse";

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTab = DEMO_TABS.find((t) => t.id === activeTab) || DEMO_TABS[0];

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden transition-colors duration-200">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#5e6ad2]/10 dark:bg-[#5e6ad2]/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Nano Banana Brand Mark Centerpiece */}
          <div className="flex justify-center mb-6">
            <div className="relative group p-2 rounded-2xl bg-slate-100/60 dark:bg-[#0f1011]/60 border border-slate-200/80 dark:border-[#23252a] backdrop-blur-md transition hover:border-[#5e6ad2]/50 shadow-sm">
              <ReachLogo size={56} animated={true} />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#010102]" />
            </div>
          </div>

          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] text-slate-700 dark:text-[#d0d6e0] text-xs font-mono mb-6 shadow-xs">
            <Radio className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Official Agent Reach Remote MCP Server (2024-11-05 Spec)</span>
          </div>

          {/* Heading with Linear Negative Tracking */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 dark:text-[#f7f8f8] mb-6 leading-[1.08] tracking-display-lg">
            Give ChatGPT & Claude <br />
            <span className="text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#f7f8f8] dark:via-[#828fff] dark:to-[#8a8f98]">
              Eyes & Reach on the Live Web
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#8a8f98] mb-8 max-w-2xl mx-auto leading-relaxed">
            By default, LLMs are blind to live video audio, dynamic financial orderbooks, and closed social networks. Agent-Reach Cloud grants your AI multimodal sight & extraction across 16 platforms with zero local infrastructure.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium rounded-md text-white bg-[#5e6ad2] hover:bg-[#828fff] active:bg-[#5e69d1] transition shadow-sm"
            >
              <span>Connect MCP in 30 Seconds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="#matrix"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-md text-slate-800 dark:text-[#d0d6e0] bg-slate-100 dark:bg-[#0f1011] hover:bg-slate-200 dark:hover:bg-[#141516] border border-slate-200 dark:border-[#23252a] transition"
            >
              <Eye className="w-3.5 h-3.5 text-[#5e6ad2]" />
              <span>Explore 16 Platforms</span>
            </Link>
          </div>

          {/* Universal MCP Connection Bar */}
          <div className="max-w-2xl mx-auto p-2 rounded-lg bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 pl-2 overflow-hidden text-xs text-slate-700 dark:text-[#d0d6e0] font-mono">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5e6ad2]/15 text-[#5e6ad2]">MCP SSE</span>
              <span className="truncate">{sampleEndpoint}</span>
            </div>
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#141516] hover:bg-slate-200 dark:hover:bg-[#191a1b] text-xs text-slate-800 dark:text-[#f7f8f8] font-medium border border-slate-200 dark:border-[#23252a] transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* INTERACTIVE SHOWCASE (Inspired by qme.ai): AI Multimodal Sight Simulator */}
        <div className="mt-12 max-w-4xl mx-auto rounded-xl bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] overflow-hidden shadow-sm">
          {/* Tab Selection Header */}
          <div className="bg-slate-50 dark:bg-[#141516] px-3 py-2 border-b border-slate-200 dark:border-[#23252a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {DEMO_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      isActive
                        ? "bg-white dark:bg-[#0f1011] text-slate-900 dark:text-[#f7f8f8] shadow-xs border border-slate-200 dark:border-[#23252a]"
                        : "text-slate-600 dark:text-[#8a8f98] hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#5e6ad2]" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 px-2">
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Latency: 48ms</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-[#23252a]">
                {currentTab.cost}
              </span>
            </div>
          </div>

          {/* Interactive Simulation View */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-[#23252a]">
            {/* Left: Input & Natural Language Perception */}
            <div className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-[#f7f8f8] mb-1">
                  <Sparkles className="w-4 h-4 text-[#5e6ad2]" />
                  <span>Agent Observation Intent</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#8a8f98] leading-relaxed">
                  {currentTab.outputSummary}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a]">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Target Resource:</span>
                <span className="text-xs font-mono text-slate-900 dark:text-[#f7f8f8] break-all">
                  {currentTab.inputUrl}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-[#8a8f98]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Zero Headless Bottlenecks</span>
                </span>
                <span className="font-mono text-[11px] text-[#5e6ad2]">
                  Channel: {currentTab.channel}
                </span>
              </div>
            </div>

            {/* Right: Real JSON-RPC 2.0 Response Terminal */}
            <div className="p-5 bg-slate-950 font-mono text-xs text-slate-200 dark:text-[#d0d6e0] overflow-x-auto max-h-64">
              <div className="text-slate-500 text-[10px] mb-2 flex items-center justify-between">
                <span>// MCP JSON-RPC 2.0 Payload</span>
                <span className="text-emerald-400">STATUS: 200 OK</span>
              </div>
              <pre className="text-slate-300 dark:text-[#f7f8f8] leading-relaxed">
                {currentTab.jsonPreview}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
