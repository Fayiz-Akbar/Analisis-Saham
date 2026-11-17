import React from "react";

/**
 * 4 Pilar Analisis Fundamental Finansial Sesuai Bab Skripsi [7] & PRD
 * - Pilar 1 • Valuasi Pasar (PER, PBV, Market Cap, Dividend Yield)
 * - Pilar 2 • Profitabilitas & Efisiensi Operasional (ROE, ROA, Net Profit Margin, Laba Bersih)
 * - Pilar 3 • Solvabilitas & Modal (DER, Liabilitas, Ekuitas, Kas)
 * - Pilar 4 • Pertumbuhan / Growth (Pertumbuhan Omset YoY, Pertumbuhan Laba YoY, EPS, Pendapatan)
 *
 * Mengadopsi desain 4 Kartu Horisontal Sleek Key-Value pairs (Label Kiri, Nilai Kanan)
 * persis seperti referensi visual pengguna (Yahoo Finance / TradingView style).
 * Sesuai aturan: Tanpa buletan status dekoratif, flat border minimalis.
 */
export default function FundamentalPillars({ fundamentals, stock, quote }) {
  const f = fundamentals || {};
  const isBank =
    (stock?.sector || "").toLowerCase().includes("financial") ||
    (stock?.industry || "").toLowerCase().includes("bank");

  // Helper pemformat desimal dan mata uang
  const formatNum = (val, suffix = "") => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    return `${Number(val).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}${suffix}`;
  };

  const formatRupiahAbbr = (val) => {
    if (!val || isNaN(val)) return "-";
    const num = Number(val);
    if (Math.abs(num) >= 1e12) {
      return `Rp ${(num / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Triliun`;
    }
    if (Math.abs(num) >= 1e9) {
      return `Rp ${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Miliar`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const formatRupiahShort = (val) => {
    if (!val || isNaN(val)) return "-";
    const num = Number(val);
    if (Math.abs(num) >= 1e12) {
      return `Rp ${(num / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T`;
    }
    if (Math.abs(num) >= 1e9) {
      return `Rp ${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const isForeignCurrency = f?.financialCurrency === "USD";
  const usdRate = Number(f?.usdToIdrRate || 16200);

  const formatFinancialMetric = (val, valIdr) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    if (isForeignCurrency) {
      const absVal = Math.abs(num);
      let usdStr = "";
      if (absVal >= 1e9) {
        usdStr = `$ ${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} B`;
      } else if (absVal >= 1e6) {
        usdStr = `$ ${(num / 1e6).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} M`;
      } else {
        usdStr = `$ ${num.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      const idrNom = valIdr !== undefined && valIdr !== null ? Number(valIdr) : num * usdRate;
      const absIdr = Math.abs(idrNom);
      let idrStr = "";
      if (absIdr >= 1e12) {
        idrStr = `Rp ${(idrNom / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} T`;
      } else if (absIdr >= 1e9) {
        idrStr = `Rp ${(idrNom / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} M`;
      } else {
        idrStr = `Rp ${Math.round(idrNom).toLocaleString("id-ID")}`;
      }

      return `${usdStr} (≈ ${idrStr})`;
    }

    return formatRupiahShort(num);
  };

  const formatEpsMetric = (val, valIdr) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    if (isForeignCurrency) {
      const idrNom = valIdr !== undefined && valIdr !== null ? Number(valIdr) : num * usdRate;
      return `$ ${num.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} (≈ Rp ${Math.round(idrNom).toLocaleString("id-ID")})`;
    }
    return `Rp ${Math.round(num).toLocaleString("id-ID")}`;
  };

  // 1. Evaluasi Valuasi
  const pe = f.peRatio !== null && f.peRatio !== undefined ? Number(f.peRatio) : null;
  let valuationStatus = "Valuasi Wajar";
  let valuationStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  if (pe !== null) {
    if (pe < 0) {
      valuationStatus = "Laba Negatif";
      valuationStyle = "bg-[#2a0e12] text-[#f87171] border-[#4c151c]";
    } else if (pe < 12) {
      valuationStatus = "Undervalued (Murah)";
      valuationStyle = "bg-[#062c19] text-[#2fe695] border-[#0e4429]";
    } else if (pe > 25) {
      valuationStatus = "Premi Valuasi Tinggi";
      valuationStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  }

  // 2. Evaluasi Profitabilitas
  const roe = f.roe !== null && f.roe !== undefined ? Number(f.roe) : null;
  let profitStatus = "Profitabilitas Stabil";
  let profitStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  if (roe !== null) {
    if (roe < 0) {
      profitStatus = "Imbal Hasil Negatif";
      profitStyle = "bg-[#2a0e12] text-[#f87171] border-[#4c151c]";
    } else if (roe >= 20) {
      profitStatus = "Sangat Prima (ROE ≥ 20%)";
      profitStyle = "bg-[#062c19] text-[#2fe695] border-[#0e4429]";
    } else if (roe < 10) {
      profitStatus = "Di Bawah Rata-Rata Sektor";
      profitStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  }

  // 3. Evaluasi Solvabilitas
  const der = f.der !== null && f.der !== undefined ? Number(f.der) : null;
  let solvencyStatus = "Beban Utang Terkendali";
  let solvencyStyle = "bg-[#062c19] text-[#2fe695] border-[#0e4429]";
  if (isBank) {
    solvencyStatus = "Leverage Wajar Perbankan";
    solvencyStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  } else if (der !== null) {
    if (der < 1.0) {
      solvencyStatus = "Struktur Modal Sehat (Utang Rendah)";
      solvencyStyle = "bg-[#062c19] text-[#2fe695] border-[#0e4429]";
    } else if (der > 2.5) {
      solvencyStatus = "Leverage Tinggi";
      solvencyStyle = "bg-[#2a0e12] text-[#f87171] border-[#4c151c]";
    }
  }

  // 4. Evaluasi Pertumbuhan
  const revGrowth = f.revenueGrowth !== null && f.revenueGrowth !== undefined ? Number(f.revenueGrowth) : null;
  const netGrowth = f.netIncomeGrowth !== null && f.netIncomeGrowth !== undefined ? Number(f.netIncomeGrowth) : null;
  let growthStatus = "Pertumbuhan Berkelanjutan";
  let growthStyle = "bg-[#062c19] text-[#2fe695] border-[#0e4429]";
  if (revGrowth !== null && netGrowth !== null) {
    if (revGrowth > 0 && netGrowth > 0) {
      growthStatus = "Ekspansi Bisnis Positif";
      growthStyle = "bg-[#062c19] text-[#2fe695] border-[#0e4429]";
    } else if (revGrowth < 0 && netGrowth < 0) {
      growthStatus = "Kinerja Tertekan";
      growthStyle = "bg-[#2a0e12] text-[#f87171] border-[#4c151c]";
    } else {
      growthStatus = "Pertumbuhan Campuran";
      growthStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Bagian 4 Pilar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            4 Pilar Analisis Fundamental Finansial
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kerangka evaluasi komprehensif kesehatan emiten berdasarkan Valuasi, Profitabilitas, Solvabilitas, dan Pertumbuhan [7].
          </p>
        </div>
        <div className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-fit">
          Basis: {f.financialPeriod || "Audit Resmi Terkini"}{isForeignCurrency ? " • Laporan Resmi USD" : ""}
        </div>
      </div>

      {/* Grid 4 Kartu Horisontal Sesuai Foto Referensi (Yahoo Finance / TradingView Key Stats Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        
        {/* ========================================================
            KARTU 1: PILAR 1 • VALUASI PASAR
            ======================================================== */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Pilar 1 • Valuasi Pasar
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${valuationStyle}`}>
                {valuationStatus}
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
              Harga Pasar vs Laba & Nilai Buku
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 line-clamp-2">
              Mengukur perbandingan harga pasar saham terhadap laba bersih (PER) dan nilai buku aset bersih (PBV).
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.05] text-xs pt-1">
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">PE Ratio (PER)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {formatNum(f.peRatio, "x")}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Price to Book (PBV)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {formatNum(f.pbvRatio, "x")}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Kapitalisasi Pasar</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate ml-2 text-right">
                {formatRupiahShort(f.marketCap)}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Dividend Yield</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-[#2fe695]">
                {formatNum(f.dividendYield, "%")}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            KARTU 2: PILAR 2 • PROFITABILITAS
            ======================================================== */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Pilar 2 • Profitabilitas
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${profitStyle}`}>
                {profitStatus}
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
              Efisiensi Pencetakan Laba Operasional
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 line-clamp-2">
              Menilai efektivitas manajemen mencetak laba bersih dari modal ekuitas (ROE), aset (ROA), dan margin omset (NPM).
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.05] text-xs pt-1">
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Return on Equity (ROE)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-[#2fe695]">
                {formatNum(f.roe, "%")}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Return on Assets (ROA)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {formatNum(f.roa, "%")}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Net Profit Margin</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {formatNum(f.netProfitMargin, "%")}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Laba Bersih Tahunan</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate ml-2 text-right">
                {formatFinancialMetric(f.netIncome, f.netIncomeIdr)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            KARTU 3: PILAR 3 • SOLVABILITAS & MODAL
            ======================================================== */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Pilar 3 • Solvabilitas & Modal
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${solvencyStyle}`}>
                {solvencyStatus}
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
              Ketahanan Finansial & Risiko Utang
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 line-clamp-2">
              Menakar risiko keuangan dan beban utang berbunga melalui rasio DER untuk memastikan struktur modal sehat.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.05] text-xs pt-1">
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Debt to Equity (DER)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {formatNum(f.der, "x")}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Liabilitas</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate ml-2 text-right">
                {formatFinancialMetric(f.totalLiabilities, f.totalLiabilitiesIdr)}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Ekuitas</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate ml-2 text-right">
                {formatFinancialMetric(f.totalEquity, f.totalEquityIdr)}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Kas & Setara Kas</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate ml-2 text-right">
                {formatFinancialMetric(f.cashEquivalents, f.cashEquivalentsIdr)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            KARTU 4: PILAR 4 • PERTUMBUHAN (GROWTH)
            ======================================================== */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between space-y-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Pilar 4 • Pertumbuhan (Growth)
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${growthStyle}`}>
                {growthStatus}
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
              Ekspansi Pendapatan, Laba, & EPS
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 line-clamp-2">
              Memantau kesinambungan pendapatan (Revenue), laba bersih, serta laba per saham (EPS) untuk stabilitas jangka panjang.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.05] text-xs pt-1">
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Pertumbuhan Omset</span>
              <span className={`font-mono font-bold ${Number(f.revenueGrowth || 0) >= 0 ? "text-emerald-600 dark:text-[#2fe695]" : "text-rose-600 dark:text-[#f87171]"}`}>
                {Number(f.revenueGrowth || 0) > 0 ? "+" : ""}{formatNum(f.revenueGrowth, "% YoY")}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Pertumbuhan Laba</span>
              <span className={`font-mono font-bold ${Number(f.netIncomeGrowth || 0) >= 0 ? "text-emerald-600 dark:text-[#2fe695]" : "text-rose-600 dark:text-[#f87171]"}`}>
                {Number(f.netIncomeGrowth || 0) > 0 ? "+" : ""}{formatNum(f.netIncomeGrowth, "% YoY")}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Laba per Saham (EPS)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate ml-2 text-right">
                {formatEpsMetric(f.eps, f.epsIdr)}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Pendapatan Tahunan</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate ml-2 text-right">
                {formatFinancialMetric(f.revenue, f.revenueIdr)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
