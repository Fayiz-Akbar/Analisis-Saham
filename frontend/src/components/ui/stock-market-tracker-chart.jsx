import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
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
 * Format volume saham (Juta / Miliar lembar)
 */
export function formatVolumeID(val) {
  if (val == null || isNaN(val) || val <= 0) return "Data tidak tersedia";
  const num = Number(val);
  if (num >= 1e9) {
    return `${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M lembar`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Juta lembar`;
  }
  return `${num.toLocaleString("id-ID")} lembar`;
}

/**
 * Format nilai transaksi (Triliun / Miliar Rupiah)
 */
export function formatTurnoverID(val) {
  if (val == null || isNaN(val) || val <= 0) return "Data tidak tersedia";
  const num = Number(val);
  if (num >= 1e12) {
    return `Rp ${(num / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T`;
  }
  if (num >= 1e9) {
    return `Rp ${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
  }
  return `Rp ${num.toLocaleString("id-ID")}`;
}

/**
 * Fallback generator data deret waktu jika backend sedang offline
 */
const generateFallbackSeries = (period, basePrice = 5909.14) => {
  const pointsCount =
    period === "1d"
      ? 60
      : period === "1w"
        ? 80
        : period === "1m"
          ? 22
          : period === "3m"
            ? 65
            : period === "6m"
              ? 120
              : period === "1y"
                ? 52
                : period === "5y"
                  ? 60
                  : 120;

  return Array.from({ length: pointsCount }, (_, i) => {
    const timeDelta =
      (pointsCount - i) * (period === "1d" ? 300000 : period === "1w" ? 1800000 : 86400000);
    const dateObj = new Date(Date.now() - timeDelta);
    const simulatedPrice = Number(
      (basePrice + Math.sin(i * 0.12) * 35 + (Math.random() - 0.5) * 12).toFixed(2)
    );

    let timeLabel = "";
    if (period === "1d") {
      timeLabel = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } else if (period === "1w" || period === "1m" || period === "3m" || period === "6m") {
      timeLabel = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } else {
      timeLabel = dateObj.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
    }

    return {
      time: i,
      price: simulatedPrice,
      timestamp: dateObj.toISOString(),
      timeLabel,
      fullTimeLabel: dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });
};

/**
 * Custom Tooltip untuk Grafik Recharts
 * Desain Monokrom Bloomberg / Institutional Financial Terminal
 */
function ChartCrosshairTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  if (!item) return null;

  return (
    <div className="bg-[#121212] border border-[#272727] px-3 py-2 shadow-2xl text-xs select-none">
      <div className="text-[11px] font-mono text-[#929292] mb-1">
        {item.fullTimeLabel || item.timeLabel}
      </div>
      <div className="text-sm font-semibold font-mono tabular-nums text-[#F5F5F5]">
        {formatIDR(item.price)}
      </div>
    </div>
  );
}

/**
 * =========================================================================
 * KOMPONEN 1: STOCK MARKET TRACKER CHART (MARKET OVERVIEW)
 * Desain Black & White Financial Dashboard (Bloomberg / Yahoo Finance / TradingView)
 * =========================================================================
 */
export const StockMarketTrackerChart = ({
  className = "",
  onDataChange,
  initialPeriod = "1d",
  initialIndex = "IDX80",
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Daftar opsi periode sesuai spesifikasi
  const periods = [
    { label: "1D", value: "1d" },
    { label: "1W", value: "1w" },
    { label: "1M", value: "1m" },
    { label: "3M", value: "3m" },
    { label: "6M", value: "6m" },
    { label: "1Y", value: "1y" },
    { label: "5Y", value: "5y" },
    { label: "MAX", value: "max" },
  ];

  // Fetch data pergerakan indeks dari backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchIndexOverview() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/stocks/market-overview?period=${selectedPeriod}&symbol=${encodeURIComponent(
            selectedIndex
          )}`
        );
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setData(json.data);
          if (onDataChange) {
            onDataChange(json.data);
          }
        }
      } catch (err) {
        console.warn("Gagal memuat ringkasan pasar dari backend:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchIndexOverview();
    return () => {
      isMounted = false;
    };
  }, [selectedPeriod, selectedIndex, onDataChange]);

  // Ekstrak data & metrik
  const chartSeries =
    data?.chartData && data.chartData.length > 0
      ? data.chartData
      : generateFallbackSeries(selectedPeriod, data?.price || 87.53);

  const currentPrice = data?.price ?? (chartSeries[chartSeries.length - 1]?.price || 87.53);
  const changeAmount = data?.changeAmount ?? -0.05;
  const changePercent = data?.changePercent ?? -0.06;

  // Gunakan tanda + atau − (unicode minus \u2212) secara konsisten
  const isPositive = changeAmount >= 0;
  const signSymbol = isPositive ? "+" : "−";

  // Nilai Low & High mengikuti periode yang dipilih
  const lowestPrice =
    data?.periodLow ??
    (chartSeries.length > 0 ? Math.min(...chartSeries.map((d) => d.price)) : 85.83);
  const highestPrice =
    data?.periodHigh ??
    (chartSeries.length > 0 ? Math.max(...chartSeries.map((d) => d.price)) : 87.65);

  // Label High & Low dinamis mengikuti periode
  const highLowLabelPrefix = selectedPeriod === "1d" ? "DAY" : selectedPeriod.toUpperCase();

  // Keterangan perbandingan
  const comparisonText =
    data?.comparisonText ||
    (selectedPeriod === "1d"
      ? "Perubahan harian vs penutupan sebelumnya"
      : `Perubahan ${selectedPeriod.toUpperCase()} vs awal periode`);

  // Nama & subteks indeks IDX80
  const indexDisplayName = data?.indexDisplayName || "IDX80 — Indeks 80 Saham Terpilih BEI";
  const indexSubText = data?.indexSubText || "IDX80 • Konstituen 80 Saham Unggulan BEI";

  // Status pasar aktual
  const marketStatusText = data?.marketStatusText || "Market Open";
  const isMarketOpen = data?.marketOpen ?? true;
  const lastUpdatedTime = data?.lastUpdatedTime || "15:45 WIB";

  return (
    <div
      className={`bg-[#101010] border border-[#272727] rounded-xl p-6 md:p-8 flex flex-col justify-between text-[#F5F5F5] select-text ${className}`}
    >
      <div className="space-y-5">
        {/* ========================================================
            A. HEADER INDEKS (MARKET INDEX)
            Sederhana, border tipis, pilihan khusus IDX80 sesuai permintaan
            ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pb-4 border-b border-[#272727]">
          {/* Bagian Kiri: Label Uppercase, Nama Indeks IDX80, Status Bursa, Waktu */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-[#929292]">
                MARKET INDEX
              </span>
              <span className="text-[#272727]">•</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isMarketOpen ? "bg-[#22C55E]" : "bg-[#929292]"
                  }`}
                />
                <span className="text-xs font-medium text-[#929292]">{marketStatusText}</span>
              </div>
              <span className="text-[#272727]">•</span>
              <span className="text-xs font-mono text-[#929292]">{lastUpdatedTime}</span>
            </div>

            <h2 className="text-sm sm:text-base font-semibold text-[#F5F5F5] tracking-tight">
              {indexDisplayName}
            </h2>
          </div>

          {/* Bagian Kanan: Dropdown Pemilihan Indeks (IDX80 & IHSG) */}
          <div className="flex items-center">
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(e.target.value)}
              className="bg-[#121212] border border-[#272727] text-[#F5F5F5] text-xs font-medium px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#525252] cursor-pointer hover:border-[#383838] transition-colors"
              aria-label="Pilih Indeks Saham"
            >
              <option value="IDX80">IDX80 (Indeks 80 Saham)</option>
              <option value="^JKSE">IHSG (Indeks Gabungan)</option>
              <option value="^JKLQ45">LQ45 (45 Saham Likuid)</option>
            </select>
          </div>
        </div>

        {/* ========================================================
            B. NILAI INDEKS UTAMA
            Font 36-44px weight 600, angka tabular-nums, tanpa kartu pill
            ======================================================== */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-4xl md:text-[42px] font-semibold text-[#F5F5F5] font-mono tabular-nums tracking-tight leading-none">
              {formatIDR(currentPrice)}
            </span>

            {/* Perubahan Poin dan Persentase: Teks Berwarna Bersih */}
            <span
              className={`text-base md:text-lg font-semibold font-mono tabular-nums ${
                isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              {signSymbol}
              {formatIDR(Math.abs(changeAmount))} ({signSymbol}
              {formatIDR(Math.abs(changePercent))}%)
            </span>
          </div>

          {/* Keterangan Pembanding & Ticker Sekunder */}
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#929292]">
            <span>{comparisonText}</span>
            <span className="text-[#272727]">•</span>
            <span>{indexSubText}</span>
          </div>
        </div>

        {/* ========================================================
            D. PEMILIHAN PERIODE
            Teks sederhana dengan indikator aktif berupa underline putih
            1D | 1W | 1M | 3M | 6M | 1Y | 5Y | MAX
            ======================================================== */}
        <div className="flex items-center gap-4 sm:gap-6 border-b border-[#272727] overflow-x-auto pb-0">
          {periods.map((p) => {
            const isActive = selectedPeriod === p.value;
            return (
              <button
                key={p.value}
                onClick={() => setSelectedPeriod(p.value)}
                className={`pb-2 text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "text-[#F5F5F5] border-b-2 border-[#F5F5F5] font-semibold"
                    : "text-[#929292] hover:text-[#D1D5DB] border-b-2 border-transparent font-medium"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================
            C. GRAFIK INDEKS
            Tinggi 280-320px, garis monokrom tipis 1.5px, grid horizontal jarang
            Sumbu Y format Indonesia di sisi kanan, crosshair hover tipis
            ======================================================== */}
        <div className="relative w-full h-[290px] md:h-[310px] select-none pt-2">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#101010]/60 backdrop-blur-[1px] rounded-lg">
              <span className="text-xs font-mono text-[#929292] tracking-wider uppercase">
                Memuat data...
              </span>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartSeries}
              margin={{ top: 8, right: 10, left: -10, bottom: 0 }}
            >
              {/* Grid Horizontal Sangat Tipis & Jarang */}
              <CartesianGrid
                vertical={false}
                stroke="#1F1F1F"
                strokeDasharray="2 3"
              />

              {/* Sumbu X: Waktu / Tanggal Sesuai Periode */}
              <XAxis
                dataKey="time"
                axisLine={{ stroke: "#272727" }}
                tickLine={false}
                tick={{ fill: "#929292", fontSize: 11 }}
                tickFormatter={(val) => chartSeries[val]?.timeLabel || ""}
                minTickGap={35}
                interval="preserveStartEnd"
              />

              {/* Sumbu Y: Format Nilai Indeks Indonesia di Sisi Kanan */}
              <YAxis
                orientation="right"
                domain={["auto", "auto"]}
                axisLine={{ stroke: "#272727" }}
                tickLine={false}
                tick={{ fill: "#929292", fontSize: 11, fontFamily: "monospace" }}
                tickFormatter={(val) =>
                  Number(val).toLocaleString("id-ID", {
                    maximumFractionDigits: val < 500 ? 1 : 0,
                  })
                }
              />

              {/* Tooltip & Crosshair Garis Tipis Hover */}
              <Tooltip
                content={<ChartCrosshairTooltip />}
                cursor={{
                  stroke: "#525252",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />

              {/* Garis Grafik Monokrom Bersih Tipis 1.5px */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#F5F5F5"
                strokeWidth={1.5}
                dot={false}
                activeDot={{
                  r: 3.5,
                  fill: "#F5F5F5",
                  stroke: "#080808",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================
          E. RINGKASAN HIGH DAN LOW
          Satu baris ringkasan dengan pemisah vertikal halus di bawah grafik
          ======================================================== */}
      <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 pt-4 border-t border-[#272727] text-xs mt-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#929292]">
            {highLowLabelPrefix} LOW
          </span>
          <span className="font-mono tabular-nums font-semibold text-[#F5F5F5]">
            {formatIDR(lowestPrice)}
          </span>
        </div>

        <div className="h-3 w-px bg-[#272727]" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#929292]">
            {highLowLabelPrefix} HIGH
          </span>
          <span className="font-mono tabular-nums font-semibold text-[#F5F5F5]">
            {formatIDR(highestPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * KOMPONEN 2: MARKET STATISTICS PANEL (DIBUAT SESUAI FOTO KE-4)
 * Menampilkan grid 4 kartu metrik (Nilai Transaksi, Volume Saham, Emiten Menguat, Emiten Melemah)
 * Layout: 2 Kolom Card Grid dengan Icon Top-Right, Big Number, dan Subtext Persentase
 * =========================================================================
 */
export const MarketStatisticsPanel = ({
  statistics,
  isLoading = false,
  className = "",
}) => {
  const turnoverFormatted = statistics?.turnover
    ? `Rp ${(statistics.turnover / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T`
    : "Rp 3,70 T";
  const volumeFormatted = statistics?.volume
    ? `${(statistics.volume / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`
    : "6,39 M";

  const advancingCount = statistics?.advancing ?? 37;
  const decliningCount = statistics?.declining ?? 36;
  const unchangedCount = statistics?.unchanged ?? 6;
  const totalCount = statistics?.trackedCount || 79;

  const advancingPct = ((advancingCount / totalCount) * 100).toFixed(1);
  const decliningPct = ((decliningCount / totalCount) * 100).toFixed(1);

  return (
    <div className={`flex flex-col justify-between gap-3.5 select-text ${className}`}>
      {/* Grid 4 Kartu Metrik - Sesuai UI Foto ke-4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {/* KARTU 1: Nilai Transaksi (Total Revenue Style) */}
        <div className="rounded-xl border border-[#272727] bg-[#101010] p-4.5 sm:p-5 flex flex-col justify-between transition-colors hover:border-[#383838]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[#929292]">
              Nilai Transaksi
            </span>
            <svg
              className="w-4 h-4 text-[#929292]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F5F5F5]">
              {turnoverFormatted}
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              +12.4% vs rata-rata harian
            </p>
          </div>
        </div>

        {/* KARTU 2: Volume Saham (Subscriptions Style) */}
        <div className="rounded-xl border border-[#272727] bg-[#101010] p-4.5 sm:p-5 flex flex-col justify-between transition-colors hover:border-[#383838]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[#929292]">
              Volume Saham
            </span>
            <svg
              className="w-4 h-4 text-[#929292]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F5F5F5]">
              {volumeFormatted}
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              +8.2% vs sesi kemarin
            </p>
          </div>
        </div>

        {/* KARTU 3: Emiten Menguat (Sales Style) */}
        <div className="rounded-xl border border-[#272727] bg-[#101010] p-4.5 sm:p-5 flex flex-col justify-between transition-colors hover:border-[#383838]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[#929292]">
              Emiten Menguat
            </span>
            <svg
              className="w-4 h-4 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-400">
              +{advancingCount}
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              +{advancingPct}% dari {totalCount} saham
            </p>
          </div>
        </div>

        {/* KARTU 4: Emiten Melemah (Active Now Style) */}
        <div className="rounded-xl border border-[#272727] bg-[#101010] p-4.5 sm:p-5 flex flex-col justify-between transition-colors hover:border-[#383838]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[#929292]">
              Emiten Melemah
            </span>
            <svg
              className="w-4 h-4 text-rose-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-400">
              −{decliningCount}
            </div>
            <p className="text-xs text-rose-400 font-medium mt-1">
              −{decliningPct}% dari {totalCount} saham
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info Strip: Stagnan & Basis IDX80 */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#272727] bg-[#101010] text-xs text-[#929292] font-mono">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#929292]" />
          <span>Stagnan: {unchangedCount} Emiten</span>
        </div>
        <span>Basis {totalCount} Saham IDX80 BEI</span>
      </div>
    </div>
  );
};

/**
 * =========================================================================
 * KOMPONEN KOMPOSIT: MARKET OVERVIEW SECTION
 * Menggabungkan Market Overview (~70%) dan Market Statistics (~30%)
 * =========================================================================
 */
export const MarketOverviewSection = ({ className = "" }) => {
  const [overviewData, setOverviewData] = useState(null);

  return (
    <section className={`w-full ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Panel Kiri: Market Overview (~70% desktop) */}
        <div className="lg:col-span-8 flex">
          <StockMarketTrackerChart
            className="w-full h-full"
            onDataChange={setOverviewData}
          />
        </div>

        {/* Panel Kanan: Market Statistics Card Grid (~30% desktop) Sesuai Foto ke-4 */}
        <div className="lg:col-span-4 flex">
          <MarketStatisticsPanel
            className="w-full h-full"
            statistics={overviewData?.statistics}
            isLoading={!overviewData}
          />
        </div>
      </div>
    </section>
  );
};

// Backwards compatibility default exports
export const Component = StockMarketTrackerChart;
export default StockMarketTrackerChart;
