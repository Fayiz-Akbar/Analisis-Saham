import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
} from "lightweight-charts";
import {
  TrendingUp,
  BarChart2,
  Maximize2,
  Minimize2,
  Clock,
  Layers,
} from "lucide-react";

export default function TradingViewChart({
  candles = [],
  range = "1y",
  onRangeChange,
  isDarkMode = false,
  symbol = "BBCA",
}) {
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
    "1d": "5d",
    "5d": "1mo",
    "1mo": "3mo",
    "3mo": "6mo",
    "6mo": "1y",
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

  // Timeframe selector
  const ranges = [
    { label: "1D", value: "1d", title: "1 Hari (Intraday Menit)" },
    { label: "1Mgg", value: "5d", title: "1 Minggu Bursa" },
    { label: "1Bln", value: "1mo", title: "1 Bulan" },
    { label: "3Bln", value: "3mo", title: "3 Bulan" },
    { label: "6Bln", value: "6mo", title: "6 Bulan" },
    { label: "1Th", value: "1y", title: "1 Tahun" },
    { label: "5Th", value: "5y", title: "5 Tahun" },
    { label: "Seluruhnya", value: "max", title: "Semua Riwayat Historis" },
  ];

  // Helper format tanggal & jam
  const formatTimeDisplay = (time) => {
    if (!time) return "-";
    if (typeof time === "number") {
      const d = new Date(time * 1000);
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
        fixRightEdge: true,
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

      // Jika dalam mode 1D, fokuskan ke 60 candle terakhir (sesi perdagangan hari ini)
      // Namun data hari-hari sebelumnya tetap tersimpan di sebelah kiri sehingga saat di-drag langsung tampil!
      if (range === "1d" && activeCandles.length > 60) {
        chart.timeScale().setVisibleLogicalRange({
          from: activeCandles.length - 60,
          to: activeCandles.length - 1,
        });
      } else {
        chart.timeScale().fitContent();
      }
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
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [activeCandles, isDarkMode, chartType]);

  const toggleFullscreen = () => {
    const el = chartContainerRef.current?.parentElement;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
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
    <div className="space-y-3">
      {/* Top Bar: Info Harga & Detail Saat Hover */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
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

      {/* Chart Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div ref={chartContainerRef} className="w-full" style={{ minHeight: "440px" }} />
      </div>

      {/* Bottom Controls Bar (Sesuai Layout Screenshot Pengguna) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Left: Timeframe Range Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => onRangeChange && onRangeChange(r.value)}
              title={r.title}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === r.value
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Right: Chart Type Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {/* Mode Area / Line Chart */}
          <button
            onClick={() => setChartType("area")}
            title="Tampilan Grafik Garis / Area (Gradient)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === "area"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Garis / Area</span>
          </button>

          {/* Mode Candlestick */}
          <button
            onClick={() => setChartType("candle")}
            title="Tampilan Grafik Candlestick Lilin (OHLC)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === "candle"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Candlestick</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
