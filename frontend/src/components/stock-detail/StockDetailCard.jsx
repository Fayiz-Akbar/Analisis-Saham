import React, { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import TradingViewChart from "./TradingViewChart";
import FundamentalPillars from "./FundamentalPillars";
import FinancialStatementsTable from "./FinancialStatementsTable";
import FundamentalGlossary from "./FundamentalGlossary";
import CompanyNewsSection from "./CompanyNewsSection";

const WATCHLIST_STORAGE_KEY = "investai_watchlist_symbols";

export default function StockDetailCard({
  stockData,
  candles,
  range,
  onRangeChange,
  subTab,
  onSubTabChange,
  isDarkMode,
  isLoading,
  error,
  onRetry,
}) {
  const [localSubTab, setLocalSubTab] = useState(subTab || "all");
  const activeSubTab = subTab !== undefined ? subTab : localSubTab;
  const setActiveSubTab = (next) => {
    setLocalSubTab(next);
    if (onSubTabChange) onSubTabChange(next);
  };
  const [fundamentalData, setFundamentalData] = useState(null);
  const [financialHistory, setFinancialHistory] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ["BBCA", "BBRI", "TLKM", "ASII"];
    } catch {
      return ["BBCA", "BBRI", "TLKM", "ASII"];
    }
  });

  // Sinkronisasi Watchlist antar komponen/tab
  useEffect(() => {
    const syncWatchlist = () => {
      try {
        const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (saved) setWatchlistSymbols(JSON.parse(saved));
      } catch {
        // Abaikan kegagalan parsing localStorage
      }
    };
    window.addEventListener("watchlist-updated", syncWatchlist);
    window.addEventListener("storage", syncWatchlist);
    return () => {
      window.removeEventListener("watchlist-updated", syncWatchlist);
      window.removeEventListener("storage", syncWatchlist);
    };
  }, []);

  const fetchFinancialHistory = useCallback((sym, signalObj = { active: true }) => {
    if (!sym) return;
    setIsLoadingHistory(true);
    setHistoryError(null);

    fetch(`http://localhost:5000/api/stocks/${sym}/financial-history`)
      .then((res) => res.json())
      .then((json) => {
        if (!signalObj.active) return;
        if (!json.success || !json.data) {
          setHistoryError(json.message || "Gagal memuat riwayat laporan keuangan.");
          return;
        }

        setFinancialHistory(json.data);
        const annual = json.data.annual;
        if (!Array.isArray(annual) || annual.length === 0) return;

        const audit = annual[annual.length - 1];
        const auditIdx = annual.length - 1;
        const prevAudit = auditIdx > 0 ? annual[auditIdx - 1] : null;

        let revGrowth = null;
        let netGrowth = null;
        if (prevAudit?.revenue && audit?.revenue) {
          revGrowth = Number(
            (((audit.revenue - prevAudit.revenue) / Math.abs(prevAudit.revenue)) * 100).toFixed(1)
          );
        }
        if (prevAudit?.netIncome && audit?.netIncome) {
          netGrowth = Number(
            (((audit.netIncome - prevAudit.netIncome) / Math.abs(prevAudit.netIncome)) * 100).toFixed(1)
          );
        }

        const stats = json.data.keyStatistics || {};

        setFundamentalData((prev) => ({
          ...(prev || {}),
          ...stats,
          revenue: audit.revenue,
          netIncome: audit.netIncome,
          totalAssets: audit.totalAssets,
          totalEquity: audit.totalEquity,
          totalLiabilities: audit.totalLiabilities,
          cashEquivalents: audit.cashEquivalents,
          netProfitMargin: audit.netProfitMargin,
          roe: audit.roe,
          roa: audit.roa ?? stats.roa ?? prev?.roa ?? null,
          der: audit.der,
          eps: audit.eps !== null && audit.eps !== undefined ? audit.eps : stats.eps,
          epsTtm: stats.eps ?? json.data.ttm?.eps ?? prev?.epsTtm ?? null,
          revenueGrowth: revGrowth !== null ? revGrowth : prev?.revenueGrowth,
          netIncomeGrowth: netGrowth !== null ? netGrowth : prev?.netIncomeGrowth,
          financialPeriod: `${audit.period} Audit (Konsolidasian)`,
        }));
      })
      .catch((err) => {
        if (!signalObj.active) return;
        console.warn("Gagal sync financial-history di StockDetailCard:", err);
        setHistoryError("Tidak dapat terhubung ke layanan laporan keuangan.");
      })
      .finally(() => {
        if (signalObj.active) setIsLoadingHistory(false);
      });
  }, []);

  // Sync tunggal data fundamental & histori laporan keuangan resmi
  useEffect(() => {
    if (stockData?.stock?.fundamentals) {
      setFundamentalData(stockData.stock.fundamentals);
    } else {
      setFundamentalData(null);
    }
    setFinancialHistory(null);

    const sym = stockData?.quote?.symbol;
    if (!sym) return;

    const signalObj = { active: true };
    fetchFinancialHistory(sym, signalObj);

    return () => {
      signalObj.active = false;
    };
  }, [stockData?.quote?.symbol, stockData?.stock?.fundamentals, fetchFinancialHistory]);

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] animate-pulse space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-md w-28" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-48" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-36 ml-auto" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24 ml-auto" />
          </div>
        </div>
        <div className="h-[420px] bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 space-y-3">
        <div className="text-base font-semibold">{error}</div>
        <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
          Pastikan server backend aktif di port 5000 dan emiten berstatus aktif di bursa.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#c52838] text-white hover:bg-[#b91c1c] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
          >
            Muat Ulang Data
          </button>
        )}
      </div>
    );
  }

  if (!stockData || !stockData.quote) {
    return (
      <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] text-slate-500 text-sm">
        Pilih saham emiten untuk memuat data analisis.
      </div>
    );
  }

  const { stock, quote } = stockData;
  const isWatched = watchlistSymbols.includes(quote.symbol);

  const handleToggleWatchlist = () => {
    setWatchlistSymbols((prev) => {
      const updated = prev.includes(quote.symbol)
        ? prev.filter((s) => s !== quote.symbol)
        : [...prev, quote.symbol];
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("watchlist-updated"));
      } catch (err) {
        console.warn("Gagal menyimpan watchlist:", err);
      }
      return updated;
    });
  };

  const changeVal = Number(quote.changeAmount || 0);
  const changePct = Number(quote.changePercent || 0);
  const isUp = changeVal > 0;
  const isDown = changeVal < 0;

  const formattedNominal = isUp
    ? `+Rp ${Math.abs(changeVal).toLocaleString("id-ID")}`
    : isDown
    ? `-Rp ${Math.abs(changeVal).toLocaleString("id-ID")}`
    : "Rp 0";

  const formattedPercent = isUp
    ? `+${Math.abs(changePct).toFixed(2).replace(".", ",")}%`
    : isDown
    ? `-${Math.abs(changePct).toFixed(2).replace(".", ",")}%`
    : "0,00%";

  const changeColorClass = isUp
    ? "text-emerald-600 dark:text-[#2fe695]"
    : isDown
    ? "text-rose-600 dark:text-[#f87171]"
    : "text-slate-500 dark:text-slate-400";

  const formatUpdateTime = (dateString) => {
    if (!dateString) return "Pembaruan terakhir -";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Pembaruan terakhir -";
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `Diperbarui ${hours}.${minutes} WIB`;
  };

  const formatMarketCap = (val) => {
    if (!val || isNaN(val)) return "-";
    const num = Number(val);
    if (Math.abs(num) >= 1e12) {
      return `Rp ${(num / 1e12).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} T`;
    }
    if (Math.abs(num) >= 1e9) {
      return `Rp ${(num / 1e9).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} M`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const effectiveFundamentals = fundamentalData || stock?.fundamentals;

  const SUB_TABS = [
    { id: "all", label: "Semua Analisis" },
    { id: "pillars", label: "4 Pilar Fundamental" },
    { id: "statements", label: "Laporan Keuangan" },
    { id: "glossary", label: "Panduan Indikator" },
    { id: "news", label: "Berita Emiten" },
  ];

  return (
    <div className="w-full bg-transparent p-0 border-0 shadow-none space-y-6">
      {/* ========================================================
          1. STOCK OVERVIEW HEADER
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pb-5 border-b border-slate-200 dark:border-white/[0.08]">
        {/* Kelompok Kiri: Logo, Ticker, Nama Perusahaan, Sektor */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-slate-200 dark:border-white/10 p-1.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={stock?.logoUrl || `https://assets.stockbit.com/logos/companies/${quote.symbol}.png`}
              alt={quote.symbol}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerText = quote.symbol;
              }}
            />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                {quote.symbol}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] select-none">
                {stock?.exchange || "IDX"}
              </span>
              <button
                type="button"
                onClick={handleToggleWatchlist}
                aria-pressed={isWatched}
                title={isWatched ? "Hapus dari Watchlist" : "Simpan ke Watchlist"}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  isWatched
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                    : "bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.08]"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    isWatched ? "fill-amber-400 text-amber-400" : "text-slate-400"
                  }`}
                  aria-hidden="true"
                />
                <span>{isWatched ? "Di Watchlist" : "Watchlist"}</span>
              </button>
            </div>

            <h2 className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium truncate">
              {stock?.companyName || quote.symbol}
            </h2>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Sektor:{" "}
                <strong className="font-medium text-slate-700 dark:text-slate-200">
                  {stock?.sector || "-"}
                </strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span>
                Industri:{" "}
                <strong className="font-medium text-slate-700 dark:text-slate-200">
                  {stock?.industry || "-"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Kelompok Kanan: Harga Terkini, Perubahan Nominal & %, Waktu Pembaruan */}
        <div className="flex flex-col md:items-end justify-start md:text-right shrink-0">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums leading-none">
            Rp {Number(quote.regularMarketPrice).toLocaleString("id-ID")}
          </div>

          <div
            className={`inline-flex items-center md:justify-end gap-2 mt-2 font-mono text-sm font-semibold tabular-nums ${changeColorClass}`}
          >
            <span>{formattedNominal}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-xs">
              {isUp ? "▲ " : isDown ? "▼ " : ""}
              {formattedPercent}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-sans">
            {formatUpdateTime(quote.lastUpdated)}
          </div>
        </div>
      </div>

      {/* ========================================================
          2. CANDLESTICK CHART TRADINGVIEW
          ======================================================== */}
      <div>
        <TradingViewChart
          symbol={quote.symbol}
          candles={candles}
          range={range}
          onRangeChange={onRangeChange}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* ========================================================
          3. RINGKASAN DATA PASAR (MARKET SNAPSHOT - 4 KARTU TERSTRUKTUR)
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.08] text-xs">
        {/* Kartu 1: Ringkasan Perdagangan */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-2 mb-2 border-b border-slate-100 dark:border-white/[0.06]">
            Ringkasan Perdagangan
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Previous Close</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {effectiveFundamentals?.previousClose
                  ? Number(effectiveFundamentals.previousClose).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : quote.chartPreviousClose
                  ? Number(quote.chartPreviousClose).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "-"}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Open</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {effectiveFundamentals?.open
                  ? Number(effectiveFundamentals.open).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : quote.regularMarketOpen
                  ? Number(quote.regularMarketOpen).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "-"}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Bid</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {effectiveFundamentals?.bid || quote.bid
                  ? `${Number(effectiveFundamentals?.bid || quote.bid).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} ${
                      effectiveFundamentals?.bidSize || quote.bidSize
                        ? `x ${effectiveFundamentals?.bidSize || quote.bidSize}`
                        : "x 100"
                    }`
                  : "-"}
              </span>
            </div>
            <div className="pt-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Ask</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {effectiveFundamentals?.ask || quote.ask
                  ? `${Number(effectiveFundamentals?.ask || quote.ask).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} ${
                      effectiveFundamentals?.askSize || quote.askSize
                        ? `x ${effectiveFundamentals?.askSize || quote.askSize}`
                        : "x 100"
                    }`
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Kartu 2: Rentang & Likuiditas */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-2 mb-2 border-b border-slate-100 dark:border-white/[0.06]">
            Rentang & Likuiditas
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Day's Range</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {(effectiveFundamentals?.dayLow || quote.regularMarketDayLow) &&
                (effectiveFundamentals?.dayHigh || quote.regularMarketDayHigh)
                  ? `${Number(effectiveFundamentals?.dayLow || quote.regularMarketDayLow).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} - ${Number(effectiveFundamentals?.dayHigh || quote.regularMarketDayHigh).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "-"}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">52 Week Range</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {(effectiveFundamentals?.fiftyTwoWeekLow || quote.fiftyTwoWeekLow) &&
                (effectiveFundamentals?.fiftyTwoWeekHigh || quote.fiftyTwoWeekHigh)
                  ? `${Number(effectiveFundamentals?.fiftyTwoWeekLow || quote.fiftyTwoWeekLow).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} - ${Number(effectiveFundamentals?.fiftyTwoWeekHigh || quote.fiftyTwoWeekHigh).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "-"}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Volume</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {effectiveFundamentals?.volume || quote.regularMarketVolume
                  ? Number(effectiveFundamentals?.volume || quote.regularMarketVolume).toLocaleString("id-ID")
                  : "-"}
              </span>
            </div>
            <div className="pt-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Avg. Volume</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {effectiveFundamentals?.averageVolume || quote.averageVolume
                  ? Number(effectiveFundamentals?.averageVolume || quote.averageVolume).toLocaleString("id-ID")
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Kartu 3: Valuasi Pasar (TTM) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-2 mb-2 border-b border-slate-100 dark:border-white/[0.06]">
            Valuasi Pasar (TTM)
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Market Cap</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {formatMarketCap(effectiveFundamentals?.marketCap || quote.marketCap)}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Beta (5Y Monthly)</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {effectiveFundamentals?.beta !== null && effectiveFundamentals?.beta !== undefined
                  ? Number(effectiveFundamentals.beta).toFixed(2)
                  : quote.beta !== null && quote.beta !== undefined
                  ? Number(quote.beta).toFixed(2)
                  : "-"}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">PE Ratio (TTM)</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {effectiveFundamentals?.peRatio !== null && effectiveFundamentals?.peRatio !== undefined
                  ? Number(effectiveFundamentals.peRatio).toFixed(2)
                  : quote.peRatio !== null && quote.peRatio !== undefined
                  ? Number(quote.peRatio).toFixed(2)
                  : "-"}
              </span>
            </div>
            <div className="pt-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">EPS (TTM)</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {(() => {
                  const isForeign = effectiveFundamentals?.financialCurrency === "USD";
                  const epsVal =
                    effectiveFundamentals?.epsTtm !== null && effectiveFundamentals?.epsTtm !== undefined
                      ? effectiveFundamentals.epsTtm
                      : effectiveFundamentals?.eps !== null && effectiveFundamentals?.eps !== undefined
                      ? effectiveFundamentals.eps
                      : quote.eps;
                  if (epsVal === null || epsVal === undefined) return "-";
                  if (isForeign) {
                    return `$ ${Number(epsVal).toFixed(4)}`;
                  }
                  return Number(epsVal).toLocaleString("id-ID", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Kartu 4: Dividen & Proyeksi */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-2 mb-2 border-b border-slate-100 dark:border-white/[0.06]">
            Dividen & Proyeksi
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Earnings Date</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums truncate text-right">
                {effectiveFundamentals?.earningsDate || quote.earningsDate || "-"}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Forward Div & Yield</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {(() => {
                  const dy =
                    effectiveFundamentals?.dividendYield !== null &&
                    effectiveFundamentals?.dividendYield !== undefined
                      ? effectiveFundamentals.dividendYield
                      : quote.dividendYield;
                  const dr =
                    effectiveFundamentals?.dividendRate !== null &&
                    effectiveFundamentals?.dividendRate !== undefined
                      ? effectiveFundamentals.dividendRate
                      : quote.dividendRate;
                  if (!dy || Number(dy) <= 0) return "-";
                  return `${dr ? `${Number(dr).toLocaleString("id-ID")} ` : ""}(${Number(dy).toFixed(2)}%)`;
                })()}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Ex-Dividend Date</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums truncate text-right">
                {effectiveFundamentals?.exDividendDate || quote.exDividendDate || "-"}
              </span>
            </div>
            <div className="pt-1.5 flex items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">1y Target Est</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                {effectiveFundamentals?.targetMeanPrice || quote.targetMeanPrice
                  ? Number(effectiveFundamentals?.targetMeanPrice || quote.targetMeanPrice).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. SUB-TAB NAVIGASI MODUL ANALISIS MENDALAM
          ======================================================== */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div
          role="tablist"
          aria-label="Navigasi modul analisis saham"
          className="flex items-center gap-1.5 flex-wrap"
        >
          {SUB_TABS.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSubTab(tab.id)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent font-bold"
                    : "bg-slate-100 dark:bg-[#0c0e14] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.08] hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-white/[0.04] font-semibold"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] w-fit shrink-0">
          Periode: {effectiveFundamentals?.financialPeriod || "Audit Konsolidasian Terkini"}
        </div>
      </div>

      {/* ========================================================
          5. KONTEN MODUL ANALISIS DETAIL
          ======================================================== */}
      <div className="space-y-8 pt-1">
        {(activeSubTab === "all" || activeSubTab === "pillars") && (
          <section id="fundamental-pillars">
            <FundamentalPillars
              fundamentals={effectiveFundamentals}
              stock={stock}
              quote={quote}
            />
          </section>
        )}

        {(activeSubTab === "all" || activeSubTab === "statements") && (
          <section id="financial-statements">
            <FinancialStatementsTable
              fundamentals={effectiveFundamentals}
              stock={stock}
              quote={quote}
              apiHistory={financialHistory}
              isLoadingHistory={isLoadingHistory}
              historyError={historyError}
              onRetryHistory={() => fetchFinancialHistory(quote.symbol)}
            />
          </section>
        )}

        {(activeSubTab === "all" || activeSubTab === "glossary") && (
          <section id="fundamental-glossary">
            <FundamentalGlossary
              fundamentals={effectiveFundamentals}
              symbol={quote.symbol}
            />
          </section>
        )}

        {(activeSubTab === "all" || activeSubTab === "news") && (
          <section id="company-news">
            <CompanyNewsSection
              symbol={quote.symbol}
              companyName={stock?.companyName || quote.symbol}
            />
          </section>
        )}
      </div>
    </div>
  );
}
