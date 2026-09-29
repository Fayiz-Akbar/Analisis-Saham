# MODULE: STOCK SCREENER

## Overview
Modul Stock Screener menyediakan fitur penyaringan dan pencarian emiten saham Bursa Efek Indonesia (IDX) berdasarkan kombinasi parameter fundamental, valuasi, profitabilitas, struktur utang, dan indeks pasar modal. Modul ini menjadi instrumen efisiensi riset utama bagi investor ritel berpengalaman untuk menemukan peluang investasi yang memenuhi kriteria spesifik secara instan.

---

## Objectives
1. Memungkinkan pengguna menyaring puluhan saham terlikuid IDX (katalog utama 80 konstituen Indeks IDX80) berdasarkan rentang rasio fundamental kuantitatif.
2. Menyediakan preset filter untuk indeks populer bursa Indonesia (Indeks IDX80 sebagai basis utama, LQ45, dan IDX30).
3. Menyajikan hasil penyaringan dalam bentuk tabel interaktif dengan fitur sorting, pagination, dan aksi cepat (*Add to Watchlist*, *Open Detail*, *Compare*).

---

## Stakeholders
### Investor Berpengalaman
Menggunakan multi-filter rasio keuangan (misal: mencari saham konstituen IDX80 sektor Perbankan dengan ROE > 15% dan PE < 15) untuk mempercepat proses pemilihan saham secara terarah (*stock picking*).
### Investor Pemula
Menggunakan preset filter siap pakai (misal: "Indeks IDX80", "Indeks LQ45", atau "Saham Dividen Tinggi") untuk mengeksplorasi emiten berfundamental kuat tanpa harus mengatur rumus teknis dari awal.

---

## Functional Requirements
- **FR-SCR-001**: Sistem harus menyediakan form filter multi-parameter mencakup:
  - Sektor (Financials, Consumer Non-Cyclicals, Energy, Basic Materials, dll.).
  - Kapitalisasi Pasar (*Market Cap* minimum & maksimum).
  - Price-to-Earnings Ratio (PE Ratio min/max).
  - Price-to-Book Value (PBV min/max).
  - Return on Equity (ROE min %).
  - Return on Assets (ROA min %).
  - Debt-to-Equity Ratio (DER max).
  - Dividend Yield (min %).
- **FR-SCR-002**: Sistem harus menyediakan tombol filter cepat (*Index Presets*): "IDX80" (basis utama), "LQ45", dan "IDX30".
- **FR-SCR-003**: Sistem harus menampilkan hasil penyaringan dalam tabel data dengan kolom: Simbol Ticker, Nama Perusahaan, Sektor, Harga Terkini, Perubahan Harian (%), Market Cap, PE, PBV, ROE, DER, Dividend Yield.
- **FR-SCR-004**: Tabel hasil harus mendukung pengurutan kolom (*column sorting*) asc/desc pada setiap metrik numerik.
- **FR-SCR-005**: Setiap baris tabel harus menyediakan aksi cepat: tombol "Lihat Detail", "Tambah ke Watchlist", dan checkbox seleksi untuk fitur "Bandingkan Saham" (langsung dialihkan ke `/compare`).
- **FR-SCR-006**: Sistem harus mendukung paginasi hasil penyaringan (20 emiten per halaman).

---

## Business Rules
- **BR-SCR-001**: Parameter filter yang dikosongkan tidak akan membatasi kueri (diabaikan).
- **BR-SCR-002**: Rasio dengan nilai negatif (misal emiten merugi dengan PE negatif) harus ditampilkan dengan label "N/A" atau nilai aktual dengan penanda visual khusus agar tidak membingungkan pengguna.
- **BR-SCR-003**: Kueri penyaringan di sisi backend harus dioptimalkan dengan indeks database pada kolom sektor dan metrik fundamental ter-cache.

---

## Workflow
```text
User Access /screener
          │
          ├── Memilih Preset (misal: "IDX80", "LQ45" atau "ROE > 15%")
          └── ATAU Mengatur Slider / Input Filter Parameter
          │
          ▼
Debounced Request ke GET /api/stocks/screener?...
          │
          ▼
Backend FundamentalService & MarketDataService
  ├── Query Tabel `stocks` & Join Data Fundamental Ter-Cache
  ├── Filter sesuai Batasan Min/Max Parameter
  └── Sort & Paginate (LIMIT 20 OFFSET ...)
          │
          ▼
Return Paginated JSON Response
          │
          ▼
Render Hasil Screener di Grid Tabel Interaktif
          │
          ├── User Klik Baris ──────> Navigasi ke /saham/:symbol
          ├── User Centang 2-4 Baris -> Klik "Bandingkan" -> Navigasi ke /compare
          └── User Klik "Watchlist" ─> POST /api/watchlist
```

---

## Database Design
Modul ini memanfaatkan:
- Tabel `stocks`: `symbol`, `company_name`, `sector`, `industry`.
- Tabel `api_cache`: Untuk data rasio fundamental (PE, PBV, ROE, ROA, DER, Dividend Yield, Market Cap) dan quote harga terkini.

---

## Backend Design
- **Services**:
  - `FundamentalService.js`: `filterStocksByMetrics(filters, pagination)`.
  - `MarketDataService.js`: Menggabungkan harga terkini ke dalam entri hasil filter.
- **Query Optimizer**: Menggunakan memori cache terindeks atau tabel terdenormalisasi sementara untuk kueri perbandingan rentang numerik multi-kolom yang cepat.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Query Parameters | Response Status |
|--------|------|---------|---------------|------------------|-----------------|
| `GET` | `/api/stocks/screener` | Menyaring saham berdasarkan kriteria | Public | `sector, min_roe, max_pe, max_pbv, max_der, min_market_cap, index, page, limit, sort_by, sort_order` | `200 OK` |

### Sample JSON Request URL:
`GET /api/stocks/screener?sector=Financials&min_roe=15&max_pe=20&page=1&limit=2`

### Sample JSON Response:
```json
{
  "success": true,
  "message": "Hasil penyaringan saham berhasil ditemukan",
  "data": [
    {
      "symbol": "BBCA",
      "company_name": "PT Bank Central Asia Tbk",
      "sector": "Financials",
      "price": 8850,
      "change_percent": 1.43,
      "market_cap": 1090000000000000,
      "pe_ratio": 18.5,
      "pbv_ratio": 4.2,
      "roe": 23.4,
      "der": 0.15,
      "dividend_yield": 2.1
    },
    {
      "symbol": "BBRI",
      "company_name": "PT Bank Rakyat Indonesia (Persero) Tbk",
      "sector": "Financials",
      "price": 4950,
      "change_percent": 0.81,
      "market_cap": 750000000000000,
      "pe_ratio": 12.8,
      "pbv_ratio": 2.3,
      "roe": 21.2,
      "der": 0.22,
      "dividend_yield": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total_records": 8,
    "total_pages": 4
  }
}
```

---

## Frontend Design
- **Pages**: `StockScreenerPage.jsx` (`/screener`).
- **Components**:
  - `ScreenerFilterPanel.jsx`: Panel sidebar/accordion berisi slider rentang metrik, dropdown sektor, dan preset tombol (IDX80, LQ45, Undervalued, High Growth).
  - `ScreenerTable.jsx`: Tabel responsif dengan sticky header, penanda sorting kolom, dan format angka Rupiah/persentase.
  - `ComparisonFloatingBar.jsx`: Bar melayang di bawah layar yang muncul saat pengguna mencentang 2–4 saham dengan tombol "Bandingkan Sekarang".
  - `PaginationControls.jsx`: Navigasi halaman tabel (Previous, Page Numbers, Next).

---

## UI / UX Requirements
- Filter panel yang dapat diciutkan (*collapsible*) untuk memberikan ruang maksimal pada tabel di layar monitor yang lebih kecil.
- *Debounce* input 400ms agar request API tidak ditembakkan pada setiap ketikan karakter atau pergeseran slider.
- State kosong informatif (*"Tidak ada emiten yang memenuhi kriteria filter Anda. Coba longgarkan rentang batas."*).

---

## AI Agent Instructions
- **Frontend Agent**: Pasang fitur checkbox multi-select dengan batasan maksimal 4 saham untuk mencegah pengguna memilih terlalu banyak saham saat ingin dialihkan ke fitur perbandingan.
- **Backend Agent**: Pastikan kueri SQL menggunakan parameter sanitasi Zod untuk mencegah eksploitasi injeksi parameter kueri dinamis.
