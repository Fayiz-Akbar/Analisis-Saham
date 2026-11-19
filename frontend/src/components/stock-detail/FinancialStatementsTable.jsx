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
  ReferenceLine,
} from "recharts";
import { RefreshCw } from "lucide-react";

/**
 * Laporan Keuangan Konsolidasian & Ringkasan Visual
 * - Panel Kiri (7 kolom): Grafik Batang Pendapatan Usaha vs Laba Bersih Multi-Periode
 * - Panel Kanan (5 kolom): Struktur Neraca Proporsional (Aset = Ekuitas + Liabilitas), Kas, & Rasio Efisiensi
 * - Tabel Komparatif: Data historis tahunan/kuartalan + TTM dengan kalkulasi Perubahan YoY/QoQ nyata di setiap baris
 */
export default function FinancialStatementsTable({
  fundamentals,
  stock,
  quote,
  apiHistory: propHistory,
  isLoadingHistory: propLoading,
  historyError: propError,
  onRetryHistory,
}) {
  const f = fundamentals || {};
  const [periodMode, setPeriodMode] = useState("annual"); // "annual" | "quarterly"
  const [activeView, setActiveView] = useState("both"); // "both" | "charts" | "table"
  const [currencyMode, setCurrencyMode] = useState("IDR"); // "IDR" | "ORIGINAL"
  const [localHistory, setLocalHistory] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (propHistory !== undefined) return;
    const sym = quote?.symbol || stock?.symbol;
    if (!sym) return;

    let isMounted = true;
    setLocalLoading(true);

    fetch(`http://localhost:5000/api/stocks/${sym}/financial-history`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setLocalHistory(json.data);
        }
      })
      .catch((err) => {
        console.warn("Gagal fetch financial-history:", err);
      })
      .finally(() => {
        if (isMounted) setLocalLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propHistory, quote?.symbol, stock?.symbol]);

  const apiHistory = propHistory ?? localHistory;
  const isLoading = propLoading ?? localLoading;

  const financialCurrency = apiHistory?.financialCurrency || f?.financialCurrency || "IDR";
  const usdRate = Number(apiHistory?.usdToIdrRate || f?.usdToIdrRate || 16200);
  const isForeignCurrency = financialCurrency === "USD";

  const formatFinancialValue = (val, mode = currencyMode) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);

    if (isForeignCurrency && mode === "ORIGINAL") {
      const absNum = Math.abs(num);
      if (absNum >= 1e9) {
        return `$ ${(num / 1e9).toLocaleString("id-ID", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} B`;
      }
      if (absNum >= 1e6) {
        return `$ ${(num / 1e6).toLocaleString("id-ID", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} M`;
      }
      if (absNum < 1 && absNum > 0) {
        return `$ ${num.toLocaleString("id-ID", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}`;
      }
      return `$ ${num.toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    const idrNum = isForeignCurrency ? num * usdRate : num;
    const absIdr = Math.abs(idrNum);

    if (absIdr >= 1e12) {
      return `Rp ${(idrNum / 1e12).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} T`;
    }
    if (absIdr >= 1e9) {
      return `Rp ${(idrNum / 1e9).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} M`;
    }
    if (absIdr < 1000 && absIdr > 0) {
      return `Rp ${idrNum.toLocaleString("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      })}`;
    }
    return `Rp ${Math.round(idrNum).toLocaleString("id-ID")}`;
  };

  const formatEpsValue = (val, mode = currencyMode) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    if (isForeignCurrency && mode === "ORIGINAL") {
      return `$ ${num.toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })}`;
    }
    const idrNum = isForeignCurrency ? num * usdRate : num;
    return `Rp ${Number(idrNum).toLocaleString("id-ID", {
      minimumFractionDigits: Math.abs(idrNum) < 10 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPct = (val, showPlus = false) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const n = Number(val);
    const prefix = showPlus && n > 0 ? "+" : "";
    return `${prefix}${n.toLocaleString("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })}%`;
  };

  const activePeriods = useMemo(() => {
    let list = [];
    if (periodMode === "annual") {
      list = apiHistory?.annual && Array.isArray(apiHistory.annual) ? [...apiHistory.annual] : [];
    } else {
      list =
        apiHistory?.quarterly && Array.isArray(apiHistory.quarterly)
          ? [...apiHistory.quarterly]
          : [];
    }
    if (apiHistory?.ttm) {
      list.push({
        ...apiHistory.ttm,
        label: "TTM",
        isTTM: true,
      });
    }
    return list;
  }, [periodMode, apiHistory]);

  const regularPeriods = useMemo(() => {
    return activePeriods.filter((p) => !p.isTTM);
  }, [activePeriods]);

  const latestAuditPeriod = useMemo(() => {
    return regularPeriods[regularPeriods.length - 1] || apiHistory?.ttm || {};
  }, [regularPeriods, apiHistory]);

  const chartDisplayPeriods = useMemo(() => {
    const isUsdMode = currencyMode === "ORIGINAL" && isForeignCurrency;
    const chartSource = periodMode === "quarterly" ? regularPeriods : activePeriods;
    return chartSource.map((p) => {
      const revVal = isUsdMode
        ? Number(p.revenueOriginalM || (p.revenue ? p.revenue / 1e6 : 0))
        : Number(p.revenueT || 0);
      const netVal = isUsdMode
        ? Number(p.netIncomeOriginalM || (p.netIncome ? p.netIncome / 1e6 : 0))
        : Number(p.netIncomeT || 0);

      return {
        ...p,
        chartRevenue: revVal,
        chartNetIncome: netVal,
      };
    });
  }, [activePeriods, regularPeriods, currencyMode, isForeignCurrency, periodMode]);

  const hasNegativeChartValue = useMemo(() => {
    return chartDisplayPeriods.some((p) => p.chartNetIncome < 0 || p.chartRevenue < 0);
  }, [chartDisplayPeriods]);

  // Kalkulasi perubahan periode terakhir terhadap periode sebelumnya (YoY untuk tahunan, QoQ untuk kuartalan)
  const computeMetricDelta = (fieldKey, isPointDiff = false) => {
    if (regularPeriods.length < 2) return null;
    const curr = regularPeriods[regularPeriods.length - 1]?.[fieldKey];
    const prev = regularPeriods[regularPeriods.length - 2]?.[fieldKey];
    if (curr === null || curr === undefined || prev === null || prev === undefined) return null;
    const currNum = Number(curr);
    const prevNum = Number(prev);
    if (isNaN(currNum) || isNaN(prevNum)) return null;

    if (isPointDiff) {
      return Number((currNum - prevNum).toFixed(1));
    }
    if (prevNum === 0) return null;
    return Number((((currNum - prevNum) / Math.abs(prevNum)) * 100).toFixed(1));
  };

  const revDelta = computeMetricDelta("revenue", false);
  const deltaHeaderLabel = periodMode === "annual" ? "Perubahan YoY" : "Perubahan QoQ";

  // Proporsi Ekuitas vs Liabilitas terhadap Total Aset
  const balanceStructure = useMemo(() => {
    const eq = Math.max(0, Number(latestAuditPeriod.totalEquity || 0));
    const liab = Math.max(0, Number(latestAuditPeriod.totalLiabilities || 0));
    const total = eq + liab;
    if (total <= 0) {
      return { equityPct: 50, liabPct: 50, hasData: false };
    }
    const equityPct = Math.round((eq / total) * 1000) / 10;
    const liabPct = Math.max(0, Math.round((100 - equityPct) * 10) / 10);
    return { equityPct, liabPct, hasData: true };
  }, [latestAuditPeriod]);

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pData = payload[0]?.payload;
      return (
        <div className="bg-[#0c1017] border border-white/10 p-3 rounded-xl text-xs space-y-1.5 font-sans">
          <p className="font-bold text-white border-b border-white/10 pb-1">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs inline-block bg-[#3b82f6]" />
              <span>Pendapatan Usaha:</span>
            </span>
            <span className="font-mono font-bold tabular-nums text-white">
              {formatFinancialValue(pData?.revenue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs inline-block bg-[#10b981]" />
              <span>Laba Bersih:</span>
            </span>
            <span
              className={`font-mono font-bold tabular-nums ${
                Number(pData?.netIncome || 0) < 0 ? "text-[#f87171]" : "text-white"
              }`}
            >
              {formatFinancialValue(pData?.netIncome)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getValueColorClass = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "text-slate-400";
    const num = Number(val);
    if (num > 0) return "text-emerald-600 dark:text-[#2fe695]";
    if (num < 0) return "text-rose-600 dark:text-[#f87171]";
    return "text-slate-600 dark:text-slate-300";
  };

  const formatDeltaCell = (deltaVal, isPointDiff = false) => {
    if (deltaVal === null || deltaVal === undefined || isNaN(deltaVal)) return "-";
    const num = Number(deltaVal);
    const sign = num > 0 ? "+" : "";
    const formatted = num.toLocaleString("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    return isPointDiff ? `${sign}${formatted} pt` : `${sign}${formatted}%`;
  };

  const stickyLabelCellClass =
    "py-2.5 px-4 sticky left-0 z-10 bg-white dark:bg-[#0c0e14] border-r border-slate-100 dark:border-white/[0.04] font-medium text-slate-800 dark:text-slate-200";

  const TABLE_SECTIONS = [
    {
      title: "Laporan Laba Rugi (Income Statement)",
      rows: [
        {
          key: "revenue",
          label: "Pendapatan Usaha (Revenue)",
          type: "currency",
          isBold: true,
        },
        {
          key: "netIncome",
          label: "Laba Bersih (Net Income)",
          type: "currency",
          isBold: true,
          colorBySign: true,
        },
        {
          key: "netProfitMargin",
          label: "Marjin Laba Bersih (NPM)",
          type: "percent",
          isPointDiff: true,
          colorBySign: true,
        },
        {
          key: "eps",
          label: "Laba per Saham (EPS)",
          type: "eps",
          colorBySign: true,
        },
      ],
    },
    {
      title: "Neraca Keuangan (Balance Sheet)",
      rows: [
        {
          key: "totalAssets",
          label: "Total Aset",
          type: "currency",
          isBold: true,
        },
        {
          key: "totalEquity",
          label: "Total Ekuitas (Modal Bersih)",
          type: "currency",
          isBold: true,
        },
        {
          key: "totalLiabilities",
          label: "Total Liabilitas (Kewajiban)",
          type: "currency",
        },
        {
          key: "cashEquivalents",
          label: "Kas & Setara Kas",
          type: "currency",
        },
      ],
    },
    {
      title: "Rasio Pengembalian & Solvabilitas",
      rows: [
        {
          key: "roe",
          label: "Return on Equity (ROE)",
          type: "percent",
          isPointDiff: true,
          colorBySign: true,
        },
        {
          key: "roa",
          label: "Return on Assets (ROA)",
          type: "percent",
          isPointDiff: true,
          colorBySign: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* ========================================================
          1. HEADER LAPORAN KEUANGAN & CONTROLLER FILTER
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Laporan Keuangan & Struktur Neraca
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rekam jejak pendapatan, laba bersih, posisi neraca, dan rasio efisiensi{" "}
            {stock?.companyName || quote?.symbol}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isForeignCurrency && (
            <div className="inline-flex items-center bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-xs">
              <button
                type="button"
                onClick={() => setCurrencyMode("IDR")}
                title={`Konversi kurs resmi (1 USD ≈ Rp ${Math.round(usdRate).toLocaleString("id-ID")})`}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  currencyMode === "IDR"
                    ? "bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                IDR
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode("ORIGINAL")}
                title={`Mata uang pelaporan resmi emiten (${financialCurrency})`}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  currencyMode === "ORIGINAL"
                    ? "bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {financialCurrency}
              </button>
            </div>
          )}

          {/* Toggle Periode: Tahunan vs Kuartalan */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => setPeriodMode("annual")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                periodMode === "annual"
                  ? "bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Tahunan
            </button>
            <button
              type="button"
              onClick={() => setPeriodMode("quarterly")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                periodMode === "quarterly"
                  ? "bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Kuartalan
            </button>
          </div>

          {/* Switcher Tampilan (Semua / Grafik / Tabel) */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-xs">
            {[
              { id: "both", label: "Semua" },
              { id: "charts", label: "Grafik" },
              { id: "table", label: "Tabel" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeView === item.id
                    ? "bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading / Error State */}
      {isLoading && !apiHistory && (
        <div className="p-8 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin text-slate-400" aria-hidden="true" />
          <span>Memuat laporan keuangan historis...</span>
        </div>
      )}

      {propError && !apiHistory && !isLoading && (
        <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 flex items-center justify-between gap-4 text-xs">
          <span className="text-rose-700 dark:text-rose-300">{propError}</span>
          {onRetryHistory && (
            <button
              type="button"
              onClick={onRetryHistory}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
            >
              Muat Ulang
            </button>
          )}
        </div>
      )}

      {/* ========================================================
          2. RINGKASAN VISUAL (2 PANEL BERSIH & AKURAT)
          ======================================================== */}
      {apiHistory && (activeView === "both" || activeView === "charts") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Panel 1 (7 Kolom): Grafik Batang Pendapatan vs Laba Bersih */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tren Pendapatan & Laba Bersih
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Satuan dalam{" "}
                  {currencyMode === "ORIGINAL" && isForeignCurrency
                    ? `Juta ${financialCurrency}`
                    : "Triliun Rupiah"}
                </p>
              </div>

              {revDelta !== null && (
                <span
                  className={`text-xs font-bold font-mono tabular-nums px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] w-fit ${getValueColorClass(
                    revDelta
                  )}`}
                >
                  Omset {revDelta > 0 ? "+" : ""}
                  {revDelta.toLocaleString("id-ID")}% {periodMode === "annual" ? "YoY" : "QoQ"}
                </span>
              )}
            </div>

            <div className="w-full h-60 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartDisplayPeriods}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(148,163,184,0.14)"
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) =>
                      currencyMode === "ORIGINAL" && isForeignCurrency ? `$${val}M` : `${val}T`
                    }
                  />
                  {hasNegativeChartValue && (
                    <ReferenceLine y={0} stroke="rgba(148,163,184,0.35)" />
                  )}
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="rect"
                    iconSize={10}
                    wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
                  />
                  <Bar
                    dataKey="chartRevenue"
                    name="Pendapatan Usaha"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={34}
                  />
                  <Bar
                    dataKey="chartNetIncome"
                    name="Laba Bersih"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Panel 2 (5 Kolom): Komposisi Neraca & Rasio Efisiensi */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Komposisi Neraca ({latestAuditPeriod.period || "-"})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Proporsi pendanaan Aset dari Modal Bersih vs Kewajiban
                </p>
              </div>
              <span className="text-xs font-mono font-bold tabular-nums px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200">
                DER{" "}
                {latestAuditPeriod.der !== null && latestAuditPeriod.der !== undefined
                  ? `${Number(latestAuditPeriod.der).toLocaleString("id-ID")}x`
                  : "-"}
              </span>
            </div>

            {/* Bar Proporsi Ekuitas vs Liabilitas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-emerald-600 dark:text-[#2fe695] font-semibold">
                  Ekuitas {balanceStructure.equityPct}%
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  Liabilitas {balanceStructure.liabPct}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-md bg-slate-100 dark:bg-white/[0.06] overflow-hidden flex">
                <div
                  className="h-full bg-[#10b981] transition-all duration-300"
                  style={{ width: `${balanceStructure.equityPct}%` }}
                  title={`Ekuitas: ${balanceStructure.equityPct}%`}
                />
                <div
                  className="h-full bg-[#f59e0b] transition-all duration-300"
                  style={{ width: `${balanceStructure.liabPct}%` }}
                  title={`Liabilitas: ${balanceStructure.liabPct}%`}
                />
              </div>
            </div>

            {/* 4 Angka Utama Neraca */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06]">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Total Aset
                </span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  {formatFinancialValue(latestAuditPeriod.totalAssets)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06]">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Kas & Setara Kas
                </span>
                <span className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                  {formatFinancialValue(latestAuditPeriod.cashEquivalents)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06]">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Total Ekuitas
                </span>
                <span className="font-mono font-bold tabular-nums text-emerald-600 dark:text-[#2fe695] text-xs sm:text-sm">
                  {formatFinancialValue(latestAuditPeriod.totalEquity)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.025] border border-slate-200/70 dark:border-white/[0.06]">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Total Liabilitas
                </span>
                <span className="font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                  {formatFinancialValue(latestAuditPeriod.totalLiabilities)}
                </span>
              </div>
            </div>

            {/* Strip 3 Rasio Efisiensi (ROE, ROA, NPM) */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">ROE</span>
                <span
                  className={`font-mono font-bold tabular-nums ${getValueColorClass(
                    latestAuditPeriod.roe
                  )}`}
                >
                  {formatPct(latestAuditPeriod.roe)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">ROA</span>
                <span
                  className={`font-mono font-bold tabular-nums ${getValueColorClass(
                    latestAuditPeriod.roa
                  )}`}
                >
                  {formatPct(latestAuditPeriod.roa)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Marjin (NPM)
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${getValueColorClass(
                    latestAuditPeriod.netProfitMargin
                  )}`}
                >
                  {formatPct(latestAuditPeriod.netProfitMargin)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. TABEL KOMPARATIF MULTI-PERIODE
          ======================================================== */}
      {apiHistory && (activeView === "both" || activeView === "table") && (
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4 min-w-[200px] sticky left-0 z-20 bg-slate-50 dark:bg-[#10131b] border-r border-slate-200/70 dark:border-white/[0.06]">
                    Pos Laporan Keuangan
                  </th>
                  {activePeriods.map((p) => (
                    <th
                      key={p.period}
                      className={`py-3 px-4 font-mono text-right min-w-[125px] ${
                        p.isTTM
                          ? "bg-emerald-500/[0.06] text-emerald-700 dark:text-[#2fe695] font-bold border-l border-emerald-500/20"
                          : ""
                      }`}
                    >
                      {p.label}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right min-w-[115px] font-mono">
                    {deltaHeaderLabel}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {TABLE_SECTIONS.map((section) => (
                  <React.Fragment key={section.title}>
                    <tr className="bg-slate-50/70 dark:bg-white/[0.015]">
                      <td
                        colSpan={activePeriods.length + 2}
                        className="py-2 px-4 font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider"
                      >
                        {section.title}
                      </td>
                    </tr>

                    {section.rows.map((row) => {
                      const rowDelta = computeMetricDelta(row.key, Boolean(row.isPointDiff));
                      return (
                        <tr
                          key={row.key}
                          className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className={stickyLabelCellClass}>{row.label}</td>

                          {activePeriods.map((p) => {
                            const rawVal = p[row.key];
                            let formattedCell = "-";
                            if (row.type === "currency") {
                              formattedCell = formatFinancialValue(rawVal);
                            } else if (row.type === "eps") {
                              formattedCell = formatEpsValue(rawVal);
                            } else if (row.type === "percent") {
                              formattedCell = formatPct(rawVal);
                            }

                            const cellColor = row.colorBySign
                              ? getValueColorClass(rawVal)
                              : "text-slate-900 dark:text-slate-100";

                            return (
                              <td
                                key={p.period}
                                className={`py-2.5 px-4 font-mono tabular-nums text-right ${
                                  row.isBold ? "font-bold" : "font-semibold"
                                } ${cellColor} ${
                                  p.isTTM
                                    ? "bg-emerald-500/[0.02] border-l border-emerald-500/15"
                                    : ""
                                }`}
                              >
                                {formattedCell}
                              </td>
                            );
                          })}

                          <td
                            className={`py-2.5 px-4 font-mono font-semibold tabular-nums text-right ${getValueColorClass(
                              rowDelta
                            )}`}
                          >
                            {formatDeltaCell(rowDelta, Boolean(row.isPointDiff))}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
