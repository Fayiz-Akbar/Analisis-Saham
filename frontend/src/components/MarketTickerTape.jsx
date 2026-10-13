import React, { useState, useEffect, useRef } from "react";

export default function MarketTickerTape({ selectedSymbol, onSelectStock }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadTickerData() {
      try {
        const res = await fetch("http://localhost:5000/api/stocks/ticker-tape");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setItems(json.data);
          setTimeout(checkScroll, 100);
        }
      } catch (err) {
        console.warn("Gagal memuat ticker tape:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadTickerData();
    return () => {
      isMounted = false;
    };
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  // Helper render Sparkline SVG profesional
  const renderSparkline = (data, isPositive, symbol) => {
    if (!data || data.length < 2) return null;

    const width = 64;
    const height = 28;
    const padding = 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    const strokeColor = isPositive ? "#10b981" : "#ef4444";
    const gradId = `spark-grad-${symbol}`;
    const lastPoint = points[points.length - 1];

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible flex-shrink-0"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        {/* Fill Area Gradient */}
        <path d={areaPath} fill={`url(#${gradId})`} />
        {/* Trend Line */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Terminal Dot at End */}
        <circle cx={lastPoint.x} cy={lastPoint.y} r={2} fill={strokeColor} />
      </svg>
    );
  };

  return (
    <div className="relative group/tape">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll Kiri"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all text-xs font-bold"
        >
          ‹
        </button>
      )}

      {/* Ticker Cards Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth px-0.5"
      >
        {isLoading
          ? // Skeleton loading state
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="min-w-[175px] sm:min-w-[195px] h-[68px] rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-3 animate-pulse flex justify-between items-center"
              >
                <div className="space-y-2 w-24">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                </div>
                <div className="w-14 h-6 bg-slate-100 dark:bg-slate-800/50 rounded" />
              </div>
            ))
          : items.map((stock) => {
              const isSelected = selectedSymbol === stock.symbol;
              const isPositive = stock.changeAmount >= 0;
              const changeSign = isPositive ? "+" : "";
              const formattedPrice = `Rp ${Number(stock.price).toLocaleString("id-ID")}`;
              const formattedNominal = `${changeSign}${stock.changeAmount}`;
              const formattedPercent = `${changeSign}${Number(stock.changePercent).toFixed(2)}%`;

              return (
                <button
                  key={stock.symbol}
                  onClick={() => onSelectStock && onSelectStock(stock.symbol)}
                  className={`min-w-[175px] sm:min-w-[195px] px-3.5 py-2.5 rounded-2xl border text-left transition-colors flex items-center justify-between gap-3 flex-shrink-0 cursor-pointer bg-white dark:bg-slate-900 ${
                    isSelected
                      ? "border-blue-500 dark:border-blue-400 shadow-xs ring-1 ring-blue-500/20 dark:ring-blue-400/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                  }`}
                  title={`${stock.symbol} - ${stock.companyName}`}
                >
                  {/* Left Column: Logo + Symbol & Price + Change */}
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Header: Logo & Symbol */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-4 h-4 rounded-full bg-white p-0.5 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <img
                          src={stock.logoUrl}
                          alt={stock.symbol}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                      <span className="font-extrabold text-xs tracking-tight text-slate-800 dark:text-slate-100">
                        {stock.symbol}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 tabular-nums leading-tight">
                      {formattedPrice}
                    </div>

                    {/* Change Nominal & Percent */}
                    <div
                      className={`font-mono text-[11px] font-semibold tabular-nums leading-none ${
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      <span>
                        {formattedNominal} ({formattedPercent})
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Mini Sparkline Graph */}
                  <div className="flex-shrink-0 pt-1">
                    {renderSparkline(stock.sparkline, isPositive, stock.symbol)}
                  </div>
                </button>
              );
            })}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll Kanan"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all text-xs font-bold"
        >
          ›
        </button>
      )}
    </div>
  );
}
