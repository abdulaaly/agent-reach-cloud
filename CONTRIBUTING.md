# Contributing to Agent-Reach Cloud

Thank you for your interest in contributing to **Agent-Reach Cloud**!

## 🌟 Upstream Attribution & Heritage

Agent-Reach Cloud is based on and extends the open-source [Agent-Reach](https://github.com/Panniantong/agent-reach) project created by **Panniantong**, transforming local scraper CLIs into an enterprise, multi-tenant Remote MCP (Model Context Protocol) Cloud SaaS platform.

## 🤝 Code of Conduct & Standards

1. **Surgical Precision**: Follow clean architectural boundaries between Next.js App Router API routes, universal tools in `src/lib/tools`, database abstraction in `src/lib/db`, and OAuth/MCP handlers.
2. **Strict Design System**: Adhere to the Linear Design System (`DESIGN.md`). Dark theme canvas `#010102`, lavender-blue accent `#5e6ad2`, hairline borders `#23252a`. Light theme `#FFFFFF` with `#F5F6F6` cards and WCAG >= 4.5:1 contrast.
3. **Zero Fake Logic**: Never add mock authentication or hardcoded demo bypasses. All API keys must be cryptographically hashed with SHA-256 (`ar_live_...`), and OAuth 2.0 must follow RFC 7636 (PKCE) and RFC 8414 metadata discovery.
4. **Resilient Serverless Fallbacks**: All 16 platform tools must provide fast TypeScript/Node HTTPS fallback logic so they operate seamlessly both in local CLI mode and on Vercel Serverless / Edge runtimes.

## 🛠️ Development Setup

```bash
# Clone the repository
git clone https://github.com/abdulaaly/agent-reach-cloud.git
cd agent-reach-cloud

# Install dependencies
npm install

# Run typecheck
npx tsc --noEmit

# Run Next.js development server
npm run dev
```

## 📬 Contact & Support
Maintainer Contact: **100xdigitizer@gmail.com**
