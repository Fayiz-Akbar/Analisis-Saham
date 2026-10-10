import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Search,
  SlidersHorizontal,
  Bot,
  Newspaper,
  Moon,
  Sun,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  CheckCircle2,
  User,
  Zap,
  Building2,
  RefreshCw,
} from "lucide-react";
import SearchBar from "./components/SearchBar";
import StockDetailCard from "./components/StockDetailCard";
import logoImg from "./assets/investai_logo.jpg";

const POPULAR_IDX80 = ["BBCA", "BBRI", "BMRI", "TLKM", "ASII", "AMMN", "BREN", "GOTO", "ADRO", "ICBP"];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [investorProfile, setInvestorProfile] = useState("BEGINNER"); // BEGINNER | EXPERIENCED
  const [selectedSymbol, setSelectedSymbol] = useState("BBCA");
  const [stockData, setStockData] = useState(null);
  const [candles, setCandles] = useState([]);
  const [timeRange, setTimeRange] = useState("1y");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Check Backend Connection
  const checkHealth = () => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") setBackendStatus("connected");
        else setBackendStatus("disconnected");
      })
      .catch(() => setBackendStatus("offline"));
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Fetch Quote & Candles saat symbol atau timeRange berubah
  useEffect(() => {
    let isMounted = true;

    async function loadStockData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        // 1. Ambil Quote Terkini
        const quoteRes = await fetch(`http://localhost:5000/api/stocks/${selectedSymbol}/quote`);
        const quoteJson = await quoteRes.json();

        // 2. Ambil Candlestick Historis (TradingView)
        const histRes = await fetch(`http://localhost:5000/api/stocks/${selectedSymbol}/history?range=${timeRange}`);
        const histJson = await histRes.json();

        if (isMounted) {
          if (quoteJson.success) {
            setStockData(quoteJson.data);
            setBackendStatus("connected");
          } else {
            setLoadError(quoteJson.message || "Gagal memuat data quote.");
          }

          if (histJson.success) {
            setCandles(histJson.data.candles || []);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data saham:", err);
        if (isMounted) {
          setLoadError("Koneksi ke backend gagal. Pastikan backend aktif.");
          setBackendStatus("offline");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStockData();

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, timeRange]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleInvestorProfile = () => {
    setInvestorProfile((prev) => (prev === "BEGINNER" ? "EXPERIENCED" : "BEGINNER"));
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      } transition-colors duration-200`}
    >
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logoImg}
              alt="InvestAI Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-md shadow-blue-500/20 border border-slate-200 dark:border-slate-800 flex-shrink-0"
            />
            <div className="truncate">
              <span className="font-extrabold text-base sm:text-lg tracking-tight block">InvestAI Analyzer</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1 block truncate">
                Indeks IDX80 • Sub-sistem 1 Fayiz
              </span>
            </div>
          </div>

          {/* Search Bar Komponen */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar onSelectStock={setSelectedSymbol} selectedSymbol={selectedSymbol} />
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Investor Profile Toggle (Pemula vs Berpengalaman) */}
            <button
              onClick={toggleInvestorProfile}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                investorProfile === "BEGINNER"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                  : "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
              }`}
              title="Klik untuk mengubah profil analisis AI"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profil: {investorProfile === "BEGINNER" ? "Pemula" : "Berpengalaman"}</span>
            </button>

            {/* Backend Connectivity Status */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "connected"
                    ? "bg-emerald-500 animate-pulse"
                    : backendStatus === "checking"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                {backendStatus === "connected" ? "Backend Aktif" : "Backend Offline"}
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ganti Tema Gelap / Terang"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar View */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar onSelectStock={setSelectedSymbol} selectedSymbol={selectedSymbol} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Popular Stocks Quick Bar */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap pl-1">Pilihan Cepat:</span>
          {POPULAR_IDX80.map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all whitespace-nowrap shadow-xs ${
                selectedSymbol === sym
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400"
              }`}
            >
              <img
                src={`https://assets.stockbit.com/logos/companies/${sym}.png`}
                alt={sym}
                className="w-3.5 h-3.5 rounded-full object-contain bg-white flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span>{sym}</span>
            </button>
          ))}
        </section>

        {/* Main Stock Detail & TradingView Chart Component */}
        <section>
          <StockDetailCard
            stockData={stockData}
            candles={candles}
            range={timeRange}
            onRangeChange={setTimeRange}
            isDarkMode={darkMode}
            isLoading={isLoading}
            error={loadError}
            onRetry={() => {
              checkHealth();
              setSelectedSymbol((prev) => prev);
            }}
          />
        </section>

        {/* Features & Deliverables Status Grid */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Status Modul Sub-sistem 1 (Fayiz)</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              Sprint 1 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Sprint 1 Card */}
            <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/60 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Sprint 1 • Berjalan</span>
              <h3 className="font-bold text-sm">IDX80 & TradingView Chart</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pencarian 80 saham IDX80, quote harga harian, candlestick OHLCV TradingView, dan PostgreSQL Caching.
              </p>
            </div>

            {/* Sprint 2 Card */}
            <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2 opacity-80">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sprint 2 • Terencana</span>
              <h3 className="font-bold text-sm">Stock Screener & Komparasi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Filter multi-indikator 4 pilar fundamental (PER, PBV, ROE, DER) dan visualisasi komparasi 2–4 emiten.
              </p>
            </div>

            {/* Sprint 3 Card */}
            <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2 opacity-80">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Newspaper className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sprint 3 • Terencana</span>
              <h3 className="font-bold text-sm">Sentimen Berita & Pasar Global</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Label sentimen otomatis [Positif]/[Netral]/[Negatif], indeks bursa global, serta komoditas acuan.
              </p>
            </div>

            {/* Sprint 4 Card */}
            <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2 opacity-80">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sprint 4 • Terencana</span>
              <h3 className="font-bold text-sm">Context-Grounded Gemini AI</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Asisten finansial anti-halusinasi dengan gaya bahasa Pemula vs Berpengalaman dan evaluasi skripsi.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
