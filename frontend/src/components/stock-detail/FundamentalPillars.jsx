import React from "react";
import { cn } from "@/lib/utils";

/**
 * 4 Pilar Fundamental Saham
 * Menampilkan data faktual murni dengan istilah yang ramah pemula
 * (tanpa label penilaian/prediksi if-else).
 */
export default function FundamentalPillars({ fundamentals }) {
  const f = fundamentals || {};

  const formatNum = (val, suffix = "") => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    return `${Number(val).toLocaleString("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })}${suffix}`;
  };

  const formatRupiahShort = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    if (Math.abs(num) >= 1e12) {
      return `Rp ${(num / 1e12).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} T`;
    }
    if (Math.abs(num) >= 1e9) {
      return `Rp ${(num / 1e9).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} M`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const isForeignCurrency = f?.financialCurrency === "USD";
  const usdRate = Number(f?.usdToIdrRate || 16200);

  const formatFinancialMetric = (val, valIdr) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    if (isForeignCurrency) {
      const idrNom = valIdr !== undefined && valIdr !== null ? Number(valIdr) : num * usdRate;
      return formatRupiahShort(idrNom);
    }
    return formatRupiahShort(num);
  };

  const formatEpsMetric = (val, valIdr) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    if (isForeignCurrency) {
      const idrNom = valIdr !== undefined && valIdr !== null ? Number(valIdr) : num * usdRate;
      return `Rp ${Math.round(idrNom).toLocaleString("id-ID")}`;
    }
    return `Rp ${Number(num).toLocaleString("id-ID", {
      minimumFractionDigits: Math.abs(num) < 10 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const pe = f.peRatio !== null && f.peRatio !== undefined ? Number(f.peRatio) : null;
  const pbv = f.pbvRatio !== null && f.pbvRatio !== undefined ? Number(f.pbvRatio) : null;
  const roe = f.roe !== null && f.roe !== undefined ? Number(f.roe) : null;
  const roa = f.roa !== null && f.roa !== undefined ? Number(f.roa) : null;
  const npmNum =
    f.netProfitMargin !== null && f.netProfitMargin !== undefined ? Number(f.netProfitMargin) : null;
  const netIncomeNum = f.netIncome !== null && f.netIncome !== undefined ? Number(f.netIncome) : null;
  const der = f.der !== null && f.der !== undefined ? Number(f.der) : null;
  const revGrowth =
    f.revenueGrowth !== null && f.revenueGrowth !== undefined ? Number(f.revenueGrowth) : null;
  const netGrowth =
    f.netIncomeGrowth !== null && f.netIncomeGrowth !== undefined ? Number(f.netIncomeGrowth) : null;

  const getSignClass = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "text-zinc-400 dark:text-zinc-500";
    if (val > 0) return "text-emerald-600 dark:text-[#26a69a]";
    if (val < 0) return "text-rose-600 dark:text-[#ef5350]";
    return "text-zinc-900 dark:text-white";
  };

  const PILLAR_CARDS = [
    {
      id: "valuation",
      eyebrow: "1. Valuasi Harga",
      headlineLabel: "PER (Harga dibanding Laba)",
      headlineValue: formatNum(pe, "x"),
      headlineClass:
        pe !== null && pe < 0 ? "text-rose-600 dark:text-[#ef5350]" : "text-zinc-900 dark:text-white",
      rows: [
        {
          label: "PBV (Harga / Modal)",
          value: formatNum(pbv, "x"),
          valueClass: "text-zinc-900 dark:text-white",
        },
        {
          label: "Nilai Pasar (Market Cap)",
          value: formatRupiahShort(f.marketCap),
          valueClass: "text-zinc-900 dark:text-white",
        },
        {
          label: "Bagi Hasil (Div. Yield)",
          value: Number(f.dividendYield || 0) > 0 ? formatNum(f.dividendYield, "%") : "-",
          valueClass:
            Number(f.dividendYield || 0) > 0
              ? "text-zinc-900 dark:text-white"
              : "text-zinc-400 dark:text-zinc-500",
        },
      ],
    },
    {
      id: "profitability",
      eyebrow: "2. Profitabilitas",
      headlineLabel: "ROE (Laba dari Modal Sendiri)",
      headlineValue: formatNum(roe, "%"),
      headlineClass: getSignClass(roe),
      rows: [
        {
          label: "ROA (Laba dari Aset)",
          value: formatNum(roa, "%"),
          valueClass: getSignClass(roa),
        },
        {
          label: "Marjin Laba (NPM)",
          value: formatNum(npmNum, "%"),
          valueClass:
            npmNum === null
              ? "text-zinc-400 dark:text-zinc-500"
              : npmNum < 0
              ? "text-rose-600 dark:text-[#ef5350]"
              : "text-zinc-900 dark:text-white",
        },
        {
          label: "Laba Bersih Tahunan",
          value: formatFinancialMetric(f.netIncome, f.netIncomeIdr),
          valueClass:
            netIncomeNum !== null && netIncomeNum < 0
              ? "text-rose-600 dark:text-[#ef5350]"
              : "text-zinc-900 dark:text-white",
        },
      ],
    },
    {
      id: "solvency",
      eyebrow: "3. Modal & Utang",
      headlineLabel: "DER (Utang dibanding Modal)",
      headlineValue: formatNum(der, "x"),
      headlineClass: "text-zinc-900 dark:text-white",
      rows: [
        {
          label: "Modal Bersih (Ekuitas)",
          value: formatFinancialMetric(f.totalEquity, f.totalEquityIdr),
          valueClass: "text-zinc-900 dark:text-white",
        },
        {
          label: "Total Utang (Liabilitas)",
          value: formatFinancialMetric(f.totalLiabilities, f.totalLiabilitiesIdr),
          valueClass: "text-zinc-900 dark:text-white",
        },
        {
          label: "Uang Kas Tersedia",
          value: formatFinancialMetric(f.cashEquivalents, f.cashEquivalentsIdr),
          valueClass: "text-zinc-900 dark:text-white",
        },
      ],
    },
    {
      id: "growth",
      eyebrow: "4. Pertumbuhan",
      headlineLabel: "Pertumbuhan Penjualan (YoY)",
      headlineValue:
        revGrowth !== null
          ? `${revGrowth > 0 ? "+" : ""}${formatNum(revGrowth, "%")}`
          : "-",
      headlineClass: getSignClass(revGrowth),
      rows: [
        {
          label: "Pertumbuhan Laba (YoY)",
          value:
            netGrowth !== null
              ? `${netGrowth > 0 ? "+" : ""}${formatNum(netGrowth, "%")}`
              : "-",
          valueClass: getSignClass(netGrowth),
        },
        {
          label: "Laba / Lembar (EPS)",
          value: formatEpsMetric(f.eps, f.epsIdr),
          valueClass:
            f.eps !== null && f.eps !== undefined && Number(f.eps) < 0
              ? "text-rose-600 dark:text-[#ef5350]"
              : "text-zinc-900 dark:text-white",
        },
        {
          label: "Total Penjualan",
          value: formatFinancialMetric(f.revenue, f.revenueIdr),
          valueClass: "text-zinc-900 dark:text-white",
        },
      ],
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Header Bagian 4 Pilar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-zinc-200 dark:border-white/[0.08]">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            4 Pilar Fundamental
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Empat kelompok angka utama untuk melihat harga saham, kemampuan cetak laba, beban utang, dan laju bisnis.
          </p>
        </div>
        {isForeignCurrency && (
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08] w-fit">
            Kurs USD ke IDR: Rp {Math.round(usdRate).toLocaleString("id-ID")}
          </span>
        )}
      </div>

      {/* Grid 4 Kartu KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {PILLAR_CARDS.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] p-4 sm:p-5 flex flex-col justify-between gap-4 transition-colors duration-200 hover:border-zinc-300 dark:hover:border-white/[0.16]"
          >
            <div className="space-y-3">
              {/* Judul Pilar */}
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {card.eyebrow}
              </div>

              {/* Angka Jangkar Utama */}
              <div className="pb-3 border-b border-zinc-100 dark:border-white/[0.06]">
                <div
                  className={cn(
                    "text-2xl font-extrabold font-mono tracking-tight tabular-nums leading-none",
                    card.headlineClass
                  )}
                >
                  {card.headlineValue}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                  {card.headlineLabel}
                </div>
              </div>
            </div>

            {/* 3 Metrik Pendukung */}
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.05] text-xs">
              {card.rows.map((row) => (
                <div
                  key={row.label}
                  className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2"
                >
                  <span className="text-zinc-500 dark:text-zinc-400">{row.label}</span>
                  <span
                    className={cn(
                      "font-mono font-bold tabular-nums truncate text-right",
                      row.valueClass
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
