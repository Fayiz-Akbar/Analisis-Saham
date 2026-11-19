import React, { useState, useEffect } from "react";
import TradingViewChart from "./TradingViewChart";
import FundamentalPillars from "./FundamentalPillars";
import FinancialStatementsTable from "./FinancialStatementsTable";
import FundamentalGlossary from "./FundamentalGlossary";
import CompanyNewsSection from "./CompanyNewsSection";

export default function StockDetailCard({
  stockData,
  candles,
  range,
  onRangeChange,
  isDarkMode,
  isLoading,
  error,
  onRetry,
}) {
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [fundamentalData, setFundamentalData] = useState(null);

  // Sync / Fallback fetch data fundamental terverifikasi dari laporan audit resmi
  useEffect(() => {
    if (stockData?.stock?.fundamentals) {
      setFundamentalData(stockData.stock.fundamentals);
    }

    const sym = stockData?.quote?.symbol;
    if (!sym) return;

    let isMounted = true;
    fetch(`http://localhost:5000/api/stocks/${sym}/financial-history`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted || !json.success || !json.data?.annual) return;
        const annual = json.data.annual;
        if (!Array.isArray(annual) || annual.length === 0) return;

        const audit = annual[annual.length - 1];
        const auditIdx = annual.length - 1;
        const prevAudit = auditIdx > 0 ? annual[auditIdx - 1] : null;

        let revGrowth = null;
        let netGrowth = null;
        if (prevAudit?.revenue && audit?.revenue) {
          revGrowth = Number((((audit.revenue - prevAudit.revenue) / Math.abs(prevAudit.revenue)) * 100).toFixed(1));
        }
        if (prevAudit?.netIncome && audit?.netIncome) {
          netGrowth = Number((((audit.netIncome - prevAudit.netIncome) / Math.abs(prevAudit.netIncome)) * 100).toFixed(1));
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
          der: audit.der,
          eps: audit.eps !== null && audit.eps !== undefined ? audit.eps : stats.eps,
          revenueGrowth: revGrowth !== null ? revGrowth : prev?.revenueGrowth,
          netIncomeGrowth: netGrowth !== null ? netGrowth : prev?.netIncomeGrowth,
          financialPeriod: `${audit.period} Audit (Konsolidasian)`,
        }));
      })
      .catch((err) => {
        console.warn("Gagal sync financial-history di StockDetailCard:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [stockData?.quote?.symbol, stockData?.stock?.fundamentals]);

  if (isLoading) {
    return (
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4"></div>
        <div className="h-96 bg-slate-100 dark:bg-slate-800/60 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 space-y-3">
        <div className="text-base font-semibold">{error}</div>
        <p className="text-xs text-rose-500">Pastikan server backend aktif di port 5000.</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#c52838] text-white hover:bg-[#b91c1c] transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  if (!stockData || !stockData.quote) {
    return (
      <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] text-slate-500">
        Pilih saham emiten untuk memuat data analisis.
      </div>
    );
  }

  const { stock, quote, fromCache } = stockData;

  const changeVal = Number(quote.changeAmount || 0);
  const changePct = Number(quote.changePercent || 0);
  const isUp = changeVal > 0;
  const isDown = changeVal < 0;

  // Format nominal change: e.g. "+Rp 50" or "-Rp 50" or "Rp 0"
  const formattedNominal = isUp
    ? `+Rp ${Math.abs(changeVal).toLocaleString("id-ID")}`
    : isDown
    ? `-Rp ${Math.abs(changeVal).toLocaleString("id-ID")}`
    : `Rp 0`;

  // Format percentage change: e.g. "(+0,83%)" or "(-0,41%)" or "(0,00%)"
  const formattedPercent = isUp
    ? `(+${Math.abs(changePct).toFixed(2).replace(".", ",")}%)`
    : isDown
    ? `(-${Math.abs(changePct).toFixed(2).replace(".", ",")}%)`
    : `(0,00%)`;

  // Authentic colors matching user reference photos (dark pine green / crimson red)
  const changeColorClass = isUp
    ? "text-[#2fe695]"
    : isDown
    ? "text-[#f87171]"
    : "text-slate-400";

  const formatUpdateTime = (dateString) => {
    if (!dateString) return "Diperbarui -";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Diperbarui -";
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `Diperbarui ${hours}.${minutes} WIB`;
  };

  const formatMarketCap = (val) => {
    if (!val || isNaN(val)) return "-";
    const num = Number(val);
    if (Math.abs(num) >= 1e12) {
      return `Rp ${(num / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T`;
    }
    if (Math.abs(num) >= 1e9) {
      return `Rp ${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const effectiveFundamentals = fundamentalData || stock?.fundamentals;

  return (
    <div className="w-full bg-transparent p-0 border-0 shadow-none space-y-6">
      {/* ========================================================
          1. STOCK OVERVIEW HEADER
          Logo, Ticker, Nama Perusahaan, Badges, Harga Live, & Perubahan
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-850">
        {/* Kelompok Kiri: Logo, Ticker, Nama Perusahaan, & Badge Pasar (Tanpa Container Box) */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0 bg-transparent border-0 p-0">
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

          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                {quote.symbol}
              </h1>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none">
                {stock?.exchange || "IDX"}
              </span>
            </div>

            <h2 className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium truncate">
              {stock?.companyName || quote.symbol}
            </h2>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 dark:text-slate-500">
              <span>
                Sektor: <strong className="font-medium text-slate-600 dark:text-slate-300">{stock?.sector || "Financials"}</strong>
              </span>
              <span>•</span>
              <span>
                Industri: <strong className="font-medium text-slate-600 dark:text-slate-300">{stock?.industry || "Banking"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Kelompok Kanan: Harga Terkini, Perubahan Nominal & %, Waktu Pembaruan */}
        <div className="flex flex-col md:items-end justify-start md:text-right shrink-0 pt-1 md:pt-0">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums leading-none">
            Rp {Number(quote.regularMarketPrice).toLocaleString("id-ID")}
          </div>

          <div className={`flex items-center md:justify-end gap-1.5 mt-2 font-mono text-sm font-semibold tabular-nums ${changeColorClass}`}>
            <span>{formattedNominal}</span>
            <span>{formattedPercent}</span>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-sans">
            {formatUpdateTime(quote.lastUpdated)}
          </div>
        </div>
      </div>

      {/* ========================================================
          2. CANDLESTICK CHART TRADINGVIEW
          ======================================================== */}
      <div className="pt-2">
        <TradingViewChart
          symbol={quote.symbol}
          candles={candles}
          range={range}
          onRangeChange={onRangeChange}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* ========================================================
          3. RINGKASAN DATA PASAR (MARKET SNAPSHOT - 4 KARTU HORISONTAL SESUAI REFERENSI YAHOO FINANCE)
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-slate-200 dark:border-white/[0.08] text-xs">
        {/* Kartu 1: Previous Close, Open, Bid, Ask */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Previous Close</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {effectiveFundamentals?.previousClose
                ? Number(effectiveFundamentals.previousClose).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : quote.chartPreviousClose
                ? Number(quote.chartPreviousClose).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Open</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {effectiveFundamentals?.open
                ? Number(effectiveFundamentals.open).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : quote.regularMarketOpen
                ? Number(quote.regularMarketOpen).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Bid</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(effectiveFundamentals?.bid || quote.bid)
                ? `${Number(effectiveFundamentals?.bid || quote.bid).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${(effectiveFundamentals?.bidSize || quote.bidSize) ? `x ${effectiveFundamentals?.bidSize || quote.bidSize}` : "x 100"}`
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Ask</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(effectiveFundamentals?.ask || quote.ask)
                ? `${Number(effectiveFundamentals?.ask || quote.ask).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${(effectiveFundamentals?.askSize || quote.askSize) ? `x ${effectiveFundamentals?.askSize || quote.askSize}` : "x 100"}`
                : "-"}
            </span>
          </div>
        </div>

        {/* Kartu 2: Day's Range, 52 Week Range, Volume, Avg. Volume */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Day's Range</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(effectiveFundamentals?.dayLow || quote.regularMarketDayLow) && (effectiveFundamentals?.dayHigh || quote.regularMarketDayHigh)
                ? `${Number(effectiveFundamentals?.dayLow || quote.regularMarketDayLow).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ${Number(effectiveFundamentals?.dayHigh || quote.regularMarketDayHigh).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">52 Week Range</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(effectiveFundamentals?.fiftyTwoWeekLow || quote.fiftyTwoWeekLow) && (effectiveFundamentals?.fiftyTwoWeekHigh || quote.fiftyTwoWeekHigh)
                ? `${Number(effectiveFundamentals?.fiftyTwoWeekLow || quote.fiftyTwoWeekLow).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ${Number(effectiveFundamentals?.fiftyTwoWeekHigh || quote.fiftyTwoWeekHigh).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Volume</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(effectiveFundamentals?.volume || quote.regularMarketVolume)
                ? Number(effectiveFundamentals?.volume || quote.regularMarketVolume).toLocaleString("id-ID")
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Avg. Volume</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(effectiveFundamentals?.averageVolume || quote.averageVolume)
                ? Number(effectiveFundamentals?.averageVolume || quote.averageVolume).toLocaleString("id-ID")
                : "-"}
            </span>
          </div>
        </div>

        {/* Kartu 3: Market Cap, Beta, PE Ratio, EPS */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Market Cap (intraday)</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {formatMarketCap(effectiveFundamentals?.marketCap || quote.marketCap)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Beta (5Y Monthly)</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(effectiveFundamentals?.beta !== null && effectiveFundamentals?.beta !== undefined)
                ? Number(effectiveFundamentals.beta).toFixed(2)
                : quote.beta !== null && quote.beta !== undefined
                ? Number(quote.beta).toFixed(2)
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">PE Ratio (TTM)</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(effectiveFundamentals?.peRatio !== null && effectiveFundamentals?.peRatio !== undefined)
                ? Number(effectiveFundamentals.peRatio).toFixed(2)
                : quote.peRatio !== null && quote.peRatio !== undefined
                ? Number(quote.peRatio).toFixed(2)
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">EPS (TTM)</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(() => {
                const isForeign = effectiveFundamentals?.financialCurrency === "USD";
                const epsVal = (effectiveFundamentals?.eps !== null && effectiveFundamentals?.eps !== undefined)
                  ? effectiveFundamentals.eps
                  : quote.eps;
                if (epsVal === null || epsVal === undefined) return "-";
                if (isForeign) {
                  return `$ ${Number(epsVal).toFixed(4)}`;
                }
                return Number(epsVal).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              })()}
            </span>
          </div>
        </div>

        {/* Kartu 4: Earnings Date, Forward Dividend & Yield, Ex-Dividend Date, 1y Target Est */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Earnings Date</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 truncate ml-2 text-right">
              {effectiveFundamentals?.earningsDate || quote.earningsDate || "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Forward Dividend & Yield</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(() => {
                const dy = effectiveFundamentals?.dividendYield !== null && effectiveFundamentals?.dividendYield !== undefined
                  ? effectiveFundamentals.dividendYield
                  : quote.dividendYield;
                const dr = effectiveFundamentals?.dividendRate !== null && effectiveFundamentals?.dividendRate !== undefined
                  ? effectiveFundamentals.dividendRate
                  : quote.dividendRate;
                if (!dy || Number(dy) <= 0) return "--";
                return `${dr ? `${Number(dr).toLocaleString("id-ID")} ` : ""}(${Number(dy).toFixed(2)}%)`;
              })()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">Ex-Dividend Date</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 truncate ml-2 text-right">
              {effectiveFundamentals?.exDividendDate || quote.exDividendDate || "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-normal">1y Target Est</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-right">
              {(effectiveFundamentals?.targetMeanPrice || quote.targetMeanPrice)
                ? Number(effectiveFundamentals?.targetMeanPrice || quote.targetMeanPrice).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "--"}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. SUB-TAB NAVIGASI MODUL ANALISIS MENDALAM
          Pills minimal tanpa ikon: Semua, 4 Pilar, Laporan Keuangan, Kamus, Berita
          ======================================================== */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-850 flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            activeSubTab === "all"
              ? "bg-white text-slate-950 dark:bg-white dark:text-slate-950 border-transparent font-bold"
              : "bg-slate-100 dark:bg-[#0c0e14] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          Semua Analisis
        </button>

        <button
          onClick={() => setActiveSubTab("pillars")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            activeSubTab === "pillars"
              ? "bg-white text-slate-950 dark:bg-white dark:text-slate-950 border-transparent font-bold"
              : "bg-slate-100 dark:bg-[#0c0e14] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          4 Pilar Rasio Fundamental
        </button>

        <button
          onClick={() => setActiveSubTab("statements")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            activeSubTab === "statements"
              ? "bg-white text-slate-950 dark:bg-white dark:text-slate-950 border-transparent font-bold"
              : "bg-slate-100 dark:bg-[#0c0e14] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          Ringkasan Laporan Keuangan
        </button>

        <button
          onClick={() => setActiveSubTab("glossary")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            activeSubTab === "glossary"
              ? "bg-white text-slate-950 dark:bg-white dark:text-slate-950 border-transparent font-bold"
              : "bg-slate-100 dark:bg-[#0c0e14] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          Kamus Indikator Fundamental
        </button>

        <button
          onClick={() => setActiveSubTab("news")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            activeSubTab === "news"
              ? "bg-white text-slate-950 dark:bg-white dark:text-slate-950 border-transparent font-bold"
              : "bg-slate-100 dark:bg-[#0c0e14] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          Berita & Sentimen Pasar
        </button>
      </div>

      {/* ========================================================
          5. KONTEN MODUL ANALISIS DETAIL
          ======================================================== */}
      <div className="space-y-8 pt-2">
        {/* Pilar 1-4 Rasio Fundamental */}
        {(activeSubTab === "all" || activeSubTab === "pillars") && (
          <section id="fundamental-pillars">
            <FundamentalPillars
              fundamentals={effectiveFundamentals}
              stock={stock}
              quote={quote}
            />
          </section>
        )}

        {/* Ringkasan Laporan Keuangan */}
        {(activeSubTab === "all" || activeSubTab === "statements") && (
          <section id="financial-statements">
            <FinancialStatementsTable
              fundamentals={effectiveFundamentals}
              stock={stock}
              quote={quote}
            />
          </section>
        )}

        {/* Kamus Indikator Fundamental */}
        {(activeSubTab === "all" || activeSubTab === "glossary") && (
          <section id="fundamental-glossary">
            <FundamentalGlossary
              fundamentals={effectiveFundamentals}
              symbol={quote.symbol}
            />
          </section>
        )}

        {/* Berita Terkait Emiten & Klasifikasi Sentimen */}
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
