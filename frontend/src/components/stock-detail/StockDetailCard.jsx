import React, { useState, useEffect } from "react";
import TradingViewChart from "./TradingViewChart";
import FundamentalPillars from "./FundamentalPillars";
import FinancialStatementsTable from "./FinancialStatementsTable";
import FundamentalGlossary from "./FundamentalGlossary";
import CompanyNewsSection from "./CompanyNewsSection";
import idxCircleImg from "../../assets/idx-circle.png";

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

  // Sync / Fallback fetch data fundamental
  useEffect(() => {
    if (stockData?.stock?.fundamentals) {
      setFundamentalData(stockData.stock.fundamentals);
    } else if (stockData?.quote?.symbol) {
      fetch(`http://localhost:5000/api/stocks/${stockData.quote.symbol}/fundamentals`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.fundamentals) {
            setFundamentalData(json.data.fundamentals);
          }
        })
        .catch((err) => {
          console.warn("Gagal fetch fallback fundamental:", err);
        });
    }
  }, [stockData]);

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
        Pilih saham konstituen IDX80 untuk memuat data analisis.
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
    <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080808] space-y-6">
      {/* ========================================================
          1. STOCK OVERVIEW HEADER
          Logo, Ticker, Nama Perusahaan, Badges, Harga Live, & Perubahan
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-850">
        {/* Kelompok Kiri: Logo, Ticker, Nama Perusahaan, & Badge Pasar */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-white dark:bg-[#0c0e14] p-2 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center flex-shrink-0">
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                {quote.symbol}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>{stock?.exchange || "IDX"}</span>
                <img src={idxCircleImg} alt="IDX" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
              </span>
              {stock?.isIdx80 && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-[#0e4429] bg-[#062c19] text-[#2fe695]">
                  Konstituen IDX80
                </span>
              )}
              {fromCache ? (
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 text-slate-400"
                  title="Data disajikan instan dari cache PostgreSQL"
                >
                  PostgreSQL Cache
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 text-slate-400">
                  Live Feed
                </span>
              )}
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
          3. RINGKASAN DATA PASAR (MARKET SNAPSHOT)
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-slate-200 dark:border-slate-850 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c0e14] border border-slate-200/60 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Penutupan Kemarin</span>
          <span className="font-mono font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
            Rp {Number(quote.chartPreviousClose).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c0e14] border border-slate-200/60 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Rentang Hari Ini</span>
          <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            {quote.regularMarketDayLow ? `Rp ${Number(quote.regularMarketDayLow).toLocaleString("id-ID")}` : "-"} -{" "}
            {quote.regularMarketDayHigh ? `Rp ${Number(quote.regularMarketDayHigh).toLocaleString("id-ID")}` : "-"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c0e14] border border-slate-200/60 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Rentang 52 Minggu</span>
          <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            {quote.fiftyTwoWeekLow ? `Rp ${Number(quote.fiftyTwoWeekLow).toLocaleString("id-ID")}` : "-"} -{" "}
            {quote.fiftyTwoWeekHigh ? `Rp ${Number(quote.fiftyTwoWeekHigh).toLocaleString("id-ID")}` : "-"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c0e14] border border-slate-200/60 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Volume Perdagangan</span>
          <span className="font-mono font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
            {quote.regularMarketVolume ? Number(quote.regularMarketVolume).toLocaleString("id-ID") : "-"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c0e14] border border-slate-200/60 dark:border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-slate-400 block mb-1">Kapitalisasi Pasar</span>
          <span className="font-mono font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
            {formatMarketCap(effectiveFundamentals?.marketCap)}
          </span>
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
