import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/**
 * Laporan Keuangan Konsolidasian & 5 Grafik Insight Multi-Periode
 * Palet monokrom obsidian (#0f1014) + aksen pasar TradingView (#26a69a / #ef5350):
 * - Baris 1: Grafik Penjualan & Laba Bersih (8 col) + Bento Struktur Neraca & Rasio (4 col)
 * - Baris 2: Grafik Tren Profitabilitas ROE/ROA/NPM (6 col) + Grafik Perkembangan Harta, Modal, Utang & Kas (6 col)
 * - Baris 3: Grafik Laba per Lembar Saham / EPS (6 col) + Grafik Tren Beban Utang / DER (6 col)
 * - Baris 4: Tabel Komparatif Multi-Periode dengan Perubahan YoY/QoQ nyata
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
  const [activeIncomeChart, setActiveIncomeChart] = useState("both"); // "both" | "chartRevenue" | "chartNetIncome"
  const [activeProfitChart, setActiveProfitChart] = useState("all"); // "all" | "roe" | "netProfitMargin" | "roa"
  const [activeBalanceChart, setActiveBalanceChart] = useState("capital"); // "capital" | "cashDebt" | "assets"
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
  const isUsdDisplay = currencyMode === "ORIGINAL" && isForeignCurrency;

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

  const toChartUnit = (rawVal, idrVal) => {
    if (rawVal === null || rawVal === undefined || isNaN(rawVal)) return 0;
    if (isUsdDisplay) {
      return Number((Number(rawVal) / 1e6).toFixed(2));
    }
    const nominalIdr =
      idrVal !== null && idrVal !== undefined
        ? Number(idrVal)
        : isForeignCurrency
        ? Number(rawVal) * usdRate
        : Number(rawVal);
    return Number((nominalIdr / 1e12).toFixed(2));
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

  const latestHeadlinePeriod = useMemo(() => {
    if (periodMode === "annual" && apiHistory?.ttm) return apiHistory.ttm;
    return latestAuditPeriod;
  }, [periodMode, apiHistory, latestAuditPeriod]);

  // Dataset terpadu untuk seluruh grafik (Pendapatan, Laba, Neraca, Rasio, EPS, DER)
  const chartDataset = useMemo(() => {
    const source = periodMode === "quarterly" ? regularPeriods : activePeriods;
    return source.map((p) => {
      const revVal = isUsdDisplay
        ? Number(p.revenueOriginalM || (p.revenue ? p.revenue / 1e6 : 0))
        : Number(p.revenueT || 0);
      const netVal = isUsdDisplay
        ? Number(p.netIncomeOriginalM || (p.netIncome ? p.netIncome / 1e6 : 0))
        : Number(p.netIncomeT || 0);
      const epsVal =
        p.eps !== null && p.eps !== undefined
          ? isUsdDisplay
            ? Number(p.eps)
            : Number(p.epsIdr ?? (isForeignCurrency ? Number(p.eps) * usdRate : Number(p.eps)))
          : null;

      return {
        ...p,
        chartRevenue: revVal,
        chartNetIncome: netVal,
        chartAssets: toChartUnit(p.totalAssets, p.totalAssetsIdr),
        chartEquity: Math.max(0, toChartUnit(p.totalEquity, p.totalEquityIdr)),
        chartLiabilities: Math.max(0, toChartUnit(p.totalLiabilities, p.totalLiabilitiesIdr)),
        chartCash: Math.max(0, toChartUnit(p.cashEquivalents, p.cashEquivalentsIdr)),
        chartEps: epsVal !== null && !isNaN(epsVal) ? Number(epsVal.toFixed(2)) : null,
        chartDer: p.der !== null && p.der !== undefined && !isNaN(p.der) ? Number(p.der) : null,
      };
    });
  }, [activePeriods, regularPeriods, isUsdDisplay, isForeignCurrency, usdRate, periodMode]);

  const profitDataset = useMemo(() => {
    return chartDataset.filter(
      (p) =>
        p.roe !== null || p.roa !== null || p.netProfitMargin !== null
    );
  }, [chartDataset]);

  const epsDataset = useMemo(() => {
    return chartDataset.filter((p) => p.chartEps !== null);
  }, [chartDataset]);

  const derDataset = useMemo(() => {
    return chartDataset.filter((p) => p.chartDer !== null);
  }, [chartDataset]);

  const hasNegativeIncome = useMemo(() => {
    return chartDataset.some((p) => p.chartNetIncome < 0 || p.chartRevenue < 0);
  }, [chartDataset]);

  const hasNegativeProfitRatio = useMemo(() => {
    return profitDataset.some(
      (p) =>
        Number(p.roe || 0) < 0 ||
        Number(p.roa || 0) < 0 ||
        Number(p.netProfitMargin || 0) < 0
    );
  }, [profitDataset]);

  const hasNegativeEps = useMemo(() => {
    return epsDataset.some((p) => Number(p.chartEps || 0) < 0);
  }, [epsDataset]);

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
  const netDelta = computeMetricDelta("netIncome", false);
  const epsDelta = computeMetricDelta("eps", false);
  const deltaHeaderLabel = periodMode === "annual" ? "Perubahan YoY" : "Perubahan QoQ";
  const periodDeltaSuffix = periodMode === "annual" ? "YoY" : "QoQ";

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

  const incomeChartConfig = useMemo(
    () => ({
      chartRevenue: {
        label: "Penjualan (Pendapatan)",
        color: "hsl(var(--chart-1))",
      },
      chartNetIncome: {
        label: "Laba Bersih",
        color: "hsl(var(--chart-2))",
      },
    }),
    []
  );

  const profitChartConfig = useMemo(
    () => ({
      roe: {
        label: "ROE (Laba / Modal)",
        color: "hsl(var(--chart-2))",
      },
      netProfitMargin: {
        label: "Marjin Bersih (NPM)",
        color: "hsl(var(--chart-1))",
      },
      roa: {
        label: "ROA (Laba / Aset)",
        color: "hsl(var(--chart-4))",
      },
    }),
    []
  );

  const balanceChartConfig = useMemo(
    () => ({
      chartEquity: {
        label: "Modal Bersih (Ekuitas)",
        color: "hsl(var(--chart-1))",
      },
      chartLiabilities: {
        label: "Total Utang (Liabilitas)",
        color: "hsl(var(--chart-3))",
      },
      chartCash: {
        label: "Uang Kas Tersedia",
        color: "hsl(var(--chart-2))",
      },
      chartAssets: {
        label: "Total Harta (Aset)",
        color: "hsl(var(--chart-1))",
      },
    }),
    []
  );

  const epsChartConfig = useMemo(
    () => ({
      chartEps: {
        label: "Laba / Lembar (EPS)",
        color: "hsl(var(--chart-2))",
      },
    }),
    []
  );

  const derChartConfig = useMemo(
    () => ({
      chartDer: {
        label: "Rasio Utang (DER)",
        color: "hsl(var(--chart-1))",
      },
    }),
    []
  );

  const getValueColorClass = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "text-zinc-400 dark:text-zinc-500";
    const num = Number(val);
    if (num > 0) return "text-emerald-600 dark:text-[#26a69a]";
    if (num < 0) return "text-rose-600 dark:text-[#ef5350]";
    return "text-zinc-700 dark:text-zinc-300";
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
    "py-2.5 px-4 sticky left-0 z-10 bg-white dark:bg-[#0f1014] border-r border-zinc-100 dark:border-white/[0.04] font-medium text-zinc-800 dark:text-zinc-200";

  const TABLE_SECTIONS = [
    {
      title: "Laporan Laba Rugi (Penjualan & Keuntungan)",
      rows: [
        {
          key: "revenue",
          label: "Total Penjualan (Revenue)",
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
          label: "Sisa Laba dari Penjualan (NPM)",
          type: "percent",
          isPointDiff: true,
          colorBySign: true,
        },
        {
          key: "eps",
          label: "Laba per 1 Lembar Saham (EPS)",
          type: "eps",
          colorBySign: true,
        },
      ],
    },
    {
      title: "Neraca Keuangan (Harta, Modal, & Utang)",
      rows: [
        {
          key: "totalAssets",
          label: "Total Harta (Aset)",
          type: "currency",
          isBold: true,
        },
        {
          key: "totalEquity",
          label: "Modal Bersih (Ekuitas)",
          type: "currency",
          isBold: true,
        },
        {
          key: "totalLiabilities",
          label: "Total Utang (Liabilitas)",
          type: "currency",
        },
        {
          key: "cashEquivalents",
          label: "Uang Kas Tersedia",
          type: "currency",
        },
      ],
    },
    {
      title: "Rasio Efisiensi Usaha",
      rows: [
        {
          key: "roe",
          label: "Laba dari Modal Sendiri (ROE)",
          type: "percent",
          isPointDiff: true,
          colorBySign: true,
        },
        {
          key: "roa",
          label: "Laba dari Total Harta (ROA)",
          type: "percent",
          isPointDiff: true,
          colorBySign: true,
        },
      ],
    },
  ];

  const INCOME_HEADER_TABS = [
    {
      id: "both",
      label: "Perbandingan",
      value:
        latestHeadlinePeriod?.netProfitMargin !== null &&
        latestHeadlinePeriod?.netProfitMargin !== undefined
          ? `NPM ${formatPct(latestHeadlinePeriod.netProfitMargin)}`
          : "2 Seri",
      valueClass: getValueColorClass(latestHeadlinePeriod?.netProfitMargin),
    },
    {
      id: "chartRevenue",
      label: "Penjualan",
      value: formatFinancialValue(latestHeadlinePeriod?.revenue),
      valueClass: "text-zinc-900 dark:text-white",
    },
    {
      id: "chartNetIncome",
      label: "Laba Bersih",
      value: formatFinancialValue(latestHeadlinePeriod?.netIncome),
      valueClass:
        latestHeadlinePeriod?.netIncome !== null &&
        latestHeadlinePeriod?.netIncome !== undefined &&
        Number(latestHeadlinePeriod.netIncome) < 0
          ? "text-rose-600 dark:text-[#ef5350]"
          : "text-emerald-600 dark:text-[#26a69a]",
    },
  ];

  const PROFIT_HEADER_TABS = [
    { id: "all", label: "Semua", value: "3 Rasio", valueClass: "text-zinc-900 dark:text-white" },
    {
      id: "roe",
      label: "ROE",
      value: formatPct(latestAuditPeriod?.roe),
      valueClass: getValueColorClass(latestAuditPeriod?.roe),
    },
    {
      id: "netProfitMargin",
      label: "Marjin",
      value: formatPct(latestAuditPeriod?.netProfitMargin),
      valueClass: getValueColorClass(latestAuditPeriod?.netProfitMargin),
    },
    {
      id: "roa",
      label: "ROA",
      value: formatPct(latestAuditPeriod?.roa),
      valueClass: getValueColorClass(latestAuditPeriod?.roa),
    },
  ];

  const BALANCE_HEADER_TABS = [
    {
      id: "capital",
      label: "Modal vs Utang",
      value: formatFinancialValue(latestAuditPeriod?.totalEquity),
      valueClass: "text-zinc-900 dark:text-white",
    },
    {
      id: "cashDebt",
      label: "Kas vs Utang",
      value: formatFinancialValue(latestAuditPeriod?.cashEquivalents),
      valueClass: "text-zinc-900 dark:text-white",
    },
    {
      id: "assets",
      label: "Total Aset",
      value: formatFinancialValue(latestAuditPeriod?.totalAssets),
      valueClass: "text-zinc-900 dark:text-white",
    },
  ];

  const unitLabel = isUsdDisplay ? `Juta ${financialCurrency}` : "Triliun Rupiah";
  const periodLabel = periodMode === "annual" ? "Tahunan + 12 Bulan Terakhir (TTM)" : "Kuartalan (Q1-Q4)";

  return (
    <div className="space-y-4">
      {/* ========================================================
          1. HEADER LAPORAN KEUANGAN & CONTROLLER FILTER
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2.5 border-b border-zinc-200 dark:border-white/[0.08]">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Laporan Keuangan & Grafik Kinerja
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Perkembangan penjualan, laba, modal, utang, uang kas, dan efisiensi usaha{" "}
            {stock?.companyName || quote?.symbol}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isForeignCurrency && (
            <div className="inline-flex items-center bg-zinc-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] text-xs">
              <button
                type="button"
                onClick={() => setCurrencyMode("IDR")}
                title={`Konversi kurs resmi (1 USD ≈ Rp ${Math.round(usdRate).toLocaleString("id-ID")})`}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  currencyMode === "IDR"
                    ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
                    ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {financialCurrency}
              </button>
            </div>
          )}

          {/* Toggle Periode: Tahunan vs Kuartalan */}
          <div className="inline-flex items-center bg-zinc-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => setPeriodMode("annual")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                periodMode === "annual"
                  ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Tahunan
            </button>
            <button
              type="button"
              onClick={() => setPeriodMode("quarterly")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                periodMode === "quarterly"
                  ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Kuartalan
            </button>
          </div>

          {/* Switcher Tampilan (Semua / Grafik / Tabel) */}
          <div className="inline-flex items-center bg-zinc-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] text-xs">
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
                    ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] flex items-center justify-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" aria-hidden="true" />
          <span>Memuat laporan keuangan historis...</span>
        </div>
      )}

      {propError && !apiHistory && !isLoading && (
        <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 flex items-center justify-between gap-4 text-xs">
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
          2. VISUALISASI MULTI-GRAFIK (5 GRAFIK INSIGHT + BENTO NERACA)
          ======================================================== */}
      {apiHistory && (activeView === "both" || activeView === "charts") && (
        <div className="space-y-4">
          {/* BARIS 1: PENJUALAN & LABA BERSIH (8 COL) + STRUKTUR NERACA & RASIO (4 COL) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* GRAFIK 1: PENJUALAN & LABA BERSIH */}
            <Card className="lg:col-span-8 flex flex-col justify-between overflow-hidden">
              <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-zinc-200 dark:border-white/[0.08] p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-5 py-4">
                  <CardTitle className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                    Penjualan & Laba Bersih
                  </CardTitle>
                  <CardDescription className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Satuan {unitLabel} ({periodLabel})
                  </CardDescription>
                </div>

                <div className="flex border-t border-zinc-200 dark:border-white/[0.08] sm:border-t-0">
                  {INCOME_HEADER_TABS.map((tab) => {
                    const isActive = activeIncomeChart === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        data-active={isActive}
                        onClick={() => setActiveIncomeChart(tab.id)}
                        className={cn(
                          "relative flex flex-1 flex-col justify-center gap-0.5 px-3.5 py-3 text-left transition-colors cursor-pointer sm:px-5 sm:py-3.5 sm:border-l border-zinc-200 dark:border-white/[0.08] even:border-l first:border-l-0 sm:first:border-l",
                          isActive
                            ? "bg-zinc-100/80 dark:bg-white/[0.05]"
                            : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                        )}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {tab.label}
                        </span>
                        <span
                          className={cn(
                            "text-xs sm:text-sm font-extrabold font-mono tabular-nums leading-tight whitespace-nowrap",
                            tab.valueClass
                          )}
                        >
                          {tab.value}
                        </span>
                        {isActive && (
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardHeader>

              <CardContent className="px-3 pt-4 pb-4 sm:px-5 sm:pt-5 flex-1 flex flex-col justify-center">
                <ChartContainer config={incomeChartConfig} className="aspect-auto h-[265px] w-full">
                  <BarChart
                    accessibilityLayer
                    data={chartDataset}
                    margin={{ top: 8, right: 10, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => (isUsdDisplay ? `$${val}M` : `${val}T`)}
                    />
                    {hasNegativeIncome && (
                      <ReferenceLine y={0} stroke="rgba(161,161,170,0.4)" />
                    )}
                    <ChartTooltip
                      cursor={{ fill: "rgba(161, 161, 170, 0.08)" }}
                      content={
                        <ChartTooltipContent
                          className="min-w-[190px]"
                          formatter={(value, name, item) => {
                            const isRev = item.dataKey === "chartRevenue";
                            const rawNominal = isRev
                              ? item.payload?.revenue
                              : item.payload?.netIncome;
                            const isNeg = Number(rawNominal || 0) < 0;
                            const swatchColor = isRev
                              ? "hsl(var(--chart-1))"
                              : isNeg
                              ? "#ef5350"
                              : "hsl(var(--chart-2))";
                            return (
                              <div className="flex w-full items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                    style={{ backgroundColor: swatchColor }}
                                  />
                                  <span>{isRev ? "Penjualan" : "Laba Bersih"}</span>
                                </span>
                                <span
                                  className={cn(
                                    "font-mono font-bold tabular-nums",
                                    isNeg
                                      ? "text-rose-600 dark:text-[#ef5350]"
                                      : "text-zinc-900 dark:text-white"
                                  )}
                                >
                                  {formatFinancialValue(rawNominal)}
                                </span>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                    {activeIncomeChart === "both" && (
                      <ChartLegend content={<ChartLegendContent />} />
                    )}
                    {(activeIncomeChart === "both" || activeIncomeChart === "chartRevenue") && (
                      <Bar
                        dataKey="chartRevenue"
                        name="Penjualan (Pendapatan)"
                        fill="var(--color-chartRevenue)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={activeIncomeChart === "both" ? 32 : 46}
                      />
                    )}
                    {(activeIncomeChart === "both" || activeIncomeChart === "chartNetIncome") && (
                      <Bar
                        dataKey="chartNetIncome"
                        name="Laba Bersih"
                        fill="var(--color-chartNetIncome)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={activeIncomeChart === "both" ? 32 : 46}
                      >
                        {chartDataset.map((entry, idx) => (
                          <Cell
                            key={`net-${idx}`}
                            fill={
                              Number(entry.chartNetIncome) < 0
                                ? "#ef5350"
                                : "var(--color-chartNetIncome)"
                            }
                          />
                        ))}
                      </Bar>
                    )}
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* PANEL KANAN (4 COL): STRUKTUR NERACA + RINGKASAN RASIO */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900 text-white dark:bg-[#14151a] border border-zinc-800 dark:border-white/[0.10] flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                      Struktur Neraca ({latestAuditPeriod.period || "-"})
                    </p>
                    <h3 className="text-sm font-bold tracking-tight text-white mt-0.5">
                      Sumber Dana: Modal vs Utang
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold tabular-nums px-2 py-0.5 rounded-md bg-white/[0.07] border border-white/[0.10] text-zinc-100 shrink-0">
                    DER{" "}
                    {latestAuditPeriod.der !== null && latestAuditPeriod.der !== undefined
                      ? `${Number(latestAuditPeriod.der).toLocaleString("id-ID")}x`
                      : "-"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight tabular-nums text-white">
                        {balanceStructure.equityPct}%
                      </span>
                      <span className="text-[11px] text-zinc-400 ml-1.5">Modal Sendiri</span>
                    </div>
                    <span className="text-xs font-mono font-semibold tabular-nums text-zinc-400 mb-0.5">
                      Utang {balanceStructure.liabPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.08] rounded-sm overflow-hidden flex">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${balanceStructure.equityPct}%` }}
                    />
                    <div
                      className="h-full bg-zinc-600 transition-all duration-300"
                      style={{ width: `${balanceStructure.liabPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-400 block">Total Harta (Aset)</span>
                    <span className="font-mono font-bold tabular-nums text-white">
                      {formatFinancialValue(latestAuditPeriod.totalAssets)}
                    </span>
                  </div>
                  <div className="px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-400 block">Uang Kas Tersedia</span>
                    <span className="font-mono font-bold tabular-nums text-white">
                      {formatFinancialValue(latestAuditPeriod.cashEquivalents)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] flex flex-col justify-between gap-4 flex-1">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-100 dark:border-white/[0.06]">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                    Rasio Efisiensi & Laba
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    {latestAuditPeriod.period || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                      ROE (Laba / Modal)
                    </span>
                    <span
                      className={cn(
                        "font-mono font-extrabold text-sm tabular-nums",
                        getValueColorClass(latestAuditPeriod.roe)
                      )}
                    >
                      {formatPct(latestAuditPeriod.roe)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                      ROA (Laba / Aset)
                    </span>
                    <span
                      className={cn(
                        "font-mono font-extrabold text-sm tabular-nums",
                        getValueColorClass(latestAuditPeriod.roa)
                      )}
                    >
                      {formatPct(latestAuditPeriod.roa)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Marjin (NPM)
                    </span>
                    <span
                      className={cn(
                        "font-mono font-extrabold text-sm tabular-nums",
                        getValueColorClass(latestAuditPeriod.netProfitMargin)
                      )}
                    >
                      {formatPct(latestAuditPeriod.netProfitMargin)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Laba / Saham (EPS)
                    </span>
                    <span
                      className={cn(
                        "font-mono font-extrabold text-sm tabular-nums",
                        latestAuditPeriod.eps !== null &&
                          latestAuditPeriod.eps !== undefined &&
                          Number(latestAuditPeriod.eps) < 0
                          ? "text-rose-600 dark:text-[#ef5350]"
                          : "text-zinc-900 dark:text-white"
                      )}
                    >
                      {formatEpsValue(latestAuditPeriod.eps)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Penjualan ({periodDeltaSuffix})
                    </span>
                    <span
                      className={cn(
                        "font-mono font-extrabold text-sm tabular-nums",
                        getValueColorClass(revDelta)
                      )}
                    >
                      {formatDeltaCell(revDelta, false)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                      Laba ({periodDeltaSuffix})
                    </span>
                    <span
                      className={cn(
                        "font-mono font-extrabold text-sm tabular-nums",
                        getValueColorClass(netDelta)
                      )}
                    >
                      {formatDeltaCell(netDelta, false)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BARIS 2: TREN PROFITABILITAS (6 COL) + PERKEMBANGAN NERACA & KAS (6 COL) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* GRAFIK 2: TREN PROFITABILITAS & EFISIENSI (ROE, NPM, ROA) */}
            <Card className="lg:col-span-6 flex flex-col justify-between overflow-hidden">
              <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-zinc-200 dark:border-white/[0.08] p-0 xl:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-5 py-4">
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">
                    Tren Profitabilitas (%)
                  </CardTitle>
                  <CardDescription className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Kemampuan cetak laba dari modal (ROE), penjualan (NPM), dan harta (ROA)
                  </CardDescription>
                </div>

                <div className="flex border-t border-zinc-200 dark:border-white/[0.08] xl:border-t-0">
                  {PROFIT_HEADER_TABS.map((tab) => {
                    const isActive = activeProfitChart === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveProfitChart(tab.id)}
                        className={cn(
                          "relative flex flex-1 flex-col justify-center gap-0.5 px-3 py-2.5 text-left transition-colors cursor-pointer xl:border-l border-zinc-200 dark:border-white/[0.08] even:border-l first:border-l-0 xl:first:border-l",
                          isActive
                            ? "bg-zinc-100/80 dark:bg-white/[0.05]"
                            : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                        )}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {tab.label}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-extrabold font-mono tabular-nums whitespace-nowrap",
                            tab.valueClass
                          )}
                        >
                          {tab.value}
                        </span>
                        {isActive && (
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardHeader>

              <CardContent className="px-3 pt-4 pb-4 sm:px-5 sm:pt-5 flex-1">
                <ChartContainer config={profitChartConfig} className="aspect-auto h-[230px] w-full">
                  <LineChart
                    accessibilityLayer
                    data={profitDataset}
                    margin={{ top: 10, right: 12, left: -14, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => `${val}%`}
                    />
                    {hasNegativeProfitRatio && (
                      <ReferenceLine y={0} stroke="rgba(161,161,170,0.4)" />
                    )}
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="min-w-[180px]"
                          formatter={(value, name, item) => {
                            const labelMap = {
                              roe: "ROE (Laba / Modal)",
                              netProfitMargin: "Marjin Bersih (NPM)",
                              roa: "ROA (Laba / Aset)",
                            };
                            const colorMap = {
                              roe: "hsl(var(--chart-2))",
                              netProfitMargin: "hsl(var(--chart-1))",
                              roa: "hsl(var(--chart-4))",
                            };
                            return (
                              <div className="flex w-full items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                    style={{ backgroundColor: colorMap[item.dataKey] || item.color }}
                                  />
                                  <span>{labelMap[item.dataKey] || name}</span>
                                </span>
                                <span
                                  className={cn(
                                    "font-mono font-bold tabular-nums",
                                    getValueColorClass(value)
                                  )}
                                >
                                  {formatPct(value)}
                                </span>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                    {activeProfitChart === "all" && (
                      <ChartLegend content={<ChartLegendContent />} />
                    )}
                    {(activeProfitChart === "all" || activeProfitChart === "roe") && (
                      <Line
                        type="monotone"
                        dataKey="roe"
                        name="ROE (Laba / Modal)"
                        stroke="var(--color-roe)"
                        strokeWidth={2.2}
                        dot={{ r: 3, fill: "var(--color-roe)", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    )}
                    {(activeProfitChart === "all" || activeProfitChart === "netProfitMargin") && (
                      <Line
                        type="monotone"
                        dataKey="netProfitMargin"
                        name="Marjin Bersih (NPM)"
                        stroke="var(--color-netProfitMargin)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "var(--color-netProfitMargin)", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    )}
                    {(activeProfitChart === "all" || activeProfitChart === "roa") && (
                      <Line
                        type="monotone"
                        dataKey="roa"
                        name="ROA (Laba / Aset)"
                        stroke="var(--color-roa)"
                        strokeWidth={1.8}
                        strokeDasharray="4 3"
                        dot={{ r: 3, fill: "var(--color-roa)", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    )}
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* GRAFIK 3: PERKEMBANGAN NERACA (MODAL VS UTANG / KAS VS UTANG / TOTAL ASET) */}
            <Card className="lg:col-span-6 flex flex-col justify-between overflow-hidden">
              <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-zinc-200 dark:border-white/[0.08] p-0 xl:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-5 py-4">
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">
                    Perkembangan Neraca & Kas
                  </CardTitle>
                  <CardDescription className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Perbandingan harta, modal sendiri, utang, dan uang kas ({unitLabel})
                  </CardDescription>
                </div>

                <div className="flex border-t border-zinc-200 dark:border-white/[0.08] xl:border-t-0">
                  {BALANCE_HEADER_TABS.map((tab) => {
                    const isActive = activeBalanceChart === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveBalanceChart(tab.id)}
                        className={cn(
                          "relative flex flex-1 flex-col justify-center gap-0.5 px-3 py-2.5 text-left transition-colors cursor-pointer xl:border-l border-zinc-200 dark:border-white/[0.08] even:border-l first:border-l-0 xl:first:border-l",
                          isActive
                            ? "bg-zinc-100/80 dark:bg-white/[0.05]"
                            : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                        )}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {tab.label}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-extrabold font-mono tabular-nums whitespace-nowrap",
                            tab.valueClass
                          )}
                        >
                          {tab.value}
                        </span>
                        {isActive && (
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardHeader>

              <CardContent className="px-3 pt-4 pb-4 sm:px-5 sm:pt-5 flex-1">
                <ChartContainer config={balanceChartConfig} className="aspect-auto h-[230px] w-full">
                  <BarChart
                    accessibilityLayer
                    data={chartDataset}
                    margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => (isUsdDisplay ? `$${val}M` : `${val}T`)}
                    />
                    <ChartTooltip
                      cursor={{ fill: "rgba(161, 161, 170, 0.08)" }}
                      content={
                        <ChartTooltipContent
                          className="min-w-[195px]"
                          formatter={(value, name, item) => {
                            const fieldMap = {
                              chartEquity: {
                                label: "Modal Bersih",
                                raw: item.payload?.totalEquity,
                                color: "hsl(var(--chart-1))",
                              },
                              chartLiabilities: {
                                label: "Total Utang",
                                raw: item.payload?.totalLiabilities,
                                color: "hsl(var(--chart-3))",
                              },
                              chartCash: {
                                label: "Uang Kas Tersedia",
                                raw: item.payload?.cashEquivalents,
                                color: "hsl(var(--chart-2))",
                              },
                              chartAssets: {
                                label: "Total Harta (Aset)",
                                raw: item.payload?.totalAssets,
                                color: "hsl(var(--chart-1))",
                              },
                            };
                            const info = fieldMap[item.dataKey];
                            return (
                              <div className="flex w-full items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                    style={{ backgroundColor: info?.color || item.color }}
                                  />
                                  <span>{info?.label || name}</span>
                                </span>
                                <span className="font-mono font-bold tabular-nums text-zinc-900 dark:text-white">
                                  {formatFinancialValue(info?.raw)}
                                </span>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                    {activeBalanceChart !== "assets" && (
                      <ChartLegend content={<ChartLegendContent />} />
                    )}
                    {activeBalanceChart === "capital" && (
                      <>
                        <Bar
                          dataKey="chartEquity"
                          name="Modal Bersih (Ekuitas)"
                          stackId="neraca"
                          fill="var(--color-chartEquity)"
                          radius={[0, 0, 0, 0]}
                          maxBarSize={38}
                        />
                        <Bar
                          dataKey="chartLiabilities"
                          name="Total Utang (Liabilitas)"
                          stackId="neraca"
                          fill="var(--color-chartLiabilities)"
                          radius={[5, 5, 0, 0]}
                          maxBarSize={38}
                        />
                      </>
                    )}
                    {activeBalanceChart === "cashDebt" && (
                      <>
                        <Bar
                          dataKey="chartCash"
                          name="Uang Kas Tersedia"
                          fill="var(--color-chartCash)"
                          radius={[5, 5, 0, 0]}
                          maxBarSize={28}
                        />
                        <Bar
                          dataKey="chartLiabilities"
                          name="Total Utang (Liabilitas)"
                          fill="var(--color-chartLiabilities)"
                          radius={[5, 5, 0, 0]}
                          maxBarSize={28}
                        />
                      </>
                    )}
                    {activeBalanceChart === "assets" && (
                      <Bar
                        dataKey="chartAssets"
                        name="Total Harta (Aset)"
                        fill="var(--color-chartAssets)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={42}
                      />
                    )}
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* BARIS 3: LABA PER LEMBAR SAHAM / EPS (6 COL) + TREN RASIO UTANG / DER (6 COL) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* GRAFIK 4: LABA PER 1 LEMBAR SAHAM (EPS) */}
            <Card className="lg:col-span-6 flex flex-col justify-between overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/[0.08] px-5 py-4 space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">
                    Laba per 1 Lembar Saham (EPS)
                  </CardTitle>
                  <CardDescription className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Jatah keuntungan bersih yang melekat pada setiap 1 lembar saham
                  </CardDescription>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      "text-sm sm:text-base font-extrabold font-mono tabular-nums",
                      latestAuditPeriod?.eps !== null &&
                        latestAuditPeriod?.eps !== undefined &&
                        Number(latestAuditPeriod.eps) < 0
                        ? "text-rose-600 dark:text-[#ef5350]"
                        : "text-zinc-900 dark:text-white"
                    )}
                  >
                    {formatEpsValue(latestAuditPeriod?.eps)}
                  </div>
                  {epsDelta !== null && (
                    <div
                      className={cn(
                        "text-[11px] font-mono font-semibold tabular-nums",
                        getValueColorClass(epsDelta)
                      )}
                    >
                      {formatDeltaCell(epsDelta, false)} {periodDeltaSuffix}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-3 pt-4 pb-4 sm:px-5 sm:pt-5 flex-1">
                {epsDataset.length > 0 ? (
                  <ChartContainer config={epsChartConfig} className="aspect-auto h-[210px] w-full">
                    <BarChart
                      accessibilityLayer
                      data={epsDataset}
                      margin={{ top: 8, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(val) => (isUsdDisplay ? `$${val}` : `${val}`)}
                      />
                      {hasNegativeEps && (
                        <ReferenceLine y={0} stroke="rgba(161,161,170,0.4)" />
                      )}
                      <ChartTooltip
                        cursor={{ fill: "rgba(161, 161, 170, 0.08)" }}
                        content={
                          <ChartTooltipContent
                            className="min-w-[175px]"
                            formatter={(value, name, item) => {
                              const isNeg = Number(value || 0) < 0;
                              return (
                                <div className="flex w-full items-center justify-between gap-4">
                                  <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                    <span
                                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                      style={{
                                        backgroundColor: isNeg ? "#ef5350" : "hsl(var(--chart-2))",
                                      }}
                                    />
                                    <span>Laba / Lembar (EPS)</span>
                                  </span>
                                  <span
                                    className={cn(
                                      "font-mono font-bold tabular-nums",
                                      isNeg
                                        ? "text-rose-600 dark:text-[#ef5350]"
                                        : "text-zinc-900 dark:text-white"
                                    )}
                                  >
                                    {formatEpsValue(item.payload?.eps)}
                                  </span>
                                </div>
                              );
                            }}
                          />
                        }
                      />
                      <Bar
                        dataKey="chartEps"
                        name="Laba / Lembar (EPS)"
                        fill="var(--color-chartEps)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={38}
                      >
                        {epsDataset.map((entry, idx) => (
                          <Cell
                            key={`eps-${idx}`}
                            fill={
                              Number(entry.chartEps) < 0 ? "#ef5350" : "var(--color-chartEps)"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[210px] flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                    Data EPS per periode tersedia pada tampilan Tahunan.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GRAFIK 5: TREN BEBAN UTANG TERHADAP MODAL (DER) */}
            <Card className="lg:col-span-6 flex flex-col justify-between overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/[0.08] px-5 py-4 space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">
                    Tren Rasio Utang dibanding Modal (DER)
                  </CardTitle>
                  <CardDescription className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Garis batas 1,0x menunjukkan total utang sama besar dengan modal sendiri
                  </CardDescription>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-zinc-900 dark:text-white">
                    {latestAuditPeriod?.der !== null && latestAuditPeriod?.der !== undefined
                      ? `${Number(latestAuditPeriod.der).toLocaleString("id-ID", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}x`
                      : "-"}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    {latestAuditPeriod?.period || "-"}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-3 pt-4 pb-4 sm:px-5 sm:pt-5 flex-1">
                {derDataset.length > 0 ? (
                  <ChartContainer config={derChartConfig} className="aspect-auto h-[210px] w-full">
                    <AreaChart
                      accessibilityLayer
                      data={derDataset}
                      margin={{ top: 10, right: 12, left: -14, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="derMonoFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(val) => `${val}x`}
                      />
                      <ReferenceLine
                        y={1}
                        stroke="rgba(161,161,170,0.45)"
                        strokeDasharray="4 4"
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            className="min-w-[175px]"
                            formatter={(value) => (
                              <div className="flex w-full items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                    style={{ backgroundColor: "hsl(var(--chart-1))" }}
                                  />
                                  <span>Utang / Modal (DER)</span>
                                </span>
                                <span className="font-mono font-bold tabular-nums text-zinc-900 dark:text-white">
                                  {Number(value).toLocaleString("id-ID", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                  x
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="chartDer"
                        name="Rasio Utang (DER)"
                        stroke="var(--color-chartDer)"
                        strokeWidth={2}
                        fill="url(#derMonoFill)"
                        dot={{ r: 3, fill: "var(--color-chartDer)", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[210px] flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                    Data rasio DER belum tersedia untuk periode ini.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================
          3. TABEL KOMPARATIF MULTI-PERIODE
          ======================================================== */}
      {apiHistory && (activeView === "both" || activeView === "table") && (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 font-semibold">
                  <th className="py-3 px-4 min-w-[215px] sticky left-0 z-20 bg-zinc-50 dark:bg-[#131419] border-r border-zinc-200/70 dark:border-white/[0.06]">
                    Pos Laporan Keuangan
                  </th>
                  {activePeriods.map((p) => (
                    <th
                      key={p.period}
                      className={`py-3 px-4 font-mono text-right min-w-[125px] ${
                        p.isTTM
                          ? "bg-zinc-100/70 dark:bg-white/[0.04] text-zinc-900 dark:text-white font-bold border-l border-zinc-200 dark:border-white/[0.08]"
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
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                {TABLE_SECTIONS.map((section) => (
                  <React.Fragment key={section.title}>
                    <tr className="bg-zinc-50/70 dark:bg-white/[0.015]">
                      <td
                        colSpan={activePeriods.length + 2}
                        className="py-2 px-4 font-bold text-zinc-600 dark:text-zinc-300 text-[11px] uppercase tracking-wider"
                      >
                        {section.title}
                      </td>
                    </tr>

                    {section.rows.map((row) => {
                      const rowDelta = computeMetricDelta(row.key, Boolean(row.isPointDiff));
                      return (
                        <tr
                          key={row.key}
                          className="hover:bg-zinc-50/60 dark:hover:bg-white/[0.02] transition-colors"
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
                              : "text-zinc-900 dark:text-zinc-100";

                            return (
                              <td
                                key={p.period}
                                className={`py-2.5 px-4 font-mono tabular-nums text-right ${
                                  row.isBold ? "font-bold" : "font-semibold"
                                } ${cellColor} ${
                                  p.isTTM
                                    ? "bg-zinc-50/60 dark:bg-white/[0.02] border-l border-zinc-200/70 dark:border-white/[0.06]"
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
