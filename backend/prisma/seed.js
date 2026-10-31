import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Data 80 Emiten Konstituen Indeks IDX80 (Bursa Efek Indonesia)
const IDX80_STOCKS = [
  { symbol: "ACES", companyName: "Aspirasi Hidup Indonesia Tbk.", sector: "Consumer Cyclicals", industry: "Specialty Retail" },
  { symbol: "ADMR", companyName: "Adaro Minerals Indonesia Tbk.", sector: "Energy", industry: "Coal" },
  { symbol: "ADRO", companyName: "Adaro Energy Indonesia Tbk.", sector: "Energy", industry: "Thermal Coal" },
  { symbol: "AKRA", companyName: "AKR Corporindo Tbk.", sector: "Energy", industry: "Oil & Gas Distribution" },
  { symbol: "AMMN", companyName: "Amman Mineral Internasional Tbk.", sector: "Basic Materials", industry: "Copper & Gold Mining" },
  { symbol: "AMRT", companyName: "Sumber Alfaria Trijaya Tbk.", sector: "Consumer Non-Cyclicals", industry: "Food Retail" },
  { symbol: "ANTM", companyName: "Aneka Tambang Tbk.", sector: "Basic Materials", industry: "Diversified Metals & Mining" },
  { symbol: "ARTO", companyName: "Bank Jago Tbk.", sector: "Financials", industry: "Digital Banking" },
  { symbol: "ASII", companyName: "Astra International Tbk.", sector: "Industrials", industry: "Automotive & Conglomerate" },
  { symbol: "AVIA", companyName: "Avia Avian Tbk.", sector: "Basic Materials", industry: "Specialty Chemicals" },
  { symbol: "BBCA", companyName: "Bank Central Asia Tbk.", sector: "Financials", industry: "Diversified Banking" },
  { symbol: "BBNI", companyName: "Bank Negara Indonesia (Persero) Tbk.", sector: "Financials", industry: "Diversified Banking" },
  { symbol: "BBRI", companyName: "Bank Rakyat Indonesia (Persero) Tbk.", sector: "Financials", industry: "Microfinance & Commercial Banking" },
  { symbol: "BBTN", companyName: "Bank Tabungan Negara (Persero) Tbk.", sector: "Financials", industry: "Mortgage Banking" },
  { symbol: "BDMN", companyName: "Bank Danamon Indonesia Tbk.", sector: "Financials", industry: "Diversified Banking" },
  { symbol: "BFIN", companyName: "BFI Finance Indonesia Tbk.", sector: "Financials", industry: "Consumer Financing" },
  { symbol: "BMRI", companyName: "Bank Mandiri (Persero) Tbk.", sector: "Financials", industry: "Corporate & Commercial Banking" },
  { symbol: "BNGA", companyName: "Bank CIMB Niaga Tbk.", sector: "Financials", industry: "Commercial Banking" },
  { symbol: "BRIS", companyName: "Bank Syariah Indonesia Tbk.", sector: "Financials", industry: "Islamic Banking" },
  { symbol: "BRPT", companyName: "Barito Pacific Tbk.", sector: "Basic Materials", industry: "Petrochemicals & Energy" },
  { symbol: "BSSR", companyName: "Baramulti Suksessarana Tbk.", sector: "Energy", industry: "Coal" },
  { symbol: "BTPS", companyName: "Bank BTPN Syariah Tbk.", sector: "Financials", industry: "Islamic Microfinance" },
  { symbol: "BUKA", companyName: "Bukalapak.com Tbk.", sector: "Technology", industry: "E-Commerce" },
  { symbol: "CPIN", companyName: "Charoen Pokphand Indonesia Tbk.", sector: "Consumer Non-Cyclicals", industry: "Poultry & Animal Feed" },
  { symbol: "CTRA", companyName: "Ciputra Development Tbk.", sector: "Properties & Real Estate", industry: "Property Development" },
  { symbol: "DOID", companyName: "Delta Dunia Makmur Tbk.", sector: "Energy", industry: "Mining Services" },
  { symbol: "ELSA", companyName: "Elnusa Tbk.", sector: "Energy", industry: "Oil & Gas Services" },
  { symbol: "EMTK", companyName: "Elang Mahkota Teknologi Tbk.", sector: "Technology", industry: "Media & Tech Conglomerate" },
  { symbol: "ENRG", companyName: "Energi Mega Persada Tbk.", sector: "Energy", industry: "Oil & Gas Exploration" },
  { symbol: "ERAA", companyName: "Erajaya Swasembada Tbk.", sector: "Consumer Cyclicals", industry: "Consumer Electronics Retail" },
  { symbol: "EXCL", companyName: "XL Axiata Tbk.", sector: "Telecommunication", industry: "Wireless Telecommunications" },
  { symbol: "GGRM", companyName: "Gudang Garam Tbk.", sector: "Consumer Non-Cyclicals", industry: "Tobacco" },
  { symbol: "GOTO", companyName: "GoTo Gojek Tokopedia Tbk.", sector: "Technology", industry: "On-demand & Digital Services" },
  { symbol: "HEAL", companyName: "Medikaloka Hermina Tbk.", sector: "Healthcare", industry: "Hospital Services" },
  { symbol: "HRUM", companyName: "Harum Energy Tbk.", sector: "Energy", industry: "Coal & Nickel Mining" },
  { symbol: "ICBP", companyName: "Indofood CBP Sukses Makmur Tbk.", sector: "Consumer Non-Cyclicals", industry: "Packaged Food" },
  { symbol: "INCO", companyName: "Vale Indonesia Tbk.", sector: "Basic Materials", industry: "Nickel Mining" },
  { symbol: "INDF", companyName: "Indofood Sukses Makmur Tbk.", sector: "Consumer Non-Cyclicals", industry: "Agribusiness & Food Processing" },
  { symbol: "INDY", companyName: "Indika Energy Tbk.", sector: "Energy", industry: "Coal & Diversified Energy" },
  { symbol: "INKP", companyName: "Indah Kiat Pulp & Paper Tbk.", sector: "Basic Materials", industry: "Paper & Forest Products" },
  { symbol: "INTP", companyName: "Indocement Tunggal Prakarsa Tbk.", sector: "Basic Materials", industry: "Cement" },
  { symbol: "ISAT", companyName: "Indosat Ooredoo Hutchison Tbk.", sector: "Telecommunication", industry: "Wireless Telecommunications" },
  { symbol: "ITMG", companyName: "Indo Tambangraya Megah Tbk.", sector: "Energy", industry: "Thermal Coal" },
  { symbol: "JPFA", companyName: "JAPFA Comfeed Indonesia Tbk.", sector: "Consumer Non-Cyclicals", industry: "Poultry Processing" },
  { symbol: "JSMR", companyName: "Jasa Marga (Persero) Tbk.", sector: "Infrastructures", industry: "Toll Road Operations" },
  { symbol: "KLBF", companyName: "Kalbe Farma Tbk.", sector: "Healthcare", industry: "Pharmaceuticals" },
  { symbol: "MAPI", companyName: "Mitra Adiperkasa Tbk.", sector: "Consumer Cyclicals", industry: "Apparel & Department Retail" },
  { symbol: "MAPA", companyName: "MAP Aktif Adiperkasa Tbk.", sector: "Consumer Cyclicals", industry: "Sports & Leisure Retail" },
  { symbol: "MBMA", companyName: "Merdeka Battery Materials Tbk.", sector: "Basic Materials", industry: "EV Battery Materials & Nickel" },
  { symbol: "MDKA", companyName: "Merdeka Copper Gold Tbk.", sector: "Basic Materials", industry: "Gold & Copper Mining" },
  { symbol: "MEDC", companyName: "Medco Energi Internasional Tbk.", sector: "Energy", industry: "Oil & Gas Production" },
  { symbol: "MIKA", companyName: "Mitra Keluarga Karyasehat Tbk.", sector: "Healthcare", industry: "Hospitals" },
  { symbol: "MNCN", companyName: "Media Nusantara Citra Tbk.", sector: "Consumer Cyclicals", industry: "Broadcasting & Media" },
  { symbol: "MYOR", companyName: "Mayora Indah Tbk.", sector: "Consumer Non-Cyclicals", industry: "Packaged Foods & Beverages" },
  { symbol: "NISP", companyName: "Bank OCBC NISP Tbk.", sector: "Financials", industry: "Commercial Banking" },
  { symbol: "PGAS", companyName: "Perusahaan Gas Negara Tbk.", sector: "Energy", industry: "Natural Gas Utilities" },
  { symbol: "PGEO", companyName: "Pertamina Geothermal Energy Tbk.", sector: "Infrastructures", industry: "Renewable Energy & Geothermal" },
  { symbol: "PNBN", companyName: "Bank Pan Indonesia Tbk.", sector: "Financials", industry: "Commercial Banking" },
  { symbol: "PTBA", companyName: "Bukit Asam Tbk.", sector: "Energy", industry: "Coal Mining" },
  { symbol: "PTPP", companyName: "PP (Persero) Tbk.", sector: "Infrastructures", industry: "Construction & Engineering" },
  { symbol: "PWON", companyName: "Pakuwon Jati Tbk.", sector: "Properties & Real Estate", industry: "Mall & Residential Properties" },
  { symbol: "SCMA", companyName: "Surya Citra Media Tbk.", sector: "Consumer Cyclicals", industry: "Broadcasting" },
  { symbol: "SIDO", companyName: "Industri Jamu Dan Farmasi Sido Muncul Tbk.", sector: "Healthcare", industry: "Herbal Medicine" },
  { symbol: "SMGR", companyName: "Semen Indonesia (Persero) Tbk.", sector: "Basic Materials", industry: "Cement" },
  { symbol: "SMRA", companyName: "Summarecon Agung Tbk.", sector: "Properties & Real Estate", industry: "Township Property" },
  { symbol: "SRTG", companyName: "Saratoga Investama Sedaya Tbk.", sector: "Financials", industry: "Investment Holding" },
  { symbol: "SSMS", companyName: "Sawit Sumbermas Sarana Tbk.", sector: "Consumer Non-Cyclicals", industry: "Palm Oil Plantation" },
  { symbol: "TBIG", companyName: "Tower Bersama Infrastructure Tbk.", sector: "Infrastructures", industry: "Telecommunications Towers" },
  { symbol: "TINS", companyName: "Timah Tbk.", sector: "Basic Materials", industry: "Tin Mining" },
  { symbol: "TKIM", companyName: "Pabrik Kertas Tjiwi Kimia Tbk.", sector: "Basic Materials", industry: "Paper Products" },
  { symbol: "TLKM", companyName: "Telkom Indonesia (Persero) Tbk.", sector: "Telecommunication", industry: "Integrated Telecommunications" },
  { symbol: "TOWR", companyName: "Sarana Menara Nusantara Tbk.", sector: "Infrastructures", industry: "Telecommunications Towers" },
  { symbol: "TPIA", companyName: "Chandra Asri Pacific Tbk.", sector: "Basic Materials", industry: "Petrochemicals" },
  { symbol: "UNTR", companyName: "United Tractors Tbk.", sector: "Industrials", industry: "Heavy Machinery & Mining Contracting" },
  { symbol: "UNVR", companyName: "Unilever Indonesia Tbk.", sector: "Consumer Non-Cyclicals", industry: "Personal & Household Products" },
  { symbol: "WIKA", companyName: "Wijaya Karya (Persero) Tbk.", sector: "Infrastructures", industry: "Construction" },
  { symbol: "WSKT", companyName: "Waskita Karya (Persero) Tbk.", sector: "Infrastructures", industry: "Construction" },
  { symbol: "BREN", companyName: "Barito Renewables Energy Tbk.", sector: "Infrastructures", industry: "Renewable Energy" },
  { symbol: "CUAN", companyName: "Petrindo Jaya Kreasi Tbk.", sector: "Energy", industry: "Coal Mining" },
  { symbol: "ESSA", companyName: "Essa Industries Indonesia Tbk.", sector: "Basic Materials", industry: "Ammonia & LPG" }
];

// Kurikulum Awal 3 Level (Pemula, Menengah, Mahir) beserta Bank Soal Kuis Evaluasi
const INITIAL_LEARNING_MODULES = [
  {
    title: "Mengenal Saham, Bursa Efek Indonesia (BEI), dan Satuan Lot",
    slug: "mengenal-saham-bei-dan-satuan-lot",
    level: "BEGINNER",
    orderIndex: 1,
    estimatedMinutes: 5,
    isPublished: true,
    summary:
      "Fondasi pasar modal Indonesia: bukti kepemilikan perusahaan terbuka (Tbk), peran BEI/IHSG, serta aturan perdagangan satuan lot (1 lot = 100 lembar).",
    contentBody: `## Apa Itu Saham?
Saham adalah **bukti kepemilikan nilai sebuah perusahaan terbuka (Tbk)** yang tercatat di **Bursa Efek Indonesia (BEI / IDX)**. Ketika Anda membeli saham emiten seperti **BBCA** atau **TLKM**, Anda secara sah menjadi salah satu pemilik bagian perusahaan tersebut.

### Satuan Perdagangan Lot di BEI
Di pasar reguler Bursa Efek Indonesia, investor ritel tidak membeli saham per 1 lembar, melainkan dalam satuan **Lot**:

\`\`\`
1 Lot = 100 Lembar Saham
Modal Pembelian = Jumlah Lot × 100 × Harga per Lembar
\`\`\`

### Contoh Perhitungan Modal
Jika harga saham **BBRI** saat ini adalah **Rp 4.800** per lembar dan Anda ingin membeli **2 Lot**:
- Jumlah lembar = \`2 × 100 = 200 lembar\`
- Total modal = \`200 × Rp 4.800 = Rp 960.000\`

### Dua Sumber Keuntungan Utama Saham
1. **Capital Gain**: Selisih positif ketika harga jual lebih tinggi dibanding harga beli rata-rata (*Average Buy Price*).
2. **Dividen Tunai**: Pembagian sebagian laba bersih perusahaan kepada pemegang saham sesuai keputusan RUPS.`,
    quizzes: [
      {
        questionText:
          "Berapa jumlah lembar saham dalam 1 lot pada perdagangan pasar reguler Bursa Efek Indonesia (BEI)?",
        optionA: "10 lembar saham",
        optionB: "50 lembar saham",
        optionC: "100 lembar saham",
        optionD: "1.000 lembar saham",
        correctKey: "C",
        explanationText:
          "Berdasarkan ketentuan Bursa Efek Indonesia (BEI), satuan perdagangan saham di pasar reguler adalah 1 lot yang setara dengan 100 lembar saham.",
        indicatorConcept: "Konsep Satuan Lot Perdagangan BEI (1 Lot = 100 Lembar)",
      },
      {
        questionText:
          "Seorang investor ingin membeli 3 lot saham BBCA pada harga Rp 8.850 per lembar. Berapa total dana yang dibutuhkan (di luar biaya sekuritas)?",
        optionA: "Rp 265.500",
        optionB: "Rp 885.000",
        optionC: "Rp 2.655.000",
        optionD: "Rp 8.850.000",
        correctKey: "C",
        explanationText:
          "Total biaya pembelian = 3 lot × 100 lembar × Rp 8.850 = 300 lembar × Rp 8.850 = Rp 2.655.000.",
        indicatorConcept: "Perhitungan Nilai Transaksi Pembelian Berbasis Lot",
      },
      {
        questionText:
          "Keuntungan yang diperoleh investor karena menjual saham pada harga yang lebih tinggi daripada harga belinya disebut...",
        optionA: "Dividen Interim",
        optionB: "Capital Gain",
        optionC: "Capital Loss",
        optionD: "Right Issue",
        correctKey: "B",
        explanationText:
          "Capital Gain adalah selisih keuntungan positif antara harga jual saham yang lebih tinggi dibandingkan harga beli rata-rata.",
        indicatorConcept: "Perbedaan Capital Gain, Capital Loss, dan Dividen",
      },
    ],
  },
  {
    title: "Mekanisme Pembentukan Harga, IHSG, dan Kapitalisasi Pasar",
    slug: "mekanisme-harga-ihsg-dan-market-cap",
    level: "BEGINNER",
    orderIndex: 2,
    estimatedMinutes: 6,
    isPublished: true,
    summary:
      "Memahami dinamika permintaan dan penawaran (bid/ask), Indeks Harga Saham Gabungan (IHSG), indeks likuid IDX80, serta klasifikasi kapitalisasi pasar.",
    contentBody: `## Bagaimana Harga Saham Bergerak?
Harga saham di bursa bergerak setiap detik selama jam perdagangan karena mekanisme lelang berkelanjutan antara **antrean beli (Bid)** dan **antrean jual (Offer/Ask)**.

### Indeks Harga Saham Gabungan (IHSG) & IDX80
- **IHSG (Composite Index)**: Barometer utama yang mengukur rata-rata tertimbang pergerakan seluruh saham di BEI.
- **Indeks IDX80**: Indeks yang berisi **80 saham dengan likuiditas tinggi dan kapitalisasi pasar besar** serta fundamental yang baik di BEI.

### Kapitalisasi Pasar (Market Capitalization)
Kapitalisasi pasar mencerminkan nilai total perusahaan di mata pasar:

\`\`\`
Market Cap = Harga Saham per Lembar × Total Saham Beredar
\`\`\`

Klasifikasi umum di Indonesia:
- **Big Cap (Blue Chip)**: Market Cap > Rp 10 Triliun (contoh: BBCA, BBRI, BMRI, TLKM, ASII).
- **Mid Cap (Second Liner)**: Market Cap Rp 1 Triliun – Rp 10 Triliun.
- **Small Cap (Third Liner)**: Market Cap < Rp 1 Triliun.`,
    quizzes: [
      {
        questionText:
          "Apa yang dimaksud dengan Kapitalisasi Pasar (Market Capitalization) suatu emiten saham?",
        optionA: "Total uang tunai yang disimpan perusahaan di rekening bank",
        optionB: "Hasil perkalian harga pasar per lembar saham dengan total jumlah saham beredar",
        optionC: "Jumlah utang jangka panjang perusahaan dibagi modal sendiri",
        optionD: "Keuntungan bersih tahunan perusahaan setelah dikurangi pajak",
        correctKey: "B",
        explanationText:
          "Market Capitalization dihitung dengan mengalikan harga saham terkini di pasar dengan total jumlah lembar saham yang beredar (outstanding shares).",
        indicatorConcept: "Definisi dan Rumus Kapitalisasi Pasar (Market Cap)",
      },
      {
        questionText:
          "Indeks di Bursa Efek Indonesia yang mengukur kinerja harga dari 80 saham dengan likuiditas tinggi dan kapitalisasi pasar besar adalah...",
        optionA: "Indeks IDX80",
        optionB: "Indeks Papan Akselerasi",
        optionC: "Indeks Obligasi Negara",
        optionD: "Indeks Pasar Uang",
        correctKey: "A",
        explanationText:
          "Indeks IDX80 merupakan indeks resmi BEI yang beranggotakan 80 konstituen saham terpilih dengan likuiditas transaksi dan kapitalisasi pasar yang besar.",
        indicatorConcept: "Memahami Indeks Pasar Modal (IHSG & IDX80)",
      },
    ],
  },
  {
    title: "Analisis Profitabilitas: Return on Equity (ROE) & Net Profit Margin",
    slug: "analisis-profitabilitas-roe-dan-npm",
    level: "INTERMEDIATE",
    orderIndex: 1,
    estimatedMinutes: 7,
    isPublished: true,
    summary:
      "Mengukur efektivitas perusahaan menghasilkan laba bersih dari modal pemegang saham (ROE) dan efisiensi operasional melalui Net Profit Margin (NPM).",
    contentBody: `## Pilar Profitabilitas dalam Analisis Fundamental
Investor fundamental membeli saham karena ingin memiliki bisnis yang mampu mencetak laba secara konsisten dan efisien.

### 1. Return on Equity (ROE)
**ROE** mengukur seberapa besar laba bersih yang mampu dihasilkan perusahaan dari setiap rupiah modal pemegang saham (*ekuitas*):

\`\`\`
ROE (%) = (Laba Bersih Setahun / Total Ekuitas) × 100%
\`\`\`

- **Interpretasi Umum**: Emiten dengan **ROE ≥ 15%** secara konsisten umumnya menandakan keunggulan kompetitif dan efisiensi pengelolaan modal yang kuat.

### 2. Net Profit Margin (NPM)
**NPM** mengukur persentase laba bersih yang tersisa dari total pendapatan (*revenue*) setelah dikurangi seluruh beban usaha, bunga, dan pajak:

\`\`\`
NPM (%) = (Laba Bersih / Total Pendapatan) × 100%
\`\`\`

### Studi Kasus
Jika PT Bank Central Asia Tbk (BBCA) membukukan ROE sebesar **21,5%**, artinya dari setiap Rp 100 modal ekuitas, manajemen mampu menghasilkan laba bersih Rp 21,50 bagi pemegang saham.`,
    quizzes: [
      {
        questionText:
          "Rumus yang tepat untuk menghitung rasio Return on Equity (ROE) adalah...",
        optionA: "(Total Utang / Total Ekuitas) × 100%",
        optionB: "(Harga Saham / Laba per Lembar) × 100%",
        optionC: "(Laba Bersih / Total Ekuitas) × 100%",
        optionD: "(Total Aset / Pendapatan Kotor) × 100%",
        correctKey: "C",
        explanationText:
          "Return on Equity (ROE) dihitung dengan membagi Laba Bersih (Net Income) terhadap Total Ekuitas pemegang saham dikalikan 100%.",
        indicatorConcept: "Formula dan Perhitungan Return on Equity (ROE)",
      },
      {
        questionText:
          "Sebuah emiten konsumer memiliki Total Ekuitas Rp 2 Triliun dan berhasil mencetak Laba Bersih Rp 400 Miliar dalam setahun. Berapakah nilai ROE emiten tersebut?",
        optionA: "5%",
        optionB: "10%",
        optionC: "20%",
        optionD: "40%",
        correctKey: "C",
        explanationText:
          "ROE = (Rp 400 Miliar / Rp 2.000 Miliar) × 100% = 0,20 × 100% = 20%.",
        indicatorConcept: "Aplikasi Numerik Rasio Profitabilitas ROE",
      },
      {
        questionText:
          "Apa arti jika sebuah perusahaan memiliki Net Profit Margin (NPM) sebesar 18%?",
        optionA: "Perusahaan membagikan 18% labanya sebagai dividen tunai",
        optionB: "Dari setiap Rp 100 pendapatan penjualan, perusahaan mengantongi laba bersih Rp 18",
        optionC: "Harga saham perusahaan naik 18% setiap bulan",
        optionD: "Rasio utang perusahaan adalah 18% dari aset",
        correctKey: "B",
        explanationText:
          "NPM 18% menunjukkan bahwa setiap Rp 100 pendapatan (revenue) yang masuk menghasilkan Rp 18 laba bersih setelah seluruh biaya dan pajak dibayarkan.",
        indicatorConcept: "Interpretasi Net Profit Margin (NPM)",
      },
    ],
  },
  {
    title: "Valuasi Saham & Risiko Solvabilitas: PER, PBV, dan DER",
    slug: "valuasi-per-pbv-dan-solvabilitas-der",
    level: "INTERMEDIATE",
    orderIndex: 2,
    estimatedMinutes: 8,
    isPublished: true,
    summary:
      "Menilai kewajaran harga saham menggunakan Price to Earnings Ratio (PER) dan Price to Book Value (PBV), serta mengaudit beban utang dengan Debt to Equity Ratio (DER).",
    contentBody: `## Mengapa Perusahaan Bagus Belum Tentu Saham Murah?
Perusahaan dengan profitabilitas tinggi bisa saja diperdagangkan pada harga yang sudah terlalu mahal (*overvalued*). Karena itu, kita memerlukan rasio **Valuasi** dan **Solvabilitas**.

### 1. Price to Earnings Ratio (PER)
Membandingkan harga pasar saham terhadap laba bersih per lembar saham (**EPS**):

\`\`\`
PER (x) = Harga Saham per Lembar / Earnings Per Share (EPS)
\`\`\`

### 2. Price to Book Value (PBV)
Membandingkan harga pasar saham terhadap nilai buku ekuitas per lembar saham (**BVPS**):

\`\`\`
PBV (x) = Harga Saham per Lembar / Nilai Buku per Lembar (BVPS)
\`\`\`

> **Catatan Sektor**: Pada sektor perbankan (BBCA, BBRI, BMRI), **PBV** menjadi indikator valuasi utama karena aset dan liabilitas bank tercatat mendekati nilai pasarnya.

### 3. Debt to Equity Ratio (DER)
Mengukur proporsi total liabilitas (utang) dibandingkan total ekuitas perusahaan:

\`\`\`
DER (x) = Total Liabilitas / Total Ekuitas
\`\`\`

Untuk perusahaan non-keuangan, **DER < 1,0x** umumnya dianggap konservatif dan sehat.`,
    quizzes: [
      {
        questionText:
          "Saham emiten A diperdagangkan pada harga Rp 3.000 per lembar dan memiliki Laba per Saham (EPS) tahunan sebesar Rp 250. Berapakah Price to Earnings Ratio (PER) saham tersebut?",
        optionA: "6x",
        optionB: "10x",
        optionC: "12x",
        optionD: "15x",
        correctKey: "C",
        explanationText:
          "PER = Harga Saham / EPS = Rp 3.000 / Rp 250 = 12 kali (12x).",
        indicatorConcept: "Perhitungan Valuasi Price to Earnings Ratio (PER)",
      },
      {
        questionText:
          "Rasio fundamental apakah yang mengukur perbandingan antara Total Utang (Liabilitas) terhadap Total Modal Sendiri (Ekuitas) perusahaan?",
        optionA: "Price to Book Value (PBV)",
        optionB: "Return on Assets (ROA)",
        optionC: "Debt to Equity Ratio (DER)",
        optionD: "Dividend Payout Ratio (DPR)",
        correctKey: "C",
        explanationText:
          "Debt to Equity Ratio (DER) membandingkan total liabilitas terhadap total ekuitas untuk menilai tingkat leverage atau risiko solvabilitas perusahaan.",
        indicatorConcept: "Evaluasi Risiko Utang dengan Debt to Equity Ratio (DER)",
      },
    ],
  },
  {
    title: "Manajemen Risiko Portofolio, Diversifikasi, dan Strategi DCA Realistis",
    slug: "manajemen-risiko-portofolio-dan-strategi-dca",
    level: "ADVANCED",
    orderIndex: 1,
    estimatedMinutes: 9,
    isPublished: true,
    summary:
      "Mengukur kesehatan portofolio melalui keseimbangan ROI dan volatilitas imbal hasil, prinsip diversifikasi lintas sektor, serta disiplin Dollar-Cost Averaging (DCA) berbasis lot.",
    contentBody: `## Mengapa Return Tinggi Saja Tidak Cukup?
Dalam manajemen portofolio modern, kinerja investasi wajib dievaluasi bersama **risiko fluktuasinya (volatilitas)**. Dua portofolio dengan ROI akhir yang sama dapat memiliki profil risiko yang sangat berbeda.

### 1. Return on Investment (ROI) & Volatilitas Imbal Hasil
- **ROI Portofolio**:
\`\`\`
ROI (%) = ((Nilai Akhir Portofolio Vt - Modal Awal V0) / Modal Awal V0) × 100%
\`\`\`
- **Volatilitas Periodik (s)**: Simpangan baku (*standard deviation*) dari imbal hasil periodik portofolio. Semakin rendah volatilitas pada return positif, semakin sehat stabilitas portofolio (**Portfolio Health Score**).

### 2. Diversifikasi Lintas Sektor
Jangan menempatkan seluruh modal pada satu emiten atau satu sektor saja. Kombinasikan sektor yang tidak berkorelasi penuh (misalnya Perbankan, Konsumer Primer, dan Infrastruktur Telekomunikasi).

### 3. Strategi Dollar-Cost Averaging (DCA) Mode Lot Realistis
Pada strategi **DCA**, investor menginvestasikan nominal dana tetap secara berkala (misal Rp 1.000.000 setiap bulan). Di BEI yang menerapkan aturan **1 lot = 100 lembar**, dana sisa yang belum mencukupi pembelian 1 lot penuh **diakumulasikan (cash rollover)** ke periode bulan berikutnya.`,
    quizzes: [
      {
        questionText:
          "Mengapa evaluasi kesehatan portofolio (Portfolio Health Score) perlu mengombinasikan metrik Return on Investment (ROI) dengan Volatilitas Imbal Hasil?",
        optionA: "Karena volatilitas tinggi selalu menjamin keuntungan bebas risiko",
        optionB: "Agar investor tidak hanya melihat besarnya keuntungan akhir, tetapi juga mengukur tingkat fluktuasi risiko untuk mencapai hasil tersebut",
        optionC: "Karena ROI tidak menggunakan satuan persentase",
        optionD: "Agar pajak dividen menjadi nol persen",
        correctKey: "B",
        explanationText:
          "Menggabungkan ROI dengan volatilitas membantu investor mengevaluasi apakah imbal hasil portofolio diperoleh secara stabil atau melalui fluktuasi risiko yang ekstrem.",
        indicatorConcept: "Hubungan Return (ROI) dan Risiko Volatilitas Portofolio",
      },
      {
        questionText:
          "Dalam simulasi Dollar-Cost Averaging (DCA) Realistic Lot Mode di BEI, apa yang terjadi apabila anggaran bulanan Rp 500.000 belum cukup untuk membeli 1 lot saham seharga Rp 8.850 per lembar (Rp 885.000 per lot)?",
        optionA: "Sistem tetap membeli 0,56 lot saham pecahan",
        optionB: "Dana Rp 500.000 hangus dan tidak dicatat",
        optionC: "Pembelian bulan tersebut adalah 0 lot dan dana Rp 500.000 disimpan (cash rollover) untuk digabungkan dengan anggaran bulan berikutnya",
        optionD: "Harga saham otomatis diturunkan menjadi Rp 5.000 per lembar",
        correctKey: "C",
        explanationText:
          "Karena perdagangan reguler BEI mewajibkan kelipatan bulat 1 lot (100 lembar), dana yang belum mencukupi 1 lot disimpan sebagai saldo kas rollover dan ditambahkan ke modal bulan berikutnya.",
        indicatorConcept: "Mekanisme Cash Rollover pada DCA Realistic Lot Mode",
      },
    ],
  },
];

async function main() {
  console.log("🌱 Memulai Seeding Basis Data...");

  // 1. Akun Pengguna Demo (Admin + Investor Pemula & Berpengalaman)
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const demoAdmin = await prisma.user.upsert({
    where: { email: "admin.investai@example.com" },
    update: {
      name: "Administrator Kurikulum InvestAI",
      role: "ADMIN",
    },
    create: {
      name: "Administrator Kurikulum InvestAI",
      email: "admin.investai@example.com",
      passwordHash,
      role: "ADMIN",
      investorProfile: "EXPERIENCED",
    },
  });

  const demoUserBeginner = await prisma.user.upsert({
    where: { email: "fayiz.pemula@example.com" },
    update: {
      role: "INVESTOR",
    },
    create: {
      name: "Fayiz Akbar (Pemula)",
      email: "fayiz.pemula@example.com",
      passwordHash,
      role: "INVESTOR",
      investorProfile: "BEGINNER",
    },
  });

  const demoUserExperienced = await prisma.user.upsert({
    where: { email: "fayiz.expert@example.com" },
    update: {
      role: "INVESTOR",
    },
    create: {
      name: "Fayiz Akbar (Berpengalaman)",
      email: "fayiz.expert@example.com",
      passwordHash,
      role: "INVESTOR",
      investorProfile: "EXPERIENCED",
    },
  });

  console.log(
    `✅ Demo Users siap: Admin (${demoAdmin.email}), Investor (${demoUserBeginner.email}, ${demoUserExperienced.email})`
  );

  // 2. Seeding 80 Emiten Indeks IDX80
  console.log(`⏳ Seeding ${IDX80_STOCKS.length} Emiten Konstituen Indeks IDX80...`);
  for (const stock of IDX80_STOCKS) {
    const logoUrl = stock.logoUrl || `https://assets.stockbit.com/logos/companies/${stock.symbol}.png`;
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: {
        companyName: stock.companyName,
        sector: stock.sector,
        industry: stock.industry,
        logoUrl: logoUrl,
        isIdx80: true,
      },
      create: {
        symbol: stock.symbol,
        companyName: stock.companyName,
        sector: stock.sector,
        industry: stock.industry,
        logoUrl: logoUrl,
        exchange: "IDX",
        isIdx80: true,
      },
    });
  }
  console.log(`✅ ${IDX80_STOCKS.length} Saham IDX80 berhasil dimasukkan ke tabel 'stocks'.`);

  // 3. Watchlist Awal Demo
  await prisma.watchlist.upsert({
    where: {
      userId_symbol: {
        userId: demoUserBeginner.id,
        symbol: "BBCA",
      },
    },
    update: {},
    create: {
      userId: demoUserBeginner.id,
      symbol: "BBCA",
    },
  });

  console.log("✅ Watchlist demo berhasil dibuat.");

  // 4. Seeding Modul Pembelajaran 3 Level & Bank Soal Kuis Evaluasi
  console.log("⏳ Seeding Kurikulum Modul Pembelajaran & Bank Soal Kuis...");
  let seededModulesCount = 0;
  let seededQuizzesCount = 0;

  for (const modData of INITIAL_LEARNING_MODULES) {
    const { quizzes, ...moduleFields } = modData;

    const savedModule = await prisma.learningModule.upsert({
      where: { slug: moduleFields.slug },
      update: {
        title: moduleFields.title,
        level: moduleFields.level,
        summary: moduleFields.summary,
        contentBody: moduleFields.contentBody,
        estimatedMinutes: moduleFields.estimatedMinutes,
        orderIndex: moduleFields.orderIndex,
        isPublished: moduleFields.isPublished,
      },
      create: moduleFields,
    });
    seededModulesCount += 1;

    const existingQuestions = await prisma.quizQuestion.count({
      where: { moduleId: savedModule.id },
    });

    if (existingQuestions === 0 && Array.isArray(quizzes) && quizzes.length > 0) {
      await prisma.quizQuestion.createMany({
        data: quizzes.map((q) => ({
          moduleId: savedModule.id,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctKey: q.correctKey,
          explanationText: q.explanationText,
          indicatorConcept: q.indicatorConcept,
        })),
      });
      seededQuizzesCount += quizzes.length;
    }
  }

  console.log(
    `✅ ${seededModulesCount} Modul Kurikulum dipastikan aktif (${seededQuizzesCount} butir soal kuis baru ditambahkan).`
  );
  console.log("🎉 Seeding Database Selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
