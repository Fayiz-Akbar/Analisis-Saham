import React from "react";

/**
 * 4 Pilar Analisis Fundamental Finansial Sesuai Bab Skripsi [7] & PRD
 * - Valuasi Pasar (PER, PBV, Market Cap)
 * - Profitabilitas & Efisiensi Operasional (ROE, ROA, Net Margin)
 * - Solvabilitas & Struktur Modal (DER, Beban Utang)
 * - Pertumbuhan Berkelanjutan / Growth (Revenue Growth, Net Income Growth, EPS)
 * 
 * Standar Desain:
 * - Bersih, tipografi profesional, tanpa ikon dekoratif berlebihan
 * - Tanpa box shadow (flat border-based)
 * - Palet warna autentik: hitam-putih monokrom, hijau hutan (#062c19 / #2fe695), merah tua (#2a0e12 / #f87171)
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

  // 1. Evaluasi Valuasi
  const pe = f.peRatio !== null ? Number(f.peRatio) : null;
  let valuationStatus = "Valuasi Wajar";
  let valuationStyle = "bg-slate-800 text-slate-300 border-slate-700";
  if (pe !== null) {
    if (pe < 0) {
      valuationStatus = "Laba Negatif";
      valuationStyle = "bg-[#2a0e12] text-[#f87171] border-[#4c151c]";
    } else if (pe < 12) {
      valuationStatus = "Undervalued (Murah)";
      valuationStyle = "bg-[#062c19] text-[#2fe695] border-[#0e4429]";
    } else if (pe > 25) {
      valuationStatus = "Premi Valuasi Tinggi";
      valuationStyle = "bg-slate-800 text-slate-300 border-slate-700";
    }
  }

  // 2. Evaluasi Profitabilitas
  const roe = f.roe !== null ? Number(f.roe) : null;
  let profitStatus = "Profitabilitas Stabil";
  let profitStyle = "bg-slate-800 text-slate-300 border-slate-700";
  if (roe !== null) {
    if (roe < 0) {
      profitStatus = "Imbal Hasil Negatif";
      profitStyle = "bg-[#2a0e12] text-[#f87171] border-[#4c151c]";
    } else if (roe >= 20) {
      profitStatus = "Sangat Prima (ROE ≥ 20%)";
      profitStyle = "bg-[#062c19] text-[#2fe695] border-[#0e4429]";
    } else if (roe < 10) {
      profitStatus = "Di Bawah Rata-Rata Sektor";
      profitStyle = "bg-slate-800 text-slate-300 border-slate-700";
    }
  }

  // 3. Evaluasi Solvabilitas
  const der = f.der !== null ? Number(f.der) : null;
  let solvencyStatus = "Beban Utang Terkendali";
  let solvencyStyle = "bg-[#062c19] text-[#2fe695] border-[#0e4429]";
  if (isBank) {
    solvencyStatus = "Leverage Wajar Perbankan (Karakteristik DPK)";
    solvencyStyle = "bg-slate-800 text-slate-300 border-slate-700";
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
  const revGrowth = f.revenueGrowth !== null ? Number(f.revenueGrowth) : null;
  const netGrowth = f.netIncomeGrowth !== null ? Number(f.netIncomeGrowth) : null;
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
      growthStyle = "bg-slate-800 text-slate-300 border-slate-700";
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
          Basis: {f.financialPeriod || "Laporan Keuangan Tahunan IDX"}
        </div>
      </div>

      {/* Grid 4 Pilar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ========================================================
            PILAR 1: VALUASI PASAR
            ======================================================== */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                Pilar 1 • Valuasi Pasar
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Harga Pasar vs Laba & Nilai Buku
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${valuationStyle}`}>
              {valuationStatus}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Mengukur perbandingan harga pasar saham terhadap laba bersih (PER) dan nilai buku aset bersih (PBV) untuk menilai kewajaran harga saham di bursa.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">PE Ratio (PER)</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                {formatNum(f.peRatio, "x")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Price to Book (PBV)</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                {formatNum(f.pbvRatio, "x")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Kapitalisasi Pasar</span>
              <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 truncate block">
                {formatRupiahAbbr(f.marketCap)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            PILAR 2: PROFITABILITAS DAN EFISIENSI OPERASIONAL
            ======================================================== */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                Pilar 2 • Profitabilitas
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Efisiensi Pencetakan Laba Operasional
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${profitStyle}`}>
              {profitStatus}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Menilai efektivitas manajemen mencetak laba bersih dari modal pemegang saham (ROE), total aset (ROA), serta porsi sisa margin bersih dari pendapatan (NPM).
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Return on Equity (ROE)</span>
              <span className="font-mono font-bold text-sm text-[#2fe695]">
                {formatNum(f.roe, "%")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Return on Assets (ROA)</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                {formatNum(f.roa, "%")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Net Profit Margin</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                {formatNum(f.netProfitMargin, "%")}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            PILAR 3: SOLVABILITAS DAN STRUKTUR MODAL
            ======================================================== */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                Pilar 3 • Solvabilitas & Modal
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Ketahanan Finansial & Risiko Utang
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${solvencyStyle}`}>
              {solvencyStatus}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Menakar risiko keuangan dan beban utang berbunga melalui rasio Debt-to-Equity (DER) guna memastikan struktur permodalan emiten tetap sehat dan berisiko rendah.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Debt to Equity (DER)</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                {formatNum(f.der, "x")}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Total Liabilitas</span>
              <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 truncate block">
                {formatRupiahAbbr(f.totalLiabilities)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Total Ekuitas</span>
              <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 truncate block">
                {formatRupiahAbbr(f.totalEquity)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            PILAR 4: PERTUMBUHAN BERKELANJUTAN (GROWTH)
            ======================================================== */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                Pilar 4 • Pertumbuhan (Growth)
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Ekspansi Pendapatan, Laba, & EPS
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${growthStyle}`}>
              {growthStatus}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Memantau kesinambungan pendapatan (Revenue), laba bersih (Net Income), serta laba per lembar saham (EPS) untuk mengamati stabilitas dan daya tahan bisnis emiten.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Pertumbuhan Omset</span>
              <span
                className={`font-mono font-bold text-sm ${
                  Number(f.revenueGrowth) >= 0 ? "text-[#2fe695]" : "text-[#f87171]"
                }`}
              >
                {formatNum(f.revenueGrowth, "%")} YoY
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Pertumbuhan Laba</span>
              <span
                className={`font-mono font-bold text-sm ${
                  Number(f.netIncomeGrowth) >= 0 ? "text-[#2fe695]" : "text-[#f87171]"
                }`}
              >
                {formatNum(f.netIncomeGrowth, "%")} YoY
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Laba per Saham (EPS)</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                Rp {f.eps !== null && f.eps !== undefined ? Number(f.eps).toLocaleString("id-ID") : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
