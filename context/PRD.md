# Project Overview

## Project Name
**AI-Powered Fundamental Investment Analyzer** (Sistem Analisis Fundamental & Edukasi Investasi Saham IDX Berbasis Context-Grounded AI)

## Description
AI-Powered Fundamental Investment Analyzer adalah platform web analitik fundamental dan edukasi pasar modal terpadu yang dirancang khusus untuk seluruh spektrum investor ritel di Bursa Efek Indonesia (IDX). Sistem ini mengintegrasikan data pasar real-time/historical, indikator laporan keuangan fundamental, sentimen berita terkini, komparasi multi-saham, simulasi Dollar-Cost Averaging (DCA) berbasis lot, audit kesehatan risiko portofolio, serta kurikulum edukasi investasi bertingkat. 

Sistem mengadopsi arsitektur **Context-Grounded Large Language Model (LLM)** menggunakan Google Gemini API, di mana model AI hanya menghasilkan sintesis dan penjelasan analisis setelah disuntikkan konteks data finansial faktual yang telah divalidasi dan diambil oleh backend sistem. Sistem secara tegas berfungsi sebagai sarana edukasi dan analisis mandiri (*Educational & Analytical Investment Platform*), bukan sebagai broker, *automated trading bot*, ataupun penyedia rekomendasi transaksi beli/jual otomatis.

## Problem Statement
1. **Fragmentasi Sumber Data Finansial**: Investor ritel harus mengumpulkan data dari berbagai platform terpisah (laporan keuangan IDX, RTI, portal berita, dan spreadsheet komparasi manual), menyebabkan inefisiensi waktu yang tinggi.
2. **Tingginya Hambatan Pemahaman Rasio bagi Pemula**: Istilah dan rasio finansial (seperti PE, PBV, ROE, ROA, DER) sulit dipahami dan diinterpretasikan secara kontekstual tanpa bimbingan edukatif yang terstruktur.
3. **Inefisiensi Komparasi Saham Sejenis (Peer Comparison)**: Investor berpengalaman kesulitan membandingkan metrik fundamental beberapa emiten kompetitor dalam satu industri secara cepat, serentak, dan tersinkronisasi.
4. **Keterbatasan Simulasi Investasi yang Realistis**: Simulasi investasi berkala yang ada umumnya mengabaikan aturan satuan perdagangan bursa Indonesia yang berbasis lot (1 lot = 100 lembar saham) dan tidak memperhitungkan akumulasi sisa dana.
5. **Kurangnya Analisis Risiko Konsentrasi Portofolio**: Investor sering kali tidak menyadari risiko konsentrasi sektoral maupun aset tunggal yang berlebihan pada portofolio mereka.
6. **Risiko Halusinasi LLM pada Domain Finansial**: Penggunaan model AI umum tanpa pembatasan konteks ketat berpotensi menghasilkan angka fiktif, metrik keliru, dan analisis yang menyesatkan bagi investor.
7. **Keterbatasan Kuota dan Rate Limit External API**: Pengambilan data pasar dan berita langsung ke pihak ketiga tanpa caching memicu pemborosan kuota, latensi tinggi, dan kerentanan *service downtime*.

## Objectives
### General Objective
Membangun platform web berbasis AI yang mengintegrasikan data pasar saham IDX, fundamental emiten, berita pasar, simulasi investasi realistis, audit portofolio, dan kurikulum edukasi terstruktur untuk memberdayakan investor pemula maupun berpengalaman dalam melakukan riset fundamental mandiri secara efisien, akurat, dan bebas dari halusinasi data.

### Specific Objectives
1. Mengintegrasikan market data, historical prices, fundamental ratios, dan news feed IDX ke dalam satu antarmuka terpadu.
2. Mengimplementasikan stock screener multi-kriteria dan fitur side-by-side stock comparison (2–4 saham) dengan visualisasi grafis interaktif.
3. Mengembangkan simulasi Dollar-Cost Averaging (DCA) realistis berbasis satuan lot (100 lembar) dengan mekanisme rollover sisa dana kas.
4. Menyediakan modul audit risiko portofolio (*Investment Health Score* 0–100) berbasis konsentrasi aset dan eksposur sektor.
5. Membangun modul edukasi investasi 6 level berjenjang yang dilengkapi kuis pemahaman dan tracking kemajuan belajar.
6. Mengimplementasikan arsitektur *Context-Grounded LLM* (Google Gemini API) untuk AI Financial Assistant dan AI Investment Tutor dengan validasi skema ketat guna menekan tingkat halusinasi.
7. Menerapkan strategi multi-tier caching (PostgreSQL JSONB) untuk mengoptimalkan kuota external API, meminimalkan latensi respons, dan menjaga ketersediaan data.
8. Menyediakan dasar empiris dan kerangka evaluasi terukur (factual consistency, relevance, completeness, hallucination rate, cache hit ratio) untuk keperluan penelitian/skripsi.

---

# Business & Academic Goals

## KPI & Target Akademik
1. **Factual Consistency AI**: Mencapai skor konsistensi faktual $\ge 95\%$ pada pengujian dataset evaluasi finansial terstruktur terhadap konteks data yang disuntikkan.
2. **AI Hallucination Rate**: Menekan tingkat halusinasi angka dan fakta finansial hingga $< 2\%$.
3. **Cache Hit Ratio**: Mencapai rasio cache hit $\ge 80\%$ untuk data quote, fundamental, dan news feed pada beban uji simulasi pengguna.
4. **Latency Performa**: Response time rata-rata backend $< 1.5$ detik untuk data yang ter-cache, dan $< 4$ detik untuk respons sintesis AI.
5. **Learning Completion & Literacy Impact**: $\ge 80\%$ pengguna pemula berhasil menyelesaikan materi dasar dan kuis pemahaman dengan nilai kelulusan $\ge 75\%$.

## Success Metrics
- **Functional Success**: Seluruh fitur P0 dan P1 (Auth, Search, Detail, Fundamental, Chart, Grounded AI, News, Comparison, Watchlist, Portfolio, DCA) berfungsi tanpa crash dan terverifikasi melalui pengujian terotomatisasi.
- **Academic Contribution**: Menjawab secara tuntas 7 Research Questions (RQ1–RQ7) yang diajukan dalam PRD mengenai integrasi data, context grounding, evaluasi halusinasi, optimasi caching, simulasi lot DCA, komparasi multi-saham, dan efektivitas AI tutor.

---

# Stakeholders

## Roles & Responsibilities
| Role | Stakeholder | Responsibilities |
|------|-------------|------------------|
| **Investor Pemula** | End-User (Pelajar, Mahasiswa, Pemula Pasar Modal) | Memanfaatkan kurikulum edukasi, kuis, AI Tutor, simulasi DCA realistis, dan visualisasi intuitif untuk membangun literasi investasi. |
| **Investor Berpengalaman** | End-User (Investor Ritel Aktif, Fundamentalist) | Menggunakan Stock Screener, Stock Comparison multi-emiten, AI Financial Assistant untuk sintesis emiten/berita cepat, serta Investment Health untuk audit risiko portofolio. |
| **Researcher / Penulis Skripsi** | Akademisi / Lead Developer | Mengembangkan arsitektur sistem, mengumpulkan dataset evaluasi, mengukur konsistensi faktual AI, mengevaluasi performa caching, dan menyusun laporan penelitian. |
| **Dosen Pembimbing / Reviewer** | Akademisi | Menguji metodologi penelitian, validitas evaluasi context-grounded LLM, dan kontribusi ilmiah sistem. |
| **External API Providers** | Sectors.app / Twelve Data / Finnhub / RSS Feeds | Menyediakan data harga saham, laporan keuangan fundamental emiten IDX, dan umpan berita pasar. |
| **LLM Provider** | Google AI (Gemini API) | Menyediakan layanan model bahasa besar untuk penalaran sintesis finansial dan tutor edukasi berbasis prompt bertarget. |

---

# Functional Requirements

## Modules Summary
1. **Authentication & User Management** (`auth.md`): Registrasi, login berbasis JWT, enkripsi password dengan bcrypt, serta pengelolaan profil pengguna.
2. **Central Dashboard** (`dashboard.md`): Ringkasan portofolio, visualisasi alokasi aset/sektor, widget watchlist, snapshot IHSG & top movers, ringkasan berita terkini, dan akses cepat fitur utama.
3. **Global Market & Sentiment** (`market-sentiment.md`): Pemantauan pergerakan indeks IHSG, top gainers/losers, agregasi berita pasar modal, dan AI Macro Assistant untuk sentimen pasar harian.
4. **Stock Screener** (`stock-screener.md`): Penyaringan emiten berdasarkan sektor, industri, market cap, indikator valuasi (PE, PBV), profitabilitas (ROE, ROA), solvabilitas (DER), yield dividen, dan indeks IDX (katalog terkurasi utama: Indeks IDX80, LQ45, IDX30).
5. **Stock Detail Analysis** (`stock-detail.md`): Halaman analisis komprehensif emiten mencakup profil perusahaan, harga real-time, chart candlestick interaktif (TradingView Lightweight Charts), kartu metrik 4 pilar fundamental, berita terkait, serta AI Stock Analysis Assistant.
6. **Stock Comparison** (`stock-comparison.md`): Komparasi komparatif multi-emiten (2–4 saham) secara side-by-side lintas metrik valuasi, profitabilitas, leverage, pertumbuhan, visual perbandingan batang/garis, dan AI Comparison Co-pilot.
7. **Watchlist Management** (`watchlist.md`): Manajemen daftar pantau saham personal per user dengan pembaruan metrik harga berkala dan navigasi cepat ke detail/komparasi.
8. **Portfolio Tracking & Transactions** (`portfolio.md`): Pencatatan transaksi BUY/SELL berbasis lot (1 lot = 100 lembar), kalkulasi weighted average price, perhitungan realized & unrealized P/L otomatis, serta breakdown alokasi sektor dan saham.
9. **DCA Simulator** (`dca-simulator.md`): Simulasi investasi Dollar-Cost Averaging historis dengan *Realistic Lot Mode* (perhitungan lot penuh dan akumulasi saldo kas sisa bulanan) dibandingkan dengan metode lump sum.
10. **Investment Health & Risk Analysis** (`investment-health.md`): Penilaian kesehatan portofolio (Skor 0–100) berdasarkan diversifikasi aset, konsentrasi emiten tunggal, dan bobot sektoral, dilengkapi analisis risiko edukatif berbasis AI.
11. **Investment Learning & Quiz** (`investment-learning.md`): Pusat literasi investasi terstruktur 6 level (Level 1 Intro s.d. Level 6 Strategy), pembaca artikel materi, kuis interaktif per materi, serta pelacakan progres belajar.
12. **AI Orchestration & Context Grounding Core** (`ai-assistant.md`): Layanan orkestrasi context builder, penyusunan prompt faktual, pembatasan skema respon terstruktur (JSON), kontrol halusinasi ketat, serta endpoint AI Financial Assistant dan AI Investment Tutor.
13. **User Settings & Session** (`settings.md`): Pengaturan akun, ganti password, preferensi notifikasi, dan pengelolaan sesi autentikasi.

---

# Non-Functional Requirements

## Security
- Autentikasi berbasis stateless JSON Web Token (JWT) dengan masa berlaku terbatas dan penyimpanan aman di client.
- Hashing password menggunakan algoritma `bcrypt` dengan salt round $\ge 10$.
- Proteksi kredensial: Seluruh API key (Gemini, Market Data, News) tersimpan ketat di server backend (`.env`) dan dilarang terekspos ke antarmuka React/frontend.
- Sanitasi input dan validasi payload request menggunakan library skema (Zod/Joi) untuk mencegah SQL Injection, NoSQL Injection, dan Cross-Site Scripting (XSS).
- Penerapan CORS (Cross-Origin Resource Sharing) terbatas pada domain frontend yang diizinkan.

## Scalability & Performance
- Arsitektur berbasis Service Layer yang terpisah (decoupled) antara API gateway, business logic, adapter provider data eksternal, dan AI orchestration.
- Target latensi: Request terhadap data ter-cache merespons dalam waktu $< 1.5$ detik.
- Multi-tier caching berbasis PostgreSQL JSONB dengan pengaturan TTL spesifik per entitas: Quote (1–5 menit), Historical Data (24 jam), Fundamental Ratios (1–7 hari), News (15–60 menit).
- Database indexing pada foreign keys, symbol ticker saham, composite index `(user_id, symbol)`, serta kolom pencarian query.

## Availability & Reliability
- Mekanisme Fallback Caching: Apabila API provider eksternal mengalami timeout (503) atau batasan rate limit (429), sistem tetap menyajikan data cache terakhir yang tersedia dengan indikator status stale.
- Graceful Degradation AI: Apabila koneksi Gemini API mengalami gangguan atau limit kuota, sistem tetap menampilkan data numerik fundamental dan grafik harga secara penuh tanpa memutus alur pengguna, disertai pesan error yang informatif.

## AI Guardrails & Integrity
- Penerapan Context Grounding ketat: AI hanya diizinkan mengambil fakta dan angka dari payload konteks yang disiapkan backend.
- System instruction melarang keras AI untuk mengarang angka, memprediksi pergerakan harga masa depan secara spekulatif, atau memberikan anjuran langsung transaksi beli/jual (*No Financial Advice Disclaimer* wajib dicantumkan pada seluruh output AI).

---

# Scope

## In Scope
- Registrasi, login, dan otorisasi sesi pengguna.
- Integrasi data pasar saham Bursa Efek Indonesia (IDX) mencakup quote harga dan chart historis candlestick.
- Pengambilan dan kalkulasi rasio keuangan fundamental: Valuation (PE, PBV), Profitability (ROE, ROA, Net Margin), Growth (Revenue & Net Income Growth), Leverage (DER), dan Dividen.
- Agregasi berita spesifik emiten dan berita makroekonomi pasar modal.
- Fitur Stock Screener multi-kriteria dan filter indeks utama (katalog basis: Indeks IDX80, LQ45, IDX30) dengan dukungan on-demand search.
- Fitur Stock Comparison side-by-side untuk 2 hingga 4 emiten secara serentak.
- Modul Watchlist personal dan Portfolio Tracker berbasis transaksi lot dengan kalkulasi P/L (realized & unrealized).
- Fitur simulasi Dollar-Cost Averaging (DCA) dengan mode lot realistis dan sisa kas akumulatif.
- Fitur kalkulasi skor kesehatan portofolio (*Investment Health Score*) dan deteksi konsentrasi risiko.
- Modul edukasi investasi 6 level terstruktur beserta kuis evaluasi pemahaman.
- AI Financial Assistant (analisis emiten, komparasi, portofolio, DCA) dan AI Investment Tutor (literasi dan konsep dasar).
- Mekanisme caching PostgreSQL JSONB untuk optimasi API eksternal.
- Kerangka pengujian dan evaluasi kualitas AI (Factual Consistency, Hallucination, Completeness).

## Out of Scope
- Integrasi langsung ke rekening dana nasabah (RDN) atau koneksi broker sekuritas.
- Eksekusi transaksi jual/beli saham secara riil di pasar bursa.
- Penyimpanan dana nasabah (*custody of funds*).
- Sistem trading otomatis, bot sinyal trading harian, atau high-frequency trading (HFT).
- Prediksi kepastian harga saham di masa depan (*guaranteed price forecasting*).
- Nasihat keuangan formal berlisensi (*certified financial advisory services*).
- Penggunaan data tick-by-tick real-time berfrekuensi ultra-tinggi sebagai syarat utama.

---

# Acceptance Criteria
1. **Autentikasi**: Pengguna dapat mendaftar dengan email unik, login, menerima token JWT yang valid, dan mengakses rute terproteksi.
2. **Data & Chart Saham**: Sistem dapat mencari emiten IDX, menampilkan data harga terkini, dan merender grafik candlestick interaktif (Lightweight Charts) dengan timeframe yang dapat dipilih.
3. **Fundamental Analysis**: Halaman detail emiten menampilkan metrik fundamental utama (PE, PBV, ROE, ROA, DER, Net Margin) secara akurat sesuai data sumber atau hasil kalkulasi formula resmi.
4. **Stock Comparison**: Pengguna dapat memilih minimal 2 dan maksimal 4 emiten saham sejenis serta melihat perbandingan metrik dan grafik secara serentak.
5. **DCA Simulation**: Simulasi DCA menghitung total pembelian hanya dalam kelipatan 100 lembar (1 lot), mengakumulasikan sisa dana yang belum cukup membeli lot ke bulan berikutnya, serta menampilkan total modal, nilai akhir, dan return investasi secara presisi.
6. **Portfolio & Health**: Transaksi BUY/SELL tercatat dengan benar, menghitung average buy price secara tertimbang, menampilkan unrealized/realized P/L, dan menghasilkan skor kesehatan investasi berdasarkan diversifikasi sektor/aset.
7. **Education & Quiz**: Pengguna dapat membaca materi pembelajaran per level, menjawab kuis pilihan ganda, menerima skor evaluasi instan, dan melihat status progres materi.
8. **Context-Grounded AI**: Seluruh respon dari AI Assistant dan AI Tutor bersumber secara konsisten dari payload data yang disuntikkan backend, tidak memunculkan data numerik fiktif, dan selalu menyertakan *disclaimer* edukasi investasi.
9. **Caching & Resilience**: Data pasar dan fundamental yang diminta berulang kali disajikan langsung dari database cache lokal sebelum batas TTL berakhir, serta mampu menangani kegagalan API eksternal secara elegan.
