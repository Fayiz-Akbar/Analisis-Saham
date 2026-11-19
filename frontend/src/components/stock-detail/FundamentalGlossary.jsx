import React from "react";

/**
 * Panduan Indikator Fundamental (Ramah Pemula)
 * Menampilkan nilai aktual emiten dan penjelasan sederhana dengan contoh nyata,
 * bebas jargon ambigu dan tanpa penilaian if-else otomatis.
 */
export default function FundamentalGlossary({ fundamentals, symbol }) {
  const f = fundamentals || {};

  const formatNum = (val, suffix = "") => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    return `${Number(val).toLocaleString("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })}${suffix}`;
  };

  const formatEps = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "-";
    const num = Number(val);
    return `Rp ${num.toLocaleString("id-ID", {
      minimumFractionDigits: Math.abs(num) < 10 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const pe = f.peRatio !== null && f.peRatio !== undefined ? Number(f.peRatio) : null;
  const pbv = f.pbvRatio !== null && f.pbvRatio !== undefined ? Number(f.pbvRatio) : null;
  const roe = f.roe !== null && f.roe !== undefined ? Number(f.roe) : null;
  const roa = f.roa !== null && f.roa !== undefined ? Number(f.roa) : null;
  const npm =
    f.netProfitMargin !== null && f.netProfitMargin !== undefined ? Number(f.netProfitMargin) : null;
  const der = f.der !== null && f.der !== undefined ? Number(f.der) : null;
  const eps = f.eps !== null && f.eps !== undefined ? Number(f.eps) : null;
  const dy =
    f.dividendYield !== null && f.dividendYield !== undefined ? Number(f.dividendYield) : null;

  const GLOSSARY_ITEMS = [
    {
      code: "PER",
      name: "Harga dibanding Laba (Price to Earnings)",
      currentValue: formatNum(pe, "x"),
      guide:
        "Mengukur berapa kali lipat harga saham dibanding keuntungan bersih per lembar dalam setahun. Contoh: PER 10x artinya butuh sekitar 10 tahun laba untuk menutup harga beli saham.",
    },
    {
      code: "PBV",
      name: "Harga dibanding Modal Bersih (Price to Book Value)",
      currentValue: formatNum(pbv, "x"),
      guide:
        "Membandingkan harga saham dengan nilai modal bersih perusahaan (total harta dikurangi utang). PBV 1x artinya harga saham sama persis dengan nilai modal bersihnya.",
    },
    {
      code: "ROE",
      name: "Keuntungan dari Modal Sendiri (Return on Equity)",
      currentValue: formatNum(roe, "%"),
      guide:
        "Persentase laba bersih yang berhasil dicetak dari modal pemilik saham. Contoh: ROE 15% artinya setiap Rp 100 modal mampu menghasilkan Rp 15 laba bersih dalam setahun.",
    },
    {
      code: "ROA",
      name: "Keuntungan dari Total Harta (Return on Assets)",
      currentValue: formatNum(roa, "%"),
      guide:
        "Persentase laba bersih yang dihasilkan dari seluruh harta (aset) yang dimiliki perusahaan, baik yang berasal dari modal sendiri maupun dari utang.",
    },
    {
      code: "NPM",
      name: "Sisa Laba dari Penjualan (Net Profit Margin)",
      currentValue: formatNum(npm, "%"),
      guide:
        "Persentase uang penjualan yang tersisa menjadi laba bersih setelah dipotong biaya operasional, bunga, dan pajak. Contoh: NPM 20% artinya dari Rp 100 penjualan, Rp 20 adalah laba bersih.",
    },
    {
      code: "DER",
      name: "Utang dibanding Modal (Debt to Equity)",
      currentValue: formatNum(der, "x"),
      guide:
        "Membandingkan total utang perusahaan dengan modal sendiri. DER 1x berarti jumlah utang sama besar dengan modal; di bawah 1x berarti modal lebih besar daripada utang.",
    },
    {
      code: "EPS",
      name: "Laba per 1 Lembar Saham (Earnings Per Share)",
      currentValue: formatEps(eps),
      guide:
        "Jumlah keuntungan bersih perusahaan yang menjadi jatah setiap 1 lembar saham. Semakin tinggi EPS, semakin besar laba yang dihasilkan untuk setiap lembar saham yang Anda pegang.",
    },
    {
      code: "Yield",
      name: "Persentase Bagi Hasil Tunai (Dividend Yield)",
      currentValue: dy && dy > 0 ? formatNum(dy, "%") : "-",
      guide:
        "Persentase dividen tunai yang dibagikan dalam setahun dibanding harga saham sekarang. Contoh: Yield 5% artinya dari pembelian saham Rp 1 juta, potensi dividen tunainya Rp 50 ribu per tahun.",
    },
    {
      code: "TTM",
      name: "Akumulasi 12 Bulan Terakhir (Trailing Twelve Months)",
      currentValue: "4 Kuartal",
      guide:
        "Gabungan laporan keuangan dari 4 kuartal (12 bulan) paling baru. Dipakai agar investor bisa melihat kinerja paling update tanpa harus menunggu laporan tahunan tutup buku.",
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-zinc-200 dark:border-white/[0.08]">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Panduan Istilah & Indikator ({symbol})
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Penjelasan sederhana tiap istilah keuangan agar mudah dipahami sebelum membaca laporan {symbol}.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/[0.08] text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-bold min-w-[210px]">Istilah</th>
                <th className="px-4 py-3 font-bold text-right min-w-[110px]">Nilai {symbol}</th>
                <th className="px-4 py-3 font-bold">Arti Sederhana & Contoh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
              {GLOSSARY_ITEMS.map((item) => (
                <tr
                  key={item.code}
                  className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                      {item.code}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {item.name}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap align-top">
                    <span className="font-mono font-bold tabular-nums text-xs sm:text-sm text-zinc-900 dark:text-white">
                      {item.currentValue}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 leading-relaxed align-top max-w-2xl">
                    {item.guide}
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
