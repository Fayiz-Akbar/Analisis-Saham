# MODULE: STOCK DETAIL ANALYSIS

## Overview
Modul Stock Detail Analysis merupakan halaman riset inti (*core analysis workspace*) pada aplikasi. Halaman ini menyatukan profil korporasi emiten, harga terkini (*live quote*), grafik candlestick interaktif berbasis **TradingView Lightweight Charts**, indikator 4 pilar fundamental keuangan komprehensif, kurasi berita spesifik emiten, serta **AI Stock Analysis Assistant** yang mampu menjawab pertanyaan analitis pengguna secara kontekstual dan faktual.

---

## Objectives
1. Menyediakan tampilan menyeluruh mengenai profil dan kesehatan keuangan emiten tertentu dalam satu halaman terpadu.
2. Memvisualisasikan pergerakan harga historis dan volume perdagangan menggunakan grafik candlestick interaktif dengan pilihan timeframe yang fleksibel.
3. Menampilkan indikator fundamental 4 pilar (Valuasi, Profitabilitas, Pertumbuhan, dan Solvabilitas/Leverage) dengan kartu metrik yang jelas dan terstruktur.
4. Menyediakan antarmuka **AI Stock Analysis Assistant** yang di-grounded pada data emiten terkait untuk membantu sintesis data tanpa halusinasi.
5. Menyediakan tombol aksi cepat: Tambah ke Watchlist, Catat Transaksi ke Portofolio, atau Bandingkan dengan Emiten Lain.

---

## Stakeholders
### Investor Pemula
Melihat grafik harga dengan jelas, memahami arti angka rasio melalui indikator visual dan bantuan penjelasan AI Tutor/Assistant dalam bahasa sederhana.
### Investor Berpengalaman
Menganalisis kinerja historis emiten, memeriksa tren pertumbuhan laba dan pendapatan, mengevaluasi valuasi terhadap fundamental, dan membaca berita korporasi terkini sebelum mengambil keputusan investasi mandiri.

---

## Functional Requirements
- **FR-DTL-001**: Sistem harus menyajikan profil perusahaan: Simbol Ticker, Nama Resmi Emiten, Sektor, Industri, dan Deskripsi Singkat.
- **FR-DTL-002**: Sistem harus menyajikan quote harga terkini: Harga Terakhir, Perubahan Poin, Perubahan Persentase (%), Rentang Harga Harian (Open, High, Low), Volume, dan Nilai Transaksi.
- **FR-DTL-003**: Sistem harus merender grafik candlestick interaktif (TradingView Lightweight Charts) dengan selector timeframe: `1D`, `1W`, `1M`, `3M`, `1Y`, `3Y`, `ALL`.
- **FR-DTL-004**: Sistem harus menyajikan kartu indikator 4 pilar fundamental:
  - **Valuasi**: Price-to-Earnings (PE Ratio), Price-to-Book Value (PBV).
  - **Profitabilitas**: Return on Equity (ROE), Return on Assets (ROA), Net Profit Margin (NPM).
  - **Pertumbuhan (Growth)**: Pertumbuhan Pendapatan Tahunan (*Revenue Growth*), Pertumbuhan Laba Bersih (*Net Income Growth*).
  - **Solvabilitas / Leverage**: Debt-to-Equity Ratio (DER).
  - **Kinerja Absolut**: Pendapatan Bersih (Revenue), Laba Bersih (Net Income), Earning Per Share (EPS), Kapitalisasi Pasar (Market Cap), dan Dividen Yield.
- **FR-DTL-005**: Sistem harus menampilkan daftar 3–5 berita terkini yang secara spesifik menyebutkan simbol emiten terkait.
- **FR-DTL-006**: Sistem harus menyediakan komponen chat/dialog **AI Stock Analysis Assistant** yang memungkinkan pengguna mengajukan pertanyaan analitis mengenai emiten tersebut.
- **FR-DTL-007**: Sistem harus menyediakan tombol aksi: "Tambah ke Watchlist", "Tambah ke Portofolio" (membuka modal input transaksi), dan "Bandingkan" (mengalihkan ke halaman komparasi dengan emiten terkait terpilih).

---

## Business Rules
- **BR-DTL-001**: Simbol ticker emiten pada URL harus berupa huruf kapital 4–6 karakter alfabet (contoh: `/saham/BBCA`).
- **BR-DTL-002**: Jika simbol emiten tidak ditemukan di database atau API provider, sistem harus mengembalikan halaman 404 Stock Not Found yang ramah dengan saran pencarian.
- **BR-DTL-003**: Respon AI Assistant pada halaman detail saham wajib dibatasi konteksnya hanya pada: (1) Data quote emiten, (2) Rasio dan angka keuangan emiten, dan (3) Berita emiten terkini yang terdaftar di sistem. Dilarang mengutip angka di luar context.
- **BR-DTL-004**: Data quote dan berita di-cache dengan TTL dinamis (Quote 1–3 menit, Fundamental 7 hari, Berita 30 menit).

---

## Workflow
```text
User Navigates to /saham/:symbol (misal: /saham/BBCA)
           │
           ▼
Parallel Fetch Data ke Backend:
 ├── GET /api/stocks/BBCA (Profile & Quote)
 ├── GET /api/stocks/BBCA/history?timeframe=1Y (Candlestick Data)
 ├── GET /api/stocks/BBCA/fundamentals (4 Pillars Ratios)
 └── GET /api/stocks/BBCA/news (Specific News Feed)
           │
           ▼
Render UI Halaman Detail:
 ├── [Header]: Symbol, Name, Price, Change Badge, Action Buttons (Watchlist, Portfolio, Compare)
 ├── [Main Left]: Interactive Candlestick Chart (Lightweight Charts)
 ├── [Main Right]: 4-Pillar Fundamental Metric Cards & Highlights
 ├── [Section 2]: AI Stock Analysis Assistant (Chat / Insight Summary)
 └── [Bottom]: Relevant Company News List
           │
           ▼
User Asks Question to AI: "Bagaimana kondisi rasio profitabilitas BBCA?"
           │
           ▼
POST /api/ai/stock-analysis { symbol: "BBCA", question: "..." }
           │
           ▼
ContextBuilder menyusun JSON Faktual BBCA ──> Gemini API ──> Render Respon Terstruktur
```

---

## Database Design
- Mengambil data dari tabel `stocks` (`symbol`, `company_name`, `sector`, `industry`).
- Memeriksa status `watchlists` untuk menandai apakah saham sudah dipantau user (`is_in_watchlist: true/false`).
- Mengambil data cache dari `api_cache` dan `news_cache`.

---

## Backend Design
- **Services**:
  - `MarketDataService.js`: `getStockProfile(symbol)`, `getStockQuote(symbol)`, `getHistoricalCandles(symbol, timeframe)`.
  - `FundamentalService.js`: `getStockFundamentals(symbol)`.
  - `NewsService.js`: `getStockNews(symbol)`.
  - `AIService.js` + `ContextBuilder.js`: `generateStockAnalysis(symbol, question)`.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request / Params | Response Status |
|--------|------|---------|---------------|------------------|-----------------|
| `GET` | `/api/stocks/:symbol` | Data profil & quote emiten | Public | Path: `symbol` | `200 OK` |
| `GET` | `/api/stocks/:symbol/history` | Data candlestick historis | Public | Query: `timeframe` | `200 OK` |
| `GET` | `/api/stocks/:symbol/fundamentals` | Rasio 4 pilar lengkap | Public | Path: `symbol` | `200 OK` |
| `GET` | `/api/stocks/:symbol/news` | Berita terkait emiten | Public | Query: `limit` | `200 OK` |
| `POST` | `/api/ai/stock-analysis` | Analisis AI grounded emiten | Bearer JWT | `{ symbol, question }` | `200 OK` |

### Sample JSON Response (`POST /api/ai/stock-analysis`)
```json
{
  "success": true,
  "message": "Analisis AI saham berhasil diproses",
  "data": {
    "symbol": "BBCA",
    "analysis": "Berdasarkan data yang tersedia, PT Bank Central Asia Tbk (BBCA) menunjukkan kinerja profitabilitas yang sangat solid dengan Return on Equity (ROE) sebesar 23,4% dan Net Profit Margin mencapai 45,2%. Dari sisi valuasi, BBCA diperdagangkan pada PE Ratio 18,5x dan PBV 4,2x, yang mencerminkan premi valuasi tipikal untuk pemimpin industri dengan rasio utang (DER) yang terkendali di level 0,15.",
    "key_metrics_discussed": ["ROE", "Net Profit Margin", "PE Ratio", "PBV", "DER"],
    "disclaimer": "Analisis ini dihasilkan secara otomatis oleh AI berdasarkan data keuangan faktual terkini untuk tujuan edukasi dan bukan merupakan rekomendasi beli atau jual saham."
  }
}
```

---

## Frontend Design
- **Pages**: `StockDetailPage.jsx` (`/saham/:symbol`).
- **Components**:
  - `StockHeader.jsx`: Simbol ticker besar, nama perusahaan, badge sektor, harga live, tombol aksi Watchlist & Portfolio Modal.
  - `CandlestickChart.jsx`: Pembungkus TradingView Lightweight Charts dengan selector rentang waktu (1W, 1M, 1Y).
  - `FundamentalCard.jsx`: Kartu rasio interaktif dengan label, nilai numerik, dan status evaluasi (misal: "ROE Tinggi", "DER Rendah").
  - `AiAnalysisAssistantWidget.jsx`: Kotak asisten AI dengan prompt saran cepat (*quick prompt chips*) dan area obrolan teks.
  - `AddTransactionModal.jsx`: Modal pop-up untuk mencatat pembelian saham langsung ke portofolio.

---

## Testing Scenarios
### Unit Test
- Validasi parsing timeframe grafik candlestick menjadi rentang timestamp UNIX yang benar.
- Pengujian formatting mata uang Rupiah dan rasio desimal.
### Integration Test
- Pengambilan endpoint detail saham untuk ticker valid (misal: `BBCA`) dan ticker tidak terdaftar (mengembalikan 404).
- Uji konsistensi data faktual respon AI terhadap payload data yang dikirimkan.

---

## AI Agent Instructions
- **Frontend Agent**: Pastikan instance grafik `TradingView Lightweight Charts` dibersihkan (*clean up on unmount*) menggunakan `chart.remove()` di dalam hook `useEffect` untuk menghindari kebocoran memori browser (*memory leak*).
- **AI Agent**: Selalu sertakan konteks data fundamental dan quote saat memanggil Gemini API untuk modul ini. Dilarang mengizinkan AI menjawab tanpa payload konteks yang valid.
