# Arsitektur Sistem: AI-Powered Fundamental Investment Analyzer

## 1. High Level Architecture

Sistem dirancang menggunakan arsitektur berlapis (*layered decoupled architecture*) yang memisahkan antara Presentation Layer (React SPA), API Gateway & Application Business Logic (Express.js), Persistence & Caching Layer (PostgreSQL via Prisma ORM), serta External Integration Services (Market Data API, News API, dan Google Gemini LLM API).

```text
                                  ┌─────────────────────────────┐
                                  │      CLIENT / BROWSER       │
                                  │   React 18 + Tailwind CSS   │
                                  │  Lightweight Charts Library │
                                  └──────────────┬──────────────┘
                                                 │ HTTPS / JSON REST
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     EXPRESS API GATEWAY     │
                                  │  Routing & Request Logging  │
                                  │  JWT Auth & Rate Limiter    │
                                  │    Schema Validator (Zod)   │
                                  └──────────────┬──────────────┘
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
        │  INTERNAL SERVICES  │       │  DATA INTEGRATION   │       │    AI CONTROLLER    │
        │  - AuthService      │       │  - MarketDataService│       │  - ContextBuilder   │
        │  - PortfolioService │       │  - FundamentalServ. │       │  - PromptEngine     │
        │  - WatchlistService │       │  - NewsService      │       │  - OutputValidator  │
        │  - DCAService       │       │  - ComparisonService│       │                     │
        │  - LearningService  │       │                     │       │                     │
        │  - RiskService      │       │                     │       │                     │
        └──────────┬──────────┘       └──────────┬──────────┘       └──────────┬──────────┘
                   │                             │                             │
                   │                             ▼                             │
                   │                  ┌─────────────────────┐                  │
                   │                  │    CacheService     │                  │
                   │                  │ (Check TTL & Read)  │                  │
                   │                  └──────────┬──────────┘                  │
                   │                             │                             │
                   ▼                             ▼                             ▼
        ┌───────────────────────────────────────────────────┐       ┌─────────────────────┐
        │                 POSTGRESQL 17                     │       │  GOOGLE GEMINI API  │
        │           (via Prisma Client ORM)                 │       │   (LLM Reasoning)   │
        │  - Core Tables (Users, Portfolios, Quizzes)       │       └─────────────────────┘
        │  - Cache Stores (api_cache, news_cache JSONB)     │                  ▲
        └───────────────────────────────────────────────────┘                  │
                         ▲                                                     │
                         │ Invalidate & Fallback                               │
                         └─────────────────────────────────────────────────────┘
```

---

## 2. Components

### 2.1 Frontend Component Layer (React SPA)
- **Navigation & Layout**: Dashboard shell, sidebar navigasi adaptif, header dengan indikator pasar/IHSG dan profil user.
- **Data Visualization**: Grafik candlestick dan volume harga saham menggunakan `lightweight-charts`, grafik perbandingan multi-emiten, dan diagram alokasi portofolio.
- **Metric Cards & Screening Grid**: Komponen kartu rasio fundamental dengan penanda status valuasi dan grid tabel data saham dengan filter reaktif.
- **AI Chat & Modal Interface**: Komponen chat interaktif untuk *AI Financial Assistant* dan *AI Investment Tutor* yang mendukung streaming teks dan render markdown terstruktur.
- **Education & Quiz Runner**: Komponen reader kurikulum pembelajaran berjenjang dan antarmuka interaktif pengerjaan kuis.

### 2.2 Backend Gateway & Controller Layer (Express.js)
- **HTTP Routing**: Routing modular per domain fitur (`/api/auth`, `/api/stocks`, `/api/portfolio`, `/api/dca`, `/api/learning`, `/api/ai`).
- **Middleware Pipeline**:
  - `cors`: Mengatur akses lintas origin domain client.
  - `helmet`: Pengamanan header HTTP.
  - `authMiddleware`: Memvalidasi dan mengekstrak klaim payload token Bearer JWT.
  - `validateRequest`: Validasi skema input (query parameter dan body JSON).
  - `errorHandler`: Global catch error handler untuk respon format seragam.

---

## 3. Services Layer

Sistem menerapkan Service Layer terisolasi di dalam `backend/src/services/`:

1. **`AuthService`**: Menangani registrasi, verifikasi kecocokan bcrypt password, pembuatan token JWT, dan pemulihan sesi pengguna.
2. **`MarketDataService`**: Mengambil quote harga saham terkini, ringkasan pergerakan IHSG, serta historical OHLCV bar data dari provider eksternal dengan mekanisme fallback cache.
3. **`FundamentalService`**: Mengambil laporan keuangan emiten dan menghitung metrik fundamental utama (PE, PBV, ROE, ROA, DER, Net Margin, EPS, Revenue Growth).
4. **`NewsService`**: Mengumpulkan dan menyeleksi berita pasar modal terkini dan berita spesifik emiten berdasarkan ticker.
5. **`StockComparisonService`**: Menyatukan dan menyejajarkan metrik fundamental serta data kinerja historis dari 2 hingga 4 emiten yang dipilih.
6. **`PortfolioService`**: Mengelola transaksi portofolio (BUY/SELL), menghitung weighted average cost basis, realized P/L, unrealized P/L, dan alokasi sektoral.
7. **`WatchlistService`**: Mengelola daftar pantau saham user dan menyinkronkannya dengan quote harga pasar.
8. **`DCAService`**: Mengeksekusi algoritma simulasi Dollar-Cost Averaging historis berbasis kelipatan 100 lembar (1 lot) dengan rollover sisa saldo kas bulanan.
9. **`RiskService`**: Mengevaluasi konsentrasi bobot aset dan sektor pada portofolio pengguna untuk menghasilkan *Investment Health Score* (0–100).
10. **`LearningService`**: Mengelola daftar topik edukasi per level, konten artikel detail, kuis pemahaman, dan pelacakan status selesai belajar.
11. **`CacheService`**: Mengelola penyimpanan, pengecekan validitas TTL, pembacaan, dan invalidasi data cache pada tabel `api_cache` dan `news_cache` di PostgreSQL.
12. **`AIService` & `ContextBuilder`**: Mengorkestrasi pengumpulan data spesifik sesuai kebutuhan pertanyaan pengguna, mengonstruksi konteks terstruktur, mengirim instruksi prompt ke Google Gemini API, dan memvalidasi output JSON terstruktur.

---

## 4. Modules Decomposition

| Modul | Route Path | Service Terkait | Deskripsi Fungsional |
|-------|------------|-----------------|----------------------|
| **Auth** | `/api/auth` | `AuthService` | Autentikasi dan otorisasi sesi pengguna |
| **Stocks** | `/api/stocks` | `MarketDataService`, `FundamentalService`, `NewsService` | Pencarian saham, quote, grafik historis, rasio fundamental, dan berita |
| **Comparison** | `/api/stocks/compare` | `StockComparisonService` | Komparasi multi-emiten (2-4 saham) |
| **Watchlist** | `/api/watchlist` | `WatchlistService` | Pengelolaan daftar pantau saham personal |
| **Portfolio** | `/api/portfolio` | `PortfolioService`, `RiskService` | Manajemen transaksi lot, P/L, alokasi, dan audit risiko konsentrasi |
| **DCA Simulator** | `/api/dca` | `DCAService` | Simulasi DCA historis berbasis lot dan sisa dana kas |
| **Learning** | `/api/learning` | `LearningService` | Kurikulum edukasi 6 level, kuis, dan tracking |
| **AI** | `/api/ai` | `AIService`, `ContextBuilder` | AI Assistant (analisis emiten, komparasi, makro) dan AI Investment Tutor |

---

## 5. Data Flow

### 5.1 Alur Pengambilan Data Saham Ter-Cache (Cache-Aside Flow)
```text
User Request (GET /api/stocks/BBCA)
            │
            ▼
Express Controller
            │
            ▼
MarketDataService ──> CacheService.get('market_provider', 'quote', 'BBCA')
                             │
            ┌────────────────┴────────────────┐
      [Cache Valid?]                    [Cache Expired / Miss?]
            │                                 │
           YES                                NO
            │                                 │
            ▼                                 ▼
   Return Cached JSON              Fetch dari External Provider API
                                              │
                                              ▼
                                   Simpan ke api_cache (PostgreSQL JSONB)
                                              │
                                              ▼
                                   Return Fresh JSON ke Client
```

### 5.2 Alur AI Context-Grounded Reasoning
```text
User Question ("Bagaimana valuasi BBCA dibandingkan BBRI?")
            │
            ▼
Express POST /api/ai/stock-comparison
            │
            ▼
ContextBuilder
  ├── Ambil Fundamental BBCA & BBRI (via FundamentalService + Cache)
  ├── Ambil Price & Market Cap (via MarketDataService + Cache)
  └── Ambil News Highlight (via NewsService + Cache)
            │
            ▼
Format Payload Konteks Terstruktur (JSON Finansial Faktual)
            │
            ▼
Suntikkan System Instructions:
  - "Anda adalah AI Financial Assistant."
  - "Gunakan HANYA fakta & angka yang ada di dalam context."
  - "DILARANG mengarang angka atau memberikan rekomendasi beli/jual langsung."
            │
            ▼
Kirim Konteks + Prompt ke Google Gemini API
            │
            ▼
Gemini API menghasilkan Respon Terstruktur
            │
            ▼
Output Sanitizer & Validator (Memastikan disclaimer edukasi tersemat)
            │
            ▼
Kirim Respon ke Frontend (Tampil di Chat Bubble / Card Analisis)
```

---

## 6. Infrastructure & Deployment Environment

### 6.1 Development Environment
- Runtime: Node.js v20+ / v22+
- Database: PostgreSQL 17 (Lokal melalui Laragon / Docker Compose)
- Package Manager: `npm`
- Hot Reload: Vite (Frontend port 5173 / 3000), tsx/nodemon (Backend port 5000)

### 6.2 Production Environment
- Host: Virtual Private Server (VPS Linux Ubuntu LTS) atau Container Orchestrator
- Reverse Proxy & SSL: Nginx dengan Certbot Let's Encrypt SSL
- Process Manager: Docker Compose / PM2 Cluster
- Database: Managed PostgreSQL 17 dengan automated daily backup

---

## 7. Security Layer

1. **Token-Based Authentication**: Menggunakan JWT stateless yang ditandatangani dengan algoritma HMAC-SHA256 (`JWT_SECRET`). Token menyertakan `userId` dan memiliki masa kadaluarsa (default: 7 hari).
2. **Password Protection**: Password disimpan menggunakan hashing `bcrypt` dengan faktor salt round minimal 10. Tidak pernah menyimpan plaintext password di database atau log server.
3. **Data Isolation**: Seluruh transaksi portofolio, watchlist, dan riwayat belajar diisolasi secara ketat berdasarkan klaim `userId` dari token JWT valid, mencegah unauthorized cross-user access.
4. **Secret Management**: Seluruh kredensial sensitif (`GEMINI_API_KEY`, `MARKET_DATA_API_KEY`, `NEWS_API_KEY`, `DATABASE_URL`, `JWT_SECRET`) disimpan dalam file `.env` di lingkungan server backend dan tidak pernah dikirimkan ke client/frontend.
5. **CORS & Input Sanitization**: Backend menerapkan CORS whitelist domain frontend dan validasi input menyeluruh menggunakan schema validation untuk mencegah eksploitasi SQLi atau XSS.

---

## 8. External Integrations

1. **Google Gemini API**:
   - Model: Gemini 1.5 Pro / Flash.
   - Peran: Pemrosesan bahasa alami untuk sintesis data fundamental, perbandingan kompetitor, penjelasan risiko portofolio, dan tutor edukasi interaktif.
   - Pendekatan: Injeksi konteks terstruktur (*context-grounding*) dengan pembatasan halusinasi ketat.

2. **Market Data Providers**:
   - Kandidat: Sectors.app / Twelve Data / Finnhub.
   - Data yang diambil: Real-time price quote, historical OHLCV candlestick data, data fundamental emiten IDX, dan indeks bursa (IHSG, LQ45, IDX30).

3. **News Providers / RSS Feeds**:
   - Sumber: Portal berita pasar modal terpercaya (seperti Kontan, Bisnis.com, CNBC Indonesia, atau feed terintegrasi provider).
   - Peran: Menyediakan ringkasan informasi terkini mengenai aksi korporasi emiten dan iklim makroekonomi.
