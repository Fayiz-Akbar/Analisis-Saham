import React from "react";

/**
 * Kamus Indikator Fundamental & Panduan Evaluasi
 * Format tabel rapi, bersih tanpa ikon berlebih, dan tanpa box shadow.
 */
export default function FundamentalGlossary({ fundamentals, symbol }) {
  const f = fundamentals || {};

  const formatRupiahAbbr = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    if (Math.abs(num) >= 1e12) {
      return `Rp ${(num / 1e12).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T`;
    }
    if (Math.abs(num) >= 1e9) {
      return `Rp ${(num / 1e9).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  };

  const GLOSSARY_ITEMS = [
    {
      indicator: "PE Ratio / PER",
      fullName: "Price to Earnings Ratio",
      utility: "Melihat valuasi berdasarkan laba",
      currentValue: f.peRatio !== null && f.peRatio !== undefined ? `${Number(f.peRatio).toFixed(1)}x` : "-",
      interpretation: "Membandingkan harga per lembar saham dengan laba per lembar (EPS). Menilai apakah harga saham saat ini murah atau mahal terhadap laba.",
      category: "Valuasi",
    },
    {
      indicator: "PB Ratio / PBV",
      fullName: "Price to Book Value",
      utility: "Membandingkan harga dengan nilai buku",
      currentValue: f.pbvRatio !== null && f.pbvRatio !== undefined ? `${Number(f.pbvRatio).toFixed(1)}x` : "-",
      interpretation: "Membandingkan harga pasar saham dengan nilai ekuitas bersih per saham. PBV < 1x mengindikasikan harga saham di bawah nilai bukunya.",
      category: "Valuasi",
    },
    {
      indicator: "ROE",
      fullName: "Return on Equity",
      utility: "Melihat imbal hasil terhadap ekuitas",
      currentValue: f.roe !== null && f.roe !== undefined ? `${Number(f.roe).toFixed(1)}%` : "-",
      interpretation: "Mengukur kemampuan manajemen mencetak laba bersih dari setiap rupiah modal yang disetor pemegang saham. ROE > 15% mencerminkan efisiensi tinggi.",
      category: "Profitabilitas",
    },
    {
      indicator: "ROA",
      fullName: "Return on Assets",
      utility: "Melihat imbal hasil terhadap aset",
      currentValue: f.roa !== null && f.roa !== undefined ? `${Number(f.roa).toFixed(1)}%` : "-",
      interpretation: "Menilai seberapa efektif seluruh aset perusahaan (kombinasi modal dan utang) dikelola untuk menghasilkan laba bersih tahunan.",
      category: "Profitabilitas",
    },
    {
      indicator: "Net Margin",
      fullName: "Net Profit Margin (NPM)",
      utility: "Melihat persentase laba bersih dari pendapatan",
      currentValue: f.netProfitMargin !== null && f.netProfitMargin !== undefined ? `${Number(f.netProfitMargin).toFixed(1)}%` : "-",
      interpretation: "Menunjukkan persentase pendapatan yang berhasil dikonversi menjadi laba murni setelah memotong seluruh beban usaha, pajak, dan bunga.",
      category: "Profitabilitas",
    },
    {
      indicator: "Debt-to-Equity",
      fullName: "Debt to Equity Ratio (DER)",
      utility: "Melihat perbandingan utang dan ekuitas",
      currentValue: f.der !== null && f.der !== undefined ? `${Number(f.der).toFixed(2)}x` : "-",
      interpretation: "Mengukur tingkat solvabilitas dan risiko leverage. DER < 1,0x menunjukkan perusahaan didanai lebih banyak oleh modal sendiri daripada utang.",
      category: "Solvabilitas",
    },
    {
      indicator: "Revenue",
      fullName: "Pendapatan Usaha (Omset)",
      utility: "Pendapatan perusahaan",
      currentValue: formatRupiahAbbr(f.revenue),
      interpretation: "Arus total penerimaan bruto yang diperoleh dari operasional penjualan barang atau jasa utama emiten sepanjang periode laporan.",
      category: "Kinerja Absolut",
    },
    {
      indicator: "Net Income",
      fullName: "Laba Bersih Tahun Berjalan",
      utility: "Laba bersih perusahaan",
      currentValue: formatRupiahAbbr(f.netIncome),
      interpretation: "Hasil keuntungan bersih riil perusahaan setelah dikurangi seluruh beban pokok penjualan, biaya operasional, pajak penghasilan, dan bunga.",
      category: "Kinerja Absolut",
    },
    {
      indicator: "EPS",
      fullName: "Earnings Per Share",
      utility: "Laba per lembar saham",
      currentValue: f.eps !== null && f.eps !== undefined ? `Rp ${Number(f.eps).toLocaleString("id-ID")}` : "-",
      interpretation: "Porsi laba bersih yang dialokasikan untuk setiap satu lembar saham beredar. Merupakan dasar utama perhitungan dividen dan PER.",
      category: "Kinerja Absolut",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Kamus */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Kamus Indikator Fundamental & Panduan Evaluasi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tabel panduan indikator fundamental finansial emiten beserta kegunaan dan nilai riil untuk saham {symbol}.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-sans">
          Panduan Analisis Finansial Terakreditasi IDX
        </div>
      </div>

      {/* Tabel Kamus */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-bold">Indikator</th>
                <th className="px-4 py-3 font-bold">Kegunaan Utama</th>
                <th className="px-4 py-3 font-bold text-right">Nilai {symbol}</th>
                <th className="px-4 py-3 font-bold hidden md:table-cell">Interpretasi Finansial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {GLOSSARY_ITEMS.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Indikator */}
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {item.indicator}
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      {item.fullName}
                    </div>
                  </td>

                  {/* Kegunaan */}
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.utility}
                    </span>
                    <span className="inline-block mt-1 ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                      {item.category}
                    </span>
                  </td>

                  {/* Nilai Terkini Emiten */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                      {item.currentValue}
                    </span>
                  </td>

                  {/* Interpretasi */}
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-md leading-relaxed">
                    {item.interpretation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
