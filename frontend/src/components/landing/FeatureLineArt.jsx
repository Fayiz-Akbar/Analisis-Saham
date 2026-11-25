import React from "react";

// 1. Ilustrasi Dashboard Pasar IDX80 (dua panel emiten & aliran rotasi sektor)
export function DashboardArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 112 88"
      fill="none"
      className={`w-28 h-[88px] ${className}`}
      aria-hidden="true"
    >
      {/* Panel Kiri Atas */}
      <rect
        x="14"
        y="12"
        width="48"
        height="30"
        rx="4"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
      />
      <line
        x1="14"
        y1="21"
        x2="62"
        y2="21"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
      />
      <path
        d="M22 35 L28 30 L34 33 L42 26"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="48"
        y1="28"
        x2="55"
        y2="28"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="34"
        x2="53"
        y2="34"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Panel Kanan Bawah */}
      <rect
        x="50"
        y="46"
        width="48"
        height="30"
        rx="4"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
      />
      <line
        x1="58"
        y1="56"
        x2="78"
        y2="56"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="58"
        y1="62"
        x2="72"
        y2="62"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="58"
        y1="68"
        x2="66"
        y2="68"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="82"
        y="55"
        width="9"
        height="13"
        rx="2"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
      />

      {/* Busur Aliran Rotasi Sektor (Aksen Tipis) */}
      <path
        d="M70 18 C82 20 88 28 89 39"
        className="stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M42 70 C30 68 24 60 23 49"
        className="stroke-rose-600 dark:stroke-rose-400"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 2. Ilustrasi Analisis Fundamental & Chart (4 pilar batang + garis tren naik)
export function FundamentalArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 112 88"
      fill="none"
      className={`w-28 h-[88px] ${className}`}
      aria-hidden="true"
    >
      <line
        x1="14"
        y1="72"
        x2="98"
        y2="72"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* 4 Pilar Fundamental */}
      <rect
        x="21"
        y="54"
        width="12"
        height="18"
        rx="2"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
      />
      <rect
        x="41"
        y="40"
        width="12"
        height="32"
        rx="2"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
      />
      <rect
        x="61"
        y="47"
        width="12"
        height="25"
        rx="2"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
      />
      <rect
        x="81"
        y="34"
        width="12"
        height="38"
        rx="2"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
      />

      {/* Garis Tren Harga & Simpul (Aksen Tipis) */}
      <path
        d="M27 38 L47 23 L67 31 L87 16"
        className="stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="27"
        cy="38"
        r="3.2"
        className="fill-white dark:fill-[#0c0e13] stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="1.7"
      />
      <circle
        cx="47"
        cy="23"
        r="3.2"
        className="fill-white dark:fill-[#0c0e13] stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="1.7"
      />
      <circle
        cx="67"
        cy="31"
        r="3.2"
        className="fill-white dark:fill-[#0c0e13] stroke-rose-600 dark:stroke-rose-400"
        strokeWidth="1.7"
      />
      <circle
        cx="87"
        cy="16"
        r="3.2"
        className="fill-white dark:fill-[#0c0e13] stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="1.7"
      />
    </svg>
  );
}

// 3. Ilustrasi Stock Screener Fundamental (laporan keuangan Rp + panel saringan rasio)
export function ScreenerArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 112 88"
      fill="none"
      className={`w-28 h-[88px] ${className}`}
      aria-hidden="true"
    >
      <path
        d="M26 74 V16 C26 13.8 27.8 12 30 12 H72 C74.2 12 76 13.8 76 16 V34"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="26"
        y1="74"
        x2="58"
        y2="74"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <text
        x="35"
        y="34"
        className="fill-slate-900 dark:fill-white font-semibold"
        fontSize="15"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Rp
      </text>

      <line
        x1="36"
        y1="45"
        x2="54"
        y2="45"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="53"
        x2="50"
        y2="53"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="61"
        x2="54"
        y2="61"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <rect
        x="58"
        y="35"
        width="34"
        height="41"
        rx="4"
        className="fill-white dark:fill-[#0c0e13] stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
      />
      <rect
        x="64"
        y="41"
        width="22"
        height="7"
        rx="1.5"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.4"
      />
      <rect
        x="64"
        y="53"
        width="6"
        height="5"
        rx="1"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.3"
      />
      <rect
        x="73"
        y="53"
        width="6"
        height="5"
        rx="1"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.3"
      />
      <rect
        x="82"
        y="53"
        width="4"
        height="16"
        rx="1"
        className="stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="1.4"
      />
      <rect
        x="64"
        y="61"
        width="6"
        height="8"
        rx="1"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.3"
      />
      <rect
        x="73"
        y="61"
        width="6"
        height="8"
        rx="1"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.3"
      />
    </svg>
  );
}

// 4. Ilustrasi Watchlist Terpantau (daftar kartu terkurasi + penanda bintang fokus)
export function WatchlistArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 112 88"
      fill="none"
      className={`w-28 h-[88px] ${className}`}
      aria-hidden="true"
    >
      <rect
        x="15"
        y="24"
        width="28"
        height="40"
        rx="3.5"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
      />
      <line
        x1="21"
        y1="34"
        x2="34"
        y2="34"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="21"
        y1="42"
        x2="31"
        y2="42"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <rect
        x="69"
        y="24"
        width="28"
        height="40"
        rx="3.5"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
      />
      <line
        x1="78"
        y1="34"
        x2="91"
        y2="34"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="81"
        y1="42"
        x2="91"
        y2="42"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <rect
        x="35"
        y="14"
        width="42"
        height="58"
        rx="4"
        className="fill-white dark:fill-[#0c0e13] stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.6"
      />
      <line
        x1="44"
        y1="25"
        x2="68"
        y2="25"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M56 33 L59.4 40.2 L67.3 41.3 L61.6 46.8 L63 54.6 L56 50.9 L49 54.6 L50.4 46.8 L44.7 41.3 L52.6 40.2 Z"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <line
        x1="46"
        y1="62"
        x2="66"
        y2="62"
        className="stroke-slate-900 dark:stroke-white/90"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
