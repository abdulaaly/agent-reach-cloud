"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight, Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ReachLogo } from "./ReachLogo";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#E5E7EB] dark:border-[#23252a] bg-white/85 dark:bg-[#010102]/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Brand Logo with Official Animated SVG */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <ReachLogo size={28} />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-[#f7f8f8]">
                Agent-Reach
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#141516] text-slate-600 dark:text-[#8a8f98] border border-slate-200 dark:border-[#23252a] font-mono">
                CLOUD
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600 dark:text-[#8a8f98]">
            <Link href="#features" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">
              Architecture
            </Link>
            <Link href="#matrix" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition flex items-center gap-1.5">
              <span>16 Platforms</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </Link>
            <Link href="#playground" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">
              Playground
            </Link>
            <Link href="#pricing" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">
              Pricing
            </Link>
            <Link href="#setup" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">
              Connect MCP
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition">
              Dashboard
            </Link>
            <a
              href="https://github.com/Panniantong/agent-reach"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 dark:hover:text-[#f7f8f8] transition flex items-center gap-1 text-slate-500 dark:text-[#8a8f98]"
              title="Official GitHub Repository"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          {/* CTA & Controls */}
          <div className="hidden md:flex items-center space-x-2.5">
            <ThemeToggle />

            <Link
              href="/auth"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-slate-700 dark:text-[#d0d6e0] bg-slate-100 dark:bg-[#0f1011] hover:bg-slate-200 dark:hover:bg-[#141516] border border-slate-200 dark:border-[#23252a] transition"
            >
              <span>Sign In</span>
            </Link>

            <Link
              href="/auth"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium rounded-md text-white bg-[#5e6ad2] hover:bg-[#828fff] active:bg-[#5e69d1] transition shadow-sm"
            >
              <span>Get API Key</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger & Theme */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-slate-600 dark:text-[#8a8f98] hover:text-slate-900 dark:hover:text-[#f7f8f8]"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-[#23252a] px-4 pt-3 pb-6 space-y-3 bg-white dark:bg-[#010102]">
          <Link
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block text-sm text-slate-700 dark:text-[#d0d6e0] py-1"
          >
            Architecture
          </Link>
          <Link
            href="#matrix"
            onClick={() => setIsOpen(false)}
            className="block text-sm text-slate-700 dark:text-[#d0d6e0] py-1"
          >
            16 Platform Channels
          </Link>
          <Link
            href="#playground"
            onClick={() => setIsOpen(false)}
            className="block text-sm text-slate-700 dark:text-[#d0d6e0] py-1"
          >
            Playground
          </Link>
          <Link
            href="#pricing"
            onClick={() => setIsOpen(false)}
            className="block text-sm text-slate-700 dark:text-[#d0d6e0] py-1"
          >
            Pricing & Quotas
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block text-sm text-slate-700 dark:text-[#d0d6e0] py-1"
          >
            Dashboard
          </Link>
          <div className="pt-2 flex items-center gap-2">
            <Link
              href="/auth"
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-4 py-2 text-xs font-medium rounded-md text-white bg-[#5e6ad2]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
