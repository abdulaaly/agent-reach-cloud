<h1 align="center">⚡ Agent-Reach Cloud</h1>

<p align="center">
  <strong>Enterprise Multi-Tenant Remote MCP Server & Live Internet SaaS Platform</strong>
</p>

<p align="center">
  Give ChatGPT, Claude, Cursor, and autonomous agents authenticated live eyes on the entire web across 16 platforms with zero local dependencies.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-2024--11--05-00f2fe?style=for-the-badge&logo=anthropic" alt="MCP Spec"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15_App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js 15"></a>
</p>

---

## 🌟 Upstream Heritage & Attribution

**Agent-Reach Cloud** is built upon and extends the foundational work of [Panniantong/Agent-Reach](https://github.com/Panniantong/agent-reach). We have transformed the local scraper toolset into an enterprise, multi-tenant cloud SaaS with:
- Standardized Remote MCP Server (SSE & Streamable HTTP POST)
- Universal OAuth 2.0 PKCE (RFC 7636, RFC 8414, RFC 9728)
- SHA-256 Cryptographic API Key Isolation & Revocation
- Real-time Metered Compute & Lemon Squeezy Billing
- Resilient Serverless Edge Extractors with Zero Cold Start Delay

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│     Clients: ChatGPT Web / Claude Desktop / Cursor     │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS SSE (/api/mcp/sse)
                           │ Streamable HTTP POST (/api/mcp)
                           │ Bearer Token / OAuth 2.0 PKCE
┌──────────────────────────▼─────────────────────────────┐
│          Remote MCP Gateway (Next.js 15 Engine)        │
│  - Multi-tenant Auth Verification (Bearer / OAuth)     │
│  - RFC 8414 Discovery (/.well-known/oauth-...)         │
│  - JSON-RPC 2.0 MCP Protocol (initialize, tools/call)  │
│  - Zero-Overdraft Compute Deductor                     │
└──────────────────────────┬─────────────────────────────┘
                           │ Dispatches tools
┌──────────────────────────▼─────────────────────────────┐
│          Agent-Reach Cloud Execution Engine            │
│  - 16 Platform Adapters (YouTube, Reddit, Xueqiu...)   │
│  - Hybrid: Native CLI + Fast Serverless Edge Fallback   │
└────────────────────────────────────────────────────────┘
```

---

## 🌐 16-Platform Matrix

| Platform | Channel | Primary Capabilities | Status |
| :--- | :--- | :--- | :--- |
| **YouTube** | `youtube` | Full Subtitles, Timestamps, Whisper AI Transcription | 🟢 Active |
| **Reddit** | `reddit` | Subreddit Search, Discussion Threads, Top Comments | 🟢 Active |
| **Twitter / X** | `twitter` | Keyword Search, Thread Unrolling, Profile Feeds | 🟢 Active |
| **Xiaohongshu (RED)** | `xiaohongshu` | Note Extraction, Top Comments, Product Sentiment | 🟢 Active |
| **Bilibili** | `bilibili` | Bili Subtitles, Hot Rankings, Video Metadata | 🟢 Active |
| **Xueqiu (Snowball)** | `xueqiu` | Real-time Stock Quotes, Market Sentiment, Multiples | 🟢 Active |
| **GitHub** | `github` | Repo Metadata, README Fetch, Search & Issues | 🟢 Active |
| **LinkedIn** | `linkedin` | Job Postings, Tech Requirements, Compensation | 🟢 Active |
| **Boss Zhipin** | `boss` | Salary Range Query, Tech Specs, Recruiter Info | 🟢 Active |
| **V2EX** | `v2ex` | Hot Tech Topics, Programmer Nodes, Community Replies | 🟢 Active |
| **Xiaoyuzhou (FM)** | `xiaoyuzhou` | Podcast Search, Show Notes, Audio Transcripts | 🟢 Active |
| **Web (Exa AI)** | `web` | Semantic Neural Search, Research Papers, Snippets | 🟢 Active |
| **Jina Reader** | `web` | Universal HTML to Markdown Conversion | 🟢 Active |
| **Instagram** | `instagram` | Public Posts, Reel Captions, Creator Bios | 🟢 Active |
| **Facebook** | `facebook` | Public Groups, Brand Pages, Press Releases | 🟢 Active |
| **CloakBrowser** | `runtime` | Dedicated Anti-Fingerprint Headless Sandboxes | 🟢 Active |

---

## 📬 Contact & Enterprise Support
Official Contact: **100xdigitizer@gmail.com**
