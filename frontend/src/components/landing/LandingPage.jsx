import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Calculator,
  Filter,
  GitCompareArrows,
  Globe2,
  LineChart,
  Search,
  Star,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Data cadangan IDX80 riil apabila server backend belum aktif saat membuka landing page
const FALLBACK_STOCKS = [
  {
    symbol: "BBCA",
    companyName: "Bank Central Asia Tbk",
    sector: "Financials",
    price: 9450,
    changePercent: 1.61,
    sparkline: [9175, 9225, 9300, 9350, 9450],
  },
  {
    symbol: "BBRI",
    companyName: "Bank Rakyat Indonesia Tbk",
    sector: "Financials",
    price: 4280,
    changePercent: 0.94,
    sparkline: [4180, 4210, 4200, 4240, 4280],
  },
  {
    symbol: "BMRI",
    companyName: "Bank Mandiri (Persero) Tbk",
    sector: "Financials",
    price: 5950,
    changePercent: 1.28,
    sparkline: [5800, 5850, 5825, 5900, 5950],
  },
  {
    symbol: "TLKM",
    companyName: "Telkom Indonesia (Persero) Tbk",
    sector: "Infrastructures",
    price: 2890,
    changePercent: -0.69,
    sparkline: [2940, 2930, 2910, 2900, 2890],
  },
  {
    symbol: "ASII",
    companyName: "Astra International Tbk",
    sector: "Industrials",
    price: 5025,
    changePercent: 0.5,
    sparkline: [4960, 4980, 4975, 5000, 5025],
  },
  {
    symbol: "AMRT",
    companyName: "Sumber Alfaria Trijaya Tbk",
    sector: "Consumer Non-Cyclicals",
    price: 2740,
    changePercent: -0.36,
    sparkline: [2790, 2770, 2760, 2750, 2740],
  },
  {
    symbol: "ADRO",
    companyName: "Alamtri Resources Indonesia Tbk",
    sector: "Energy",
    price: 2340,
    changePercent: 2.18,
    sparkline: [2240, 2260, 2290, 2310, 2340],
  },
  {
    symbol: "ICBP",
    companyName: "Indofood CBP Sukses Makmur Tbk",
    sector: "Consumer Non-Cyclicals",
    price: 11250,
    changePercent: 0.89,
    sparkline: [11050, 11100, 11125, 11200, 11250],
  },
];

const HERO_SYMBOLS = ["BBCA", "BBRI", "BMRI", "TLKM", "ASII", "AMRT"];

const SECTOR_FILTERS = [
  { id: "ALL", label: "Semua" },
  { id: "BANK", label: "Perbankan" },
  { id: "ENERGY", label: "Energi" },
  { id: "CONSUMER", label: "Konsumer" },
  { id: "INFRA_TECH", label: "Infra & Teknologi" },
];

const CORE_MODULES = [
  {
    id: "dashboard",
    tag: "Aktif",
    title: "Dashboard Pasar IDX80",
    summary:
      "Ringkasan 80 konstituen terlikuid BEI, top movers harian, folder sektor, dan agregator berita pasar dalam satu tampilan.",
    highlights: ["80 emiten IDX80 real-time", "Top Gainers & Losers", "Katalog sektor BEI"],
    icon: BarChart3,
    cta: "Buka Dashboard",
  },
  {
    id: "stock-detail",
    symbol: "BBCA",
    tag: "Aktif",
    title: "Analisis Fundamental & Chart",
    summary:
      "Bedah emiten secara utuh: candlestick interaktif TradingView, profil bisnis, 4 pilar fundamental, laporan keuangan historis, hingga glosarium indikator.",
    highlights: ["4 Pilar Fundamental", "Laporan Keuangan & Rasio", "Profil & Berita Emiten"],
    icon: LineChart,
    cta: "Lihat Contoh BBCA",
  },
  {
    id: "screener",
    tag: "Aktif",
    title: "Stock Screener Fundamental",
    summary:
      "Saring peluang investasi menggunakan filter PER, PBV, ROE, ROA, Net Margin, DER, Revenue, Net Income, EPS, dan preset kombinasi cepat.",
    highlights: ["Preset Valuasi & Profitabilitas", "Filter kustom fleksibel", "Seleksi banding multi-saham"],
    icon: Filter,
    cta: "Buka Screener",
  },
  {
    id: "watchlist",
    tag: "Aktif",
    title: "Watchlist Terpantau",
    summary:
      "Simpan emiten pilihan ke daftar pantauan pribadi untuk melacak pergerakan harga, sparkline mingguan, dan akses cepat ke halaman analisis.",
    highlights: ["Sparkline performa 5 hari", "Sinkronisasi akun investor", "Akses 1 klik ke detail saham"],
    icon: Star,
    cta: "Buka Watchlist",
  },
];

const ECOSYSTEM_MODULES = [
  {
    id: "komparasi",
    status: "Roadmap",
    title: "Stock Comparison",
    description:
      "Bandingkan 2 hingga 4 saham kompetitor dalam satu industri secara berdampingan untuk melihat keunggulan valuasi dan margin.",
    icon: GitCompareArrows,
  },
  {
    id: "market",
    status: "Roadmap",
    title: "Market & Sentiment",
    description:
      "Pantauan indeks IHSG, dinamika komoditas, bursa global, dan ringkasan sentimen berita pasar modal Indonesia.",
    icon: Globe2,
  },
  {
    id: "portofolio",
    status: "Roadmap",
    title: "Portfolio & Investment Health",
    description:
      "Pencatatan transaksi berbasis lot BEI, weighted average price, kalkulasi P/L, dan audit risiko konsentrasi sektor.",
    icon: Briefcase,
  },
  {
    id: "simulasi",
    status: "Roadmap",
    title: "Simulasi DCA Berbasis Lot",
    description:
      "Uji strategi investasi rutin (Dollar Cost Averaging) memakai data historis aktual dan aturan kelipatan 100 lembar saham.",
    icon: Calculator,
  },
];

const WORKFLOW_STEPS = [
  { step: "01", title: "Learn", desc: "Pelajari dasar pasar modal dan arti rasio lewat kurikulum serta kuis." },
  { step: "02", title: "Search & Screen", desc: "Temukan emiten BEI lewat pencarian cepat atau filter fundamental." },
  { step: "03", title: "Analyze", desc: "Evaluasi chart, profil bisnis, laporan keuangan, dan 4 pilar fundamental." },
  { step: "04", title: "Compare & Simulate", desc: "Bandingkan kompetitor, pantau watchlist, dan uji rencana investasi rutin." },
];

function formatRupiah(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "Rp -";
  return `Rp ${Math.round(num).toLocaleString("id-ID")}`;
}

function formatPriceNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "-";
  return Math.round(num).toLocaleString("id-ID");
}

function formatPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.00%";
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

function StockLogo({ symbol, logoUrl, size = "md", shape = "rounded" }) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl || `https://assets.stockbit.com/logos/companies/${symbol}.png`;
  const dims = size === "sm" ? "w-9 h-9 text-[11px]" : "w-10 h-10 text-xs";
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";

  if (failed) {
    return (
      <div
        className={`${dims} ${radius} bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold flex items-center justify-center shrink-0 tracking-tight`}
      >
        {String(symbol || "").slice(0, 4)}
      </div>
    );
  }

  return (
    <div
      className={`${dims} ${radius} bg-white border border-slate-200/80 dark:border-white/10 p-1.5 flex items-center justify-center shrink-0 overflow-hidden`}
    >
      <img
        src={src}
        alt={`Logo ${symbol}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

function MiniSparkline({ values, isUp }) {
  const series = Array.isArray(values) && values.length >= 2 ? values : [100, 100];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const w = 92;
  const h = 30;
  const points = series
    .map((v, idx) => {
      const x = (idx / (series.length - 1)) * w;
      const y = h - 3 - ((v - min) / range) * (h - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={isUp ? "#059669" : "#e11d48"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function LandingPage({
  onNavigateTab,
  onSelectStock,
  onOpenSearch,
  darkMode,
  toggleDarkMode,
}) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [stocks, setStocks] = useState(FALLBACK_STOCKS);
  const [activeSector, setActiveSector] = useState("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ambil harga saham riil IDX80 dari backend agar kartu menampilkan emiten & harga aktual
  useEffect(() => {
    let isMounted = true;

    async function loadLiveStocks() {
      try {
        const [tapeRes, catalogRes] = await Promise.all([
          fetch("http://localhost:5000/api/stocks/ticker-tape"),
          fetch("http://localhost:5000/api/stocks?limit=80"),
        ]);
        const [tapeJson, catalogJson] = await Promise.all([
          tapeRes.json(),
          catalogRes.json(),
        ]);

        if (!isMounted) return;

        const tapeMap = new Map();
        if (tapeJson?.success && Array.isArray(tapeJson.data)) {
          tapeJson.data.forEach((item) => tapeMap.set(item.symbol, item));
        }

        if (catalogJson?.success && Array.isArray(catalogJson.data) && catalogJson.data.length > 0) {
          const priority = [
            "BBCA",
            "BBRI",
            "BMRI",
            "TLKM",
            "ASII",
            "AMRT",
            "ADRO",
            "ICBP",
            "BBNI",
            "BREN",
            "KLBF",
            "GOTO",
            "PGAS",
            "UNVR",
          ];
          const normalized = catalogJson.data.map((s) => {
            const tape = tapeMap.get(s.symbol);
            const sparkline =
              Array.isArray(tape?.sparkline) && tape.sparkline.length >= 2
                ? tape.sparkline
                : [
                    Number(s.dailyPrice?.openPrice || s.dailyPrice?.closePrice || 0),
                    Number(s.dailyPrice?.closePrice || 0),
                  ];
            const price =
              Number(tape?.price) ||
              Number(s.dailyPrice?.closePrice) ||
              Number(sparkline[sparkline.length - 1]) ||
              0;
            const start = Number(sparkline[0]) || price;
            const changePercent =
              tape?.changePercent !== undefined
                ? Number(tape.changePercent)
                : start > 0
                  ? Number((((price - start) / start) * 100).toFixed(2))
                  : 0;

            return {
              symbol: s.symbol,
              companyName: s.companyName,
              sector: s.sector || "Lainnya",
              logoUrl: s.logoUrl || `https://assets.stockbit.com/logos/companies/${s.symbol}.png`,
              price,
              changePercent,
              sparkline,
            };
          });

          normalized.sort((a, b) => {
            const ia = priority.indexOf(a.symbol);
            const ib = priority.indexOf(b.symbol);
            if (ia !== -1 && ib !== -1) return ia - ib;
            if (ia !== -1) return -1;
            if (ib !== -1) return 1;
            return a.symbol.localeCompare(b.symbol);
          });

          setStocks(normalized);
        }
      } catch {
        // Tetap gunakan FALLBACK_STOCKS jika backend belum dijalankan
      }
    }

    loadLiveStocks();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const heroCards = useMemo(() => {
    const bySymbol = new Map(stocks.map((s) => [s.symbol, s]));
    const picked = HERO_SYMBOLS.map((sym) => bySymbol.get(sym)).filter(Boolean);
    return picked.length >= 4 ? picked : stocks.slice(0, 6);
  }, [stocks]);

  const filteredMarkets = useMemo(() => {
    return stocks.filter((s) => {
      if (activeSector === "ALL") return true;
      if (activeSector === "BANK") return s.sector === "Financials";
      if (activeSector === "ENERGY") return s.sector === "Energy";
      if (activeSector === "CONSUMER") return String(s.sector).includes("Consumer");
      if (activeSector === "INFRA_TECH") {
        return s.sector === "Infrastructures" || s.sector === "Technology";
      }
      return true;
    });
  }, [stocks, activeSector]);

  const gridMarkets = filteredMarkets.slice(0, 4);
  const listMarkets = filteredMarkets.slice(4, 8);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Urutan slot kartu melayang 3D isometrik mengikuti komposisi referensi:
  // [0]=Atas Kiri (belakang), [1]=Atas Kanan (belakang), [2]=Tengah Utama (paling depan),
  // [3]=Tengah Kiri (di bawah kartu utama), [4]=Tengah Kanan (terpotong halus di tepi), [5]=Bawah Kanan (depan)
  const heroCardSlots = [
    {
      pos: "top-[4%] left-[2%] sm:left-[4%] w-[165px] sm:w-[228px] z-10",
      elevated: false,
      depth: "opacity-[0.94]",
      priceSize: "text-lg sm:text-[24px]",
    },
    {
      pos: "top-[0%] right-[2%] sm:right-[6%] w-[162px] sm:w-[222px] z-10",
      elevated: false,
      depth: "opacity-[0.92]",
      priceSize: "text-lg sm:text-[23px]",
    },
    {
      pos: "top-[22%] left-[18%] sm:left-[23%] w-[195px] sm:w-[272px] z-30",
      elevated: true,
      depth: "opacity-100",
      priceSize: "text-xl sm:text-[30px]",
    },
    {
      pos: "top-[49%] left-[2%] sm:left-[6%] w-[178px] sm:w-[248px] z-20",
      elevated: false,
      depth: "opacity-[0.96]",
      priceSize: "text-lg sm:text-[26px]",
    },
    {
      pos: "top-[38%] -right-[8%] sm:-right-[5%] w-[175px] sm:w-[235px] z-10",
      elevated: false,
      depth: "opacity-[0.92]",
      priceSize: "text-lg sm:text-[24px]",
    },
    {
      pos: "bottom-[4%] right-[8%] sm:right-[14%] w-[182px] sm:w-[252px] z-20",
      elevated: true,
      depth: "opacity-100",
      priceSize: "text-xl sm:text-[28px]",
    },
  ];

  const fadeUp = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#080808] text-slate-900 dark:text-[#F5F5F5] transition-colors">
      {/* ========================================================
          NAVBAR LANDING PAGE
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#F5F5F7]/90 dark:bg-[#080808]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center cursor-pointer shrink-0"
            aria-label="Investpedia Beranda"
          >
            <img
              src={darkMode ? "/investpedia-full-dark.png" : "/investpedia-full.png"}
              alt="Investpedia"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </button>

          <nav aria-label="Navigasi Landing Page" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection("pasar-idx")}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Pasar IDX80
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("fitur-utama")}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Fitur Riset
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("edukasi-ai")}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Edukasi & AI
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("ekosistem")}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Alur & Modul
            </button>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-9 h-9 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
              title="Cari Saham IDX (Ctrl+K)"
              aria-label="Cari Saham"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
              title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              aria-label="Ganti Tema"
            >
              {darkMode ? (
                <svg className="w-[18px] h-[18px] stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" strokeLinecap="round" />
                  <line x1="12" y1="21" x2="12" y2="23" strokeLinecap="round" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeLinecap="round" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeLinecap="round" />
                  <line x1="1" y1="12" x2="3" y2="12" strokeLinecap="round" />
                  <line x1="21" y1="12" x2="23" y2="12" strokeLinecap="round" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeLinecap="round" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px] stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onNavigateTab(isAdmin ? "admin" : "dashboard")}
                className="hidden sm:inline-flex h-9 px-3.5 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141414] text-xs font-semibold text-slate-900 dark:text-white items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer"
              >
                <span>{user?.name?.split(" ")[0] || "Akun"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab("login")}
                className="hidden sm:inline-flex h-9 px-3.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-black/[0.05] dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/[0.08] items-center transition-colors cursor-pointer"
              >
                Masuk
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateTab("dashboard")}
              className="hidden sm:inline-flex h-9 px-4 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>Buka Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Buka menu navigasi"
              aria-expanded={mobileMenuOpen}
              className="md:hidden w-9 h-9 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center justify-center text-slate-800 dark:text-white cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <svg
                  className="w-5 h-5 stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="9" x2="20" y2="9" />
                  <line x1="4" y1="15" x2="20" y2="15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-[1px]"
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[min(290px,82vw)] h-dvh bg-white dark:bg-[#0e1015] border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col">
            <div className="h-16 px-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <img
                src={darkMode ? "/investpedia-full-dark.png" : "/investpedia-full.png"}
                alt="Investpedia"
                className="h-6 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu"
                className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 px-3 py-4 flex flex-col gap-1 text-sm font-semibold">
              {[
                { label: "Pasar IDX80", id: "pasar-idx" },
                { label: "Fitur Riset", id: "fitur-utama" },
                { label: "Edukasi & AI", id: "edukasi-ai" },
                { label: "Alur & Modul", id: "ekosistem" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <div className="my-2 border-t border-slate-200 dark:border-white/10" />
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateTab("screener");
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                Stock Screener
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateTab("learning");
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                Learning & AI Tutor
              </button>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateTab("dashboard");
                }}
                className="w-full h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
              >
                Buka Dashboard
              </button>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateTab("login");
                  }}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-semibold text-slate-800 dark:text-white cursor-pointer"
                >
                  Masuk
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================
          SECTION 1: HERO — FLOATING IDX STOCK CARDS (INSPIRASI REFERENSI)
          ======================================================== */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-14 sm:pt-10 sm:pb-20 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Kolom Teks: Di bawah kartu pada mobile (order-2), di kiri pada desktop (lg:order-1) */}
            <motion.div
              className="order-2 lg:order-1 lg:col-span-5 space-y-5 sm:space-y-6"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Platform Riset & Literasi Pasar Modal BEI
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-[-0.03em] leading-[1.06] text-slate-950 dark:text-white">
                Analisis Saham IDX,
                <br />
                Lebih Terarah.
              </h1>

              <p className="text-base sm:text-[17px] leading-relaxed text-slate-600 dark:text-slate-300 max-w-lg">
                Pantau 80 emiten IDX80, saring rasio fundamental, pelajari laporan keuangan, dan diskusikan data pasar bersama AI berbasis fakta dalam satu ruang kerja.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab("dashboard")}
                  className="h-12 px-7 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-sm font-semibold inline-flex items-center gap-2.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span>Mulai Analisis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Kolom Visual: Di atas pada mobile (order-1), di kanan pada desktop (lg:order-2) */}
            <div className="order-1 lg:order-2 lg:col-span-7">
              <div className="relative h-[340px] sm:h-[460px] lg:h-[490px] w-full overflow-hidden rounded-[28px]">
                {/* Pencahayaan latar halus agar kartu terasa melayang di atas permukaan studio */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: darkMode
                      ? "radial-gradient(65% 60% at 50% 48%, rgba(255,255,255,0.06) 0%, rgba(8,8,8,0) 75%)"
                      : "radial-gradient(68% 62% at 50% 48%, rgba(255,255,255,0.92) 0%, rgba(235,236,240,0.55) 55%, rgba(245,245,247,0) 85%)",
                  }}
                />

                {/* Bidang 3D miring seragam (isometrik lembut) sehingga seluruh 6 kartu berada dalam satu perspektif ruang */}
                <div
                  className="relative w-full h-full"
                  style={{
                    transform: "perspective(1200px) rotateX(10deg) rotateY(-12deg) rotateZ(-8deg) scale(0.95)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {[
                    heroCards[1], // Atas Kiri (BBRI)
                    heroCards[2], // Atas Kanan (BMRI)
                    heroCards[0], // Tengah Depan Utama (BBCA)
                    heroCards[4], // Tengah Kiri (ASII)
                    heroCards[5], // Tengah Kanan (AMRT)
                    heroCards[3], // Bawah Kanan Depan (TLKM)
                  ]
                    .filter(Boolean)
                    .map((stock, idx) => {
                      const isUp = Number(stock.changePercent) >= 0;
                      const slot = heroCardSlots[idx] || heroCardSlots[0];
                      return (
                        <motion.button
                          key={stock.symbol}
                          type="button"
                          onClick={() => onSelectStock(stock.symbol)}
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.03 }}
                          transition={{
                            duration: 0.45,
                            delay: prefersReducedMotion ? 0 : idx * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className={`absolute ${slot.pos} ${slot.depth} text-left rounded-[20px] sm:rounded-[26px] p-3.5 sm:p-5 cursor-pointer transition-shadow focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white ${
                            slot.elevated
                              ? "bg-gradient-to-br from-white via-white to-[#F4F5F7] dark:from-[#1c1f29] dark:via-[#161922] dark:to-[#11131b] border border-white/90 dark:border-white/[0.14] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.24),0_12px_24px_-10px_rgba(15,23,42,0.12)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.85)]"
                              : "bg-gradient-to-br from-white/95 to-[#F1F2F5]/95 dark:from-[#161922]/95 dark:to-[#10121a]/95 border border-white/75 dark:border-white/[0.08] shadow-[0_20px_42px_-18px_rgba(15,23,42,0.16)] dark:shadow-[0_20px_42px_-18px_rgba(0,0,0,0.65)]"
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <StockLogo
                              symbol={stock.symbol}
                              logoUrl={stock.logoUrl}
                              size="sm"
                              shape="circle"
                            />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-[15px] font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">
                                {stock.symbol}
                              </p>
                              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-400 truncate mt-0.5">
                                {stock.companyName}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3.5 sm:mt-7">
                            <p
                              className={`text-[10px] sm:text-[11px] font-semibold tabular-nums ${
                                isUp
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isUp ? "↑" : "↓"} {formatPercent(stock.changePercent)}
                            </p>
                            <p className="mt-0.5 flex items-baseline gap-1 tabular-nums tracking-[-0.03em] text-slate-950 dark:text-white">
                              <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-400">
                                Rp
                              </span>
                              <span className={`${slot.priceSize} font-semibold leading-none`}>
                                {formatPriceNumber(stock.price)}
                              </span>
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                </div>

                {/* Fade halus di tepi kanan & bawah agar kartu yang melampaui tepi menyatu mulus ke latar halaman */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-l from-[#F5F5F7] dark:from-[#080808] to-transparent z-30"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#F5F5F7] dark:from-[#080808] to-transparent z-30"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: LIVE MARKETS PREVIEW (INSPIRASI LAYAR KANAN REFERENSI)
          ======================================================== */}
      <section id="pasar-idx" className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          >
            <div className="space-y-2 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Pantauan Pasar Langsung
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.025em] text-slate-950 dark:text-white">
                Saham IDX80 dalam Satu Tampilan.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-[#111319] p-1 rounded-xl border border-slate-200/80 dark:border-white/10">
              {SECTOR_FILTERS.map((f) => {
                const active = activeSector === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveSector(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Panel Markets Terstruktur: 2x2 Kartu + Sorotan AI + Daftar Saham */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kiri (7 kolom): Grid 2x2 Kartu Saham seperti referensi */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gridMarkets.map((stock) => {
                const isUp = Number(stock.changePercent) >= 0;
                return (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() => onSelectStock(stock.symbol)}
                    className="group text-left rounded-2xl bg-white dark:bg-[#111319] border border-black/[0.06] dark:border-white/[0.08] p-5 hover:border-slate-300 dark:hover:border-white/20 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.14)] transition-all cursor-pointer flex flex-col justify-between gap-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <StockLogo symbol={stock.symbol} logoUrl={stock.logoUrl} />
                        <div className="min-w-0">
                          <p className="text-base font-bold text-slate-950 dark:text-white leading-tight">
                            {stock.symbol}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {stock.companyName}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white transition-colors shrink-0" />
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p
                          className={`text-xs font-semibold tabular-nums ${
                            isUp
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isUp ? "↑" : "↓"} {formatPercent(stock.changePercent)}
                        </p>
                        <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-950 dark:text-white mt-0.5">
                          {formatRupiah(stock.price)}
                        </p>
                      </div>
                      <MiniSparkline values={stock.sparkline} isUp={isUp} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Kanan (5 kolom): Sorotan AI Context-Grounded + Daftar Emiten Tambahan */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Highlight Card (menggantikan slot banner pada referensi dengan nilai produk riil) */}
              <div className="rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 p-5 sm:p-6 flex flex-col justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">
                      Context-Grounded AI
                    </span>
                    <Bot className="w-4 h-4 opacity-80" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold leading-snug">
                    Asisten Analisis & Tutor Saham Berbasis Data Aktual
                  </h3>
                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                    Tanyakan arti PER, ROE, hingga ringkasan laporan keuangan emiten tanpa jawaban spekulatif atau rekomendasi beli-jual otomatis.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/15 dark:border-slate-950/15">
                  <span className="text-xs font-medium opacity-80">Terintegrasi di menu Learning & AI</span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab("ai")}
                    className="h-8 px-3.5 rounded-lg bg-white text-slate-950 dark:bg-slate-950 dark:text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <span>Coba AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* List Emiten Ringkas */}
              <div className="rounded-2xl bg-white dark:bg-[#111319] border border-black/[0.06] dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden flex-1">
                {(listMarkets.length > 0 ? listMarkets : stocks.slice(0, 4)).map((stock) => {
                  const isUp = Number(stock.changePercent) >= 0;
                  return (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => onSelectStock(stock.symbol)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StockLogo symbol={stock.symbol} logoUrl={stock.logoUrl} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-950 dark:text-white">
                            {stock.symbol}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {stock.companyName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold tabular-nums text-slate-950 dark:text-white">
                          {formatRupiah(stock.price)}
                        </p>
                        <p
                          className={`text-[11px] font-semibold tabular-nums ${
                            isUp
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isUp ? "↑" : "↓"} {formatPercent(stock.changePercent)}
                        </p>
                      </div>
                    </button>
                  );
                })}

                <div className="px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Menampilkan cuplikan konstituen IDX80
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab("screener")}
                    className="text-xs font-semibold text-slate-950 dark:text-white inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Lihat semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: MODUL RISET UTAMA YANG SUDAH AKTIF DI WEB
          ======================================================== */}
      <section id="fitur-utama" className="py-16 sm:py-24 bg-white dark:bg-[#0c0e13] border-t border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl space-y-3 mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Ruang Kerja Analisis
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.025em] text-slate-950 dark:text-white">
              Semua Data Fundamental di Satu Tempat.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Dirancang untuk menghilangkan riset manual yang terpecah di banyak situs—mulai dari screening rasio hingga profil bisnis dan laporan keuangan emiten.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CORE_MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl bg-[#F5F5F7] dark:bg-[#12151d] border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between gap-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1a1e29] border border-black/[0.06] dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-black/[0.06] dark:border-white/10">
                        {mod.tag}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
                        {mod.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {mod.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {mod.highlights.map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-[#181c26] text-slate-700 dark:text-slate-300 border border-black/[0.05] dark:border-white/[0.08]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        mod.symbol ? onSelectStock(mod.symbol) : onNavigateTab(mod.id)
                      }
                      className="text-sm font-semibold text-slate-950 dark:text-white inline-flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
                    >
                      <span>{mod.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 4: EDUKASI INVESTASI & AI TUTOR (DUA PROFIL INVESTOR)
          ======================================================== */}
      <section id="edukasi-ai" className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <motion.div {...fadeUp} className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Untuk Pemula & Investor Aktif
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.025em] text-slate-950 dark:text-white">
                Belajar Konsep, Langsung Praktik di Data Nyata.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Investpedia memadukan kurikulum literasi pasar modal dengan asisten AI berbasis grounding finansial sehingga setiap penjelasan merujuk pada angka aktual.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab("learning")}
                  className="h-10 px-4 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Buka Modul Learning</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab("ai")}
                  className="h-10 px-4 rounded-lg bg-white dark:bg-[#14161c] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1d2028] transition-colors cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Buka AI Assistant</span>
                </button>
              </div>
            </motion.div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white dark:bg-[#111319] border border-black/[0.06] dark:border-white/[0.08] p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Investor Pemula
                </p>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Kurikulum Terstruktur & AI Investment Tutor
                </h3>
                <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <li>Pahami istilah PER, PBV, ROE, DER lewat modul bertahap dan kuis pemahaman.</li>
                  <li>Glosarium indikator langsung di halaman detail saham tanpa perlu berpindah tab.</li>
                  <li>Penjelasan konsep investasi yang ramah pemula dengan dukungan AI Tutor.</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#111319] border border-black/[0.06] dark:border-white/[0.08] p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Investor Berpengalaman
                </p>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Efisiensi Riset & AI Financial Assistant
                </h3>
                <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <li>Screening cepat seluruh konstituen IDX80 berdasarkan kriteria valuasi dan kesehatan keuangan.</li>
                  <li>Sintesis data fundamental, profil perusahaan, dan berita emiten dalam satu alur.</li>
                  <li>Pemetaan komparasi antar-emiten dan evaluasi risiko portofolio secara terukur.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5: MODUL EKOSISTEM LENGKAP & ALUR RISET
          ======================================================== */}
      <section id="ekosistem" className="py-16 sm:py-24 bg-white dark:bg-[#0c0e13] border-t border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Modul Pengembangan Lanjutan di Navigasi Utama */}
          <div>
            <motion.div {...fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Cakupan Platform Lengkap
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-950 dark:text-white">
                  Modul Pendukung Keputusan Investasi.
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Seluruh modul di bawah sudah terdaftar dalam arsitektur navigasi Investpedia dan dirilis bertahap.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ECOSYSTEM_MODULES.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigateTab(item.id)}
                    className="text-left rounded-2xl bg-[#F5F5F7] dark:bg-[#12151d] border border-black/[0.06] dark:border-white/[0.08] p-5 hover:border-slate-300 dark:hover:border-white/20 transition-colors cursor-pointer flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Icon className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-black/[0.05] dark:border-white/10">
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
                      <span>Lihat halaman</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alur Kerja Riset (PRD Section 5) */}
          <div className="pt-12 border-t border-slate-200/80 dark:border-white/[0.08]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-6">
              Alur Riset Terstruktur
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WORKFLOW_STEPS.map((w) => (
                <div key={w.step} className="space-y-2">
                  <p className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500">
                    {w.step}
                  </p>
                  <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                    {w.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {w.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 6: CLOSING CTA & FOOTER
          ======================================================== */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.025em]">
                Siap Membedah Emiten Pilihan Anda?
              </h2>
              <p className="text-sm sm:text-base opacity-80 leading-relaxed">
                Akses dashboard pasar IDX80, saring saham potensial lewat screener fundamental, atau mulai belajar membaca laporan keuangan sekarang.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateTab("dashboard")}
                className="h-12 px-6 rounded-full bg-white text-slate-950 dark:bg-slate-950 dark:text-white text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab("login")}
                className="h-12 px-5 rounded-full border border-white/25 dark:border-slate-950/25 text-sm font-semibold hover:bg-white/10 dark:hover:bg-slate-950/10 transition-colors cursor-pointer"
              >
                {isAuthenticated ? "Kelola Akun" : "Masuk / Daftar"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 dark:border-white/[0.08] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <img
              src={darkMode ? "/investpedia-full-dark.png" : "/investpedia-full.png"}
              alt="Investpedia"
              className="h-6 w-auto object-contain"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Investpedia adalah platform edukasi dan analisis fundamental saham Bursa Efek Indonesia (IDX). Sistem ini bukan broker, tidak mengeksekusi transaksi, dan tidak memberikan rekomendasi beli/jual otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "screener", label: "Stock Screener" },
              { id: "watchlist", label: "Watchlist" },
              { id: "learning", label: "Learning" },
              { id: "ai", label: "AI Assistant" },
              { id: "komparasi", label: "Comparison" },
              { id: "portofolio", label: "Portfolio" },
              { id: "simulasi", label: "Simulasi" },
            ].map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigateTab(link.id)}
                className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
