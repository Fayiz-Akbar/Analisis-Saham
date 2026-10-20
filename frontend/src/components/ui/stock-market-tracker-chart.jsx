import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

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
 * =========================================================================
 * KOMPONEN: RUNNING TICKER TAPE (SCROLL KE ARAH KIRI - LEBAR PENUH & SANTAI)
 * Menampilkan pita harga saham real-time yang bergerak mulus ke kiri tanpa lingkaran
 * =========================================================================
 */
export const Idx80TickerTapeBar = ({ className = "" }) => {
  const [tapeItems, setTapeItems] = useState(DEFAULT_TAPE_ITEMS);

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
      className={`w-full overflow-hidden bg-[#0a0d14] border-b border-white/[0.08] flex items-center h-10 select-none ${className}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      {/* Badge Tetap di Kiri: IDX80 TAPE (Bersih & Elegan, Tanpa Lingkaran) */}
      <div className="z-20 flex-shrink-0 flex items-center px-4 h-full bg-[#0e121c] border-r border-white/[0.08] shadow-md">
        <span className="text-[11px] font-black tracking-widest text-slate-100 uppercase">
          IDX80 TAPE
        </span>
      </div>

      {/* Track Bergerak Tanpa Putus (Infinite Marquee Berjalan Santai) */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        {/* Masking Gradient Halus di Sisi Kiri & Kanan */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0d14] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0d14] to-transparent z-10" />

        <div className="animate-tape-scroll flex items-center gap-7 pl-6 pr-6 cursor-default">
          {/* Duplikasi data 2x agar animasi loop berjalan seamless tanpa jeda */}
          {[...tapeItems, ...tapeItems].map((item, idx) => {
            const isUp = item.changePercent >= 0;
            return (
              <div
                key={`${item.symbol}-${idx}`}
                className="flex items-center gap-2 text-xs flex-shrink-0 whitespace-nowrap group transition-opacity hover:opacity-80"
              >
                <span className="font-extrabold text-white tracking-tight">
                  {item.symbol}
                </span>
                <span className="font-mono text-slate-300 font-semibold">
                  {item.price ? Number(item.price).toLocaleString("id-ID") : "—"}
                </span>
                <span
                  className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded ${
                    isUp
                      ? "text-emerald-400 bg-emerald-950/40 border border-emerald-500/30"
                      : "text-rose-400 bg-rose-950/40 border border-rose-500/30"
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
      return {
        index: idx,
        price: Number(priceVal.toFixed(4)),
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

    return {
      index: i,
      price: Number(priceVal.toFixed(4)),
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
function InstitutionalTooltip({ active, payload, period }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  if (!data) return null;

  const is1D = period === "1d" || period === "1D";

  return (
    <div
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      className="bg-[#181e2b] border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-2xl text-xs select-none min-w-[125px] pointer-events-none"
    >
      {/* Baris 1: Angka Harga Presisi 4 Desimal Tebal Putih */}
      <div className="text-sm font-bold font-mono text-white mb-0.5">
        {formatIndexPrice(data.price)}
      </div>
      {/* Baris 2: Tanggal (19 Okt '26 / 28 Sep '26 / 10 Feb '26) */}
      <div className="text-[11px] text-slate-300 font-sans leading-tight">
        {data.dateLabel || data.fullDate || "19 Okt '26"}
      </div>
      {/* Baris 3: Jam khusus untuk 1D (09:47 UTC+7) */}
      {is1D && (
        <div className="text-[11px] text-slate-400 font-sans leading-tight mt-0.5">
          {data.timeDetail || "09:47 UTC+7"}
        </div>
      )}
    </div>
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
  const [selectedIndex, setSelectedIndex] = useState("IHSG");
  const [selectedPeriod, setSelectedPeriod] = useState("1d");

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
  const basePrice = marketData?.price ?? (isIHSG ? 4992.381 : 143.25);
  const changeAmount = marketData?.changeAmount ?? (isIHSG ? -192.72 : -3.15);
  const changePercent = marketData?.changePercent ?? (isIHSG ? -3.72 : -2.15);

  // Status Jam Pasar Bursa Riil dari Backend
  const isMarketOpen = marketData?.marketOpen ?? false;
  const marketDetail = marketData?.marketDetail ?? "Libur Akhir Pekan";

  // Data Deret Waktu Riil untuk Recharts
  const chartData = useMemo(() => {
    if (marketData?.chartData && Array.isArray(marketData.chartData) && marketData.chartData.length > 0) {
      return marketData.chartData;
    }
    return generateIndexFallbackSeries(selectedPeriod, basePrice, isIHSG);
  }, [marketData, selectedPeriod, basePrice, isIHSG]);

  const maxVolume = useMemo(() => {
    return Math.max(...chartData.map((d) => d.volume || 1));
  }, [chartData]);

  const prices = chartData.map((d) => d.price).filter((p) => p != null && !isNaN(p));
  const minPrice = prices.length > 0 ? Math.min(...prices) : basePrice * 0.95;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : basePrice * 1.05;
  const paddingY = isIHSG ? (maxPrice - minPrice) * 0.12 || 25 : 1.2;
  const yDomain = [
    Number((minPrice - paddingY).toFixed(4)),
    Number((maxPrice + paddingY).toFixed(4)),
  ];

  // Nilai harga & volume aktif (mengikuti kursor hover atau nilai penutupan terakhir)
  const is1D = selectedPeriod === "1d";
  const firstPrice = chartData[0]?.price ?? basePrice;
  const referencePrice = is1D ? (stats.previousClose || firstPrice) : firstPrice;

  const activePrice = hoveredPoint?.price ?? basePrice;
  const activeChange = hoveredPoint
    ? Number((hoveredPoint.price - referencePrice).toFixed(4))
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

  const netIncomeVal = stats.netIncome
    ? formatTurnoverID(stats.netIncome)
    : (isIHSG ? "Rp 482,30T" : "Rp 385,60T");

  const prevCloseOpenVal = `${formatIndexPrice(stats.previousClose ?? (isIHSG ? 5185.105 : 142.1))} / ${formatIndexPrice(stats.openPrice ?? (isIHSG ? 4961.0 : 142.65))}`;
  const dayRangeVal = `${formatIndexPrice(stats.dayLow ?? (isIHSG ? 4907.37 : 141.8))} – ${formatIndexPrice(stats.dayHigh ?? (isIHSG ? 5012.87 : 143.9))}`;
  const fiftyTwoWeekRangeVal = `${formatIndexPrice(stats.fiftyTwoWeekLow ?? (isIHSG ? 4907.37 : 124.5))} – ${formatIndexPrice(stats.fiftyTwoWeekHigh ?? (isIHSG ? 9174.47 : 156.2))}`;
  const pePbvVal = `${formatIDR(stats.peRatio ?? (isIHSG ? 13.45 : 14.1), 2)}x / ${formatIDR(stats.pbvRatio ?? (isIHSG ? 2.14 : 2.35), 2)}x`;

  const advancingCount = stats.advancing ?? (isIHSG ? 248 : 30);
  const decliningCount = stats.declining ?? (isIHSG ? 295 : 43);
  const unchangedCount = stats.unchanged ?? (isIHSG ? 215 : 7);

  return (
    <div
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      className={`w-full relative flex flex-col justify-between ${className}`}
    >
      {/* ========================================================
          HEADER KARTU: TOGGLE [IHSG | IDX80], HARGA, & TIMEFRAME
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        {/* Sisi Kiri: Switcher IHSG/IDX80 + Harga Real-Time (Mengikuti Kursor) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Switcher Eksklusif: Hanya IHSG & IDX80 */}
          <div className="inline-flex items-center bg-[#151926] border border-white/[0.12] p-1 rounded-2xl shadow-inner">
            <button
              onClick={() => setSelectedIndex("IHSG")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isIHSG
                  ? "bg-white text-slate-950 shadow-md scale-100"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              IHSG
            </button>
            <span className="text-slate-600 px-1 text-xs">/</span>
            <button
              onClick={() => setSelectedIndex("IDX80")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                !isIHSG
                  ? "bg-white text-slate-950 shadow-md scale-100"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              IDX80
            </button>
          </div>

          {/* Judul Bersih Tanpa Ticker ^JKSE */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isIHSG ? "IHSG / IDX80" : "IDX80 / IHSG"}
            </h1>
          </div>

          {/* Nilai Harga, Perubahan & Status Jam Pasar Riil */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight transition-all">
              {formattedPrice}
            </span>
            <span
              className={`text-sm font-bold font-mono transition-all ${
                isUp ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formattedChange}
            </span>
            <span
              className={`text-sm font-bold font-mono transition-all ${
                isUp ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isUp ? `+${activeChangePercent.toFixed(2)}%` : `${activeChangePercent.toFixed(2)}%`}
            </span>

            {/* Indikator Tanggal Hover Aktif Saat Kursor Digerakkan / Status Jam Pasar (Teks Putih Bersih Tanpa Container) */}
            {hoveredPoint ? (
              <span className="text-xs font-mono font-medium text-white transition-colors">
                {hoveredPoint.fullDate || hoveredPoint.dateLabel} • Vol: {hoveredPoint.vol24hFormatted || "—"}
              </span>
            ) : (
              <span className="text-xs font-semibold text-white tracking-wide transition-colors">
                {liveMarketStatus.text}
              </span>
            )}
          </div>
        </div>

        {/* Sisi Kanan: Timeframe Selector (1D, 1Bln, 3Bln, 1Th, 5Th, Seluruhnya) */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="inline-flex items-center bg-[#151926] border border-white/[0.08] p-1 rounded-xl">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setSelectedPeriod(tf.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === tf.id
                    ? "bg-[#252c40] text-white shadow-xs border border-white/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          AREA GRAFIK: GARIS PUTIH BERSIH + VOLUME BARS
          ======================================================== */}
      <div className="relative w-full h-[360px] sm:h-[400px] mt-2 mb-2">
        {/* Recharts ComposedChart: Area Garis Putih + Volume Bawah */}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 25, right: 65, left: 4, bottom: 5 }}
            onMouseMove={(state) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                setHoveredPoint(state.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              {/* Gradien Transparan Putih di Bawah Garis */}
              <linearGradient id="whiteLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.16} />
                <stop offset="50%" stopColor="#ffffff" stopOpacity={0.04} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
              </linearGradient>

              {/* Glowing Aura Filter */}
              <filter id="whiteGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#ffffff" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* Sumbu X: Ticks Sesuai Periode (Terang, Jelas, & Tidak Bertabrakan) */}
            <XAxis
              dataKey="index"
              interval={0}
              axisLine={false}
              tickLine={false}
              dy={10}
              tick={(props) => {
                const { x, y, payload } = props;
                const point = chartData[payload?.value];
                const label = point?.xAxisLabel;
                if (!label) return null;
                const isBold = point?.isTransition;
                const isFirst = payload?.value === 0;
                const isLast = payload?.value === chartData.length - 1;
                const anchor = isFirst ? "start" : isLast ? "end" : "middle";
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={anchor}
                    fill={isBold ? "#ffffff" : "#f1f5f9"}
                    fontWeight={isBold ? 800 : 600}
                    fontSize={11.5}
                    fontFamily="monospace"
                  >
                    {label}
                  </text>
                );
              }}
            />

            {/* Sumbu Y Harga (Sisi Kanan, Format 4 Desimal, Terang & Jelas) */}
            <YAxis
              yAxisId="price"
              orientation="right"
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#e2e8f0", fontSize: 11, fontFamily: "monospace", fontWeight: 500 }}
              tickFormatter={(v) => formatIndexPrice(v)}
              dx={10}
            />

            {/* Sumbu Y Volume (Disembunyikan, domain proporsional agar bar volume berada di kuadran bawah) */}
            <YAxis
              yAxisId="volume"
              orientation="left"
              domain={[0, maxVolume * 2.8]}
              hide={true}
            />

            {/* Histogram Volume Bar di Bagian Bawah */}
            <Bar
              yAxisId="volume"
              dataKey="volume"
              barSize={6}
              radius={[2, 2, 0, 0]}
            >
              {chartData.map((entry, idx) => (
                <Cell
                  key={`vol-${idx}`}
                  fill={entry.isSpike ? "#38bdf8" : "#223042"}
                  opacity={hoveredPoint && hoveredPoint.time === entry.time ? 1 : 0.8}
                />
              ))}
            </Bar>

            {/* Garis Kurva Putih Murni Sesuai Desain Awal */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#ffffff"
              strokeWidth={2.4}
              filter="url(#whiteGlow)"
              fill="url(#whiteLineGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#ffffff",
                stroke: "#0b0e17",
                strokeWidth: 2,
              }}
            />

            {/* Tooltip Interaktif Melayang Sesuai Foto Referensi */}
            <Tooltip
              content={<InstitutionalTooltip period={selectedPeriod} isIHSG={isIHSG} />}
              cursor={{
                stroke: "#94a3b8",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Badge Harga Berjalan Aktif di Sumbu Y Kanan (Mengikuti Harga Aktif) */}
        <div
          style={{
            top: `${Math.min(Math.max(((maxPrice - activePrice) / (maxPrice - minPrice || 1)) * 100, 4), 92)}%`,
          }}
          className={`absolute right-0 transform -translate-y-1/2 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs shadow-lg z-10 transition-all pointer-events-none ${
            isUp ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {formatIndexPrice(activePrice)}
        </div>
      </div>

      {/* ========================================================
          BARIS STATISTIK PERGERAKAN SAHAM (EMITEN MENGUAT / MELEMAH / STAGNAN)
          ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 my-1 rounded-xl bg-[#121622] border border-white/[0.06] text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Emiten Menguat:</span>
            <span className="font-mono font-extrabold text-emerald-400">+{advancingCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Emiten Melemah:</span>
            <span className="font-mono font-extrabold text-rose-400">−{decliningCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Stagnan:</span>
            <span className="font-mono font-extrabold text-slate-300">{unchangedCount}</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          {stats.basisLabel || (isIHSG ? "Basis 900+ Emiten Komposit BEI" : "Basis 80 Saham IDX80 BEI")}
        </div>
      </div>

      {/* ========================================================
          BAGIAN BAWAH: 7 KARTU INDIKATOR METRIC (100% DINAMIS SESUAI INDEKS)
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-3 border-t border-white/[0.08]">
        {/* Indikator 1: Previous Close */}
        <div className="rounded-xl bg-[#131722] border border-white/[0.06] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 truncate block">Previous Close</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-white mt-1 block truncate">
            {formatIndexPrice(stats.previousClose ?? (isIHSG ? 5185.105 : 142.1))}
          </span>
        </div>

        {/* Indikator 2: Open */}
        <div className="rounded-xl bg-[#131722] border border-white/[0.06] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 truncate block">Open</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-white mt-1 block truncate">
            {formatIndexPrice(stats.openPrice ?? (isIHSG ? 4961.0 : 142.65))}
          </span>
        </div>

        {/* Indikator 3: Day's Range */}
        <div className="rounded-xl bg-[#131722] border border-white/[0.06] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 truncate block">Day's Range</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-white mt-1 block truncate">
            {dayRangeVal}
          </span>
        </div>

        {/* Indikator 4: 52-Week Range */}
        <div className="rounded-xl bg-[#131722] border border-white/[0.06] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 truncate block">52-Week Range</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-white mt-1 block truncate">
            {fiftyTwoWeekRangeVal}
          </span>
        </div>

        {/* Indikator 5: Volume Transaksi */}
        <div className="rounded-xl bg-[#131722] border border-white/[0.06] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 truncate block">Volume Transaksi</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-white mt-1 block truncate">
            {formatVolumeID(stats.volume ?? (isIHSG ? 18420000000 : 8952507336))}
          </span>
        </div>

        {/* Indikator 6: Nilai Transaksi */}
        <div className="rounded-xl bg-[#131722] border border-white/[0.06] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 truncate block">Nilai Transaksi</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 mt-1 block truncate">
            {formatTurnoverID(stats.turnover ?? (isIHSG ? 11850000000000 : 13730681275700))}
          </span>
        </div>

        {/* Indikator 7: Rata-rata Volume */}
        <div className="rounded-xl bg-[#131722] border border-white/[0.06] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 truncate block">Rata-rata Volume</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-white mt-1 block truncate">
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
