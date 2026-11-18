import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MCP_TOOLS } from "@/lib/mcp";
import { BookOpen, Terminal, Key, Shield, Radio, ArrowRight, Check } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="pb-8 border-b border-white/5 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-medium mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Agent-Reach Cloud Architecture & MCP Reference
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Everything you need to integrate Agent-Reach Remote MCP server with Claude Web, ChatGPT Custom Actions, Cursor, or autonomous agent frameworks.
          </p>
        </div>

        {/* 1. Protocol Overview */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>1. Protocol Endpoints & Transports</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Agent-Reach Cloud supports the <strong>Model Context Protocol (2024-11-05 spec)</strong> over two primary transports: Server-Sent Events (SSE) and Direct Streamable HTTP POST.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="glass-panel p-5 rounded-xl border border-white/5">
              <span className="text-cyan-400 font-bold block mb-1">GET /api/mcp/sse</span>
              <p className="text-[11px] text-slate-400 font-sans mb-3">
                Server-Sent Events streaming transport. Connects ChatGPT & Claude Desktop.
              </p>
              <div className="bg-[#09090B] p-2.5 rounded-lg text-slate-300">
                https://agent-reach.cloud/api/mcp/sse?token=ar_live_••••••
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/5">
              <span className="text-emerald-400 font-bold block mb-1">POST /api/mcp</span>
              <p className="text-[11px] text-slate-400 font-sans mb-3">
                Streamable JSON-RPC 2.0 endpoint for ChatGPT Custom Actions & HTTP clients.
              </p>
              <div className="bg-[#09090B] p-2.5 rounded-lg text-slate-300">
                Authorization: Bearer ar_live_••••••
              </div>
            </div>
          </div>
        </section>

        {/* 2. Authentication & Quota */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            <span>2. Multi-Tenant Authentication</span>
          </h2>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-xs text-slate-300 leading-relaxed space-y-4">
            <p>
              Authentication is validated on every incoming JSON-RPC request. You can provide your key in either:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>
                <strong className="text-white">Query Parameter:</strong> Useful for clients like ChatGPT Web and Claude Desktop that expect a single URL:
                <code className="text-cyan-300 font-mono ml-1">?token=ar_live_xxxxxx</code>
              </li>
              <li>
                <strong className="text-white">HTTP Header:</strong> Standard Bearer token authentication:
                <code className="text-cyan-300 font-mono ml-1">Authorization: Bearer ar_live_xxxxxx</code>
              </li>
            </ul>
            <p>
              When compute balance reaches 0, the server responds with a standard MCP error code:
              <code className="block mt-2 bg-[#09090B] p-3 rounded-xl font-mono text-[11px] text-amber-300">
                &#123; "jsonrpc": "2.0", "id": 1, "error": &#123; "code": -32000, "message": "Compute quota depleted. Top up at https://agent-reach.cloud/dashboard" &#125; &#125;
              </code>
            </p>
          </div>
        </section>

        {/* 3. Registered MCP Tools */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            <span>3. Registered Tools Specification</span>
          </h2>

          <div className="space-y-4">
            {MCP_TOOLS.map((t) => (
              <div key={t.name} className="glass-panel p-6 rounded-2xl border border-white/5 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-cyan-300 font-bold text-sm">{t.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-sans">
                    Compute Cost: {t.name.includes("transcript") || t.name.includes("bilibili") ? "2 Units" : "1 Unit"}
                  </span>
                </div>
                <p className="text-slate-400 font-sans text-xs mb-4">{t.description}</p>
                <div className="bg-[#09090B] p-3 rounded-xl text-slate-300 overflow-x-auto border border-white/5">
                  <pre className="text-[11px]">{JSON.stringify(t.inputSchema, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="glass-panel-glow p-8 rounded-2xl border border-cyan-500/30 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to give your AI live internet access?</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
            Get your pre-authenticated Remote MCP URL and explore live transcripts & social data in seconds.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition"
          >
            <span>Go to Cloud Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
