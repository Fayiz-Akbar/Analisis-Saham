import React from "react";

/**
 * Format angka ke standar Indonesia (titik sebagai ribuan)
 */
function formatNumberID(val, decimals = 0) {
  if (val == null || isNaN(val)) return "—";
  return Number(val).toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format persentase perubahan dengan tanda + atau - dan koma desimal
 * Contoh: +5,56% atau -4,80%
 */
function formatPercentID(val) {
  if (val == null || isNaN(val)) return "0,00%";
  const num = Number(val);
  const sign = num > 0 ? "+" : num < 0 ? "-" : "";
  const absVal = Math.abs(num).toFixed(2).replace(".", ",");
  return `${sign}${absVal}%`;
}

/**
 * Format nama perusahaan (tambahkan awalan PT jika belum ada)
 */
function formatCompanyName(name) {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.startsWith("PT ") || trimmed.startsWith("PT. ")) {
    return trimmed;
  }
  return `PT ${trimmed}`;
}

// In-memory cache untuk candle intraday 1 hari agar saat di-hover tidak reload ulang
const intradayCache = new Map();

/**
 * Generate data deret harga 1 hari (intraday) dari candle asli atau fallback realistis
 */
function generateSparklineData(stock, candles) {
  if (candles && candles.length >= 2) {
    return candles.map((c) => Number(c.close));
  }

  const currentPrice = Number(stock.price) || 100;
  const changePct = Number(stock.changePercent) || 0;
  const prevClose = currentPrice / (1 + changePct / 100);

  const pointsCount = 35;
  const prices = [];

  for (let i = 0; i < pointsCount; i++) {
    const progress = i / (pointsCount - 1);
    const trend = prevClose + (currentPrice - prevClose) * Math.pow(progress, 0.7);
    const noise = Math.sin(i * 0.75) * (currentPrice * 0.007) * (1 - progress * 0.3);
    prices.push(Number((trend + noise).toFixed(2)));
  }

  prices[0] = prevClose;
  prices[prices.length - 1] = currentPrice;
  return prices;
}

/**
 * Render path SVG untuk Sparkline Area Chart dengan gradasi dan titik akhir
 */
function renderSparklineSvg(prices, isGainer, width = 260, height = 68, symbol = "") {
  if (!prices || prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const padX = 6;
  const padTop = 8;
  const padBottom = 8;
  const usableW = width - padX * 2;
  const usableH = height - padTop - padBottom;

  const pts = prices.map((p, idx) => {
    const x = padX + (idx / (prices.length - 1)) * usableW;
    const y = padTop + usableH - ((p - min) / range) * usableH;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const linePath = pts.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`).join(" ");
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const areaPath = `${linePath} L ${lastPt.x},${height} L ${firstPt.x},${height} Z`;

  const strokeColor = isGainer ? "#059669" : "#dc2626";
  const gradId = `sparkGrad-${symbol || "stock"}-${isGainer ? "up" : "down"}`;

  return {
    linePath,
    areaPath,
    lastPt,
    strokeColor,
    gradId,
    width,
    height,
  };
}

/**
 * Komponen Hover Card (TradingView Style Popover)
 */
function StockHoverCard({
  stock,
  isGainer,
  index,
  onSelectStock,
  onMouseEnter,
  onMouseLeave,
}) {
  const [candles, setCandles] = React.useState(() => intradayCache.get(stock.symbol) || null);
  const formattedPrice = formatNumberID(stock.price, 0);
  const formattedChange = formatPercentID(stock.changePercent);
  const displayName = formatCompanyName(stock.companyName);

  React.useEffect(() => {
    if (intradayCache.has(stock.symbol)) {
      setCandles(intradayCache.get(stock.symbol));
      return;
    }

    let isMounted = true;
    fetch(`http://localhost:5000/api/stocks/${stock.symbol}/history?range=1d&interval=5m`)
      .then((res) => res.json())
      .then((json) => {
        if (
          isMounted &&
          json.success &&
          Array.isArray(json.data?.candles) &&
          json.data.candles.length > 0
        ) {
          intradayCache.set(stock.symbol, json.data.candles);
          setCandles(json.data.candles);
        }
      })
      .catch((err) => {
        console.warn("Intraday chart fetch failed, using fallback sparkline:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [stock.symbol]);

  const prices = React.useMemo(() => {
    return generateSparklineData(stock, candles);
  }, [stock, candles]);

  const sparkline = React.useMemo(() => {
    return renderSparklineSvg(prices, isGainer, 260, 68, stock.symbol);
  }, [prices, isGainer, stock.symbol]);

  // Penyesuaian posisi vertikal agar popover tidak terpotong tepi atas atau bawah
  const popoverPositionClass =
    index <= 1
      ? "top-0"
      : index >= 3
      ? "bottom-0"
      : "top-1/2 -translate-y-1/2";

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => e.stopPropagation()}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      className={`absolute z-50 left-1 sm:left-4 ${popoverPositionClass} w-[285px] sm:w-[310px] bg-white dark:bg-[#1e222d] border border-slate-200 dark:border-[#2a2e39] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] p-4 sm:p-5 pointer-events-auto select-none transition-all duration-150 animate-in fade-in zoom-in-95`}
    >
      {/* Header: Logo Bulat + Nama Emiten */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-0.5 flex items-center justify-center flex-shrink-0">
          <img
            src={
              stock.logoUrl ||
              `https://assets.stockbit.com/logos/companies/${stock.symbol}.png`
            }
            alt={stock.symbol}
            className="w-full h-full object-contain rounded-full"
            onError={(e) => {
              e.target.style.display = "none";
              if (e.target.parentNode) {
                e.target.parentNode.innerText = stock.symbol.slice(0, 2);
              }
            }}
          />
        </div>
        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {displayName}
        </span>
      </div>

      {/* Baris Harga & Persentase */}
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
          {formattedPrice}
        </span>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
          IDR
        </span>
        <span
          className={`text-xs font-bold tabular-nums ${
            isGainer ? "text-[#059669] dark:text-[#10b981]" : "text-[#dc2626] dark:text-[#ef4444]"
          }`}
        >
          {formattedChange}
        </span>
      </div>

      {/* Mini Area Chart (1 Hari Intraday) */}
      <div className="mt-3 w-full">
        {sparkline && (
          <svg
            viewBox={`0 0 ${sparkline.width} ${sparkline.height}`}
            className="w-full h-[68px] overflow-visible"
          >
            <defs>
              <linearGradient id={sparkline.gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparkline.strokeColor} stopOpacity="0.28" />
                <stop offset="100%" stopColor={sparkline.strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={sparkline.areaPath} fill={`url(#${sparkline.gradId})`} />
            <path
              d={sparkline.linePath}
              fill="none"
              stroke={sparkline.strokeColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {sparkline.lastPt && (
              <circle
                cx={sparkline.lastPt.x}
                cy={sparkline.lastPt.y}
                r="3.5"
                fill={sparkline.strokeColor}
              />
            )}
          </svg>
        )}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 font-normal mt-1 mb-3">
          1 hari
        </div>
      </div>

      {/* Tombol: Lihat pada chart super */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelectStock && onSelectStock(stock.symbol);
        }}
        className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-[#363a45] bg-white hover:bg-slate-50 dark:bg-[#2a2e39]/60 dark:hover:bg-[#2a2e39] text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100 transition-all shadow-2xs hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer flex items-center justify-center gap-1.5"
      >
        Lihat pada chart super
      </button>
    </div>
  );
}

export default function TopMoversSection({
  stocks = [],
  isLoading = false,
  onSelectStock,
  className = "",
}) {
  const [hoveredStock, setHoveredStock] = React.useState(null);
  const hoverTimeoutRef = React.useRef(null);

  const handleRowMouseEnter = (symbol) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredStock(symbol);
  };

  const handleRowMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredStock(null);
    }, 180);
  };

  const handleCardMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    setHoveredStock(null);
  };

  // Ambil Top 5 Gainers
  const topGainers = React.useMemo(() => {
    return [...stocks]
      .filter((s) => Number(s.changePercent) > 0)
      .sort((a, b) => Number(b.changePercent) - Number(a.changePercent))
      .slice(0, 5);
  }, [stocks]);

  // Ambil Top 5 Losers
  const topLosers = React.useMemo(() => {
    return [...stocks]
      .filter((s) => Number(s.changePercent) < 0)
      .sort((a, b) => Number(a.changePercent) - Number(b.changePercent))
      .slice(0, 5);
  }, [stocks]);

  const renderStockRow = (stock, isGainer, index) => {
    const formattedPrice = formatNumberID(stock.price, 0);
    const formattedChange = formatPercentID(stock.changePercent);
    const displayName = formatCompanyName(stock.companyName);
    const isHovered = hoveredStock === stock.symbol;

    return (
      <div
        key={stock.symbol}
        onMouseEnter={() => handleRowMouseEnter(stock.symbol)}
        onMouseLeave={handleRowMouseLeave}
        onClick={() => onSelectStock && onSelectStock(stock.symbol)}
        className="relative flex items-center justify-between py-2 px-2.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer select-none group"
      >
        {/* Sisi Kiri: Logo Lingkaran + Nama Emiten + Ticker Badge */}
        <div className="flex items-center gap-3.5 min-w-0 pr-3">
          {/* Logo Bulat Sesuai Gambar Referensi */}
          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <img
              src={
                stock.logoUrl ||
                `https://assets.stockbit.com/logos/companies/${stock.symbol}.png`
              }
              alt={stock.symbol}
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.parentNode) {
                  e.target.parentNode.innerText = stock.symbol.slice(0, 2);
                }
              }}
            />
          </div>

          {/* Nama Perusahaan & Ticker Badge */}
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate leading-tight">
              {displayName}
            </span>
            <div className="mt-1">
              <span className="text-[11px] font-bold text-white bg-blue-600 dark:bg-blue-600 px-1.5 py-0.5 rounded tracking-wide uppercase inline-block leading-none shadow-2xs">
                {stock.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Harga + IDR + Solid Rounded Badge Persentase */}
        <div className="flex items-center gap-3.5 sm:gap-5 flex-shrink-0">
          {/* Harga (contoh: 2.150 IDR) */}
          <div className="text-right whitespace-nowrap">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formattedPrice}
            </span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1 uppercase">
              IDR
            </span>
          </div>

          {/* Solid Rounded Badge (+25,00% / -14,71%) */}
          <div
            className={`min-w-[74px] sm:min-w-[80px] text-center px-2.5 py-1.5 rounded-[7px] text-xs sm:text-[13px] font-bold tabular-nums text-white shadow-2xs ${
              isGainer
                ? "bg-[#059669] hover:bg-[#047857]"
                : "bg-[#dc2626] hover:bg-[#b91c1c]"
            } transition-colors`}
          >
            {formattedChange}
          </div>
        </div>

        {/* Popover Hover Card Persis Seperti Gambar Referensi */}
        {isHovered && (
          <StockHoverCard
            stock={stock}
            isGainer={isGainer}
            index={index}
            onSelectStock={onSelectStock}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          />
        )}
      </div>
    );
  };

  return (
    <section
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      className={`w-full py-2 ${className}`}
    >
      {/* 2 Kolom Berdampingan Persis Seperti Gambar Referensi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        {/* ========================================================
            KOLOM 1: TOP GAINERS
            ======================================================== */}
        <div className="space-y-3.5">
          {/* Judul: Top Gainers (Warna Putih di Dark Mode / Hitam di Light Mode) */}
          <h2
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 dark:text-white flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span>Top Gainers</span>
          </h2>

          {/* List 5 Emiten (Tanpa Container, Tanpa Divider Garis) */}
          <div className="space-y-2">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="py-2 px-2 flex items-center justify-between animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    </div>
                  </div>
                ))
              : topGainers.map((stock, idx) => renderStockRow(stock, true, idx))}
          </div>
        </div>

        {/* ========================================================
            KOLOM 2: TOP LOSS
            ======================================================== */}
        <div className="space-y-3.5">
          {/* Judul: Top Loss (Warna Putih di Dark Mode / Hitam di Light Mode) */}
          <h2
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 dark:text-white flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span>Top Loss</span>
          </h2>

          {/* List 5 Emiten (Tanpa Container, Tanpa Divider Garis) */}
          <div className="space-y-2">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="py-2 px-2 flex items-center justify-between animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    </div>
                  </div>
                ))
              : topLosers.map((stock, idx) => renderStockRow(stock, false, idx))}
          </div>
        </div>
      </div>
    </section>
  );
}
