import React, { useState, useEffect, useCallback } from "react";
// Context Autentikasi & RBAC
import { AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/auth/AuthModal";

// Layout Components
import AppHeader from "./components/layout/AppHeader";
import { Idx80TickerTapeBar } from "./components/ui/stock-market-tracker-chart";

// Search Components (TradingView Style)
import SearchModal from "./components/search/SearchModal";

// Feature / View Components
import DashboardView from "./components/dashboard/DashboardView";
import StockDetailCard from "./components/stock-detail/StockDetailCard";
import StockTableView from "./components/views/StockTableView";
import WatchlistView from "./components/views/WatchlistView";
import PlaceholderView from "./components/views/PlaceholderView";
import AdminDashboardPage from "./components/admin/AdminDashboardPage";

const getInitialTabFromLocation = () => {
  if (typeof window === "undefined") return "dashboard";
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith("/admin")) return "admin";
  return "dashboard";
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTabState] = useState(getInitialTabFromLocation);
  const [tableSector, setTableSector] = useState("ALL");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("BBCA");
  const [stockData, setStockData] = useState(null);
  const [candles, setCandles] = useState([]);
  const [timeRange, setTimeRange] = useState("1y");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Sinkronisasi tab dengan URL /admin agar akses langsung http://localhost:5173/admin berfungsi mulus
  const setActiveTab = useCallback((nextTab) => {
    setActiveTabState(nextTab);
    if (typeof window !== "undefined") {
      const targetPath = nextTab === "admin" ? "/admin" : "/";
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab: nextTab }, "", targetPath);
      }
    }
  }, []);

  useEffect(() => {
    function handlePopState() {
      setActiveTabState(getInitialTabFromLocation());
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Set dark class pada root HTML saat awal mount & toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Global keyboard shortcut Cmd+K / Ctrl+K untuk membuka pencarian saham
  useEffect(() => {
    function handleGlobalShortcut(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, []);

  // Fetch Quote & Candlestick saat selectedSymbol atau timeRange berubah
  useEffect(() => {
    let isMounted = true;

    async function loadStockData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const quoteRes = await fetch(
          `http://localhost:5000/api/stocks/${selectedSymbol}/quote`
        );
        const quoteJson = await quoteRes.json();

        const histRes = await fetch(
          `http://localhost:5000/api/stocks/${selectedSymbol}/history?range=${timeRange}`
        );
        const histJson = await histRes.json();

        if (isMounted) {
          if (quoteJson.success) {
            setStockData(quoteJson.data);
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

  // Aksi memilih saham dari Search Modal atau Carousel Dashboard
  const handleSelectFromAnywhere = (symbol) => {
    setSelectedSymbol(symbol);
    setActiveTab("stock-detail");
    setShowSearchModal(false);
  };

  // Aksi membuka tabel kategori dari Glass Folder Cards
  const handleOpenCategoryTable = (sector = "ALL") => {
    setTableSector(sector);
    setActiveTab("category-table");
  };

  return (
    <AuthProvider>
      <div
        className={`min-h-screen ${
          darkMode ? "dark bg-[#080808] text-[#F5F5F5]" : "bg-slate-50 text-slate-900"
        } transition-colors duration-200 flex flex-col`}
      >
        {/* Header Utama Aplikasi Sesuai 9 Menu PRD + Pintasan Portal Admin */}
        <AppHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSearch={() => setShowSearchModal(true)}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {/* Running Ticker Tape IDX80 Lebar Penuh dari Ujung Kiri sampai Kanan Tepat di Bawah Header */}
        <Idx80TickerTapeBar className="w-full" />

        {/* Konten Halaman */}
        <main className="flex-1 max-w-[98%] mx-auto w-full px-3 sm:px-4 lg:px-6 py-6">
          {/* ========================================================
              1. DASHBOARD: Kartu Geser Saham (Carousel / Slider)
              ======================================================== */}
          {activeTab === "dashboard" && (
            <DashboardView
              onSelectStock={handleSelectFromAnywhere}
              onOpenCategoryTable={handleOpenCategoryTable}
            />
          )}

          {/* ========================================================
              2. STOCK DETAIL: Analisis Mendalam Emiten Terpilih
              ======================================================== */}
          {activeTab === "stock-detail" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    Stock Detail ({selectedSymbol})
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Halaman analisis mendalam emiten: grafik candlestick TradingView, 4 pilar rasio fundamental, dan metrik harga pasar.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    ← Kembali ke Dashboard
                  </button>
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-950 dark:bg-white dark:text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer shadow-xs"
                  >
                    Cari Saham Lain
                  </button>
                </div>
              </div>

              <StockDetailCard
                stockData={stockData}
                candles={candles}
                range={timeRange}
                onRangeChange={setTimeRange}
                isDarkMode={darkMode}
                isLoading={isLoading}
                error={loadError}
                onRetry={() => setSelectedSymbol((prev) => prev)}
              />
            </div>
          )}

          {/* ========================================================
              3. PORTAL ADMINISTRATOR (Sprint 1: feat/admin-portal-manajemen-konten)
              Autentikasi RBAC, CRUD Modul Materi 3 Level, & CRUD Bank Soal Kuis
              ======================================================== */}
          {activeTab === "admin" && (
            <AdminDashboardPage onBackToDashboard={() => setActiveTab("dashboard")} />
          )}

          {/* ========================================================
              4. STOCK TABLE VIEW / SCREENER
              ======================================================== */}
          {(activeTab === "category-table" || activeTab === "screener") && (
            <StockTableView
              initialSector={tableSector}
              onSelectStock={handleSelectFromAnywhere}
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}

          {/* ========================================================
              5. WATCHLIST VIEW
              ======================================================== */}
          {activeTab === "watchlist" && (
            <WatchlistView
              onSelectStock={handleSelectFromAnywhere}
              onBrowseCatalog={() => handleOpenCategoryTable("ALL")}
            />
          )}

          {/* ========================================================
              HALAMAN LAIN (Sprint Mendatang)
              ======================================================== */}
          {activeTab === "market" && (
            <PlaceholderView
              title="Market & Sentiment"
              description="Dasbor makroekonomi pergerakan IHSG, bursa global, komoditas, dan sentimen berita pasar akan diimplementasikan pada sprint mendatang."
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "komparasi" && (
            <PlaceholderView
              title="Stock Comparison"
              description="Komparasi multi-emiten (2–4 saham) secara side-by-side akan diimplementasikan pada sprint mendatang."
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "portofolio" && (
            <PlaceholderView
              title="Portfolio"
              description="Pelacak portofolio berbasis lot bursa, kalkulasi weighted average price, dan audit risiko akan diimplementasikan pada sprint mendatang."
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}

          {(activeTab === "simulasi" || activeTab === "dca") && (
            <PlaceholderView
              title="Simulasi"
              description="Modul simulasi investasi pasar modal (termasuk DCA Simulator mode lot realistis) akan diimplementasikan pada sprint mendatang."
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "learning" && (
            <div className="space-y-4">
              <PlaceholderView
                title="Learning & Quiz (Investor Reader — Sprint 2)"
                description="Antarmuka pembaca kurikulum 3 level untuk Investor akan diimplementasikan pada branch Sprint 2 (feat/edukasi-kurikulum-materi). Pengelolaan konten kurikulum & bank soal kuis untuk Administrator telah aktif di Portal Admin."
                onBackToDashboard={() => setActiveTab("admin")}
              />
            </div>
          )}

          {activeTab === "ai" && (
            <PlaceholderView
              title="AI Assistant"
              description="Asisten finansial anti-halusinasi Google Gemini dengan context-grounding akan diimplementasikan pada sprint mendatang."
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          )}
        </main>

        {/* Modal Login & Registrasi Investor */}
        <AuthModal onNavigateToAdmin={() => setActiveTab("admin")} />

        {/* TradingView Style Search Modal */}
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSelectStock={handleSelectFromAnywhere}
          darkMode={darkMode}
        />
      </div>
    </AuthProvider>
  );
}
