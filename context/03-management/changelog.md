# Changelog: AI-Powered Fundamental Investment Analyzer

Format log mengikuti standar [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan Semantic Versioning.

---

## [1.1.0] - 2026-09-29 20:00 WIB

### Added
- **UI Architecture & Theming**: Fondasi antarmuka modern yang fleksibel berbasis Tailwind CSS dengan dukungan penuh Dual-Theme (Light & Dark Mode) responsif.
- **Katalog Terkurasi Indeks IDX80**: Memperbarui cakupan data saham utama ke 80 emiten konstituen Indeks IDX80 (mencakup LQ45 dan IDX30) sebagai basis seeder, screener, dan dashboard dengan dukungan pencarian on-demand emiten IDX lainnya (`${symbol}.JK`).
- **Sentimen Berita**: Penambahan kolom `sentiment` (`POSITIVE`, `NEUTRAL`, `NEGATIVE`) dan `sentiment_score` (`-1.0` s.d. `+1.0`) pada tabel `news_cache` serta visualisasi status sentimen pada komponen daftar berita.
- **Bursa Global & Komoditas**: Integrasi pemantauan indeks global (S&P 500, Dow Jones, Nasdaq, Nikkei 225, Hang Seng) dan komoditas strategis (Minyak WTI/Brent, Emas, Batubara, Nikel, CPO) pada modul `market-sentiment`.
- **ADR Baru**: Pencatatan D007 (Modern Responsive UI with Dual-Theme Support), D008 (Katalog IDX80), dan D009 (Bursa Global & Sentimen).

### Changed
- Standardisasi komponen tata letak, cards, and modal components menggunakan Tailwind CSS yang fleksibel.

---

## [1.0.0] - 2026-09-05 15:35 WIB

### Added
- Inisialisasi basis pengetahuan dan arsitektur sistem di direktori `context/` sebagai Single Source of Truth (SSOT).
- Dokumen root `PRD.md`, `PROJECT_STATE.md`, dan `README.md` yang menyelaraskan spesifikasi PRD v1.1 dengan standar Knowledge Base.
- Dokumen arsitektur global di `01-project/` (`overview.md`, `architecture.md`, `database.md`, `tech-stack.md`).
- Desain ERD PostgreSQL 17 lengkap dengan 10 tabel inti: `users`, `stocks`, `watchlists`, `portfolio_transactions`, `api_cache`, `news_cache`, `learning_contents`, `learning_progress`, `quizzes`, `quiz_attempts`.
- Dokumen standar pengembangan di `02-development/` (`conventions.md`, `api.md`, `testing.md`, `deployment.md`).
- Katalog lengkap 29 endpoint REST API dengan standar format respon JSON seragam dan skema otorisasi Bearer JWT.
- Protokol pengujian evaluasi AI (Factual Consistency $\ge 95\%$, Hallucination Rate $< 2\%$, Completeness) dan pengujian efisiensi caching untuk skripsi.
- Dokumen manajemen proyek di `03-management/` (`progress.md`, `backlog.md`, `decisions.md` ADR D001–D006, `changelog.md`).
- Dokumen setup lokal di `04-setup/` (`local-development.md`, `environment-variables.md`, `database-setup.md`, `docker-setup.md`, `troubleshooting.md`).
- Spesifikasi rinci 13 file modul di `05-modules/` (`auth.md`, `dashboard.md`, `market-sentiment.md`, `stock-screener.md`, `stock-detail.md`, `stock-comparison.md`, `watchlist.md`, `portfolio.md`, `dca-simulator.md`, `investment-health.md`, `investment-learning.md`, `ai-assistant.md`, `settings.md`).

### Security
- Menetapkan hashing password aman menggunakan `bcrypt` dengan salt round $\ge 10$.
- Menetapkan penggunaan stateless JSON Web Token (JWT) dengan masa berlaku terbatas.
- Menetapkan isolasi API Key (Gemini, Market Data, News) di backend `.env` dan melarang pemaparan kredensial ke client frontend.
- Menetapkan perlindungan CORS, sanitasi input request berbasis Zod, dan isolasi data per `user_id`.
