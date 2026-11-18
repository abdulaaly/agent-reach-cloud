"use client";

import { useState } from "react";
import { Play, Loader2, Youtube, MessageSquare, TrendingUp, BookOpen, CheckCircle, Clock } from "lucide-react";

interface PlaygroundPreset {
  id: string;
  name: string;
  icon: any;
  tool: string;
  channel: string;
  args: Record<string, any>;
  description: string;
}

const PRESETS: PlaygroundPreset[] = [
  {
    id: "youtube",
    name: "YouTube Subtitles",
    icon: Youtube,
    tool: "youtube_subtitle",
    channel: "youtube",
    args: { target: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lang: "en" },
    description: "Fetch complete subtitles, timestamps, and speech transcripts with automatic Whisper fallback.",
  },
  {
    id: "xiaohongshu",
    name: "Xiaohongshu Note",
    icon: BookOpen,
    tool: "xiaohongshu_search",
    channel: "xiaohongshu",
    args: { query: "AI 智能体开发实践与框架对比", limit: 3 },
    description: "Search and extract Chinese lifestyle & developer notes, top comments, and user feedback.",
  },
  {
    id: "reddit",
    name: "Reddit Threads",
    icon: MessageSquare,
    tool: "reddit_search",
    channel: "reddit",
    args: { query: "r/LocalLLaMA vLLM vs Ollama throughput", limit: 3 },
    description: "Read technical discussions, benchmark claims, and community insights without API keys.",
  },
  {
    id: "xueqiu",
    name: "Xueqiu Stock Quote",
    icon: TrendingUp,
    tool: "xueqiu_quote",
    channel: "xueqiu",
    args: { symbol: "AAPL" },
    description: "Live stock quotes, valuation multiples, and investor sentiment from Xueqiu financial engine.",
  },
];

export function TerminalPlayground() {
  const [selectedPreset, setSelectedPreset] = useState<PlaygroundPreset>(PRESETS[0]);
  const [customArgs, setCustomArgs] = useState<string>(
    JSON.stringify(PRESETS[0].args, null, 2)
  );
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const handleSelectPreset = (p: PlaygroundPreset) => {
    setSelectedPreset(p);
    setCustomArgs(JSON.stringify(p.args, null, 2));
    setOutput(null);
    setLatency(null);
  };

  const executeCall = async () => {
    setLoading(true);
    const start = performance.now();

    try {
      let parsedArgs: any = {};
      try {
        parsedArgs = JSON.parse(customArgs);
      } catch (err) {
        parsedArgs = selectedPreset.args;
      }

      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer ar_live_demo1234567890abcdef",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: selectedPreset.tool,
            arguments: parsedArgs,
          },
        }),
      });

      const data = await res.json();
      setLatency(Math.round(performance.now() - start));
      setOutput(data);
    } catch (err: any) {
      setOutput({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message: err.message },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="playground" className="py-20 relative border-t border-slate-200 dark:border-[#23252a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-[#f7f8f8] mb-3 tracking-headline">
            Interactive MCP Terminal
          </h2>
          <p className="text-slate-600 dark:text-[#8a8f98] text-xs sm:text-sm">
            Simulate standard JSON-RPC 2.0 tool execution on the live Python engine.
          </p>
        </div>

        {/* Channel Presets Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const active = selectedPreset.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition border ${
                  active
                    ? "bg-[#5e6ad2] text-white border-[#5e6ad2]"
                    : "bg-white dark:bg-[#0f1011] text-slate-700 dark:text-[#8a8f98] border-slate-200 dark:border-[#23252a] hover:bg-slate-100 dark:hover:bg-[#141516]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Playground Box */}
        <div className="max-w-4xl mx-auto rounded-xl bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-slate-50 dark:bg-[#141516] px-4 py-2.5 border-b border-slate-200 dark:border-[#23252a] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-700 dark:text-[#f7f8f8]">
                tools/call → {selectedPreset.tool}
              </span>
            </div>
            {latency !== null && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>{latency}ms</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-[#23252a]">
            {/* Left: Input Payload */}
            <div className="p-4 flex flex-col justify-between">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-[#8a8f98] mb-1.5 uppercase">
                  JSON-RPC Arguments
                </label>
                <textarea
                  value={customArgs}
                  onChange={(e) => setCustomArgs(e.target.value)}
                  className="w-full h-44 bg-slate-100 dark:bg-[#010102] rounded-md p-3 text-xs font-mono text-slate-900 dark:text-[#f7f8f8] border border-slate-200 dark:border-[#23252a] focus:outline-none focus:border-[#5e6ad2] resize-none"
                />
                <p className="text-[11px] text-slate-500 dark:text-[#62666d] mt-2">
                  {selectedPreset.description}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={executeCall}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-md text-white bg-[#5e6ad2] hover:bg-[#828fff] disabled:opacity-60 transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Native Runner...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Execute Live MCP Tool</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Output Payload */}
            <div className="p-4 flex flex-col justify-between bg-slate-50 dark:bg-[#010102]">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-[#8a8f98] mb-1.5 uppercase">
                  Execution Response
                </label>
                <pre className="w-full h-56 overflow-auto text-xs font-mono text-slate-800 dark:text-[#d0d6e0] p-3 rounded-md bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a]">
                  {output
                    ? JSON.stringify(output, null, 2)
                    : "// Click 'Execute Live MCP Tool' to run\n// The tool dispatches directly to .venv/agent_reach.cli"}
                </pre>
              </div>
              {output && (
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#8a8f98]">
                  <span>Status: {output.error ? "Error" : "Success"}</span>
                  <span>Compute cost: 1 unit</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
