"use client";

import { useState } from "react";
import { Copy, Check, Terminal, ExternalLink } from "lucide-react";

type SetupTarget = "chatgpt" | "claude" | "cursor";

export function SetupGuide() {
  const [activeTab, setActiveTab] = useState<SetupTarget>("chatgpt");
  const [copiedCode, setCopiedCode] = useState(false);

  const claudeConfigSnippet = `{
  "mcpServers": {
    "agent-reach-cloud": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sse",
        "https://agent-reach.cloud/api/mcp/sse?token=YOUR_API_TOKEN"
      ]
    }
  }
}`;

  const cursorSnippet = `{
  "servers": {
    "agent-reach-cloud": {
      "type": "sse",
      "url": "https://agent-reach.cloud/api/mcp/sse?token=YOUR_API_TOKEN"
    }
  }
}`;

  const chatGptActionSchema = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Agent-Reach Cloud Gateway",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://agent-reach.cloud/api"
    }
  ],
  "paths": {
    "/mcp": {
      "post": {
        "summary": "Execute Live Tool Call",
        "operationId": "callTool",
        "security": [{ "bearerAuth": [] }]
      }
    }
  }
}`;

  const currentSnippet =
    activeTab === "claude"
      ? claudeConfigSnippet
      : activeTab === "cursor"
      ? cursorSnippet
      : chatGptActionSchema;

  const copySnippet = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="setup" className="py-20 relative border-t border-slate-200 dark:border-[#23252a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-[#f7f8f8] mb-3 tracking-headline">
            Connect in 30 Seconds
          </h2>
          <p className="text-slate-600 dark:text-[#8a8f98] text-xs sm:text-sm">
            Plug Agent Reach directly into ChatGPT Web, Claude Desktop, or Cursor IDE.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a]">
            <button
              onClick={() => setActiveTab("chatgpt")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === "chatgpt"
                  ? "bg-white dark:bg-[#0f1011] text-slate-900 dark:text-[#f7f8f8] shadow-sm"
                  : "text-slate-600 dark:text-[#8a8f98] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              ChatGPT Web (OAuth / Bearer)
            </button>
            <button
              onClick={() => setActiveTab("claude")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === "claude"
                  ? "bg-white dark:bg-[#0f1011] text-slate-900 dark:text-[#f7f8f8] shadow-sm"
                  : "text-slate-600 dark:text-[#8a8f98] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Claude Web & Desktop
            </button>
            <button
              onClick={() => setActiveTab("cursor")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === "cursor"
                  ? "bg-white dark:bg-[#0f1011] text-slate-900 dark:text-[#f7f8f8] shadow-sm"
                  : "text-slate-600 dark:text-[#8a8f98] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Cursor & Roo-Code
            </button>
          </div>
        </div>

        {/* Configuration Pane */}
        <div className="max-w-3xl mx-auto rounded-xl bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] overflow-hidden shadow-sm">
          <div className="bg-slate-50 dark:bg-[#141516] px-4 py-2.5 border-b border-slate-200 dark:border-[#23252a] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#5e6ad2]" />
              <span className="font-mono text-slate-700 dark:text-[#f7f8f8]">
                {activeTab === "chatgpt" ? "OpenAPI Action Specification" : "Configuration JSON"}
              </span>
            </div>
            <button
              onClick={copySnippet}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#191a1b] hover:bg-slate-200 dark:hover:bg-[#23252a] text-[11px] text-slate-700 dark:text-[#f7f8f8] font-medium border border-slate-200 dark:border-[#23252a] transition"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Copy Config</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 sm:p-5 text-xs font-mono text-slate-800 dark:text-[#d0d6e0] bg-slate-900 dark:bg-[#010102] overflow-x-auto">
            {currentSnippet}
          </pre>
        </div>
      </div>
    </section>
  );
}
