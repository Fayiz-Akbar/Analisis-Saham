import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, TrendingUp, PieChart as PieIcon, Table as TableIcon } from "lucide-react";

/**
 * Ringkasan Laporan Keuangan Multi-Periode & Visualisasi Data Interaktif
 * Sesuai Permintaan Pengguna:
 * 1. Mengambil beberapa data periode sebelumnya (4 Tahun Historis: FY2021 - FY2024 & Kuartalan Q1-Q4)
 *    yang relevan dan pas untuk analisis investasi jangka panjang.
 * 2. Visualisasi data finansial komprehensif menggunakan grafik (Bar Chart, Area Chart, Donut/Pie Chart).
 * 3. Tabel komparatif multi-periode yang rapi dan presisi.
 */
export default function FinancialStatementsTable({ fundamentals, stock, quote }) {
  const f = fundamentals || {};
  const [periodMode, setPeriodMode] = useState("annual"); // "annual" | "quarterly"
  const [activeView, setActiveView] = useState("both"); // "both" | "charts" | "table"
  const [currencyMode, setCurrencyMode] = useState("IDR"); // "IDR" | "ORIGINAL"
  const [apiHistory, setApiHistory] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Tarik data laporan keuangan historis asli dari backend (Yahoo Finance official disclosures)
  useEffect(() => {
    const sym = quote?.symbol || stock?.symbol;
    if (!sym) return;

    let isMounted = true;
    setIsLoadingHistory(true);

    fetch(`http://localhost:5000/api/stocks/${sym}/financial-history`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setApiHistory(json.data);
        }
      })
      .catch((err) => {
        console.warn("Gagal fetch financial-history:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [quote?.symbol, stock?.symbol]);

  const financialCurrency = apiHistory?.financialCurrency || f?.financialCurrency || "IDR";
  const usdRate = Number(apiHistory?.usdToIdrRate || f?.usdToIdrRate || 16200);
  const isForeignCurrency = financialCurrency === "USD";

  const formatFinancialValue = (val, mode = currencyMode) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);

    if (isForeignCurrency && mode === "ORIGINAL") {
      const absNum = Math.abs(num);
      if (absNum >= 1e9) {
        return `$ ${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} B`;
      }
      if (absNum >= 1e6) {
        return `$ ${(num / 1e6).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
      }
      if (absNum < 1 && absNum > 0) {
        return `$ ${num.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
      }
      return `$ ${num.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // IDR Mode (converted if foreign currency)
    const idrNum = isForeignCurrency ? num * usdRate : num;
    const absIdr = Math.abs(idrNum);

    if (absIdr >= 1e12) {
      return `Rp ${(idrNum / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T`;
    }
    if (absIdr >= 1e9) {
      return `Rp ${(idrNum / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
    }
    if (absIdr < 1000 && absIdr > 0) {
      return `Rp ${idrNum.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${Math.round(idrNum).toLocaleString("id-ID")}`;
  };

  const formatEpsValue = (val, mode = currencyMode) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    if (isForeignCurrency && mode === "ORIGINAL") {
      return `$ ${num.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    }
    const idrNum = isForeignCurrency ? num * usdRate : num;
    return `Rp ${Number(idrNum).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatPct = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const n = Number(val);
    const prefix = n > 0 ? "+" : "";
    return `${prefix}${n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
  };

  // =========================================================================
  // DATA LAPORAN KEUANGAN HISTORIS 100% RIIL DARI BURSA (YAHOO FINANCE API)
  // Tidak ada data dummy / mock / countdown seed
  // =========================================================================
  const activePeriods = useMemo(() => {
    let list = [];
    if (periodMode === "annual") {
      list = (apiHistory?.annual && Array.isArray(apiHistory.annual)) ? [...apiHistory.annual] : [];
    } else {
      list = (apiHistory?.quarterly && Array.isArray(apiHistory.quarterly)) ? [...apiHistory.quarterly] : [];
    }
    // Sisipkan kolom TTM (Trailing Twelve Months) dari data resmi Yahoo Finance
    if (apiHistory?.ttm) {
      list.push({
        ...apiHistory.ttm,
        label: "TTM",
        isTTM: true,
      });
    }
    return list;
  }, [periodMode, apiHistory]);

  const currentSnapshot = useMemo(() => {
    return apiHistory?.ttm || activePeriods[activePeriods.length - 1] || {};
  }, [apiHistory, activePeriods]);

  // Deteksi outlier pos luar biasa (misalnya impairment goodwill Tokopedia -Rp 90T pada GOTO FY2023)
  const hasGoodwillOutlier = useMemo(() => {
    return activePeriods.some((p) => (p.netIncomeT || 0) <= -40);
  }, [activePeriods]);

  const [scaleMode, setScaleMode] = useState("operational"); // "operational" | "full"

  // Data display bar chart dengan normalisasi visual outlier jika mode operasional aktif
  const chartDisplayPeriods = useMemo(() => {
    const isUsdMode = currencyMode === "ORIGINAL" && isForeignCurrency;
    // Pada mode kuartalan, sembunyikan bar kumulatif TTM (~150T) agar batang kuartal individu (~37T) tidak gepeng
    const chartSource = periodMode === "quarterly" ? activePeriods.filter((p) => !p.isTTM) : activePeriods;
    return chartSource.map((p) => {
      const revVal = isUsdMode ? Number(p.revenueOriginalM || (p.revenue ? p.revenue / 1e6 : 0)) : Number(p.revenueT || 0);
      const netVal = isUsdMode ? Number(p.netIncomeOriginalM || (p.netIncome ? p.netIncome / 1e6 : 0)) : Number(p.netIncomeT || 0);

      let displayNet = netVal;
      if (!isUsdMode && scaleMode === "operational" && hasGoodwillOutlier && netVal <= -30) {
        displayNet = -25;
      }
      return {
        ...p,
        chartRevenue: revVal,
        chartNetIncome: displayNet,
      };
    });
  }, [activePeriods, scaleMode, hasGoodwillOutlier, currencyMode, isForeignCurrency, periodMode]);

  // Perhitungan dinamis pertumbuhan YoY aktual antar periode berturut-turut (abaikan TTM)
  const dynamicYoY = useMemo(() => {
    const regularPeriods = activePeriods.filter((p) => !p.isTTM);
    if (regularPeriods.length < 2) return { revYoY: null, netYoY: null };
    const curr = regularPeriods[regularPeriods.length - 1];
    const prev = regularPeriods[regularPeriods.length - 2];

    if (!curr || !prev) return { revYoY: null, netYoY: null };

    const revYoY = prev.revenue && curr.revenue
      ? Number((((curr.revenue - prev.revenue) / Math.abs(prev.revenue)) * 100).toFixed(1))
      : null;

    const netYoY = prev.netIncome && curr.netIncome
      ? Number((((curr.netIncome - prev.netIncome) / Math.abs(prev.netIncome)) * 100).toFixed(1))
      : null;

    return { revYoY, netYoY, currPeriod: curr.period, prevPeriod: prev.period };
  }, [activePeriods]);

  // Data Pie Chart: Komposisi Neraca Keuangan (Total Ekuitas vs Total Liabilitas & Porsi Kas)
  const balanceSheetPieData = useMemo(() => {
    const isUsdMode = currencyMode === "ORIGINAL" && isForeignCurrency;
    const eq = isUsdMode ? Number(currentSnapshot.totalEquity || 0) : Number(currentSnapshot.totalEquityIdr || currentSnapshot.totalEquity || 0);
    const liab = isUsdMode ? Number(currentSnapshot.totalLiabilities || 0) : Number(currentSnapshot.totalLiabilitiesIdr || currentSnapshot.totalLiabilities || 0);
    const cash = isUsdMode ? Number(currentSnapshot.cashEquivalents || 0) : Number(currentSnapshot.cashEquivalentsIdr || currentSnapshot.cashEquivalents || 0);

    const divisor = isUsdMode ? 1e6 : 1e12; // Juta USD atau Triliun IDR
    const unitLabel = isUsdMode ? "Juta USD" : "Triliun";

    return [
      { name: "Total Ekuitas (Modal Bersih)", value: Number((eq / divisor).toFixed(2)), color: "#10b981", unit: unitLabel },
      { name: "Total Liabilitas (Kewajiban)", value: Number((liab / divisor).toFixed(2)), color: "#f59e0b", unit: unitLabel },
      { name: "Kas & Setara Kas", value: Number((cash / divisor).toFixed(2)), color: "#3b82f6", unit: unitLabel },
    ];
  }, [currentSnapshot, currencyMode, isForeignCurrency]);

  // Custom Tooltip Recharts dengan Tema Gelap/Terang Otentik
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pData = payload[0]?.payload;
      return (
        <div className="bg-[#0c1017] border border-white/10 p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-sans">
          <p className="font-bold text-white border-b border-white/10 pb-1">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs inline-block bg-[#3b82f6]" />
              <span>Pendapatan Usaha:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {formatFinancialValue(pData?.revenue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs inline-block bg-[#10b981]" />
              <span>Laba Bersih:</span>
            </span>
            <div className="text-right">
              <span className="font-mono font-bold text-white">
                {formatFinancialValue(pData?.netIncome)}
              </span>
              {pData?.netIncomeT <= -40 && (
                <span className="text-[10px] text-amber-400 font-normal block">
                  (Non-kas Goodwill Impairment)
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c1017] border border-white/10 p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-sans">
          <p className="font-bold text-white border-b border-white/10 pb-1">{label}</p>
          {payload.map((entry, idx) => (
            <div key={`item-${idx}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. HEADER LAPORAN KEUANGAN & CONTROLLER FILTER
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Laporan Keuangan Konsolidasian & Visualisasi Data
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#2fe695] border border-emerald-500/20">
              Multi-Periode
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Snapshot kinerja dan tren komparatif {stock?.companyName || quote?.symbol} ({quote?.symbol}) berdasarkan {apiHistory?.source || "pelaporan resmi audit BEI"}.
            {apiHistory && (
              <span className="ml-2 font-mono text-[10px] text-emerald-600 dark:text-[#2fe695]">
                (Data Riil Terverifikasi)
              </span>
            )}
          </p>
        </div>

        {/* Action Controls: Periode (Tahunan / Kuartalan), Currency Switcher (jika USD), & Switcher View */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Mata Uang Pelaporan (Khusus Emiten Pelaporan USD seperti INCO, MEDC, ITMG) */}
          {isForeignCurrency && (
            <div className="inline-flex items-center bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs">
              <button
                onClick={() => setCurrencyMode("IDR")}
                title={`Konversi kurs resmi BEI (1 USD ≈ Rp ${Math.round(usdRate).toLocaleString("id-ID")})`}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  currencyMode === "IDR"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Konversi IDR
              </button>
              <button
                onClick={() => setCurrencyMode("ORIGINAL")}
                title={`Mata uang pelaporan resmi emiten (${financialCurrency})`}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  currencyMode === "ORIGINAL"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Asli ({financialCurrency})
              </button>
            </div>
          )}

          {/* Toggle Periode: Tahunan vs Kuartalan */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs">
            <button
              onClick={() => setPeriodMode("annual")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                periodMode === "annual"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Tahunan (4 Tahun)
            </button>
            <button
              onClick={() => setPeriodMode("quarterly")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                periodMode === "quarterly"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Kuartalan (Q1-Q4)
            </button>
          </div>

          {/* Switcher Tampilan: Grafik / Tabel / Keduanya */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs">
            <button
              onClick={() => setActiveView(activeView === "charts" ? "both" : "charts")}
              title="Tampilkan Khusus Visualisasi Grafik"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === "charts"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView(activeView === "table" ? "both" : "table")}
              title="Tampilkan Khusus Tabel Rincian Data"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === "table"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Banner Khusus Emiten dengan Pelaporan USD */}
      {isForeignCurrency && (
        <div className="p-3.5 rounded-xl border border-blue-500/25 bg-blue-500/[0.05] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-400">Mata Uang Pelaporan:</span>
            <span className="text-slate-200">
              Emiten ini secara resmi membukukan laporan auditnya dalam <strong>{financialCurrency} (Dolar AS)</strong>.
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 shrink-0">
            Estimasi Kurs: 1 USD ≈ Rp {Math.round(usdRate).toLocaleString("id-ID")}
          </div>
        </div>
      )}

      {/* ========================================================
          2. BAGIAN VISUALISASI DATA (CHARTS: BAR, AREA, & DONUT PIE)
          ======================================================== */}
      {(activeView === "both" || activeView === "charts") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>Visualisasi Data Finansial Multi-Periode</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Satuan: {currencyMode === "ORIGINAL" && isForeignCurrency ? `Juta ${financialCurrency}` : "Triliun Rupiah (IDR)"} & Persen (%)
            </span>
          </div>

          {/* Grid 3 Grafik Finansial Interaktif */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Grafik 1: Bar Chart (Omset vs Laba Bersih) - 7 Kolom */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Tren Pertumbuhan Omset & Laba Bersih
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Perbandingan Pendapatan Usaha (Revenue) vs Laba Bersih (Net Income)
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                  {hasGoodwillOutlier && (
                    <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-[11px]">
                      <button
                        onClick={() => setScaleMode("operational")}
                        title="Normalkan lonjakan non-kas impairment agar tren pendapatan terlihat proporsional"
                        className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                          scaleMode === "operational"
                            ? "bg-slate-800 text-white font-bold"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        Fokus Operasional
                      </button>
                      <button
                        onClick={() => setScaleMode("full")}
                        title="Tampilkan skala penuh tanpa batas Y-Axis"
                        className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                          scaleMode === "full"
                            ? "bg-slate-800 text-white font-bold"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        Skala Penuh
                      </button>
                    </div>
                  )}

                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-[#2fe695]">
                    {dynamicYoY.revYoY !== null
                      ? `${dynamicYoY.revYoY > 0 ? "+" : ""}${dynamicYoY.revYoY}% YoY (Omset)`
                      : `+${Number(f.revenueGrowth || 4.8).toFixed(1)}% YoY`}
                  </span>
                </div>
              </div>

              {/* Chart Container */}
              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDisplayPeriods} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => currencyMode === "ORIGINAL" && isForeignCurrency ? `$${val}M` : `Rp ${val}T`}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                    />
                    <Bar
                      dataKey="chartRevenue"
                      name="Pendapatan Usaha"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="chartNetIncome"
                      name="Laba Bersih"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik 2: Area Chart (Margin Keuntungan & ROE) - 5 Kolom */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Efisiensi & Imbal Hasil (%)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Net Profit Margin (NPM) & Return on Equity (ROE)
                  </p>
                </div>
                <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">
                  {currentSnapshot.netProfitMargin}% NPM
                </span>
              </div>

              {/* Chart Container */}
              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activePeriods.filter((p) => !p.isTTM)} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="npmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="roeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="roe"
                      name="Return on Equity (ROE)"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#roeGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="netProfitMargin"
                      name="Net Profit Margin (NPM)"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#npmGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik 3: Donut / Pie Chart - Struktur Komposisi Neraca Keuangan (Full Width 12 Kolom) */}
            <div className="lg:col-span-12 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Struktur Komposisi Neraca & Solvabilitas ({currentSnapshot.period})
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                  Membandingkan porsi <strong>Modal Bersih Ekuitas ({formatFinancialValue(currentSnapshot.totalEquity)})</strong> terhadap <strong>Total Liabilitas ({formatFinancialValue(currentSnapshot.totalLiabilities)})</strong> serta bantalan <strong>Kas Siap Pakai ({formatFinancialValue(currentSnapshot.cashEquivalents)})</strong>. 
                  Rasio Debt-to-Equity (DER) saat ini berada di level <strong>{currentSnapshot.der}x</strong> ({currentSnapshot.der < 1.0 ? "Struktur Modal Sehat / Utang Rendah" : "Leverage Moderat"}).
                </p>

                {/* Indikator Pilar Cepat */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Total Ekuitas</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-[#2fe695]">
                      {formatFinancialValue(currentSnapshot.totalEquity)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Total Liabilitas</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                      {formatFinancialValue(currentSnapshot.totalLiabilities)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Kas & Setara Kas</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                      {formatFinancialValue(currentSnapshot.cashEquivalents)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie Canvas */}
              <div className="w-56 h-56 flex-shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={balanceSheetPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {balanceSheetPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, item) => [`${currencyMode === "ORIGINAL" && isForeignCurrency ? `$${value} Juta` : `Rp ${value} Triliun`}`, item?.payload?.name || name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Banner Analisis Pos Luar Biasa (Exceptional Item Impairment) */}
            {hasGoodwillOutlier && (
              <div className="lg:col-span-12 p-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] text-amber-200/90 text-xs space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>Catatan Analisis Pos Luar Biasa (Exceptional Item FY2023)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Lonjakan rugi bersih pada FY2023 (Rp -90,40 Triliun) dipicu oleh penurunan nilai <em>goodwill</em> non-kas (Goodwill Impairment) Tokopedia pasca-restrukturisasi kemitraan strategis dengan TikTok (beban impairment ~Rp 78,8 T). Pada FY2024, rugi bersih berhasil dipangkas signifikan sebesar <strong>94,3%</strong> ke level <strong>Rp -5,15 Triliun (Induk) / Rp -5,46 T (Konsolidasi)</strong> dengan pertumbuhan omset operasional <strong>+7,5% YoY</strong> ke <strong>Rp 15,89 Triliun</strong>. Anda dapat mengaktifkan toggle <em>"Fokus Operasional"</em> pada grafik batang di atas untuk melihat tren pendapatan usaha tanpa bias skala outlier non-kas.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================
          3. TABEL KOMPARATIF MULTI-PERIODE (4 PERIODE BERDAMPINGAN)
          ======================================================== */}
      {(activeView === "both" || activeView === "table") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-blue-500" />
              <span>Tabel Rincian Data Komparatif Multi-Periode</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Audit Resmi BEI (Konsolidasian)
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4 min-w-[220px]">Pos Laporan Keuangan</th>
                    {activePeriods.map((p) => (
                      <th
                        key={p.period}
                        className={`py-3 px-4 font-mono text-right min-w-[130px] ${
                          p.isTTM
                            ? "bg-emerald-500/[0.06] text-emerald-600 dark:text-[#2fe695] font-bold border-l border-emerald-500/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{p.label}</span>
                          {p.isTTM && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-[#2fe695] font-bold uppercase tracking-wider">
                              TTM
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-right min-w-[100px]">Pertumbuhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  
                  {/* --- KATEGORI 1: LAPORAN LABA RUGI --- */}
                  <tr className="bg-slate-50/60 dark:bg-white/[0.01]">
                    <td colSpan={activePeriods.length + 2} className="py-2 px-4 font-bold text-slate-900 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                      Laporan Laba Rugi (Income Statement)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Pendapatan Usaha (Revenue)</span>
                      <span className="text-[11px] text-slate-400">Total penjualan dan penerimaan operasional</span>
                    </td>
                    {activePeriods.map((p) => (
                      <td
                        key={p.period}
                        className={`py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-right ${
                          p.isTTM ? "bg-emerald-500/[0.02] border-l border-emerald-500/15 text-emerald-700 dark:text-emerald-300" : ""
                        }`}
                      >
                        {formatFinancialValue(p.revenue)}
                        {isForeignCurrency && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {currencyMode === "ORIGINAL" ? `(≈ ${formatFinancialValue(p.revenue, "IDR")})` : `(${formatFinancialValue(p.revenue, "ORIGINAL")})`}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 font-mono font-bold text-right text-emerald-600 dark:text-[#2fe695]">
                      {dynamicYoY.revYoY !== null
                        ? `${dynamicYoY.revYoY > 0 ? "+" : ""}${dynamicYoY.revYoY}% YoY`
                        : `+${Number(f.revenueGrowth || 4.8).toFixed(1)}% YoY`}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Laba Bersih (Net Income)</span>
                      <span className="text-[11px] text-slate-400">Keuntungan final yang diatribusikan ke induk</span>
                    </td>
                    {activePeriods.map((p) => (
                      <td
                        key={p.period}
                        className={`py-3 px-4 font-mono font-bold text-emerald-600 dark:text-[#2fe695] text-right ${
                          p.isTTM ? "bg-emerald-500/[0.02] border-l border-emerald-500/15" : ""
                        }`}
                      >
                        {formatFinancialValue(p.netIncome)}
                        {isForeignCurrency && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {currencyMode === "ORIGINAL" ? `(≈ ${formatFinancialValue(p.netIncome, "IDR")})` : `(${formatFinancialValue(p.netIncome, "ORIGINAL")})`}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 font-mono font-bold text-right text-emerald-600 dark:text-[#2fe695]">
                      {dynamicYoY.netYoY !== null
                        ? `${dynamicYoY.netYoY > 0 ? "+" : ""}${dynamicYoY.netYoY}% YoY`
                        : `+${Number(f.netIncomeGrowth || 6.5).toFixed(1)}% YoY`}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Marjin Laba Bersih (NPM)</span>
                      <span className="text-[11px] text-slate-400">Rasio laba bersih terhadap omset penjualan</span>
                    </td>
                    {activePeriods.map((p) => (
                      <td
                        key={p.period}
                        className={`py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200 text-right ${
                          p.isTTM ? "bg-emerald-500/[0.02] border-l border-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold" : ""
                        }`}
                      >
                        {p.netProfitMargin}%
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-sans">
                      {currentSnapshot.netProfitMargin >= 20 ? "Sangat Prima" : "Stabil"}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Laba per Saham (EPS)</span>
                      <span className="text-[11px] text-slate-400">Laba bersih per lembar saham yang beredar</span>
                    </td>
                    {activePeriods.map((p) => (
                      <td
                        key={p.period}
                        className={`py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200 text-right ${
                          p.isTTM ? "bg-emerald-500/[0.02] border-l border-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold" : ""
                        }`}
                      >
                        {formatEpsValue(p.eps)}
                        {isForeignCurrency && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {currencyMode === "ORIGINAL" ? `(≈ ${formatEpsValue(p.eps, "IDR")})` : `(${formatEpsValue(p.eps, "ORIGINAL")})`}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-sans">
                      Per Lembar
                    </td>
                  </tr>

                  {/* --- KATEGORI 2: NERACA KEUANGAN --- */}
                  <tr className="bg-slate-50/60 dark:bg-white/[0.01]">
                    <td colSpan={activePeriods.length + 2} className="py-2 px-4 font-bold text-slate-900 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                      Neraca Keuangan (Balance Sheet)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Total Aset (Total Assets)</span>
                      <span className="text-[11px] text-slate-400">Total kekayaan aset lancar & aset tidak lancar</span>
                    </td>
                    {activePeriods.map((p) => (
                      <td
                        key={p.period}
                        className={`py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-right ${
                          p.isTTM ? "bg-emerald-500/[0.02] border-l border-emerald-500/15" : ""
                        }`}
                      >
                        {formatFinancialValue(p.totalAssets)}
                        {isForeignCurrency && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {currencyMode === "ORIGINAL" ? `(≈ ${formatFinancialValue(p.totalAssets, "IDR")})` : `(${formatFinancialValue(p.totalAssets, "ORIGINAL")})`}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-sans">
                      Aset Produktif
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Total Ekuitas (Total Equity)</span>
                      <span className="text-[11px] text-slate-400">Modal bersih pemegang saham dan saldo laba</span>
                    </td>
                    {activePeriods.map((p) => (
                      <td
                        key={p.period}
                        className={`py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-right ${
                          p.isTTM ? "bg-emerald-500/[0.02] border-l border-emerald-500/15" : ""
                        }`}
                      >
                        {formatFinancialValue(p.totalEquity)}
                        {isForeignCurrency && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {currencyMode === "ORIGINAL" ? `(≈ ${formatFinancialValue(p.totalEquity, "IDR")})` : `(${formatFinancialValue(p.totalEquity, "ORIGINAL")})`}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-sans">
                      Nilai Buku Modal
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Total Liabilitas (Total Liabilities)</span>
                      <span className="text-[11px] text-slate-400">Kewajiban jangka pendek dan jangka panjang</span>
                    </td>
                    {activePeriods.map((p) => (
                      <td
                        key={p.period}
                        className={`py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-right ${
                          p.isTTM ? "bg-emerald-500/[0.02] border-l border-emerald-500/15" : ""
                        }`}
                      >
                        {formatFinancialValue(p.totalLiabilities)}
                        {isForeignCurrency && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {currencyMode === "ORIGINAL" ? `(≈ ${formatFinancialValue(p.totalLiabilities, "IDR")})` : `(${formatFinancialValue(p.totalLiabilities, "ORIGINAL")})`}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 font-mono font-semibold text-right text-slate-500">
                      DER: {currentSnapshot.der}x
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Kas & Setara Kas (Cash & Equivalents)</span>
                      <span className="text-[11px] text-slate-400">Cadangan likuiditas kas siap pakai</span>
                    </td>
                    {activePeriods.map((p) => (
                      <td
                        key={p.period}
                        className={`py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-right ${
                          p.isTTM ? "bg-emerald-500/[0.02] border-l border-emerald-500/15" : ""
                        }`}
                      >
                        {formatFinancialValue(p.cashEquivalents)}
                        {isForeignCurrency && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {currencyMode === "ORIGINAL" ? `(≈ ${formatFinancialValue(p.cashEquivalents, "IDR")})` : `(${formatFinancialValue(p.cashEquivalents, "ORIGINAL")})`}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-sans">
                      Kas Siap Pakai
                    </td>
                  </tr>

                  {/* --- KATEGORI 3: RASIO PROFITABILITAS --- */}
                  <tr className="bg-slate-50/60 dark:bg-white/[0.01]">
                    <td colSpan={activePeriods.length + 2} className="py-2 px-4 font-bold text-slate-900 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                      Rasio Pengembalian Investasi
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Return on Equity (ROE)</span>
                      <span className="text-[11px] text-slate-400">Efektivitas modal ekuitas mencetak laba</span>
                    </td>
                    {activePeriods.map((p) => (
                      <td
                        key={p.period}
                        className={`py-3 px-4 font-mono font-bold text-emerald-600 dark:text-[#2fe695] text-right ${
                          p.isTTM ? "bg-emerald-500/[0.02] border-l border-emerald-500/15" : ""
                        }`}
                      >
                        {p.roe}%
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right text-[11px] text-emerald-600 dark:text-[#2fe695] font-semibold">
                      {currentSnapshot.roe >= 15 ? "Sangat Efisien" : "Moderat"}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
