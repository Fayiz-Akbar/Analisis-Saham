# Standar & Konvensi Pengembangan: AI-Powered Fundamental Investment Analyzer

## 1. Naming Conventions

### 1.1 Files & Folders
- **Folder Backend**: `kebab-case` atau `lowercase` (contoh: `controllers/`, `services/`, `middlewares/`, `utils/`).
- **File Backend**: `camelCase.js` atau `camelCase.ts` (contoh: `authService.js`, `marketDataService.js`, `jwtHelper.js`).
- **File Routes**: `[module]Routes.js` (contoh: `stockRoutes.js`, `portfolioRoutes.js`, `aiRoutes.js`).
- **Folder Frontend**: `kebab-case` (contoh: `components/`, `pages/`, `hooks/`, `services/`).
- **File Komponen React**: `PascalCase.jsx` atau `PascalCase.tsx` (contoh: `StockDetailCard.jsx`, `CandlestickChart.jsx`, `DcaResultTable.jsx`).
- **File Utilitas / Hook Frontend**: `camelCase.js` (contoh: `useAuth.js`, `formatCurrency.js`, `apiClient.js`).
- **Dokumen Dokumentasi**: `kebab-case.md` (contoh: `stock-screener.md`, `local-development.md`).

### 1.2 Code Variables & Functions
- **Variabel & Properti**: `camelCase` (contoh: `totalInvestment`, `currentPrice`, `lotQuantity`, `realizedProfitLoss`).
- **Konstanta Global / Environment**: `UPPER_SNAKE_CASE` (contoh: `JWT_SECRET`, `DEFAULT_CACHE_TTL`, `LOT_SIZE = 100`).
- **Fungsi / Method**: `camelCase` dengan kata kerja pembuka (contoh: `calculateWeightedAverage()`, `simulateDca()`, `fetchGroundedContext()`, `evaluateRiskScore()`).
- **Class / Interface / Type**: `PascalCase` (contoh: `MarketDataService`, `PortfolioHolding`, `StockComparisonResult`).
- **Database Tables & Columns**: `snake_case` (contoh: `portfolio_transactions`, `user_id`, `lot_quantity`, `expires_at`).

---

## 2. Folder Structure

```text
Analisis-Saham/
├── context/                         # Single Source of Truth & AI Context Repository
│   ├── PRD.md
│   ├── PROJECT_STATE.md
│   ├── README.md
│   ├── 01-project/
│   ├── 02-development/
│   ├── 03-management/
│   ├── 04-setup/
│   └── 05-modules/
│
├── backend/                         # Express.js API Gateway & Services
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma schema database
│   │   ├── migrations/              # Riwayat migrasi SQL
│   │   └── seed.ts                  # Seeder data saham awal & materi belajar
│   ├── src/
│   │   ├── config/                  # Konfigurasi environment, DB, dan Gemini client
│   │   ├── controllers/             # HTTP request handling & status code
│   │   ├── middlewares/             # Auth JWT, validator, error handler, rate limit
│   │   ├── routes/                  # Pemetaan rute REST API
│   │   ├── services/                # Business logic & external integrations
│   │   │   ├── authService.js
│   │   │   ├── marketDataService.js
│   │   │   ├── fundamentalService.js
│   │   │   ├── newsService.js
│   │   │   ├── stockComparisonService.js
│   │   │   ├── portfolioService.js
│   │   │   ├── watchlistService.js
│   │   │   ├── dcaService.js
│   │   │   ├── riskService.js
│   │   │   ├── learningService.js
│   │   │   ├── aiService.js
│   │   │   ├── contextBuilder.js
│   │   │   └── cacheService.js
│   │   ├── utils/                   # Kalkulator finansial, format rupiah, validator
│   │   └── app.js                   # Entry point Express app
│   ├── package.json
│   └── .env.example
│
├── frontend/                        # React Single Page Application
│   ├── public/                      # Asset statis, favicon
│   ├── src/
│   │   ├── assets/                  # Gambar, ilustrasi, logo
│   │   ├── components/              # Komponen UI reusable (Cards, Modal, Charts)
│   │   ├── context/                 # AuthContext & Global State
│   │   ├── hooks/                   # Custom hooks (useFetch, useDebounce)
│   │   ├── pages/                   # Halaman aplikasi (Dashboard, Screener, Detail, dll.)
│   │   ├── services/                # Axios API Client terisolasi
│   │   ├── utils/                   # Format angka, tanggal, kalkulasi visual
│   │   ├── App.jsx                  # Router & shell navigasi
│   │   ├── index.css                # Konfigurasi Tailwind directives
│   │   └── main.jsx                 # React root mount
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── compose.yaml                     # Docker Compose untuk local development
└── .gitignore
```

---

## 3. Coding Standards

### 3.1 Backend Standards (Clean Architecture)
- **Thin Controller, Rich Service**: Controller hanya bertugas mem-parsing request, memvalidasi input via Zod, memanggil service layer, dan mengembalikan respon HTTP. Dilarang menulis logika bisnis atau kueri database langsung di dalam controller.
- **Explicit Error Handling**: Gunakan class custom error (misal: `AppError`, `NotFoundError`, `UnauthorizedError`) dan teruskan error ke `next(err)` agar ditangani secara tersentralisasi oleh global error middleware.
- **Fail Fast & Defensive Input**: Validasi parameter dan body payload sebelum mengeksekusi operasi database atau pemanggilan API eksternal.
- **Environment Isolation**: Dilarang melakukan *hardcoding* API Key, token, atau URL koneksi. Semua harus diambil dari `process.env`.
- **Async/Await Consistency**: Seluruh operasi asynchronous wajib menggunakan sintaks `async/await` dengan blok `try/catch` yang rapi.

### 3.2 Frontend Standards
- **Component Modularity**: Pecah komponen UI yang panjang (> 250 baris) menjadi sub-komponen terfokus (misal: `StockPriceHeader`, `FundamentalRatiosGrid`, `FinancialChartSection`).
- **Responsive-First Layout**: Seluruh tampilan harus rapi diakses dari perangkat mobile (sm), tablet (md), hingga desktop (lg/xl) menggunakan breakpoint Tailwind CSS.
- **Defensive State Handling**: Selalu sediakan 3 status state pada setiap pemanggilan data: `loading` (tampilkan skeleton/spinner), `error` (tampilkan pesan kesalahan yang ramah & tombol retry), dan `empty` (tampilkan empty state ilustratif jika data nihil).
- **Format Konsistensi**: Nilai moneter saham IDX wajib diformat menggunakan standar Rupiah (contoh: `Rp8.850`), persentase dengan 2 desimal (contoh: `+1,25%`), dan lot dalam bilangan bulat positif.

---

## 4. Git Standards

- **Branching Model**:
  - `main`: Kode produksi yang stabil dan siap dideploy.
  - `develop`: Cabang integrasi pengembangan fitur harian.
  - `feature/[nama-fitur]`: Cabang pengerjaan fitur spesifik (contoh: `feature/dca-lot-simulation`, `feature/ai-context-builder`).
  - `fix/[nama-bug]`: Cabang perbaikan bug (contoh: `fix/portfolio-average-price`).
- **Conventional Commits**: Format pesan commit wajib mengikuti format: `<type>(<scope>): <deskripsi singkat>`
  - `feat`: Penambahan fitur baru (contoh: `feat(dca): implement realistic lot mode with cash rollover`)
  - `fix`: Perbaikan bug (contoh: `fix(auth): handle expired jwt token gracefully`)
  - `docs`: Pembaruan dokumentasi (contoh: `docs(api): update sample json for stock comparison`)
  - `refactor`: Perubahan struktur kode tanpa mengubah fungsionalitas (contoh: `refactor(cache): optimize pg jsonb query index`)
  - `test`: Penambahan atau perbaikan unit test (contoh: `test(risk): add unit test for portfolio concentration score`)
  - `chore`: Pembaruan konfigurasi, dependencies, atau script build.

---

## 5. Development Workflow (Alur 6 Langkah)

Setiap pengembangan fitur atau modul dimulai dan dikerjakan secara berurutan:

```text
Database
   │
   ▼
Backend Services
   │
   ▼
Endpoint List
   │
   ▼
Sample JSON Responses
   │
   ▼
UI Components / UI Templates
   │
   ▼
Frontend Integration
```

1. **Database**: Definisikan skema pada `schema.prisma`, jalankan migrasi, perbarui relasi, indeks, dan siapkan data seeder jika relevan.
2. **Backend Services**: Terapkan logika bisnis, validasi, dan integrasi cache di dalam service terkait.
3. **Endpoint List**: Rancang kontrak endpoint REST (method, path, otorisasi, parameter, status response).
4. **Sample JSON Responses**: Dokumentasikan contoh respon sukses, empty state, validation error, dan server error.
5. **UI Components / UI Templates**: Bangun komponen antarmuka terisolasi di React sesuai desain responsif dan spesifikasi data.
6. **Frontend Integration**: Hubungkan komponen ke API client, kelola state loading/error/success, dan selesaikan alur pengguna secara menyeluruh.

---

## 6. Documentation Standards

- Setiap perubahan arsitektur atau keputusan teknis yang signifikan wajib dicatat dalam dokumen `context/03-management/decisions.md` (ADR).
- Setiap penambahan endpoint atau modifikasi skema modul harus langsung diperbarui pada file dokumen modul terkait di `context/05-modules/[module].md`.
- Status kemajuan pengerjaan harus disinkronkan secara berkala pada `context/03-management/progress.md` dan `context/PROJECT_STATE.md`.
