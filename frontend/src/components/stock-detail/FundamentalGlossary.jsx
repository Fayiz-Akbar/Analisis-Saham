import React from "react";

/**
 * Panduan Indikator Fundamental
 * Menyajikan nilai aktual emiten, status evaluasi langsung, dan cara baca praktis 1 kalimat
 * tanpa penjelasan buku teks yang bertele-tele.
 */
export default function FundamentalGlossary({ fundamentals, symbol }) {
  const f = fundamentals || {};

  const positiveBadge =
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#062c19] dark:text-[#2fe695] dark:border-[#0e4429]";
  const negativeBadge =
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#2a0e12] dark:text-[#f87171] dark:border-[#4c151c]";
  const neutralBadge =
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:border-white/[0.1]";

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
      name: "Price to Earnings Ratio",
      currentValue: formatNum(pe, "x"),
      status:
        pe === null
          ? "Data -"
          : pe < 0
          ? "Rugi Bersih"
          : pe < 12
          ? "Murah"
          : pe <= 22
          ? "Wajar"
          : "Premium",
      badgeStyle:
        pe === null
          ? neutralBadge
          : pe < 0
          ? negativeBadge
          : pe < 12
          ? positiveBadge
          : neutralBadge,
      guide:
        "Berapa kali lipat harga saham dibanding laba tahunannya. Umumnya wajar di kisaran 10x sampai 20x.",
    },
    {
      code: "PBV",
      name: "Price to Book Value",
      currentValue: formatNum(pbv, "x"),
      status:
        pbv === null
          ? "Data -"
          : pbv < 1
          ? "Di Bawah Modal"
          : pbv <= 2.5
          ? "Wajar"
          : "Premium",
      badgeStyle:
        pbv === null ? neutralBadge : pbv < 1.2 ? positiveBadge : neutralBadge,
      guide:
        "Perbandingan harga saham terhadap modal bersih perusahaan. PBV di bawah 1x menandakan harga diskon terhadap nilai buku.",
    },
    {
      code: "ROE",
      name: "Return on Equity",
      currentValue: formatNum(roe, "%"),
      status:
        roe === null
          ? "Data -"
          : roe >= 15
          ? "Efisien"
          : roe > 0
          ? "Moderat"
          : "Negatif",
      badgeStyle:
        roe === null
          ? neutralBadge
          : roe >= 15
          ? positiveBadge
          : roe < 0
          ? negativeBadge
          : neutralBadge,
      guide:
        "Seberapa besar laba bersih yang dihasilkan dari modal pemegang saham. Standar emiten unggulan berada di atas 15%.",
    },
    {
      code: "ROA",
      name: "Return on Assets",
      currentValue: formatNum(roa, "%"),
      status:
        roa === null
          ? "Data -"
          : roa >= 5
          ? "Produktif"
          : roa > 0
          ? "Cukup"
          : "Negatif",
      badgeStyle:
        roa === null
          ? neutralBadge
          : roa >= 5
          ? positiveBadge
          : roa < 0
          ? negativeBadge
          : neutralBadge,
      guide:
        "Kemampuan seluruh aset perusahaan menghasilkan laba bersih. ROA di atas 5% tergolong produktif (atau di atas 2% untuk bank).",
    },
    {
      code: "NPM",
      name: "Net Profit Margin",
      currentValue: formatNum(npm, "%"),
      status:
        npm === null
          ? "Data -"
          : npm >= 15
          ? "Marjin Tebal"
          : npm > 0
          ? "Positif"
          : "Defisit",
      badgeStyle:
        npm === null
          ? neutralBadge
          : npm >= 15
          ? positiveBadge
          : npm < 0
          ? negativeBadge
          : neutralBadge,
      guide:
        "Porsi pendapatan usaha yang tersisa menjadi laba bersih setelah dikurangi semua biaya operasional, bunga, dan pajak.",
    },
    {
      code: "DER",
      name: "Debt to Equity Ratio",
      currentValue: formatNum(der, "x"),
      status:
        der === null
          ? "Data -"
          : der <= 1.0
          ? "Utang Rendah"
          : der <= 2.0
          ? "Terkendali"
          : "Leverage Tinggi",
      badgeStyle:
        der === null
          ? neutralBadge
          : der <= 1.0
          ? positiveBadge
          : der > 2.5
          ? negativeBadge
          : neutralBadge,
      guide:
        "Perbandingan total kewajiban terhadap modal sendiri. DER di bawah 1,0x berarti modal bersih lebih besar daripada total utang.",
    },
    {
      code: "EPS",
      name: "Earnings Per Share",
      currentValue: formatEps(eps),
      status:
        eps === null ? "Data -" : eps > 0 ? "Laba Positif" : "Rugi / Saham",
      badgeStyle:
        eps === null ? neutralBadge : eps > 0 ? positiveBadge : negativeBadge,
      guide:
        "Nominal laba bersih yang menjadi hak setiap 1 lembar saham beredar. EPS yang naik konsisten menjadi pendorong kenaikan harga saham.",
    },
    {
      code: "Yield",
      name: "Dividend Yield",
      currentValue: dy && dy > 0 ? formatNum(dy, "%") : "-",
      status:
        !dy || dy <= 0
          ? "Tanpa Dividen"
          : dy >= 4
          ? "Dividen Tinggi"
          : "Rutin Bagi",
      badgeStyle:
        !dy || dy <= 0 ? neutralBadge : dy >= 4 ? positiveBadge : neutralBadge,
      guide:
        "Persentase pembagian dividen tunai tahunan dibandingkan harga saham saat ini. Yield di atas 4% menarik bagi investor dividen.",
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Panduan Baca Indikator ({symbol})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arti praktis setiap rasio utama beserta patokan angka wajar untuk menilai saham {symbol}.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.08] text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-bold min-w-[170px]">Indikator</th>
                <th className="px-4 py-3 font-bold text-right min-w-[110px]">Nilai {symbol}</th>
                <th className="px-4 py-3 font-bold min-w-[125px]">Status</th>
                <th className="px-4 py-3 font-bold">Cara Baca & Patokan Wajar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {GLOSSARY_ITEMS.map((item) => (
                <tr
                  key={item.code}
                  className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                      {item.code}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.name}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap align-middle">
                    <span className="font-mono font-bold tabular-nums text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {item.currentValue}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap align-middle">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border ${item.badgeStyle}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 leading-relaxed align-middle max-w-xl">
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
