import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Agent-Reach Cloud — Enterprise Multi-Tenant Remote MCP & SaaS Platform",
  description:
    "Give ChatGPT, Claude, and autonomous agents authenticated live internet access across 16 platforms with Remote MCP, token auth, and compute quota metering.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.png",
  },
  keywords: [
    "Model Context Protocol",
    "MCP",
    "Remote MCP",
    "ChatGPT",
    "Claude",
    "YouTube Transcripts",
    "Reddit Scraper",
    "Xueqiu",
    "AI Agent Tools",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className="bg-slate-50 dark:bg-[#09090B] text-slate-800 dark:text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-600 dark:selection:text-cyan-200 transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
