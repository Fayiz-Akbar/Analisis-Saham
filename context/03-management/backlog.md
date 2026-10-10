# Project Backlog: AI-Powered Fundamental Investment Analyzer

Daftar backlog disusun berdasarkan prioritas (P0, P1, P2, P3) dan pembagian fase pengembangan MVP (Phase 1 s.d. Phase 7) sesuai dengan PRD Section 40 & 41.

---

## 1. Backlog Table

| ID | Priority | Status | Module | Task & Description |
|---|----------|--------|--------|---------------------|
| **TSK-001** | 🔴 P0 | Done | Setup | Setup knowledge base & arsitektur sistem di direktori `context/` |
| **TSK-002** | 🔴 P0 | Ready | Auth | Inisialisasi User schema Prisma, bcrypt hashing, dan registrasi pengguna (`POST /api/auth/register`) |
| **TSK-003** | 🔴 P0 | Ready | Auth | Implementasi login dan penerbitan JSON Web Token (`POST /api/auth/login`) |
| **TSK-004** | 🔴 P0 | Ready | Auth | Middleware verifikasi token JWT dan endpoint profile (`GET /api/auth/me`) |
| **TSK-005** | 🔴 P0 | Ready | Database | Migrasi skema Prisma untuk tabel `users`, `stocks`, `watchlists`, dan `portfolio_transactions` |
| **TSK-006** | 🔴 P0 | Ready | Stocks | Seeding 80 emiten konstituen Indeks IDX80 (termasuk LQ45/IDX30) ke tabel `stocks` |
| **TSK-007** | 🔴 P0 | Ready | Stocks | Implementasi pencarian saham responsif berdasarkan ticker dan nama (`GET /api/stocks/search`) |
| **TSK-008** | 🔴 P0 | Ready | Stocks | Integrasi quote harga real-time/delayed dan kalkulasi perubahan harian (`GET /api/stocks/:symbol/quote`) |
| **TSK-009** | 🔴 P0 | Ready | Stocks | Endpoint historical candlestick data OHLCV (`GET /api/stocks/:symbol/history`) |
| **TSK-010** | 🔴 P0 | Ready | Frontend | Komponen visualisasi grafik candlestick TradingView Lightweight Charts di halaman Stock Detail |
| **TSK-011** | 🔴 P0 | Ready | Fundamental | Ekstraksi dan kalkulasi rasio keuangan 4 pilar (PE, PBV, ROE, ROA, DER, Net Margin) |
| **TSK-012** | 🔴 P0 | Ready | Fundamental | Endpoint fundamental ratios (`GET /api/stocks/:symbol/fundamentals`) |
| **TSK-013** | 🔴 P0 | Ready | AI | Inisialisasi Context Builder untuk menyusun data terstruktur (Price + Fundamentals) |
| **TSK-014** | 🔴 P0 | Ready | AI | Integrasi Google Gemini API dengan system instruction anti-halusinasi ketat |
| **TSK-015** | 🔴 P0 | Ready | AI | Endpoint AI Stock Analysis grounded (`POST /api/ai/stock-analysis`) |
| **TSK-016** | 🟠 P1 | Ready | Cache | Skema dan implementasi `CacheService` dengan tabel `api_cache` (PostgreSQL JSONB) |
| **TSK-017** | 🟠 P1 | Ready | News | Agregasi dan caching berita pasar modal serta emiten spesifik (`GET /api/stocks/:symbol/news`) |
| **TSK-018** | 🟠 P1 | Ready | Screener | Fitur Stock Screener dengan filter multi-indikator sektor, market cap, PE, PBV, ROE (`GET /api/stocks`) |
| **TSK-019** | 🟠 P1 | Ready | Comparison | Endpoint komparasi multi-emiten berdampingan 2–4 saham (`POST /api/stocks/compare`) |
| **TSK-020** | 🟠 P1 | Ready | Comparison | Antarmuka Stock Comparison dengan visualisasi bar/line perbandingan metrik finansial |
| **TSK-021** | 🟠 P1 | Ready | Comparison | Endpoint AI Stock Comparison Assistant (`POST /api/ai/stock-comparison`) |
| **TSK-022** | 🟠 P1 | Ready | Watchlist | Endpoint CRUD Watchlist personal pengguna (`GET`, `POST`, `DELETE /api/watchlist`) |
| **TSK-023** | 🟠 P1 | Ready | Portfolio | Pencatatan transaksi BUY dan SELL berbasis lot (`POST /api/portfolio/transactions`) |
| **TSK-024** | 🟠 P1 | Ready | Portfolio | Algoritma kalkulasi weighted average buy price dan perhitungan Realized/Unrealized P/L |
| **TSK-025** | 🟠 P1 | Ready | Portfolio | Tampilan ringkasan portofolio, daftar holdings, dan diagram pie alokasi aset/sektor |
| **TSK-026** | 🟠 P1 | Ready | DCA | Implementasi algoritma simulasi DCA historis dengan Realistic Lot Mode (100 lembar per lot) |
| **TSK-027** | 🟠 P1 | Ready | DCA | Algoritma akumulasi sisa kas bulanan yang belum cukup membeli 1 lot ke bulan berikutnya |
| **TSK-028** | 🟠 P1 | Ready | DCA | Endpoint simulasi DCA dan visualisasi performa investasi (`POST /api/dca/simulate`) |
| **TSK-029** | 🟡 P2 | Ready | Dashboard | Halaman Dashboard terpadu mengintegrasikan widget Portofolio, Watchlist, IHSG, Berita, & Quick Actions |
| **TSK-030** | 🟡 P2 | Ready | Market | Halaman Market & Sentiment dengan tracking indeks IHSG, top movers, dan AI Macro Assistant |
| **TSK-031** | 🟡 P2 | Ready | Risk | Algoritma penilaian Investment Health Score (0–100) berdasarkan konsentrasi aset dan diversifikasi sektor |
| **TSK-032** | 🟡 P2 | Ready | Risk | Endpoint dan visualisasi edukatif skor kesehatan portofolio (`GET /api/portfolio/health`) |
| **TSK-033** | 🟡 P2 | Ready | Learning | Skema database `learning_contents` dan seeding kurikulum materi investasi 6 level |
| **TSK-034** | 🟡 P2 | Ready | Learning | Halaman daftar kurikulum belajar dan reader artikel materi (`GET /api/learning/:slug`) |
| **TSK-035** | 🟡 P2 | Ready | AI | Endpoint AI Investment Tutor interaktif untuk edukasi konsep pemula (`POST /api/ai/tutor`) |
| **TSK-036** | 🟢 P3 | Ready | Quiz | Skema database `quizzes` & `quiz_attempts` beserta seeding bank soal kuis per materi |
| **TSK-037** | 🟢 P3 | Ready | Quiz | Komponen runner kuis interaktif dan endpoint evaluasi nilai (`POST /api/learning/:id/quiz/submit`) |
| **TSK-038** | 🟢 P3 | Ready | Learning | Pelacakan progres kelulusan belajar pengguna (`POST /api/learning/:id/progress`) |
| **TSK-039** | 🟢 P3 | Ready | Settings | Halaman profil user, ganti password, preferensi tampilan, dan manajemen logout |
| **TSK-040** | 🟢 P3 | Ready | Research | Dataset evaluasi pertanyaan finansial dan pengujian Factual Consistency AI |
| **TSK-041** | 🟢 P3 | Ready | Research | Pengujian performa caching (Cache Hit Ratio, Latency, API Cost Reduction) |
| **TSK-042** | 🟢 P3 | Ready | Research | Pengujian akurasi simulasi DCA lot mode dan evaluasi sensitivitas skor Investment Health |

---

## 2. Kategori Prioritas
- **🔴 P0 (Critical - MVP Phase 1 & 2)**: Fitur pondasi absolut tanpa mana aplikasi tidak dapat berfungsi (Auth, Search, Detail, Fundamental Ratios, Chart, Grounded AI Core).
- **🟠 P1 (High - MVP Phase 3 & 4)**: Fitur analitik dan manajemen esensial (Cache, News, Screener, Stock Comparison, Watchlist, Portfolio Transactions, DCA Realistic Lot).
- **🟡 P2 (Medium - MVP Phase 5 & 6)**: Fitur penunjang edukasi dan dashboard komprehensif (Dashboard terpadu, Market Sentiment, Investment Health Score, Kurikulum Belajar 6 Level, AI Tutor).
- **🟢 P3 (Low / Academic Enhancement - MVP Phase 6 & 7)**: Fitur penyempurna interaktivitas dan evaluasi skripsi (Kuis, Tracking Progres, Pengujian Metrik Ilmiah Factual Consistency & Caching Benchmark).

---

## 3. Pemetaan Sprint Scrum Penelitian (Tabel 12 Draft Skripsi Fayiz)

Sesuai rencana metodologi penelitian Scrum pada Bab 3.4.6 (Tabel 12) Naskah Skripsi, implementasi sub-sistem Fayiz dibagi menjadi 4 Sprint terfokus:

| Sprint | Modul / Fitur (Tabel 12 Skripsi) | Task Terkait | Pekerjaan Utama |
|---|---|---|---|
| **Sprint 1** | **Dashboard, Stock Search, Stock Detail** | TSK-001 s.d. TSK-012, TSK-016, TSK-029 | Membangun struktur dasar aplikasi, pencarian emiten Indeks IDX80, pengambilan data quote harga, informasi profil perusahaan, candlestick chart historis TradingView, serta antarmuka Dashboard utama. |
| **Sprint 2** | **Stock Screener, Stock Comparison** | TSK-018, TSK-019, TSK-020 | Mengembangkan fitur penyaringan saham berbasis indikator fundamental (PER, PBV, ROE, DER) dan fitur komparasi berdampingan (*side-by-side*) untuk 2 hingga 4 emiten secara serentak. |
| **Sprint 3** | **Company News, Sentiment Analysis, Market & Sentiment** | TSK-017, TSK-030 | Mengintegrasikan Yahoo Finance / News API, menyajikan berita emiten berlabel sentimen (`[Positif]`, `[Netral]`, `[Negatif]`), serta dasbor kondisi pasar makro (IHSG, bursa global, komoditas acuan). |
| **Sprint 4** | **AI Financial Assistant & Context Grounding** | TSK-013, TSK-014, TSK-015, TSK-021, TSK-040 | Mengembangkan Context Builder, integrasi Google Gemini API, guardrail anti-halusinasi (*fallback: "Data fakta tidak tersedia"*), antarmuka AI dengan toggle mode profil (Pemula vs Berpengalaman), dan pengujian evaluasi skripsi. |
