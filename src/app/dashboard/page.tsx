"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  Terminal,
  ShieldCheck,
  Radio,
  ExternalLink,
  Loader2,
  LogOut,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowRight,
  Activity,
  AlertTriangle,
  Info,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  computeUnits: number;
  tier: string;
}

interface ApiToken {
  id: string;
  token: string;
  label: string;
  active: boolean;
  createdAt: string;
  requestCount: number;
}

interface UsageLog {
  id: string;
  toolName: string;
  channel: string;
  computeCost: number;
  durationMs: number;
  status: string;
  timestamp: string;
  querySummary?: string;
}

interface StatsData {
  computeBalance: number;
  tier: string;
  totalRequests: number;
  totalComputeUsed: number;
  recentLogs: UsageLog[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic origin
  const [origin, setOrigin] = useState("https://agent-reach.cloud");

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // New token creation
  const [newLabel, setNewLabel] = useState("");
  const [creatingToken, setCreatingToken] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);

  // Top up
  const [topUpModal, setTopUpModal] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);
  const [toppingUp, setToppingUp] = useState(false);

  // Live Tool Workbench
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState("youtube");
  const [toolTarget, setToolTarget] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [toolResult, setToolResult] = useState<any>(null);
  const [runningTool, setRunningTool] = useState(false);

  const fetchUserData = (userId: string) => {
    fetch(`/api/auth?userId=${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Session invalid");
        }
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setTokens(data.tokens || []);
          setStats(data.stats || null);
          fetch(`/api/tokens?userId=${encodeURIComponent(userId)}`)
            .then((r) => r.json())
            .then((tokData) => {
              if (tokData.sessionKey) {
                setSessionKey(tokData.sessionKey);
              }
            })
            .catch(() => {});
        } else {
          router.push("/auth");
        }
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("agent_reach_session");
        }
        router.push("/auth");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      const raw = localStorage.getItem("agent_reach_session");
      if (!raw) {
        router.push("/auth");
        return;
      }

      try {
        const session = JSON.parse(raw);
        if (!session.userId) {
          router.push("/auth");
          return;
        }
        fetchUserData(session.userId);
      } catch (e) {
        router.push("/auth");
      }
    }
  }, [router]);

  const handleCopy = (text: string, id: string, isUrl = false) => {
    navigator.clipboard.writeText(text);
    if (isUrl) {
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2000);
    } else {
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("agent_reach_session");
    }
    router.push("/auth");
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreatingToken(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, label: newLabel || "Agent Token" }),
      });
      const data = await res.json();
      if (data.ok && data.token) {
        setTokens([data.token, ...tokens]);
        setNewLabel("");
        setShowCreateModal(false);
        if (data.rawKey) {
          setCreatedRawKey(data.rawKey);
          setSessionKey(data.rawKey);
          if (typeof window !== "undefined") {
            localStorage.setItem("agent_reach_active_key", data.rawKey);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingToken(false);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!user) return;
    if (!confirm("Revoke this token? Connected AI agents using it will stop working immediately.")) return;
    try {
      const res = await fetch(`/api/tokens?userId=${user.id}&tokenId=${tokenId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setTokens(tokens.map((t) => (t.id === tokenId ? { ...t, active: false } : t)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTopUp = async (packageId: string) => {
    if (!user) return;
    setToppingUp(true);
    setTopUpSuccess(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, userId: user.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setTopUpSuccess(data.message);
        setUser((prev) => (prev ? { ...prev, computeUnits: data.user.computeUnits } : prev));
        setTimeout(() => {
          setTopUpModal(false);
          setTopUpSuccess(null);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setToppingUp(false);
    }
  };

  const handleRunTool = async () => {
    setRunningTool(true);
    setToolResult(null);

    const activeTok =
      sessionKey ||
      createdRawKey ||
      (typeof window !== "undefined" ? localStorage.getItem("agent_reach_active_key") : null) ||
      tokens.find((t) => t.active)?.token ||
      "";

    try {
      let toolName = "reach_read";
      let args: any = {};

      if (selectedChannel === "youtube") {
        toolName = "youtube_subtitle";
        args = { target: toolTarget, lang: "en" };
      } else if (selectedChannel === "xueqiu") {
        toolName = "xueqiu_quote";
        args = { symbol: toolTarget || "NVDA" };
      } else if (selectedChannel === "reddit") {
        toolName = "reddit_search";
        args = { query: toolTarget || "LocalLLaMA", limit: 3 };
      } else if (selectedChannel === "xiaohongshu") {
        toolName = "xiaohongshu_search";
        args = { query: toolTarget || "AI Agent", limit: 3 };
      } else if (selectedChannel === "github") {
        toolName = "github_read";
        args = { target: toolTarget || "Panniantong/agent-reach" };
      } else if (selectedChannel === "v2ex") {
        toolName = "v2ex_hot";
        args = { limit: 5 };
      } else {
        toolName = "web_search";
        args = { query: toolTarget || "Model Context Protocol", limit: 3 };
      }

      const res = await fetch(`/api/mcp?token=${encodeURIComponent(activeTok)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: { name: toolName, arguments: args },
        }),
      });

      const json = await res.json();
      setToolResult(json);
      if (user) {
        fetchUserData(user.id);
      }
    } catch (err: any) {
      setToolResult({ error: err.message });
    } finally {
      setRunningTool(false);
    }
  };

  const universalSseUrl = `${origin}/api/mcp/sse`;
  const universalPostUrl = `${origin}/api/mcp`;
  const oauthAuthUrl = `${origin}/api/oauth/authorize`;
  const oauthTokenUrl = `${origin}/api/oauth/token`;
  const oauthDiscoveryUrl = `${origin}/.well-known/oauth-authorization-server`;

  const primaryTokenPrefix = tokens.find((t) => t.active)?.token;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#010102] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5e6ad2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#010102] text-[#08090A] dark:text-[#F7F8F8] transition-colors duration-200 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-slate-200 dark:border-[#23252a] bg-white/85 dark:bg-[#010102]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 flex items-center justify-center p-1">
              <img src="/logo.svg" alt="Agent Reach Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-[#f7f8f8]">
              Agent-Reach <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#141516] text-slate-600 dark:text-[#8a8f98] font-mono border border-slate-200 dark:border-[#23252a]">CONSOLE</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#23252a]">
              <span className="text-xs text-slate-600 dark:text-[#8a8f98] font-medium">
                {user?.email}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {user?.tier || "STARTER"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* SECTION 1: Universal Remote MCP Server Connection Hub */}
        <div className="p-6 sm:p-7 rounded-xl border border-[#5e6ad2]/40 bg-white dark:bg-[#0f1011] shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5e6ad2] uppercase tracking-wider mb-2">
                <Radio className="w-3.5 h-3.5" />
                <span>Universal Remote MCP Server Endpoint</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-[#f7f8f8] tracking-tight">
                Connect Directly to ChatGPT, Claude & Cursor
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-1 max-w-xl">
                Standardized Model Context Protocol (2024-11-05) gateway. Supports Universal OAuth 2.0 PKCE, SSE transport, and Bearer API tokens.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(universalSseUrl, "universal_sse", true)}
                className="px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[#5e6ad2] hover:bg-[#828fff] flex items-center gap-2 transition shadow-sm"
              >
                {copiedUrl === "universal_sse" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied SSE URL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Remote MCP SSE URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Endpoint Box */}
          <div className="bg-slate-50 dark:bg-[#141516] p-3 rounded-lg border border-slate-200 dark:border-[#23252a] font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5e6ad2]/15 text-[#5e6ad2]">SSE</span>
              <span className="text-slate-800 dark:text-[#f7f8f8] truncate select-all">{universalSseUrl}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-sans">MCP Spec: 2024-11-05</span>
          </div>

          {/* Connect Guides Grid */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-[#23252a] grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guide 1: ChatGPT Web / Mobile OAuth 2.0 */}
            <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-[#141516]/50 border border-slate-200 dark:border-[#23252a]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-[#f7f8f8] mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>ChatGPT Custom Actions (Universal OAuth 2.0)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8a8f98] mb-3 leading-relaxed">
                In ChatGPT Custom GPT settings, select <strong>OAuth</strong> authentication. RFC 8414 auto-discovery handles client setup:
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a]">
                  <span className="text-slate-400 font-sans text-[10px]">Auth URL:</span>
                  <span className="text-slate-800 dark:text-[#f7f8f8] truncate">{oauthAuthUrl}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a]">
                  <span className="text-slate-400 font-sans text-[10px]">Token URL:</span>
                  <span className="text-slate-800 dark:text-[#f7f8f8] truncate">{oauthTokenUrl}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a]">
                  <span className="text-slate-400 font-sans text-[10px]">Client ID:</span>
                  <span className="text-[#5e6ad2] font-semibold">chatgpt</span>
                </div>
              </div>
            </div>

            {/* Guide 2: Claude Desktop / Cursor / Streamable HTTP */}
            <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-[#141516]/50 border border-slate-200 dark:border-[#23252a]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-[#f7f8f8] mb-2">
                <Key className="w-4 h-4 text-[#5e6ad2]" />
                <span>Claude Desktop & Cursor Configuration</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8a8f98] mb-3 leading-relaxed">
                Add to your <code>claude_desktop_config.json</code> using an active API Bearer token:
              </p>
              <div className="p-2.5 rounded bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] font-mono text-[10px] text-slate-700 dark:text-slate-300 overflow-x-auto">
                <pre>{`"agent-reach": {
  "url": "${universalSseUrl}",
  "headers": {
    "Authorization": "Bearer ar_live_YOUR_TOKEN"
  }
}`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Compute Balance & Lemon Squeezy Top-Up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8a8f98] mb-2">
                <span className="font-mono uppercase tracking-wider">Remaining Compute</span>
                <Zap className="w-4 h-4 text-[#5e6ad2]" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-semibold text-slate-900 dark:text-[#f7f8f8] font-mono">
                  {user?.computeUnits.toLocaleString() || "0"}
                </span>
                <span className="text-xs text-slate-500 font-mono">Units</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8a8f98] leading-relaxed mb-4">
                1 unit per search query. 2 units per video transcript. Automated zero-overdraft protection.
              </p>
            </div>

            <button
              onClick={() => setTopUpModal(true)}
              className="w-full py-2.5 px-3 rounded-md text-xs font-medium text-white bg-[#5e6ad2] hover:bg-[#828fff] transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Top Up Balance (Lemon Squeezy)</span>
            </button>
          </div>

          {/* Telemetry Summary Card */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] flex flex-col justify-between shadow-sm md:col-span-2">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8a8f98] mb-2">
                <span className="font-mono uppercase tracking-wider">Multi-Tenant Telemetry & Quota Guard</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f7f8f8] mb-1">
                Zero Overdraft & SHA-256 Hashed Keys
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8a8f98] leading-relaxed">
                All API keys are cryptographically hashed using SHA-256. When your compute units reach zero, MCP requests return a polite RFC error code with instant top-up instructions.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-[#23252a] text-center">
              <div className="p-2 rounded bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a]">
                <span className="text-[10px] text-slate-400 font-sans block">Total Requests</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-[#f7f8f8] font-mono">
                  {stats?.totalRequests || 0}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a]">
                <span className="text-[10px] text-slate-400 font-sans block">Units Consumed</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-[#f7f8f8] font-mono">
                  {stats?.totalComputeUsed || 0}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a]">
                <span className="text-[10px] text-slate-400 font-sans block">Active Keys</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {tokens.filter((t) => t.active).length}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a]">
                <span className="text-[10px] text-slate-400 font-sans block">Available Tools</span>
                <span className="text-sm font-semibold text-[#5e6ad2] font-mono">
                  16 Platforms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: API Key Management */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#23252a] mb-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f7f8f8] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#5e6ad2]" />
                <span>API Tokens</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
                Generate dedicated tokens for individual AI agents or applications.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#5e6ad2] hover:bg-[#828fff] text-white transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Token</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#23252a] text-slate-400 font-mono">
                  <th className="pb-3 font-medium">Label</th>
                  <th className="pb-3 font-medium">Token Prefix</th>
                  <th className="pb-3 font-medium">Requests</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#23252a] text-slate-600 dark:text-slate-300 font-mono">
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                      No API tokens created yet. Click "Create Token" above to generate one.
                    </td>
                  </tr>
                ) : (
                  tokens.map((tok) => (
                    <tr key={tok.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                      <td className="py-3 font-medium text-slate-900 dark:text-white font-sans">{tok.label}</td>
                      <td className="py-3 text-[#5e6ad2]">
                        {tok.token}
                      </td>
                      <td className="py-3 text-slate-500">
                        {tok.requestCount || 0}
                      </td>
                      <td className="py-3">
                        {tok.active ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-mono border border-red-500/20">
                            REVOKED
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right space-x-2 font-sans">
                        <button
                          onClick={() => handleCopy(tok.token, tok.id)}
                          className="p-1.5 rounded-md bg-slate-100 dark:bg-[#141516] hover:bg-slate-200 dark:hover:bg-[#23252a] text-slate-600 dark:text-slate-300 transition"
                          title="Copy Token Prefix"
                        >
                          {copiedKey === tok.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleRevokeToken(tok.id)}
                          className="p-1.5 rounded-md bg-slate-100 dark:bg-[#141516] hover:bg-red-500/10 text-red-500 transition"
                          title="Revoke Token"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: Live Official 16-Platform Execution Workbench */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#23252a] mb-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f7f8f8] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#5e6ad2]" />
                <span>Live Channel Testing Workbench</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-0.5">
                Execute live queries directly against our 16-platform execution engine.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141516] text-slate-600 dark:text-[#8a8f98] border border-slate-200 dark:border-[#23252a]">
              Agent-Reach v1.6.1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Channel / Platform</label>
              <select
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value);
                  if (e.target.value === "youtube") setToolTarget("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                  if (e.target.value === "xueqiu") setToolTarget("NVDA");
                  if (e.target.value === "reddit") setToolTarget("LocalLLaMA");
                  if (e.target.value === "xiaohongshu") setToolTarget("AI Agent");
                  if (e.target.value === "github") setToolTarget("Panniantong/agent-reach");
                  if (e.target.value === "v2ex") setToolTarget("programmer");
                }}
                className="w-full bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5e6ad2]"
              >
                <option value="youtube">YouTube (Subtitles & Video)</option>
                <option value="reddit">Reddit (Search & Subreddits)</option>
                <option value="xueqiu">Xueqiu (Live Financial Quotes)</option>
                <option value="xiaohongshu">Xiaohongshu (RED Notes)</option>
                <option value="github">GitHub (Repos & Code)</option>
                <option value="v2ex">V2EX (Hot Topics)</option>
                <option value="web">Web (Live Search & Reader)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Target URL or Query</label>
              <input
                type="text"
                value={toolTarget}
                onChange={(e) => setToolTarget(e.target.value)}
                placeholder="Enter URL, stock symbol, or query"
                className="w-full bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5e6ad2] font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRunTool}
                disabled={runningTool}
                className="w-full py-2 px-4 rounded-md text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#828fff] transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {runningTool ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Tool...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Run Query</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {toolResult && (
            <div className="mt-4 p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
              <pre>{JSON.stringify(toolResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* SECTION 5: Real-time Telemetry Logs */}
        {stats?.recentLogs && stats.recentLogs.length > 0 && (
          <div className="p-6 rounded-xl border border-slate-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#23252a] mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f7f8f8] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#5e6ad2]" />
                <span>Recent Audit & Telemetry Activity</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-500">Last 10 executions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#23252a] text-slate-400">
                    <th className="pb-2 font-medium">Timestamp</th>
                    <th className="pb-2 font-medium">Tool</th>
                    <th className="pb-2 font-medium">Channel</th>
                    <th className="pb-2 font-medium">Cost</th>
                    <th className="pb-2 font-medium">Duration</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#23252a] text-slate-600 dark:text-slate-300">
                  {stats.recentLogs.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2.5 text-slate-900 dark:text-white font-medium">{l.toolName}</td>
                      <td className="py-2.5 text-[#5e6ad2]">{l.channel}</td>
                      <td className="py-2.5">-{l.computeCost} unit</td>
                      <td className="py-2.5 text-slate-400">{l.durationMs}ms</td>
                      <td className="py-2.5 text-right">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Create Token Input Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-xl max-w-md w-full bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Create New API Token</h3>
            <p className="text-xs text-slate-500 dark:text-[#8a8f98] mb-4">
              Enter a descriptive label for this key (e.g. "Claude Web Production" or "Cursor IDE").
            </p>
            <form onSubmit={handleCreateToken} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Claude Desktop Agent"
                  required
                  className="w-full bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingToken}
                  className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#828fff] transition"
                >
                  {creatingToken ? "Generating..." : "Generate Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: New Token Secret Display (Shown Once) */}
      {createdRawKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-xl max-w-lg w-full bg-white dark:bg-[#0f1011] border border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold">API Key Generated Successfully</h3>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Please copy your secret key right now. For security, it is stored as an SHA-256 hash and you will <strong>never</strong> be able to view it again.
              </span>
            </div>

            <div className="p-3 rounded-md bg-slate-100 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] font-mono text-xs flex items-center justify-between gap-2">
              <span className="text-[#5e6ad2] select-all truncate">{createdRawKey}</span>
              <button
                onClick={() => handleCopy(createdRawKey, "created_key")}
                className="px-3 py-1.5 rounded bg-[#5e6ad2] hover:bg-[#828fff] text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition"
              >
                {copiedKey === "created_key" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Key</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCreatedRawKey(null)}
                className="px-4 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#141516] hover:bg-slate-200 dark:hover:bg-[#23252a] transition"
              >
                Done (I have saved my key)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Lemon Squeezy Top Up Modal */}
      {topUpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-xl max-w-md w-full bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#5e6ad2]" />
                <span>Instant Compute Top-Up</span>
              </h3>
              <button onClick={() => setTopUpModal(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8a8f98] mb-4">
              Select a compute top-up package powered by Lemon Squeezy:
            </p>

            {topUpSuccess && (
              <div className="p-3 mb-4 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs text-center font-medium">
                {topUpSuccess}
              </div>
            )}

            <div className="space-y-2.5">
              <button
                onClick={() => handleTopUp("starter")}
                disabled={toppingUp}
                className="w-full p-3.5 rounded-lg bg-slate-50 dark:bg-[#141516] hover:bg-slate-100 dark:hover:bg-[#1e1f21] border border-slate-200 dark:border-[#23252a] flex items-center justify-between text-left transition"
              >
                <div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Starter Pack</h4>
                  <p className="text-[11px] text-slate-500">+500 Compute Units</p>
                </div>
                <span className="text-sm font-bold text-[#5e6ad2] font-mono">$5</span>
              </button>

              <button
                onClick={() => handleTopUp("pro")}
                disabled={toppingUp}
                className="w-full p-3.5 rounded-lg bg-[#5e6ad2]/5 hover:bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 flex items-center justify-between text-left transition"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Pro Researcher</h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#5e6ad2] text-white font-bold">BEST</span>
                  </div>
                  <p className="text-[11px] text-slate-500">+2,500 Compute Units</p>
                </div>
                <span className="text-sm font-bold text-[#5e6ad2] font-mono">$20</span>
              </button>

              <button
                onClick={() => handleTopUp("agency")}
                disabled={toppingUp}
                className="w-full p-3.5 rounded-lg bg-slate-50 dark:bg-[#141516] hover:bg-slate-100 dark:hover:bg-[#1e1f21] border border-slate-200 dark:border-[#23252a] flex items-center justify-between text-left transition"
              >
                <div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Agency Tier</h4>
                  <p className="text-[11px] text-slate-500">+10,000 Compute Units</p>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">$50</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
