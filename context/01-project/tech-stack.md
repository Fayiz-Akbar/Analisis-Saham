# Tech Stack: AI-Powered Fundamental Investment Analyzer

## 1. Frontend

- **Core Library**: React 18+ (Single Page Application via Vite)
  - Memberikan reaktivitas tinggi, perenderan komponen terisolasi, dan ekosistem luas.
- **Styling**: Tailwind CSS
  - Utility-first CSS framework untuk membangun antarmuka modern, responsif, dan konsisten (dark mode palette, cards, grid layout, badges, tabs).
- **Financial Charting**: TradingView Lightweight Charts
  - Library grafik finansial berkinerja tinggi untuk merender grafik candlestick interaktif, bar volume, dan pergerakan harga historis tanpa membebani memori browser.
- **Icons**: Lucide React
  - Set ikon modern dan konsisten untuk dashboard finansial, status keuntungan/kerugian, dan indikator navigasi.
- **State Management & Data Fetching**: React Hooks, Context API, dan Axios
  - Pengelolaan state global untuk status autentikasi pengguna dan pemanggilan endpoint REST API dengan interceptor Bearer token.
- **Routing**: React Router v6
  - Pengelolaan client-side routing dan perlindungan rute terautentikasi (*Protected Routes*).

---

## 2. Backend

- **Runtime Environment**: Node.js v20+ / v22+ LTS
  - Runtime JavaScript asynchronous berbasis event loop yang ideal untuk penanganan I/O, API caching, dan pemanggilan layanan eksternal secara non-blocking.
- **Web Framework**: Express.js
  - Framework minimalis, fleksibel, dan matang untuk membangun API Gateway, manajemen middleware, dan perutean endpoint RESTful.
- **Data Access & ORM**: Prisma ORM
  - Object-Relational Mapper modern dengan type-safety penuh, query builder intuitif, dan manajemen migrasi skema deklaratif.
- **Authentication & Security**:
  - `jsonwebtoken`: Pembuatan dan verifikasi stateless JWT token untuk otorisasi sesi.
  - `bcryptjs`: Hashing password aman satu arah dengan salt round.
  - `cors` & `helmet`: Pengamanan header HTTP dan kontrol kebijakan akses domain silang.
  - `zod`: Validasi skema input runtime untuk query parameter dan body payload request.

---

## 3. Database & Caching Store

- **Primary Database**: PostgreSQL 17
  - Basis data relasional enterprise-grade dengan keandalan tinggi (ACID compliant).
  - Digunakan untuk data relasional inti (Users, Stocks, Watchlists, Portfolio Transactions, Learning Content, Quizzes).
- **Cache Storage**: PostgreSQL JSONB with TTL Indexes
  - Memanfaatkan tipe data semi-terstruktur `JSONB` pada PostgreSQL untuk menyimpan response mentah dari API pihak ketiga secara lokal.
  - Dilengkapi kolom `expires_at` dan indeks B-Tree untuk pengecekan validitas masa kedaluwarsa secara instan.

---

## 4. Artificial Intelligence (AI) Engine

- **LLM Provider**: Google Gemini API (`@google/genai` atau `@google/generative-ai`)
- **Model**: Gemini 1.5 Flash (untuk respon cepat/interaktif) dan Gemini 1.5 Pro (untuk penalaran mendalam dan komparasi multi-emiten).
- **Arsitektur Pendekatan**: **Context-Grounded Generation**
  - Backend menyusun payload data finansial faktual yang telah divalidasi ke dalam prompt sistem sebelum diteruskan ke LLM.
  - Output diarahkan ke dalam format JSON terstruktur untuk mencegah distorsi interpretasi di sisi antarmuka.

---

## 5. Infrastructure & Hosting

- **Local Development**:
  - Node.js runtime + Laragon / Native PostgreSQL atau Docker Compose.
  - Hot Module Replacement (HMR) via Vite dev server.
- **Production Staging**:
  - Virtual Private Server (VPS Linux Ubuntu 24.04 LTS).
  - Web Server & Reverse Proxy: Nginx (menangani reverse proxy ke port Express dan menyajikan build statis React).
  - SSL Certificate: Let's Encrypt via Certbot (enkripsi HTTPS wajib).

---

## 6. DevOps & Tooling

- **Version Control**: Git & GitHub
- **Containerization**: Docker & Docker Compose v2 (untuk replikasi lingkungan development dan database staging).
- **Process Manager**: PM2 (Production Process Manager untuk clustering dan auto-restart aplikasi Node.js).
- **Build Tool**: Vite (bundling cepat untuk aset frontend).
- **Database Tooling**: Prisma Studio (GUI web untuk inspeksi data lokal) dan DBeaver / pgAdmin.

---

## 7. Monitoring & Logging

- **HTTP Logging**: Morgan (logging akses request HTTP di lingkungan development/staging).
- **Application Logging**: Winston (structured error logging dengan level `info`, `warn`, `error`).
- **Health Check Endpoint**: `/api/health` (memantau status konektivitas database PostgreSQL dan kesiapan backend).

---

## 8. Third Party Services & External APIs

- **Market Data Provider**:
  - Kandidat: Yahoo Finance (`yahoo-finance2`) / Sectors.app / Twelve Data.
  - Menyediakan data: Real-time/delayed quotes, historical daily OHLCV prices, fundamental financial statements (Income Statement, Balance Sheet, Cash Flow), dan indeks bursa (IHSG, Indeks IDX80, LQ45, IDX30).
- **News Provider**:
  - Portal berita pasar modal terpercaya / Yahoo Finance News / News API / RSS Feeds terkurasi untuk topik emiten IDX dan makroekonomi.
