import React from "react";

/**
 * Ringkasan Laporan Keuangan Emiten (Laba Rugi & Neraca Konsolidasian)
 * Menampilkan data faktual: Revenue, Net Income, Total Aset, Ekuitas, Liabilitas, Kas, EPS.
 * Bersih tanpa dekorasi icon berlebihan dan tanpa box shadow.
 */
export default function FinancialStatementsTable({ fundamentals, stock, quote }) {
  const f = fundamentals || {};

  const formatRupiahExact = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    if (Math.abs(num) >= 1e12) {
      return `Rp ${(num / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Triliun`;
    }
    if (Math.abs(num) >= 1e9) {
      return `Rp ${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Miliar`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const formatPct = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const n = Number(val);
    const prefix = n > 0 ? "+" : "";
    return `${prefix}${n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
  };

  const isPositive = (val) => Number(val || 0) >= 0;

  return (
    <div className="space-y-4">
      {/* Header Bagian Laporan Keuangan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ringkasan Laporan Keuangan Konsolidasian
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Snapshot kinerja keuangan faktual emiten {stock?.companyName || quote?.symbol} ({quote?.symbol}) berdasarkan pelaporan BEI.
          </p>
        </div>
        <div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#062c19] text-[#2fe695] border border-[#0e4429]">
            {f.financialPeriod || "FY2024 Audit (Konsolidasian)"}
          </span>
        </div>
      </div>

      {/* Grid 2 Tabel Utama: Laba Rugi & Neraca */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ========================================================
            TABEL 1: LAPORAN LABA RUGI (INCOME STATEMENT)
            ======================================================== */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Laporan Laba Rugi (Income Statement)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Satuan: IDR</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {/* Baris Pendapatan */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Pendapatan Usaha (Revenue)
                </span>
                <span className="text-[11px] text-slate-400">Total penerimaan dari operasional bisnis utama</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block">
                  {formatRupiahExact(f.revenue)}
                </span>
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    isPositive(f.revenueGrowth) ? "text-[#2fe695]" : "text-[#f87171]"
                  }`}
                >
                  {formatPct(f.revenueGrowth)} YoY
                </span>
              </div>
            </div>

            {/* Baris Laba Bersih */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Laba Bersih Tahun Berjalan (Net Income)
                </span>
                <span className="text-[11px] text-slate-400">Laba final diatribusikan ke pemilik entitas induk</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-[#2fe695] block">
                  {formatRupiahExact(f.netIncome)}
                </span>
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    isPositive(f.netIncomeGrowth) ? "text-[#2fe695]" : "text-[#f87171]"
                  }`}
                >
                  {formatPct(f.netIncomeGrowth)} YoY
                </span>
              </div>
            </div>

            {/* Baris Net Margin */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Marjin Laba Bersih (Net Profit Margin)
                </span>
                <span className="text-[11px] text-slate-400">Rasio laba bersih terhadap omset penjualan</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block">
                  {f.netProfitMargin !== null && f.netProfitMargin !== undefined
                    ? `${Number(f.netProfitMargin).toFixed(2).replace(".", ",")}%`
                    : "-"}
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  {Number(f.netProfitMargin) >= 20 ? "Margin Sangat Tebal" : "Margin Standar"}
                </span>
              </div>
            </div>

            {/* Baris EPS */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Laba per Lembar Saham (EPS)
                </span>
                <span className="text-[11px] text-slate-400">Laba bersih per lembar saham yang beredar</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block">
                  Rp {f.eps !== null && f.eps !== undefined ? Number(f.eps).toLocaleString("id-ID") : "-"}
                </span>
                <span className="text-[11px] text-slate-400 font-sans">Per Lembar Saham</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            TABEL 2: NERACA KEUANGAN (BALANCE SHEET)
            ======================================================== */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Neraca Keuangan (Balance Sheet)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Posisi Keuangan</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {/* Baris Total Aset */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Total Aset (Total Assets)
                </span>
                <span className="text-[11px] text-slate-400">Total kekayaan aset lancar dan aset tidak lancar</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block">
                  {formatRupiahExact(f.totalAssets)}
                </span>
                <span className="text-[11px] text-slate-400 font-sans">Aset Produktif</span>
              </div>
            </div>

            {/* Baris Total Ekuitas */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Total Ekuitas (Total Equity)
                </span>
                <span className="text-[11px] text-slate-400">Modal bersih pemegang saham dan saldo laba</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block">
                  {formatRupiahExact(f.totalEquity)}
                </span>
                <span className="text-[11px] text-slate-400 font-sans">Nilai Buku Modal</span>
              </div>
            </div>

            {/* Baris Total Liabilitas */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Total Liabilitas (Total Liabilities)
                </span>
                <span className="text-[11px] text-slate-400">Kewajiban jangka pendek dan jangka panjang</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block">
                  {formatRupiahExact(f.totalLiabilities)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono font-semibold">
                  DER: {f.der !== null && f.der !== undefined ? `${Number(f.der).toFixed(2)}x` : "-"}
                </span>
              </div>
            </div>

            {/* Baris Kas & Setara Kas */}
            <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Kas & Setara Kas (Cash & Equivalents)
                </span>
                <span className="text-[11px] text-slate-400">Cadangan likuiditas kas siap pakai</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block">
                  {formatRupiahExact(f.cashEquivalents)}
                </span>
                <span className="text-[11px] text-slate-400 font-sans">Cadangan Kas Lancar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
