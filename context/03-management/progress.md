# Progress Tracking: AI-Powered Fundamental Investment Analyzer

Overall Progress: **25%** (Seluruh Dokumen SSOT, PRD, dan Design System 100% Selesai, Siap Masuk Sprint 1)

---

## 1. Status Ringkas Per Fase (Sesuai Metodologi Scrum Skripsi)

| Fase / Sprint | Modul / Fitur Utama | Status | Progres |
|---|---|---|---|
| **Fase 0** | **Architecture, PRD & Knowledge Base**: Dokumen SSOT, ERD, API specs, Setup guide, 13 Modul, Design System | **Completed** | 100% |
| **Sprint 1 (Fayiz)** | **Foundation & Stock Analysis**: Auth JWT, DB Prisma, Seeding IDX80, Stock Search, Detail, Candlestick Chart, Dashboard | **Ready** | 0% |
| **Sprint 2 (Fayiz)** | **Screener & Comparison**: Stock Screener IDX80, Stock Comparison side-by-side 2–4 emiten | Planned | 0% |
| **Sprint 3 (Fayiz)** | **News, Sentiment, Market**: News API, Sentimen Berita ([Positif]/[Netral]/[Negatif]), Global Market & Commodities | Planned | 0% |
| **Sprint 4 (Fayiz)** | **AI Financial Assistant**: Context Builder, Gemini API Grounding, Profil Pemula vs Berpengalaman, Evaluasi Skripsi | Planned | 0% |

---

## 2. Completed
- [x] Analisis mendalam dokumen PRD v1.1 dan sinkronisasi 100% terhadap Draft Skripsi Fayiz.
- [x] Pembentukan struktur direktori `context/` sebagai Single Source of Truth (SSOT).
- [x] Penyusunan dokumen root: `PRD.md`, `PROJECT_STATE.md`, `README.md`.
- [x] Penyusunan dokumen global: `01-project/` (`overview.md`, `architecture.md`, `database.md`, `tech-stack.md`, `design.md`).
- [x] Penyusunan standar pengembangan: `02-development/` (`conventions.md`, `api.md`, `testing.md`, `deployment.md`).
- [x] Desain ERD PostgreSQL 17 lengkap dengan 10 entitas relasional dan cache store JSONB.
- [x] Perumusan katalog endpoint REST API lengkap dengan skema respon JSON seragam dan parameter `profile`.
- [x] Protokol pengujian evaluasi ilmiah kualitas AI (Factual Consistency $\ge 95\%$, Hallucination Rate $< 2\%$, Completeness) dan pengujian caching.
- [x] Penyusunan dokumen manajemen: `03-management/` (`progress.md`, `backlog.md`, `decisions.md` ADR D001–D009, `changelog.md`).
- [x] Penyusunan dokumen setup lokal: `04-setup/` (`local-development.md`, `environment-variables.md`, `database-setup.md`, `docker-setup.md`, `troubleshooting.md`).
- [x] Penyusunan spesifikasi rinci 13 file modul di `05-modules/` termasuk sinkronisasi Indeks IDX80, sentimen, dan pasar global.
- [x] Penyusunan panduan resmi `design.md` berbasis estetika SwiftBook neo-fintech Dual-Theme (`#74AE2D`, `#D6E3C0`, `#F2D6A4`, `#161616`, `#0D0D0D`).

---

## 3. In Progress / Next Up (Sprint 1 - Fayiz)
- [ ] Inisialisasi scaffold `backend/` (Node.js Express + Prisma ORM + Seeder 80 emiten IDX80).
- [ ] Inisialisasi scaffold `frontend/` (React Vite + Tailwind CSS + TradingView Lightweight Charts).
- [ ] Implementasi endpoint quote harga dan candlestick chart harian.

---

## 4. Blocked
*Tidak ada blocker saat ini.*

---

## 5. Next Steps
1. Inisialisasi backend Express.js dengan Prisma ORM & PostgreSQL.
2. Seeding 80 emiten konstituen Indeks IDX80 ke database lokal.
3. Inisialisasi frontend React Vite + Tailwind CSS dan setup token warna `design.md`.
