import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
} from "lightweight-charts";


export default function TradingViewChart({
  candles = [],
  range = "1y",
  onRangeChange,
  isDarkMode = false,
  symbol = "BBCA",
}) {
  const chartWrapperRef = useRef(null);
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const mainSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  const [chartType, setChartType] = useState("area"); // "area" | "candle"
  const [hoverData, setHoverData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State untuk candles aktif (yang dapat berkembang dinamis saat di-drag ke masa lalu)
  const [activeCandles, setActiveCandles] = useState(candles);
  const currentRangeRef = useRef(range);
  const isLoadingHistoryRef = useRef(false);

  // Sinkronisasi data saat candles atau range dari parent berubah
  useEffect(() => {
    setActiveCandles(candles);
    currentRangeRef.current = range;
  }, [candles, range]);

  // Urutan hierarki timeframe untuk auto-load riwayat masa lalu saat grafik ditarik ke kiri
  const rangeSteps = {
    "1d": "1mo",
    "1mo": "3mo",
    "3mo": "1y",
    "1y": "5y",
    "5y": "max",
  };

  const loadOlderHistory = async () => {
    const nextRange = rangeSteps[currentRangeRef.current];
    if (!nextRange || isLoadingHistoryRef.current) return;

    try {
      isLoadingHistoryRef.current = true;
      const res = await fetch(`http://localhost:5000/api/stocks/${symbol}/history?range=${nextRange}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data?.candles) && json.data.candles.length > 0) {
        currentRangeRef.current = nextRange;
        const newCandles = json.data.candles;

        setActiveCandles((prev) => {
          const map = new Map();
          for (const c of newCandles) map.set(c.time, c);
          for (const c of prev) map.set(c.time, c);

          const sorted = Array.from(map.values()).sort((a, b) => {
            if (typeof a.time === "number" && typeof b.time === "number") return a.time - b.time;
            return String(a.time).localeCompare(String(b.time));
          });
          return sorted;
        });
      }
    } catch (err) {
      console.warn("Gagal memuat riwayat masa lalu:", err);
    } finally {
      isLoadingHistoryRef.current = false;
    }
  };

  // Opsi Timeframe Persis Seperti Tampilan Dashboard
  const ranges = [
    { label: "1D", value: "1d", title: "1 Lilin = 1 Hari (Daily)" },
    { label: "1Bln", value: "1mo", title: "1 Lilin = 1 Bulan (Monthly)" },
    { label: "3Bln", value: "3mo", title: "1 Lilin = 3 Bulan (Kuartalan / Q)" },
    { label: "1Th", value: "1y", title: "1 Lilin = 1 Tahun (Tahunan / 12M)" },
    { label: "5Th", value: "5y", title: "1 Lilin = 5 Tahun" },
    { label: "Seluruhnya", value: "max", title: "Seluruh Riwayat Historis" },
  ];

  // Helper format tanggal & jam yang adaptif terhadap resolusi lilin
  const formatTimeDisplay = (time) => {
    if (!time) return "-";
    if (typeof time === "number") {
      const d = new Date(time * 1000);
      if (range === "1y" || range === "12m") {
        return `Tahun ${d.getFullYear()}`;
      }
      if (range === "6mo") {
        const sem = d.getMonth() < 6 ? "Semester 1" : "Semester 2";
        return `${sem} ${d.getFullYear()}`;
      }
      if (range === "3mo") {
        const q = Math.floor(d.getMonth() / 3) + 1;
        return `Kuartal ${q} (Q${q}) ${d.getFullYear()}`;
      }
      if (range === "1mo") {
        return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      }
      if (range === "1d" || range === "1w") {
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
      }
      return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return time;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const container = chartContainerRef.current;

    // Warna tema otomatis
    const textColor = isDarkMode ? "#94a3b8" : "#64748b";
    const gridColor = isDarkMode ? "rgba(30, 41, 59, 0.45)" : "rgba(241, 245, 249, 0.9)";
    const upColor = "#10b981"; // Emerald green
    const downColor = "#ef4444"; // Rose red

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 440,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: textColor,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        vertLine: {
          color: isDarkMode ? "#475569" : "#cbd5e1",
          width: 1,
          style: 3,
        },
        horzLine: {
          color: isDarkMode ? "#475569" : "#cbd5e1",
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: gridColor,
        scaleMargins: {
          top: 0.08,
          bottom: 0.22,
        },
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 0,
      },
    });

    chartInstanceRef.current = chart;

    let mainSeries;

    if (chartType === "area") {
      const isOverallUp =
        activeCandles.length > 1
          ? activeCandles[activeCandles.length - 1].close >= activeCandles[0].open
          : true;
      const lineColor = isOverallUp ? upColor : downColor;
      const topColor = isOverallUp ? "rgba(16, 185, 129, 0.32)" : "rgba(239, 68, 68, 0.32)";
      const bottomColor = isOverallUp ? "rgba(16, 185, 129, 0.0)" : "rgba(239, 68, 68, 0.0)";

      mainSeries = chart.addSeries(AreaSeries, {
        lineColor: lineColor,
        topColor: topColor,
        bottomColor: bottomColor,
        lineWidth: 2.5,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        crosshairMarkerBorderColor: "#ffffff",
        crosshairMarkerBackgroundColor: lineColor,
        priceLineVisible: true,
        priceFormat: {
          type: "price",
          precision: 0,
          minMove: 1,
        },
      });

      if (activeCandles && activeCandles.length > 0) {
        const areaData = activeCandles.map((c) => ({
          time: c.time,
          value: c.close,
        }));
        mainSeries.setData(areaData);
      }
    } else {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: upColor,
        downColor: downColor,
        borderVisible: false,
        wickUpColor: upColor,
        wickDownColor: downColor,
        priceFormat: {
          type: "price",
          precision: 0,
          minMove: 1,
        },
      });

      if (activeCandles && activeCandles.length > 0) {
        mainSeries.setData(activeCandles);
      }
    }

    mainSeriesRef.current = mainSeries;

    // 2. Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#64748b",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });

    if (activeCandles && activeCandles.length > 0) {
      const volumeData = activeCandles.map((c) => ({
        time: c.time,
        value: c.volume || 0,
        color: c.close >= c.open ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)",
      }));
      volumeSeries.setData(volumeData);

      // Bentangkan grafik sampai mentok ujung kiri & kanan agar tidak ada area kosong
      if (activeCandles.length > 1 && container.clientWidth) {
        const optimalBarSpacing = Math.max(container.clientWidth / (activeCandles.length - 1), 6);
        chart.timeScale().applyOptions({ barSpacing: optimalBarSpacing });
      }
      chart.timeScale().fitContent();
    }

    volumeSeriesRef.current = volumeSeries;

    // Subscribe hover crosshair
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }
      const data = param.seriesData.get(mainSeries);
      if (data) {
        setHoverData({
          ...data,
          time: param.time,
        });
      } else {
        setHoverData(null);
      }
    });

    // Otomatis tarik data masa lalu ketika pengguna menggeser grafik mendekati batas kiri
    chart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
      if (!logicalRange) return;
      if (logicalRange.from < 5 && !isLoadingHistoryRef.current) {
        loadOlderHistory();
      }
    });

    // Resize observer
    const handleResize = () => {
      if (container && chart) {
        chart.applyOptions({ width: container.clientWidth });
        if (activeCandles.length > 1) {
          const optimalBarSpacing = Math.max(container.clientWidth / (activeCandles.length - 1), 6);
          chart.timeScale().applyOptions({ barSpacing: optimalBarSpacing });
        }
        chart.timeScale().fitContent();
      }
    };

    window.addEventListener("resize", handleResize);

    // Listener Fullscreen API untuk resize chart otomatis ke tinggi layar penuh
    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFs);
      if (chart && container) {
        setTimeout(() => {
          const newWidth = container.clientWidth;
          const newHeight = isFs ? Math.max(window.innerHeight - 150, 520) : 460;
          chart.applyOptions({ width: newWidth, height: newHeight });
          chart.timeScale().fitContent();
        }, 80);
      }
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [activeCandles, isDarkMode, chartType, range]);

  const toggleFullscreen = () => {
    const el = chartWrapperRef.current;
    if (!el) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  const activeCandle =
    hoverData || (activeCandles.length > 0 ? activeCandles[activeCandles.length - 1] : null);
  const isUp = activeCandle
    ? chartType === "area"
      ? (activeCandle.value ?? activeCandle.close) >= (activeCandles[0]?.close ?? 0)
      : activeCandle.close >= activeCandle.open
    : true;

  const currentPrice =
    chartType === "area"
      ? activeCandle?.value ?? activeCandle?.close ?? 0
      : activeCandle?.close ?? 0;

  return (
    <div
      ref={chartWrapperRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-white dark:bg-[#080808] p-6 overflow-y-auto space-y-3"
          : "w-full space-y-2 bg-transparent p-0 border-0"
      }
    >
      {/* 1. TOP CONTROLS BAR: Candle/Garis Toggle & Timeframe Selector Sebelahan (Persis Seperti Dashboard) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
        {/* Sisi Kiri: Status Lilin Terkini */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{symbol}</span>
          {activeCandle && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isUp
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                  : "bg-rose-950/80 text-rose-400 border border-rose-800/60"
              }`}
            >
              {isUp ? "BULLISH" : "BEARISH"}
            </span>
          )}
        </div>

        {/* Sisi Kanan: Toggle Candle/Garis + Timeframe Sebelahan (Tanpa Container Box di Belakang) */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* TOGGLE: Candlestick vs Garis / Area */}
          <div className="inline-flex items-center bg-transparent p-0 gap-1 shrink-0">
            <button
              onClick={() => setChartType("candle")}
              title="Tampilan Grafik Candlestick Lilin (OHLC)"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartType === "candle"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 3v4m0 10v4M6 7h6v10H6zM17 6v3m0 8v4M14 9h6v8h-6z" />
              </svg>
              <span>Candle</span>
            </button>
            <button
              onClick={() => setChartType("area")}
              title="Tampilan Grafik Garis / Area"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartType === "area"
                  ? (isUp ? "bg-emerald-600 text-white shadow-sm" : "bg-rose-600 text-white shadow-sm")
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 3v18h18M7 16l4-5 4 3 6-7" />
              </svg>
              <span>Garis</span>
            </button>
          </div>

          {/* Timeframe Selector Sebelahan (Tanpa Container Box di Belakang) */}
          <div className="inline-flex items-center bg-transparent p-0 gap-1 shrink-0">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => onRangeChange && onRangeChange(r.value)}
                title={r.title}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  range === r.value
                    ? "bg-slate-200 text-slate-900 dark:bg-[#2a2e39] dark:text-white font-bold"
                    : "text-slate-600 hover:text-slate-900 dark:text-[#787b86] dark:hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SUB-BAR: Info Harga & Detail Saat Hover */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
        {activeCandle ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span className="font-bold">{symbol}</span>
              <span className="text-slate-400 font-normal">
                ({formatTimeDisplay(activeCandle.time)})
              </span>
            </div>

            {chartType === "candle" && activeCandle.open != null ? (
              <>
                <div>
                  <span className="text-slate-400">O: </span>
                  <span className="font-mono font-medium">
                    Rp {Number(activeCandle.open).toLocaleString("id-ID")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">H: </span>
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    Rp {Number(activeCandle.high).toLocaleString("id-ID")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">L: </span>
                  <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
                    Rp {Number(activeCandle.low).toLocaleString("id-ID")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">C: </span>
                  <span
                    className={`font-mono font-bold ${
                      isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    Rp {Number(activeCandle.close).toLocaleString("id-ID")}
                  </span>
                </div>
              </>
            ) : (
              <div>
                <span className="text-slate-400">Harga: </span>
                <span
                  className={`font-mono font-bold text-sm ${
                    isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  Rp {Number(currentPrice).toLocaleString("id-ID")}
                </span>
              </div>
            )}

            {activeCandle.volume ? (
              <div>
                <span className="text-slate-400">Vol: </span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {Number(activeCandle.volume).toLocaleString("id-ID")}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            Arahkan kursor pada area grafik untuk melihat rincian harga.
          </div>
        )}
      </div>

      {/* 3. CHART CANVAS CONTAINER (TANPA CONTAINER LATAR DI BELAKANG) */}
      <div className="relative overflow-hidden bg-transparent border-0 shadow-none my-1">
        <div ref={chartContainerRef} className="w-full" style={{ minHeight: isFullscreen ? "calc(100vh - 200px)" : "440px" }} />
      </div>

      {/* 4. TOOLBAR BAWAH: IKON KONTROL TRADINGVIEW PERSIS SEPERTI DASHBOARD */}
      <div className="flex items-center justify-end gap-1.5 pt-1 pb-1 bg-transparent select-none">
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Ikon Garis Area */}
          <button
            onClick={() => setChartType("area")}
            title="Ubah ke Grafik Garis / Area"
            className={`p-1 bg-transparent border-0 transition-colors cursor-pointer ${
              chartType === "area"
                ? "text-slate-900 dark:text-white font-bold"
                : "text-slate-400 hover:text-slate-800 dark:text-[#787b86] dark:hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 3v18h18M7 16l4-5 4 3 6-7" />
            </svg>
          </button>

          {/* Ikon Candlestick */}
          <button
            onClick={() => setChartType("candle")}
            title="Ubah ke Grafik Candlestick Lilin"
            className={`p-1 bg-transparent border-0 transition-colors cursor-pointer ${
              chartType === "candle"
                ? "text-slate-900 dark:text-white font-bold"
                : "text-slate-400 hover:text-slate-800 dark:text-[#787b86] dark:hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 3v4m0 10v4M6 7h6v10H6zM17 6v3m0 8v4M14 9h6v8h-6z" />
            </svg>
          </button>

          {/* Ikon Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar Layar Penuh (Esc)" : "Mode Layar Penuh"}
            className="p-1 text-slate-400 hover:text-slate-800 dark:text-[#787b86] dark:hover:text-white bg-transparent border-0 transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7m-7 17l7-7m0 0v6m0-6h-6M4 4l7 7m0 0V4m0 7H4" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
