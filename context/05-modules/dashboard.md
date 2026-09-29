# MODULE: CENTRAL DASHBOARD

## Overview
Modul Dashboard merupakan pusat kendali antarmuka (*central command center*) aplikasi. Modul ini menyajikan ringkasan holistik aktivitas finansial pengguna—mencakup total nilai dan performa keuntungan portofolio, visualisasi alokasi aset/sektor, ringkasan daftar pantau (*watchlist*), kondisi pergerakan indeks IHSG & saham penggerak pasar (*top movers*), umpan berita terkini, serta akses pintas (*quick actions*) ke seluruh fitur utama.

---

## Objectives
1. Menyediakan tampilan ringkasan portofolio pengguna secara *glanceable* (nilai investasi, laba/rugi, return %).
2. Menyajikan visual alokasi aset per saham dan per sektor dalam bentuk diagram donat/pie.
3. Menampilkan status pasar IHSG hari ini dan daftar saham *top gainers/losers*.
4. Memberikan akses instan menuju fitur inti melalui kartu *Quick Actions*.

---

## Stakeholders
### Investor Pemula
Melihat perkembangan nilai investasinya secara sederhana, membaca berita pasar tanpa istilah rumit, dan mengakses materi pembelajaran melalui tombol aksi cepat.
### Investor Berpengalaman
Memonitor pergerakan pasar saham secara cepat saat pembukaan bursa, memantau alokasi aset untuk memastikan tidak melampaui toleransi risiko, dan memeriksa saham dalam watchlist.

---

## Functional Requirements
- **FR-DASH-001**: Dashboard harus menampilkan kartu ringkasan portofolio: Total Portfolio Value, Total Invested, Net Profit/Loss (Rupiah), dan Total Return (%).
- **FR-DASH-002**: Dashboard harus menampilkan diagram visual alokasi portofolio berdasarkan saham individual dan sektor industri.
- **FR-DASH-003**: Dashboard harus menampilkan widget ringkasan Watchlist (maksimal 5 saham teratas) dengan harga terkini dan persentase perubahan harian.
- **FR-DASH-004**: Dashboard harus menampilkan ringkasan Indeks Harga Saham Gabungan (IHSG), pergerakan bursa global (S&P 500, Nikkei 225), komoditas strategis (Minyak, Emas, Nikel, CPO), serta daftar top gainers dan top losers dari konstituen Indeks IDX80.
- **FR-DASH-005**: Dashboard harus menampilkan 3–5 berita pasar modal terkini dari tabel `news_cache` yang dilengkapi label badge sentimen (`[Positif]`, `[Netral]`, `[Negatif]`).
- **FR-DASH-006**: Dashboard harus menyediakan deretan tombol navigasi cepat berbentuk kapsul (*pill buttons* `rounded-full`): Cari Saham, Bandingkan Saham, Tambah Transaksi, Simulasi DCA, dan Mulai Belajar.
- **FR-DASH-007**: Apabila pengguna baru belum memiliki transaksi portofolio, sistem harus merender *onboarding empty state* yang ramah dengan panduan langkah pertama.

---

## Business Rules
- **BR-DASH-001**: Perhitungan portofolio pada dashboard dihitung secara dinamis dari transaksi aktif pengguna dan harga pasar quote terakhir.
- **BR-DASH-002**: Warna indikator finansial wajib konsisten: Hijau untuk nilai positif/keuntungan (`+`), Merah untuk nilai negatif/kerugian (`-`), dan Abu-abu untuk netral ($0\%$).
- **BR-DASH-003**: Data IHSG dan top movers diperbarui melalui caching dengan TTL 3–5 menit selama jam perdagangan bursa.

---

## Workflow
```text
User Access Dashboard (/dashboard)
           │
           ▼
Fetch Data Secara Paralel (Promise.all):
 ├── GET /api/portfolio (Summary, Holdings, Allocation)
 ├── GET /api/watchlist (Top 5 Watchlist Items)
 ├── GET /api/stocks/market-summary (IHSG & Top Movers)
 └── GET /api/stocks/news?limit=5 (Latest Market News)
           │
           ▼
Render Dashboard Grid (Responsive Tailwind Cards):
 ├── [Top Header]: IHSG Ticker & Market Status
 ├── [Row 1]: 4 Metrik Kartu Portofolio (Value, Invested, P/L, Return %)
 ├── [Row 2]: Diagram Alokasi Portofolio (Kiri) + Watchlist Widget (Kanan)
 ├── [Row 3]: Top Movers (Gainers/Losers) + Feed Berita Terkini
 └── [Bottom]: Quick Action Grid (5 Navigasi Pintas)
```

---

## Database Design
Modul ini memanfaatkan data agregasi dari beberapa tabel:
- `portfolio_transactions` & `stocks`: Untuk agregasi nilai dan sektor portofolio.
- `watchlists` & `stocks`: Untuk preview saham yang dipantau.
- `api_cache` (`data_type = 'market_summary'`): Untuk pergerakan IHSG dan top movers.
- `news_cache`: Untuk umpan berita finansial terkini.

---

## Backend Design
- **Services**:
  - `PortfolioService.js`: `getPortfolioSummary(userId)`.
  - `WatchlistService.js`: `getUserWatchlist(userId, limit = 5)`.
  - `MarketDataService.js`: `getMarketSummary()`.
  - `NewsService.js`: `getLatestNews(limit = 5)`.
- **Controller**: `DashboardController.js` mengagregasikan respon atau menyediakan endpoint terpisah untuk asynchronous widget loading.

---

## API Endpoints

### Endpoint List
| Method | Path | Purpose | Authorization | Request Body | Response Status |
|--------|------|---------|---------------|--------------|-----------------|
| `GET` | `/api/portfolio` | Ringkasan portofolio & alokasi | Bearer JWT | None | `200 OK` |
| `GET` | `/api/watchlist` | Daftar pantau saham user | Bearer JWT | None | `200 OK` |
| `GET` | `/api/stocks/market-summary`| Status IHSG & Top Movers | Public | None | `200 OK` |
| `GET` | `/api/stocks/news` | Berita pasar modal terbaru | Public | None | `200 OK` |

### Sample JSON Response (`GET /api/stocks/market-summary`)
```json
{
  "success": true,
  "message": "Market summary berhasil diambil",
  "data": {
    "ihsg": {
      "index_value": 7720.45,
      "change": 45.20,
      "change_percent": 0.59,
      "status": "OPEN",
      "updated_at": "2026-09-05T08:30:00Z"
    },
    "top_gainers": [
      { "symbol": "BRIS", "price": 2950, "change_percent": 6.88 },
      { "symbol": "BBCA", "price": 8850, "change_percent": 1.43 }
    ],
    "top_losers": [
      { "symbol": "GOTO", "price": 52, "change_percent": -3.70 }
    ]
  }
}
```

---

## Frontend Design
- **Pages**: `DashboardPage.jsx` (`/dashboard`).
- **Components**:
  - `PortfolioMetricsRow.jsx`: 4 kartu metrik utama (Total Nilai, Modal, P/L, Return).
  - `AllocationPieChart.jsx`: Diagram donat interaktif alokasi aset & sektor.
  - `WatchlistMiniWidget.jsx`: Tabel mini harga saham pantauan dengan link ke detail.
  - `MarketOverviewCard.jsx`: Badge pergerakan IHSG dan tab Gainers/Losers.
  - `LatestNewsFeed.jsx`: Kartu daftar artikel berita dengan thumbnail dan link eksternal.
  - `QuickActionsGrid.jsx`: 5 kartu navigasi aksi dengan ikon intuitif.
  - `EmptyPortfolioBanner.jsx`: Banner sambutan untuk user baru ("Mulai catat transaksi pertamamu atau lakukan simulasi DCA").

---

## UI / UX Requirements
- Desain *SwiftBook Neo-Fintech Aesthetic*: Dukungan penuh Dual-Theme (Light & Dark Mode) dengan pembalikan kontras terbalik: kanvas `#F8F8F8` (Light) / `#0D0D0D` (Dark), kartu `#FFFFFF` / `#161616` (`rounded-2xl`), tombol dan tag berbentuk kapsul (*pill buttons* `rounded-full`), aksen hijau limau segar `#74AE2D`, kontainer AI sage `#D6E3C0`, dan aksen warm peach `#F2D6A4`.
- Transisi data halus (*micro-animation*) saat memuat komponen grafik dan pergantian tema gelap/terang.
- Skeleton loader untuk setiap widget selama proses data fetching.

---

## Testing Scenarios
### Unit Test
- Kalkulasi total nilai portofolio dan net return persentase dari berbagai kombinasi holding.
### Integration Test
- Verifikasi pemanggilan data paralel saat halaman dimuat.
- Penanganan jika salah satu widget (misal: news feed) gagal memuat tanpa menggagalkan widget portofolio.

---

## AI Agent Instructions
- **Frontend Agent**: Susun layout menggunakan CSS Grid responsif (1 kolom di mobile, 2 kolom di tablet, 3/4 kolom di desktop). Gunakan skeleton placeholder saat asynchronous loading.
- **Backend Agent**: Pastikan kueri agregasi portofolio dioptimalkan dengan kueri Prisma terindeks agar waktu muat dashboard tetap di bawah 1 detik.
