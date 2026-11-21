import React, { Component, useState, useEffect, useCallback, useRef, Suspense, lazy } from "react";
// Context Autentikasi & RBAC
import { AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/auth/AuthModal";

// Layout Components
import AppHeader from "./components/layout/AppHeader";
import { Idx80TickerTapeBar } from "./components/ui/stock-market-tracker-chart";

// Search Components (TradingView Style)
import SearchModal from "./components/search/SearchModal";

// Feature / View Components (Dashboard dimuat langsung, view sekunder di-lazy load untuk performa bundle)
import DashboardView from "./components/dashboard/DashboardView";
const StockDetailCard = lazy(() => import("./components/stock-detail/StockDetailCard"));
const StockTableView = lazy(() => import("./components/views/StockTableView"));
const WatchlistView = lazy(() => import("./components/views/WatchlistView"));
const PlaceholderView = lazy(() => import("./components/views/PlaceholderView"));
const AdminDashboardPage = lazy(() => import("./components/admin/AdminDashboardPage"));
const AdminLoginPage = lazy(() => import("./components/admin/AdminLoginPage"));
const UserLearningPage = lazy(() => import("./components/learning/UserLearningPage"));

const THEME_STORAGE_KEY = "investpedia_theme";
const VALID_RANGES = new Set(["1d", "1mo", "3mo", "1y", "5y", "max"]);
const VALID_DETAIL_TABS = new Set(["all", "pillars", "statements", "glossary", "news"]);

const TAB_TO_PATH = {
  dashboard: "/",
  market: "/market",
  screener: "/screener",
  "category-table": "/kategori",
  komparasi: "/komparasi",
  watchlist: "/watchlist",
  portofolio: "/portofolio",
  simulasi: "/simulasi",
  dca: "/simulasi",
  learning: "/learning",
  ai: "/ai",
  admin: "/admin",
  login: "/login",
};

const getInitialDarkMode = () => {
  if (typeof window === "undefined") return true;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light") return false;
    if (saved === "dark") return true;
  } catch {
    // Abaikan kegagalan baca localStorage
  }
  return true;
};

const parseRouteFromLocation = () => {
  const fallback = {
    tab: "dashboard",
    symbol: "BBCA",
    range: "1y",
    detailSubTab: "all",
    sector: "ALL",
    compareSymbols: [],
  };
  if (typeof window === "undefined") return fallback;

  const pathname = window.location.pathname || "/";
  const lowerPath = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(window.location.search);

  // Halaman Detail Saham: /saham/BBCA atau /stock/BBCA
  const stockMatch = pathname.match(/^\/(?:saham|stock)\/([a-zA-Z0-9.-]+)/i);
  if (stockMatch) {
    const rawSymbol = decodeURIComponent(stockMatch[1]).trim().toUpperCase();
    const rawRange = params.get("range");
    const rawSubTab = params.get("tab");
    return {
      tab: "stock-detail",
      symbol: rawSymbol || "BBCA",
      range: VALID_RANGES.has(rawRange) ? rawRange : "1y",
      detailSubTab: VALID_DETAIL_TABS.has(rawSubTab) ? rawSubTab : "all",
      sector: "ALL",
      compareSymbols: [],
    };
  }

  if (lowerPath === "/admin" || lowerPath.startsWith("/admin/")) {
    return { ...fallback, tab: "admin" };
  }
  if (lowerPath === "/login") {
    return { ...fallback, tab: "login" };
  }
  if (lowerPath === "/screener" || lowerPath === "/kategori") {
    const sector = params.get("sector") || "ALL";
    return {
      ...fallback,
      tab: lowerPath === "/kategori" ? "category-table" : "screener",
      sector,
    };
  }
  if (lowerPath === "/watchlist") return { ...fallback, tab: "watchlist" };
  if (lowerPath === "/market") return { ...fallback, tab: "market" };
  if (lowerPath === "/komparasi") {
    const rawSyms = params.get("symbols") || "";
    const compareSymbols = rawSyms
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 4);
    return { ...fallback, tab: "komparasi", compareSymbols };
  }
  if (lowerPath === "/portofolio") return { ...fallback, tab: "portofolio" };
  if (lowerPath === "/simulasi") return { ...fallback, tab: "simulasi" };
  if (lowerPath === "/learning") return { ...fallback, tab: "learning" };
  if (lowerPath === "/ai") return { ...fallback, tab: "ai" };

  return fallback;
};

const buildUrlFromRoute = (route) => {
  if (route.tab === "stock-detail") {
    const sym = encodeURIComponent((route.symbol || "BBCA").toUpperCase());
    const params = new URLSearchParams();
    if (route.range && route.range !== "1y") params.set("range", route.range);
    if (route.detailSubTab && route.detailSubTab !== "all") params.set("tab", route.detailSubTab);
    const qs = params.toString();
    return `/saham/${sym}${qs ? `?${qs}` : ""}`;
  }

  if (route.tab === "screener" || route.tab === "category-table") {
    const basePath = route.tab === "category-table" ? "/kategori" : "/screener";
    const params = new URLSearchParams();
    if (route.sector && route.sector !== "ALL") params.set("sector", route.sector);
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  if (route.tab === "komparasi") {
    const syms = Array.isArray(route.compareSymbols)
      ? route.compareSymbols.filter(Boolean).slice(0, 4)
      : [];
    return syms.length > 0 ? `/komparasi?symbols=${encodeURIComponent(syms.join(","))}` : "/komparasi";
  }

  return TAB_TO_PATH[route.tab] || "/";
};

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || "Terjadi kesalahan saat menampilkan halaman." };
  }

  componentDidCatch(error, info) {
    console.error("RouteErrorBoundary menangkap error halaman:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto my-12 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#0f1014] text-center space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Gagal Memuat Halaman
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {this.state.errorMessage}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, errorMessage: "" })}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 cursor-pointer"
            >
              Coba Lagi
            </button>
            {this.props.onBackToDashboard && (
              <button
                type="button"
                onClick={this.props.onBackToDashboard}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Ke Dashboard
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [route, setRoute] = useState(parseRouteFromLocation);
  const routeRef = useRef(route);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [candles, setCandles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastRetryRef = useRef(0);
  const loadedSymbolRef = useRef(null);
  const loadedHistoryKeyRef = useRef(null);

  const activeTab = route.tab;
  const selectedSymbol = route.symbol;
  const timeRange = route.range;
  const detailSubTab = route.detailSubTab;
  const tableSector = route.sector;

  const commitRoute = useCallback((updaterOrNext, { replace = false } = {}) => {
    const current = routeRef.current;
    const nextRoute =
      typeof updaterOrNext === "function" ? updaterOrNext(current) : updaterOrNext;
    routeRef.current = nextRoute;
    setRoute(nextRoute);

    if (typeof window !== "undefined") {
      const targetUrl = buildUrlFromRoute(nextRoute);
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== targetUrl) {
        if (replace) {
          window.history.replaceState(nextRoute, "", targetUrl);
        } else {
          window.history.pushState(nextRoute, "", targetUrl);
        }
      }
    }
  }, []);

  // Sinkronisasi seluruh tab menu dengan URL agar refresh & tombol Back/Forward browser akurat
  const setActiveTab = useCallback(
    (nextTab) => {
      commitRoute((prev) => ({
        ...prev,
        tab: nextTab,
        sector: nextTab === "screener" ? "ALL" : prev.sector,
      }));
    },
    [commitRoute]
  );

  // Mendukung tombol Back / Forward browser
  useEffect(() => {
    function handlePopState() {
      const parsed = parseRouteFromLocation();
      routeRef.current = parsed;
      setRoute(parsed);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Perbarui judul tab browser sesuai halaman aktif
  useEffect(() => {
    const titleMap = {
      "stock-detail": `${selectedSymbol} - Analisis Saham | Investpedia`,
      screener: "Stock Screener | Investpedia",
      "category-table": `${tableSector && tableSector !== "ALL" ? tableSector : "Semua Sektor"} | Investpedia`,
      watchlist: "Watchlist | Investpedia",
      market: "Market & Sentiment | Investpedia",
      komparasi: "Stock Comparison | Investpedia",
      portofolio: "Portfolio | Investpedia",
      simulasi: "Simulasi | Investpedia",
      learning: "Learning | Investpedia",
      ai: "AI Assistant | Investpedia",
      admin: "Portal Admin | Investpedia",
      dashboard: "Investpedia",
    };
    document.title = titleMap[activeTab] || "Investpedia";
  }, [activeTab, selectedSymbol, tableSector]);

  // Set dark class pada root HTML & simpan preferensi tema agar bertahan saat refresh
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "dark" : "light");
    } catch {
      // Abaikan kegagalan tulis localStorage
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
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

  // Fetch Quote & Candlestick secara paralel saat emiten berubah;
  // Saat hanya timeRange berubah, hanya muat ulang histori candle tanpa me-remount seluruh halaman detail.
  useEffect(() => {
    if (activeTab !== "stock-detail") return;
    let isMounted = true;
    const isRetry = lastRetryRef.current !== retryCount;
    const isSymbolSwitch = loadedSymbolRef.current !== selectedSymbol || isRetry;
    const historyKey = `${selectedSymbol}:${timeRange}`;
    const isHistoryNeeded =
      isSymbolSwitch || loadedHistoryKeyRef.current !== historyKey;

    if (!isSymbolSwitch && !isHistoryNeeded) return;

    if (isRetry) {
      lastRetryRef.current = retryCount;
    }

    async function loadStockData() {
      if (isSymbolSwitch) {
        setIsLoading(true);
        setLoadError(null);
      }

      try {
        if (isSymbolSwitch) {
          const [quoteRes, histRes] = await Promise.all([
            fetch(`http://localhost:5000/api/stocks/${selectedSymbol}/quote`),
            fetch(`http://localhost:5000/api/stocks/${selectedSymbol}/history?range=${timeRange}`),
          ]);
          const [quoteJson, histJson] = await Promise.all([quoteRes.json(), histRes.json()]);

          if (!isMounted) return;

          if (quoteJson.success) {
            setStockData(quoteJson.data);
            loadedSymbolRef.current = selectedSymbol;
          } else {
            setLoadError(quoteJson.message || "Gagal memuat data quote.");
          }

          if (histJson.success) {
            setCandles(histJson.data.candles || []);
            loadedHistoryKeyRef.current = historyKey;
          }
        } else {
          const histRes = await fetch(
            `http://localhost:5000/api/stocks/${selectedSymbol}/history?range=${timeRange}`
          );
          const histJson = await histRes.json();
          if (isMounted && histJson.success) {
            setCandles(histJson.data.candles || []);
            loadedHistoryKeyRef.current = historyKey;
          }
        }
      } catch (err) {
        console.error("Gagal memuat data saham:", err);
        if (isMounted && isSymbolSwitch) {
          setLoadError("Koneksi ke backend gagal. Pastikan backend aktif.");
        }
      } finally {
        if (isMounted && isSymbolSwitch) {
          setIsLoading(false);
        }
      }
    }

    loadStockData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedSymbol, timeRange, retryCount]);

  // Aksi memilih saham dari Search Modal, Watchlist, Screener, atau Carousel Dashboard
  const handleSelectFromAnywhere = useCallback(
    (symbol) => {
      const normalized = String(symbol || "BBCA").trim().toUpperCase();
      setShowSearchModal(false);
      commitRoute((prev) => ({
        tab: "stock-detail",
        symbol: normalized,
        range: "1y",
        detailSubTab: "all",
        sector: prev.sector,
      }));
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    },
    [commitRoute]
  );

  // Sinkronisasi timeframe chart ke URL (replaceState agar tidak memenuhi riwayat Back)
  const handleRangeChange = useCallback(
    (nextRange) => {
      commitRoute(
        (prev) => ({
          ...prev,
          range: VALID_RANGES.has(nextRange) ? nextRange : "1y",
        }),
        { replace: true }
      );
    },
    [commitRoute]
  );

  // Sinkronisasi sub-tab modul analisis ke URL
  const handleDetailSubTabChange = useCallback(
    (nextSubTab) => {
      commitRoute(
        (prev) => ({
          ...prev,
          detailSubTab: VALID_DETAIL_TABS.has(nextSubTab) ? nextSubTab : "all",
        }),
        { replace: true }
      );
    },
    [commitRoute]
  );

  // Aksi membuka tabel kategori dari Glass Folder Cards
  const handleOpenCategoryTable = useCallback(
    (sector = "ALL") => {
      commitRoute((prev) => ({
        ...prev,
        tab: "category-table",
        sector: sector || "ALL",
      }));
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    },
    [commitRoute]
  );

  // Aksi membuka halaman Stock Comparison dengan daftar emiten terpilih dari Screener
  const handleCompareStocks = useCallback(
    (symbols = []) => {
      const cleaned = (Array.isArray(symbols) ? symbols : [])
        .map((s) => String(s || "").trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 4);
      commitRoute((prev) => ({
        ...prev,
        tab: "komparasi",
        compareSymbols: cleaned,
      }));
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    },
    [commitRoute]
  );

  return (
    <AuthProvider>
      <div
        className={`min-h-screen overflow-x-clip ${
          darkMode ? "dark bg-[#080808] text-[#F5F5F5]" : "bg-white text-slate-900"
        } transition-colors duration-200 flex flex-col`}
      >
        {activeTab === "login" ? (
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#080808] flex items-center justify-center text-xs text-slate-500">
                Memuat Halaman Login...
              </div>
            }
          >
            <AdminLoginPage
              onLoginSuccess={(loggedUser) => {
                if (loggedUser?.role === "ADMIN") {
                  setActiveTab("admin");
                } else {
                  setActiveTab("dashboard");
                }
              }}
              onBackToDashboard={() => setActiveTab("dashboard")}
            />
          </Suspense>
        ) : activeTab === "admin" ? (
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#080808] flex items-center justify-center text-xs text-slate-500">
                Memuat Portal Administrator...
              </div>
            }
          >
            <AdminDashboardPage
              onBackToDashboard={() => setActiveTab("dashboard")}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </Suspense>
        ) : (
          <>
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
            <main className="flex-1 max-w-full sm:max-w-[98%] mx-auto w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
              <RouteErrorBoundary
                key={`${activeTab}:${selectedSymbol}`}
                onBackToDashboard={() => setActiveTab("dashboard")}
              >
                <Suspense
                  fallback={
                    <div className="p-6 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] animate-pulse h-80" />
                  }
                >
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
                    <StockDetailCard
                      stockData={stockData}
                      candles={candles}
                      range={timeRange}
                      onRangeChange={handleRangeChange}
                      subTab={detailSubTab}
                      onSubTabChange={handleDetailSubTabChange}
                      isDarkMode={darkMode}
                      isLoading={isLoading}
                      error={loadError}
                      onRetry={() => {
                        loadedSymbolRef.current = null;
                        loadedHistoryKeyRef.current = null;
                        setRetryCount((prev) => prev + 1);
                      }}
                    />
                  </div>
                )}

                {/* ========================================================
                    4. STOCK TABLE VIEW / SCREENER
                    ======================================================== */}
                {(activeTab === "category-table" || activeTab === "screener") && (
                  <StockTableView
                    key={`screener-${tableSector}`}
                    initialSector={tableSector}
                    onSelectStock={handleSelectFromAnywhere}
                    onCompareStocks={handleCompareStocks}
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
                    6. STOCK COMPARISON (MASIH DALAM PENGEMBANGAN)
                    ======================================================== */}
                {activeTab === "komparasi" && (
                  <PlaceholderView
                    title="Stock Comparison"
                    description={
                      route.compareSymbols?.length > 0
                        ? `Halaman perbandingan fundamental multi-emiten (${route.compareSymbols.join(", ")}) masih dalam tahap pengembangan dan akan hadir pada pembaruan mendatang.`
                        : "Halaman perbandingan fundamental multi-emiten (2–4 saham) secara side-by-side masih dalam tahap pengembangan dan akan hadir pada pembaruan mendatang."
                    }
                    onBackToDashboard={() => setActiveTab("dashboard")}
                    secondaryLabel={route.compareSymbols?.length > 0 ? "← Kembali ke Stock Screener" : undefined}
                    onSecondaryAction={
                      route.compareSymbols?.length > 0 ? () => setActiveTab("screener") : undefined
                    }
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

                {activeTab === "learning" && <UserLearningPage defaultOpenAi={false} />}

                {activeTab === "ai" && <UserLearningPage defaultOpenAi={true} />}
                </Suspense>
              </RouteErrorBoundary>
            </main>
          </>
        )}

        {/* Modal Login & Registrasi Terpadu (Investor & Admin) */}
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
