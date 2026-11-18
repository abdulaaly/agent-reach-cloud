"use client";

interface ReachLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export function ReachLogo({ className = "", size = 32, animated = true }: ReachLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="reachGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5E6AD2" />
            <stop offset="50%" stopColor="#828FFF" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#828FFF" />
          </linearGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbital Pulse Wave */}
        {animated && (
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#reachGrad1)"
            strokeWidth="1"
            opacity="0.3"
            className="animate-ping origin-center"
            style={{ animationDuration: "3.5s" }}
          />
        )}

        {/* Secondary Dashed Scanning Ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="url(#reachGrad1)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity="0.6"
          className={animated ? "animate-spin origin-center" : ""}
          style={{ animationDuration: "20s" }}
        />

        {/* Counter-rotating Inner Precision Ring */}
        <circle
          cx="50"
          cy="50"
          r="28"
          stroke="#5E6AD2"
          strokeWidth="1.5"
          strokeDasharray="3 5"
          opacity="0.8"
          className={animated ? "animate-spin origin-center" : ""}
          style={{ animationDirection: "reverse", animationDuration: "14s" }}
        />

        {/* Hexagonal Sight & Reach Lattice */}
        <polygon
          points="50,18 78,34 78,66 50,82 22,66 22,34"
          stroke="url(#reachGrad1)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />

        {/* Omni-Channel Reach Rays */}
        <line x1="50" y1="50" x2="50" y2="18" stroke="#828FFF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="50" x2="78" y2="34" stroke="#5E6AD2" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="50" x2="78" y2="66" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="50" x2="50" y2="82" stroke="#828FFF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="50" x2="22" y2="66" stroke="#5E6AD2" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="50" x2="22" y2="34" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" />

        {/* Platform Node Vertices */}
        <circle cx="50" cy="18" r="3" fill="#828FFF" />
        <circle cx="78" cy="34" r="3" fill="#5E6AD2" />
        <circle cx="78" cy="66" r="3" fill="#00E5FF" />
        <circle cx="50" cy="82" r="3" fill="#828FFF" />
        <circle cx="22" cy="66" r="3" fill="#5E6AD2" />
        <circle cx="22" cy="34" r="3" fill="#00E5FF" />

        {/* AI Sight Nexus Core */}
        <circle
          cx="50"
          cy="50"
          r="10"
          fill="url(#reachGrad1)"
          filter="url(#glowFilter)"
        />
        <circle
          cx="50"
          cy="50"
          r="4.5"
          fill="url(#coreGlow)"
          className={animated ? "animate-pulse" : ""}
          style={{ animationDuration: "1.8s" }}
        />
      </svg>
    </div>
  );
}
