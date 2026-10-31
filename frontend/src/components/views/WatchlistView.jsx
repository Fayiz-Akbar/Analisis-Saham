"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, RefreshCw, Layers } from "lucide-react";

/**
 * Format Angka Finansial Standar Indonesia (Rupiah, Volume Lembar, & Kap Pasar)
 */
const formatPriceIDR = (price) => {
  if (price === null || price === undefined || isNaN(price)) return "Rp —";
  return `Rp ${Number(price).toLocaleString("id-ID")}`;
};

const formatMarketCapIDR = (marketCap) => {
  if (!marketCap || isNaN(marketCap)) return "—";
  const num = Number(marketCap);
  if (num >= 1e12) return `Rp ${(num / 1e12).toFixed(2).replace(".", ",")} T`;
  if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(2).replace(".", ",")} M`;
  return `Rp ${num.toLocaleString("id-ID")}`;
};

const formatVolumeShares = (volume) => {
  if (!volume || isNaN(volume)) return "—";
  const num = Number(volume);
  if (num >= 1e9) return `${(num / 1e9).toFixed(2).replace(".", ",")} M Lbr`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2).replace(".", ",")} Jt Lbr`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(".", ",")} Rb Lbr`;
  return `${num.toLocaleString("id-ID")} Lbr`;
};

const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) return "0.00%";
  const num = Number(percentage);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2).replace(".", ",")}%`;
};

/**
 * Format Waktu Candle dari Unix Timestamp
 */
const formatCandleTime = (time) => {
  if (!time) return "";
  try {
    const d = new Date(time * 1000);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
  } catch {
    return "";
  }
};

/**
 * Hook untuk mengukur lebar/tinggi kontainer chart secara presisi
 */
const useElementSize = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      setSize({ width: node.clientWidth, height: node.clientHeight });
    };

    update();

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(node);
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, []);

  return [ref, size];
};

/**
 * Komponen Logo Emiten Resmi (Stockbit Assets CDN)
 * Mencegah teks overlap dengan gambar logo
 */
const StockLogo = ({ symbol, logoUrl, className = "" }) => {
  const [hasError, setHasError] = useState(false);
  const src = logoUrl || `https://assets.stockbit.com/logos/companies/${symbol}.png`;

  return (
    <div
      className={`relative w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-1 flex items-center justify-center overflow-hidden shadow-xs ${className}`}
    >
      {!hasError ? (
        <img
          src={src}
          alt={symbol}
          className="w-full h-full object-contain"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center">
          <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400">
            {symbol.slice(0, 3)}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Kartu Bersih Tanpa Background Plus
 */
const ProfessionalCard = ({ isActive, children, className = "" }) => {
  return (
    <div className={`relative w-full mx-auto ${className}`}>
      <div
        className={`relative rounded-2xl bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur-md border ${
          isActive
            ? "border-blue-500/60 shadow-lg shadow-blue-500/5 dark:border-blue-400/50"
            : "border-zinc-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md"
        } transition-all duration-200`}
      >
        <div className="relative z-10 p-5">{children}</div>
      </div>
    </div>
  );
};

/**
 * Interactive SVG Chart dengan Kurva Halus Riil, Glow, Crosshair, dan Tooltip Presisi
 */
const InteractiveChart = ({ data = [], positive = true, className = "" }) => {
  const [containerRef, { width }] = useElementSize();
  const [hoverIdx, setHoverIdx] = useState(null);
  const [isPointer, setIsPointer] = useState(false);

  const desiredHeight = 150;
  const padding = { top: 16, right: 12, bottom: 22, left: 45 };
  const innerW = Math.max(0, width - padding.left - padding.right);
  const innerH = Math.max(0, desiredHeight - padding.top - padding.bottom);

  // Ekstrak harga & waktu riil dari array data
  const rawPrices = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d) => (typeof d === "number" ? d : d.price));
  }, [data]);

  const rawTimes = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d) => (typeof d === "object" && d.time ? d.time : null));
  }, [data]);

  // Fallback jika belum ada data riil yang termuat
  const validPrices = rawPrices.length >= 2 ? rawPrices : [4900, 4920, 4890, 4910, 4930, 4900];

  const minV = Math.min(...validPrices);
  const maxV = Math.max(...validPrices);
  const range = maxV - minV || 1;

  // Margin vertikal 5% agar kurva tidak menempel di batas atas/bawah
  const padV = range * 0.06;
  const domainMin = minV - padV;
  const domainMax = maxV + padV;
  const domainRange = domainMax - domainMin || 1;

  const xFor = (i) => (validPrices.length <= 1 ? 0 : (i / (validPrices.length - 1)) * innerW);
  const yFor = (v) => innerH - ((v - domainMin) / domainRange) * innerH;

  const points = useMemo(() => {
    return validPrices.map((v, i) => [xFor(i), yFor(v)]);
  }, [validPrices, innerW, innerH, domainMin, domainRange]);

  const dPath = useMemo(() => {
    if (!points.length) return "";
    return points.map((p, i) => (i === 0 ? `M ${p[0].toFixed(1)} ${p[1].toFixed(1)}` : `L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)).join(" ");
  }, [points]);

  // 3 Garis Grid Horizontal
  const gridLines = 2;
  const gridYVals = Array.from({ length: gridLines + 1 }, (_, i) => minV + (i * range) / gridLines);

  const handlePointer = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left - padding.left;
    if (x < 0 || x > innerW) {
      setHoverIdx(null);
      return;
    }
    const ratio = x / innerW;
    const idx = Math.max(0, Math.min(validPrices.length - 1, Math.round(ratio * (validPrices.length - 1))));
    setHoverIdx(idx);
  };

  const hoveredPrice = hoverIdx !== null ? validPrices[hoverIdx] : null;
  const hoveredTime = hoverIdx !== null && rawTimes[hoverIdx] ? formatCandleTime(rawTimes[hoverIdx]) : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full cursor-crosshair select-none ${className}`}
      style={{ height: desiredHeight }}
      onMouseMove={(e) => {
        setIsPointer(true);
        handlePointer(e.clientX);
      }}
      onMouseLeave={() => {
        setIsPointer(false);
        setHoverIdx(null);
      }}
      onTouchStart={(e) => {
        setIsPointer(true);
        if (e.touches[0]) handlePointer(e.touches[0].clientX);
      }}
      onTouchMove={(e) => {
        if (e.touches[0]) handlePointer(e.touches[0].clientX);
      }}
      onTouchEnd={() => {
        setIsPointer(false);
        setHoverIdx(null);
      }}
    >
      <svg width={width} height={desiredHeight} className="overflow-visible">
        <defs>
          <linearGradient id={`area-grad-${positive ? "pos" : "neg"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={positive ? "#10b981" : "#ef4444"} stopOpacity="0.28" />
            <stop offset="65%" stopColor={positive ? "#10b981" : "#ef4444"} stopOpacity="0.06" />
            <stop offset="100%" stopColor={positive ? "#10b981" : "#ef4444"} stopOpacity="0.00" />
          </linearGradient>

          <filter id="stockChartGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${padding.left},${padding.top})`}>
          {/* Garis Grid Horizontal & Label Harga Sumbu Y */}
          {gridYVals.map((gy, i) => {
            const y = yFor(gy);
            return (
              <g key={i}>
                <line
                  x1={0}
                  y1={y}
                  x2={innerW}
                  y2={y}
                  className="stroke-zinc-200/50 dark:stroke-zinc-800/60"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                <text
                  x={-8}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  className="fill-zinc-400 dark:fill-zinc-500 text-[9px] font-mono select-none"
                >
                  {gy >= 1000 ? Math.round(gy) : gy.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Area Fill Gradien di Bawah Kurva */}
          {points.length > 1 && (
            <path
              d={`${dPath} L ${innerW} ${innerH} L 0 ${innerH} Z`}
              fill={`url(#area-grad-${positive ? "pos" : "neg"})`}
              stroke="none"
            />
          )}

          {/* Garis Kurva Saham Halus */}
          <path
            d={dPath}
            fill="none"
            stroke={positive ? "#10b981" : "#ef4444"}
            strokeWidth={2.4}
            filter="url(#stockChartGlow)"
            className="drop-shadow-xs"
          />

          {/* Crosshair Interaktif & Pulsating Dot saat Kursor Mengarah */}
          {isPointer && hoverIdx !== null && points[hoverIdx] && (
            <>
              {/* Garis Vertikal */}
              <line
                x1={points[hoverIdx][0]}
                y1={0}
                x2={points[hoverIdx][0]}
                y2={innerH}
                className="stroke-blue-500/80 dark:stroke-blue-400/80"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />
              {/* Garis Horizontal */}
              <line
                x1={0}
                y1={points[hoverIdx][1]}
                x2={innerW}
                y2={points[hoverIdx][1]}
                className="stroke-blue-500/80 dark:stroke-blue-400/80"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />

              {/* Titik Berdenyut */}
              <circle
                cx={points[hoverIdx][0]}
                cy={points[hoverIdx][1]}
                r={5}
                className="fill-white dark:fill-zinc-950 stroke-blue-500 dark:stroke-blue-400"
                strokeWidth={2.5}
                filter="url(#stockChartGlow)"
              >
                <animate attributeName="r" values="4;6;4" dur="1.3s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </g>
      </svg>

      {/* Floating Price Tooltip Presisi saat Hover */}
      {isPointer && hoverIdx !== null && hoveredPrice !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-none rounded-xl border border-zinc-200 bg-white/95 px-3 py-1.5 text-xs shadow-md dark:border-zinc-700 dark:bg-zinc-900/95 backdrop-blur-md z-20"
          style={{
            top: Math.max(6, padding.top + (points[hoverIdx]?.[1] ?? 0) - 48),
            left: Math.min(Math.max(padding.left + (points[hoverIdx]?.[0] ?? 0) - 65, 8), (width || 0) - 140),
            width: 130,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px]">Harga</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {formatPriceIDR(hoveredPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
            <span>{hoveredTime || `Titik ${hoverIdx + 1}`}</span>
            <span>Intraday</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Kartu Saham Terpantau (Watchlist Card)
 * Mengambil data lilin riil per emiten untuk kurva chart yang akurat
 */
const WatchlistStockCard = ({ stock, onToggleWatchlist, onSelectStock, delay = 0 }) => {
  const [isActive, setIsActive] = useState(false);
  const [realCandles, setRealCandles] = useState([]);

  const p = stock.dailyPrice || {};
  const f = stock.fundamentals || {};

  const currentPrice = p.closePrice ? Number(p.closePrice) : 0;
  const changePercent = p.changePercent ? Number(p.changePercent) : 0;
  const isPositive = changePercent >= 0;

  const high24h = p.highPrice ? Number(p.highPrice) : currentPrice;
  const low24h = p.lowPrice ? Number(p.lowPrice) : currentPrice;
  const marketCap = f.marketCap ? Number(f.marketCap) : 0;
  const volume24h = p.volume ? Number(p.volume) : 0;

  // Fetch riwayat harga lilin riil dari backend untuk chart yang berasa nyata
  useEffect(() => {
    let isMounted = true;
    async function loadCandles() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/stocks/${stock.symbol}/history?range=intraday&interval=5m`
        );
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data?.candles) && json.data.candles.length > 0) {
          const points = json.data.candles.map((c) => ({
            price: Number(c.close),
            time: c.time,
          }));
          setRealCandles(points);
        }
      } catch (err) {
        console.warn(`Gagal memuat candles ${stock.symbol}:`, err);
      }
    }
    loadCandles();
    return () => {
      isMounted = false;
    };
  }, [stock.symbol]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, y: -16 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 320,
        damping: 28,
      }}
      whileHover={{
        scale: 1.015,
        transition: { duration: 0.2 },
      }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      className="relative group cursor-pointer"
      onClick={() => onSelectStock?.(stock.symbol)}
    >
      <ProfessionalCard isActive={isActive}>
        {/* Header Baris Kartu: Logo Bersih, Simbol, Nama, Harga, & Tombol Bintang */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <StockLogo symbol={stock.symbol} logoUrl={stock.logoUrl} />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base font-mono text-zinc-900 dark:text-zinc-100 truncate">
                  {stock.symbol}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
                  IDX
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] sm:max-w-[180px]">
                {stock.companyName}
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Harga Terkini, % Perubahan, & Tombol Matikan Bintang */}
          <div className="flex items-start gap-2.5 shrink-0">
            <div className="text-right">
              <motion.div
                className="text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100"
                animate={{ scale: isActive ? 1.03 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {formatPriceIDR(currentPrice)}
              </motion.div>
              <div
                className={`text-xs font-semibold font-mono flex items-center justify-end gap-1 ${
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <span>{isPositive ? "↗" : "↘"}</span>
                <span>{formatPercentage(changePercent)}</span>
              </div>
            </div>

            {/* Tombol Matikan Bintang (Unstar dari Watchlist) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(stock.symbol);
              }}
              className="p-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 hover:bg-rose-500/15 hover:border-rose-500/35 text-amber-500 hover:text-rose-500 transition-colors cursor-pointer group/star"
              title="Hapus dari Watchlist"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover/star:text-rose-500 group-hover/star:fill-rose-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Bagan Interaktif Riil (Sparkline Real Candle) */}
        <div className="mb-3.5">
          <div className="rounded-xl border border-zinc-200/60 dark:border-white/[0.06] bg-gradient-to-br from-zinc-50/50 to-white dark:from-zinc-900/30 dark:to-zinc-950/40 overflow-hidden">
            <InteractiveChart data={realCandles} positive={isPositive} />
          </div>
        </div>

        {/* 4 Metrik Finansial Riil (Kap Pasar, Volume Lembar, Tertinggi, Terendah) */}
        <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-white/[0.06]">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Kap. Pasar
              </div>
              <div className="font-bold font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate">
                {formatMarketCapIDR(marketCap)}
              </div>
            </div>
            <div className="space-y-0.5 text-right">
              <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Volume 24j
              </div>
              <div className="font-bold font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate">
                {formatVolumeShares(volume24h)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100 dark:border-white/[0.04]">
            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Tertinggi 24j
              </div>
              <div className="font-bold font-mono text-xs text-emerald-600 dark:text-emerald-400 truncate">
                {formatPriceIDR(high24h)}
              </div>
            </div>
            <div className="space-y-0.5 text-right">
              <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Terendah 24j
              </div>
              <div className="font-bold font-mono text-xs text-rose-600 dark:text-rose-400 truncate">
                {formatPriceIDR(low24h)}
              </div>
            </div>
          </div>
        </div>
      </ProfessionalCard>
    </motion.div>
  );
};

/**
 * Halaman Utama Watchlist Saham Personal
 * Menampilkan langsung kartu saham tanpa header banner yang tidak diinginkan
 */
export default function WatchlistView({ onSelectStock, onBrowseCatalog }) {
  const [allStocks, setAllStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Watchlist Symbols tersinkronisasi dengan localStorage
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    try {
      const saved = localStorage.getItem("investai_watchlist_symbols");
      return saved ? JSON.parse(saved) : ["BBCA", "BBRI", "TLKM", "ASII"];
    } catch {
      return ["BBCA", "BBRI", "TLKM", "ASII"];
    }
  });

  // Fetch seluruh katalog saham dari backend
  const fetchAllStocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/stocks?limit=80");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllStocks(json.data);
      }
    } catch (err) {
      console.warn("Gagal memuat katalog saham:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStocks();
  }, [fetchAllStocks]);

  // Sinkronisasi otomatis saat ada saham dibintangi di StockTableView
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("investai_watchlist_symbols");
        if (saved) setWatchlistSymbols(JSON.parse(saved));
      } catch (e) {
        console.warn("Gagal membaca update watchlist:", e);
      }
    };

    window.addEventListener("watchlist-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("watchlist-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Toggle watchlist symbol (Tambah / Hapus)
  const handleToggleWatchlist = (symbol) => {
    setWatchlistSymbols((prev) => {
      const updated = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];

      try {
        localStorage.setItem("investai_watchlist_symbols", JSON.stringify(updated));
        window.dispatchEvent(new Event("watchlist-updated"));
      } catch (err) {
        console.warn("Gagal menyimpan watchlist:", err);
      }
      return updated;
    });
  };

  // Filter emiten yang ada di dalam watchlist pengguna
  const watchedStocks = useMemo(() => {
    if (!allStocks.length) return [];
    return allStocks.filter((stock) => watchlistSymbols.includes(stock.symbol));
  }, [allStocks, watchlistSymbols]);

  if (loading && allStocks.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Memuat data watchlist saham terintegrasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] pb-16 pt-2">
      {/* Daftar Kartu Saham Terpantau (Tampil Langsung di Bagian Atas) */}
      {watchedStocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {watchedStocks.map((stock, idx) => (
              <WatchlistStockCard
                key={stock.symbol}
                stock={stock}
                onToggleWatchlist={handleToggleWatchlist}
                onSelectStock={onSelectStock}
                delay={idx * 0.04}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State yang Menarik jika Semua Saham Dihapus dari Watchlist */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white/40 dark:bg-zinc-950/40 backdrop-blur-sm max-w-xl mx-auto my-12"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Star className="w-7 h-7 fill-amber-400/40 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Belum Ada Saham di Watchlist
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Anda dapat menambahkan emiten konstituen IDX80 ke daftar pantauan ini dengan mengklik ikon bintang (⭐) pada halaman katalog saham.
          </p>
          {onBrowseCatalog && (
            <button
              onClick={onBrowseCatalog}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Buka Katalog Saham IDX80</span>
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
