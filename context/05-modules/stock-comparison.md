# MODULE: STOCK COMPARISON (PEER COMPARISON)

## Overview
Modul Stock Comparison memungkinkan pengguna memilih dan membandingkan **2 hingga 4 emiten saham sekaligus** secara berdampingan (*side-by-side*). Fitur ini dirancang khusus untuk memecahkan masalah inefisiensi komparasi manual multi-emiten sejenis (kompetitor industri) yang selama ini dialami investor ritel berpengalaman. Sistem menyajikan perbandingan metrik komparatif terstruktur, visualisasi grafis komparasi batang/garis, serta **AI Comparison Assistant** yang mensintesis keunggulan dan kelemahan fundamental masing-masing emiten secara objektif.

---

## Objectives
1. Menyediakan antarmuka pemilihan multi-saham yang fleksibel (2–4 saham IDX).
2. Menyajikan tabel komparasi berdampingan lintas kategori: Harga & Market Cap, Valuasi, Profitabilitas, Pertumbuhan, Solvabilitas/Leverage, Dividen, dan Performa Historis.
3. Memvisualisasikan perbandingan metrik kunci menggunakan grafik batang horizontal (*bar charts*) dan grafik pergerakan harga relatif (*normalized price performance chart*).
4. Menyediakan **AI Comparison Assistant** yang membandingkan perbedaan fundamental secara objektif tanpa memberikan rekomendasi beli/jual otomatis.

---

## Stakeholders
### Investor Berpengalaman
Membandingkan para pemain utama dalam satu sektor industri (misal: BBCA vs BBRI vs BMRI vs BBNI di sektor perbankan, atau ASII vs AUTO di sektor otomotif) untuk mengevaluasi valuasi relatif (*relative valuation*) dan efisiensi modal.
### Investor Pemula
Mempelajari perbedaan profil risiko dan imbal hasil antara saham berkapitalisasi besar (*blue chip*) dengan saham menengah melalui visualisasi grafis yang mudah dipahami.

---

## Functional Requirements
- **FR-CMP-001**: Pengguna dapat mencari dan menambahkan 2 hingga 4 simbol emiten saham ke dalam ruang komparasi.
- **FR-CMP-002**: Sistem harus memvalidasi agar jumlah saham yang dibandingkan minimal 2 dan maksimal 4 saham.
- **FR-CMP-003**: Sistem harus menyajikan tabel komparasi berdampingan mencakup:
  - **Profil & Pasar**: Sektor, Industri, Harga Terkini, Perubahan Harian (%), Market Cap.
  - **Valuasi**: PE Ratio, PBV Ratio.
  - **Profitabilitas**: ROE (%), ROA (%), Net Profit Margin (%).
  - **Pertumbuhan**: Pertumbuhan Pendapatan Tahunan (%), Pertumbuhan Laba Bersih (%).
  - **Solvabilitas / Utang**: Debt-to-Equity Ratio (DER).
  - **Dividen**: Dividend Yield (%).
  - **Kinerja Absolut**: Pendapatan Bersih (Revenue), Laba Bersih (Net Income), EPS.
- **FR-CMP-004**: Sistem harus menyediakan visualisasi komparatif grafis:
  - Diagram batang horizontal perbandingan metrik utama (misal: perbandingan ROE atau PE).
  - Grafik garis normalisasi pergerakan harga historis (persentase gain/loss dari titik awal yang sama dalam rentang 1 bulan, 6 bulan, atau 1 tahun).
- **FR-CMP-005**: Sistem harus menyediakan endpoint dan komponen **AI Comparison Assistant** (`POST /api/ai/stock-comparison`) untuk menghasilkan analisis perbandingan naratif berdasarkan data yang dikirimkan.
- **FR-CMP-006**: AI Comparison Assistant harus mengelompokkan analisis berdasarkan pilar: Valuasi, Profitabilitas, Pertumbuhan, Risiko Solvabilitas, dan Faktor yang Perlu Diperhatikan.

---

## Business Rules
- **BR-CMP-001**: Sistem menolak eksekusi komparasi jika jumlah saham yang dipilih kurang dari 2 atau lebih dari 4 saham.
- **BR-CMP-002**: Emiten yang dibandingkan tidak boleh memiliki simbol duplikat.
- **BR-CMP-003**: AI Comparison Assistant dilarang keras memilih satu pemenang absolut ("Saham terbaik adalah BBCA, segera beli"). AI wajib menyajikan perbandingan komparatif objektif ("BBCA unggul dari sisi profitabilitas ROE, namun BBRI menawarkan dividend yield yang lebih tinggi dan valuasi PE yang lebih rendah").
- **BR-CMP-004**: Seluruh data perbandingan harus bersumber dari titik waktu atau periode laporan keuangan yang konsisten.

---

## Workflow
```text
User Navigates to /compare
          │
          ▼
User Selects 2-4 Stocks (misal: BBCA, BBRI, BMRI)
          │
          ▼
POST /api/stocks/compare { "symbols": ["BBCA", "BBRI", "BMRI"] }
          │
          ▼
Backend StockComparisonService:
 ├── Fetch Quote & Fundamentals untuk setiap Ticker (Parallel via Cache)
 ├── Normalisasi Satuan & Alignment Matriks
 └── Generate Matriks Komparatif Terstruktur
          │
          ▼
Frontend Merender Halaman Komparasi:
 ├── Multi-column Comparison Table (Side-by-Side)
 ├── Interactive Metric Comparison Bar Charts (ROE, PE, PBV)
 ├── Normalized Historical Performance Line Chart
 └── AI Comparison Assistant Panel
          │
          ▼
User Clicks "Minta Sintesis Komparasi AI"
          │
          ▼
POST /api/ai/stock-comparison { "symbols": ["BBCA", "BBRI", "BMRI"] }
          │
          ▼
Gemini API Mensintesis Matriks Komparasi ──> Tampilkan Analisis Komparatif Grounded
```

---

## Database Design
Modul ini memanfaatkan data gabungan dari:
- `stocks`: Master identitas emiten.
- `api_cache`: Cache quote dan rasio fundamental masing-masing emiten terpilih.

---

## Backend Design
- **Services**:
  - `StockComparisonService.js`: `getComparisonMatrix(symbols)` mengambil data quote dan rasio untuk setiap simbol secara konkuren, lalu memformat matriks komparasi.
  - `AIService.js` + `ContextBuilder.js`: `generateComparisonAnalysis(symbols)` mengonstruksi payload multi-saham ke dalam format teks deskriptif untuk Gemini API.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `POST` | `/api/stocks/compare` | Ambil matriks komparasi 2–4 saham | Public / Bearer | `{ "symbols": ["BBCA", "BBRI", "BMRI"] }` | `200 OK` |
| `POST` | `/api/ai/stock-comparison` | Analisis komparatif naratif AI | Bearer JWT | `{ "symbols": ["BBCA", "BBRI", "BMRI"] }` | `200 OK` |

### Sample JSON Response (`POST /api/stocks/compare`)
```json
{
  "success": true,
  "message": "Data komparasi berhasil dimuat",
  "data": {
    "symbols": ["BBCA", "BBRI"],
    "metrics": {
      "company_name": { "BBCA": "PT Bank Central Asia Tbk", "BBRI": "PT Bank Rakyat Indonesia Tbk" },
      "sector": { "BBCA": "Financials", "BBRI": "Financials" },
      "price": { "BBCA": 8850, "BBRI": 4950 },
      "market_cap": { "BBCA": 1090000000000000, "BBRI": 750000000000000 },
      "pe_ratio": { "BBCA": 18.5, "BBRI": 12.8 },
      "pbv_ratio": { "BBCA": 4.2, "BBRI": 2.3 },
      "roe": { "BBCA": 23.4, "BBRI": 21.2 },
      "roa": { "BBCA": 3.2, "BBRI": 2.8 },
      "der": { "BBCA": 0.15, "BBRI": 0.22 },
      "dividend_yield": { "BBCA": 2.1, "BBRI": 4.5 }
    }
  }
}
```

### Sample JSON Response (`POST /api/ai/stock-comparison`)
```json
{
  "success": true,
  "message": "Sintesis perbandingan AI berhasil diproses",
  "data": {
    "summary": "Perbandingan antara BBCA dan BBRI menunjukkan dua profil investasi perbankan yang berbeda namun sama-sama solid.",
    "pillars": {
      "valuation": "BBRI diperdagangkan pada valuasi yang lebih menarik dengan PE 12,8x dan PBV 2,3x dibandingkan BBCA yang memiliki valuasi premium di PE 18,5x dan PBV 4,2x.",
      "profitability": "Kedua bank mencatatkan profitabilitas tinggi, di mana BBCA sedikit memimpin dengan ROE 23,4% dibandingkan BBRI di 21,2%.",
      "leverage_and_risk": "BBCA memiliki rasio solvabilitas utang (DER) yang lebih konservatif di level 0,15 dibandingkan BBRI di 0,22.",
      "dividend": "Bagi investor yang berfokus pada pendapatan pasif, BBRI menawarkan dividend yield historis yang lebih tinggi (4,5%) dibandingkan BBCA (2,1%)."
    },
    "key_takeaways": [
      "BBCA menonjol pada efisiensi modal dan premi valuasi stabilitas.",
      "BBRI menawarkan valuasi relatif lebih rendah dengan imbal hasil dividen lebih besar."
    ],
    "disclaimer": "Analisis komparasi ini disusun secara objektif oleh AI untuk tujuan riset edukatif dan tidak memuat rekomendasi transaksi."
  }
}
```

---

## Frontend Design
- **Pages**: `StockComparisonPage.jsx` (`/compare`).
- **Components**:
  - `StockSelectorBar.jsx`: Input autocomplete untuk memilih hingga 4 saham dengan tag yang dapat dihapus (*removable chips*).
  - `ComparisonSideBySideTable.jsx`: Tabel kolom responsif dengan pembeda warna nilai terbaik di setiap baris (*best value badge*).
  - `MetricComparisonBarChart.jsx`: Visual bar chart perbandingan metrik (misal: perbandingan visual bar ROE).
  - `NormalizedHistoryChart.jsx`: Grafik pergerakan harga relatif dari basis 0%.
  - `AiComparisonAssistantPanel.jsx`: Panel kartu sintesis perbandingan naratif AI.

---

## Testing Scenarios
### Unit Test
- Validasi input symbols: Menolak 1 simbol atau lebih dari 4 simbol.
- Kalkulasi normalisasi grafik harga relatif dari titik awal.
### Integration Test
- Eksekusi `POST /api/stocks/compare` dengan 3 simbol valid.
- Verifikasi konsistensi faktual AI Comparison Assistant terhadap matriks data.

---

## AI Agent Instructions
- **Frontend Agent**: Jika pengguna mengakses halaman `/compare?symbols=BBCA,BBRI` melalui URL query parameter, otomatis inisialisasi ruang komparasi dengan simbol-simbol tersebut.
- **Backend Agent**: Pastikan pemanggilan data quote dan fundamental ke tabel cache dilakukan secara paralel menggunakan `Promise.all` agar latency tetap rendah.
