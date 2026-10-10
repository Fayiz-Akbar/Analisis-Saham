import React from "react";
import { TrendingUp, TrendingDown, Clock, Zap, Building, Layers, Info } from "lucide-react";
import TradingViewChart from "./TradingViewChart";

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
  if (isLoading) {
    return (
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-pulse space-y-6">
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
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
          >
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  if (!stockData || !stockData.quote) {
    return (
      <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500">
        Pilih saham konstituen IDX80 untuk memuat data analisis.
      </div>
    );
  }

  const { stock, quote, fromCache } = stockData;
  const isPositive = quote.changeAmount >= 0;

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
      {/* Header Info Saham */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs flex-shrink-0">
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
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {quote.symbol}
              </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              {stock?.exchange || "IDX"}
            </span>
            {stock?.isIdx80 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                Konstituen IDX80
              </span>
            )}
            {fromCache ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50" title="Data disajikan instan dari cache PostgreSQL">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>PostgreSQL Cache</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Live Feed</span>
              </span>
            )}
          </div>
          <h2 className="text-base text-slate-600 dark:text-slate-400 mt-1 font-medium">
            {stock?.companyName || quote.symbol}
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>Sektor: <strong>{stock?.sector || "Financials"}</strong></span>
            <span>•</span>
            <span>Industri: <strong>{stock?.industry || "Banking"}</strong></span>
          </div>
        </div>

        {/* Harga & Perubahan Harian */}
        <div className="text-right">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            Rp {Number(quote.regularMarketPrice).toLocaleString("id-ID")}
          </div>
          <div className="flex items-center justify-end gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isPositive
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  : "text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60"
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? "+" : ""}{quote.changeAmount} ({isPositive ? "+" : ""}{quote.changePercent}%)</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Diperbarui: {new Date(quote.lastUpdated).toLocaleTimeString("id-ID")} WIB
          </span>
        </div>
      </div>

      {/* Candlestick Chart TradingView */}
      <div className="pt-2">
        <TradingViewChart
          symbol={quote.symbol}
          candles={candles}
          range={range}
          onRangeChange={onRangeChange}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Ringkasan Metrik Data Pasar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Penutupan Kemarin</span>
          <span className="font-mono font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
            Rp {Number(quote.chartPreviousClose).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Rentang Hari Ini</span>
          <span className="font-mono font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
            {quote.regularMarketDayLow ? `Rp ${Number(quote.regularMarketDayLow).toLocaleString("id-ID")}` : "-"} -{" "}
            {quote.regularMarketDayHigh ? `Rp ${Number(quote.regularMarketDayHigh).toLocaleString("id-ID")}` : "-"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Rentang 52 Minggu</span>
          <span className="font-mono font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
            {quote.fiftyTwoWeekLow ? `Rp ${Number(quote.fiftyTwoWeekLow).toLocaleString("id-ID")}` : "-"} -{" "}
            {quote.fiftyTwoWeekHigh ? `Rp ${Number(quote.fiftyTwoWeekHigh).toLocaleString("id-ID")}` : "-"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Volume Perdagangan</span>
          <span className="font-mono font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
            {quote.regularMarketVolume ? Number(quote.regularMarketVolume).toLocaleString("id-ID") : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
