# AI-Powered Fundamental Investment Analyzer

## Overview
**AI-Powered Fundamental Investment Analyzer** adalah platform web terpadu untuk analisis fundamental saham dan edukasi pasar modal yang berfokus pada saham Bursa Efek Indonesia (IDX). Sistem ini dirancang untuk melayani dua profil investor ritel sekaligus:
1. **Investor Ritel Pemula**: Membutuhkan kurikulum edukasi terstruktur, kuis pemahaman, AI Investment Tutor yang komunikatif, visualisasi intuitif, serta simulasi Dollar-Cost Averaging (DCA) berbasis lot realistis.
2. **Investor Ritel Berpengalaman**: Membutuhkan efisiensi riset fundamental terpadu, penyaring saham multi-indikator (*screener*), komparasi multi-emiten sejenis (*peer comparison*), audit kesehatan portofolio (*Investment Health Score*), serta AI Financial Assistant yang menyintesis highlight fundamental dan sentimen berita tanpa halusinasi data.

Sistem menerapkan arsitektur **Context-Grounded Large Language Model (LLM)** menggunakan Google Gemini API, di mana AI diarahkan untuk menghasilkan respons faktual hanya berdasarkan data terstruktur yang dikirimkan oleh backend sistem.

## Goals
- **Edukasi & Literasi**: Meningkatkan pemahaman investor pemula mengenai rasio fundamental, valuasi, manajemen risiko, dan konsep diversifikasi secara bertahap.
- **Efisiensi Riset Finansial**: Mengeliminasi fragmentasi data dengan menyatukan harga real-time, historis, fundamental, komparasi emiten, dan berita ke dalam satu antarmuka responsif.
- **Context-Grounded AI Assistant**: Menyediakan asisten riset dan tutor AI yang faktual, konsisten, dan bebas dari halusinasi angka.
- **Simulasi Investasi Realistis**: Menyediakan simulasi akumulasi berkala (DCA) yang akurat dengan mekanisme 100 lembar per lot dan perputaran sisa dana.
- **Optimasi API & Caching**: Menerapkan caching multi-tier PostgreSQL JSONB untuk menekan biaya API pihak ketiga dan meningkatkan waktu respons sistem.

## Architecture Summary
Aplikasi dibangun dengan pola arsitektur berlapis yang decoupled:
- **Client Layer**: Antarmuka berbasis React, Tailwind CSS, dan TradingView Lightweight Charts untuk visualisasi grafik harga interaktif.
- **API Gateway & Business Layer**: Node.js & Express.js bertindak sebagai orkestrator bisnis, autentikasi JWT, validasi skema request, dan pengelola context builder AI.
- **Service Layer**: Terdiri dari modul independen (`AuthService`, `MarketDataService`, `FundamentalService`, `NewsService`, `StockComparisonService`, `PortfolioService`, `WatchlistService`, `DCAService`, `RiskService`, `LearningService`, `AIService`, dan `CacheService`).
- **Database & Storage Layer**: PostgreSQL 17 diakses melalui Prisma ORM untuk data relasional inti, tracking portofolio, konten edukasi, dan caching response API eksternal dalam format JSONB.
- **AI & External Services**: Google Gemini API via SDK terintegrasi di sisi backend, serta provider data pasar (Sectors.app / Twelve Data / Finnhub) dan RSS News Feeds.

```text
[React + Tailwind + Charts]
            │ (HTTP / REST)
            ▼
[Express.js API Gateway & Controllers]
            │
   ┌────────┴────────┐
   ▼                 ▼
[Services Layer] ──> [CacheService] ──> [PostgreSQL (Prisma)]
   │                 
   ├─> [External Market & News APIs]
   │
   └─> [Context Builder] ──> [Gemini LLM API] ──> [Structured Response]
```

## Tech Stack
- **Frontend**: React, Tailwind CSS, TradingView Lightweight Charts, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, Prisma ORM, JSON Web Token (JWT), bcrypt.
- **Database**: PostgreSQL 17 (Relational + JSONB Cache Store).
- **AI Engine**: Google Gemini API (Context-Grounded Architecture).
- **Tooling & Runtime**: Vite, Docker & Docker Compose, Git.

## Folder Structure
Struktur dokumentasi dan basis pengetahuan proyek tersimpan di dalam folder `context/`:
```text
context/
|-- PRD.md                      # Dokumen kebutuhan produk utama (SSOT)
|-- PROJECT_STATE.md            # Status sprint, task aktif, dan catatan kerja terkini
|-- README.md                   # Ringkasan proyek dan panduan arsitektur
|
|-- 01-project/                 # Informasi global proyek
|   |-- overview.md             # Latar belakang, tujuan, scope, dan research questions
|   |-- architecture.md         # Arsitektur sistem, data flow, dan integrasi
|   |-- database.md             # Desain database, ERD, dan konvensi skema
|   `-- tech-stack.md           # Rincian teknologi frontend, backend, AI, dan database
|
|-- 02-development/             # Standar dan tata cara pengembangan
|   |-- conventions.md          # Standar penamaan, struktur kode, dan git commit
|   |-- api.md                  # Standar API global, format JSON, dan endpoint catalog
|   |-- testing.md              # Rencana pengujian unit, integrasi, dan evaluasi AI
|   `-- deployment.md           # Prosedur build, docker production, dan Nginx SSL
|
|-- 03-management/              # Manajemen proyek dan jejak keputusan
|   |-- progress.md             # Tracking persentase pengerjaan per fase
|   |-- backlog.md              # Backlog tugas terperinci berdasarkan prioritas (P0-P3)
|   |-- decisions.md            # Architecture Decision Records (ADR)
|   `-- changelog.md            # Riwayat perubahan sistem dan dokumentasi
|
|-- 04-setup/                   # Panduan instalasi dan lingkungan lokal
|   |-- local-development.md    # Langkah instalasi lokal dari nol
|   |-- environment-variables.md# Katalog seluruh variabel environment
|   |-- database-setup.md       # Setup database PostgreSQL, migration, dan seeder
|   |-- docker-setup.md         # Konfigurasi container Docker lokal
|   `-- troubleshooting.md      # Panduan penanganan error dan masalah umum
|
`-- 05-modules/                 # Spesifikasi detail tiap modul sistem
    |-- auth.md                 # Autentikasi dan manajemen user
    |-- dashboard.md            # Dashboard utama dan ringkasan portofolio/pasar
    |-- market-sentiment.md     # Pasar IHSG, top movers, berita, dan AI macro
    |-- stock-screener.md       # Penyaring saham berbasis indikator fundamental
    |-- stock-detail.md         # Analisis mendalam emiten, chart, dan AI stock
    |-- stock-comparison.md     # Komparasi komparatif multi-saham (2-4 emiten)
    |-- watchlist.md            # Daftar pantau saham personal
    |-- portfolio.md            # Pencatatan transaksi lot, kalkulasi P/L, dan alokasi
    |-- dca-simulator.md        # Simulasi DCA realistis berbasis lot 100 lembar
    |-- investment-health.md    # Audit risiko konsentrasi dan skor kesehatan investasi
    |-- investment-learning.md  # Kurikulum edukasi 6 level, kuis, dan tracking progres
    |-- ai-assistant.md         # Orkestrasi AI, context grounding, dan kontrol halusinasi
    `-- settings.md             # Profil pengguna, keamanan kata sandi, dan preferensi
```

## Workflow
Setiap AI Agent dan pengembang wajib mengikuti 6 langkah alur kerja berikut sebelum dan sesudah mengerjakan task:
1. **Read PRD** (`context/PRD.md`): Pahami kebutuhan bisnis dan kriteria penerimaan fitur.
2. **Read Project State** (`context/PROJECT_STATE.md`): Periksa status sprint, task aktif, dan blocker terkini.
3. **Read Setup Context** (`context/04-setup/local-development.md`): Pastikan lingkungan lokal berjalan sesuai konfigurasi.
4. **Read Module Context** (`context/05-modules/[module].md`): Pelajari rancangan database, endpoint, response format, dan UI template modul terkait.
5. **Implement Task**: Kerjakan implementasi dengan urutan: *Database -> Backend -> Endpoints -> Sample JSON -> UI Components -> Frontend Integration*.
6. **Update Documentation**: Perbarui dokumen status proyek (`PROJECT_STATE.md`), kemajuan (`progress.md`), catatan rilis (`changelog.md`), dan modul terkait jika ada keputusan arsitektur baru (`decisions.md`).
