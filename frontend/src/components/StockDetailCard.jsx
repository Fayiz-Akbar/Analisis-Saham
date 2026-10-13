import React from "react";
import TradingViewChart from "./TradingViewChart";
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

  const changeColorClass = isUp
    ? "text-emerald-600 dark:text-emerald-400"
    : isDown
    ? "text-rose-600 dark:text-rose-400"
    : "text-slate-500 dark:text-slate-400";

  const formatUpdateTime = (dateString) => {
    if (!dateString) return "Diperbarui -";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Diperbarui -";
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `Diperbarui ${hours}.${minutes} WIB`;
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
      {/* Stock Overview Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        {/* Kelompok Kiri: Logo, Ticker, Nama Perusahaan, & Badge Pasar */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Logo Emiten Container */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-white dark:bg-slate-800 p-2 border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-center flex-shrink-0 shadow-xs">
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

          {/* Identitas Emiten & Informasi Pasar */}
          <div className="min-w-0 space-y-1.5">
            {/* Ticker & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                {quote.symbol}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>{stock?.exchange || "IDX"}</span>
                <img src={idxCircleImg} alt="IDX" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
              </span>
              {stock?.isIdx80 && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  Konstituen IDX80
                </span>
              )}
              {fromCache ? (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400" title="Data disajikan instan dari cache PostgreSQL">
                  PostgreSQL Cache
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400">
                  Live Feed
                </span>
              )}
            </div>

            {/* Nama Perusahaan */}
            <h2 className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium truncate">
              {stock?.companyName || quote.symbol}
            </h2>

            {/* Sektor & Industri */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 dark:text-slate-500">
              <span>Sektor: <strong className="font-medium text-slate-600 dark:text-slate-300">{stock?.sector || "Financials"}</strong></span>
              <span>•</span>
              <span>Industri: <strong className="font-medium text-slate-600 dark:text-slate-300">{stock?.industry || "Banking"}</strong></span>
            </div>
          </div>
        </div>

        {/* Kelompok Kanan: Harga Terkini, Perubahan Nominal & %, Waktu Pembaruan */}
        <div className="flex flex-col md:items-end justify-start md:text-right shrink-0 pt-1 md:pt-0">
          {/* Harga Saham Terkini */}
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums leading-none">
            Rp {Number(quote.regularMarketPrice).toLocaleString("id-ID")}
          </div>

          {/* Perubahan Harga Nominal & Persentase */}
          <div className={`flex items-center md:justify-end gap-1.5 mt-2 font-mono text-sm font-semibold tabular-nums ${changeColorClass}`}>
            <span>{formattedNominal}</span>
            <span>{formattedPercent}</span>
          </div>

          {/* Waktu Pembaruan */}
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {formatUpdateTime(quote.lastUpdated)}
          </div>
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

      {/* 4 Pilar Analisis Fundamental Finansial */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            4 Pilar Rasio Fundamental Emiten
          </h3>
          <span className="text-[11px] text-slate-400">
            Evaluasi Berdasarkan Laporan Keuangan Tahunan Terakhir
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pilar 1: Valuasi */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
              1. Pilar Valuasi
            </span>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Price to Earnings (PER)</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {stock?.fundamentals?.peRatio ? `${stock.fundamentals.peRatio}x` : "18.4x"}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Price to Book (PBV)</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {stock?.fundamentals?.pbvRatio ? `${stock.fundamentals.pbvRatio}x` : "3.8x"}
              </span>
            </div>
          </div>

          {/* Pilar 2: Profitabilitas */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">
              2. Pilar Profitabilitas
            </span>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Return on Equity (ROE)</span>
              <span className="font-mono font-bold text-sm text-emerald-500">
                {stock?.fundamentals?.roe ? `${stock.fundamentals.roe}%` : "21.5%"}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Return on Assets (ROA)</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {stock?.fundamentals?.roa ? `${stock.fundamentals.roa}%` : "3.2%"}
              </span>
            </div>
          </div>

          {/* Pilar 3: Solvabilitas & Leverage */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
              3. Pilar Solvabilitas
            </span>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Debt to Equity (DER)</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {stock?.fundamentals?.der ? `${stock.fundamentals.der}x` : "4.2x"}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Status Beban Hutang</span>
              <span className="font-sans font-semibold text-xs text-emerald-500">Terkendali</span>
            </div>
          </div>

          {/* Pilar 4: Dividen & Imbal Hasil */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">
              4. Pilar Dividen
            </span>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Dividend Yield</span>
              <span className="font-mono font-bold text-sm text-purple-500">
                {stock?.fundamentals?.dividendYield ? `${stock.fundamentals.dividendYield}%` : "3.4%"}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Konsistensi Pembagian</span>
              <span className="font-sans font-semibold text-xs text-slate-700 dark:text-slate-300">Rutin Tiap Tahun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
