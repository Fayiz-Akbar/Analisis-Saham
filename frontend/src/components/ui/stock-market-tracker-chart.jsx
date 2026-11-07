import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
} from "lightweight-charts";

/**
 * Format angka ke standar finansial Indonesia:
 * Pemisah ribuan dengan titik (.) dan desimal dengan koma (,)
 */
export function formatIDR(val, decimals = 2) {
  if (val == null || isNaN(val)) return "—";
  return Number(val).toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format angka presisi 4 desimal persis bursa indeks BEI (4.925,7320)
 */
export function formatIndexPrice(val, decimals = 4) {
  if (val == null || isNaN(val)) return "—";
  return Number(val).toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format volume saham (Juta / Miliar lembar)
 */
export function formatVolumeID(val) {
  if (val == null || isNaN(val) || val <= 0) return "—";
  const num = Number(val);
  if (num >= 1e9) {
    return `${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Miliar`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Juta`;
  }
  return `${num.toLocaleString("id-ID")} Lembar`;
}

/**
 * Format nilai transaksi (Triliun / Miliar Rupiah)
 */
export function formatTurnoverID(val) {
  if (val == null || isNaN(val) || val <= 0) return "—";
  const num = Number(val);
  if (num >= 1e12) {
    return `Rp ${(num / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Triliun`;
  }
  if (num >= 1e9) {
    return `Rp ${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Miliar`;
  }
  return `Rp ${num.toLocaleString("id-ID")}`;
}

// Data Ticker Tape Awal (Sesuai Emiten IDX80)
const DEFAULT_TAPE_ITEMS = [
  { symbol: "AMMN", price: 10650, changePercent: 5.45 },
  { symbol: "GOTO", price: 68, changePercent: -4.22 },
  { symbol: "AMRT", price: 3180, changePercent: 3.58 },
  { symbol: "UNVR", price: 2310, changePercent: -3.75 },
  { symbol: "BBNI", price: 5450, changePercent: -2.50 },
  { symbol: "TOWR", price: 815, changePercent: -2.39 },
  { symbol: "MDKA", price: 2460, changePercent: -2.18 },
  { symbol: "BBRI", price: 4980, changePercent: 3.11 },
  { symbol: "BBCA", price: 10250, changePercent: 0.74 },
  { symbol: "TLKM", price: 2940, changePercent: 1.03 },
  { symbol: "ASII", price: 4880, changePercent: -1.41 },
  { symbol: "BMRI", price: 6800, changePercent: 1.87 },
  { symbol: "ICBP", price: 11950, changePercent: 0.84 },
  { symbol: "ADRO", price: 3720, changePercent: 2.48 },
  { symbol: "BREN", price: 6850, changePercent: -2.14 },
  { symbol: "PTBA", price: 2890, changePercent: 0.35 },
  { symbol: "ANTM", price: 1580, changePercent: 3.27 },
  { symbol: "INCO", price: 4120, changePercent: -0.96 },
  { symbol: "BRPT", price: 1060, changePercent: 1.92 },
  { symbol: "CPIN", price: 5150, changePercent: -1.44 },
];

/**
 * Hook untuk deteksi sinkronisasi mode terang / gelap
 */
export function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/**
 * =========================================================================
 * KOMPONEN: RUNNING TICKER TAPE (SCROLL KE ARAH KIRI - LEBAR PENUH & SANTAI)
 * Menampilkan pita harga saham real-time yang bergerak mulus ke kiri tanpa lingkaran
 * =========================================================================
 */
export const Idx80TickerTapeBar = ({ className = "" }) => {
  const [tapeItems, setTapeItems] = useState(DEFAULT_TAPE_ITEMS);
  const isDark = useIsDarkMode();

  useEffect(() => {
    let isMounted = true;
    async function fetchTape() {
      try {
        const res = await fetch("http://localhost:5000/api/stocks/ticker-tape");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setTapeItems(
            json.data.map((item) => ({
              symbol: item.symbol,
              price: item.price,
              changePercent: item.changePercent,
            }))
          );
        }
      } catch {
        // Fallback ke DEFAULT_TAPE_ITEMS jika offline
      }
    }
    fetchTape();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={`w-full overflow-hidden bg-slate-100 dark:bg-[#0a0d14] border-b border-slate-200 dark:border-white/[0.08] flex items-center h-10 select-none ${className}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      {/* Badge Tetap di Kiri: IDX80 TAPE (Bersih & Elegan, Tanpa Lingkaran) */}
      <div className="z-20 flex-shrink-0 flex items-center px-4 h-full bg-slate-200 dark:bg-[#0e121c] border-r border-slate-300 dark:border-white/[0.08] shadow-xs dark:shadow-md">
        <span className="text-[11px] font-black tracking-widest text-slate-800 dark:text-slate-100 uppercase">
          IDX80 TAPE
        </span>
      </div>

      {/* Track Bergerak Tanpa Putus (Infinite Marquee Berjalan Santai) */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        {/* Masking Gradient Halus di Sisi Kiri & Kanan */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 dark:from-[#0a0d14] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-100 dark:from-[#0a0d14] to-transparent z-10" />

        <div className="animate-tape-scroll flex items-center gap-7 pl-6 pr-6 cursor-default">
          {/* Duplikasi data 2x agar animasi loop berjalan seamless tanpa jeda */}
          {[...tapeItems, ...tapeItems].map((item, idx) => {
            const isUp = item.changePercent >= 0;
            return (
              <div
                key={`${item.symbol}-${idx}`}
                className="flex items-center gap-2 text-xs flex-shrink-0 whitespace-nowrap group transition-opacity hover:opacity-80"
              >
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {item.symbol}
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
                  {item.price ? Number(item.price).toLocaleString("id-ID") : "—"}
                </span>
                <span
                  className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded ${
                    isUp
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30"
                      : "text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/30"
                  }`}
                >
                  {isUp ? `+${item.changePercent?.toFixed(2)}%` : `${item.changePercent?.toFixed(2)}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Generator deret waktu harga IHSG & IDX80 presisi (Fallback jika data server sedang dimuat)
 */
const generateIndexFallbackSeries = (period, basePrice = 4992.381, isIHSG = true) => {
  const norm = (period || "1d").toLowerCase();

  if (norm === "1d") {
    const slots = [];
    for (let m = 540; m <= 960; m += 5) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }
    const TICK_TIMES = new Set([
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
    ]);
    return slots.map((timeStr, idx) => {
      const progress = idx / (slots.length - 1);
      const wave = Math.sin(idx * 0.3) * (isIHSG ? 25 : 0.8) + Math.cos(idx * 0.5) * (isIHSG ? 15 : 0.5);
      const priceVal = basePrice - 30 + progress * 40 + wave;
      const isTick = TICK_TIMES.has(timeStr);
      const dotTime = timeStr.replace(":", ".");
      const close = Number(priceVal.toFixed(4));
      const open = Number((priceVal - Math.sin(idx * 0.6) * (isIHSG ? 8 : 0.25)).toFixed(4));
      const high = Number((Math.max(open, close) + Math.abs(Math.sin(idx * 1.3)) * (isIHSG ? 10 : 0.35)).toFixed(4));
      const low = Number((Math.min(open, close) - Math.abs(Math.cos(idx * 1.1)) * (isIHSG ? 8 : 0.3)).toFixed(4));
      return {
        time: 1793930400 + idx * 300,
        index: idx,
        price: close,
        open,
        high,
        low,
        close,
        volume: 12 + (idx % 6) * 2,
        vol24hFormatted: isIHSG ? "Rp 11,85T" : "Rp 13,73T",
        isSpike: idx % 7 === 3,
        xAxisLabel: isTick ? dotTime : "",
        isTransition: false,
        dateLabel: "19 Okt '26",
        timeDetail: `${timeStr} UTC+7`,
        fullDate: `19 Okt '26 • ${timeStr} UTC+7`,
      };
    });
  }

  const pointsCount = norm === "1m" ? 21 : norm === "1y" ? 239 : 60;
  return Array.from({ length: pointsCount }, (_, i) => {
    const progress = i / (pointsCount - 1);
    const wave = Math.sin(i * 0.2) * (isIHSG ? 50 : 1.2);
    const priceVal = basePrice - 80 + progress * 100 + wave;
    let xAxisLabel = "";
    let isTransition = false;
    let dateLabel = "19 Okt '26";

    if (norm === "1m") {
      const days = [21, 22, 23, 24, 25, 28, 29, 30, 1, 2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 19];
      const d = days[i] || (i + 1);
      if (i === 8) {
        xAxisLabel = "Okt";
        isTransition = true;
        dateLabel = "1 Okt '26";
      } else if (i % 2 === 0 || i === pointsCount - 1) {
        xAxisLabel = String(d);
        dateLabel = `${d} ${i < 8 ? "Sep" : "Okt"} '26`;
      }
    } else if (norm === "1y") {
      const monthNames = ["Nov", "Des", "2026", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt"];
      if (i % 20 === 10) {
        const mIdx = Math.floor(i / 20);
        xAxisLabel = monthNames[mIdx] || "";
        isTransition = xAxisLabel === "2026";
      }
    }

    const close = Number(priceVal.toFixed(4));
    const open = Number((priceVal - Math.sin(i * 0.5) * (isIHSG ? 15 : 0.4)).toFixed(4));
    const high = Number((Math.max(open, close) + Math.abs(Math.sin(i * 1.1)) * (isIHSG ? 20 : 0.6)).toFixed(4));
    const low = Number((Math.min(open, close) - Math.abs(Math.cos(i * 0.9)) * (isIHSG ? 18 : 0.5)).toFixed(4));

    return {
      time: 1793930400 - (pointsCount - i) * 86400,
      index: i,
      price: close,
      open,
      high,
      low,
      close,
      volume: 15 + (i % 5) * 3,
      vol24hFormatted: isIHSG ? "Rp 11,85T" : "Rp 13,73T",
      isSpike: i % 7 === 3,
      xAxisLabel,
      isTransition,
      dateLabel,
      timeDetail: "",
      fullDate: dateLabel,
    };
  });
};

/**
 * Status Jam Perdagangan Bursa Efek Indonesia (WIB) dengan bahasa manusia
 */
export function getLiveMarketStatus() {
  const now = new Date();
  const jakartaStr = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const jTime = new Date(jakartaStr);
  const day = jTime.getDay(); // 0 = Minggu, 1 = Senin, ..., 5 = Jumat, 6 = Sabtu
  const h = jTime.getHours();
  const m = jTime.getMinutes();
  const timeFormatted = `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
  const totalMin = h * 60 + m;

  if (day >= 1 && day <= 4) {
    if (totalMin < 540) {
      return {
        isOpen: false,
        text: `${timeFormatted} WIB • Pasar Belum Buka (Buka Sesi I jam 09.00 WIB)`,
      };
    } else if (totalMin >= 540 && totalMin <= 720) {
      return {
        isOpen: true,
        text: `${timeFormatted} WIB • Pasar Sedang Buka (Sesi I)`,
      };
    } else if (totalMin > 720 && totalMin < 810) {
      return {
        isOpen: false,
        text: `${timeFormatted} WIB • Istirahat Siang (Buka Sesi II jam 13.30 WIB)`,
      };
    } else if (totalMin >= 810 && totalMin <= 960) {
      return {
        isOpen: true,
        text: `${timeFormatted} WIB • Pasar Sedang Buka (Sesi II)`,
      };
    } else {
      return {
        isOpen: false,
        text: `${timeFormatted} WIB • Pasar Sudah Tutup (Buka besok 09.00 WIB)`,
      };
    }
  } else if (day === 5) {
    if (totalMin < 540) {
      return {
        isOpen: false,
        text: `${timeFormatted} WIB • Pasar Belum Buka (Buka Sesi I jam 09.00 WIB)`,
      };
    } else if (totalMin >= 540 && totalMin <= 690) {
      return {
        isOpen: true,
        text: `${timeFormatted} WIB • Pasar Sedang Buka (Sesi I)`,
      };
    } else if (totalMin > 690 && totalMin < 840) {
      return {
        isOpen: false,
        text: `${timeFormatted} WIB • Istirahat Jumat (Buka Sesi II jam 14.00 WIB)`,
      };
    } else if (totalMin >= 840 && totalMin <= 960) {
      return {
        isOpen: true,
        text: `${timeFormatted} WIB • Pasar Sedang Buka (Sesi II)`,
      };
    } else {
      return {
        isOpen: false,
        text: `${timeFormatted} WIB • Pasar Sudah Tutup (Buka Senin 09.00 WIB)`,
      };
    }
  } else {
    return {
      isOpen: false,
      text: `${timeFormatted} WIB • Pasar Libur Akhir Pekan (Buka Senin 09.00 WIB)`,
    };
  }
}

/**
 * =========================================================================
 * CUSTOM TOOLTIP PERSIS FOTO REFERENSI PENGGUNA
 * Format:
 * Line 1: 4.925,7320 (Bold White)
 * Line 2: 19 Okt '26 (Gray)
 * Line 3: 09:47 UTC+7 (Hanya untuk 1D)
 * =========================================================================
 */
function InstitutionalTooltip({ active, payload, period, chartType = "candle" }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  if (!data) return null;

  const is1D = period === "1d" || period === "1D";
  const hasOHLC = data.open != null && data.high != null && data.low != null && data.close != null;
  const isBullish = hasOHLC ? data.close >= data.open : true;

  return (
    <div
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      className="bg-[#121622]/95 border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-2xl text-xs select-none min-w-[145px] pointer-events-none backdrop-blur-md"
    >
      {/* Baris 1: Angka Harga Presisi 4 Desimal Tebal Putih + Status Bullish/Bearish */}
      <div className="text-sm font-bold font-mono text-white mb-1 flex items-center justify-between gap-3">
        <span>{formatIndexPrice(data.close || data.price)}</span>
        {hasOHLC && (
          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
            isBullish
              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-950/60 text-rose-400 border border-rose-500/30"
          }`}>
            {isBullish ? "Naik" : "Turun"}
          </span>
        )}
      </div>

      {/* Rincian OHLC khusus Candlestick */}
      {hasOHLC && chartType === "candle" && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] font-mono mb-1.5 pb-1.5 border-b border-white/10">
          <div><span className="text-slate-400">O: </span><span className="text-slate-200">{formatIndexPrice(data.open)}</span></div>
          <div><span className="text-slate-400">H: </span><span className="text-emerald-400">{formatIndexPrice(data.high)}</span></div>
          <div><span className="text-slate-400">L: </span><span className="text-rose-400">{formatIndexPrice(data.low)}</span></div>
          <div><span className="text-slate-400">C: </span><span className="text-slate-200">{formatIndexPrice(data.close)}</span></div>
        </div>
      )}

      {/* Baris 2: Tanggal */}
      <div className="text-[11px] text-slate-300 font-sans leading-tight">
        {data.dateLabel || data.fullDate || "19 Okt '26"}
      </div>
      {/* Baris 3: Jam khusus untuk 1D */}
      {is1D && (
        <div className="text-[11px] text-slate-400 font-sans leading-tight mt-0.5">
          {data.timeDetail || "09:47 UTC+7"}
        </div>
      )}
    </div>
  );
}

/**
 * Candlestick Shape Component untuk Recharts
 * Menggambar lilin Jepang (Wick + Body) dengan standar bursa TradingView:
 * Hijau Emerald (#0ecb81) saat Bullish (close >= open)
 * Merah Crimson (#f6465d) saat Bearish (close < open)
 */
function CandleShape(props) {
  const { x, width, background, payload, yDomain = [] } = props;
  if (!payload || x == null || width == null) return null;

  const top = background?.y ?? 25;
  const height = background?.height ?? 310;
  const domainMin = yDomain[0] ?? 4900;
  const domainMax = yDomain[1] ?? 5150;
  const range = domainMax - domainMin || 1;

  const getY = (val) => {
    if (val == null || isNaN(val)) return top + height / 2;
    return top + ((domainMax - Number(val)) / range) * height;
  };

  const o = payload.open ?? payload.price;
  const h = payload.high ?? Math.max(o, payload.price);
  const l = payload.low ?? Math.min(o, payload.price);
  const c = payload.close ?? payload.price;

  const isBullish = c >= o;
  const color = isBullish ? "#0ecb81" : "#f6465d";

  const cx = x + width / 2;
  const yH = getY(h);
  const yL = getY(l);
  const yO = getY(o);
  const yC = getY(c);

  const candleW = Math.max(2.5, Math.min(10, width * 0.72));
  const bodyY = Math.min(yO, yC);
  const bodyHeight = Math.max(Math.abs(yC - yO), 1.5);

  return (
    <g className="recharts-candlestick-layer cursor-pointer transition-opacity hover:opacity-90">
      {/* Sumbu Lilin (Wick: High to Low) */}
      <line
        x1={cx}
        y1={yH}
        x2={cx}
        y2={yL}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      {/* Badan Lilin (Body: Open to Close) */}
      <rect
        x={cx - candleW / 2}
        y={bodyY}
        width={candleW}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth={1}
        rx={1}
      />
    </g>
  );
}

// Opsi Timeframe Sesuai Foto Referensi
const TIMEFRAMES = [
  { id: "1d", label: "1D" },
  { id: "1m", label: "1Bln" },
  { id: "3m", label: "3Bln" },
  { id: "1y", label: "1Th" },
  { id: "5y", label: "5Th" },
  { id: "max", label: "Seluruhnya" },
];

/**
 * =========================================================================
 * KOMPONEN UTAMA: HERO MARKET OVERVIEW CHART (IHSG / IDX80 FULL WIDTH)
 * UI Original Dipertahankan:
 * - Desain Kartu Dark Premium (bg-[#0b0e17] dengan Border Halus)
 * - Garis Kurva Glowing Putih Bersih di Atas Kanvas Gelap
 * - Histogram Bar Volume di Kuadran Bawah
 * - Overlay Statistik Institusional di Kiri Atas
 * - Real-Time Interaktif: Header & Statistik Mengalir Saat Kursor Digerakkan
 * - Timeframe Bawah: 1D, 1Bln, 3Bln, 1Th, 5Th, Seluruhnya
 * - Sumbu X Presisi: 09.00-16.00 (1D), 21-19 Okt (1Bln), Nov-Okt 2026 (1Th)
 * - 7 Indikator Finansial Lengkap di Bagian Bawah
 * =========================================================================
 */
export const HeroMarketChart = ({ className = "" }) => {
  const isDark = useIsDarkMode();
  const [selectedIndex, setSelectedIndex] = useState("IHSG");
  const [selectedPeriod, setSelectedPeriod] = useState("1d");
  const [chartType, setChartType] = useState("candle"); // "candle" | "area"
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Status jam pasar berjalan real-time (update setiap 10 detik)
  const [liveMarketStatus, setLiveMarketStatus] = useState(getLiveMarketStatus);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveMarketStatus(getLiveMarketStatus());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // State untuk kursor hover agar harga & volume di header berubah mengikuti titik grafik
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const mainWrapperRef = useRef(null);
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const mainSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  const isIHSG = selectedIndex === "IHSG";

  // Ambil data riil dari backend setiap kali indeks atau periode berubah
  useEffect(() => {
    let isMounted = true;
    async function fetchMarketData() {
      setIsLoading(true);
      try {
        const url = `http://localhost:5000/api/stocks/market-overview?symbol=${selectedIndex}&period=${selectedPeriod}`;
        const res = await fetch(url);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setMarketData(json.data);
        }
      } catch (err) {
        console.warn("Gagal memuat overview pasar riil:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchMarketData();
    return () => {
      isMounted = false;
    };
  }, [selectedIndex, selectedPeriod]);

  // Statistik & Metrik Riil dari Backend
  const stats = marketData?.statistics || {};

  // Harga & Perubahan Indeks Riil
  const basePrice = marketData?.price ?? (isIHSG ? 5050.429 : 143.25);
  const changeAmount = marketData?.changeAmount ?? (isIHSG ? 20.17 : 1.15);
  const changePercent = marketData?.changePercent ?? (isIHSG ? 0.40 : 0.81);

  // Data Candlestick Tersanitasi Khusus TradingView Lightweight Charts
  const chartCandles = useMemo(() => {
    let raw = [];
    if (marketData?.chartData && Array.isArray(marketData.chartData) && marketData.chartData.length > 0) {
      raw = marketData.chartData;
    } else {
      raw = generateIndexFallbackSeries(selectedPeriod, basePrice, isIHSG);
    }

    const baseDate = new Date();
    baseDate.setHours(9, 0, 0, 0);
    const baseTs = Math.floor(baseDate.getTime() / 1000);

    let lastTime = 0;
    const result = [];

    for (let i = 0; i < raw.length; i++) {
      const item = raw[i];
      let t = null;

      if (typeof item.time === "number" && item.time > 1000000) {
        t = item.time;
      } else if (item.timestamp) {
        const parsed = Math.floor(new Date(item.timestamp).getTime() / 1000);
        if (!isNaN(parsed) && parsed > 1000000) {
          t = parsed;
        }
      }

      if (!t || t <= lastTime) {
        t = lastTime > 0 ? lastTime + 300 : baseTs + i * 300;
      }

      if (t > lastTime) {
        lastTime = t;
        const o = Number(item.open ?? item.price);
        const c = Number(item.close ?? item.price);
        const h = Number(item.high ?? Math.max(o, c));
        const l = Number(item.low ?? Math.min(o, c));

        result.push({
          ...item,
          time: t,
          open: o,
          high: h,
          low: l,
          close: c,
          volume: item.volume || 1,
        });
      }
    }
    return result;
  }, [marketData, selectedPeriod, basePrice, isIHSG]);

  // Efek pembuatan grafik TradingView Lightweight Charts persis foto referensi
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Bersihkan kontainer jika ada elemen canvas sebelumnya
    chartContainerRef.current.innerHTML = "";
    chartInstanceRef.current = null;

    const container = chartContainerRef.current;
    const isDarkTheme = isDark;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: isDarkTheme ? "#080808" : "#ffffff" },
        textColor: isDarkTheme ? "rgb(106, 109, 120)" : "rgb(100, 116, 139)",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Trebuchet MS, sans-serif',
      },
      grid: {
        vertLines: { color: isDarkTheme ? "rgba(242, 242, 242, 0.06)" : "rgba(0, 0, 0, 0.06)" },
        horzLines: { color: isDarkTheme ? "rgba(242, 242, 242, 0.06)" : "rgba(0, 0, 0, 0.06)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDarkTheme ? "rgba(242, 242, 242, 0.22)" : "rgba(0, 0, 0, 0.22)",
          width: 1,
          style: LineStyle.Dotted,
          labelBackgroundColor: isDarkTheme ? "#1e222d" : "#475569",
        },
        horzLine: {
          color: isDarkTheme ? "rgba(242, 242, 242, 0.22)" : "rgba(0, 0, 0, 0.22)",
          width: 1,
          style: LineStyle.Dotted,
          labelBackgroundColor: isDarkTheme ? "#1e222d" : "#475569",
        },
      },
      rightPriceScale: {
        borderColor: isDarkTheme ? "rgba(242, 242, 242, 0.08)" : "rgba(0, 0, 0, 0.08)",
        visible: true,
        scaleMargins: {
          top: 0.08,
          bottom: 0.18,
        },
      },
      timeScale: {
        borderColor: isDarkTheme ? "rgba(242, 242, 242, 0.08)" : "rgba(0, 0, 0, 0.08)",
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 2,
        tickMarkFormatter: (time) => {
          if (typeof time === "number") {
            const d = new Date(time * 1000);
            const h = String(d.getHours()).padStart(2, "0");
            const min = String(d.getMinutes()).padStart(2, "0");
            if (selectedPeriod === "1d") {
              return `${h}.${min}`;
            }
            return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
          }
          return String(time);
        },
      },
      localization: {
        locale: "id-ID",
        priceFormatter: (price) => formatIndexPrice(price, 4),
      },
    });

    chartInstanceRef.current = chart;

    let mainSeries = null;
    if (chartType === "candle") {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22ab94",
        downColor: "#f7525f",
        borderUpColor: "#22ab94",
        borderDownColor: "#f7525f",
        wickUpColor: "#22ab94",
        wickDownColor: "#f7525f",
        priceFormat: {
          type: "custom",
          formatter: (p) => formatIndexPrice(p, 4),
          minMove: 0.0001,
        },
      });
      mainSeries.setData(
        chartCandles.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
    } else {
      const isOverallUp =
        chartCandles.length > 1
          ? chartCandles[chartCandles.length - 1].close >= chartCandles[0].open
          : true;
      const themeColor = isOverallUp ? "#22ab94" : "#f7525f";

      mainSeries = chart.addSeries(AreaSeries, {
        lineColor: themeColor,
        topColor: isOverallUp ? "rgba(34, 171, 148, 0.32)" : "rgba(247, 82, 95, 0.32)",
        bottomColor: isOverallUp ? "rgba(34, 171, 148, 0.0)" : "rgba(247, 82, 95, 0.0)",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: "#ffffff",
        crosshairMarkerBackgroundColor: themeColor,
        priceFormat: {
          type: "custom",
          formatter: (p) => formatIndexPrice(p, 4),
          minMove: 0.0001,
        },
      });
      mainSeries.setData(
        chartCandles.map((c) => ({
          time: c.time,
          value: c.close,
        }))
      );
    }
    mainSeriesRef.current = mainSeries;

    // Histogram Volume di kuadran bawah (15%)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "", // overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.84,
        bottom: 0,
      },
    });
    volumeSeries.setData(
      chartCandles.map((c) => ({
        time: c.time,
        value: c.volume || 1,
        color: c.close >= c.open ? "rgba(34, 171, 148, 0.35)" : "rgba(247, 82, 95, 0.35)",
      }))
    );
    volumeSeriesRef.current = volumeSeries;

    // Sinkronisasi Crosshair dengan HUD Header Real-Time
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredPoint(null);
        return;
      }
      const val = param.seriesData.get(mainSeries);
      if (val) {
        const match = chartCandles.find((c) => c.time === param.time);
        setHoveredPoint({
          open: val.open ?? val.value,
          high: val.high ?? val.value,
          low: val.low ?? val.value,
          close: val.close ?? val.value,
          price: val.close ?? val.value,
          volume: match?.volume,
          vol24hFormatted: match?.vol24hFormatted,
          fullDate: match?.fullDate || match?.dateLabel,
          dateLabel: match?.dateLabel,
          timeDetail: match?.timeDetail,
        });
      } else {
        setHoveredPoint(null);
      }
    });

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (container && chart) {
        chart.applyOptions({ width: container.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        chart.remove();
      } catch {
        // Abaikan jika sudah dibersihkan
      }
      chartInstanceRef.current = null;
    };
  }, [chartCandles, chartType, isDark, selectedPeriod]);

  // Listener Fullscreen API untuk sinkronisasi state & ukuran canvas
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFs);
      if (chartInstanceRef.current && chartContainerRef.current) {
        setTimeout(() => {
          const width = chartContainerRef.current.clientWidth;
          const height = isFs ? Math.max(window.innerHeight - 300, 480) : 420;
          chartInstanceRef.current.applyOptions({ width, height });
          chartInstanceRef.current.timeScale().fitContent();
        }, 80);
      }
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    const el = mainWrapperRef.current;
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

  // Nilai harga & volume aktif (mengikuti kursor hover atau nilai penutupan terakhir)
  const is1D = selectedPeriod === "1d";
  const firstPrice = chartCandles[0]?.open || chartCandles[0]?.price || basePrice;
  const referencePrice = is1D ? (stats.previousClose || firstPrice) : firstPrice;

  const activePrice = hoveredPoint?.close ?? hoveredPoint?.price ?? basePrice;
  const activeChange = hoveredPoint
    ? Number((activePrice - referencePrice).toFixed(4))
    : changeAmount;
  const activeChangePercent = referencePrice > 0
    ? Number(((activeChange / referencePrice) * 100).toFixed(2))
    : changePercent;
  const isUp = activeChange >= 0;

  const formattedPrice = isIHSG ? `Rp ${formatIndexPrice(activePrice)}` : `${formatIndexPrice(activePrice)}`;
  const formattedChange = `${isUp ? "+" : ""}${formatIndexPrice(activeChange)}`;

  // Nilai-nilai statistik dinamis
  const marketCapVal = stats.marketCap
    ? `${formatTurnoverID(stats.marketCap)} IDR`
    : (isIHSG ? "12.480,50T IDR" : "8.920,30T IDR");

  const activeVol24h = hoveredPoint?.vol24hFormatted || (stats.turnover ? formatTurnoverID(stats.turnover) : (isIHSG ? "Rp 11,85 Triliun" : "Rp 13,73 Triliun"));
  const volumeTxVal = `${activeVol24h} (${formatVolumeID(stats.volume)})`;

  const prevCloseOpenVal = `${formatIndexPrice(stats.previousClose ?? (isIHSG ? 5030.26 : 142.1))} / ${formatIndexPrice(stats.openPrice ?? (isIHSG ? 4954.24 : 142.65))}`;
  const dayRangeVal = `${formatIndexPrice(stats.dayLow ?? (isIHSG ? 4925.10 : 141.8))} - ${formatIndexPrice(stats.dayHigh ?? (isIHSG ? 5050.43 : 143.9))}`;
  const fiftyTwoWeekRangeVal = `${formatIndexPrice(stats.fiftyTwoWeekLow ?? (isIHSG ? 4824.36 : 124.5))} - ${formatIndexPrice(stats.fiftyTwoWeekHigh ?? (isIHSG ? 9174.47 : 156.2))}`;
  const pePbvVal = `${formatIDR(stats.peRatio ?? (isIHSG ? 13.45 : 14.1), 2)}x / ${formatIDR(stats.pbvRatio ?? (isIHSG ? 2.14 : 2.35), 2)}x`;

  const advancingCount = stats.advancing ?? (isIHSG ? 248 : 30);
  const decliningCount = stats.declining ?? (isIHSG ? 295 : 43);
  const unchangedCount = stats.unchanged ?? (isIHSG ? 215 : 7);

  // Lilin terkini untuk HUD Bar
  const latestCandle = chartCandles[chartCandles.length - 1] || {};
  const currentO = hoveredPoint?.open ?? latestCandle.open ?? basePrice;
  const currentH = hoveredPoint?.high ?? latestCandle.high ?? basePrice;
  const currentL = hoveredPoint?.low ?? latestCandle.low ?? basePrice;
  const currentC = hoveredPoint?.close ?? latestCandle.close ?? basePrice;
  const isCurrentBullish = currentC >= currentO;

  return (
    <div
      ref={mainWrapperRef}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      className={
        isFullscreen
          ? `fixed inset-0 z-50 bg-white dark:bg-[#080808] p-6 overflow-y-auto flex flex-col justify-between ${className}`
          : `w-full relative flex flex-col justify-between bg-transparent p-0 transition-colors ${className}`
      }
    >
      {/* ========================================================
          HEADER KARTU: SWITCHER INDEKS, JUDUL, TOGGLE CANDLE/GARIS, & TIMEFRAME
          (Semua Berdampingan Memanfaatkan Space, Tanpa Terpotong)
          ======================================================== */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        {/* Baris 1: Sisi Kiri (Indeks + Judul) & Sisi Kanan (Toggle Candle/Garis + Timeframe di Kanan) */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          {/* Sisi Kiri: Switcher Chips Indeks Bursa + Judul Indeks */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <div className="inline-flex items-center bg-transparent p-0 gap-1 shrink-0">
              <button
                onClick={() => setSelectedIndex("IHSG")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedIndex === "IHSG"
                    ? "bg-slate-200 text-slate-900 dark:bg-[#2a2e39] dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-[#787b86] dark:hover:text-white"
                }`}
              >
                IHSG
              </button>
              <button
                onClick={() => setSelectedIndex("IDX80")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedIndex === "IDX80"
                    ? "bg-slate-200 text-slate-900 dark:bg-[#2a2e39] dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-[#787b86] dark:hover:text-white"
                }`}
              >
                IDX80
              </button>
              <button
                onClick={() => setSelectedIndex("LQ45")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedIndex === "LQ45"
                    ? "bg-slate-200 text-slate-900 dark:bg-[#2a2e39] dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-[#787b86] dark:hover:text-white"
                }`}
              >
                LQ45
              </button>
            </div>

            {/* Judul Indeks */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight shrink-0">
              {selectedIndex === "IHSG" ? "IHSG (Indeks Gabungan)" : selectedIndex === "IDX80" ? "IDX80 (80 Terlikuid)" : "IDX LQ45 (Bluechip)"}
            </h1>
          </div>

          {/* Sisi Kanan: TOGGLE Candle/Garis + Timeframe Selector (Tanpa Container Box di Belakang) */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            {/* TOGGLE: Candlestick (Lilin) vs Garis / Area */}
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
                title="Tampilan Grafik Garis / Area (Watchlist Style)"
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
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setSelectedPeriod(tf.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedPeriod === tf.id
                      ? "bg-slate-200 text-slate-900 dark:bg-[#2a2e39] dark:text-white font-bold"
                      : "text-slate-600 hover:text-slate-900 dark:text-[#787b86] dark:hover:text-white"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Baris 2: Harga Real-Time, Perubahan, & Status Jam Pasar */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight transition-all">
            {formattedPrice}
          </span>
          <span
            className={`text-sm font-bold font-mono transition-all ${
              isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formattedChange}
          </span>
          <span
            className={`text-sm font-bold font-mono transition-all ${
              isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isUp ? `+${activeChangePercent.toFixed(2)}%` : `${activeChangePercent.toFixed(2)}%`}
          </span>

          {hoveredPoint ? (
            <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 transition-colors">
              {hoveredPoint.fullDate || hoveredPoint.dateLabel} • Vol: {hoveredPoint.vol24hFormatted || "—"}
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide transition-colors">
              {liveMarketStatus.text}
            </span>
          )}
        </div>
      </div>

      {/* ========================================================
          SUB-BAR KHUSUS CANDLESTICK: REAL-TIME OHLC
          ======================================================== */}
      {chartType === "candle" && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs py-2 my-1 font-mono text-slate-500 dark:text-slate-400">
          <div>
            <span className="text-slate-400 dark:text-slate-500">O: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{formatIndexPrice(currentO)}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">H: </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIndexPrice(currentH)}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">L: </span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{formatIndexPrice(currentL)}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">C: </span>
            <span className={`font-bold ${isCurrentBullish ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatIndexPrice(currentC)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">Vol: </span>
            <span className="text-slate-700 dark:text-slate-300">{hoveredPoint?.vol24hFormatted || activeVol24h}</span>
          </div>
        </div>
      )}

      {/* ========================================================
          AREA GRAFIK: TRADINGVIEW LIGHTWEIGHT CHARTS (TANPA CONTAINER/BORDER BERLEBIH)
          ======================================================== */}
      <div className={`relative w-full my-2 bg-transparent overflow-hidden ${isFullscreen ? "h-[calc(100vh-320px)] min-h-[480px]" : "h-[400px] sm:h-[440px]"}`}>
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* ========================================================
          TOOLBAR BAWAH: IKON KONTROL TRADINGVIEW (TANPA BORDER/CONTAINER DI BELAKANG)
          ======================================================== */}
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
            onClick={handleToggleFullscreen}
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

      {/* ========================================================
          BARIS STATISTIK PERGERAKAN SAHAM (TANPA CONTAINER DI BELAKANG)
          ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 my-1 text-xs bg-transparent border-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Emiten Menguat:</span>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">+{advancingCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Emiten Melemah:</span>
            <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400">-{decliningCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Stagnan:</span>
            <span className="font-mono font-extrabold text-slate-700 dark:text-slate-300">{unchangedCount}</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          Total Konstituen Pasar: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{isIHSG ? "945 Saham" : selectedIndex === "LQ45" ? "45 Saham" : "80 Saham"}</span>
        </div>
      </div>

      {/* ========================================================
          7 INDIKATOR METRIC PERGERAKAN PASAR (TANPA CONTAINER DI BELAKANG)
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
        {/* Indikator 1: Market Cap */}
        <div className="bg-transparent border-0 shadow-none p-1 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block">Kapitalisasi Pasar</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block truncate">
            {marketCapVal}
          </span>
        </div>

        {/* Indikator 2: Volume / Nilai Tx */}
        <div className="bg-transparent border-0 shadow-none p-1 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block">Nilai Tx (Volume)</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block truncate">
            {volumeTxVal}
          </span>
        </div>

        {/* Indikator 3: Rentang Harian */}
        <div className="bg-transparent border-0 shadow-none p-1 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block">Rentang Harian</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block truncate">
            {dayRangeVal}
          </span>
        </div>

        {/* Indikator 4: Rentang 52 Minggu */}
        <div className="bg-transparent border-0 shadow-none p-1 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block">Rentang 52 Mgg</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block truncate">
            {fiftyTwoWeekRangeVal}
          </span>
        </div>

        {/* Indikator 5: P/E & PBV */}
        <div className="bg-transparent border-0 shadow-none p-1 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block">P/E & PBV Ratio</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block truncate">
            {pePbvVal}
          </span>
        </div>

        {/* Indikator 6: Nilai Transaksi */}
        <div className="bg-transparent border-0 shadow-none p-1 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block">Nilai Transaksi</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
            {formatTurnoverID(stats.turnover ?? (isIHSG ? 11850000000000 : 13730681275700))}
          </span>
        </div>

        {/* Indikator 7: Rata-rata Volume */}
        <div className="bg-transparent border-0 shadow-none p-1 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block">Rata-rata Volume</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 block truncate">
            {formatVolumeID(stats.averageVolume ?? (isIHSG ? 16900000000 : 8400000000))}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * KOMPONEN KOMPOSIT: MARKET OVERVIEW SECTION
 * =========================================================================
 */
export const MarketOverviewSection = ({ className = "" }) => {
  return (
    <section className={`w-full ${className}`}>
      <HeroMarketChart />
    </section>
  );
};

// Default & Backward-compatibility exports
export const StockMarketTrackerChart = HeroMarketChart;
export const Component = MarketOverviewSection;
export default MarketOverviewSection;
