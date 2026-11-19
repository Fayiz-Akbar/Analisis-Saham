import React from "react";

/**
 * 4 Pilar Fundamental Saham
 * Desain bersih, to-the-point, dan ramah pengguna:
 * - Header kartu langsung menampilkan nama pilar & status evaluasi
 * - 4 baris metrik utama dengan angka monospace rata kanan (tabular-nums)
 * - 1 kalimat kesimpulan kontekstual di bagian bawah setiap kartu
 */
export default function FundamentalPillars({ fundamentals, stock }) {
  const f = fundamentals || {};
  const isBank =
    (stock?.sector || "").toLowerCase().includes("financial") ||
    (stock?.industry || "").toLowerCase().includes("bank");

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

  const positiveBadge =
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#062c19] dark:text-[#2fe695] dark:border-[#0e4429]";
  const negativeBadge =
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#2a0e12] dark:text-[#f87171] dark:border-[#4c151c]";
  const neutralBadge =
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:border-white/[0.1]";

  // 1. Evaluasi Valuasi
  const pe = f.peRatio !== null && f.peRatio !== undefined ? Number(f.peRatio) : null;
  const pbv = f.pbvRatio !== null && f.pbvRatio !== undefined ? Number(f.pbvRatio) : null;
  let valuationStatus = "Valuasi Wajar";
  let valuationStyle = neutralBadge;
  if (pe !== null) {
    if (pe < 0) {
      valuationStatus = "Masih Rugi";
      valuationStyle = negativeBadge;
    } else if (pe < 12) {
      valuationStatus = "Relatif Murah";
      valuationStyle = positiveBadge;
    } else if (pe > 25) {
      valuationStatus = "Harga Premium";
      valuationStyle = neutralBadge;
    }
  }

  let valuationTakeaway = "Data rasio valuasi pasar belum lengkap untuk periode ini.";
  if (pe !== null && pe < 0) {
    valuationTakeaway =
      "PER negatif karena perusahaan masih mencatat rugi bersih. Fokuskan evaluasi pada nilai buku (PBV) dan perbaikan arus kas.";
  } else if (pe !== null && pbv !== null) {
    valuationTakeaway = `Saham diperdagangkan pada ${formatNum(pe, "x")} laba tahunan dan ${formatNum(
      pbv,
      "x"
    )} dari nilai modal bersihnya.`;
  } else if (pbv !== null) {
    valuationTakeaway = `Harga pasar berada di level ${formatNum(pbv, "x")} terhadap nilai buku ekuitas per saham.`;
  }

  // 2. Evaluasi Profitabilitas
  const roe = f.roe !== null && f.roe !== undefined ? Number(f.roe) : null;
  const roa = f.roa !== null && f.roa !== undefined ? Number(f.roa) : null;
  const npmNum =
    f.netProfitMargin !== null && f.netProfitMargin !== undefined ? Number(f.netProfitMargin) : null;
  const netIncomeNum = f.netIncome !== null && f.netIncome !== undefined ? Number(f.netIncome) : null;

  let profitStatus = "Laba Stabil";
  let profitStyle = neutralBadge;
  if (roe !== null) {
    if (roe < 0) {
      profitStatus = "Merugi";
      profitStyle = negativeBadge;
    } else if (roe >= 15) {
      profitStatus = "Sangat Efisien";
      profitStyle = positiveBadge;
    } else if (roe < 8) {
      profitStatus = "Marjin Tipis";
      profitStyle = neutralBadge;
    }
  }

  let profitTakeaway = "Mengukur kemampuan perusahaan menghasilkan laba dari modal dan omset.";
  if (roe !== null && npmNum !== null) {
    if (roe < 0 || npmNum < 0) {
      profitTakeaway = `Imbal hasil modal (${formatNum(
        roe,
        "%"
      )}) masih tertekan beban usaha; pantau pemangkasan rugi di kuartal terbaru.`;
    } else {
      profitTakeaway = `Setiap Rp 100 omset menghasilkan Rp ${formatNum(
        npmNum
      )} laba bersih, dengan pengembalian modal (ROE) ${formatNum(roe, "%")}.`;
    }
  }

  // 3. Evaluasi Solvabilitas
  const der = f.der !== null && f.der !== undefined ? Number(f.der) : null;
  let solvencyStatus = "Utang Aman";
  let solvencyStyle = positiveBadge;
  if (isBank) {
    solvencyStatus = "Struktur Bank";
    solvencyStyle = neutralBadge;
  } else if (der !== null) {
    if (der < 1.0) {
      solvencyStatus = "Modal Kuat";
      solvencyStyle = positiveBadge;
    } else if (der > 2.0) {
      solvencyStatus = "Utang Tinggi";
      solvencyStyle = negativeBadge;
    } else {
      solvencyStatus = "Utang Terkendali";
      solvencyStyle = neutralBadge;
    }
  }

  let solvencyTakeaway = "Perbandingan beban kewajiban terhadap modal bersih dan cadangan kas.";
  if (isBank) {
    solvencyTakeaway =
      "Pada sektor perbankan, liabilitas didominasi dana pihak ketiga (tabungan & deposito nasabah) untuk disalurkan menjadi kredit.";
  } else if (der !== null) {
    solvencyTakeaway =
      der <= 1.0
        ? `Modal bersih lebih besar dibanding total kewajiban (DER ${formatNum(
            der,
            "x"
          )}), risiko gagal bayar rendah.`
        : `Total kewajiban tercatat ${formatNum(
            der,
            "x"
          )} dari modal bersih; perhatikan kecukupan kas terhadap beban bunga.`;
  }

  // 4. Evaluasi Pertumbuhan
  const revGrowth =
    f.revenueGrowth !== null && f.revenueGrowth !== undefined ? Number(f.revenueGrowth) : null;
  const netGrowth =
    f.netIncomeGrowth !== null && f.netIncomeGrowth !== undefined ? Number(f.netIncomeGrowth) : null;
  let growthStatus = "Stabil";
  let growthStyle = neutralBadge;
  if (revGrowth !== null && netGrowth !== null) {
    if (revGrowth > 0 && netGrowth > 0) {
      growthStatus = "Tumbuh Positif";
      growthStyle = positiveBadge;
    } else if (revGrowth < 0 && netGrowth < 0) {
      growthStatus = "Melambat";
      growthStyle = negativeBadge;
    } else {
      growthStatus = "Bervariasi";
      growthStyle = neutralBadge;
    }
  }

  let growthTakeaway = "Laju perubahan pendapatan dan laba bersih dibandingkan tahun sebelumnya.";
  if (revGrowth !== null && netGrowth !== null) {
    const revDir = revGrowth >= 0 ? `naik +${formatNum(revGrowth, "%")}` : `turun ${formatNum(revGrowth, "%")}`;
    const netDir = netGrowth >= 0 ? `tumbuh +${formatNum(netGrowth, "%")}` : `terkoreksi ${formatNum(netGrowth, "%")}`;
    growthTakeaway = `Pendapatan tahunan ${revDir} YoY, sedangkan laba bersih ${netDir} YoY.`;
  }

  return (
    <div className="space-y-3.5">
      {/* Header Bagian 4 Pilar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            4 Pilar Fundamental
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ringkasan valuasi harga, kemampuan cetak laba, struktur utang, dan pertumbuhan tahunan.
          </p>
        </div>
        {isForeignCurrency && (
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] w-fit">
            Pelaporan USD dikonversi ke IDR (1 USD ≈ Rp {Math.round(usdRate).toLocaleString("id-ID")})
          </span>
        )}
      </div>

      {/* Grid 4 Kartu Horisontal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* PILAR 1: VALUASI HARGA */}
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-white/[0.06]">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                1. Valuasi Harga
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${valuationStyle}`}>
                {valuationStatus}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">PER (Harga / Laba)</span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatNum(f.peRatio, "x")}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">PBV (Harga / Modal)</span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatNum(f.pbvRatio, "x")}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Kapitalisasi Pasar</span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 truncate text-right">
                  {formatRupiahShort(f.marketCap)}
                </span>
              </div>
              <div className="pt-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Dividend Yield</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    Number(f.dividendYield || 0) > 0
                      ? "text-emerald-600 dark:text-[#2fe695]"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {Number(f.dividendYield || 0) > 0 ? formatNum(f.dividendYield, "%") : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05] text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {valuationTakeaway}
          </div>
        </div>

        {/* PILAR 2: PROFITABILITAS */}
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-white/[0.06]">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                2. Profitabilitas
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${profitStyle}`}>
                {profitStatus}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">ROE (Imbal Modal)</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    roe === null
                      ? "text-slate-400"
                      : roe >= 0
                      ? "text-emerald-600 dark:text-[#2fe695]"
                      : "text-rose-600 dark:text-[#f87171]"
                  }`}
                >
                  {formatNum(roe, "%")}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">ROA (Imbal Aset)</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    roa === null
                      ? "text-slate-400"
                      : roa >= 0
                      ? "text-emerald-600 dark:text-[#2fe695]"
                      : "text-rose-600 dark:text-[#f87171]"
                  }`}
                >
                  {formatNum(roa, "%")}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Marjin Bersih (NPM)</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    npmNum === null
                      ? "text-slate-400"
                      : npmNum >= 0
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-rose-600 dark:text-[#f87171]"
                  }`}
                >
                  {formatNum(npmNum, "%")}
                </span>
              </div>
              <div className="pt-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Laba Bersih</span>
                <span
                  className={`font-mono font-bold tabular-nums truncate text-right ${
                    netIncomeNum !== null && netIncomeNum < 0
                      ? "text-rose-600 dark:text-[#f87171]"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {formatFinancialMetric(f.netIncome, f.netIncomeIdr)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05] text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {profitTakeaway}
          </div>
        </div>

        {/* PILAR 3: KESEHATAN MODAL & UTANG */}
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-white/[0.06]">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                3. Modal & Utang
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${solvencyStyle}`}>
                {solvencyStatus}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">DER (Utang / Modal)</span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatNum(f.der, "x")}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Total Ekuitas</span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 truncate text-right">
                  {formatFinancialMetric(f.totalEquity, f.totalEquityIdr)}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Total Liabilitas</span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 truncate text-right">
                  {formatFinancialMetric(f.totalLiabilities, f.totalLiabilitiesIdr)}
                </span>
              </div>
              <div className="pt-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Kas & Setara Kas</span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 truncate text-right">
                  {formatFinancialMetric(f.cashEquivalents, f.cashEquivalentsIdr)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05] text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {solvencyTakeaway}
          </div>
        </div>

        {/* PILAR 4: PERTUMBUHAN KINERJA */}
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] flex flex-col justify-between overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-white/[0.06]">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                4. Pertumbuhan
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${growthStyle}`}>
                {growthStatus}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Pertumbuhan Omset</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    revGrowth === null
                      ? "text-slate-400"
                      : revGrowth >= 0
                      ? "text-emerald-600 dark:text-[#2fe695]"
                      : "text-rose-600 dark:text-[#f87171]"
                  }`}
                >
                  {revGrowth !== null && revGrowth > 0 ? "+" : ""}
                  {formatNum(revGrowth, "% YoY")}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Pertumbuhan Laba</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    netGrowth === null
                      ? "text-slate-400"
                      : netGrowth >= 0
                      ? "text-emerald-600 dark:text-[#2fe695]"
                      : "text-rose-600 dark:text-[#f87171]"
                  }`}
                >
                  {netGrowth !== null && netGrowth > 0 ? "+" : ""}
                  {formatNum(netGrowth, "% YoY")}
                </span>
              </div>
              <div className="py-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Laba / Saham (EPS)</span>
                <span
                  className={`font-mono font-bold tabular-nums truncate text-right ${
                    f.eps !== null && f.eps !== undefined && Number(f.eps) < 0
                      ? "text-rose-600 dark:text-[#f87171]"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {formatEpsMetric(f.eps, f.epsIdr)}
                </span>
              </div>
              <div className="pt-1.5 flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Pendapatan Usaha</span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 truncate text-right">
                  {formatFinancialMetric(f.revenue, f.revenueIdr)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05] text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {growthTakeaway}
          </div>
        </div>
      </div>
    </div>
  );
}
