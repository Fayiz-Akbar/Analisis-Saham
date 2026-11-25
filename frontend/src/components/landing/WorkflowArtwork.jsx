import React from "react";

// 01. Learn — Karakter mengangkat dua keping puzzle konsep pasar modal (PER & ROE)
export function LearnWorkflowArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      className={`w-full max-w-[215px] h-auto ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wf-shade-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.16" />
        </linearGradient>
        <radialGradient id="wf-floor-1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="184" rx="64" ry="12" fill="url(#wf-floor-1)" />

      {/* Keping Puzzle Kiri */}
      <path
        d="M42 28 H84 V44 C91 44 91 55 84 55 V70 H42 V28 Z"
        fill="url(#wf-shade-1)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <text
        x="52"
        y="54"
        className="fill-slate-900 dark:fill-white font-semibold"
        fontSize="12"
        fontFamily="ui-monospace, monospace"
      >
        PER
      </text>

      {/* Keping Puzzle Kanan */}
      <path
        d="M150 30 H194 V72 H150 V56 C143 56 143 45 150 45 V30 Z"
        fill="url(#wf-shade-1)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <text
        x="160"
        y="56"
        className="fill-slate-900 dark:fill-white font-semibold"
        fontSize="12"
        fontFamily="ui-monospace, monospace"
      >
        ROE
      </text>

      {/* Kepala Karakter */}
      <circle
        cx="120"
        cy="74"
        r="11"
        className="fill-white dark:fill-[#11141c] stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
      />
      <circle cx="116" cy="73" r="1.2" className="fill-slate-900 dark:fill-white" />
      <circle cx="124" cy="73" r="1.2" className="fill-slate-900 dark:fill-white" />
      <path
        d="M116.5 77.5 Q120 80.5 123.5 77.5"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Tubuh & Lengan */}
      <path
        d="M68 70 C68 88 86 96 104 94 V128 L94 176 H109 L120 134 L131 176 H146 L136 128 V94 C154 96 172 88 172 72 L160 72 C158 82 146 86 135 86 H105 C94 86 82 82 80 70 Z"
        fill="url(#wf-shade-1)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 02. Search & Screen — Karakter meneropong peluang saham & tren kurva IDX
export function SearchScreenWorkflowArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      className={`w-full max-w-[215px] h-auto ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wf-shade-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.14" />
        </linearGradient>
        <radialGradient id="wf-beam-2" cx="30%" cy="60%" r="75%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d="M126 66 L216 20 V116 L126 78 Z" fill="url(#wf-beam-2)" />

      <path
        d="M72 44 C78 36 90 36 102 44 L132 58 L124 67 L96 55 C88 53 84 60 88 74 L92 108 L106 112 L100 138 L109 178 H95 L87 138 L78 178 H64 L74 134 L74 88 C64 80 62 56 72 44 Z"
        fill="url(#wf-shade-2)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <circle
        cx="94"
        cy="74"
        r="10"
        className="fill-white dark:fill-[#11141c] stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
      />
      <circle cx="97" cy="73" r="1.2" className="fill-slate-900 dark:fill-white" />

      <path
        d="M104 71 L160 44 L172 86 L108 82 Z"
        fill="url(#wf-shade-2)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse
        cx="166"
        cy="65"
        rx="16"
        ry="22"
        transform="rotate(-12 166 65)"
        className="fill-white dark:fill-[#11141c] stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
      />
      <path
        d="M155 71 L162 63 L167 67 L176 56"
        className="stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 03. Analyze — Karakter mengevaluasi 4 pilar fundamental & lembar laporan
export function AnalyzeWorkflowArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      className={`w-full max-w-[215px] h-auto ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wf-shade-3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.16" />
        </linearGradient>
        <radialGradient id="wf-floor-3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="122" cy="182" rx="68" ry="12" fill="url(#wf-floor-3)" />

      <rect
        x="104"
        y="36"
        width="92"
        height="78"
        rx="10"
        fill="url(#wf-shade-3)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
      />
      <rect
        x="120"
        y="80"
        width="10"
        height="22"
        rx="2"
        className="fill-white dark:fill-[#11141c] stroke-slate-900 dark:stroke-white"
        strokeWidth="1.7"
      />
      <rect
        x="137"
        y="68"
        width="10"
        height="34"
        rx="2"
        className="fill-white dark:fill-[#11141c] stroke-slate-900 dark:stroke-white"
        strokeWidth="1.7"
      />
      <rect
        x="154"
        y="74"
        width="10"
        height="28"
        rx="2"
        className="fill-white dark:fill-[#11141c] stroke-slate-900 dark:stroke-white"
        strokeWidth="1.7"
      />
      <rect
        x="171"
        y="58"
        width="10"
        height="44"
        rx="2"
        className="fill-slate-900/10 dark:fill-white/10 stroke-slate-900 dark:stroke-white"
        strokeWidth="1.7"
      />
      <path
        d="M122 66 L142 54 L158 60 L178 46"
        className="stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="68"
        cy="66"
        r="11"
        className="fill-white dark:fill-[#11141c] stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
      />
      <circle cx="71" cy="65" r="1.2" className="fill-slate-900 dark:fill-white" />
      <path
        d="M66 70 Q71 72 74 69"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M54 88 C58 80 78 80 86 88 L112 92 L112 103 L84 102 L82 132 L92 178 H77 L68 138 L58 178 H44 L54 132 Z"
        fill="url(#wf-shade-3)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 04. Compare & Simulate — Karakter dinamis membawa komparasi saham & catatan DCA
export function SimulateWorkflowArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      className={`w-full max-w-[215px] h-auto ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wf-shade-4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.16" />
        </linearGradient>
        <radialGradient id="wf-floor-4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="122" cy="184" rx="60" ry="11" fill="url(#wf-floor-4)" />

      <path
        d="M36 58 H74 L68 84 H30 Z"
        fill="url(#wf-shade-4)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line
        x1="28"
        y1="88"
        x2="72"
        y2="88"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <rect
        x="140"
        y="24"
        width="38"
        height="26"
        rx="5"
        fill="url(#wf-shade-4)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
      />
      <path
        d="M147 42 L155 36 L161 39 L170 31"
        className="stroke-rose-600 dark:stroke-rose-400"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect
        x="170"
        y="74"
        width="20"
        height="26"
        rx="3"
        fill="url(#wf-shade-4)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
      />

      <circle
        cx="114"
        cy="70"
        r="11"
        className="fill-white dark:fill-[#11141c] stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
      />
      <circle cx="110" cy="69" r="1.2" className="fill-slate-900 dark:fill-white" />
      <circle cx="118" cy="69" r="1.2" className="fill-slate-900 dark:fill-white" />
      <path
        d="M110.5 73.5 Q114 76.5 117.5 73.5"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M58 88 C66 102 84 102 98 94 L102 126 L76 168 L88 176 L116 138 L142 150 L166 112 L152 104 L134 130 L126 122 L126 92 C142 86 154 70 156 50 L144 50 C142 66 132 78 122 80 H102 C88 80 74 88 70 84 Z"
        fill="url(#wf-shade-4)"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
