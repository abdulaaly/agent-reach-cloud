import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-[#23252a] bg-slate-50 dark:bg-[#010102] py-14 text-slate-500 dark:text-[#8a8f98] text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 flex items-center justify-center p-1">
                <img src="/logo.svg" alt="Agent Reach Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-[#f7f8f8]">Agent-Reach Cloud</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#62666d] leading-relaxed">
              Enterprise Remote Model Context Protocol (MCP) server giving ChatGPT and Claude authenticated access to 16 web platforms.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com/Panniantong/agent-reach"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-md bg-white dark:bg-[#0f1011] hover:bg-slate-100 dark:hover:bg-[#141516] flex items-center justify-center text-slate-700 dark:text-[#d0d6e0] border border-slate-200 dark:border-[#23252a] transition"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                MCP 2024-11-05
              </span>
            </div>
          </div>

          {/* Protocols */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-[#f7f8f8] uppercase tracking-wider">Protocol</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="#matrix" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">16 Live Platform Adapters</Link></li>
              <li><Link href="#setup" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">Server-Sent Events (/mcp/sse)</Link></li>
              <li><Link href="#setup" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">Streamable HTTP POST (/mcp)</Link></li>
              <li><Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">Multi-Tenant Token Auth</Link></li>
            </ul>
          </div>

          {/* Integrations */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-[#f7f8f8] uppercase tracking-wider">AI Integrations</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="#setup" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">ChatGPT Web & Custom Actions</Link></li>
              <li><Link href="#setup" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">Claude Web & Claude Desktop</Link></li>
              <li><Link href="#setup" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">Cursor IDE & Roo-Code</Link></li>
              <li><Link href="#pricing" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">Lemon Squeezy Billing</Link></li>
            </ul>
          </div>

          {/* Developer & Legal */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-[#f7f8f8] uppercase tracking-wider">Compliance</h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-[#62666d]">
              <li>Read-only data extraction</li>
              <li>No credential storage</li>
              <li>Isolated Cloud Sandboxes</li>
              <li>HMAC-SHA256 Webhooks</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-[#23252a] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-[#62666d] gap-2">
          <div>© {new Date().getFullYear()} Agent-Reach Cloud. All rights reserved.</div>
          <div>Powered by official Agent Reach, Next.js 15, and MCP.</div>
        </div>
      </div>
    </footer>
  );
}
