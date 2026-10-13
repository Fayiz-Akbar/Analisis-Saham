import React, { useState, useEffect, useRef } from "react";
import {
  MarketOverviewSection,
} from "@/components/ui/stock-market-tracker-chart";
import TopMoversSection from "../dashboard/TopMoversSection";

// Generate smooth cubic bezier spline SVG path
function generateSmoothCurve(values, width = 280, height = 110, padding = 12) {
  if (!values || values.length < 2) {
    values = [50, 48, 55, 42, 60, 52, 65, 58, 70];
  }

  let activeValues = [...values];
  const minVal = Math.min(...activeValues);
  const maxVal = Math.max(...activeValues);

  // Jika harga stagnan tanpa fluktuasi, berikan gelombang halus agar tidak menjadi garis datar mati
  if (minVal === maxVal) {
    activeValues = [
      minVal * 0.995,
      minVal * 1.002,
      minVal * 0.998,
      minVal * 1.003,
      minVal * 1.001,
      minVal,
    ];
  }

  const min = Math.min(...activeValues);
  const max = Math.max(...activeValues);
  const range = max - min || 1;

  const points = activeValues.map((val, idx) => {
    const x = padding + (idx / (values.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return { linePath, areaPath, lastPoint: points[points.length - 1] };
}

export default function DashboardView({ onSelectStock }) {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const scrollContainerRef = useRef(null);

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Ambil data seluruh 80 saham IDX80 & harga dari backend
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardStocks() {
      try {
        setIsLoading(true);

        // 1. Ambil data ticker-tape terkini dengan sparkline
        let tickerMap = new Map();
        try {
          const tapeRes = await fetch("http://localhost:5000/api/stocks/ticker-tape");
          const tapeJson = await tapeRes.json();
          if (tapeJson.success && Array.isArray(tapeJson.data)) {
            tapeJson.data.forEach((item) => tickerMap.set(item.symbol, item));
          }
        } catch (e) {
          console.warn("Gagal fetch ticker-tape:", e);
        }

        // 2. Ambil seluruh katalog 80 saham IDX80
        const res = await fetch("http://localhost:5000/api/stocks?limit=80");
        const json = await res.json();

        if (isMounted && json.success && Array.isArray(json.data)) {
          // Gabungkan data
          const combined = json.data.map((s) => {
            const tapeItem = tickerMap.get(s.symbol);
            
            // Sparkline mingguan (5 hari bursa riil)
            const sparkline = (tapeItem?.sparkline && tapeItem.sparkline.length >= 2)
              ? tapeItem.sparkline
              : [Number(s.dailyPrice?.openPrice || s.dailyPrice?.closePrice || 5000), Number(s.dailyPrice?.closePrice || 5000)];

            const price = tapeItem?.price || Number(s.dailyPrice?.closePrice) || sparkline[sparkline.length - 1] || 5000;
            const startPrice = sparkline[0] || price;
            
            // Perubahan MINGGUAN (Weekly Performance) dari 5 hari bursa (sparkline):
            // Selisih harga akhir minggu vs awal minggu
            const change = tapeItem?.changeAmount !== undefined
              ? tapeItem.changeAmount
              : Number((price - startPrice).toFixed(2));

            const pct = tapeItem?.changePercent !== undefined
              ? tapeItem.changePercent
              : (startPrice > 0 ? Number(((change / startPrice) * 100).toFixed(2)) : 0);

            const volume = Number(s.dailyPrice?.volume || tapeItem?.volume || 0);

            return {
              symbol: s.symbol,
              companyName: s.companyName,
              sector: s.sector,
              logoUrl: s.logoUrl || `https://assets.stockbit.com/logos/companies/${s.symbol}.png`,
              price,
              changeAmount: change,
              changePercent: pct,
              volume,
              isUp: change >= 0,
              sparkline,
            };
          });

          // Urutkan saham populer di depan (BBCA, BBRI, BMRI, TLKM, ASII, dll.)
          const priorityOrder = ["BBCA", "BBRI", "BMRI", "TLKM", "ASII", "AMMN", "BREN", "GOTO", "ADRO", "ICBP", "BBNI", "KLBF", "UNVR", "MDKA", "PGAS"];
          combined.sort((a, b) => {
            const idxA = priorityOrder.indexOf(a.symbol);
            const idxB = priorityOrder.indexOf(b.symbol);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.symbol.localeCompare(b.symbol);
          });

          setStocks(combined);
        }
      } catch (err) {
        console.warn("Gagal memuat katalog dashboard:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboardStocks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter kategori sektor
  const filteredStocks = stocks.filter((s) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "BANK") return s.sector === "Financials";
    if (activeFilter === "ENERGY") return s.sector === "Energy";
    if (activeFilter === "CONSUMER") return s.sector.includes("Consumer");
    if (activeFilter === "TECH_INFRA") return s.sector === "Technology" || s.sector === "Infrastructures";
    return true;
  });

  // Tombol Geser Panah
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollOffset = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <div className="space-y-8">
      {/* ========================================================
          BAGIAN 1: RINGKASAN INDEKS PASAR (MARKET OVERVIEW)
          ======================================================== */}
      <MarketOverviewSection />

      {/* ========================================================
          BAGIAN 2: SAHAM PELABA & SAHAM PERUGI (TOP 5 IDX80)
          Desain 2 kolom tanpa container (Sesuai Referensi Gambar)
          ======================================================== */}
      <TopMoversSection
        stocks={stocks}
        isLoading={isLoading}
        onSelectStock={onSelectStock}
      />

      {/* ========================================================
          BAGIAN 3: PASAR SAHAM IDX80 (CAROUSEL / SLIDER)
          Desain Sebelumnya (Foto ke-3 Diperbaiki Seperti Semula)
          ======================================================== */}
      <section className="space-y-4">
        {/* Header Bagian Atas: Kategori & Navigasi Geser */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Pasar Saham IDX80
              </h2>
             
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Geser kartu untuk menjelajahi saham terdaftar. Klik kartu emiten mana saja untuk membuka analisis mendalam di Stock Detail.
            </p>
          </div>

          {/* Filter Sektor & Tombol Panah Geser */}
          <div className="flex items-center gap-3">
            {/* Filter Kategori */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 p-1 rounded-2xl">
              {[
                { id: "ALL", label: "Semua" },
                { id: "BANK", label: "Perbankan" },
                { id: "ENERGY", label: "Energi" },
                { id: "CONSUMER", label: "Konsumer" },
                { id: "TECH_INFRA", label: "Tekno & Infra" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeFilter === btn.id
                      ? "bg-white text-slate-950 shadow-xs dark:bg-white dark:text-slate-950"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Tombol Geser Kiri / Kanan */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleScroll("left")}
                className="w-9 h-9 rounded-xl bg-white dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                title="Geser Kiri"
                aria-label="Geser Kiri"
              >
                <svg className="w-4 h-4 stroke-slate-800 dark:stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => handleScroll("right")}
                className="w-9 h-9 rounded-xl bg-white dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                title="Geser Kanan"
                aria-label="Geser Kanan"
              >
                <svg className="w-4 h-4 stroke-slate-800 dark:stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Carousel Container: Sesuai Desain Gambar Referensi */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex items-center gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none scroll-smooth select-none cursor-grab active:cursor-grabbing px-1"
        >
          {isLoading
            ? // Skeleton Loading Cards
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="min-w-[290px] sm:min-w-[320px] h-[370px] rounded-[30px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e]/80 p-6 flex flex-col justify-between animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                    </div>
                  </div>
                  <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                  </div>
                </div>
              ))
            : filteredStocks.map((stock) => {
                const { linePath, areaPath, lastPoint } = generateSmoothCurve(stock.sparkline);
                const changeSign = stock.changeAmount > 0 ? "+" : (stock.changeAmount < 0 ? "-" : "");
                const formattedPrice = `Rp ${stock.price.toLocaleString("id-ID")}`;
                const formattedNominal = `${changeSign}${Math.abs(stock.changeAmount).toLocaleString("id-ID")}`;
                const formattedPercent = `(${changeSign}${Math.abs(stock.changePercent).toFixed(2)}%)`;

                return (
                  <div
                    key={stock.symbol}
                    onClick={() => onSelectStock && onSelectStock(stock.symbol)}
                    className="group relative min-w-[285px] sm:min-w-[315px] h-[370px] rounded-[30px] bg-white dark:bg-gradient-to-b dark:from-[#181c28] dark:via-[#10131d] dark:to-[#0a0c12] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-md dark:shadow-2xl p-6 sm:p-7 flex flex-col justify-between flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-950/20 overflow-hidden"
                  >
                    {/* Subtle Ambient Glow Aura pada latar belakang kartu */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

                    {/* BAGIAN ATAS: Logo Emiten + Ticker + Nama */}
                    <div className="flex items-center gap-3.5 z-10">
                      <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200/80 dark:border-transparent dark:bg-white p-2.5 flex items-center justify-center shadow-sm dark:shadow-lg dark:shadow-black/30 flex-shrink-0">
                        <img
                          src={stock.logoUrl}
                          alt={stock.symbol}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.innerText = stock.symbol;
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block leading-tight">
                          {stock.symbol}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block truncate mt-0.5">
                          {stock.companyName}
                        </span>
                      </div>
                    </div>

                    {/* BAGIAN TENGAH: Gelombang Sparkline Halus */}
                    <div className="my-auto py-2 z-10 w-full overflow-hidden">
                      <svg
                        viewBox="0 0 280 110"
                        className="w-full h-28 overflow-visible"
                      >
                        <defs>
                          <linearGradient id={`area-glow-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        <path
                          d={areaPath}
                          fill={`url(#area-glow-${stock.symbol})`}
                        />

                        <path
                          d={linePath}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-slate-800 dark:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]"
                        />

                        <circle
                          cx={lastPoint.x}
                          cy={lastPoint.y}
                          r="3.5"
                          className="fill-slate-800 dark:fill-white drop-shadow-[0_0_6px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                        />
                      </svg>
                    </div>

                    {/* BAGIAN BAWAH: Harga Besar + Perubahan Nominal & Persen */}
                    <div className="z-10 space-y-1.5">
                      <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                        {formattedPrice}
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`text-xs sm:text-sm font-bold font-mono tracking-wide ${
                            stock.isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formattedNominal} {formattedPercent}
                        </div>
                        <span className="text-[10px] font-semibold font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/90 dark:text-slate-400 dark:border-slate-700/60 uppercase">
                          1 Minggu
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </section>
    </div>
  );
}
