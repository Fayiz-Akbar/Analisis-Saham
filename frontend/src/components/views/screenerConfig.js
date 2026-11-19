export const PAGE_SIZE = 15;

export const INITIAL_FILTER_STATE = {
  sectors: [],
  perMin: "",
  perMax: "",
  pbvMin: "",
  pbvMax: "",
  roeMin: "",
  roeMax: "",
  roaMin: "",
  roaMax: "",
  npmMin: "",
  npmMax: "",
  derMin: "",
  derMax: "",
  divYieldMin: "",
  divYieldMax: "",
  marketCapMin: "",
  marketCapMax: "",
  revenueMin: "",
  revenueMax: "",
  netIncomeMin: "",
  netIncomeMax: "",
  epsMin: "",
  epsMax: "",
};

export const SECTOR_LABELS_ID = {
  Financials: "Keuangan & Bank",
  Energy: "Energi",
  "Basic Materials": "Bahan Baku",
  "Consumer Non-Cyclicals": "Konsumer Primer",
  "Consumer Cyclicals": "Konsumer Siklikal",
  Infrastructures: "Infrastruktur",
  Technology: "Teknologi",
  Industrials: "Perindustrian",
  Healthcare: "Kesehatan",
  "Properties & Real Estate": "Properti & Real Estat",
  Telecommunication: "Telekomunikasi",
  "Transportation & Logistic": "Transportasi & Logistik",
};

export const DEFAULT_SECTOR_ORDER = Object.keys(SECTOR_LABELS_ID);

export const SCREENER_CATEGORY_TABS = [
  {
    id: "ikhtisar",
    label: "Ikhtisar",
    columns: [
      { id: "peRatio", label: "PER", sortKey: "peRatio" },
      { id: "pbvRatio", label: "PBV", sortKey: "pbvRatio" },
      { id: "roe", label: "ROE", sortKey: "roe", accent: "emerald" },
      { id: "eps", label: "EPS TTM", sortKey: "eps" },
      { id: "dividendYield", label: "Yield Dividen", sortKey: "dividendYield" },
    ],
  },
  {
    id: "kinerja",
    label: "Kinerja",
    columns: [
      { id: "volume", label: "Volume", sortKey: "volume" },
      { id: "txValue", label: "Nilai Transaksi", sortKey: "txValue" },
      { id: "highPrice", label: "High Hari Ini", sortKey: "highPrice" },
      { id: "lowPrice", label: "Low Hari Ini", sortKey: "lowPrice" },
    ],
  },
  {
    id: "teknikal",
    label: "Teknikal",
    columns: [
      { id: "openPrice", label: "Open", sortKey: "openPrice" },
      { id: "highPrice", label: "High", sortKey: "highPrice" },
      { id: "lowPrice", label: "Low", sortKey: "lowPrice" },
      { id: "priceRange", label: "Rentang Harga", sortKey: null },
    ],
  },
  {
    id: "penilaian",
    label: "Penilaian",
    columns: [
      { id: "peRatio", label: "P/E (PER)", sortKey: "peRatio" },
      { id: "pbvRatio", label: "PBV", sortKey: "pbvRatio" },
      { id: "eps", label: "EPS", sortKey: "eps" },
      { id: "bookValuePerShare", label: "Nilai Buku/Lbr", sortKey: null },
    ],
  },
  {
    id: "dividen",
    label: "Dividen",
    columns: [
      { id: "dividendYield", label: "Yield Dividen", sortKey: "dividendYield", accent: "emerald" },
      { id: "eps", label: "EPS", sortKey: "eps" },
      { id: "peRatio", label: "P/E", sortKey: "peRatio" },
      { id: "payoutRatio", label: "Payout Ratio", sortKey: null },
    ],
  },
  {
    id: "profitabilitas",
    label: "Profitabilitas",
    columns: [
      { id: "roe", label: "ROE", sortKey: "roe", accent: "emerald" },
      { id: "roa", label: "ROA", sortKey: "roa" },
      { id: "netProfitMargin", label: "Net Margin", sortKey: "netProfitMargin" },
      { id: "netIncome", label: "Laba Bersih", sortKey: "netIncome" },
    ],
  },
  {
    id: "laporan_pemasukan",
    label: "Laporan Pemasukan",
    columns: [
      { id: "revenue", label: "Pendapatan", sortKey: "revenue" },
      { id: "netIncome", label: "Laba Bersih", sortKey: "netIncome" },
      { id: "netProfitMargin", label: "Net Margin", sortKey: "netProfitMargin" },
      { id: "eps", label: "EPS", sortKey: "eps" },
    ],
  },
  {
    id: "neraca",
    label: "Neraca Keuangan",
    columns: [
      { id: "totalAssets", label: "Total Aset", sortKey: "totalAssets" },
      { id: "totalLiabilities", label: "Total Liabilitas", sortKey: "totalLiabilities" },
      { id: "totalEquity", label: "Total Ekuitas", sortKey: "totalEquity" },
      { id: "der", label: "DER", sortKey: "der" },
    ],
  },
  {
    id: "arus_kas",
    label: "Arus Kas",
    columns: [
      { id: "cashEquivalents", label: "Kas & Setara Kas", sortKey: "cashEquivalents", accent: "emerald" },
      { id: "netIncome", label: "Laba Bersih", sortKey: "netIncome" },
      { id: "totalEquity", label: "Total Ekuitas", sortKey: "totalEquity" },
    ],
  },
];

export const CORE_RATIO_FIELDS = [
  {
    id: "per",
    label: "PER (P/E Ratio)",
    shortLabel: "PER",
    sortKey: "peRatio",
    dbField: "peRatio",
    minKey: "perMin",
    maxKey: "perMax",
    unit: "x",
    defaultMode: "lt",
    placeholderNumber: "15",
    tooltip:
      "Price to Earnings Ratio: perbandingan harga saham dengan laba bersih per saham. Nilai positif di bawah 15x umumnya dianggap relatif murah.",
    options: [
      { id: "all", label: "Semua", patch: { perMin: "", perMax: "" } },
      { id: "lt10", label: "< 10x", patch: { perMin: "0", perMax: "10" } },
      { id: "lt15", label: "< 15x", patch: { perMin: "0", perMax: "15" } },
      { id: "15to25", label: "15x - 25x", patch: { perMin: "15", perMax: "25" } },
      { id: "gt25", label: "> 25x", patch: { perMin: "25", perMax: "" } },
    ],
  },
  {
    id: "pbv",
    label: "PBV Ratio",
    shortLabel: "PBV",
    sortKey: "pbvRatio",
    dbField: "pbvRatio",
    minKey: "pbvMin",
    maxKey: "pbvMax",
    unit: "x",
    defaultMode: "lt",
    placeholderNumber: "1.5",
    tooltip:
      "Price to Book Value: perbandingan harga saham terhadap nilai modal bersihnya. Di bawah 1,0x berarti harga pasar lebih rendah dari nilai buku.",
    options: [
      { id: "all", label: "Semua", patch: { pbvMin: "", pbvMax: "" } },
      { id: "lt1", label: "< 1,0x", patch: { pbvMin: "0", pbvMax: "1" } },
      { id: "lt1_5", label: "< 1,5x", patch: { pbvMin: "0", pbvMax: "1.5" } },
      { id: "1_5to3", label: "1,5x - 3x", patch: { pbvMin: "1.5", pbvMax: "3" } },
      { id: "gt3", label: "> 3,0x", patch: { pbvMin: "3", pbvMax: "" } },
    ],
  },
  {
    id: "roe",
    label: "ROE (%)",
    shortLabel: "ROE",
    sortKey: "roe",
    dbField: "roe",
    minKey: "roeMin",
    maxKey: "roeMax",
    unit: "%",
    defaultMode: "gt",
    placeholderNumber: "15",
    tooltip:
      "Return on Equity: persentase laba bersih yang dihasilkan dari modal pemegang saham. Di atas 15% menandakan efisiensi modal yang kuat.",
    options: [
      { id: "all", label: "Semua", patch: { roeMin: "", roeMax: "" } },
      { id: "gt20", label: "> 20%", patch: { roeMin: "20", roeMax: "" } },
      { id: "gt15", label: "> 15%", patch: { roeMin: "15", roeMax: "" } },
      { id: "gt10", label: "> 10%", patch: { roeMin: "10", roeMax: "" } },
      { id: "gt0", label: "> 0%", patch: { roeMin: "0.01", roeMax: "" } },
    ],
  },
];

export const ADVANCED_INDICATOR_FIELDS = [
  {
    id: "roa",
    label: "ROA (%)",
    shortLabel: "ROA",
    sortKey: "roa",
    dbField: "roa",
    minKey: "roaMin",
    maxKey: "roaMax",
    unit: "%",
    multiplier: 1,
    formatType: "percent",
    defaultMode: "gt",
    placeholderNumber: "5",
    tooltip:
      "Return on Assets: seberapa efisien perusahaan mengubah seluruh asetnya menjadi laba bersih.",
    options: [
      { id: "all", label: "Semua", patch: { roaMin: "", roaMax: "" } },
      { id: "gt10", label: "> 10%", patch: { roaMin: "10", roaMax: "" } },
      { id: "gt5", label: "> 5%", patch: { roaMin: "5", roaMax: "" } },
      { id: "gt2", label: "> 2%", patch: { roaMin: "2", roaMax: "" } },
    ],
  },
  {
    id: "npm",
    label: "Net Margin (%)",
    shortLabel: "Net Margin",
    sortKey: "netProfitMargin",
    dbField: "netProfitMargin",
    minKey: "npmMin",
    maxKey: "npmMax",
    unit: "%",
    multiplier: 1,
    formatType: "percent",
    defaultMode: "gt",
    placeholderNumber: "10",
    tooltip:
      "Net Profit Margin: persentase penjualan yang benar-benar tersisa menjadi laba bersih setelah dikurangi beban dan pajak.",
    options: [
      { id: "all", label: "Semua", patch: { npmMin: "", npmMax: "" } },
      { id: "gt20", label: "> 20%", patch: { npmMin: "20", npmMax: "" } },
      { id: "gt10", label: "> 10%", patch: { npmMin: "10", npmMax: "" } },
      { id: "gt5", label: "> 5%", patch: { npmMin: "5", npmMax: "" } },
    ],
  },
  {
    id: "der",
    label: "DER (x)",
    shortLabel: "DER",
    sortKey: "der",
    dbField: "der",
    minKey: "derMin",
    maxKey: "derMax",
    unit: "x",
    multiplier: 1,
    formatType: "ratio",
    defaultMode: "lt",
    placeholderNumber: "1",
    tooltip:
      "Debt-to-Equity Ratio: perbandingan total kewajiban (utang) terhadap modal sendiri. Nilai < 1,0x menandakan utang lebih kecil dari ekuitas.",
    options: [
      { id: "all", label: "Semua", patch: { derMin: "", derMax: "" } },
      { id: "lt0_5", label: "< 0,5x", patch: { derMin: "0", derMax: "0.5" } },
      { id: "lt1", label: "< 1,0x", patch: { derMin: "0", derMax: "1" } },
      { id: "1to2", label: "1x - 2x", patch: { derMin: "1", derMax: "2" } },
      { id: "gt2", label: "> 2,0x", patch: { derMin: "2", derMax: "" } },
    ],
  },
  {
    id: "divYield",
    label: "Yield Dividen (%)",
    shortLabel: "Dividen",
    sortKey: "dividendYield",
    dbField: "dividendYield",
    minKey: "divYieldMin",
    maxKey: "divYieldMax",
    unit: "%",
    multiplier: 1,
    formatType: "percent",
    defaultMode: "gt",
    placeholderNumber: "4",
    tooltip:
      "Dividend Yield: persentase imbal hasil dividen tahunan terhadap harga saham saat ini.",
    options: [
      { id: "all", label: "Semua", patch: { divYieldMin: "", divYieldMax: "" } },
      { id: "gt6", label: "> 6%", patch: { divYieldMin: "6", divYieldMax: "" } },
      { id: "gt4", label: "> 4%", patch: { divYieldMin: "4", divYieldMax: "" } },
      { id: "gt2", label: "> 2%", patch: { divYieldMin: "2", divYieldMax: "" } },
    ],
  },
  {
    id: "revenue",
    label: "Revenue (Miliar Rp)",
    shortLabel: "Revenue",
    sortKey: "revenue",
    dbField: "revenue",
    minKey: "revenueMin",
    maxKey: "revenueMax",
    unit: "M",
    multiplier: 1e9,
    formatType: "compactCurrency",
    defaultMode: "gt",
    placeholderNumber: "5000",
    tooltip:
      "Total pendapatan usaha perusahaan sebelum dikurangi biaya operasional (satuan Miliar Rp, contoh 5000 = Rp 5 Triliun).",
    options: [
      { id: "all", label: "Semua", patch: { revenueMin: "", revenueMax: "" } },
      { id: "gt20t", label: "> Rp 20 T", patch: { revenueMin: "20000", revenueMax: "" } },
      { id: "gt5t", label: "> Rp 5 T", patch: { revenueMin: "5000", revenueMax: "" } },
      { id: "gt1t", label: "> Rp 1 T", patch: { revenueMin: "1000", revenueMax: "" } },
    ],
  },
  {
    id: "netIncome",
    label: "Net Income (Miliar Rp)",
    shortLabel: "Laba Bersih",
    sortKey: "netIncome",
    dbField: "netIncome",
    minKey: "netIncomeMin",
    maxKey: "netIncomeMax",
    unit: "M",
    multiplier: 1e9,
    formatType: "compactCurrency",
    defaultMode: "gt",
    placeholderNumber: "1000",
    tooltip:
      "Keuntungan bersih akhir perusahaan (satuan Miliar Rp, contoh 1000 = Rp 1 Triliun).",
    options: [
      { id: "all", label: "Semua", patch: { netIncomeMin: "", netIncomeMax: "" } },
      { id: "gt5t", label: "> Rp 5 T", patch: { netIncomeMin: "5000", netIncomeMax: "" } },
      { id: "gt1t", label: "> Rp 1 T", patch: { netIncomeMin: "1000", netIncomeMax: "" } },
      { id: "gt500m", label: "> Rp 500 M", patch: { netIncomeMin: "500", netIncomeMax: "" } },
    ],
  },
  {
    id: "eps",
    label: "EPS (Rp)",
    shortLabel: "EPS",
    sortKey: "eps",
    dbField: "eps",
    minKey: "epsMin",
    maxKey: "epsMax",
    unit: "Rp",
    multiplier: 1,
    formatType: "currency",
    defaultMode: "gt",
    placeholderNumber: "50",
    tooltip:
      "Earnings Per Share: jatah laba bersih untuk setiap 1 lembar saham beredar.",
    options: [
      { id: "all", label: "Semua", patch: { epsMin: "", epsMax: "" } },
      { id: "gt200", label: "> Rp 200", patch: { epsMin: "200", epsMax: "" } },
      { id: "gt50", label: "> Rp 50", patch: { epsMin: "50", epsMax: "" } },
      { id: "gt0", label: "> Rp 0", patch: { epsMin: "0.01", epsMax: "" } },
    ],
  },
  {
    id: "marketCap",
    label: "Kap. Pasar (Miliar Rp)",
    shortLabel: "Kap. Pasar",
    sortKey: "marketCap",
    dbField: "marketCap",
    minKey: "marketCapMin",
    maxKey: "marketCapMax",
    unit: "M",
    multiplier: 1e9,
    formatType: "compactCurrency",
    defaultMode: "gt",
    placeholderNumber: "50000",
    tooltip:
      "Total nilai kapitalisasi pasar emiten di bursa (satuan Miliar Rp, contoh 50000 = Rp 50 Triliun).",
    options: [
      { id: "all", label: "Semua", patch: { marketCapMin: "", marketCapMax: "" } },
      { id: "gt100t", label: "> Rp 100 T", patch: { marketCapMin: "100000", marketCapMax: "" } },
      { id: "gt50t", label: "> Rp 50 T", patch: { marketCapMin: "50000", marketCapMax: "" } },
      { id: "gt10t", label: "> Rp 10 T", patch: { marketCapMin: "10000", marketCapMax: "" } },
    ],
  },
];

export const QUICK_PRESETS = [
  {
    id: "cheap-valuation",
    label: "Valuasi Murah",
    summary: "PER 0-15x & PBV 0-1,5x",
    description:
      "Menyaring emiten berlaba positif dengan harga pasar relatif murah terhadap laba (PER 0-15x) dan nilai bukunya (PBV 0-1,5x).",
    patch: { perMin: "0", perMax: "15", pbvMin: "0", pbvMax: "1.5" },
  },
  {
    id: "undervalued-book",
    label: "Diskon Nilai Buku",
    summary: "PBV < 1,0x & PER 0-20x",
    description:
      "Saham yang diperdagangkan di bawah nilai ekuitas bukunya (PBV 0-1,0x) namun tetap mencetak laba positif (PER 0-20x).",
    patch: { pbvMin: "0", pbvMax: "1", perMin: "0", perMax: "20" },
  },
  {
    id: "high-profit",
    label: "Profitabilitas Tinggi",
    summary: "ROE > 15% & Net Margin > 10%",
    description:
      "Menyorot perusahaan paling efisien mencetak keuntungan dari modal sendiri (ROE >= 15%) dengan margin laba bersih >= 10%.",
    patch: { roeMin: "15", npmMin: "10" },
  },
  {
    id: "efficient-roa",
    label: "Efisiensi Aset Prima",
    summary: "ROA > 5% & ROE > 12%",
    description:
      "Emiten yang produktif memaksimalkan seluruh aset perusahaan (ROA >= 5%) sekaligus menjaga imbal hasil modal >= 12%.",
    patch: { roaMin: "5", roeMin: "12" },
  },
  {
    id: "low-debt",
    label: "Utang Rendah & Sehat",
    summary: "ROE > 10% & DER < 1,0x",
    description:
      "Kombinasi bisnis menguntungkan (ROE >= 10%) yang menjaga total utang lebih rendah dibanding modal sendiri (DER <= 1,0x).",
    patch: { roeMin: "10", derMin: "0", derMax: "1" },
  },
  {
    id: "high-dividend",
    label: "Dividen Tinggi",
    summary: "Yield Dividen >= 4%",
    description:
      "Saham pembagi dividen menarik dengan imbal hasil tahunan (Dividend Yield) minimal 4%.",
    patch: { divYieldMin: "4" },
  },
  {
    id: "big-earnings",
    label: "Laba Skala Besar",
    summary: "Net Income > 1 T & EPS > 50",
    description:
      "Menampilkan emiten dengan laba bersih tahunan di atas Rp 1 Triliun dan EPS di atas Rp 50.",
    patch: { netIncomeMin: "1000", epsMin: "50" },
  },
  {
    id: "bluechip-cap",
    label: "Kapitalisasi Raksasa",
    summary: "Kap. Pasar >= Rp 50 T",
    description:
      "Emiten berkapitalisasi pasar besar (>= Rp 50 Triliun) yang menjadi penggerak utama likuiditas IDX80.",
    patch: { marketCapMin: "50000" },
  },
];

export const ALL_RANGE_FIELDS = [...CORE_RATIO_FIELDS, ...ADVANCED_INDICATOR_FIELDS];

export function mergePresetsPatch(presetIds) {
  const merged = {};
  for (const presetId of presetIds) {
    const preset = QUICK_PRESETS.find((p) => p.id === presetId);
    if (!preset) continue;

    for (const field of ALL_RANGE_FIELDS) {
      const nextMin = preset.patch[field.minKey];
      const nextMax = preset.patch[field.maxKey];

      if (nextMin !== undefined && nextMin !== "") {
        const num = Number(nextMin);
        const cur =
          merged[field.minKey] !== undefined && merged[field.minKey] !== ""
            ? Number(merged[field.minKey])
            : null;
        if (cur === null || num > cur) {
          merged[field.minKey] = String(nextMin);
        }
      }

      if (nextMax !== undefined && nextMax !== "") {
        const num = Number(nextMax);
        const cur =
          merged[field.maxKey] !== undefined && merged[field.maxKey] !== ""
            ? Number(merged[field.maxKey])
            : null;
        if (cur === null || num < cur) {
          merged[field.maxKey] = String(nextMax);
        }
      }
    }
  }
  return merged;
}

const formatBillionShort = (valStr) => {
  const num = Number(valStr);
  if (!Number.isFinite(num)) return valStr;
  if (Math.abs(num) >= 1000) {
    return `Rp ${(num / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} T`;
  }
  return `Rp ${num.toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
};

const formatSingleBound = (field, raw) => {
  if (field.unit === "M") return formatBillionShort(raw);
  if (field.unit === "Rp") return `Rp ${Number(raw).toLocaleString("id-ID")}`;
  return `${Number(raw).toLocaleString("id-ID", { maximumFractionDigits: 2 })}${field.unit}`;
};

export function getRatioSummaryLabel(field, filterState) {
  const minVal = String(filterState?.[field.minKey] ?? "").trim();
  const maxVal = String(filterState?.[field.maxKey] ?? "").trim();
  if (!minVal && !maxVal) return "Semua";

  const presetOpt = field.options?.find(
    (opt) =>
      String(opt.patch[field.minKey] ?? "") === minVal &&
      String(opt.patch[field.maxKey] ?? "") === maxVal
  );
  if (presetOpt) return presetOpt.label;

  if (minVal && maxVal) {
    return `${formatSingleBound(field, minVal)} - ${formatSingleBound(field, maxVal)}`;
  }
  if (maxVal) return `< ${formatSingleBound(field, maxVal)}`;
  return `> ${formatSingleBound(field, minVal)}`;
}

const isFiniteMetric = (val) =>
  val !== null && val !== undefined && val !== "" && Number.isFinite(Number(val));

export function formatScreenerValue(val, type) {
  if (!isFiniteMetric(val)) {
    return "N/A";
  }
  const num = Number(val);
  if (type === "currency") {
    return `Rp ${num.toLocaleString("id-ID", { maximumFractionDigits: 2 })}`;
  }
  if (type === "compactCurrency") {
    const abs = Math.abs(num);
    if (abs >= 1e12) {
      return `Rp ${(num / 1e12).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} T`;
    }
    if (abs >= 1e9) {
      return `Rp ${(num / 1e9).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} M`;
    }
    if (abs >= 1e6) {
      return `Rp ${(num / 1e6).toLocaleString("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} Jt`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  }
  if (type === "compactVolume") {
    const abs = Math.abs(num);
    if (abs >= 1e9) {
      return `${(num / 1e9).toLocaleString("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      })} M`;
    }
    if (abs >= 1e6) {
      return `${(num / 1e6).toLocaleString("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} Jt`;
    }
    if (abs >= 1e3) {
      return `${(num / 1e3).toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      })} Rb`;
    }
    return num.toLocaleString("id-ID");
  }
  if (type === "percent") {
    return `${num.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  }
  if (type === "percentInt") {
    return `${Math.round(num)}%`;
  }
  if (type === "signedPercent") {
    const sign = num > 0 ? "+" : "";
    return `${sign}${num.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  }
  if (type === "ratio") {
    return `${num.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}x`;
  }
  return String(val);
}

/**
 * Ekstraksi nilai terstandar untuk semua kolom metrik maupun pengurutan (null-safe -> "N/A").
 */
export function resolveStockMetric(stock, metricId) {
  const dp = stock?.dailyPrice || {};
  const f = stock?.fundamentals || {};
  const price = isFiniteMetric(dp.closePrice) ? Number(dp.closePrice) : null;
  const vol = isFiniteMetric(dp.volume) ? Number(dp.volume) : null;

  switch (metricId) {
    case "price":
      return { raw: price, text: formatScreenerValue(price, "currency"), type: "currency" };
    case "changePercent":
      return {
        raw: isFiniteMetric(dp.changePercent) ? Number(dp.changePercent) : null,
        text: formatScreenerValue(dp.changePercent, "signedPercent"),
        type: "signedPercent",
      };
    case "volume":
      return { raw: vol, text: formatScreenerValue(vol, "compactVolume"), type: "compactVolume" };
    case "txValue": {
      const tx = vol !== null && price !== null ? vol * price : null;
      return { raw: tx, text: formatScreenerValue(tx, "compactCurrency"), type: "compactCurrency" };
    }
    case "openPrice":
      return {
        raw: isFiniteMetric(dp.openPrice) ? Number(dp.openPrice) : null,
        text: formatScreenerValue(dp.openPrice, "currency"),
        type: "currency",
      };
    case "highPrice":
      return {
        raw: isFiniteMetric(dp.highPrice) ? Number(dp.highPrice) : null,
        text: formatScreenerValue(dp.highPrice, "currency"),
        type: "currency",
      };
    case "lowPrice":
      return {
        raw: isFiniteMetric(dp.lowPrice) ? Number(dp.lowPrice) : null,
        text: formatScreenerValue(dp.lowPrice, "currency"),
        type: "currency",
      };
    case "priceRange": {
      const hasRange = isFiniteMetric(dp.lowPrice) && isFiniteMetric(dp.highPrice);
      return {
        raw: null,
        text: hasRange
          ? `${formatScreenerValue(dp.lowPrice, "currency")} - ${formatScreenerValue(dp.highPrice, "currency")}`
          : "N/A",
        type: "text",
      };
    }
    case "marketCap":
      return {
        raw: isFiniteMetric(f.marketCap) ? Number(f.marketCap) : null,
        text: formatScreenerValue(f.marketCap, "compactCurrency"),
        type: "compactCurrency",
      };
    case "peRatio":
      return {
        raw: isFiniteMetric(f.peRatio) ? Number(f.peRatio) : null,
        text: formatScreenerValue(f.peRatio, "ratio"),
        type: "ratio",
      };
    case "pbvRatio":
      return {
        raw: isFiniteMetric(f.pbvRatio) ? Number(f.pbvRatio) : null,
        text: formatScreenerValue(f.pbvRatio, "ratio"),
        type: "ratio",
      };
    case "roe":
      return {
        raw: isFiniteMetric(f.roe) ? Number(f.roe) : null,
        text: formatScreenerValue(f.roe, "percent"),
        type: "percent",
      };
    case "roa":
      return {
        raw: isFiniteMetric(f.roa) ? Number(f.roa) : null,
        text: formatScreenerValue(f.roa, "percent"),
        type: "percent",
      };
    case "netProfitMargin":
      return {
        raw: isFiniteMetric(f.netProfitMargin) ? Number(f.netProfitMargin) : null,
        text: formatScreenerValue(f.netProfitMargin, "percent"),
        type: "percent",
      };
    case "der":
      return {
        raw: isFiniteMetric(f.der) ? Number(f.der) : null,
        text: formatScreenerValue(f.der, "ratio"),
        type: "ratio",
      };
    case "eps":
      return {
        raw: isFiniteMetric(f.eps) ? Number(f.eps) : null,
        text: formatScreenerValue(f.eps, "currency"),
        type: "currency",
      };
    case "dividendYield":
      return {
        raw: isFiniteMetric(f.dividendYield) ? Number(f.dividendYield) : null,
        text: formatScreenerValue(f.dividendYield, "percent"),
        type: "percent",
      };
    case "bookValuePerShare": {
      const bvps =
        price !== null && isFiniteMetric(f.pbvRatio) && Number(f.pbvRatio) > 0
          ? Math.round(price / Number(f.pbvRatio))
          : null;
      return { raw: bvps, text: formatScreenerValue(bvps, "currency"), type: "currency" };
    }
    case "payoutRatio": {
      const pr =
        isFiniteMetric(f.dividendYield) && isFiniteMetric(f.peRatio)
          ? Math.min(100, Math.max(0, Math.round(Number(f.dividendYield) * Number(f.peRatio))))
          : null;
      return { raw: pr, text: formatScreenerValue(pr, "percentInt"), type: "percentInt" };
    }
    case "revenue":
      return {
        raw: isFiniteMetric(f.revenue) ? Number(f.revenue) : null,
        text: formatScreenerValue(f.revenue, "compactCurrency"),
        type: "compactCurrency",
      };
    case "netIncome":
      return {
        raw: isFiniteMetric(f.netIncome) ? Number(f.netIncome) : null,
        text: formatScreenerValue(f.netIncome, "compactCurrency"),
        type: "compactCurrency",
      };
    case "totalAssets":
      return {
        raw: isFiniteMetric(f.totalAssets) ? Number(f.totalAssets) : null,
        text: formatScreenerValue(f.totalAssets, "compactCurrency"),
        type: "compactCurrency",
      };
    case "totalLiabilities":
      return {
        raw: isFiniteMetric(f.totalLiabilities) ? Number(f.totalLiabilities) : null,
        text: formatScreenerValue(f.totalLiabilities, "compactCurrency"),
        type: "compactCurrency",
      };
    case "totalEquity":
      return {
        raw: isFiniteMetric(f.totalEquity) ? Number(f.totalEquity) : null,
        text: formatScreenerValue(f.totalEquity, "compactCurrency"),
        type: "compactCurrency",
      };
    case "cashEquivalents":
      return {
        raw: isFiniteMetric(f.cashEquivalents) ? Number(f.cashEquivalents) : null,
        text: formatScreenerValue(f.cashEquivalents, "compactCurrency"),
        type: "compactCurrency",
      };
    default:
      return { raw: null, text: "N/A", type: "text" };
  }
}

export function buildScreenerQueryString(filters, sortBy, sortOrder) {
  const params = new URLSearchParams();

  if (Array.isArray(filters.sectors) && filters.sectors.length > 0) {
    params.set("sectors", filters.sectors.join(","));
  }

  for (const field of ALL_RANGE_FIELDS) {
    const mult = field.multiplier || 1;
    const rawMin = String(filters[field.minKey] ?? "").trim().replace(",", ".");
    const rawMax = String(filters[field.maxKey] ?? "").trim().replace(",", ".");

    if (rawMin !== "" && Number.isFinite(Number(rawMin))) {
      params.set(field.minKey, String(Number(rawMin) * mult));
    }
    if (rawMax !== "" && Number.isFinite(Number(rawMax))) {
      params.set(field.maxKey, String(Number(rawMax) * mult));
    }
  }

  if (sortBy) params.set("sortBy", sortBy);
  if (sortOrder) params.set("sortOrder", sortOrder);
  return params.toString();
}
