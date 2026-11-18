import {
  Youtube,
  MessageSquare,
  Twitter,
  BookOpen,
  Tv,
  TrendingUp,
  Github,
  Briefcase,
  Search,
  Radio,
  FileText,
  Share2,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface PlatformItem {
  name: string;
  category: "Video & Media" | "Social & Community" | "Financial & Career" | "Web & System";
  status: "Operational" | "Realtime";
  latency: string;
  icon: any;
  capabilities: string[];
  description: string;
}

const PLATFORMS: PlatformItem[] = [
  {
    name: "YouTube",
    category: "Video & Media",
    status: "Operational",
    latency: "340ms",
    icon: Youtube,
    capabilities: ["Subtitles Extraction", "Whisper AI Transcription", "Metadata"],
    description: "Extract clean time-stamped subtitles directly into prompt context.",
  },
  {
    name: "Reddit",
    category: "Social & Community",
    status: "Operational",
    latency: "190ms",
    icon: MessageSquare,
    capabilities: ["Subreddit Search", "Discussion Threads", "Top Comments"],
    description: "Read technical subreddits and developer debates with zero API keys.",
  },
  {
    name: "Twitter / X",
    category: "Social & Community",
    status: "Operational",
    latency: "280ms",
    icon: Twitter,
    capabilities: ["Keyword Search", "Thread Unrolling", "Profile Feeds"],
    description: "Access trending breaking updates and tech announcements in real time.",
  },
  {
    name: "Xiaohongshu (RED)",
    category: "Social & Community",
    status: "Operational",
    latency: "310ms",
    icon: BookOpen,
    capabilities: ["Note Extraction", "Top Comments", "Product Sentiment"],
    description: "Tap into Chinese lifestyle, developer gadgets, and consumer reviews.",
  },
  {
    name: "Bilibili",
    category: "Video & Media",
    status: "Operational",
    latency: "250ms",
    icon: Tv,
    capabilities: ["Bili Subtitles", "Danmaku Summary", "User Dynamics"],
    description: "Fetch tech tutorial transcripts and technical creator commentaries.",
  },
  {
    name: "Xueqiu (Snowball)",
    category: "Financial & Career",
    status: "Operational",
    latency: "140ms",
    icon: TrendingUp,
    capabilities: ["Real-time Quotes", "HK & US Markets", "Community Sentiment"],
    description: "Real-time stock quotes, valuations, and financial threads.",
  },
  {
    name: "GitHub",
    category: "Web & System",
    status: "Operational",
    latency: "180ms",
    icon: Github,
    capabilities: ["Repo Inspection", "Issue Tracking", "README Synthesis"],
    description: "Deep inspect code repositories, pull requests, and commit logs.",
  },
  {
    name: "LinkedIn",
    category: "Financial & Career",
    status: "Operational",
    latency: "420ms",
    icon: Briefcase,
    capabilities: ["Job Postings", "Company Profiles", "Role Requirements"],
    description: "Extract live tech job openings and career listings worldwide.",
  },
  {
    name: "Boss Zhipin",
    category: "Financial & Career",
    status: "Operational",
    latency: "380ms",
    icon: Briefcase,
    capabilities: ["Tech JD Extraction", "Salary Metrics", "City Filters"],
    description: "Query Chinese technology hiring positions and market salaries.",
  },
  {
    name: "V2EX",
    category: "Social & Community",
    status: "Operational",
    latency: "150ms",
    icon: Layers,
    capabilities: ["Daily Hot Topics", "Node Feeds", "Developer Discussions"],
    description: "Follow programmer trends and open-source releases on V2EX.",
  },
  {
    name: "Xiaoyuzhou FM",
    category: "Video & Media",
    status: "Operational",
    latency: "920ms",
    icon: Radio,
    capabilities: ["Podcast Transcripts", "Episode Metadata", "Timestamp Links"],
    description: "Full audio speech-to-text transcript generation for podcasts.",
  },
  {
    name: "Web / Exa",
    category: "Web & System",
    status: "Operational",
    latency: "210ms",
    icon: Search,
    capabilities: ["Semantic Search", "Neural Ranking", "Deep Crawling"],
    description: "High-accuracy live internet search via Exa search engine.",
  },
  {
    name: "Jina Reader",
    category: "Web & System",
    status: "Operational",
    latency: "160ms",
    icon: FileText,
    capabilities: ["Markdown Conversion", "Boilerplate Stripping", "Metadata"],
    description: "Converts any web page into clean, LLM-ready markdown.",
  },
  {
    name: "Instagram",
    category: "Social & Community",
    status: "Operational",
    latency: "460ms",
    icon: Share2,
    capabilities: ["Profile Extraction", "Public Posts", "Reels Description"],
    description: "Extract creator captions, public posts, and bio links.",
  },
  {
    name: "Facebook",
    category: "Social & Community",
    status: "Operational",
    latency: "490ms",
    icon: Share2,
    capabilities: ["Public Pages", "Event Listings", "Group Discussions"],
    description: "Access open public community posts and brand announcements.",
  },
  {
    name: "CloakBrowser Sandboxes",
    category: "Web & System",
    status: "Realtime",
    latency: "510ms",
    icon: Cpu,
    capabilities: ["Anti-Detection CDP", "Canvas Spoofing", "Dynamic Session Sync"],
    description: "Cloud browser sandbox that bypasses bot defenses without cookie leakage.",
  },
];

export function PlatformMatrix() {
  return (
    <section id="matrix" className="py-20 relative border-t border-slate-200 dark:border-[#23252a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] text-slate-700 dark:text-[#d0d6e0] text-xs font-mono mb-4">
            <Layers className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Universal Ecosystem Coverage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-[#f7f8f8] mb-3 tracking-headline">
            16 Live Web Platform Adapters
          </h2>
          <p className="text-slate-600 dark:text-[#8a8f98] text-xs sm:text-sm">
            All channels run via native CLI with automatic fallback.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className="p-5 rounded-xl bg-white dark:bg-[#0f1011] border border-slate-200 dark:border-[#23252a] hover:border-[#5e6ad2]/50 transition group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#141516] group-hover:bg-[#5e6ad2]/15 flex items-center justify-center text-slate-700 dark:text-[#d0d6e0] group-hover:text-[#5e6ad2] transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{p.latency}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f7f8f8] mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#8a8f98] mb-3 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-[#141516]">
                  {p.capabilities.map((cap) => (
                    <div
                      key={cap}
                      className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-[#8a8f98]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#5e6ad2] shrink-0" />
                      <span className="truncate">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
